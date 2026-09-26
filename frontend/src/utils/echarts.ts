import { use, init, graphic } from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Keep one tree-shakable chart registry for every view. The previous namespace
// import pulled the complete ECharts catalog into the shared vendor chunk.
use([
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export { graphic, init }
export type { ECharts } from 'echarts/core'
