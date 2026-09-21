import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConsultas, createConsulta, updateConsulta, deleteConsulta, getPacientes, getMedicos } from '../services/api'
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react'
import Modal from '../components/Modal'

const ahora = () => new Date().toISOString().slice(0, 16)
const emptyForm = { paciente_id: '', medico_id: '', fecha: ahora(), motivo: '', diagnostico: '', tratamiento: '', notas: '' }

export default function Consultas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['consultas'], queryFn: () => getConsultas().then(r => r.data) })
  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-todos'], queryFn: () => getPacientes({ per_page: 200 }).then(r => r.data) })
  const { data: medicosData } = useQuery({ queryKey: ['medicos'], queryFn: () => getMedicos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createConsulta, onSuccess: () => { qc.invalidateQueries(['consultas']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateConsulta(id, data), onSuccess: () => { qc.invalidateQueries(['consultas']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteConsulta, onSuccess: () => qc.invalidateQueries(['consultas']) })

  const consultas = Array.isArray(data) ? data : []
  const pacientes = Array.isArray(pacientesData) ? pacientesData : (pacientesData?.data ?? [])
  const medicos = Array.isArray(medicosData) ? medicosData : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (c) => {
    setForm({
      paciente_id: c.paciente_id, medico_id: c.medico_id ?? '', fecha: c.fecha?.slice(0, 16) ?? ahora(),
      motivo: c.motivo, diagnostico: c.diagnostico ?? '', tratamiento: c.tratamiento ?? '', notas: c.notas ?? '',
    })
    setModal(c)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form, medico_id: form.medico_id || null }
    if (modal === 'nuevo') mutCreate.mutate(data)
    else mutUpdate.mutate({ id: modal.id, data })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Consultas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registro clínico de las atenciones</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nueva Consulta
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Médico</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Diagnóstico</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {consultas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(c.fecha).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.medico?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.motivo}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{c.diagnostico || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar consulta?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {consultas.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">
                  <ClipboardList size={22} className="mx-auto mb-2 text-slate-300" />
                  Todavía no hay consultas registradas.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nueva Consulta' : 'Editar Consulta'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Paciente *</label>
                <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="">— Seleccionar —</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Médico</label>
                <select value={form.medico_id} onChange={e => set('medico_id', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="">— Sin asignar —</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Fecha y hora *</label>
              <input type="datetime-local" value={form.fecha} onChange={e => set('fecha', e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Motivo de consulta *</label>
              <input value={form.motivo} onChange={e => set('motivo', e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Diagnóstico</label>
              <textarea value={form.diagnostico} onChange={e => set('diagnostico', e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tratamiento</label>
              <textarea value={form.tratamiento} onChange={e => set('tratamiento', e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notas</label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
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
