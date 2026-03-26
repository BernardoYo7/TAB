export type TabType = 'B' | 'L' | 'D'

export interface ErrorRecord {
  id: string
  materia: string
  prova?: string
  questao: string
  descricao?: string
  gabarito?: string
  tab: TabType
  data: string
  ts: number
  resolved: boolean
  revisoes: number[]
}

export interface StreakData {
  streak: number
  lastDate: string
}

export const TAB_LABELS: Record<TabType, string> = {
  B: 'Banalidade',
  L: 'Lacuna',
  D: 'Desconhecimento'
}

export const TAB_DESCRIPTIONS: Record<TabType, string> = {
  B: 'Erro por falta de atencao ou descuido',
  L: 'Lacuna de conhecimento parcial',
  D: 'Desconhecimento total do assunto'
}

export const REVIEW_INTERVALS: Record<TabType, number[]> = {
  B: [1],
  L: [1, 3],
  D: [1, 3, 7]
}
