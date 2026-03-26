'use client'

import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TabSelector } from '@/components/tab/tab-selector'
import { TabType } from '@/lib/types'

interface RegisterSectionProps {
  onSave: (data: {
    materia: string
    prova?: string
    questao: string
    descricao?: string
    gabarito?: string
    tab: TabType
  }) => void
}

export function RegisterSection({ onSave }: RegisterSectionProps) {
  const [materia, setMateria] = useState('')
  const [prova, setProva] = useState('')
  const [questao, setQuestao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [gabarito, setGabarito] = useState('')
  const [tab, setTab] = useState<TabType>('B')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!materia.trim() || !questao.trim()) return
    
    onSave({
      materia: materia.trim(),
      prova: prova.trim() || undefined,
      questao: questao.trim(),
      descricao: descricao.trim() || undefined,
      gabarito: gabarito.trim() || undefined,
      tab
    })
    
    // Reset form
    setMateria('')
    setProva('')
    setQuestao('')
    setDescricao('')
    setGabarito('')
    setTab('B')
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="h-5 w-5 text-primary" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Novo erro
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Materia / Disciplina
          </label>
          <Input
            value={materia}
            onChange={e => setMateria(e.target.value)}
            placeholder="Ex: Matematica, Portugues..."
            required
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Prova / Simulado (opcional)
          </label>
          <Input
            value={prova}
            onChange={e => setProva(e.target.value)}
            placeholder="Ex: ENEM 2023, Simulado Abril..."
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Questao ou topico
          </label>
          <Input
            value={questao}
            onChange={e => setQuestao(e.target.value)}
            placeholder="Ex: Questao 45 - Funcoes"
            required
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Descreva o erro (opcional)
          </label>
          <Textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="O que voce errou? Como foi o raciocinio?"
            rows={3}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Resposta correta / Gabarito (opcional)
          </label>
          <Textarea
            value={gabarito}
            onChange={e => setGabarito(e.target.value)}
            placeholder="Qual era a resposta certa?"
            rows={2}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Classificacao TAB
          </label>
          <TabSelector selected={tab} onSelect={setTab} />
        </div>
        
        <Button type="submit" className="w-full" size="lg">
          Salvar erro
        </Button>
      </form>
    </section>
  )
}
