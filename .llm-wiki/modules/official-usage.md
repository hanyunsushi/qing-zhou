---
title: Official Usage Module
updated: 2026-09-15
---

# Official Usage Module

`internal/officialusage` contains provider-specific outbound API code without QingZhou database or node dependencies.

## OCI

`FetchOCI` posts a signed request to `https://usageapi.{region}.oci.oraclecloud.com/20200107/usage`. The request is RSA SHA-256 signed with an OCI API key and accepts PKCS#1 or PKCS#8 RSA PEM private keys. It queries the current UTC month, aggregates rows grouped by service/SKU/unit, and includes only transfer/outbound/egress rows with recognized byte units.

The provider response is usage. `remaining = max(configured_monthly_limit - used, 0)` is a QingZhou display calculation.

## Cloudflare

`FetchCloudflare` posts to Cloudflare Account Analytics GraphQL with a dedicated `Account Analytics Read` bearer token. It uses the current UTC day and adds the `pagesFunctionsInvocationsAdaptiveGroups` and `workersInvocationsAdaptive` request sums.

The daily request allowance is locally configured and is not a Cloudflare billing field.

## Safety contract

- Official URLs are fixed by the module; configuration does not permit a custom endpoint.
- Response bodies are bounded before parsing.
- Provider errors are returned as non-secret status text and never substitute node-interface counters.

See also: [Admin Upstreams API](../apis/admin-upstreams.md).
