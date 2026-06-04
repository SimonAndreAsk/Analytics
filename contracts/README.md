# Data Contracts (dataLayer Schemas)

This directory contains version-controlled **JSON Schemas** for all tracking events pushed to the client-side `dataLayer` on **simonask.io**. 

These contracts serve as a formal agreement between the web development team and the analytics team, ensuring that tracking parameters don't drift or break during site updates.

---

## Integration and Setup Guide

For a complete setup walkthrough, copy-pasteable testing recipes (for **Playwright** and **Cypress**), and TypeScript helper classes, refer to the:
👉 **[Frontend Integration & Testing Guide](./developer_integration.md)**

---

## Available Schemas

- **[`consent_update.json`](./dataLayer/consent_update.json)**: Triggered when cookie settings change.
- **[`contact_click.json`](./dataLayer/contact_click.json)**: Triggered when contact buttons are clicked.
- **[`contact_form_submit.json`](./dataLayer/contact_form_submit.json)**: Triggered on successful lead form submission.

---

## Modifying Tracking Specs (SOP)

When tracking requirements change:
1. **Schema Update**: Create a pull request modifying or adding a schema file in `dataLayer/`.
2. **GTM Configuration**: Once the PR is approved, configure the corresponding variable, trigger, and tag updates in GTM.
3. **Frontend Sync**: Pull the updated schemas into the frontend project using your team's sync method (git submodule, package update, or download script), then generate the updated TypeScript types and implement the changes.

