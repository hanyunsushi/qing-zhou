---
title: Cloudscape Visual System
---

# Cloudscape Visual System

QingZhou keeps its existing Vue, Naive UI component tree, routes, menu hierarchy,
page order and business behavior. The frontend visual layer follows the AWS
Cloudscape system through the custom `cloudscape-design-system` skill.

## Scope

- `frontend/src/styles/global.css` owns the Cloudscape-inspired surface, border,
  typography, focus, semantic status and control tokens.
- `frontend/src/App.vue` maps the same semantic colors into Naive UI theme
  overrides.
- ECharts chart roots use the Cloudscape data-visualization palette separately
  from ordinary UI colors.
- Existing page-scoped styles may refine presentation, but must not restore the
  retired blue-gradient, glass-surface or decorative lift treatment.

## Color rules

The first eight categorical chart colors are `#688ae8`, `#c33d69`, `#2ea597`,
`#8456ce`, `#e07941`, `#3759ce`, `#962249` and `#096f64`. Continuous maps use
`#529ccb`, `#3184c2`, `#0273bb`, `#015b9d` and `#003c75`. Chart colors must
remain scoped to chart series and must be paired with labels or other visual
distinctions. UI blue is reserved for interaction and links; red, green and
amber carry status semantics.

## Compatibility boundary

The official Cloudscape React packages are the reference implementation, but
QingZhou is Vue 3. A React component package is not imported into the runtime;
Naive UI remains the component implementation and receives equivalent tokens,
states and accessibility treatment.

## Maintenance contract

- Keep the existing route map, sidebar hierarchy, page order, component types,
  component positions and business handlers unchanged during visual updates.
- Prefer the shared tokens in `frontend/src/styles/global.css` and the Naive UI
  overrides in `frontend/src/App.vue` before adding page-scoped literals.
- Do not reintroduce glass surfaces, decorative gradients, glow effects, lift-on-
  hover cards, or legacy blue/green palette literals. Use a semantic token or a
  chart token instead.
- Any new interactive element must retain an accessible name and a visible
  keyboard focus state. Verify both a representative desktop route and a narrow
  viewport after changing shared styles.
