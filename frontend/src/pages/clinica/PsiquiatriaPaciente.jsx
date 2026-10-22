import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPsiquiatriaRegistros, createPsiquiatriaRegistro, deletePsiquiatriaRegistro } from '../../services/api'
import { ArrowLeft, Plus, Trash2, FileText, Activity, ClipboardCheck, Brain } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const tabs = [
  { v: 'sesion', l: 'Sesiones', icon: FileText },
  { v: 'escala', l: 'Escalas Clínicas', icon: Activity },
  { v: 'plan', l: 'Plan de Tratamiento', icon: ClipboardCheck },
]

const escalasComunes = ['PHQ-9', 'GAD-7', 'MMSE', 'Escala de Hamilton', 'Escala de Young (Manía)']

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const emptyForm = { tipo: 'sesion', titulo: '', contenido: '', escala_nombre: '', escala_puntaje: '', fecha: new Date().toISOString().slice(0, 10) }

export default function PsiquiatriaPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('sesion')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['psiquiatria-registros', id, tab],
    queryFn: () => getPsiquiatriaRegistros(id, { tipo: tab }).then(r => r.data),
  })
  const paciente = data?.paciente
  const registros = data?.registros ?? []

  const mutCreate = useMutation({
    mutationFn: (d) => createPsiquiatriaRegistro(id, d),
    onSuccess: () => { qc.invalidateQueries(['psiquiatria-registros', id]); setModal(false) },
  })
  const mutDelete = useMutation({
    mutationFn: deletePsiquiatriaRegistro,
    onSuccess: () => qc.invalidateQueries(['psiquiatria-registros', id]),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const abrirNuevo = () => { setForm({ ...emptyForm, tipo: tab }); setModal(true) }
  const guardar = (e) => { e.preventDefault(); mutCreate.mutate(form) }

  const TabIcon = tabs.find(t => t.v === tab)?.icon ?? FileText

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/clinica/psiquiatria')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Volver a Central de Psiquiatría
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
          {paciente ? paciente.nombre.charAt(0).toUpperCase() : <Brain size={20} />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{paciente ? `${paciente.nombre} ${paciente.apellido ?? ''}` : 'Cargando...'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{paciente?.numero_documento ? `DNI ${paciente.numero_documento}` : paciente?.telefono || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100">
        {tabs.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.v ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={15} /> {t.l}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> {tab === 'sesion' ? 'Nueva Sesión' : tab === 'escala' ? 'Nueva Escala' : 'Nuevo Plan'}
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <ModuleLoader />
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <TabIcon size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Sin registros en {tabs.find(t => t.v === tab)?.l.toLowerCase()}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {registros.map(r => (
              <div key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm">
                      {r.tipo === 'escala' ? r.escala_nombre : (r.titulo || (r.tipo === 'plan' ? 'Plan de tratamiento' : 'Sesión'))}
                    </p>
                    {r.tipo === 'escala' && r.escala_puntaje !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">Puntaje: {r.escala_puntaje}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(r.fecha).toLocaleDateString()}</p>
                  {r.contenido && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{r.contenido}</p>}
                </div>
                <button onClick={() => { if (confirm('¿Eliminar registro?')) mutDelete.mutate(r.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={tab === 'sesion' ? 'Nueva Sesión' : tab === 'escala' ? 'Nueva Escala Clínica' : 'Nuevo Plan de Tratamiento'} size="lg" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Fecha" required><input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className={inputCls} /></Field>

            {form.tipo === 'escala' ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Escala" required>
                  <input list="escalas-comunes" value={form.escala_nombre} onChange={e => set('escala_nombre', e.target.value)} required placeholder="Ej: PHQ-9" className={inputCls} />
                  <datalist id="escalas-comunes">{escalasComunes.map(e => <option key={e} value={e} />)}</datalist>
                </Field>
                <Field label="Puntaje" required><input type="number" value={form.escala_puntaje} onChange={e => set('escala_puntaje', e.target.value)} required className={inputCls} /></Field>
              </div>
            ) : (
              <Field label="Título"><input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder={tab === 'plan' ? 'Ej: Plan inicial' : 'Ej: Control mensual'} className={inputCls} /></Field>
            )}

            <Field label={form.tipo === 'escala' ? 'Observaciones' : 'Notas'}>
              <textarea value={form.contenido} onChange={e => set('contenido', e.target.value)} rows={6} placeholder="Detalle clínico..." className={inputCls + ' resize-none'} />
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
