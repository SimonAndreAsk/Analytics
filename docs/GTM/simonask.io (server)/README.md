# GTM Server Container: simonask.io (server)

This server-side container runs in a cloud environment (GCP) at `https://serverside.simonask.io`. It intercepts incoming tracking hits from the web browser, processes them, sets secure first-party cookies, and forwards the data to Google Analytics.

## Container Info
* **Account Name / ID:** `simonask.io` / `6268381941`
* **Container Name / ID:** `simonask.io (server)` / `253113551`
* **Public ID:** `GTM-PS3KHKB6`
* **Workspace:** `Default Workspace` (Workspace ID: `12`)

---

## Architecture & Logic

### 1. The GA4 Client & Secure Cookies
The **GA4 Client** is responsible for claiming requests arriving at paths like `/g/collect`.
* It decodes the incoming tracking payload from `gtag.js`.
* It writes and manages a first-party cookie named `FPID` (First-Party ID) with a lifetime of **2 years** (`63072000` seconds).
* Because the server container runs on a custom subdomain (`serverside.simonask.io`), this cookie is set as a secure, HTTP-only first-party cookie. This bypasses browser restrictions like Safari ITP (Intelligent Tracking Prevention), which truncates client-side cookies set via JavaScript to 1–7 days.

### 2. Dynamic Environment Routing
Instead of using separate GTM containers or duplicating tags for production and development, this container dynamically routes hits based on the origin website's hostname:
1. **Hostname Capture:** The web container passes the page hostname in the request payload as `page_hostname`.
2. **Variable read:** `{{ED - page_hostname}}` extracts this value.
3. **Lookup mapping:** `{{LKP - GA4 measurement ID}}` references a lookup table:
   * `localhost` → Staging GA4 Property ID (`G-GX5EW99T18`)
   * `stage.simonask.io` → Staging GA4 Property ID (`G-GX5EW99T18`)
   * `simonask.io` → Production GA4 Property ID (`G-9Z7Z8G75Q2`)
   * `www.simonask.io` → Production GA4 Property ID (`G-9Z7Z8G75Q2`)
   * **Default Fallback:** Staging GA4 Property ID. This is a fail-safe measure: if tracking hits originate from a new staging or preview URL, they will not pollute the production analytics property.

---

## Clients

There is **1 client** configured in this container:

| Client Name | Type | Cookie Management | Cookie Name | Max Age | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GA4** | Google Analytics 4 (`gaaw_client`) | Server-managed (Auto-domain) | `FPID` | 2 years | Claims and parses GA4 measurement requests. Auto-handles client ID generation and first-party cookies. |

---

## Tags

There is **1 tag** configured in this container:

| Tag Name | Type | Measurement ID | Firing Triggers | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GA4 - config (dynamic measurement ID)** | Google Analytics: GA4 (`sgtmgaaw`) | `{{LKP - GA4 measurement ID}}` | • `ALWAYS - client name equals GA4` | Claims the request parsed by the GA4 Client, looks up the destination Measurement ID, and forwards the hit to Google Analytics servers. |

---

## Triggers

There is **1 trigger** configured in this container:

| Trigger Name | Trigger Type | Criteria / Filter | Notes |
| :--- | :--- | :--- | :--- |
| **ALWAYS - client name equals GA4** | Custom / Always | `{{Client Name}}` equals `GA4` | Evaluates to true for any incoming hit successfully claimed and parsed by the GA4 Client. |

---

## Variables

The container contains the following user-defined variables:

| Variable Name | Type | Value / Configuration | Notes |
| :--- | :--- | :--- | :--- |
| **CON - GA4 stage measurement ID** | Constant | `G-GX5EW99T18` | GA4 Property Measurement ID dedicated to test environments. |
| **CON - GA4 production measurement ID** | Constant | `G-9Z7Z8G75Q2` | GA4 Property Measurement ID for production environment. |
| **ED - page_hostname** | Event Data | Key Path: `page_hostname` | Extracts the hostname parameter passed in the event data from the client-side tag. |
| **LKP - GA4 measurement ID** | Lookup Table | • Input: `{{ED - page_hostname}}`<br>• Default: `{{CON - GA4 stage measurement ID}}` | Dynamically maps hostnames to their respective Measurement ID constants. |
