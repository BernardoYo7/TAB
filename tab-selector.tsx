'use client'

import { cn } from '@/lib/utils'
import { TabType, TAB_LABELS, TAB_DESCRIPTIONS } from '@/lib/types'

interface TabSelectorProps {
  selected: TabType
  onSelect: (tab: TabType) => void
}

const tabs: TabType[] = ['B', 'L', 'D']

export function TabSelector({ selected, onSelect }: TabSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {tabs.map(tab => {
        const isSelected = selected === tab
        const colors = {
          B: {
            bg: 'bg-tab-b-soft',
            border: isSelected ? 'border-tab-b' : 'border-transparent',
            text: 'text-tab-b',
            shadow: isSelected ? 'shadow-[0_0_16px_rgba(234,179,8,0.2)]' : ''
          },
          L: {
            bg: 'bg-tab-l-soft',
            border: isSelected ? 'border-tab-l' : 'border-transparent',
            text: 'text-tab-l',
            shadow: isSelected ? 'shadow-[0_0_16px_rgba(96,165,250,0.2)]' : ''
          },
          D: {
            bg: 'bg-tab-d-soft',
            border: isSelected ? 'border-tab-d' : 'border-transparent',
            text: 'text-tab-d',
            shadow: isSelected ? 'shadow-[0_0_16px_rgba(248,113,113,0.2)]' : ''
          }
        }
        
        const color = colors[tab]
        
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={cn(
              "rounded-xl border-2 p-3.5 text-center transition-all",
              color.bg,
              color.border,
              color.shadow
            )}
          >
            <div className={cn(
              "font-[family-name:var(--font-display)] text-2xl font-extrabold",
              color.text
            )}>
              {tab}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground leading-tight">
              {TAB_DESCRIPTIONS[tab].split(' ').slice(0, 3).join(' ')}
            </div>
          </button>
        )
      })}
    </div>
  )
}
