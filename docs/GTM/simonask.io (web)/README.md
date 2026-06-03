# GTM Web Container: simonask.io (web)

This container handles client-side event tracking, cookie consent verification, and payload routing to the server-side tag manager.

## Container Info
* **Account Name / ID:** `simonask.io` / `6268381941`
* **Container Name / ID:** `simonask.io (web)` / `253101870`
* **Public ID:** `GTM-KR894J8P`
* **Workspace:** `Default Workspace` (Workspace ID: `8`)

---

## Consent Gate Architecture

This container uses a strict **privacy-first gating policy**. No tracking data is sent unless the user has opted in.

1. **Consent Variable:** `{{DLV - analytics_consent}}` reads the `analytics` boolean value pushed to the `dataLayer` by the website's Consent Management Platform (CMP).
2. **Trigger Filter:** Every custom tracking trigger in this container is explicitly filtered to fire **ONLY** when `{{DLV - analytics_consent}}` equals `true`.
3. **GA4 Consent Gating:** The tags themselves are configured with Google Tag Manager's native consent settings, requiring the `analytics_storage` permission to fire.
4. **Consent Updates:** When a visitor interacts with the cookie banner and accepts analytics, the site pushes the `consent_update` custom event. This triggers `CE - consent_update`, which re-fires the `GA4 - config` tag to initialize tracking for the session.

---

## Tags

There are **4 tags** configured in this container:

| Tag Name | Type | Measurement ID | Firing Triggers | Consent Required | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GA4 - config** | Google Tag (`googtag`) | `{{CON - GA4 measurement ID}}` | • All Pages<br>• `CE - consent_update` | `analytics_storage` | Base config. Passes `server_container_url` (`{{CON - server container URL}}`) to route traffic to the server. Passes `page_hostname` to differentiate host environments on the server. |
| **GA4 - contact_click** | GA4 Event (`gaawe`) | `{{CON - GA4 measurement ID}}` | • `CE - contact_click` | `analytics_storage` | Fires when a visitor clicks a contact button. Captures `button_location` (e.g., header, hero, footer) via `{{DLV - button_location}}`. |
| **GA4 - generate_lead (contact form)** | GA4 Event (`gaawe`) | `{{CON - GA4 measurement ID}}` | • `CE - contact_form_submit` | `analytics_storage` | Key conversion tag. Fires on successful form submissions. Captures `form_location` via `{{DLV - form_location}}`. |
| **GA4 - scroll_depth** | GA4 Event (`gaawe`) | `{{CON - GA4 measurement ID}}` | • `SD - 25_50_75_90pct` | `analytics_storage` | Tracks user engagement. Sends `scroll_depth` events at 25%, 50%, 75%, and 90% vertical depth. |

---

## Triggers

There are **4 triggers** configured in this container:

| Trigger Name | Event Type | Criteria / Conditions | Notes |
| :--- | :--- | :--- | :--- |
| **CE - consent_update** | Custom Event | • Event Name: `consent_update`<br>• `{{DLV - analytics_consent}}` equals `true` | Fires after a user updates cookie settings. Allows the GA4 config tag to load immediately upon consent confirmation. |
| **CE - contact_click** | Custom Event | • Event Name: `contact_click`<br>• `{{DLV - analytics_consent}}` equals `true` | Fired via JavaScript on contact button clicks. Gated by analytics consent. |
| **CE - contact_form_submit** | Custom Event | • Event Name: `contact_form_submit`<br>• `{{DLV - analytics_consent}}` equals `true` | Pushed upon successful contact form submit. Gated by analytics consent. |
| **SD - 25_50_75_90pct** | Scroll Depth | • Vertical: `25, 50, 75, 90` percent<br>• Start: `Window Load`<br>• `{{DLV - analytics_consent}}` equals `true` | Measures scroll depth. Wait for Window Load prevents false positives during page load/rendering. |

---

## Variables

The container contains the following user-defined variables:

| Variable Name | Type | Value / Configuration | Notes |
| :--- | :--- | :--- | :--- |
| **CON - GA4 measurement ID** | Constant | `G-12345` | The measurement ID for the GA4 property. **Note:** This is overridden and dynamically routed at the server level (stage vs. prod). |
| **CON - server container URL** | Constant | `https://serverside.simonask.io` | Custom domain endpoint where the client-side Google tag dispatches all tracking requests. |
| **DLV - analytics_consent** | Data Layer | Name: `analytics` (Version 2) | Reads whether user has accepted analytics cookies (returns `true` or `false`). |
| **DLV - button_location** | Data Layer | Name: `button_location` (Version 2) | Captures where clicked contact buttons are situated (e.g. `header`, `footer`). |
| **DLV - form_location** | Data Layer | Name: `form_location` (Version 2) | Captures the page/location of the submitted contact form. |

### Key Built-in Variables Used:
* `{{Page Hostname}}`: Extracts the active domain name (e.g., `localhost`, `stage.simonask.io`, `simonask.io`) and passes it to the server container.
* `{{Scroll Depth Threshold}}`: Dynamically captures the active scroll percentage threshold (e.g., `25`, `50`, `75`, `90`) reached by the user.
