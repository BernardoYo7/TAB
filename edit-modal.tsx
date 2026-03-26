'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TabSelector } from './tab-selector'
import { ErrorRecord, TabType } from '@/lib/types'

interface EditModalProps {
  error: ErrorRecord | null
  onClose: () => void
  onSave: (id: string, updates: Partial<ErrorRecord>) => void
}

export function EditModal({ error, onClose, onSave }: EditModalProps) {
  const [materia, setMateria] = useState('')
  const [prova, setProva] = useState('')
  const [questao, setQuestao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [gabarito, setGabarito] = useState('')
  const [tab, setTab] = useState<TabType>('B')

  useEffect(() => {
    if (error) {
      setMateria(error.materia)
      setProva(error.prova || '')
      setQuestao(error.questao)
      setDescricao(error.descricao || '')
      setGabarito(error.gabarito || '')
      setTab(error.tab)
    }
  }, [error])

  const handleSave = () => {
    if (!error) return
    
    onSave(error.id, {
      materia: materia.trim(),
      prova: prova.trim() || undefined,
      questao: questao.trim(),
      descricao: descricao.trim() || undefined,
      gabarito: gabarito.trim() || undefined,
      tab
    })
    onClose()
  }

  if (!error) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-h-[85vh] bg-card border-t border-border rounded-t-2xl p-4 pb-8 overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Editar registro
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Materia
            </label>
            <Input value={materia} onChange={e => setMateria(e.target.value)} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Prova / Simulado
            </label>
            <Input value={prova} onChange={e => setProva(e.target.value)} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Questao / Topico
            </label>
            <Input value={questao} onChange={e => setQuestao(e.target.value)} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Descricao do erro
            </label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Gabarito / Resposta correta
            </label>
            <Textarea value={gabarito} onChange={e => setGabarito(e.target.value)} rows={2} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Classificacao TAB
            </label>
            <TabSelector selected={tab} onSelect={setTab} />
          </div>
          
          <Button onClick={handleSave} className="w-full" size="lg">
            Salvar alteracoes
          </Button>
        </div>
      </div>
    </div>
  )
}
