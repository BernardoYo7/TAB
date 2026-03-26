'use client'

import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'
import { ErrorRecord, StreakData, REVIEW_INTERVALS } from '@/lib/types'

const STORE_KEY = 'tab_erros_v3'
const STREAK_KEY = 'tab_streak_v3'

export function useTabStore() {
  const [errors, setErrors, errorsLoaded] = useLocalStorage<ErrorRecord[]>(STORE_KEY, [])
  const [streakData, setStreakData, streakLoaded] = useLocalStorage<StreakData>(STREAK_KEY, {
    streak: 0,
    lastDate: ''
  })

  const isLoaded = errorsLoaded && streakLoaded

  const addError = useCallback((error: Omit<ErrorRecord, 'id' | 'ts' | 'data' | 'resolved' | 'revisoes'>) => {
    const now = new Date()
    const newError: ErrorRecord = {
      ...error,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ts: now.getTime(),
      data: now.toLocaleDateString('pt-BR'),
      resolved: false,
      revisoes: []
    }
    
    setErrors(prev => [newError, ...prev])
    
    // Update streak
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    setStreakData(prev => {
      if (prev.lastDate === today) return prev
      if (prev.lastDate === yesterday) {
        return { streak: prev.streak + 1, lastDate: today }
      }
      return { streak: 1, lastDate: today }
    })
    
    return newError
  }, [setErrors, setStreakData])

  const updateError = useCallback((id: string, updates: Partial<ErrorRecord>) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [setErrors])

  const deleteError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }, [setErrors])

  const toggleResolved = useCallback((id: string) => {
    setErrors(prev => prev.map(e => 
      e.id === id ? { ...e, resolved: !e.resolved } : e
    ))
  }, [setErrors])

  const markReviewed = useCallback((id: string) => {
    setErrors(prev => prev.map(e => 
      e.id === id ? { ...e, revisoes: [...e.revisoes, Date.now()] } : e
    ))
  }, [setErrors])

  const getNextReviewDate = useCallback((error: ErrorRecord): Date => {
    const intervals = REVIEW_INTERVALS[error.tab]
    const idx = Math.min(error.revisoes.length, intervals.length - 1)
    const interval = intervals[idx]
    const base = error.revisoes.length > 0 ? error.revisoes[error.revisoes.length - 1] : error.ts
    return new Date(base + interval * 86400000)
  }, [])

  const isDueForReview = useCallback((error: ErrorRecord): boolean => {
    if (error.resolved) return false
    if (error.tab === 'B' && error.revisoes.length >= REVIEW_INTERVALS.B.length) return false
    return getNextReviewDate(error) <= new Date()
  }, [getNextReviewDate])

  const dueForReview = useMemo(() => {
    const TAB_PRIORITY = { D: 0, L: 1, B: 2 }
    return errors
      .filter(isDueForReview)
      .sort((a, b) => TAB_PRIORITY[a.tab] - TAB_PRIORITY[b.tab])
  }, [errors, isDueForReview])

  const stats = useMemo(() => {
    const total = errors.length
    const resolved = errors.filter(e => e.resolved).length
    const byTab = {
      B: errors.filter(e => e.tab === 'B').length,
      L: errors.filter(e => e.tab === 'L').length,
      D: errors.filter(e => e.tab === 'D').length
    }
    const materias = [...new Set(errors.map(e => e.materia))]
    const provas = [...new Set(errors.map(e => e.prova).filter(Boolean))]
    
    return { total, resolved, byTab, materias, provas }
  }, [errors])

  const clearAll = useCallback(() => {
    setErrors([])
    setStreakData({ streak: 0, lastDate: '' })
  }, [setErrors, setStreakData])

  return {
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
    isDueForReview,
    clearAll
  }
}
