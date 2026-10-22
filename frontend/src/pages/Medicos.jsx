import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedicos, createMedico, updateMedico, deleteMedico, getDepartamentos } from '../services/api'
import { Plus, Pencil, Trash2, UserCog, Mail, Phone } from 'lucide-react'
import Modal from '../components/Modal'

const emptyForm = {
  nombre: '', especialidad: '', email: '', telefono: '', departamento_id: '',
  hora_inicio: '08:00', hora_fin: '17:00', dias_trabajo: '1,2,3,4,5',
}

export default function Medicos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['medicos'], queryFn: () => getMedicos().then(r => r.data) })
  const { data: departamentosData } = useQuery({ queryKey: ['departamentos'], queryFn: () => getDepartamentos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createMedico, onSuccess: () => { qc.invalidateQueries(['medicos']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateMedico(id, data), onSuccess: () => { qc.invalidateQueries(['medicos']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteMedico, onSuccess: () => qc.invalidateQueries(['medicos']) })

  const medicos = Array.isArray(data) ? data : []
  const departamentos = Array.isArray(departamentosData) ? departamentosData : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (m) => { setForm({ ...emptyForm, ...m, departamento_id: m.departamento_id ?? '' }); setModal(m) }
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form, departamento_id: form.departamento_id || null }
    if (modal === 'nuevo') mutCreate.mutate(data)
    else mutUpdate.mutate({ id: modal.id, data })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Médicos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Profesionales de la clínica</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Médico
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicos.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-indigo-50 rounded-xl"><UserCog size={18} className="text-indigo-600" /></div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm('¿Desactivar médico?')) mutDelete.mutate(m.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 mb-0.5">{m.nombre}</h3>
              <p className="text-xs text-indigo-500 font-medium mb-3">{m.especialidad || 'Sin especialidad'}</p>
              <div className="space-y-1.5 text-xs text-slate-500">
                {m.departamento && <p className="text-slate-600 font-medium">{m.departamento.nombre}</p>}
                {m.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {m.email}</p>}
                {m.telefono && <p className="flex items-center gap-1.5"><Phone size={12} /> {m.telefono}</p>}
                <p className="pt-1.5 mt-1.5 border-t border-slate-50 text-slate-400">{m.hora_inicio} – {m.hora_fin}</p>
              </div>
            </div>
          ))}

          {medicos.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400 py-12">Todavía no hay médicos registrados.</p>
          )}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Médico' : 'Editar Médico'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Especialidad</label>
              <input value={form.especialidad} onChange={e => set('especialidad', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Departamento</label>
              <select value={form.departamento_id} onChange={e => set('departamento_id', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">— Sin departamento —</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Hora inicio</label>
                <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Hora fin</label>
                <input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                {modal === 'nuevo' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
