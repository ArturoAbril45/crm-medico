import { useState } from 'react'
import ModuleLoader from '../components/ModuleLoader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getModelosMensajes, createModeloMensaje, updateModeloMensaje, deleteModeloMensaje } from '../services/api'
import { LayoutTemplate, Plus, Pencil, Trash2, Search, Copy } from 'lucide-react'
import Modal from '../components/Modal'

const categorias = ['Todos', 'Marketing', 'Utilidad', 'Servicio']

export default function Modelos() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', categoria: 'Marketing', contenido: '' })

  const { data, isLoading } = useQuery({ queryKey: ['modelos-mensajes', categoria], queryFn: () => getModelosMensajes({ categoria }).then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createModeloMensaje, onSuccess: () => { qc.invalidateQueries(['modelos-mensajes']); setModal(false) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateModeloMensaje(id, data), onSuccess: () => { qc.invalidateQueries(['modelos-mensajes']); setModal(false) } })
  const mutDelete = useMutation({ mutationFn: deleteModeloMensaje, onSuccess: () => qc.invalidateQueries(['modelos-mensajes']) })

  const modelos = Array.isArray(data) ? data : []
  const filtrados = modelos.filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const abrir = (m = null) => {
    setEditando(m)
    setForm(m ? { nombre: m.nombre, categoria: m.categoria, contenido: m.contenido } : { nombre: '', categoria: 'Marketing', contenido: '' })
    setModal(true)
  }

  const guardar = () => {
    if (!form.nombre.trim() || !form.contenido.trim()) return
    if (editando) mutUpdate.mutate({ id: editando.id, data: form })
    else mutCreate.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Modelos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Plantillas de mensajes para WhatsApp</p>
        </div>
        <button onClick={() => abrir()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium rounded-lg">
          <Plus size={15} /> Crear Modelo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoria(c)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-lg ${categoria === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar modelo..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50" />
        </div>
      </div>

      {isLoading ? (
        <ModuleLoader />
      ) : filtrados.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center text-slate-400">
          <LayoutTemplate size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium text-slate-500">Aún no hay modelos</p>
          <p className="text-sm mt-1">Crea tu primer modelo de mensaje</p>
          <button onClick={() => abrir()} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors rounded-lg">Crear</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(m => (
            <div key={m.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{m.nombre}</p>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 mt-1 inline-block rounded-full">{m.categoria}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 font-medium shrink-0 rounded-full ${m.estado === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {m.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex-1 line-clamp-3">{m.contenido}</p>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => navigator.clipboard?.writeText(m.contenido)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors rounded-lg">
                  <Copy size={12} /> Copiar
                </button>
                <button onClick={() => abrir(m)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors ml-auto rounded-lg">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => { if (confirm('¿Eliminar modelo?')) mutDelete.mutate(m.id) }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editando ? 'Editar Modelo' : 'Nuevo Modelo'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="ej. Bienvenida nuevos pacientes"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option>Marketing</option>
                <option>Utilidad</option>
                <option>Servicio</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Contenido *</label>
              <textarea value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
                placeholder="Usa {{nombre}}, {{fecha}}, {{hora}} como variables..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              <p className="text-xs text-slate-400 mt-1">Variables: {'{{nombre}}'}, {'{{fecha}}'}, {'{{hora}}'}, {'{{doctor}}'}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={guardar} disabled={mutCreate.isPending || mutUpdate.isPending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                {(mutCreate.isPending || mutUpdate.isPending) ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
