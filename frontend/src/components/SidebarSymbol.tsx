// 侧边栏 / 卡片SVG：悬停只变色，真实选中/展开切换MIT Ionicons实心配对。
import React from 'react'
import {svgSymbols,svgExportName,svgVariant,type SvgSymbolName} from '../utils/svg-symbols'
import {symbolElement} from './InterfaceIconReact'
export function SidebarSymbol({name,selectedName,active,open,expandable,reduce}:{name:SvgSymbolName;selectedName?:SvgSymbolName;active:boolean;open:boolean;expandable:boolean;reduce:boolean}){
 const selected=expandable?open:active,current=selected&&selectedName?selectedName:name,symbol=svgSymbols[current]
 return <span className="sidebar-symbol" data-library="Ionicons 5" data-symbol={current} data-symbol-state={selected?'selected':'rest'} data-motion-reduced={reduce} aria-hidden="true"><svg className="sidebar-symbol-svg" viewBox={symbol.viewBox} preserveAspectRatio="xMidYMid meet" fill="currentColor" data-export={svgExportName(current)} data-variant={svgVariant(current)} data-icon-library="Ionicons 5" data-icon-export={svgExportName(current)} data-icon-variant={selected&&selectedName?'filled':'outline'} focusable="false">{symbol.elements.map(symbolElement)}</svg></span>
}
