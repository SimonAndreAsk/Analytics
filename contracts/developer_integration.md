# Frontend Integration & Testing Guide

This guide helps frontend developers integrate data contracts into their codebase, configure automatic TypeScript interface generation, and validate `window.dataLayer` pushes during E2E testing (Playwright and Cypress).

---

## 1. Installation & Prerequisites

To parse JSON schemas and validate them at runtime, install `ajv` (Another JSON Schema Validator) in the frontend repository:

```bash
# Install validation and type-generation tools in your frontend project
npm install -D ajv json-schema-to-typescript
```

---

## 2. Shared Validation Helper (`validateDataLayer.ts`)

Copy this TypeScript utility into your frontend codebase (e.g., `src/test/utils/validateDataLayer.ts`). It loads your JSON schemas, compiles them using AJV, and formats validation errors into human-readable warnings:

```typescript
import Ajv, { ErrorObject } from 'ajv';

// Define the shape of a generic dataLayer event
interface DataLayerEvent {
  event: string;
  [key: string]: any;
}

const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * Validates a single dataLayer event object against its JSON Schema contract.
 * @param eventObject The event object pushed to window.dataLayer
 * @param schema The JSON Schema contract object (imported from contracts/dataLayer/)
 * @returns true if valid, throws an Error with formatted validation messages if invalid
 */
export function validateDataLayerEvent(eventObject: DataLayerEvent, schema: object): boolean {
  const validate = ajv.compile(schema);
  const isValid = validate(eventObject);

  if (!isValid && validate.errors) {
    const errorDetails = formatAjvErrors(validate.errors, eventObject);
    throw new Error(
      `🚨 DataLayer Contract Violation!\n` +
      `Event Name: "${eventObject.event}"\n` +
      `Errors:\n${errorDetails}`
    );
  }

  return true;
}

// Helper to format raw AJV error arrays into highly legible printouts
function formatAjvErrors(errors: ErrorObject[], payload: any): string {
  return errors.map((err, idx) => {
    const path = err.instancePath || 'root';
    const message = err.message;
    const value = err.data !== undefined ? JSON.stringify(err.data) : 'undefined';
    
    return `  [${idx + 1}] Parameter: "${path}"\n` +
           `      Issue: ${message}\n` +
           `      Received Value: ${value}\n` +
           `      Expected Format: ${JSON.stringify(err.params)}`;
  }).join('\n\n');
}
```

---

## 3. Testing Recipes

### Recipe A: Playwright E2E Integration

Use Playwright's `exposeFunction` to register the validation helper inside the browser context, then hook into the browser's `window.dataLayer.push` API during test execution:

```typescript
import { test, expect } from '@playwright/test';
import { validateDataLayerEvent } from './utils/validateDataLayer';

// Import your tracking contracts from the shared contracts folder
import contactClickSchema from '../../contracts/dataLayer/contact_click.json';

test.describe('Attribution & Analytics tracking validations', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Expose our validator function to the page context
    await page.exposeFunction('validateTrackingEvent', (eventObject: any) => {
      // Validate 'contact_click' event when detected
      if (eventObject.event === 'contact_click') {
        validateDataLayerEvent(eventObject, contactClickSchema);
      }
    });

    // 2. Override window.dataLayer.push before the page scripts load
    await page.addInitScript(() => {
      window.dataLayer = window.dataLayer || [];
      
      // Wrap push() with validation logic
      const originalPush = window.dataLayer.push.bind(window.dataLayer);
      window.dataLayer.push = function(item: any) {
        // Send the event payload to our exposed node validator
        (window as any).validateTrackingEvent(item).catch((err: Error) => {
          // Fail the browser run or output warning if invalid
          console.error(err.message);
          (window as any).trackerValidationError = err.message;
        });
        return originalPush(item);
      };
    });
  });

  test('user clicking contact CTA triggers correct event schema', async ({ page }) => {
    await page.goto('/contact');
    
    // Simulate user behavior
    await page.locator('#hero-contact-button').click();

    // Check if any tracking validations threw an error in the page scope
    const validationError = await page.evaluate(() => (window as any).trackerValidationError);
    expect(validationError).toBeUndefined();
  });
});
```

---

### Recipe B: Cypress E2E Integration

Register a custom Cypress command to validate the dataLayer history arrays generated during a test flow:

```typescript
// cypress/support/commands.ts
import { validateDataLayerEvent } from './utils/validateDataLayer';
import contactClickSchema from '../../contracts/dataLayer/contact_click.json';

declare global {
  namespace Cypress {
    interface Chainable {
      validateDataLayer(eventName: string, schema: object): Chainable<any>;
    }
  }
}

Cypress.Commands.add('validateDataLayer', (eventName: string, schema: object) => {
  cy.window().then((win) => {
    const dataLayer = win.dataLayer || [];
    // Find the event in the dataLayer queue
    const matchedEvent = dataLayer.find((e: any) => e.event === eventName);
    
    expect(matchedEvent).to.not.be.undefined;
    
    // Run the contract validator
    const isValid = validateDataLayerEvent(matchedEvent, schema);
    expect(isValid).to.be.true;
  });
});

// Use it inside a Cypress spec:
it('should dispatch valid contact_click tracking details', () => {
  cy.visit('/contact');
  cy.get('#hero-contact-button').click();
  
  // Validate that 'contact_click' complies with schema
  cy.validateDataLayer('contact_click', contactClickSchema);
});
```

---

## 4. Automating TypeScript Type Syncing

To run type generation dynamically, add this convenience script to the frontend repository's `package.json`:

```json
{
  "scripts": {
    "sync-contracts": "npx json-schema-to-typescript contracts/dataLayer/*.json -o types/tracking.d.ts"
  }
}
```

Running `npm run sync-contracts` will compile all schemas into a single type-safe definitions file (`types/tracking.d.ts`), enabling autocomplete and editor warning highlights across the entire codebase.
