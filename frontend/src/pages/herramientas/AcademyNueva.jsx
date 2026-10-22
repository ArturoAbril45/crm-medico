import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ShieldAlert, Send } from 'lucide-react'
import { createAcademyArticulo } from '../../services/api'
import MarkdownLite from '../../lib/markdownLite'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

export default function AcademyNueva() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('editor')
  const [form, setForm] = useState({ titulo: '', resumen: '', contenido: '', modulo: '' })

  const mutCrear = useMutation({
    mutationFn: createAcademyArticulo,
    onSuccess: () => navigate('/herramientas/academy'),
  })

  const enviar = (e) => {
    e.preventDefault()
    mutCrear.mutate(form)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/herramientas/academy" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={15} /> Volver a la Academia
      </Link>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8">
        <h1 className="text-xl font-bold text-slate-800">Nueva Publicación de Comunidad</h1>
        <p className="text-sm text-slate-500 mt-1">Comparta su experiencia clínica o análisis con la comunidad médica de la plataforma.</p>

        <div className="mt-5 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Restricción Estricta de Datos de Salud Protegidos (PHI)</p>
            <p className="text-xs text-red-600 mt-1">IMPORTANTE: Está estrictamente prohibido incluir Datos de Salud Protegidos (PHI) como nombres de pacientes, documentos, números de historia clínica o teléfonos. Todo contenido se somete a revisión de moderación.</p>
          </div>
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Título de la Publicación</label>
            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Resumen breve</label>
            <input value={form.resumen} onChange={e => setForm(f => ({ ...f, resumen: e.target.value }))} maxLength={400} className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Módulo relacionado (opcional)</label>
            <input value={form.modulo} onChange={e => setForm(f => ({ ...f, modulo: e.target.value }))} placeholder="Ej: Oncología" className={inputCls} />
          </div>

          <div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-sm font-medium w-fit mb-2">
              {[{ v: 'editor', l: 'Editor de Contenido (Markdown)' }, { v: 'preview', l: 'Vista Previa' }].map(o => (
                <button key={o.v} type="button" onClick={() => setTab(o.v)}
                  className={`px-3.5 py-1.5 rounded-md transition-colors ${tab === o.v ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {o.l}
                </button>
              ))}
            </div>
            {tab === 'editor' ? (
              <textarea value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
                required rows={12} placeholder={'## Título de sección\n\nTexto del artículo...\n\n- punto uno\n- punto dos'}
                className={inputCls + ' resize-none font-mono text-xs'} />
            ) : (
              <div className="border border-slate-200 rounded-xl px-4 py-3 min-h-[280px]">
                <MarkdownLite texto={form.contenido || '_Sin contenido todavía_'} />
              </div>
            )}
          </div>

          <button type="submit" disabled={mutCrear.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            <Send size={15} /> Publicar para Moderación
          </button>
        </form>
      </div>
    </div>
  )
}
