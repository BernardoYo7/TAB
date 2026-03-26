'use client'

import { useState, useMemo } from 'react'
import { List, Search, Inbox } from 'lucide-react'
import { ErrorRecord, TabType } from '@/lib/types'
import { ErrorCard } from '@/components/tab/error-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type FilterType = 'todos' | 'B' | 'L' | 'D' | 'pendente' | 'resolvido'
type PeriodType = 'todos' | 'hoje' | 'semana' | 'mes'

interface ErrorsSectionProps {
  errors: ErrorRecord[]
  onToggleResolved: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (error: ErrorRecord) => void
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'B', label: 'B - Banal' },
  { id: 'L', label: 'L - Lacuna' },
  { id: 'D', label: 'D - Descon.' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'resolvido', label: 'Resolvidos' },
]

const periods: { id: PeriodType; label: string }[] = [
  { id: 'todos', label: 'Todo periodo' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
]

export function ErrorsSection({ errors, onToggleResolved, onDelete, onEdit }: ErrorsSectionProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('todos')
  const [period, setPeriod] = useState<PeriodType>('todos')

  const filteredErrors = useMemo(() => {
    const today = new Date()
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    return errors.filter(e => {
      // Tab filter
      if (filter === 'B' && e.tab !== 'B') return false
      if (filter === 'L' && e.tab !== 'L') return false
      if (filter === 'D' && e.tab !== 'D') return false
      if (filter === 'pendente' && e.resolved) return false
      if (filter === 'resolvido' && !e.resolved) return false
      
      // Period filter
      if (period !== 'todos') {
        const ts = new Date(e.ts)
        if (period === 'hoje') {
          if (startOf(ts).getTime() !== startOf(today).getTime()) return false
        } else if (period === 'semana') {
          const diff = (startOf(today).getTime() - startOf(ts).getTime()) / 86400000
          if (diff > 6) return false
        } else if (period === 'mes') {
          if (ts.getMonth() !== today.getMonth() || ts.getFullYear() !== today.getFullYear()) return false
        }
      }
      
      // Search
      if (search.trim()) {
        const hay = `${e.materia} ${e.questao} ${e.descricao || ''} ${e.prova || ''}`.toLowerCase()
        if (!hay.includes(search.toLowerCase())) return false
      }
      
      return true
    })
  }, [errors, filter, period, search])

  return (
    <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-5 w-5 text-primary" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Erros
        </h2>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar erros..."
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-secondary border-primary text-foreground"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {periods.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              period === p.id
                ? "bg-secondary border-primary text-foreground"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      {filteredErrors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhum erro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredErrors.map(error => (
            <ErrorCard
              key={error.id}
              error={error}
              onToggleResolved={() => onToggleResolved(error.id)}
              onDelete={() => {
                if (confirm('Remover este registro?')) onDelete(error.id)
              }}
              onEdit={() => onEdit(error)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
