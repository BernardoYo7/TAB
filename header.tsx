'use client'

import { Flame } from 'lucide-react'

interface HeaderProps {
  streak: number
  stats: {
    byTab: { B: number; L: number; D: number }
  }
}

export function Header({ streak, stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-0.5">
            <span className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              <span className="text-tab-b">T</span>
              <span className="text-tab-l">A</span>
              <span className="text-tab-d">B</span>
            </span>
            <span className="ml-2 text-xs text-muted-foreground">metodo de erros</span>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-full bg-tab-b-soft border border-tab-b/25 px-3 py-1.5">
            <Flame className="h-4 w-4 text-tab-b" />
            <span className="text-xs font-medium text-tab-b">
              {streak} {streak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="B - Banal" value={stats.byTab.B} type="B" />
          <StatCard label="L - Lacuna" value={stats.byTab.L} type="L" />
          <StatCard label="D - Descon." value={stats.byTab.D} type="D" />
        </div>
      </div>
    </header>
  )
}

function StatCard({ label, value, type }: { label: string; value: number; type: 'B' | 'L' | 'D' }) {
  const colors = {
    B: 'bg-tab-b-soft border-tab-b/20 text-tab-b',
    L: 'bg-tab-l-soft border-tab-l/20 text-tab-l',
    D: 'bg-tab-d-soft border-tab-d/20 text-tab-d'
  }
  
  return (
    <div className={`rounded-lg border p-2 text-center ${colors[type]}`}>
      <div className="font-[family-name:var(--font-display)] text-xl font-extrabold">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
