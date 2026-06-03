# Data Contracts (dataLayer Schemas)

This directory contains version-controlled **JSON Schemas** for all tracking events pushed to the client-side `dataLayer` on **simonask.io**. 

These contracts serve as a formal agreement between the web development team and the analytics team, ensuring that tracking parameters don't drift or break during site updates.

## Available Schemas

- **[`consent_update.json`](./dataLayer/consent_update.json)**: Triggered when cookie settings change.
- **[`contact_click.json`](./dataLayer/contact_click.json)**: Triggered when contact buttons are clicked.
- **[`contact_form_submit.json`](./dataLayer/contact_form_submit.json)**: Triggered on successful lead form submission.

---

## How to Use & Scale

### 1. Compile-Time Type Generation
You can automatically generate TypeScript interfaces directly from these JSON schemas in your frontend repository. 
Using a tool like [`json-schema-to-typescript`](https://www.npmjs.com/package/json-schema-to-typescript):

```bash
# Generate types
npx json-schema-to-typescript contracts/dataLayer/contact_click.json > types/tracking.d.ts
```

This generates:
```typescript
export interface ContactClickEvent {
  event: "contact_click";
  button_location: "header" | "hero" | "footer" | "body";
}
```

### 2. Runtime Validation in E2E Tests
You can load these schemas in your Playwright, Cypress, or Cypress-based E2E tests to validate that tracking events fired on the site comply with the contract:

```javascript
import Ajv from 'ajv';
import contactClickSchema from '../contracts/dataLayer/contact_click.json';

const ajv = new Ajv();
const validate = ajv.compile(contactClickSchema);

// During E2E test, intercept window.dataLayer.push calls
const isValid = validate(dataLayerPushObject);
if (!isValid) {
  console.error(validate.errors);
  throw new Error("dataLayer event does not match tracking contract!");
}
```

### 3. Modifying Tracking Specs
1. When tracking requirements change (e.g. adding a new parameter like `user_id` or a new event), **create a pull request modifying/adding a schema file here first**.
2. Once the PR is approved, update the GTM container variables/tags to match.
3. Pull the updated schema into the frontend project to implement/test the updated payload structure.
