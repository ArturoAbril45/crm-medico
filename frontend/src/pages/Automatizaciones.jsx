import { useState } from 'react'
import ModuleLoader from '../components/ModuleLoader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAutomatizaciones, createAutomatizacion, updateAutomatizacion, toggleAutomatizacion, deleteAutomatizacion, getFlujos } from '../services/api'
import { Plus, Pencil, Trash2, MoreVertical, Search, Keyboard, GitBranch, Webhook } from 'lucide-react'
import Modal from '../components/Modal'

const emptyForm = { nombre: '', flujo_id: '', tipo: 'palabra_clave', palabra_clave: '', condicion: 'es_igual', activo: true }
const condicionLabels = { contiene: 'Contiene', es_igual: 'Es igual a', empieza_con: 'Empieza con', cualquiera: 'Cualquier mensaje' }

const tabs = [
  { id: 'palabras', label: 'Palabras clave', icon: Keyboard },
  { id: 'secuencias', label: 'Secuencias', icon: GitBranch },
  { id: 'webhooks', label: 'Categoría: Webhooks', icon: Webhook },
]

export default function Automatizaciones() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('palabras')
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [rowMenu, setRowMenu] = useState(null)
  const [crearPopover, setCrearPopover] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['automatizaciones'], queryFn: () => getAutomatizaciones().then(r => r.data) })
  const { data: flujosList } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data) })

  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateAutomatizacion(id, data), onSuccess: () => { qc.invalidateQueries(['automatizaciones']); setModal(null) } })
  const mutToggle = useMutation({ mutationFn: toggleAutomatizacion, onSuccess: () => qc.invalidateQueries(['automatizaciones']) })
  const mutDelete = useMutation({ mutationFn: deleteAutomatizacion, onSuccess: () => qc.invalidateQueries(['automatizaciones']) })

  const mutCreate = useMutation({
    mutationFn: createAutomatizacion,
    onSuccess: (res) => {
      qc.invalidateQueries(['automatizaciones'])
      setCrearPopover(false)
      setNombreNuevo('')
      const creada = res.data
      setForm({ nombre: creada.nombre, flujo_id: creada.flujo_id ?? '', tipo: 'palabra_clave', palabra_clave: '', condicion: 'contiene', activo: true })
      setModal(creada)
    },
  })

  const autos = Array.isArray(data) ? data : []
  const flujos = Array.isArray(flujosList) ? flujosList : []
  const palabras = autos.filter(a => a.tipo === 'palabra_clave' && a.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const crearGrupo = () => {
    if (!nombreNuevo.trim()) return
    mutCreate.mutate({ nombre: nombreNuevo.trim(), tipo: 'palabra_clave', condicion: 'contiene', palabra_clave: '', activo: true })
  }

  const openEdit = (a) => {
    setForm({ nombre: a.nombre, flujo_id: a.flujo_id ?? '', tipo: a.tipo, palabra_clave: a.palabra_clave ?? '', condicion: a.condicion ?? 'es_igual', activo: a.activo })
    setModal(a); setRowMenu(null)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    mutUpdate.mutate({ id: modal.id, data: form })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800">Automatización</h1>
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-colors rounded-md ${
                  tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setCrearPopover(o => !o)} className="px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            Crear
          </button>
          {crearPopover && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-100 shadow-lg z-30 p-4 w-80">
              <input
                value={nombreNuevo}
                onChange={e => setNombreNuevo(e.target.value)}
                placeholder="Nombre"
                autoFocus
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={crearGrupo}
                disabled={!nombreNuevo.trim() || mutCreate.isPending}
                className="w-full py-3 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {mutCreate.isPending ? 'Creando...' : 'Crear un grupo de palabras clave'}
              </button>
            </div>
          )}
        </div>
      </div>

      {tab === 'palabras' && (
        <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-700">Todas Las Palabras Clave</p>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{palabras.length}</span>
            </div>
            <div className="relative w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
            </div>
          </div>

          {isLoading ? (
            <ModuleLoader />
          ) : palabras.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Keyboard size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay palabras clave configuradas</p>
              <p className="text-sm mt-1">Creá la primera con el botón "Crear"</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 font-medium">Iniciar el flujo</th>
                  <th className="px-4 py-3 font-medium">Mensaje</th>
                  <th className="px-4 py-3 font-medium text-center">Ejecuciones</th>
                  <th className="px-4 py-3 font-medium text-center">Activa</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {palabras.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{a.nombre}</p>
                      {a.flujo && <p className="text-xs text-indigo-500 mt-0.5">→ {a.flujo.nombre}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 mr-1.5">{condicionLabels[a.condicion] ?? 'Contiene'}:</span>
                      {a.palabra_clave ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full">
                          {a.palabra_clave}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">{(a.ejecuciones ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button onClick={() => mutToggle.mutate(a.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${a.activo ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${a.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button onClick={() => setRowMenu(m => m === a.id ? null : a.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                        <MoreVertical size={16} />
                      </button>
                      {rowMenu === a.id && (
                        <div className="absolute right-4 top-full mt-1 w-36 bg-white border border-slate-100 shadow-lg z-20 text-left">
                          <button onClick={() => openEdit(a)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                            <Pencil size={13} /> Editar
                          </button>
                          <button onClick={() => { setRowMenu(null); if (confirm('¿Eliminar?')) mutDelete.mutate(a.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                            <Trash2 size={13} /> Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'secuencias' && (
        <div className="bg-white border border-slate-100 shadow-sm py-20 text-center">
          <GitBranch size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No hay secuencias creadas todavía</p>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="bg-white border border-slate-100 shadow-sm py-20 text-center">
          <Webhook size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No hay webhooks configurados todavía</p>
        </div>
      )}

      {modal && (
        <Modal title="Configurar Palabra Clave" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Iniciar el flujo</label>
              <select value={form.flujo_id} onChange={e => set('flujo_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Sin flujo</option>
                {flujos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Condición</label>
                <select value={form.condicion} onChange={e => set('condicion', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {Object.entries(condicionLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Palabra clave</label>
                {form.condicion === 'cualquiera' ? (
                  <p className="text-xs text-slate-400 pt-2">No aplica: responde a cualquier mensaje.</p>
                ) : (
                  <input value={form.palabra_clave} onChange={e => set('palabra_clave', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm text-slate-700">Automatización activa</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
