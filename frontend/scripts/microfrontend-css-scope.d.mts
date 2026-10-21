import type { Plugin } from 'vite'
export function scopeMicrofrontendCss(css: string, project: string): string
export function microfrontendCssScopePlugin(project: string): Plugin
export function microfrontendTeleportTransform(project: string): (node: unknown) => void
