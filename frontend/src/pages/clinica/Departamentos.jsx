import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDepartamentos, createDepartamento, deleteDepartamento, getMedicos } from '../../services/api'
import { Plus, Trash2, Building2, Users } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const emptyForm = { nombre: '', descripcion: '', administrador_nombre: '', administrador_email: '', medico_ids: [] }
const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function Departamentos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['departamentos'], queryFn: () => getDepartamentos().then(r => r.data) })
  const { data: medicosData } = useQuery({ queryKey: ['medicos-depto'], queryFn: () => getMedicos({ per_page: 100 }).then(r => r.data) })
  const medicos = medicosData?.data ?? []

  const mutCreate = useMutation({
    mutationFn: createDepartamento,
    onSuccess: () => { qc.invalidateQueries(['departamentos']); setModal(false); setForm(emptyForm) },
  })
  const mutDelete = useMutation({ mutationFn: deleteDepartamento, onSuccess: () => qc.invalidateQueries(['departamentos']) })

  const departamentos = data ?? []
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleMedico = (id) => set('medico_ids', form.medico_ids.includes(id) ? form.medico_ids.filter(x => x !== id) : [...form.medico_ids, id])

  const guardar = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    mutCreate.mutate(form)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5 max-w-xl">Agrupá médicos por departamento (ej. Diagnóstico por Imágenes) y asigná un administrador que solo vea y gestione turnos de ese departamento.</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus size={16} /> Crear departamento
        </button>
      </div>

      {isLoading ? (
        <ModuleLoader />
      ) : departamentos.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <Building2 size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No hay departamentos creados todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {departamentos.map(d => (
            <div key={d.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{d.nombre}</p>
                  {d.descripcion && <p className="text-xs text-slate-400 mt-0.5">{d.descripcion}</p>}
                </div>
                <button onClick={() => { if (confirm('¿Eliminar departamento?')) mutDelete.mutate(d.id) }} className="p-1.5 text-slate-300 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              {d.administrador_nombre && (
                <p className="text-xs text-slate-500 mt-3">Admin: <span className="font-medium text-slate-700">{d.administrador_nombre}</span></p>
              )}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                <Users size={13} /> {d.medicos?.length ?? 0} médico(s)
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Crear departamento" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Nombre del departamento"><input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Ej: Diagnóstico por Imágenes" className={inputCls} /></Field>
            <Field label="Descripción"><textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={2} className={inputCls + ' resize-none'} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Administrador (nombre)"><input value={form.administrador_nombre} onChange={e => set('administrador_nombre', e.target.value)} className={inputCls} /></Field>
              <Field label="Administrador (email)"><input type="email" value={form.administrador_email} onChange={e => set('administrador_email', e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Médicos del departamento">
              <div className="border border-slate-200 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                {medicos.length === 0 ? (
                  <p className="text-xs text-slate-400 px-2 py-2">No hay médicos cargados todavía.</p>
                ) : medicos.map(m => (
                  <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={form.medico_ids.includes(m.id)} onChange={() => toggleMedico(m.id)} className="accent-indigo-600" />
                    Dr(a). {m.nombre} {m.apellido}
                  </label>
                ))}
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Crear departamento</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
