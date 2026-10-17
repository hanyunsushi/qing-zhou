# HeroUI Radio styling attribution

The ordinary Naive UI radio control/indicator styling in `src/styles/global.css` is adapted from `@heroui/styles` 3.2.6, `dist/components/radio.css`, `radio-group.css` and the default field-shadow tokens. Copyright 2025 NextUI Inc., Apache-2.0; see `licenses/HeroUI-Apache-2.0.txt`.

Changes: map HeroUI slots and selected/hover/focus/disabled states to Naive DOM/native inputs; use QingZhou color/font tokens; preserve existing group orientation unless specified by the host; use a static keyboard focus outline. The showcase includes the label/description composition. This is a Vue/Naive CSS adaptation, not a React/HeroUI runtime integration.
