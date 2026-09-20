---
title: Official Usage Module
updated: 2026-09-18
---

# Official Usage Module

`internal/officialusage` contains provider-specific outbound API code without QingZhou database or node dependencies.

## OCI

`FetchOCI` posts a signed request to `https://usageapi.{region}.oci.oraclecloud.com/20200107/usage`. RSA SHA-256 signing includes query parameters. The monthly query covers the current UTC month up to today's `00:00`, because OCI rejects a non-zero time precision for these boundaries. `query_end` is a request boundary, not proof of provider publication completeness or settlement. Pages use `limit` and `page` in the URL and follow `opc-next-page`; repeated cursors, more than 100 continuation tokens, oversized responses, and overflow fail without publishing a partial balance.

The parser prioritizes the high-precision `attributedUsage` field and falls back to `computedQuantity` only when needed. Decimal quantities use rational arithmetic before per-item rounding to whole bytes. Unit aliases include `GB Months` and Oracle's published `Gigabyte outbound data transfer per month`; storage capacity, rates, and unknown units are not guessed. Inbound rows are excluded; ambiguous transfer rows, unknown transfer units, missing response items, and no matched transfer rows prevent a successful balance. A first-day empty query window is also unknown, not a full allowance.

The admin OCI card renders the configured allowance and official usage with the
shared binary formatter: values are divided by `1024` while the existing
`KB/MB/GB/TB/PB` labels are retained. Thus `10_000_000_000_000` bytes is shown
as approximately `9.09 TB`. This is presentation-only and does not change the
API values or usage calculation.

Oracle can return `Outbound Data Transfer Zone 2` with unit `GB Months`; the parser treats that official outbound-transfer unit as decimal GB and preserves the high-precision `attributedUsage` value before converting to bytes. Oracle's price list names the free and overage rows as `First 10 TB / Month` and `Over 10 TB / Month`, with unit `Gigabyte outbound data transfer per month`. The parser accepts both official unit forms and marks a returned overage SKU. An overage row forces `remaining` to zero even if its returned overage quantity is smaller than the configured free allowance. `remaining = max(configured_monthly_limit - used, 0)` otherwise. The account total is the configured OCI allowance; OCI Usage API supplies the official used amount, not a universal balance field. The admin page refreshes both provider snapshots every 15 minutes and refreshes on foreground return. A non-zero official `GB Months` response is covered by `internal/officialusage/officialusage_test.go`.

Oracle's networking pricing page lists first-10-TB/month outbound tiers and the verbose unit above; its overage rows identify B88327, B93455, and B93456. These are reference evidence, not an account-validated allowlist. Before exact balance support, verify the account's free and overage rows, aggregation scope, unit conversion, and publication delay against the Console. Sources: `https://www.oracle.com/cloud/networking/pricing/` and Oracle SDK `usageapi/request_summarized_usages_request_response.go` in `oracle/oci-go-sdk`.

## Cloudflare

`FetchCloudflare` posts to Cloudflare Account Analytics GraphQL with a dedicated `Account Analytics Read` bearer token. It uses the current UTC day and adds the `pagesFunctionsInvocationsAdaptiveGroups` and `workersInvocationsAdaptive` request sums.

The daily request allowance is locally configured and is not a Cloudflare billing field.

## Safety contract

- Official URLs are fixed by the module; configuration does not permit a custom endpoint.
- Response bodies are bounded before parsing.
- Provider errors are returned as non-secret status text and never substitute node-interface counters.

See also: [Admin Upstreams API](../apis/admin-upstreams.md).
