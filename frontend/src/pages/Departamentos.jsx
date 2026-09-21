import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento } from '../services/api'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import Modal from '../components/Modal'

const emptyForm = { nombre: '', descripcion: '' }

export default function Departamentos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['departamentos'], queryFn: () => getDepartamentos().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createDepartamento, onSuccess: () => { qc.invalidateQueries(['departamentos']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateDepartamento(id, data), onSuccess: () => { qc.invalidateQueries(['departamentos']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteDepartamento, onSuccess: () => qc.invalidateQueries(['departamentos']) })

  const departamentos = Array.isArray(data) ? data : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (d) => { setForm({ nombre: d.nombre, descripcion: d.descripcion ?? '' }); setModal(d) }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal.id, data: form })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Áreas y especialidades de la clínica</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Departamento
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departamentos.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-indigo-50 rounded-xl"><Building2 size={18} className="text-indigo-600" /></div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm('¿Desactivar departamento?')) mutDelete.mutate(d.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{d.nombre}</h3>
              <p className="text-xs text-slate-400 mb-3">{d.descripcion}</p>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-50">{d.medicos_count ?? 0} médico(s)</p>
            </div>
          ))}

          {departamentos.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400 py-12">Todavía no hay departamentos registrados.</p>
          )}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Departamento' : 'Editar Departamento'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3}
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
