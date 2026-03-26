'use client'

import { useState, useEffect } from 'react'
import { Key, ExternalLink, Check, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type AIProvider = 'gemini' | 'groq'

interface AIConfig {
  provider: AIProvider
  apiKey: string
}

const STORAGE_KEY = 'tab-ai-config'

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null)
  
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setConfig(JSON.parse(stored))
      } catch {
        setConfig(null)
      }
    }
  }, [])
  
  const saveConfig = (newConfig: AIConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    setConfig(newConfig)
  }
  
  const clearConfig = () => {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(null)
  }
  
  return { config, saveConfig, clearConfig }
}

const providers: { id: AIProvider; name: string; description: string; url: string; urlLabel: string }[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Respostas mais consistentes e precisas. Recomendado.',
    url: 'https://aistudio.google.com/app/apikey',
    urlLabel: 'Criar chave no AI Studio'
  },
  {
    id: 'groq',
    name: 'Groq (Llama)',
    description: 'Muito rapido, mas pode ser menos preciso.',
    url: 'https://console.groq.com/keys',
    urlLabel: 'Criar chave na Groq'
  }
]

interface AISettingsProps {
  config: AIConfig | null
  onSave: (config: AIConfig) => void
  onClear: () => void
}

export function AISettings({ config, onSave, onClear }: AISettingsProps) {
  const [provider, setProvider] = useState<AIProvider>(config?.provider || 'gemini')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  
  useEffect(() => {
    if (config) {
      setProvider(config.provider)
      setApiKey(config.apiKey)
    }
  }, [config])
  
  const testConnection = async () => {
    if (!apiKey.trim()) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Diga apenas "ok"' }] }]
            })
          }
        )
        if (response.ok) {
          setTestResult('success')
          onSave({ provider, apiKey })
        } else {
          setTestResult('error')
        }
      } else {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Diga apenas "ok"' }],
            max_tokens: 10
          })
        })
        if (response.ok) {
          setTestResult('success')
          onSave({ provider, apiKey })
        } else {
          setTestResult('error')
        }
      }
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }
  
  const selectedProvider = providers.find(p => p.id === provider)!
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Configurar IA</h3>
      </div>
      
      {config ? (
        <div className="rounded-lg border border-success/30 bg-success-soft p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">
                {providers.find(p => p.id === config.provider)?.name} configurado
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
              Remover
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Chave: {config.apiKey.slice(0, 8)}...{config.apiKey.slice(-4)}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Configure sua propria chave de API para usar a funcao de pratica com IA. 
            Sua chave fica salva apenas no seu navegador.
          </p>
          
          {/* Provider selector */}
          <div className="space-y-2">
            {providers.map(p => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-all",
                  provider === p.id
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{p.name}</span>
                  {provider === p.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </button>
            ))}
          </div>
          
          {/* API Key input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <label className="text-xs font-medium">Chave de API</label>
            </div>
            <Input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIza...' : 'gsk_...'}
            />
            <a
              href={selectedProvider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {selectedProvider.urlLabel}
            </a>
          </div>
          
          {/* Test result */}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="h-4 w-4" />
              Chave invalida ou erro de conexao
            </div>
          )}
          
          {testResult === 'success' && (
            <div className="flex items-center gap-2 text-success text-xs">
              <Check className="h-4 w-4" />
              Conexao bem sucedida! Chave salva.
            </div>
          )}
          
          {/* Test button */}
          <Button
            onClick={testConnection}
            disabled={!apiKey.trim() || testing}
            className="w-full"
          >
            {testing ? 'Testando...' : 'Testar e salvar'}
          </Button>
        </>
      )}
    </div>
  )
}
