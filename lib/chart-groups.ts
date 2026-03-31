/**
 * Chart Groups Configuration
 * Defines the grouping of charts for different analytical perspectives
 */

export type ChartGroupId = 'market-analysis' | 'coherent-opportunity' | 'customer-intelligence' | 'distributor-intelligence' | 'import-analysis' | 'import-pricing'

export interface ChartGroup {
  id: ChartGroupId
  label: string
  description: string
  charts: string[] // Chart identifiers that belong to this group
  icon?: string
}

export const CHART_GROUPS: ChartGroup[] = [
  {
    id: 'market-analysis',
    label: 'Demand Analysis',
    description: 'Core market metrics and trends',
    charts: ['grouped-bar', 'multi-line', 'heatmap', 'comparison-table', 'waterfall'],
    icon: '📊'
  },
{
    id: 'customer-intelligence',
    label: 'Customer Intelligence',
    description: 'Key customer profiles and procurement details',
    charts: ['customer-intel-table'],
    icon: '👥'
  },
  {
    id: 'distributor-intelligence',
    label: 'Distributor Intelligence',
    description: 'Key distributor profiles and product portfolios',
    charts: ['distributor-intel-table'],
    icon: '🏭'
  },
  {
    id: 'import-analysis',
    label: 'Import Analysis',
    description: 'Imports by regions and supplying countries',
    charts: ['import-analysis-table'],
    icon: '📦'
  },
  {
    id: 'import-pricing',
    label: 'Import Pricing',
    description: 'Import pricing by regions and supplying countries',
    charts: ['import-pricing-table'],
    icon: '💰'
  }
]

export const DEFAULT_CHART_GROUP: ChartGroupId = 'market-analysis'

/**
 * Get chart group by ID
 */
export function getChartGroup(id: ChartGroupId): ChartGroup | undefined {
  return CHART_GROUPS.find(group => group.id === id)
}

/**
 * Check if a chart belongs to a group
 */
export function isChartInGroup(chartId: string, groupId: ChartGroupId): boolean {
  const group = getChartGroup(groupId)
  return group ? group.charts.includes(chartId) : false
}

/**
 * Get all charts for a group
 */
export function getChartsForGroup(groupId: ChartGroupId): string[] {
  const group = getChartGroup(groupId)
  return group ? group.charts : []
}
