import { createElement, type SVGProps, type ReactElement } from 'react'
import { resolveInterfaceSymbol, type InterfaceSymbolName } from '../utils/interface-symbols'
import type { SvgElement } from '../utils/svg-symbols'
export type InterfaceIconProps = Omit<SVGProps<SVGSVGElement>, 'name' | 'fill' | 'stroke' | 'strokeWidth'> & { name: InterfaceSymbolName; filled?: boolean; size?: number; label?: string }
const reactAttrs=(attrs:Record<string,string|number|undefined>)=>Object.fromEntries(Object.entries(attrs).map(([key,value])=>[key.replace(/-([a-z])/g,(_,letter:string)=>letter.toUpperCase()),value]))
export const symbolElement=(element:SvgElement,index:number):ReactElement=>createElement(element.tag,{...reactAttrs(element.attrs),key:index},...element.children.map(symbolElement))
// 卡片SVG：保留MIT Ionicons真实几何，状态由调用者传入。
export function InterfaceIcon({name,filled=false,size=16,label,...props}:InterfaceIconProps){
 const current=resolveInterfaceSymbol(name,filled)
 return <svg {...props} viewBox={current.symbol.viewBox} width={size} height={size} fill="currentColor" preserveAspectRatio="xMidYMid meet" role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false" data-icon-library="Ionicons 5" data-icon-export={current.name} data-icon-variant={filled?'filled':'outline'} data-symbol={current.name} data-symbol-role={name}>{current.symbol.elements.map(symbolElement)}</svg>
}
