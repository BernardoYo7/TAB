'use client'

import { Check, Pencil, Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ErrorRecord, TAB_LABELS, REVIEW_INTERVALS } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ErrorCardProps {
  error: ErrorRecord
  showReviewButton?: boolean
  reviewLabel?: string
  onToggleResolved: () => void
  onDelete: () => void
  onEdit: () => void
  onMarkReviewed?: () => void
}

export function ErrorCard({
  error,
  showReviewButton = false,
  reviewLabel,
  onToggleResolved,
  onDelete,
  onEdit,
  onMarkReviewed
}: ErrorCardProps) {
  const [showGabarito, setShowGabarito] = useState(false)
  
  const borderColors = {
    B: 'before:bg-tab-b',
    L: 'before:bg-tab-l',
    D: 'before:bg-tab-d'
  }
  
  const badgeColors = {
    B: 'bg-tab-b-soft text-tab-b',
    L: 'bg-tab-l-soft text-tab-l',
    D: 'bg-tab-d-soft text-tab-d'
  }
  
  const revCount = error.revisoes.length
  const intervals = REVIEW_INTERVALS[error.tab]
  const totalRevs = intervals.length
  const revStatus = revCount >= totalRevs ? 'Revisado' : `Rev. ${revCount}/${totalRevs}`

  return (
    <div className={cn(
      "relative rounded-xl border border-border bg-card p-3.5 overflow-hidden transition-transform active:scale-[0.99]",
      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-xl",
      borderColors[error.tab],
      error.resolved && "opacity-55"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={cn(
            "font-[family-name:var(--font-display)] text-[10px] font-bold px-2 py-0.5 rounded-full",
            badgeColors[error.tab]
          )}>
            {error.tab} - {TAB_LABELS[error.tab]}
          </span>
          
          {error.resolved && (
            <span className="bg-success-soft text-success text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Resolvido
            </span>
          )}
          
          {reviewLabel && (
            <span className="bg-success-soft text-success text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {reviewLabel}
            </span>
          )}
        </div>
        
        <div className="text-right text-[10px] text-muted-foreground leading-tight">
          <div>{error.data}</div>
          <div>{revStatus}</div>
        </div>
      </div>
      
      <h3 className="font-[family-name:var(--font-display)] font-bold text-sm mb-0.5">
        {error.materia}
      </h3>
      
      <p className="text-sm text-foreground mb-1">{error.questao}</p>
      
      {error.prova && (
        <p className="text-xs text-muted-foreground mb-1.5">
          {error.prova}
        </p>
      )}
      
      {error.descricao && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          {error.descricao}
        </p>
      )}
      
      {error.gabarito && (
        <div className="mb-2">
          {showReviewButton ? (
            <>
              <button
                onClick={() => setShowGabarito(!showGabarito)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showGabarito ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showGabarito ? 'Ocultar resposta' : 'Ver resposta'}
              </button>
              {showGabarito && (
                <div className="mt-2 rounded-lg bg-success-soft border border-success/20 p-2.5 text-xs leading-relaxed">
                  {error.gabarito}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-success-soft border border-success/20 p-2.5 text-xs leading-relaxed">
              {error.gabarito}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-1.5 flex-wrap">
        {showReviewButton && onMarkReviewed && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkReviewed}
            className="h-7 text-xs bg-success-soft border-success/30 text-success hover:bg-success/20"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Revisei
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleResolved}
          className="h-7 text-xs"
        >
          {error.resolved ? (
            <>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reabrir
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Resolver
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" onClick={onEdit} className="h-7 text-xs">
          <Pencil className="h-3 w-3" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={onDelete} className="h-7 text-xs text-destructive hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
