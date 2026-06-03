# Analytics & Tracking Configuration

This repository houses the configuration details, documentation, and architecture overview for the analytics and tracking systems of **[simonask.io](https://simonask.io)**. 

It covers both the **Client-Side (Web) GTM Container** and the **Server-Side (GCP) GTM Container**.

## Repository Structure

- **[docs/GTM](./docs/GTM)**: Central Google Tag Manager (GTM) documentation and tracking architecture overview.
  - **[docs/GTM/simonask.io (web)](./docs/GTM/simonask.io%20(web)/README.md)**: Specifications for the Client-Side Web Container (GTM-KR894J8P), including tags, triggers, variables, and cookie consent logic.
  - **[docs/GTM/simonask.io (server)](./docs/GTM/simonask.io%20(server)/README.md)**: Specifications for the Server-Side GCP Container (GTM-PS3KHKB6) running at `serverside.simonask.io` for first-party cookie management and dynamic environment routing.

## Architecture Highlights

* **Consent-First Tracking**: Client-side tags are gated using `dataLayer` consent variables.
* **First-Party Routing**: Client-side tags send events to `https://serverside.simonask.io`, avoiding direct third-party calls in the browser and enhancing privacy.
* **Dynamic Environment Routing**: The server container dynamically directs tracking data to either the Staging GA4 Property (`G-GX5EW99T18`) or Production GA4 Property (`G-9Z7Z8G75Q2`) based on the origin hostname.

For more details on the setup and configurations, refer to the [GTM Architecture Overview](./docs/GTM/README.md).
