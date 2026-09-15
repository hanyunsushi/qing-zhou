---
title: Official Usage Module
updated: 2026-09-15
---

# Official Usage Module

`internal/officialusage` contains provider-specific outbound API code without QingZhou database or node dependencies.

## OCI

`FetchOCI` posts a signed request to `https://usageapi.{region}.oci.oraclecloud.com/20200107/usage`. RSA SHA-256 signing includes query parameters. The daily query covers the current UTC month up to today's `00:00`. `query_end` is a request boundary, not proof of provider publication completeness or settlement. Pages use `limit` and `page` in the URL and follow `opc-next-page`; repeated cursors, more than 100 continuation tokens, oversized responses, and overflow fail without publishing a partial balance.

The parser prioritizes the high-precision `attributedUsage` field and falls back to `computedQuantity` only when needed. Decimal quantities use rational arithmetic before per-item rounding to whole bytes. Unit aliases are exact: byte units and Oracle's published `Gigabyte outbound data transfer per month` are accepted, while storage capacity, rates, and unknown units are not guessed. Inbound rows are excluded; ambiguous transfer rows, unknown transfer units, missing response items, and no matched transfer rows prevent a successful balance. A first-day empty query window is also unknown, not a full allowance.

`remaining = max(configured_monthly_limit - used, 0)` remains a reference calculation. The configured default of 10,000,000,000,000 bytes has not been verified against this account's entitlement, pricing units, or SKU coverage. The UI must retain the warning that matching names is not a verified allowance-specific SKU mapping. A successful HTTP response does not prove that free-tier quantities were returned. No live account raw response or post-change deployment has been verified.

Oracle's networking pricing page lists first-10-TB/month outbound tiers and the verbose unit above; its overage rows identify B88327, B93455, and B93456. These are reference evidence, not an account-validated allowlist. Before exact balance support, verify the account's free and overage rows, aggregation scope, unit conversion, and publication delay against the Console. Sources: `https://www.oracle.com/cloud/networking/pricing/` and Oracle SDK `usageapi/request_summarized_usages_request_response.go` in `oracle/oci-go-sdk`.

## Cloudflare

`FetchCloudflare` posts to Cloudflare Account Analytics GraphQL with a dedicated `Account Analytics Read` bearer token. It uses the current UTC day and adds the `pagesFunctionsInvocationsAdaptiveGroups` and `workersInvocationsAdaptive` request sums.

The daily request allowance is locally configured and is not a Cloudflare billing field.

## Safety contract

- Official URLs are fixed by the module; configuration does not permit a custom endpoint.
- Response bodies are bounded before parsing.
- Provider errors are returned as non-secret status text and never substitute node-interface counters.

See also: [Admin Upstreams API](../apis/admin-upstreams.md).
