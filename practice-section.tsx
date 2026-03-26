'use client'

import { useState, useEffect } from 'react'
import { Target, Search, Loader2, Sparkles, CheckCircle, XCircle, Lightbulb, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TabType } from '@/lib/types'
import { AISettings, useAIConfig, AIProvider } from '../ai-settings'

type Level = 'iniciante' | 'intermediario' | 'avancado'

interface Question {
  enunciado: string
  alternativas: string[]
  gabarito: number
  explicacao: string
  conceito: string
  dica: string
}

interface PracticeSectionProps {
  onAddError: (data: {
    materia: string
    questao: string
    descricao?: string
    gabarito?: string
    tab: TabType
  }) => void
}

const levelInfo: Record<Level, { label: string; icon: string; desc: string }> = {
  iniciante: { label: 'Iniciante', icon: '🌱', desc: 'Explicacoes do zero, linguagem simples' },
  intermediario: { label: 'Intermediario', icon: '📈', desc: 'Assume conhecimento basico' },
  avancado: { label: 'Avancado', icon: '🔥', desc: 'Direto ao ponto, tecnico' }
}

const systemPrompt = `Voce e um professor especialista em preparacao para o ENEM e vestibulares brasileiros.
Gere uma questao de multipla escolha sobre o tema solicitado, no estilo ENEM.

IMPORTANTE: Responda APENAS com JSON valido, sem texto adicional antes ou depois. Use este formato exato:
{
  "enunciado": "texto da questao com contexto relevante e bem elaborado",
  "alternativas": ["A) primeira opcao", "B) segunda opcao", "C) terceira opcao", "D) quarta opcao", "E) quinta opcao"],
  "gabarito": 0,
  "explicacao": "explicacao detalhada e didatica da resposta correta",
  "conceito": "conceito-chave testado nesta questao",
  "dica": "dica pratica para nao errar questoes similares no ENEM"
}

O campo "gabarito" deve ser o indice da alternativa correta (0 para A, 1 para B, etc).`

async function generateWithGemini(apiKey: string, tema: string, level: Level): Promise<Question> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nTema: ${tema}\nNivel do estudante: ${level}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao gerar questao')
  }
  
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!text) throw new Error('Resposta vazia da IA')
  
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta invalida da IA')
  
  return JSON.parse(jsonMatch[0])
}

async function generateWithGroq(apiKey: string, tema: string, level: Level): Promise<Question> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: ${tema}\nNivel do estudante: ${level}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao gerar questao')
  }
  
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  
  if (!text) throw new Error('Resposta vazia da IA')
  
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta invalida da IA')
  
  return JSON.parse(jsonMatch[0])
}

export function PracticeSection({ onAddError }: PracticeSectionProps) {
  const { config, saveConfig, clearConfig } = useAIConfig()
  const [tema, setTema] = useState('')
  const [level, setLevel] = useState<Level>('iniciante')
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const generateQuestion = async () => {
    if (!tema.trim() || !config) return
    
    setLoading(true)
    setError(null)
    setQuestion(null)
    setSelectedAnswer(null)
    setShowFeedback(false)
    
    try {
      let q: Question
      
      if (config.provider === 'gemini') {
        q = await generateWithGemini(config.apiKey, tema, level)
      } else {
        q = await generateWithGroq(config.apiKey, tema, level)
      }
      
      setQuestion(q)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar questao')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowFeedback(true)
  }

  const isCorrect = selectedAnswer === question?.gabarito

  const handleAddError = () => {
    if (!question) return
    
    onAddError({
      materia: tema,
      questao: question.enunciado.substring(0, 100) + '...',
      descricao: `Errei a alternativa ${String.fromCharCode(65 + (selectedAnswer || 0))}`,
      gabarito: `Resposta: ${String.fromCharCode(65 + question.gabarito)}. ${question.explicacao}`,
      tab: 'L'
    })
  }

  const resetPractice = () => {
    setQuestion(null)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setError(null)
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Pratica de questoes
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(showSettings && "bg-secondary")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {/* AI Settings */}
      {showSettings && (
        <div className="mb-6 pb-6 border-b border-border">
          <AISettings config={config} onSave={saveConfig} onClear={clearConfig} />
        </div>
      )}
      
      {/* No API key configured */}
      {!config && !showSettings && (
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Configure sua chave de API para usar a pratica com IA
          </p>
          <Button onClick={() => setShowSettings(true)}>
            Configurar IA
          </Button>
        </div>
      )}
      
      {/* Main practice UI */}
      {config && !showSettings && (
        <>
          {/* Level selector */}
          <div className="mb-4">
            <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2 block">
              Meu nivel nesta materia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(levelInfo) as [Level, typeof levelInfo.iniciante][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setLevel(key)}
                  className={cn(
                    "rounded-lg border p-2 text-center transition-all",
                    level === key
                      ? "bg-secondary border-primary"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="text-lg">{info.icon}</span>
                  <div className="text-xs font-medium mt-0.5">{info.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{levelInfo[level].desc}</p>
          </div>
          
          {!question ? (
            <>
              <div className="flex gap-2 mb-4">
                <Input
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="Digite o tema (ex: Funcoes quadraticas)"
                  onKeyDown={e => e.key === 'Enter' && generateQuestion()}
                />
                <Button onClick={generateQuestion} disabled={loading || !tema.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              {loading && (
                <div className="flex items-center gap-3 p-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Gerando questao com IA...</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Question */}
              <div className="rounded-lg bg-card border border-border p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">Questao gerada por IA</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.enunciado}</p>
              </div>
              
              {/* Alternatives */}
              <div className="space-y-2">
                {question.alternativas.map((alt, i) => {
                  const isSelected = selectedAnswer === i
                  const isCorrectAnswer = i === question.gabarito
                  const showResult = showFeedback
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showFeedback}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 transition-all flex items-start gap-3",
                        !showResult && "hover:border-primary/50",
                        showResult && isCorrectAnswer && "border-success bg-success-soft",
                        showResult && isSelected && !isCorrectAnswer && "border-destructive bg-destructive/10"
                      )}
                    >
                      <span className={cn(
                        "font-[family-name:var(--font-display)] font-bold text-sm shrink-0",
                        showResult && isCorrectAnswer && "text-success",
                        showResult && isSelected && !isCorrectAnswer && "text-destructive"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{alt.replace(/^[A-E]\)\s*/, '')}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Feedback */}
              {showFeedback && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className={cn(
                    "rounded-lg border p-4",
                    isCorrect 
                      ? "bg-success-soft border-success/30" 
                      : "bg-destructive/10 border-destructive/30"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-success" />
                          <span className="font-semibold text-success">Correto!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="font-semibold text-destructive">Incorreto</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{question.explicacao}</p>
                  </div>
                  
                  {question.conceito && (
                    <div className="rounded-lg bg-tab-l-soft border border-tab-l/20 p-3">
                      <div className="text-xs uppercase tracking-wide text-tab-l font-semibold mb-1">
                        Conceito-chave
                      </div>
                      <p className="text-sm">{question.conceito}</p>
                    </div>
                  )}
                  
                  {question.dica && (
                    <div className="rounded-lg bg-tab-b-soft border border-tab-b/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="h-3.5 w-3.5 text-tab-b" />
                        <span className="text-xs uppercase tracking-wide text-tab-b font-semibold">Dica ENEM</span>
                      </div>
                      <p className="text-sm">{question.dica}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!isCorrect && (
                      <Button
                        variant="outline"
                        onClick={handleAddError}
                        className="flex-1 border-tab-d/30 text-tab-d hover:bg-tab-d-soft"
                      >
                        Registrar erro no TAB
                      </Button>
                    )}
                    <Button onClick={resetPractice} className="flex-1">
                      Nova questao
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
