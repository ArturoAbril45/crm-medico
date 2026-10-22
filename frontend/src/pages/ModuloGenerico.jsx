import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRegistros, createRegistro, updateRegistro, deleteRegistro } from '../services/api'
import { Plus, Pencil, Trash2, Inbox } from 'lucide-react'
import Modal from '../components/Modal'

const ESTADOS = ['Activo', 'Pendiente', 'En proceso', 'Completado', 'Inactivo']
const emptyForm = { titulo: '', descripcion: '', estado: 'Activo', fecha: '' }

const badgeColor = (estado) => ({
  Activo: 'bg-emerald-50 text-emerald-600',
  Pendiente: 'bg-amber-50 text-amber-600',
  'En proceso': 'bg-blue-50 text-blue-600',
  Completado: 'bg-indigo-50 text-indigo-600',
  Inactivo: 'bg-slate-100 text-slate-500',
}[estado] || 'bg-slate-100 text-slate-500')

// Página genérica reutilizable: da CRUD real (crear, listar, editar, eliminar)
// a cualquier módulo del menú que todavía no tiene un modelo de datos propio,
// usando la tabla compartida `modulo_registros` filtrada por el slug del módulo.
export default function ModuloGenerico({ modulo, label, icon: Icon }) {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['registros', modulo],
    queryFn: () => getRegistros(modulo).then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['registros', modulo] })
  const mutCreate = useMutation({ mutationFn: createRegistro, onSuccess: () => { invalidate(); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateRegistro(id, data), onSuccess: () => { invalidate(); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteRegistro, onSuccess: invalidate })

  const registros = Array.isArray(data) ? data : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (r) => {
    setForm({ titulo: r.titulo, descripcion: r.descripcion ?? '', estado: r.estado ?? 'Activo', fecha: r.fecha ?? '' })
    setModal(r)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate({ ...form, modulo })
    else mutUpdate.mutate({ id: modal.id, data: form })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Icon size={20} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{label}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Registros de {label.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo registro
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registros.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.titulo}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-sm truncate">{r.descripcion || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.fecha ? new Date(r.fecha).toLocaleDateString('es-BO') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor(r.estado)}`}>{r.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar registro?')) mutDelete.mutate(r.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {registros.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">
                  <Inbox size={22} className="mx-auto mb-2 text-slate-300" />
                  Todavía no hay registros en {label.toLowerCase()}.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? `Nuevo registro — ${label}` : `Editar registro — ${label}`} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Título *</label>
              <input value={form.titulo} onChange={e => set('titulo', e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fecha</label>
                <input type="date" value={form.fecha ?? ''} onChange={e => set('fecha', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
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
