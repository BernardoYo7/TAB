'use client'

import { Plus, RotateCcw, List, Target, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabSection = 'registrar' | 'revisao' | 'erros' | 'pratica' | 'config'

interface NavigationProps {
  activeSection: TabSection
  onSectionChange: (section: TabSection) => void
  reviewCount?: number
}

const navItems: { id: TabSection; label: string; icon: typeof Plus }[] = [
  { id: 'registrar', label: 'Registrar', icon: Plus },
  { id: 'revisao', label: 'Revisao', icon: RotateCcw },
  { id: 'erros', label: 'Erros', icon: List },
  { id: 'pratica', label: 'Pratica', icon: Target },
  { id: 'config', label: 'Mais', icon: Settings },
]

export function Navigation({ activeSection, onSectionChange, reviewCount = 0 }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/97 backdrop-blur-sm">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          const showBadge = item.id === 'revisao' && reviewCount > 0
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-tab-d text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {reviewCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
