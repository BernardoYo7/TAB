'use client'

import { useState, useCallback } from 'react'
import { useTabStore } from '@/hooks/use-tab-store'
import { Header } from '@/components/tab/header'
import { Navigation, TabSection } from '@/components/tab/navigation'
import { RegisterSection } from '@/components/tab/sections/register-section'
import { ReviewSection } from '@/components/tab/sections/review-section'
import { ErrorsSection } from '@/components/tab/sections/errors-section'
import { PracticeSection } from '@/components/tab/sections/practice-section'
import { ConfigSection } from '@/components/tab/sections/config-section'
import { EditModal } from '@/components/tab/edit-modal'
import { ErrorRecord, TabType } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function TabApp() {
  const [activeSection, setActiveSection] = useState<TabSection>('registrar')
  const [editingError, setEditingError] = useState<ErrorRecord | null>(null)
  
  const {
    errors,
    streakData,
    isLoaded,
    stats,
    dueForReview,
    addError,
    updateError,
    deleteError,
    toggleResolved,
    markReviewed,
    getNextReviewDate,
    clearAll
  } = useTabStore()

  const handleSave = useCallback((data: {
    materia: string
    prova?: string
    questao: string
    descricao?: string
    gabarito?: string
    tab: TabType
  }) => {
    addError(data)
    // Show toast or feedback
  }, [addError])

  const handleAddErrorFromPractice = useCallback((data: {
    materia: string
    questao: string
    descricao?: string
    gabarito?: string
    tab: TabType
  }) => {
    addError(data)
    setActiveSection('erros')
  }, [addError])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header streak={streakData.streak} stats={stats} />
      
      <main className="p-4">
        {activeSection === 'registrar' && (
          <RegisterSection onSave={handleSave} />
        )}
        
        {activeSection === 'revisao' && (
          <ReviewSection
            dueForReview={dueForReview}
            errors={errors}
            getNextReviewDate={getNextReviewDate}
            onToggleResolved={toggleResolved}
            onDelete={deleteError}
            onEdit={setEditingError}
            onMarkReviewed={markReviewed}
          />
        )}
        
        {activeSection === 'erros' && (
          <ErrorsSection
            errors={errors}
            onToggleResolved={toggleResolved}
            onDelete={deleteError}
            onEdit={setEditingError}
          />
        )}
        
        {activeSection === 'pratica' && (
          <PracticeSection onAddError={handleAddErrorFromPractice} />
        )}
        
        {activeSection === 'config' && (
          <ConfigSection
            errors={errors}
            streak={streakData.streak}
            stats={stats}
            onClearAll={clearAll}
          />
        )}
      </main>
      
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        reviewCount={dueForReview.length}
      />
      
      <EditModal
        error={editingError}
        onClose={() => setEditingError(null)}
        onSave={updateError}
      />
    </div>
  )
}
