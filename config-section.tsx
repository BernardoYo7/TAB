'use client'

import { useMemo } from 'react'
import { Settings, Flame, Download, FileText, AlertTriangle, Clock, Trash2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorRecord } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ConfigSectionProps {
  errors: ErrorRecord[]
  streak: number
  stats: {
    total: number
    resolved: number
    byTab: { B: number; L: number; D: number }
    materias: string[]
    provas: string[]
  }
  onClearAll: () => void
}

export function ConfigSection({ errors, streak, stats, onClearAll }: ConfigSectionProps) {
  // Bar chart data
  const tabPercentages = useMemo(() => {
    const total = stats.total || 1
    return {
      B: Math.round((stats.byTab.B / total) * 100),
      L: Math.round((stats.byTab.L / total) * 100),
      D: Math.round((stats.byTab.D / total) * 100)
    }
  }, [stats])

  // Evolution chart (last 7 days)
  const evolutionData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const ds = d.toDateString()
      const cnt = errors.filter(x => new Date(x.ts).toDateString() === ds).length
      days.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        count: cnt
      })
    }
    return days
  }, [errors])

  const maxEvolution = Math.max(...evolutionData.map(d => d.count), 1)

  // Materias sorted by D errors
  const materiasByErrors = useMemo(() => {
    const map: Record<string, { total: number; d: number }> = {}
    errors.forEach(e => {
      if (!map[e.materia]) map[e.materia] = { total: 0, d: 0 }
      map[e.materia].total++
      if (e.tab === 'D') map[e.materia].d++
    })
    return Object.entries(map)
      .sort((a, b) => b[1].d - a[1].d || b[1].total - a[1].total)
      .slice(0, 5)
  }, [errors])

  // Export function
  const exportData = (type: 'all' | 'D' | 'pending') => {
    let lista = errors
    let titulo = 'Todos os erros'
    
    if (type === 'D') {
      lista = errors.filter(d => d.tab === 'D')
      titulo = 'Erros tipo D (Desconhecimento total)'
    } else if (type === 'pending') {
      lista = errors.filter(d => !d.resolved)
      titulo = 'Erros pendentes'
    }
    
    if (lista.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }
    
    const labels = { B: 'Banalidade', L: 'Lacuna', D: 'Desconhecimento total' }
    let txt = `METODO TAB - ${titulo}\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal: ${lista.length} erros\n\n${'='.repeat(50)}\n\n`
    
    lista.forEach((d, i) => {
      txt += `${i + 1}. [${d.tab} - ${labels[d.tab]}] ${d.materia}\n`
      if (d.prova) txt += `   Prova: ${d.prova}\n`
      txt += `   Questao/Topico: ${d.questao}\n`
      if (d.descricao) txt += `   Erro: ${d.descricao}\n`
      if (d.gabarito) txt += `   Correto: ${d.gabarito}\n`
      txt += `   Data: ${d.data} | Status: ${d.resolved ? 'Resolvido' : 'Pendente'}\n\n`
    })
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TAB_${type}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Mais opcoes
        </h2>
      </div>
      
      {/* Streak Card */}
      <div className="rounded-xl bg-gradient-to-br from-tab-b/10 to-tab-b/5 border border-tab-b/20 p-4 text-center">
        <div className="text-4xl mb-1">🔥</div>
        <div className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-tab-b">
          {streak}
        </div>
        <div className="text-sm text-muted-foreground">
          {streak === 1 ? 'dia consecutivo' : 'dias consecutivos'} registrando erros
        </div>
      </div>
      
      {/* Analytics Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Estatisticas</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <AnalyticsCard value={stats.total} label="Total de erros" />
          <AnalyticsCard value={stats.resolved} label="Resolvidos" />
          <AnalyticsCard value={stats.materias.length} label="Materias" />
          <AnalyticsCard value={stats.provas.length} label="Provas" />
        </div>
        
        {/* TAB Distribution */}
        <div className="rounded-lg border border-border bg-card p-4 mb-3">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Distribuicao TAB</h4>
          <div className="space-y-2.5">
            <BarRow letter="B" percentage={tabPercentages.B} color="tab-b" />
            <BarRow letter="L" percentage={tabPercentages.L} color="tab-l" />
            <BarRow letter="D" percentage={tabPercentages.D} color="tab-d" />
          </div>
        </div>
        
        {/* Evolution Chart */}
        <div className="rounded-lg border border-border bg-card p-4 mb-3">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Evolucao (7 dias)</h4>
          <div className="flex items-end gap-1 h-16">
            {evolutionData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/70 rounded-t"
                  style={{ height: `${(day.count / maxEvolution) * 100}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                />
                <span className="text-[9px] text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Por Materia */}
        {materiasByErrors.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Por materia (mais D)</h4>
            <div className="space-y-2">
              {materiasByErrors.map(([materia, data]) => (
                <div key={materia} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <span className="text-sm truncate">{materia}</span>
                  <span className="font-[family-name:var(--font-display)] font-bold text-sm text-primary">
                    {data.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Export Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Exportar</h3>
        </div>
        
        <div className="space-y-2">
          <ExportButton
            icon={FileText}
            title="Exportar todos os erros"
            description="Gera arquivo de texto com todos os registros"
            onClick={() => exportData('all')}
          />
          <ExportButton
            icon={AlertTriangle}
            title="Exportar so tipo D"
            description="Apenas desconhecimento total - para revisao focada"
            onClick={() => exportData('D')}
            iconColor="text-tab-d"
          />
          <ExportButton
            icon={Clock}
            title="Exportar pendentes"
            description="Erros ainda nao resolvidos"
            onClick={() => exportData('pending')}
          />
        </div>
      </div>
      
      {/* Danger Zone */}
      <div>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Apagar TODOS os dados? Esta acao nao pode ser desfeita.')) {
              onClearAll()
            }
          }}
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Apagar todos os dados
        </Button>
      </div>
    </section>
  )
}

function AnalyticsCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}

function BarRow({ letter, percentage, color }: { letter: string; percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("font-[family-name:var(--font-display)] font-bold w-5", `text-${color}`)}>
        {letter}
      </span>
      <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", `bg-${color}`)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
    </div>
  )
}

function ExportButton({
  icon: Icon,
  title,
  description,
  onClick,
  iconColor = 'text-muted-foreground'
}: {
  icon: typeof FileText
  title: string
  description: string
  onClick: () => void
  iconColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary active:bg-accent"
    >
      <Icon className={cn("h-6 w-6 shrink-0", iconColor)} />
      <div>
        <div className="font-[family-name:var(--font-display)] font-bold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </button>
  )
}
