import source from '../reference/svg/ionicons.json'

/** 卡片SVG：保留原始路径、stroke和基础形状；不重画缺失变体。 */
export type SvgSymbolName = keyof typeof source.symbols
export type SvgElement = { tag: string; attrs: Record<string, string | number | undefined>; children: SvgElement[] }
export const svgSymbols: Record<SvgSymbolName, { viewBox: string; elements: SvgElement[] }> = source.symbols
export const svgExportName = (name: SvgSymbolName) => name
export const svgVariant = (name: SvgSymbolName) => name.endsWith('Outline') ? '默认变体' : '填充变体'
