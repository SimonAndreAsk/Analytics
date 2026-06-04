const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../contracts/dataLayer');

function validateContracts() {
  console.log("🔍 Scanning dataLayer contracts in:", CONTRACTS_DIR);
  
  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.error("❌ Error: Contracts directory does not exist!");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let files = fs.readdirSync(CONTRACTS_DIR).filter(file => file.endsWith('.json'));
  
  if (args.length > 0) {
    const targetFile = args[0];
    if (files.includes(targetFile)) {
      files = [targetFile];
      console.log(`🎯 Targeting single contract validation for: "${targetFile}"`);
    } else {
      console.error(`❌ Error: File "${targetFile}" was not found in the contracts directory!`);
      process.exit(1);
    }
  }
  
  if (files.length === 0) {
    console.warn("⚠️ No schema files found in the directory.");
    process.exit(0);
  }

  let errorsFound = 0;
  const registry = [];

  for (const file of files) {
    const filePath = path.join(CONTRACTS_DIR, file);
    console.log(`\n📄 Checking ${file}...`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const schema = JSON.parse(content);
      const fileErrors = [];

      // 1. Check basic schema fields
      if (!schema.$schema) {
        fileErrors.push("Missing '$schema' declaration.");
      }
      if (schema.type !== 'object') {
        fileErrors.push(`Expected 'type' to be 'object', got '${schema.type}'.`);
      }
      if (!schema.properties || typeof schema.properties !== 'object') {
        fileErrors.push("Missing or invalid 'properties' object.");
      }

      // 2. Check event parameter
      if (schema.properties) {
        if (!schema.properties.event) {
          fileErrors.push("Missing 'event' parameter under properties.");
        } else {
          const eventSpec = schema.properties.event;
          if (!eventSpec.const && !eventSpec.enum) {
            fileErrors.push("The 'event' parameter must define a 'const' or an 'enum' to specify the event name.");
          }
        }
      }

      // 3. Check required parameters
      if (!Array.isArray(schema.required)) {
        fileErrors.push("Missing 'required' array.");
      } else {
        if (!schema.required.includes('event')) {
          fileErrors.push("The 'required' array must include 'event'.");
        }
        
        // Verify required properties exist
        if (schema.properties) {
          schema.required.forEach(req => {
            if (!schema.properties[req]) {
              fileErrors.push(`Required parameter '${req}' is not defined in 'properties'.`);
            }
          });
        }
      }

      if (fileErrors.length > 0) {
        console.error(`❌ Validation failed for ${file}:`);
        fileErrors.forEach(err => console.error(`   - ${err}`));
        errorsFound += fileErrors.length;
      } else {
        const eventName = schema.properties.event.const || schema.properties.event.enum.join(' | ');
        const props = Object.keys(schema.properties)
          .filter(k => k !== 'event')
          .map(k => `${k} (${schema.properties[k].type}${schema.required.includes(k) ? '*' : ''})`);
        
        registry.push({
          file,
          eventName,
          title: schema.title || 'Untitled',
          description: schema.description || 'No description',
          properties: props.join(', ') || 'None'
        });
        console.log(`✅ ${file} is valid!`);
      }

    } catch (e) {
      console.error(`❌ Syntax Error parsing ${file}:`, e.message);
      errorsFound++;
    }
  }

  console.log("\n=======================================================");
  if (errorsFound > 0) {
    console.error(`❌ Audit Completed: ${errorsFound} issues found. Please fix them.`);
    process.exit(1);
  } else {
    console.log("✅ Audit Completed: All dataLayer contracts are structurally sound.");
    console.log("\n📋 Active Tracking Schema Directory:");
    console.table(registry.map(item => ({
      'Schema File': item.file,
      'Event Name': item.eventName,
      'Description': item.description,
      'Parameters (* = Required)': item.properties
    })));
    process.exit(0);
  }
}

validateContracts();
