import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFlujos, createFlujo, updateFlujo, deleteFlujo } from '../services/api'
import { Plus, FolderOpen, Search, ChevronDown, Link, Zap, MoreVertical, Trash2, Pencil } from 'lucide-react'
import Modal from '../components/Modal'

const carpetas = [
  { nombre: 'Abogados', cantidad: 12 },
  { nombre: 'Clínica Dental', cantidad: 8 },
  { nombre: 'Contabilidad', cantidad: 10 },
  { nombre: 'Encapsulado / Come...', cantidad: 15 },
  { nombre: 'Estética', cantidad: 12 },
  { nombre: 'Franquicias', cantidad: 8 },
  { nombre: 'Gráfico', cantidad: 8 },
  { nombre: 'Hospitalidad', cantidad: 15 },
  { nombre: 'Bienes raíces', cantidad: 8 },
]

const estandarVacios = [
  'Flujo de respuesta estándar',
  'Flujo estándar para medios',
  'Flujo Post-Servicio',
]

const emptyForm = { nombre: '', descripcion: '', activo: true }

export default function Flujos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarMas, setMostrarMas] = useState(false)
  const [estandarOpen, setEstandarOpen] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(null)

  const { data } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createFlujo, onSuccess: () => { qc.invalidateQueries(['flujos']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateFlujo(id, data), onSuccess: () => { qc.invalidateQueries(['flujos']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteFlujo, onSuccess: () => qc.invalidateQueries(['flujos']) })

  const flujos = Array.isArray(data) ? data : []
  const filtrados = flujos.filter(f => f.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  const carpetasVista = mostrarMas ? carpetas : carpetas.slice(0, 9)

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (f) => { setForm({ nombre: f.nombre, descripcion: f.descripcion ?? '', activo: f.activo }); setModal(f) }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal.id, data: form })
  }

  return (
    <div className="space-y-5" onClick={() => setMenuAbierto(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Flujos de conversación</h1>
        <div className="flex gap-2">
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
            <Plus size={15} /> Crear una carpeta
          </button>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
            <Plus size={15} /> Crear un nuevo flujo
          </button>
        </div>
      </div>

      {/* Flujos Estándar Básicos */}
      <div>
        <button onClick={() => setEstandarOpen(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3 hover:text-slate-900 transition-colors">
          Flujos Estándar Básicos
          <ChevronDown size={16} className={`transition-transform ${estandarOpen ? '' : '-rotate-90'}`} />
        </button>

        {estandarOpen && (
          <div className="flex gap-3 flex-wrap">
            {/* Flujo bienvenida — card sólida */}
            <div className="bg-white border border-slate-200 shadow-sm p-4 min-w-48 relative">
              <p className="text-xs text-indigo-500 font-medium mb-1">Flujo de bienvenida</p>
              <p className="text-sm font-semibold text-slate-800">Bienvenida Clínica São Paulo</p>
              <button className="absolute top-3 right-3 text-slate-300 hover:text-slate-500">
                <MoreVertical size={14} />
              </button>
            </div>

            {/* Flujos vacíos — borde punteado */}
            {estandarVacios.map(nombre => (
              <button key={nombre}
                className="border-2 border-dashed border-indigo-300 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors px-6 py-4 text-sm font-medium min-w-48">
                {nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Todos los flujos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Todos los flujos</p>
          <div className="relative w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Busca"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 rounded-lg" />
          </div>
        </div>

        {/* Grid de carpetas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {carpetasVista.map(c => (
            <button key={c.nombre}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left rounded-lg group">
              <FolderOpen size={15} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-700 truncate flex-1">{c.nombre}</span>
              <span className="text-xs text-slate-400 shrink-0">{c.cantidad}</span>
              <MoreVertical size={13} className="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
          <button onClick={() => setMostrarMas(v => !v)}
            className="px-3 py-2.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium text-left">
            {mostrarMas ? 'Mostrar menos' : 'Mostrar más'}
          </button>
        </div>

        {/* Tabla de flujos */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                </th>
                <th className="px-2 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Conexiones</th>
                <th className="px-4 py-3 text-left font-medium">Ejecuciones</th>
                <th className="px-4 py-3 text-left font-medium">CTR, %</th>
                <th className="px-4 py-3 text-left font-medium">Última modificación</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                  </td>
                  <td className="px-2 py-3 font-medium text-slate-800">{f.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link size={14} className="text-slate-300" />
                      <Zap size={14} className="text-slate-300" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">---</td>
                  <td className="px-4 py-3 text-slate-400">---</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(f.updated_at ?? f.created_at).toLocaleDateString('es-BO', { day:'2-digit', month:'2-digit', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={e => { e.stopPropagation(); setMenuAbierto(menuAbierto === f.id ? null : f.id) }}
                      className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={15} />
                    </button>
                    {menuAbierto === f.id && (
                      <div className="absolute right-6 top-8 z-20 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden w-36">
                        <button onClick={() => { openEdit(f); setMenuAbierto(null) }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => { if (confirm('¿Eliminar flujo?')) mutDelete.mutate(f.id); setMenuAbierto(null) }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No hay flujos creados aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Flujo' : 'Editar Flujo'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre del Flujo *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
                className="w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                rows={3} className="w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none rounded-lg" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 rounded-lg">
                {modal === 'nuevo' ? 'Crear Flujo' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
