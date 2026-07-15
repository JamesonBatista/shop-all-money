import type { InvestmentOption } from '../types'
import { DAILY_YIELD_RATE } from '../types'

export const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    id: 'cdb-bankshop',
    name: 'CDB Bank Shop',
    description: 'Renda diária com liquidez no vencimento do ciclo de 24h.',
    dailyRate: DAILY_YIELD_RATE,
    risk: 'baixo',
  },
  {
    id: 'renda-plus',
    name: 'Renda Plus',
    description: 'Carteira conservadora com crédito diário automático no login.',
    dailyRate: DAILY_YIELD_RATE,
    risk: 'moderado',
  },
  {
    id: 'fundo-diario',
    name: 'Fundo Diário',
    description: 'Aplicação ágil — 0,5% ao dia sobre o valor investido.',
    dailyRate: DAILY_YIELD_RATE,
    risk: 'arrojado',
  },
]
