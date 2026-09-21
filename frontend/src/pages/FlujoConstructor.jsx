import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFlujo, crearBloque, actualizarBloque, moverBloque, eliminarBloque,
  crearConexion, eliminarConexion,
} from '../services/api'
import {
  ChevronLeft, Plus, X, Play, MessageSquare, ListChecks, GitBranch as Branch, Zap, Flag, Trash2,
} from 'lucide-react'

const TIPOS = {
  inicio: { label: 'Inicio', color: 'emerald', icon: Flag },
  contenido: { label: 'Contenido', color: 'rose', icon: MessageSquare },
  menu: { label: 'Menú', color: 'indigo', icon: ListChecks },
  condicion: { label: 'Condición', color: 'amber', icon: Branch },
  accion: { label: 'Acción', color: 'slate', icon: Zap },
}

const COLOR_CLASSES = {
  emerald: { border: 'border-emerald-300', header: 'text-emerald-600', dot: 'bg-emerald-400' },
  rose: { border: 'border-rose-300', header: 'text-rose-600', dot: 'bg-rose-400' },
  indigo: { border: 'border-indigo-300', header: 'text-indigo-600', dot: 'bg-indigo-400' },
  amber: { border: 'border-amber-300', header: 'text-amber-600', dot: 'bg-amber-400' },
  slate: { border: 'border-slate-300', header: 'text-slate-600', dot: 'bg-slate-400' },
}

const NODE_WIDTH = 260

function tituloDeBloque(b) {
  if (b.config?.titulo) return b.config.titulo
  return TIPOS[b.tipo]?.label ?? b.tipo
}

function resumenDeBloque(b) {
  if (b.tipo === 'contenido') return (b.config?.mensajes ?? []).join(' · ')
  if (b.tipo === 'menu') return b.config?.pregunta ?? ''
  if (b.tipo === 'condicion') return b.config?.condicion ?? ''
  if (b.tipo === 'accion') return b.config?.descripcion ?? ''
  return ''
}

export default function FlujoConstructor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const canvasRef = useRef(null)

  const { data: flujo, isLoading } = useQuery({
    queryKey: ['flujo', id],
    queryFn: () => getFlujo(id).then(r => r.data),
  })

  const [bloques, setBloques] = useState([])
  const [conexiones, setConexiones] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [arrastrando, setArrastrando] = useState(null) // { id, offsetX, offsetY }
  const [conectando, setConectando] = useState(null) // { origenId, valor, x, y }
  const [menuTipos, setMenuTipos] = useState(false)
  const [previsualizacao, setPrevisualizacao] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!flujo) return
    setBloques(flujo.bloques ?? [])
    setConexiones((flujo.bloques ?? []).flatMap(b => b.conexiones_salida ?? []))
  }, [flujo])

  const mostrarGuardado = () => {
    setToast('Guardado')
    setTimeout(() => setToast(''), 1500)
  }

  // --- Crear bloque ---
  const agregarBloque = async (tipo) => {
    setMenuTipos(false)
    const centro = canvasRef.current
      ? { x: canvasRef.current.scrollLeft + 300, y: canvasRef.current.scrollTop + 200 }
      : { x: 300, y: 200 }
    const configPorTipo = {
      inicio: { titulo: 'Inicio' },
      contenido: { titulo: 'Contenido', mensajes: ['Escribe tu mensaje aquí...'] },
      menu: { titulo: 'Menú', pregunta: 'Selecciona la opción que más te convenga', opciones: ['Opción 1', 'Opción 2'] },
      condicion: { titulo: 'Condición', condicion: 'campo == valor' },
      accion: { titulo: 'Acción', descripcion: 'Agregar etiqueta' },
    }
    const { data } = await crearBloque(id, {
      tipo, pos_x: centro.x, pos_y: centro.y, config: configPorTipo[tipo],
    })
    setBloques(prev => [...prev, { ...data, conexiones_salida: [] }])
    mostrarGuardado()
  }

  // --- Arrastrar bloque ---
  const iniciarArrastre = (e, bloque) => {
    if (e.target.closest('[data-port]')) return
    if (e.target.closest('[data-no-drag]')) return
    const rect = e.currentTarget.getBoundingClientRect()
    setArrastrando({ id: bloque.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top })
  }

  const onMouseMoveCanvas = useCallback((e) => {
    if (!canvasRef.current) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left + canvasRef.current.scrollLeft
    const y = e.clientY - canvasRect.top + canvasRef.current.scrollTop

    if (arrastrando) {
      setBloques(prev => prev.map(b => b.id === arrastrando.id
        ? { ...b, pos_x: x - arrastrando.offsetX, pos_y: y - arrastrando.offsetY }
        : b))
    }
    if (conectando) {
      setConectando(prev => prev ? { ...prev, x, y } : prev)
    }
  }, [arrastrando, conectando])

  const onMouseUpCanvas = async () => {
    if (arrastrando) {
      const b = bloques.find(x => x.id === arrastrando.id)
      setArrastrando(null)
      if (b) await moverBloque(b.id, { pos_x: Math.round(b.pos_x), pos_y: Math.round(b.pos_y) })
      mostrarGuardado()
    }
    if (conectando) {
      setConectando(null)
    }
  }

  // --- Conexiones ---
  const iniciarConexion = (e, origenId, valor = null) => {
    e.stopPropagation()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    setConectando({
      origenId, valor,
      x: e.clientX - canvasRect.left + canvasRef.current.scrollLeft,
      y: e.clientY - canvasRect.top + canvasRef.current.scrollTop,
    })
  }

  const terminarConexion = async (e, destinoId) => {
    e.stopPropagation()
    if (!conectando || conectando.origenId === destinoId) { setConectando(null); return }
    const { data } = await crearConexion({
      bloque_origen_id: conectando.origenId,
      bloque_destino_id: destinoId,
      valor: conectando.valor,
    })
    setConexiones(prev => [...prev, data])
    setConectando(null)
    mostrarGuardado()
  }

  const borrarConexion = async (conexionId) => {
    setConexiones(prev => prev.filter(c => c.id !== conexionId))
    await eliminarConexion(conexionId)
    mostrarGuardado()
  }

  const borrarBloque = async (bloqueId) => {
    if (!confirm('¿Eliminar este cuadro y sus conexiones?')) return
    setBloques(prev => prev.filter(b => b.id !== bloqueId))
    setConexiones(prev => prev.filter(c => c.bloque_origen_id !== bloqueId && c.bloque_destino_id !== bloqueId))
    setSeleccionado(null)
    await eliminarBloque(bloqueId)
    mostrarGuardado()
  }

  // --- Editar panel ---
  const guardarConfigBloque = async (bloqueId, config) => {
    setBloques(prev => prev.map(b => b.id === bloqueId ? { ...b, config } : b))
    await actualizarBloque(bloqueId, { config })
    mostrarGuardado()
  }

  const bloqueSeleccionado = bloques.find(b => b.id === seleccionado)

  if (isLoading) return <p className="text-sm text-slate-400">Cargando...</p>

  return (
    <div className="-m-6 h-[calc(100vh-64px)] flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/flujos')} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm text-slate-400">/</p>
          <p className="text-sm font-semibold text-slate-800 truncate">{flujo?.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="text-xs text-emerald-600 font-medium mr-2">✓ {toast}</span>}
          <button onClick={() => setPrevisualizacao(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Play size={14} /> Vista previa
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={canvasRef}
          onMouseMove={onMouseMoveCanvas}
          onMouseUp={onMouseUpCanvas}
          onMouseLeave={onMouseUpCanvas}
          onClick={() => setSeleccionado(null)}
          className="flex-1 overflow-auto relative"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div style={{ width: 3000, height: 2000, position: 'relative' }}>
            {/* Líneas SVG de conexión */}
            <svg width={3000} height={2000} className="absolute inset-0 pointer-events-none">
              {conexiones.map(c => {
                const origen = bloques.find(b => b.id === c.bloque_origen_id)
                const destino = bloques.find(b => b.id === c.bloque_destino_id)
                if (!origen || !destino) return null
                const p1 = { x: origen.pos_x + NODE_WIDTH, y: origen.pos_y + 40 }
                const p2 = { x: destino.pos_x, y: destino.pos_y + 40 }
                const midX = (p1.x + p2.x) / 2
                return (
                  <g key={c.id} className="pointer-events-auto" style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); borrarConexion(c.id) }}>
                    <path d={`M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`}
                      stroke="transparent" strokeWidth={14} fill="none" />
                    <path d={`M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`}
                      stroke="#6366f1" strokeWidth={2} fill="none" markerEnd="url(#arrow)" />
                  </g>
                )
              })}
              {conectando && (
                <path d={`M ${puertoOrigenConectando(bloques, conectando)?.x ?? 0} ${puertoOrigenConectando(bloques, conectando)?.y ?? 0} L ${conectando.x} ${conectando.y}`}
                  stroke="#6366f1" strokeWidth={2} strokeDasharray="5,4" fill="none" />
              )}
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {/* Nodos */}
            {bloques.map(bloque => {
              const info = TIPOS[bloque.tipo] ?? TIPOS.accion
              const c = COLOR_CLASSES[info.color]
              const Icon = info.icon
              const activo = seleccionado === bloque.id
              return (
                <div key={bloque.id} data-bloque-id={bloque.id}
                  onMouseDown={(e) => iniciarArrastre(e, bloque)}
                  onClick={(e) => { e.stopPropagation(); setSeleccionado(bloque.id) }}
                  style={{ position: 'absolute', left: bloque.pos_x, top: bloque.pos_y, width: NODE_WIDTH, cursor: 'grab' }}
                  className={`bg-white rounded-xl shadow-sm border-2 select-none ${activo ? 'border-indigo-500 shadow-md' : c.border}`}>
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100">
                    <Icon size={13} className={c.header} />
                    <span className={`text-xs font-bold ${c.header}`}>{tituloDeBloque(bloque)}</span>
                    <div className="flex-1" />
                    {bloque.tipo !== 'inicio' && (
                      <button data-no-drag onClick={(e) => { e.stopPropagation(); borrarBloque(bloque.id) }}
                        className="text-slate-300 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
                    {bloque.tipo === 'menu' ? (
                      <>
                        <p className="line-clamp-2 mb-2">{bloque.config?.pregunta}</p>
                        <div className="space-y-1">
                          {(bloque.config?.opciones ?? []).map((op, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 bg-indigo-50 rounded px-2 py-1.5 relative">
                              <span className="truncate">{op}</span>
                              <div data-port="salida"
                                onMouseDown={(e) => iniciarConexion(e, bloque.id, op)}
                                className="w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-white shrink-0 cursor-crosshair hover:scale-125 transition-transform" />
                            </div>
                          ))}
                          <div className="flex items-center justify-between gap-2 text-slate-400 px-2 py-1 relative">
                            <span className="text-[10px]">Si no responde</span>
                            <div data-port="salida"
                              onMouseDown={(e) => iniciarConexion(e, bloque.id, '__sem_resposta__')}
                              className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shrink-0 cursor-crosshair hover:scale-125 transition-transform" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="line-clamp-3">{resumenDeBloque(bloque) || 'Sin contenido'}</p>
                    )}
                  </div>

                  {bloque.tipo !== 'menu' && (
                    <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 relative">
                      <span>Siguiente paso</span>
                      <div data-port="salida"
                        onMouseDown={(e) => iniciarConexion(e, bloque.id, null)}
                        className={`w-2.5 h-2.5 rounded-full ${c.dot} border-2 border-white cursor-crosshair hover:scale-125 transition-transform`} />
                    </div>
                  )}

                  {/* Puerto de entrada (izquierda) */}
                  <div data-port="entrada"
                    onMouseUp={(e) => terminarConexion(e, bloque.id)}
                    style={{ position: 'absolute', left: -6, top: 40 }}
                    className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 hover:border-indigo-500 hover:scale-125 transition-transform" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Botón agregar */}
        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => setMenuTipos(v => !v)}
            className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-colors">
            <Plus size={20} />
          </button>
          {menuTipos && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {Object.entries(TIPOS).filter(([t]) => t !== 'inicio').map(([tipo, info]) => {
                const Icon = info.icon
                const c = COLOR_CLASSES[info.color]
                return (
                  <button key={tipo} onClick={() => agregarBloque(tipo)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Icon size={15} className={c.header} /> {info.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel de edición */}
        {bloqueSeleccionado && (
          <PanelEdicion
            bloque={bloqueSeleccionado}
            onGuardar={(config) => guardarConfigBloque(bloqueSeleccionado.id, config)}
            onCerrar={() => setSeleccionado(null)}
          />
        )}
      </div>

      {previsualizacao && (
        <ModalPreview bloques={bloques} conexiones={conexiones} onClose={() => setPrevisualizacao(false)} />
      )}
    </div>
  )
}

function puertoOrigenConectando(bloques, conectando) {
  const origen = bloques.find(b => b.id === conectando.origenId)
  if (!origen) return null
  return { x: origen.pos_x + NODE_WIDTH, y: origen.pos_y + 40 }
}

function PanelEdicion({ bloque, onGuardar, onCerrar }) {
  const [config, setConfig] = useState(bloque.config ?? {})
  useEffect(() => setConfig(bloque.config ?? {}), [bloque.id])

  const info = TIPOS[bloque.tipo] ?? TIPOS.accion

  const actualizarMensaje = (i, valor) => {
    const mensajes = [...(config.mensajes ?? [])]
    mensajes[i] = valor
    setConfig({ ...config, mensajes })
  }
  const agregarMensaje = () => setConfig({ ...config, mensajes: [...(config.mensajes ?? []), ''] })
  const quitarMensaje = (i) => setConfig({ ...config, mensajes: (config.mensajes ?? []).filter((_, idx) => idx !== i) })

  const actualizarOpcion = (i, valor) => {
    const opciones = [...(config.opciones ?? [])]
    opciones[i] = valor
    setConfig({ ...config, opciones })
  }
  const agregarOpcion = () => setConfig({ ...config, opciones: [...(config.opciones ?? []), `Opción ${(config.opciones?.length ?? 0) + 1}`] })
  const quitarOpcion = (i) => setConfig({ ...config, opciones: (config.opciones ?? []).filter((_, idx) => idx !== i) })

  return (
    <div className="w-96 bg-white border-l border-slate-200 shrink-0 overflow-y-auto" data-no-drag onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Editar {info.label}</h3>
        <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Título</label>
          <input value={config.titulo ?? ''} onChange={e => setConfig({ ...config, titulo: e.target.value })}
            className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400" />
        </div>

        {bloque.tipo === 'contenido' && (
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Mensajes</label>
            <div className="space-y-2">
              {(config.mensajes ?? []).map((m, i) => (
                <div key={i} className="flex gap-2">
                  <textarea value={m} onChange={e => actualizarMensaje(i, e.target.value)} rows={2}
                    className="flex-1 border border-slate-200 px-3 py-2 text-sm rounded-lg resize-none focus:outline-none focus:border-indigo-400" />
                  <button onClick={() => quitarMensaje(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={agregarMensaje} className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">+ Agregar mensaje</button>
          </div>
        )}

        {bloque.tipo === 'menu' && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Texto de la pregunta</label>
              <textarea value={config.pregunta ?? ''} onChange={e => setConfig({ ...config, pregunta: e.target.value })} rows={3}
                className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg resize-none focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Opciones de respuesta</label>
              <div className="space-y-2">
                {(config.opciones ?? []).map((op, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={op} onChange={e => actualizarOpcion(i, e.target.value)}
                      className="flex-1 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400" />
                    <button onClick={() => quitarOpcion(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={agregarOpcion} className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">+ Agregar opción</button>
            </div>
          </>
        )}

        {bloque.tipo === 'condicion' && (
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Condición</label>
            <input value={config.condicion ?? ''} onChange={e => setConfig({ ...config, condicion: e.target.value })}
              placeholder="ej. etiqueta == vip"
              className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
        )}

        {bloque.tipo === 'accion' && (
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Descripción de la acción</label>
            <input value={config.descripcion ?? ''} onChange={e => setConfig({ ...config, descripcion: e.target.value })}
              className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
        )}

        <button onClick={() => { onGuardar(config); onCerrar() }}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function ModalPreview({ bloques, conexiones, onClose }) {
  const inicio = bloques.find(b => b.tipo === 'inicio') ?? bloques[0]
  const [mensajes, setMensajes] = useState([])
  const [actualId, setActualId] = useState(inicio?.id ?? null)

  const avanzar = useCallback((desdeId, valor = null) => {
    const bloque = bloques.find(b => b.id === desdeId)
    if (!bloque) return
    const nuevos = []
    if (bloque.tipo === 'contenido') nuevos.push(...(bloque.config?.mensajes ?? []))
    if (bloque.tipo === 'menu') nuevos.push(bloque.config?.pregunta ?? '')

    const salida = conexiones.find(c => c.bloque_origen_id === desdeId && (valor === null || c.valor === valor))
      ?? conexiones.find(c => c.bloque_origen_id === desdeId && !c.valor)

    setMensajes(prev => [...prev, ...nuevos.map(t => ({ texto: t, bot: true }))])
    setActualId(salida ? salida.bloque_destino_id : null)

    const siguiente = salida ? bloques.find(b => b.id === salida.bloque_destino_id) : null
    if (siguiente && siguiente.tipo !== 'menu') {
      setTimeout(() => avanzar(siguiente.id), 300)
    }
  }, [bloques, conexiones])

  useEffect(() => { if (inicio) avanzar(inicio.id) }, [])

  const bloqueActual = bloques.find(b => b.id === actualId)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" style={{ height: 560 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Vista previa</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
          {mensajes.map((m, i) => (
            <div key={i} className="mr-auto max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm whitespace-pre-wrap">
              {m.texto}
            </div>
          ))}
          {bloqueActual?.tipo === 'menu' && (
            <div className="flex flex-col gap-1.5 pt-1">
              {(bloqueActual.config?.opciones ?? []).map((op, i) => (
                <button key={i} onClick={() => avanzar(bloqueActual.id, op)}
                  className="ml-auto max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm hover:bg-indigo-700 transition-colors">
                  {op}
                </button>
              ))}
            </div>
          )}
          {!bloqueActual && mensajes.length > 0 && (
            <p className="text-center text-xs text-slate-400 pt-2">Fin del flujo</p>
          )}
        </div>
      </div>
    </div>
  )
}
