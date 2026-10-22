import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFlujos, getFlujo, createFlujo, updateFlujo, deleteFlujo, guardarFlujo,
  getCarpetasFlujo, createCarpetaFlujo, updateCarpetaFlujo, deleteCarpetaFlujo,
} from '../services/api'
import { Plus, FolderOpen, Search, ChevronDown, Link, Zap, MoreVertical, Trash2, Pencil, ExternalLink, Copy, FolderInput, Share2, ChevronRight, GripVertical } from 'lucide-react'
import Modal from '../components/Modal'

const estandarVacios = [
  'Flujo de respuesta estándar',
  'Flujo estándar para medios',
  'Flujo Post-Servicio',
]

const emptyForm = { nombre: '', descripcion: '', activo: true }

export default function Flujos() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarMas, setMostrarMas] = useState(false)
  const [estandarOpen, setEstandarOpen] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [carpetaPopover, setCarpetaPopover] = useState(false)
  const [nombreCarpeta, setNombreCarpeta] = useState('')
  const [flujoPopover, setFlujoPopover] = useState(false)
  const [nombreFlujo, setNombreFlujo] = useState('')
  const [vacioPopover, setVacioPopover] = useState(null) // nombre del item abierto
  const [vacioModo, setVacioModo] = useState(null) // 'existente' | null
  const [carpetaActiva, setCarpetaActiva] = useState(null) // carpeta seleccionada, o null = todos
  const [carpetaSobrevolada, setCarpetaSobrevolada] = useState(null) // id de carpeta con drag encima
  const [moverMenuId, setMoverMenuId] = useState(null)
  const [menuCarpetaId, setMenuCarpetaId] = useState(null)

  const { data } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data) })
  const { data: carpetasData } = useQuery({ queryKey: ['carpetas-flujo'], queryFn: () => getCarpetasFlujo().then(r => r.data) })
  const carpetas = Array.isArray(carpetasData) ? carpetasData : []
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateFlujo(id, data), onSuccess: () => { qc.invalidateQueries(['flujos']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteFlujo, onSuccess: () => qc.invalidateQueries(['flujos']) })
  const mutCrearCarpeta = useMutation({
    mutationFn: createCarpetaFlujo,
    onSuccess: () => { qc.invalidateQueries(['carpetas-flujo']); setNombreCarpeta(''); setCarpetaPopover(false) },
  })
  const mutRenombrarCarpeta = useMutation({ mutationFn: ({ id, nombre }) => updateCarpetaFlujo(id, nombre), onSuccess: () => qc.invalidateQueries(['carpetas-flujo']) })
  const mutBorrarCarpeta = useMutation({
    mutationFn: deleteCarpetaFlujo,
    onSuccess: () => { qc.invalidateQueries(['carpetas-flujo']); qc.invalidateQueries(['flujos']); setCarpetaActiva(null) },
  })
  const mutMoverACarpeta = useMutation({
    mutationFn: ({ flujoId, carpetaId }) => updateFlujo(flujoId, { carpeta_id: carpetaId }),
    onSuccess: () => qc.invalidateQueries(['flujos']),
  })
  const mutCrearDirecto = useMutation({
    mutationFn: createFlujo,
    onSuccess: (res) => { qc.invalidateQueries(['flujos']); navigate(`/flujos/${res.data.id}`) },
  })
  const mutDuplicar = useMutation({
    mutationFn: async (f) => {
      const detalle = (await getFlujo(f.id)).data
      const nuevo = (await createFlujo({ nombre: `${f.nombre} (copia)`, descripcion: f.descripcion })).data
      await guardarFlujo(nuevo.id, {
        bloques: (detalle.bloques ?? []).map(b => ({ client_id: b.client_id, tipo: b.tipo, pos_x: b.pos_x, pos_y: b.pos_y, config: b.config })),
        edges: (detalle.edges ?? []).map(e => ({ from_client_id: e.from_client_id, to_client_id: e.to_client_id, from_handle: e.from_handle, label: e.label })),
      })
      return nuevo
    },
    onSuccess: () => qc.invalidateQueries(['flujos']),
  })

  const flujos = Array.isArray(data) ? data : []
  const filtrados = flujos
    .filter(f => f.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(f => !carpetaActiva || f.carpeta_id === carpetaActiva.id)
  const carpetasVista = mostrarMas ? carpetas : carpetas.slice(0, 9)
  const flujoBienvenida = flujos.find(f => f.nombre.toLowerCase().includes('bienvenida')) ?? flujos[0]

  const crearYAbrir = (nombre) => mutCrearDirecto.mutate({ nombre })
  const abrirBienvenida = () => {
    const existente = flujos.find(f => f.nombre.toUpperCase().includes('BIENVENIDA'))
    if (existente) navigate(`/flujos/${existente.id}`)
    else crearYAbrir('Bienvenida Med-Advance')
  }
  const crearCarpeta = () => {
    if (!nombreCarpeta.trim()) return
    mutCrearCarpeta.mutate(nombreCarpeta.trim())
  }
  const renombrarCarpeta = (c) => {
    const nuevo = prompt('Nuevo nombre de la carpeta:', c.nombre)
    if (nuevo && nuevo.trim() && nuevo.trim() !== c.nombre) mutRenombrarCarpeta.mutate({ id: c.id, nombre: nuevo.trim() })
    setMenuCarpetaId(null)
  }
  const borrarCarpeta = (c) => {
    if (confirm(`¿Eliminar la carpeta "${c.nombre}"? Los flujos adentro no se borran, quedan sin carpeta.`)) mutBorrarCarpeta.mutate(c.id)
    setMenuCarpetaId(null)
  }
  const onDropEnCarpeta = (carpetaId, e) => {
    e.preventDefault()
    setCarpetaSobrevolada(null)
    const flujoId = Number(e.dataTransfer.getData('text/flujo-id'))
    if (flujoId) mutMoverACarpeta.mutate({ flujoId, carpetaId })
  }
  const openEdit = (f) => { setForm({ nombre: f.nombre, descripcion: f.descripcion ?? '', activo: f.activo }); setModal(f) }
  const handleSubmit = (e) => {
    e.preventDefault()
    mutUpdate.mutate({ id: modal.id, data: form })
  }
  const crearFlujoRapido = () => {
    if (!nombreFlujo.trim()) return
    mutCrearDirecto.mutate({ nombre: nombreFlujo.trim() })
    setNombreFlujo('')
    setFlujoPopover(false)
  }
  const renombrar = (f) => {
    const nuevo = prompt('Nuevo nombre del flujo:', f.nombre)
    if (nuevo && nuevo.trim() && nuevo.trim() !== f.nombre) mutUpdate.mutate({ id: f.id, data: { nombre: nuevo.trim() } })
    setMenuAbierto(null)
  }
  const compartir = async (f) => {
    await navigator.clipboard.writeText(`${window.location.origin}/flujos/${f.id}`)
    alert('Enlace copiado')
    setMenuAbierto(null)
  }

  return (
    <div className="space-y-5" onClick={() => { setMenuAbierto(null); setCarpetaPopover(false); setFlujoPopover(false); setVacioPopover(null); setMoverMenuId(null); setMenuCarpetaId(null) }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Flujos de conversación</h1>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button onClick={() => setCarpetaPopover(o => !o)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
              <Plus size={15} /> Crear una carpeta
            </button>
            {carpetaPopover && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg z-30 p-4 w-72 rounded-lg">
                <input
                  value={nombreCarpeta}
                  onChange={e => setNombreCarpeta(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && crearCarpeta()}
                  placeholder="Nombre de la carpeta"
                  autoFocus
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button onClick={crearCarpeta} disabled={!nombreCarpeta.trim()}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Crear carpeta
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setFlujoPopover(o => !o)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
              <Plus size={15} /> Crear un nuevo flujo
            </button>
            {flujoPopover && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg z-30 p-4 w-72 rounded-lg">
                <input
                  value={nombreFlujo}
                  onChange={e => setNombreFlujo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && crearFlujoRapido()}
                  placeholder="Nombre"
                  autoFocus
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button onClick={crearFlujoRapido} disabled={!nombreFlujo.trim() || mutCrearDirecto.isPending}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {mutCrearDirecto.isPending ? 'Creando...' : 'Crear un nuevo flujo'}
                </button>
              </div>
            )}
          </div>
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
            <button onClick={abrirBienvenida}
              className="bg-white border border-slate-200 shadow-sm p-4 min-w-48 relative text-left hover:border-indigo-300 transition-colors">
              <p className="text-xs text-indigo-500 font-medium mb-1">Flujo de bienvenida</p>
              <p className="text-sm font-semibold text-slate-800">Bienvenida Med-Advance</p>
              <span onClick={e => e.stopPropagation()} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500">
                <MoreVertical size={14} />
              </span>
            </button>

            {/* Flujos vacíos — borde punteado, crean el flujo y abren el editor */}
            {estandarVacios.map(nombre => (
              <div key={nombre} className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setVacioPopover(vacioPopover === nombre ? null : nombre); setVacioModo(null) }}
                  className="border-2 border-dashed border-indigo-300 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors px-6 py-4 text-sm font-medium min-w-48">
                  {nombre}
                </button>
                {vacioPopover === nombre && (
                  <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 shadow-lg z-30 rounded-lg overflow-hidden w-64">
                    {vacioModo === 'existente' ? (
                      <div className="max-h-56 overflow-y-auto">
                        {flujos.length === 0 && <p className="px-4 py-3 text-xs text-slate-400">No hay flujos creados</p>}
                        {flujos.map(f => (
                          <button key={f.id} onClick={() => { navigate(`/flujos/${f.id}`); setVacioPopover(null) }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 truncate">
                            {f.nombre}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setVacioModo('existente')}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 text-left">
                          Seleccionar existente <ChevronDown size={13} className="-rotate-90 text-slate-300" />
                        </button>
                        <button onClick={() => { crearYAbrir(nombre); setVacioPopover(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 border-t border-slate-100">
                          Crear nuevo
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Todos los flujos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <button onClick={() => setCarpetaActiva(null)} className={carpetaActiva ? 'text-indigo-600 hover:underline' : ''}>Todos los flujos</button>
            {carpetaActiva && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <span>{carpetaActiva.nombre}</span>
              </>
            )}
          </div>
          <div className="relative w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Busca"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 rounded-lg" />
          </div>
        </div>

        {/* Grid de carpetas */}
        {carpetas.length === 0 ? (
          <p className="text-xs text-slate-400 mb-4">Todavía no creaste carpetas — usá "Crear una carpeta" arriba, y arrastrá un flujo de la tabla encima para organizarlo.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {carpetasVista.map(c => (
              <div key={c.id} className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setCarpetaActiva(carpetaActiva?.id === c.id ? null : c)}
                  onDragOver={e => { e.preventDefault(); setCarpetaSobrevolada(c.id) }}
                  onDragLeave={() => setCarpetaSobrevolada(cur => cur === c.id ? null : cur)}
                  onDrop={e => onDropEnCarpeta(c.id, e)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 bg-white border transition-colors text-left rounded-lg group ${
                    carpetaSobrevolada === c.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                    : carpetaActiva?.id === c.id ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <FolderOpen size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate flex-1">{c.nombre}</span>
                  <span className="text-xs text-slate-400 shrink-0">{c.flujos_count ?? 0}</span>
                  <span onClick={e => { e.stopPropagation(); setMenuCarpetaId(menuCarpetaId === c.id ? null : c.id) }}
                    className="text-slate-300 hover:text-slate-600 shrink-0 opacity-0 group-hover:opacity-100">
                    <MoreVertical size={13} />
                  </span>
                </button>
                {menuCarpetaId === c.id && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden w-36">
                    <button onClick={() => renombrarCarpeta(c)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                      <Pencil size={12} /> Renombrar
                    </button>
                    <button onClick={() => borrarCarpeta(c)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 border-t border-slate-100">
                      <Trash2 size={12} /> Borrar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {carpetas.length > 9 && (
              <button onClick={() => setMostrarMas(v => !v)}
                className="px-3 py-2.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium text-left">
                {mostrarMas ? 'Mostrar menos' : 'Mostrar más'}
              </button>
            )}
          </div>
        )}

        {/* Tabla de flujos */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-4 py-3 w-8"></th>
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
                <tr key={f.id} draggable
                  onDragStart={e => e.dataTransfer.setData('text/flujo-id', String(f.id))}
                  onClick={() => navigate(`/flujos/${f.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-slate-300 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()} title="Arrastrá para mover a una carpeta">
                    <GripVertical size={14} />
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
                  <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); setMenuAbierto(menuAbierto === f.id ? null : f.id) }}
                      className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={15} />
                    </button>
                    {menuAbierto === f.id && (
                      <div className="absolute right-6 top-8 z-20 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden w-44">
                        <button onClick={() => navigate(`/flujos/${f.id}`)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <ExternalLink size={13} /> Abierto
                        </button>
                        <button onClick={() => renombrar(f)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> Renombrar
                        </button>
                        <button onClick={() => { mutDuplicar.mutate(f); setMenuAbierto(null) }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <Copy size={13} /> Duplicar
                        </button>
                        <div className="relative">
                          <button onClick={() => setMoverMenuId(moverMenuId === f.id ? null : f.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                            <span className="flex items-center gap-2"><FolderInput size={13} /> Muévete hacia</span>
                            <ChevronRight size={12} className="text-slate-300" />
                          </button>
                          {moverMenuId === f.id && (
                            <div className="absolute right-full top-0 mr-1 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden w-44 max-h-56 overflow-y-auto">
                              <button onClick={() => { mutMoverACarpeta.mutate({ flujoId: f.id, carpetaId: null }); setMoverMenuId(null); setMenuAbierto(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 border-b border-slate-100">
                                Sin carpeta
                              </button>
                              {carpetas.length === 0 && <p className="px-4 py-2.5 text-xs text-slate-400">No hay carpetas creadas</p>}
                              {carpetas.map(c => (
                                <button key={c.id} onClick={() => { mutMoverACarpeta.mutate({ flujoId: f.id, carpetaId: c.id }); setMoverMenuId(null); setMenuAbierto(null) }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 truncate">
                                  {c.nombre}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={() => compartir(f)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <Share2 size={13} /> Compartir
                        </button>
                        <button onClick={() => { if (confirm('¿Eliminar flujo?')) mutDelete.mutate(f.id); setMenuAbierto(null) }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-slate-100">
                          <Trash2 size={13} /> Borrar
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

      {/* Modal de edición */}
      {modal && (
        <Modal title="Editar Flujo" onClose={() => setModal(null)}>
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
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
