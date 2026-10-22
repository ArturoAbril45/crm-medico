import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfiguracionIaBot, updateConfiguracionIaBot } from '../../services/api'
import { Bot, Info, CheckCircle2 } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const defaults = { proveedor: 'openai', modelo: 'gpt-4o-mini', api_key: '', prompt_sistema: '', temperatura_default: 1, activo: false }

export default function WhatsappAiBot() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['config-ia-bot'], queryFn: () => getConfiguracionIaBot().then(r => r.data) })
  const [form, setForm] = useState(defaults)
  const [cargado, setCargado] = useState(false)
  const [tieneApiKey, setTieneApiKey] = useState(false)

  useEffect(() => {
    if (data && !cargado) {
      setForm({
        proveedor: data.proveedor ?? 'openai', modelo: data.modelo ?? 'gpt-4o-mini', api_key: '',
        prompt_sistema: data.prompt_sistema ?? '', temperatura_default: data.temperatura_default ?? 1, activo: data.activo ?? false,
      })
      setTieneApiKey(!!data.tiene_api_key)
      setCargado(true)
    }
  }, [data, cargado])

  const mutUpdate = useMutation({
    mutationFn: updateConfiguracionIaBot,
    onSuccess: (res) => { qc.invalidateQueries(['config-ia-bot']); setTieneApiKey(!!res.data.tiene_api_key); setForm(f => ({ ...f, api_key: '' })) },
  })

  if (isLoading) return <ModuleLoader fixed />

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Bot size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">WhatsApp AI Bot</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configuración de inteligencia artificial para respuestas automáticas</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Esta clave se usa para los nodos <strong>"Asistente de IA"</strong> del editor visual de Flujos de Conversación.
          Cada nodo puede tener sus propias instrucciones y temperatura; acá configurás qué proveedor y modelo los ejecuta,
          más un prompt de sistema global que se aplica a todos.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutUpdate.mutate(form) }} className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Proveedor">
            <select value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} className={inputCls + ' bg-white'}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </Field>
          <Field label="Modelo">
            <input value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} placeholder={form.proveedor === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-haiku-latest'} className={inputCls} />
          </Field>
        </div>

        <Field label={`API Key${tieneApiKey ? ' (configurada — dejá vacío para no cambiarla)' : ''}`}>
          <input type="password" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} placeholder={tieneApiKey ? '••••••••••••' : 'sk-...'} className={inputCls} autoComplete="off" />
          {tieneApiKey && (
            <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1"><CheckCircle2 size={12} /> Hay una clave configurada</p>
          )}
        </Field>

        <Field label="Prompt de Sistema (aplica a todos los nodos de IA)">
          <textarea value={form.prompt_sistema} onChange={e => setForm(f => ({ ...f, prompt_sistema: e.target.value }))} rows={4}
            placeholder="Ej: Sos el asistente virtual de Med-Advance, una clínica médica. Respondé en español, de forma breve y profesional."
            className={inputCls + ' resize-none'} />
        </Field>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-2">Temperatura por defecto ({form.temperatura_default})</label>
          <input type="range" min="0" max="2" step="0.1" value={form.temperatura_default} onChange={e => setForm(f => ({ ...f, temperatura_default: Number(e.target.value) }))} className="w-full accent-indigo-600" />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="accent-indigo-600" />
          <span className="text-sm text-slate-700">Activar respuestas automáticas por IA en el bot de WhatsApp</span>
        </label>

        <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Configuración</button>
      </form>
    </div>
  )
}
