'use client'

import { RotateCcw, Sparkles, Calendar } from 'lucide-react'
import { ErrorRecord, REVIEW_INTERVALS } from '@/lib/types'
import { ErrorCard } from '@/components/tab/error-card'

interface ReviewSectionProps {
  dueForReview: ErrorRecord[]
  errors: ErrorRecord[]
  getNextReviewDate: (error: ErrorRecord) => Date
  onToggleResolved: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (error: ErrorRecord) => void
  onMarkReviewed: (id: string) => void
}

export function ReviewSection({
  dueForReview,
  errors,
  getNextReviewDate,
  onToggleResolved,
  onDelete,
  onEdit,
  onMarkReviewed
}: ReviewSectionProps) {
  // Get upcoming reviews (next 3 days)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const upcoming = errors.filter(e => {
    if (e.resolved) return false
    if (dueForReview.some(d => d.id === e.id)) return false
    
    const prox = getNextReviewDate(e)
    const ps = new Date(prox)
    ps.setHours(0, 0, 0, 0)
    const diff = Math.round((ps.getTime() - todayStart.getTime()) / 86400000)
    return diff >= 0 && diff <= 3
  })

  const getReviewLabel = (error: ErrorRecord) => {
    const prox = getNextReviewDate(error)
    const ps = new Date(prox)
    ps.setHours(0, 0, 0, 0)
    const diff = Math.round((ps.getTime() - todayStart.getTime()) / 86400000)
    
    if (diff === 0) return 'hoje'
    if (diff === 1) return 'amanha'
    return `em ${diff} dias`
  }

  const isEmpty = dueForReview.length === 0 && upcoming.length === 0

  return (
    <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="h-5 w-5 text-primary" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Revisao espacada
        </h2>
      </div>
      
      {isEmpty ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma revisao pendente agora.</p>
          <p className="text-sm">Continue registrando seus erros!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dueForReview.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="h-2 w-2 rounded-full bg-tab-d animate-pulse" />
                <h3 className="text-sm font-semibold text-tab-d">
                  Para revisar HOJE ({dueForReview.length})
                </h3>
                <span className="text-xs text-muted-foreground">Ordem: D - L - B</span>
              </div>
              
              <div className="space-y-3">
                {dueForReview.map(error => (
                  <ErrorCard
                    key={error.id}
                    error={error}
                    showReviewButton
                    onToggleResolved={() => onToggleResolved(error.id)}
                    onDelete={() => {
                      if (confirm('Remover este registro?')) onDelete(error.id)
                    }}
                    onEdit={() => onEdit(error)}
                    onMarkReviewed={() => onMarkReviewed(error.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Proximos dias
                </h3>
              </div>
              
              <div className="space-y-3">
                {upcoming.map(error => (
                  <ErrorCard
                    key={error.id}
                    error={error}
                    reviewLabel={getReviewLabel(error)}
                    onToggleResolved={() => onToggleResolved(error.id)}
                    onDelete={() => {
                      if (confirm('Remover este registro?')) onDelete(error.id)
                    }}
                    onEdit={() => onEdit(error)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
