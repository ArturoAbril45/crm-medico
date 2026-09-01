import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../services/api'
import { Plus, Search, Pencil, Trash2, Phone, User, Download, Upload } from 'lucide-react'
import Modal from '../components/Modal'

const estadoOptions = ['activo', 'inactivo', 'potencial']
const fuenteOptions = ['whatsapp', 'referido', 'instagram', 'facebook', 'otro']

const estadoColors = {
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-slate-100 text-slate-500',
  potencial: 'bg-blue-100 text-blue-700',
}

const emptyForm = { nombre: '', apellido: '', telefono: '', whatsapp: '', email: '', ciudad: '', estado: 'potencial', fuente: 'whatsapp', notas: '' }

export default function Pacientes() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'nuevo' | {paciente}
  const [form, setForm] = useState(emptyForm)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes', search, page],
    queryFn: () => getPacientes({ search, page }).then(r => r.data),
    keepPreviousData: true,
  })

  const mutCreate = useMutation({ mutationFn: createPaciente, onSuccess: () => { qc.invalidateQueries(['pacientes']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updatePaciente(id, data), onSuccess: () => { qc.invalidateQueries(['pacientes']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deletePaciente, onSuccess: () => qc.invalidateQueries(['pacientes']) })

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (p) => { setForm({ ...p, apellido: p.apellido ?? '', email: p.email ?? '', ciudad: p.ciudad ?? '', notas: p.notas ?? '' }); setModal(p) }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal.id, data: form })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const pacientes = data?.data ?? []
  const meta = data?.meta ?? {}

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{meta.total ?? 0} pacientes registrados</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Upload size={15} /> Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Download size={15} /> Exportar
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar por nombre, teléfono o email..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Paciente</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Ciudad</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Fuente</th>
              <th className="px-5 py-3 font-medium text-right">Total Gastado</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pacientes.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-bold text-xs">{p.nombre[0]}{(p.apellido ?? ' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{p.nombre} {p.apellido}</p>
                        <p className="text-xs text-slate-400">{p.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.telefono}</td>
                  <td className="px-5 py-3 text-slate-500">{p.ciudad || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.fuente}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800 tabular-nums">
                    Bs. {parseFloat(p.total_gastado ?? 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar paciente?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Paginación */}
        {meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Página {meta.current_page} de {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Anterior</button>
              <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Paciente' : 'Editar Paciente'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Apellido</label>
                <input value={form.apellido} onChange={e => set('apellido', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Teléfono *</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">WhatsApp</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Ciudad</label>
                <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {estadoOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fuente</label>
                <select value={form.fuente} onChange={e => set('fuente', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {fuenteOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notas</label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                {modal === 'nuevo' ? 'Crear Paciente' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
