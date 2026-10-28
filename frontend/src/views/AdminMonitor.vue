<template>
  <div ref="monitorRoot" class="admin-monitor-page">
    <h2 class="page-title">监控管理</h2>
    <p class="page-sub">服务器监控与告警</p>

    <!-- 展示卡片 / 卡片SVG：中性摘要图形与原统计语义对应，不生成选中状态。 -->
    <div class="sum-grid">
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="server" :size="18" />
        </div>
        <div><span class="sum-val">{{ dash.total_servers || 0 }}</span><span class="sum-lab">服务器</span></div>
      </div>
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="online" :size="18" />
        </div>
        <div><span class="sum-val" style="color:var(--success-text);">{{ dash.online || 0 }}</span><span class="sum-lab">在线</span></div>
      </div>
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="close" :size="18" />
        </div>
        <div><span class="sum-val" style="color:var(--danger-text);">{{ dash.offline || 0 }}</span><span class="sum-lab">离线</span></div>
      </div>
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="memory" :size="18" />
        </div>
        <div><span class="sum-val">{{ fmtBytes(dash.summary?.total_mem_used) }}</span><span class="sum-lab">内存已用 / {{ fmtBytes(dash.summary?.total_mem_total) }}</span></div>
      </div>
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="disk" :size="18" />
        </div>
        <div><span class="sum-val">{{ fmtBytes(dash.summary?.total_disk_used) }}</span><span class="sum-lab">磁盘已用 / {{ fmtBytes(dash.summary?.total_disk_total) }}</span></div>
      </div>
      <div class="sum-card">
        <div class="sum-ic">
          <InterfaceIcon name="warning" :size="18" />
        </div>
        <div><span class="sum-val" style="color:var(--warn-text);">{{ dash.alerts_unread || 0 }}</span><span class="sum-lab">未读告警</span></div>
      </div>
    </div>

    <!-- 展示信息模块 / 区分-状态牌：与首页共用16列3行矩阵、立体视图与三状态编码。 -->
    <n-card class="heatmap-card" size="small" style="margin-bottom:16px;">
      <template #header><span class="card-h">可用性热力图</span></template>
      <template #header-extra>
        <div class="heatmap-header-controls">
          <!-- 路由切换组件：热力图时间范围改变监控查询维度。 -->
          <span class="range-switch route-switch" role="group" aria-label="可用性时间范围"
                @mouseover="moveRangeIndicatorFromEvent" @focusin="moveRangeIndicatorFromEvent"
                @mouseleave="resetRangeIndicator" @focusout="resetRangeIndicator">
            <button v-for="r in heatRanges" :key="r.value" type="button" :class="{ active: heatRange===r.value }" :aria-pressed="heatRange===r.value" @click="loadHeatmap(r.value)">{{ r.label }}</button>
          </span>
          <!-- 区分-状态牌：热力图图例与可用性格子共用 Apple 状态色。 -->
          <span class="hm-legend"><i class="hm-dot ok" />正常 <i class="hm-dot warn" />高负载 <i class="hm-dot crit" />严重 <i class="hm-dot none" />无数据</span>
        </div>
      </template>
      <AvailabilityHeatmap v-if="heatData" :data="heatData" />
      <!-- 提示信息：失败保留上一份数据，并明确错误状态。 -->
      <p v-if="heatError || !heatData" class="heat-feedback" role="status">{{ heatError || '正在获取可用性数据…' }}</p>
    </n-card>

    <!-- 告警条 -->
    <n-card v-if="unreadAlerts.length" size="small" style="margin-bottom:16px;">
      <template #header>
        <span class="card-h">未读告警</span>
        <span class="alert-cnt">{{ unreadAlerts.length }}</span>
      </template>
      <template #header-extra>
        <!-- 标准默认弧边按钮：使用32px中性描边与18px圆角；业务事件、加载和禁用条件保持原定义。 -->
        <n-button size="tiny" @click="dismissAll">全部忽略</n-button>
      </template>
      <div v-for="a in shownAlerts" :key="a.id" class="alert-row">
        <div class="alert-main">
          <div class="alert-line">
            <n-tag :type="alertKind(a.type)" size="small" :bordered="false">{{ alertLabel(a.type) }}</n-tag>
            <span class="alert-msg">{{ a.message }}</span>
          </div>
          <div class="alert-meta">
            首次 {{ fmtDateTime(a.first_ts || a.ts) }}
            <template v-if="alertDur(a) >= 60"> · 持续 {{ fmtUptime(alertDur(a)) }}</template>
            <template v-if="a.hits > 1"> · 触发 {{ a.hits }} 次</template>
          </div>
        </div>
        <!-- 标准默认弧边按钮：使用32px中性描边与18px圆角；业务事件、加载和禁用条件保持原定义。 -->
        <n-button size="tiny" @click="dismissAlert(a.id)">忽略</n-button>
      </div>
      <div v-if="unreadAlerts.length > ALERT_PREVIEW" class="alert-more">
        <n-button text size="tiny" @click="alertsExpanded = !alertsExpanded">
          {{ alertsExpanded ? '收起' : `还有 ${unreadAlerts.length - ALERT_PREVIEW} 条，展开全部` }}
        </n-button>
      </div>
    </n-card>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <!-- 填写框 -->
      <n-input v-model:value="q" placeholder="搜索名称/位置/提供商" size="small" clearable style="max-width:220px;" />
      <n-select v-model:value="fStatus" :options="statusOpts" size="small" placeholder="状态" clearable style="width:120px;" />
      <n-select v-model:value="fLoc" :options="locOpts" size="small" placeholder="位置" clearable style="width:140px;" filterable />
      <n-select v-model:value="fProv" :options="provOpts" size="small" placeholder="提供商" clearable style="width:140px;" filterable />
      <span class="spacer" />
      <span class="cnt">{{ filtered.length }}/{{ monitorServers.length }}</span>
    </div>

    <!-- 展示信息模块 / 标准默认弧边按钮：回环资产保留编辑入口，同一采样源仅展示一份指标。 -->
    <div v-if="panelAliases.length" class="monitor-assets" aria-label="本机关联资产">
      <span>关联资产</span>
      <n-button v-for="asset in panelAliases" :key="asset.id" class="default-arc-button" :aria-label="`编辑${asset.name}资产`" @click="openAsset(asset)">{{ asset.name }} · 编辑</n-button>
    </div>

    <!-- 服务器卡片 -->
    <div class="card-grid">
      <n-card v-for="s in filtered" :key="s.id" size="small" class="srv-card">
        <template #header>
          <div class="srv-head">
            <span class="dot" :class="s.status" />
            <!-- 项目超链接：真实标题导航，常态蓝色，悬浮/键盘聚焦下划线。 -->
            <router-link class="srv-name project-link" :to="{ name: 'admin-monitor-detail', params: { id: s.id } }" :aria-label="`查看${s.name}监控详情`">{{ s.name }}</router-link>
            <!-- 区分-信息牌：面板自采集说明采集来源，不表达健康状态。 -->
            <n-tag v-if="s.local || s.panel_metrics" size="small" type="info" :bordered="false">面板自采集</n-tag>
            <n-tooltip :show-arrow="false" v-else-if="s.metrics && s.probe_outdated" trigger="hover">
              <template #trigger>
                <n-tag size="small" type="warning" :bordered="false">探针 {{ s.probe_version || '版本未知' }} · 待升级</n-tag>
              </template>
              当前 {{ s.probe_version || '无法识别' }}，目标 {{ s.probe_target_version }}
            </n-tooltip>
            <n-tag v-else-if="s.metrics && s.probe_version" size="small" type="success" :bordered="false">探针 {{ s.probe_version }}</n-tag>
            <n-tag v-if="s.location" size="small" :bordered="false">{{ s.location }}</n-tag>
          </div>
        </template>
        <template #header-extra>
          <n-space :size="4" align="center" wrap>
            <!-- 切换开关：公开可见性用于首页，保持独立于管理员监控和探针启用。 -->
            <n-tooltip :show-arrow="false" trigger="hover">
              <template #trigger>
                <n-switch :value="s.public_visible" :aria-label="`${s.name}首页公开可见性`" size="small" :loading="visSaving === s.id" @update:value="(v:boolean) => setPublicVisible(s, v)" />
              </template>
              {{ s.panel_metrics && !s.probe_enabled ? '此回环记录没有独立探针，首页本机指标由“面板本机”的公开开关控制' : s.public_visible ? '显示在首页（公开状态页）' : '不显示在首页（公开状态页）' }}
            </n-tooltip>
            <!-- 标准默认弧边按钮：资产编辑与同组操作共用18px弧边几何。 -->
            <n-button size="tiny" class="default-arc-button" @click="openAsset(s)">编辑</n-button>
            <!-- 本机是面板自采集，没有探针可装 -->
            <n-button
              v-if="!s.local && !s.panel_metrics"
              size="tiny"
              :type="s.probe_outdated ? 'warning' : 'primary'"
              :loading="s.probe_upgrading"
              @click="upgradeProbe(s)"
            >
              {{ s.probe_upgrading ? '安装中' : (!s.metrics ? '一键安装' : (s.probe_outdated ? '一键升级' : '重装探针')) }}
            </n-button>
            <!-- 标准默认弧边按钮：使用32px中性描边与18px圆角；业务事件、加载和禁用条件保持原定义。 -->
            <n-button v-if="!s.local && !s.panel_metrics" size="tiny" @click="copyInstall(s)">复制命令</n-button>
          </n-space>
        </template>

        <div class="asset-line">
          <span v-if="s.provider" class="tag-mini">{{ s.provider }}</span>
          <span v-if="s.spec" class="tag-mini">{{ s.spec }}</span>
          <span v-if="s.price" class="tag-mini">¥{{ s.price }}/月</span>
          <span v-if="s.days_left != null" class="tag-mini" :class="{ danger: s.days_left <= 7 }">剩 {{ s.days_left }} 天</span>
        </div>

        <n-alert v-if="s.probe_upgrading" type="info" :bordered="false" class="probe-job">
          正在通过 SSH 上传并安装探针，离开页面不影响安装。
        </n-alert>
        <n-alert v-else-if="s.probe_upgrade_error" type="error" :bordered="false" class="probe-job">
          安装失败
          <pre class="probe-out">{{ s.probe_upgrade_error }}</pre>
        </n-alert>

        <template v-if="s.metrics">
          <div class="metric">
            <div class="m-row"><span>CPU</span><b>{{ s.metrics.cpu_percent.toFixed(1) }}%</b></div>
            <n-progress type="line" :percentage="s.metrics.cpu_percent" :show-indicator="false" :height="6" :color="pctColor(s.metrics.cpu_percent)" />
          </div>
          <div class="metric">
            <div class="m-row"><span>内存</span><b>{{ fmtBytes(s.metrics.mem_used) }} / {{ fmtBytes(s.metrics.mem_total) }}</b></div>
            <n-progress type="line" :percentage="memPct(s)" :show-indicator="false" :height="6" :color="pctColor(memPct(s))" />
          </div>
          <div class="metric">
            <div class="m-row"><span>磁盘</span><b>{{ fmtBytes(s.metrics.disk_used) }} / {{ fmtBytes(s.metrics.disk_total) }}</b></div>
            <n-progress type="line" :percentage="diskPct(s)" :show-indicator="false" :height="6" :color="pctColor(diskPct(s))" />
          </div>
          <div class="info-strip">
            <span class="tag-mini">↑ {{ fmtBytes(s.metrics.net_tx) }}/s</span>
            <span class="tag-mini">↓ {{ fmtBytes(s.metrics.net_rx) }}/s</span>
            <span class="tag-mini">负载 {{ s.metrics.load1.toFixed(2) }}</span>
            <span class="tag-mini">{{ fmtUptime(s.metrics.uptime) }}</span>
          </div>
          <div class="traffic-total">
            <div class="m-row"><span>本周期流量（{{ trafficModeLabel(s.traffic_accounting_mode) }}）</span><b>{{ trafficStatus(s) }}</b></div>
            <n-progress v-if="s.traffic_limit_bytes > 0" type="line" :percentage="trafficPct(s)" :height="5"
                        :show-indicator="false" :color="pctColor(trafficPct(s))" style="margin:5px 0 4px;" />
            <div class="traffic-split">
              <template v-if="!s.month_traffic?.calibrated">
                <span>IN {{ trafficReady(s.month_traffic) ? fmtBytes(s.month_traffic.rx) : '—' }}</span>
                <span>OUT {{ trafficReady(s.month_traffic) ? fmtBytes(s.month_traffic.tx) : '—' }}</span>
              </template>
              <span v-else>服务商用量已校准</span>
              <span v-if="trafficIncomplete(s)" class="traffic-warning">周期数据不完整：仅自 {{ fmtDateTime(s.month_traffic.coverage_start) }} 起</span>
              <span>周期 {{ fmtDateTime(s.traffic_cycle_start) }} → {{ fmtDateTime(s.traffic_next_reset) }}</span>
              <span v-if="s.traffic_limit_bytes > 0">{{ s.traffic_alert_percent }}% 告警</span>
            </div>
          </div>
        </template>
        <!-- 展示信息模块：无指标时说明探针边界，不把缺失数据伪装成健康状态。 -->
        <div v-else class="no-data">
          <strong>{{ s.local ? '面板本机尚未产生采样' : isLoopbackServer(s) ? '本机指标由面板自动采集' : s.probe_enabled ? '等待探针上报数据' : '尚未启用探针' }}</strong>
          <span>{{ s.local ? '面板启动后自动采集本机指标。' : isLoopbackServer(s) ? '此记录指向面板本机，系统指标与趋势见“面板本机”卡片。' : s.probe_enabled ? '收到远程探针数据后显示指标与趋势。' : '点击“一键安装”后才会采集这台远程服务器。' }}</span>
        </div>

        <div class="mini-chart-box">
          <!-- 路由切换组件：单机趋势时间范围改变图表查询维度。 -->
          <div class="range-switch mini-range route-switch" role="group" :aria-label="`${s.name}趋势时间范围`"
               @mouseover="moveRangeIndicatorFromEvent" @focusin="moveRangeIndicatorFromEvent"
               @mouseleave="resetRangeIndicator" @focusout="resetRangeIndicator">
            <button v-for="r in ranges" :key="r.value" type="button" :class="{ active: chartRange[s.id]===r.value }" :aria-pressed="chartRange[s.id]===r.value" @click="loadChart(s.id, r.value)">{{ r.label }}</button>
          </div>
          <div :ref="(el:any) => setChartRef(s.id, el)" class="mini-chart" />
        </div>
      </n-card>
    </div>
    <n-empty v-if="!loading && !filtered.length" description="无匹配服务器" style="padding:40px 0;" />

    <!-- 资产编辑抽屉 -->
    <n-drawer v-model:show="showAsset" :width="drawerW" placement="right">
      <n-drawer-content :title="assetServer?.local ? '编辑资产信息 · 面板本机' : '编辑资产信息'" closable>
        <n-alert v-if="assetServer?.local" type="info" :bordered="false" style="margin-bottom:12px;">
          面板本机由面板自采集，无需探针。这里记的是这台机器本身 —— 到期提醒尤其值得填：落地机到期只掉一个节点，面板机到期是整站。
        </n-alert>
        <n-form v-if="assetServer" label-placement="left" label-width="105">
          <n-form-item label="提供商"><n-input v-model:value="assetForm.provider" /></n-form-item>
          <n-form-item label="位置"><n-input v-model:value="assetForm.location" /></n-form-item>
          <n-form-item label="规格"><n-input v-model:value="assetForm.spec" /></n-form-item>
          <n-form-item label="月费 (¥)"><n-input-number v-model:value="assetForm.price" :min="0" style="width:100%;" /></n-form-item>
          <n-form-item label="到期时间"><n-input v-model:value="assetExpiry" :input-props="{ type: 'datetime-local' }" style="width:100%;" /></n-form-item>
          <div class="asset-section-title">Telegram 到期提醒</div>
          <n-form-item label="启用提醒"><n-switch v-model:value="assetForm.expiry_notify_enabled" /></n-form-item>
          <template v-if="assetForm.expiry_notify_enabled">
            <n-form-item label="提前天数">
              <n-input-number v-model:value="assetForm.expiry_notify_days" :min="1" :max="365" style="width:100%;" />
            </n-form-item>
            <n-form-item label="重复方式">
              <n-select v-model:value="assetForm.expiry_notify_mode" :options="expiryNotifyModes" />
            </n-form-item>
            <n-form-item v-if="assetForm.expiry_notify_mode === 'count'" label="提醒总次数">
              <n-input-number v-model:value="assetForm.expiry_notify_count" :min="1" :max="365" style="width:100%;" />
            </n-form-item>
            <p class="asset-form-hint">首次进入提前提醒范围时发送；重复提醒最多每天一次。定次数包含首次提醒。</p>
          </template>

          <div class="asset-section-title">月流量上限</div>
          <n-form-item label="上限 (GB)">
            <n-input-number v-model:value="assetTrafficGB" :min="0" :precision="2" style="width:100%;" />
          </n-form-item>
          <template v-if="assetTrafficGB > 0">
            <n-form-item label="计费口径">
              <n-select v-model:value="assetForm.traffic_accounting_mode" :options="trafficAccountingModes" />
            </n-form-item>
            <n-form-item label="每月重置日">
              <n-input-number v-model:value="assetForm.traffic_reset_day" :min="1" :max="31" style="width:100%;" />
            </n-form-item>
            <n-form-item label="重置时间">
              <n-input v-model:value="assetResetTime" :input-props="{ type: 'time' }" style="width:100%;" />
            </n-form-item>
            <n-form-item label="告警阈值">
              <n-input-number v-model:value="assetForm.traffic_alert_percent" :min="1" :max="100" style="width:100%;">
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>
            <n-form-item label="当前已用">
              <div class="calibration-input">
                <n-input-number v-model:value="assetUsedGB" :min="0" :precision="2" style="flex:1;">
                  <template #suffix>GB</template>
                </n-input-number>
                <!-- 标准默认弧边按钮：使用32px中性描边与18px圆角；业务事件、加载和禁用条件保持原定义。 -->
                <n-button :loading="calibrating" @click="handleCalibrateTraffic">校准</n-button>
              </div>
            </n-form-item>
            <p class="asset-form-hint">填写服务商后台显示的当前周期已用流量。校准时会先保存重置日期和计费口径；校准值只在本周期生效，之后继续叠加探针流量。</p>
            <p class="asset-form-hint">探针分别采集设备物理网卡 IN / OUT，再按上面的服务商计费口径汇总；达到阈值后每个流量周期只通知一次。</p>
          </template>
          <div class="asset-section-title">首页监控大屏</div>
          <n-form-item label="显示流量"><n-switch v-model:value="assetForm.public_show_traffic" /></n-form-item>
          <n-form-item label="显示价格"><n-switch v-model:value="assetForm.public_show_price" /></n-form-item>
          <p class="asset-form-hint">两个开关默认开启；仅在该设备已开启“显示在公开状态页”时生效。</p>
          <n-form-item label="备注"><n-input v-model:value="assetForm.notes" type="textarea" :rows="2" /></n-form-item>
          <n-form-item v-if="!assetServer.local" label="启用探针"><n-switch v-model:value="assetForm.probe_enabled" /></n-form-item>
        </n-form>
        <!-- 高亮弧边按钮：悬浮及点击后聚焦提亮，点击保持悬浮色且不改变位置；loading仅绑定真实请求。 -->
        <n-button type="primary" class="highlight-arc-button" block :loading="saving" @click="handleSaveAsset">保存</n-button>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import InterfaceIcon from '@/components/InterfaceIcon.vue'
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, shallowRef, watch } from 'vue'
import {
  NCard, NButton, NSpace, NTag, NProgress, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NInputNumber, NSwitch, NSelect, NEmpty, NTooltip, NAlert, useMessage
} from 'naive-ui'
import { apiGet, apiList, apiPost, apiPut } from '@/api'
import { fmtBytes, fmtDateTime, fmtUptime, pct, toLocalDatetimeInput } from '@/utils/format'
import * as echarts from '@/utils/echarts'
import { CHART_STATUS_COLORS, chartColorForPercent } from '@/utils/status-colors'
import AvailabilityHeatmap from '@/components/AvailabilityHeatmap.vue'
import type { AvailabilityData } from '@/utils/heatmap-skyline'

const message = useMessage()
const dash = ref<any>({})
const servers = ref<any[]>([])
// 展示信息模块：物理主机只展示一份采样，旧回环记录仍能独立编辑资产元数据。
const panelAliases = computed(() => servers.value.filter(s => s.panel_metrics))
const monitorServers = computed(() => servers.value.filter(s => !s.panel_metrics))
// 展示信息模块：回环服务器记录与面板自采集记录分开说明，不生成重复指标。
function isLoopbackServer(server: { host?: string }): boolean {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(String(server.host || '').trim().toLowerCase())
}
const monitorRoot = ref<HTMLElement | null>(null)
const saving = ref(false)
const loading = ref(false)
const chartRefs = ref<Record<number, HTMLElement>>({})
const chartInstances = ref<Partial<Record<number, echarts.ECharts>>>({})
const chartRange = ref<Record<number, string>>({})
const chartLoaded = ref<Record<number, boolean>>({}) // 懒加载标记

const ranges = [
  { label: '1h', value: '1h' }, { label: '6h', value: '6h' },
  { label: '24h', value: '24h' }, { label: '7d', value: '7d' }, { label: '30d', value: '30d' },
]

// --- 告警 ---
// 后端已把同一台机器的同一类问题合并成一条「事件」（持续时间 + 触发次数），
// 这里只负责按严重度排序、折叠长列表，避免一屏刷满重复条目。
const unreadAlerts = ref<any[]>([])
const alertsExpanded = ref(false)
const ALERT_PREVIEW = 5
const ALERT_META: Record<string, { label: string; kind: 'error' | 'warning'; rank: number }> = {
  offline: { label: '离线', kind: 'error', rank: 0 },
  // 节点反复重启：每次重启都会切断该节点上所有人的连接，用户侧就是「一会儿就断」。
  // 排在离线后面 —— 还能连上，但连不稳。
  restart_loop: { label: '反复重启', kind: 'error', rank: 1 },
  expired: { label: '已过期', kind: 'error', rank: 2 },
  disk_full: { label: '磁盘将满', kind: 'warning', rank: 3 },
  high_mem: { label: '内存偏高', kind: 'warning', rank: 4 },
  high_cpu: { label: 'CPU 偏高', kind: 'warning', rank: 5 },
  expiring: { label: '即将到期', kind: 'warning', rank: 6 },
  traffic_threshold: { label: '流量阈值', kind: 'warning', rank: 3 },
}
function alertLabel(t: string) { return ALERT_META[t]?.label || t }
function alertKind(t: string) { return ALERT_META[t]?.kind || 'warning' }
function alertDur(a: any) { return Math.max(0, (a.ts || 0) - (a.first_ts || a.ts || 0)) }
const sortedAlerts = computed(() => [...unreadAlerts.value].sort(
  (a, b) => (ALERT_META[a.type]?.rank ?? 9) - (ALERT_META[b.type]?.rank ?? 9) || b.ts - a.ts
))
const shownAlerts = computed(() => alertsExpanded.value ? sortedAlerts.value : sortedAlerts.value.slice(0, ALERT_PREVIEW))

// 移动端抽屉宽度
const isMobile = ref(false)
const drawerW = computed(() => isMobile.value ? '100%' : 420)
function checkMobile() { isMobile.value = window.matchMedia('(max-width: 768px)').matches }

// 搜索筛选
const q = ref('')
const fStatus = ref<string | null>(null)
const fLoc = ref<string | null>(null)
const fProv = ref<string | null>(null)
const statusOpts = [
  { label: '在线', value: 'online' }, { label: '离线', value: 'offline' },
  { label: '探针待升级', value: 'probe_outdated' },
]
const locOpts = computed(() => uniqueOpts(servers.value.map(s => s.location)))
const provOpts = computed(() => uniqueOpts(servers.value.map(s => s.provider)))
function uniqueOpts(arr: string[]) {
  return [...new Set(arr.filter(Boolean))].map(v => ({ label: v, value: v }))
}
const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return monitorServers.value.filter(s => {
    const identities = s.local ? [s, ...panelAliases.value] : [s]
    if (kw && !identities.some(item => [item.name, item.location, item.provider].some(v => (v || '').toLowerCase().includes(kw)))) return false
    if (fStatus.value === 'probe_outdated' && !s.probe_outdated) return false
    if (fStatus.value && fStatus.value !== 'probe_outdated' && s.status !== fStatus.value) return false
    if (fLoc.value && !identities.some(item => item.location === fLoc.value)) return false
    if (fProv.value && !identities.some(item => item.provider === fProv.value)) return false
    return true
  })
})

function memPct(s: any) { return s.metrics ? pct(s.metrics.mem_used, s.metrics.mem_total) : 0 }
function diskPct(s: any) { return s.metrics ? pct(s.metrics.disk_used, s.metrics.disk_total) : 0 }
function trafficReady(t: any) { return t?.calibrated === true || (t?.sample_count || 0) >= 2 }
function trafficStatus(s: any) {
  if (trafficReady(s.month_traffic)) {
    const used = fmtBytes(s.month_traffic.total)
    return s.traffic_limit_bytes > 0 ? `${used} / ${fmtBytes(s.traffic_limit_bytes)}` : used
  }
  return s.metrics?.net_totals_valid ? '采集中' : '需升级探针'
}
function trafficPct(s: any) { return pct(s.month_traffic?.total || 0, s.traffic_limit_bytes || 0) }
function trafficModeLabel(mode: string) {
  return ({ sum: 'IN + OUT', max: 'IN / OUT 取大', rx: '仅 IN', tx: '仅 OUT' } as Record<string, string>)[mode] || 'IN + OUT'
}
function trafficIncomplete(s: any) {
  const t = s.month_traffic
  return !t?.calibrated && t?.sample_count > 0 && t.coverage_start > (s.traffic_cycle_start || 0) + 3600
}
function pctColor(v: number) { return chartColorForPercent(v) }

// 展示信息模块 / 区分-状态牌：后台总览按机器与时间显示三种负载状态和无数据。
const heatData = shallowRef<AvailabilityData | null>(null)
const heatRange = ref('24h')
const heatLoading = ref(false)
const heatError = ref('')
let heatRequest = 0
const heatRanges = [
  { label: '1h', value: '1h' }, { label: '6h', value: '6h' },
  { label: '24h', value: '24h' }, { label: '7d', value: '7d' },
]
async function loadHeatmap(range: string) {
  const request = ++heatRequest
  heatRange.value = range
  syncRangeIndicators()
  heatLoading.value = true
  try {
    const data = await apiGet<AvailabilityData>(`/api/admin/monitor/heatmap?range=${range}`)
    if (request !== heatRequest || !monitorMounted) return
    heatData.value = data
    heatError.value = ''
  } catch (error: any) {
    if (request === heatRequest && monitorMounted) heatError.value = error.message || '可用性数据加载失败，请重试'
  } finally { if (request === heatRequest) heatLoading.value = false }
}

// --- Asset editing ---
const showAsset = ref(false)
const assetServer = ref<any>(null)
const GB = 1024 * 1024 * 1024
const expiryNotifyModes = [
  { label: '每天一次，共提醒指定次数', value: 'count' },
  { label: '首次后每天提醒，直到到期', value: 'daily' },
]
const trafficAccountingModes = [
  { label: '双向合计（IN + OUT）', value: 'sum' },
  { label: '双向取大（MAX IN / OUT）', value: 'max' },
  { label: '仅入站（IN）', value: 'rx' },
  { label: '仅出站（OUT）', value: 'tx' },
]
const assetForm = reactive({
  provider: '', location: '', spec: '', price: 0, notes: '', probe_enabled: false,
  public_show_traffic: true, public_show_price: true,
  expiry_notify_enabled: false, expiry_notify_days: 3, expiry_notify_mode: 'count', expiry_notify_count: 1,
  traffic_reset_day: 1, traffic_alert_percent: 80, traffic_accounting_mode: 'sum',
})
const assetExpiry = ref('')
const assetTrafficGB = ref(0)
const assetUsedGB = ref(0)
const assetResetTime = ref('00:00')
const calibrating = ref(false)
function resetTimeOf(minutes: number) {
  const n = Math.max(0, Math.min(1439, Number(minutes) || 0))
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}
function resetMinuteOf(value: string) {
  const [h, m] = String(value || '00:00').split(':').map(Number)
  return Math.max(0, Math.min(1439, (h || 0) * 60 + (m || 0)))
}
function openAsset(s: any) {
  assetServer.value = s
  Object.assign(assetForm, {
    provider: s.provider || '', location: s.location || '', spec: s.spec || '', price: s.price || 0,
    notes: s.notes || '', probe_enabled: s.probe_enabled,
    public_show_traffic: s.public_show_traffic !== false,
    public_show_price: s.public_show_price !== false,
    expiry_notify_enabled: s.expiry_notify_enabled === true,
    expiry_notify_days: s.expiry_notify_days || 3,
    expiry_notify_mode: s.expiry_notify_mode === 'daily' ? 'daily' : 'count',
    expiry_notify_count: s.expiry_notify_count || 1,
    traffic_reset_day: s.traffic_reset_day || 1,
    traffic_alert_percent: s.traffic_alert_percent || 80,
    traffic_accounting_mode: ['sum', 'max', 'rx', 'tx'].includes(s.traffic_accounting_mode) ? s.traffic_accounting_mode : 'sum',
  })
  assetExpiry.value = toLocalDatetimeInput(s.expiry_date)
  assetTrafficGB.value = Math.round(((s.traffic_limit_bytes || 0) / GB) * 100) / 100
  assetUsedGB.value = Math.round(((s.month_traffic?.total || 0) / GB) * 100) / 100
  assetResetTime.value = resetTimeOf(s.traffic_reset_minute)
  showAsset.value = true
}
async function handleCalibrateTraffic() {
  if (!assetServer.value) return
  calibrating.value = true
  try {
    await apiPut(`/api/admin/servers/${assetServer.value.id}/monitor`, {
      traffic_reset_day: assetForm.traffic_reset_day,
      traffic_reset_minute: resetMinuteOf(assetResetTime.value),
      traffic_accounting_mode: assetForm.traffic_accounting_mode,
    })
    const data = await apiPut<any>(`/api/admin/servers/${assetServer.value.id}/traffic-calibration`, {
      used_bytes: Math.round(Math.max(0, assetUsedGB.value || 0) * GB),
    })
    if (data?.usage) assetServer.value.month_traffic = data.usage
    message.success('当前周期流量已校准')
    await load()
  } catch (e: any) { message.error(e.message) } finally { calibrating.value = false }
}
async function handleSaveAsset() {
  if (!assetServer.value) return
  if (assetForm.expiry_notify_enabled && !assetExpiry.value) {
    message.error('启用到期提醒前请先填写到期时间'); return
  }
  saving.value = true
  try {
    const body: any = { ...assetForm }
    // 本机没有探针可启用，别把这个字段发过去（后端也会忽略）
    if (assetServer.value.local) delete body.probe_enabled
    // 清空到期时间要能存回去，否则填错了就再也去不掉
    body.expiry_date = assetExpiry.value ? Math.floor(new Date(assetExpiry.value).getTime() / 1000) : 0
    body.traffic_limit_bytes = Math.round(Math.max(0, assetTrafficGB.value || 0) * GB)
    body.traffic_reset_minute = resetMinuteOf(assetResetTime.value)
    await apiPut(`/api/admin/servers/${assetServer.value.id}/monitor`, body)
    message.success('保存成功'); showAsset.value = false; await load()
  } catch (e: any) { message.error(e.message) } finally { saving.value = false }
}

async function dismissAlert(id: number) {
  try {
    await apiPost(`/api/admin/monitor/alerts/${id}/read`)
    unreadAlerts.value = unreadAlerts.value.filter(a => a.id !== id)
    dash.value.alerts_unread = unreadAlerts.value.length
  } catch {}
}

async function dismissAll() {
  try {
    await apiPost('/api/admin/monitor/alerts/read-all')
    unreadAlerts.value = []
    dash.value.alerts_unread = 0
    alertsExpanded.value = false
  } catch (e: any) { message.error(e.message) }
}

// 公开状态页是不鉴权的，所以「监控它」和「对外公布它」分成两件事。其他机器默认
// 公开（和加这个开关之前的行为一致），面板本机默认不公开。
const visSaving = ref<number | null>(null)
async function setPublicVisible(s: any, v: boolean) {
  visSaving.value = s.id
  try {
    await apiPut(`/api/admin/servers/${s.id}/monitor`, { public_visible: v })
    s.public_visible = v
    message.success(v ? `「${s.name}」已显示在公开状态页` : `「${s.name}」已从公开状态页隐藏`)
  } catch (e: any) { message.error(e.message) } finally { visSaving.value = null }
}

function copyInstall(s: any) {
  if (!s.probe_token) { message.warning('请先启用探针'); return }
  const cmd = `bash <(curl -sL ${location.origin}/api/monitor/install.sh) ${s.probe_token}`
  navigator.clipboard.writeText(cmd); message.success('探针安装 / 升级命令已复制')
}

const probePolls = new Set<number>()
async function upgradeProbe(s: any) {
  try {
    await apiPost(`/api/admin/monitor/servers/${s.id}/probe/upgrade`)
    s.probe_upgrading = true
    s.probe_upgrade_error = ''
    message.info(`已开始为「${s.name}」安装探针`)
    void pollProbeUpgrade(s.id, s.name)
  } catch (e: any) {
    message.error(e?.message || '启动探针安装失败', { duration: 10000 })
  }
}

async function pollProbeUpgrade(serverId: number, serverName: string) {
  if (probePolls.has(serverId)) return
  probePolls.add(serverId)
  try {
    for (let i = 0; i < 150; i++) {
      if (!monitorMounted) return
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (!monitorMounted) return
      try {
        const list = await apiList('/api/admin/monitor/servers')
        servers.value = list || []
      } catch {
        continue
      }
      const current = servers.value.find(s => s.id === serverId)
      if (!current?.probe_upgrading) {
        if (current?.probe_upgrade_error) {
          message.error(`「${serverName}」探针安装失败`, { duration: 10000 })
        } else {
          message.success(`「${serverName}」探针安装完成`)
        }
        return
      }
    }
    message.warning(`「${serverName}」安装仍在进行，请稍后刷新查看`)
  } finally {
    probePolls.delete(serverId)
  }
}

// 路由切换组件：每组独立跟随悬浮/键盘目标，离开回到真实选中项。
function moveRangeIndicator(container: HTMLElement, button: HTMLElement | null) {
  if (!button) return
  const base = container.getBoundingClientRect()
  const item = button.getBoundingClientRect()
  container.style.setProperty('--route-indicator-x', `${item.left - base.left}px`)
  container.style.setProperty('--route-indicator-w', `${item.width}px`)
}
function moveRangeIndicatorFromEvent(event: MouseEvent | FocusEvent) {
  const container = event.currentTarget
  const target = event.target
  if (!(container instanceof HTMLElement) || !(target instanceof HTMLElement)) return
  const button = target.closest<HTMLElement>('button')
  if (button && container.contains(button)) moveRangeIndicator(container, button)
}
function resetRangeIndicator(event: MouseEvent | FocusEvent) {
  const container = event.currentTarget
  if (!(container instanceof HTMLElement)) return
  if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) return
  moveRangeIndicator(container, container.querySelector<HTMLElement>('button.active'))
}
function syncRangeIndicators() {
  void nextTick(() => {
    monitorRoot.value?.querySelectorAll<HTMLElement>('.range-switch.route-switch').forEach((container) => {
      moveRangeIndicator(container, container.querySelector<HTMLElement>('button.active'))
    })
  })
}
// 路由切换组件：筛选重建卡片后按当前范围重新测量，不沿用旧位置。
watch(filtered, (current, previous) => {
  syncRangeIndicators()
  for (const server of current) {
    if (chartLoaded.value[server.id] && !previous.some(s => s.id === server.id)) {
      void loadChart(server.id, chartRange.value[server.id] || '24h')
    }
  }
}, { flush: 'post' })

// --- ECharts（懒加载 + resize）---
// chartRefs 在卡片卸载时清空引用，便于检测失效实例
function setChartRef(id: number, el: any) {
  if (el) chartRefs.value[id] = el
  else delete chartRefs.value[id]
}

// 安全 resize：跳过/清理已脱离 DOM 的孤儿实例，避免 ECharts 内部 model 损坏报错
function safeResizeAll() {
  for (const id of Object.keys(chartInstances.value)) {
    const sid = Number(id)
    const chart = chartInstances.value[sid]
    if (!chart) continue
    const el = chartRefs.value[sid]
    // 容器已被移除（筛选/卸载）：dispose 掉孤儿实例
    if (!el || !(el as HTMLElement).isConnected) {
      try { chart.dispose() } catch {}
      delete chartInstances.value[sid]
      continue
    }
    try { chart.resize() } catch {}
  }
}

const chartRequests: Record<number, number> = {}
async function loadChart(serverId: number, range: string) {
  const request = chartRequests[serverId] = (chartRequests[serverId] || 0) + 1
  chartRange.value[serverId] = range
  chartLoaded.value[serverId] = true
  syncRangeIndicators()
  try {
    const data = await apiGet<any>(`/api/admin/monitor/servers/${serverId}/metrics?range=${range}`)
    if (request !== chartRequests[serverId] || !monitorMounted) return
    const metrics = data?.data || []
    await nextTick()
    const el = chartRefs.value[serverId]
    if (!el || !(el as HTMLElement).isConnected) return
    // 展示信息模块：筛选恢复卡片后，图表实例必须绑定当前容器。
    let chart = chartInstances.value[serverId]
    if (chart && chart.getDom() !== el) {
      try { chart.dispose() } catch {}
      chart = undefined
      delete chartInstances.value[serverId]
    }
    if (!chart) {
      chart = echarts.init(el)
      chartInstances.value[serverId] = chart
    }
    const times = metrics.map((m: any) => {
      const d = new Date(m.ts * 1000)
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    })
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 10, top: 10, bottom: 22 },
      xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10 } },
      yAxis: [
        { type: 'value', name: '%', max: 100, axisLabel: { fontSize: 10 } },
        { type: 'value', name: 'MB/s', axisLabel: { fontSize: 10 } },
      ],
      series: [
        { name: 'CPU', type: 'line', data: metrics.map((m: any) => m.cpu_percent?.toFixed(1)), smooth: true, lineStyle: { width: 1.5 }, showSymbol: false },
        { name: '内存', type: 'line', data: metrics.map((m: any) => pct(m.mem_used, m.mem_total).toFixed(1)), smooth: true, lineStyle: { width: 1.5 }, showSymbol: false },
        { name: '网络↑', type: 'line', yAxisIndex: 1, data: metrics.map((m: any) => ((m.net_tx || 0) / 1048576).toFixed(2)), smooth: true, lineStyle: { width: 1 }, showSymbol: false },
        { name: '网络↓', type: 'line', yAxisIndex: 1, data: metrics.map((m: any) => ((m.net_rx || 0) / 1048576).toFixed(2)), smooth: true, lineStyle: { width: 1 }, showSymbol: false },
      ],
    })
  } catch {}
}

let refreshTimer: ReturnType<typeof setInterval> | null = null
let resizeTimer: ReturnType<typeof setInterval> | null = null
let monitorMounted = false

async function load() {
  loading.value = true
  try {
    const [d, s, a] = await Promise.all([
      apiGet('/api/admin/monitor/dashboard'),
      apiList('/api/admin/monitor/servers'),
      // unread=1：只取未读，否则 200 条上限可能被历史已读告警占满。
      apiList('/api/admin/monitor/alerts?unread=1'),
    ])
    dash.value = d || {}
    servers.value = s || []
    unreadAlerts.value = a || []
    for (const sv of servers.value) {
      if (!chartRange.value[sv.id]) chartRange.value[sv.id] = '24h'
      if (sv.probe_upgrading) void pollProbeUpgrade(sv.id, sv.name)
    }
  } catch {} finally { loading.value = false }
}

onMounted(async () => {
  monitorMounted = true
  checkMobile()
  window.addEventListener('resize', onWinResize)
  await load()
  await nextTick()
  syncRangeIndicators()
  // 懒加载：只画前 6 台可见服务器，其余按需点击 range 按钮时画
  const initial = monitorServers.value.slice(0, 6)
  for (const sv of initial) {
    loadChart(sv.id, chartRange.value[sv.id] || '24h')
  }
  // 热力图
  loadHeatmap('24h')
  refreshTimer = setInterval(() => { void load(); void loadHeatmap(heatRange.value) }, 30000)
  // 定期 resize 图表以适配抽屉开合
  resizeTimer = setInterval(safeResizeAll, 5000)
})

function onWinResize() {
  checkMobile()
  safeResizeAll()
  syncRangeIndicators()
}

onUnmounted(() => {
  monitorMounted = false
  if (refreshTimer) clearInterval(refreshTimer)
  if (resizeTimer) clearInterval(resizeTimer)
  window.removeEventListener('resize', onWinResize)
  Object.values(chartInstances.value).forEach(c => c?.dispose())
})
</script>

<style scoped>
.page-title { font-size: 21px; margin-bottom: 4px; }
.page-sub { color: var(--text-2); margin-bottom: 18px; }
.card-h { font-weight: 650; font-size: 14px; }

/* 展示卡片 */
.sum-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.sum-card { min-height: 76px; box-sizing: border-box; display: flex; align-items: center; gap: 11px; padding: 13px 14px; background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: none; transition: box-shadow .25s ease; transform: none; opacity: 1; }
/* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 */
.sum-card:hover, .sum-card:focus-visible { border-color: var(--border); background: var(--card); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08); transform: none; opacity: 1; }
  /* 卡片 SVG：与首页摘要图标及帮助文档统计卡统一使用中性前景和灰色底框。 */
.sum-ic { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; flex: 0 0 36px; background: var(--bg-subtle); color: var(--text-2); }
.sum-card > div:not(.sum-ic) { display: flex; flex-direction: column; justify-content: center; gap: 2px; min-width: 0; }
.sum-val { font-size: 19px; font-weight: 720; line-height: 1.12; white-space: nowrap; font-variant-numeric: tabular-nums; }
.sum-lab { font-size: 11px; line-height: 1.25; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 热力图 */
.heatmap-header-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; min-width: 0; }
.hm-legend { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px; min-width: 0; font-size: 11px; color: var(--text-3); margin-left: 0; }
/* 区分-状态牌：管理监控图例使用统一 Apple 状态色。 */
.hm-dot { width: 8px; height: 8px; border-radius: 3px; display: inline-block; margin-left: 6px; box-shadow: inset 0 0 0 1px rgba(31,43,55,.05); }
.hm-dot.ok { background: var(--chart-success); } .hm-dot.warn { background: var(--chart-warning); } .hm-dot.crit { background: var(--chart-error); } .hm-dot.none { background: var(--chart-inactive); }
/* 展示信息模块 / 提示信息：共享热力图负责自身尺寸，关联资产入口不重复绘制资源值。 */
.heat-feedback { padding: 16px 0; color: var(--text-3); font: 400 13px/20px var(--ff-body); text-align: center; }
.monitor-assets { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; color: var(--text-3); font-size: 13px; }
/* 路由切换组件：40px外轨、32px选项、16/12px圆角及4px内距；单一跟随面绘制高亮。 */
.range-switch { display:inline-flex; align-items:center; gap:0; background:var(--bg-subtle); }
.range-switch.route-switch { --route-indicator-x:4px; --route-indicator-w:0px; position:relative; isolation:isolate; min-height:40px; padding:4px; border:0; border-radius:16px !important; box-shadow:none; }
.range-switch.route-switch::before { position:absolute; z-index:0; top:4px; bottom:4px; left:0; width:var(--route-indicator-w, 0px); border-radius:12px; content:''; pointer-events:none; background:var(--card); box-shadow:none; transform:translateX(var(--route-indicator-x, 4px)); transition:transform .24s cubic-bezier(.215,.61,.355,1), width .24s cubic-bezier(.215,.61,.355,1); }
.range-switch button { min-width:32px; border:0; background:transparent; color:var(--text-2); font:500 13px/20px var(--ff); cursor:pointer; transition:color .18s var(--ease-standard); }
.range-switch.route-switch button { position:relative; z-index:1; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; min-height:32px; padding:6px 14px; line-height:20px; border-radius:12px; }
.range-switch button:hover { color:var(--text); }
.range-switch button.active { background:transparent; color:var(--text); box-shadow:none; }
.range-switch.route-switch button:focus-visible { outline:0; box-shadow:inset 0 0 0 2px rgba(29,39,51,.16) !important; }
.mini-range { width:max-content; max-width:100%; margin-bottom:6px; }

/* 告警 */
.alert-cnt { display: inline-block; margin-left: 6px; padding: 0 6px; border-radius: 9px; background: var(--danger-soft); color: var(--danger-text); font-size: 11px; font-weight: 650; }
.alert-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--border-soft, #f1efe8); }
.alert-row:last-child { border-bottom: none; }
.alert-main { min-width: 0; }
.alert-line { display: flex; align-items: center; gap: 8px; }
.alert-msg { font-size: 13px; overflow-wrap: anywhere; }
.alert-meta { font-size: 11px; color: var(--text-3); margin-top: 3px; }
.alert-more { padding-top: 8px; text-align: center; }

/* 筛选栏 */
.filter-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; }
.spacer { flex: 1; }
.cnt { font-size: 12px; color: var(--text-3); }

/* 服务器卡
   n-card 自带 word-break:break-word，CJK 的 min-content 宽就是一字。
   header-extra 里按钮一多，标题列被挤成单字宽，名字就竖排下来。 */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 14px; }
.srv-card { word-break: normal; overflow-wrap: break-word; }
.srv-card :deep(.n-card-header) {
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
}
.srv-card :deep(.n-card-header__main) {
  flex: 1 1 16rem;
  min-width: min(100%, 12rem);
}
.srv-card :deep(.n-card-header__extra) {
  flex: 0 0 auto;
  max-width: 100%;
}
.srv-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0; }
.dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.dot.online { background: var(--success); }
.dot.offline { background: var(--danger); }
/* 项目超链接：标题常态Apple蓝，悬浮下划线由共享链接合同维护。 */
.srv-name {
  cursor: pointer;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  font-weight: 650;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: keep-all;
}
.srv-name:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.asset-line { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
.tag-mini { padding: 2px 6px; background: var(--bg-soft); border-radius: 4px; font-size: 11px; color: var(--text-2); }
.tag-mini.danger { background: var(--danger-soft); color: var(--danger-text); }
.probe-job { margin-bottom: 10px; font-size: 12px; }
.probe-out { margin: 5px 0 0; white-space: pre-wrap; word-break: break-word; font: 11px/1.5 var(--ff-mono); }

.metric { margin-bottom: 8px; }
.m-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
.info-strip { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.traffic-total { margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--border); }
.traffic-split { display: flex; flex-wrap: wrap; gap: 4px 14px; color: var(--text-3); font-size: 11px; font-variant-numeric: tabular-nums; }
.traffic-warning { color: var(--warn-text); }
.asset-section-title { margin: 10px 0 12px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 650; }
.asset-form-hint { margin: -4px 0 14px 105px; color: var(--text-3); font-size: 11px; line-height: 1.65; }
.calibration-input { display: flex; width: 100%; gap: 8px; }
/* 展示信息模块：真实采集状态的中性说明，区分本机自动采集与远端探针。 */
.no-data { display: grid; justify-items: center; gap: 4px; text-align: center; color: var(--text-3); padding: 16px; font-size: 13px; }
.no-data strong { color: var(--text-2); font-size: 13px; font-weight: 600; }
.no-data span { color: var(--text-3); font-size: 11px; line-height: 1.5; }
.mini-chart-box { margin-top: 12px; }
.mini-chart { height: 160px; }

/* 路由切换组件：触摸选项扩大命中区，内轨与跟随面保持同心几何。 */
@media (pointer: coarse) {
  .range-switch.route-switch { min-height:52px; }
  .range-switch.route-switch button { min-height:44px; min-width:44px; }
}

@media (max-width: 768px) {
  .heatmap-card :deep(.n-card-header) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    align-items: start;
  }
  .heatmap-card :deep(.n-card-header__main),
  .heatmap-card :deep(.n-card-header__extra) {
    width: 100%;
    min-width: 0;
  }
  .heatmap-header-controls { justify-content: flex-start; }
  .card-grid { grid-template-columns: 1fr; }
  .sum-grid { grid-template-columns: repeat(2, 1fr); }
  .asset-form-hint { margin-left: 0; }
}
@media (min-width: 769px) and (max-width: 1180px) { .sum-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
