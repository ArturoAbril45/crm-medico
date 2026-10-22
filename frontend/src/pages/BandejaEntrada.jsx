import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, MessageSquare, Send, Paperclip, Smile, Mic, Square,
  RotateCcw, CheckCheck, Sparkles, FileText, Play, Pause, Inbox as InboxIcon, GitBranch,
  Bell, HelpCircle, SlidersHorizontal, Slash, Archive, IdCard, ChevronDown,
} from 'lucide-react'
import {
  getConversaciones, getConversacion, tomarConversacion, devolverConversacion, resolverConversacion,
  getMensajes, enviarMensaje, sugerirRespuestaIa, getRespuestasRapidas,
  getFlujos, enviarFlujoAConversacion,
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import ModuleLoader from '../components/ModuleLoader'
import PerfilPanel from '../components/bandeja/PerfilPanel'

function horaDe(fechaIso) {
  if (!fechaIso) return ''
  return new Date(fechaIso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function reproducirSonidoAviso() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
    osc.onended = () => ctx.close()
  } catch {
    // navegador sin soporte de audio; se ignora silenciosamente
  }
}

function AudioBubble({ url }) {
  const ref = useRef(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const toggle = () => {
    if (!ref.current) return
    if (reproduciendo) ref.current.pause()
    else ref.current.play()
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        {reproduciendo ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <audio ref={ref} src={url} onPlay={() => setReproduciendo(true)} onPause={() => setReproduciendo(false)} onEnded={() => setReproduciendo(false)} className="hidden" />
      <span className="text-xs opacity-70">Audio</span>
    </div>
  )
}

// Si un mensaje saliente de texto termina en un listado numerado (los menus del
// bot los mandan asi: "pregunta\n\n1. Opcion\n2. Opcion"), se separa la pregunta
// de las opciones para mostrarlas como lista prolija en vez de texto plano —
// el mismo contenido que ya se manda como lista tocable real en WhatsApp.
function partirMenu(texto) {
  const lineas = (texto || '').split('\n')
  const idx = lineas.findIndex(l => /^\d+\.\s+/.test(l.trim()))
  if (idx === -1) return null
  const intro = lineas.slice(0, idx).join('\n').trim()
  const opciones = lineas.slice(idx).filter(l => /^\d+\.\s+/.test(l.trim())).map(l => l.trim().replace(/^\d+\.\s+/, ''))
  if (opciones.length < 2) return null
  return { intro, opciones }
}

function BurbujaMensaje({ m, nombreAgente }) {
  const esSaliente = m.tipo === 'saliente'
  const esTexto = m.tipo_contenido === 'texto' || !m.archivo_url
  const menu = esTexto ? partirMenu(m.contenido) : null
  return (
    <div className={`flex ${esSaliente ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-3.5 py-2 text-sm rounded-2xl ${esSaliente ? 'bg-emerald-100 text-slate-800 rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
        {esSaliente && <p className="text-[11px] font-semibold text-emerald-700 mb-0.5">{nombreAgente}</p>}
        {m.tipo_contenido === 'imagen' && m.archivo_url && (
          <img src={m.archivo_url} alt="" className="rounded-lg mb-1.5 max-h-60 object-cover" />
        )}
        {m.tipo_contenido === 'video' && m.archivo_url && (
          <video src={m.archivo_url} controls className="rounded-lg mb-1.5 max-h-60" />
        )}
        {m.tipo_contenido === 'audio' && m.archivo_url && <AudioBubble url={m.archivo_url} />}
        {m.tipo_contenido === 'documento' && m.archivo_url && (
          <a href={m.archivo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
            <FileText size={16} /> {m.contenido || 'Documento'}
          </a>
        )}
        {esTexto && (
          menu ? (
            <div>
              {menu.intro && <p className="whitespace-pre-wrap mb-2">{menu.intro}</p>}
              <div className="space-y-1">
                {menu.opciones.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/60 rounded-lg px-2.5 py-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-slate-700">{op}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{m.contenido}</p>
          )
        )}
        <p className={`text-[11px] mt-1 text-right ${esSaliente ? 'text-emerald-600/70' : 'text-slate-400'} flex items-center justify-end gap-1`}>
          {horaDe(m.created_at)} {esSaliente && <CheckCheck size={12} />}
        </p>
      </div>
    </div>
  )
}

export default function BandejaEntrada() {
  const { session } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('bandeja')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [firmar, setFirmar] = useState(true)
  const [grabando, setGrabando] = useState(false)
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false)
  const [sugiriendoIa, setSugiriendoIa] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(true)
  const [sonidoActivo, setSonidoActivo] = useState(() => localStorage.getItem('bandeja_sonido') !== '0')
  const [filtroLeido, setFiltroLeido] = useState('todos')
  const [filtroAsignado, setFiltroAsignado] = useState('ambos')
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const mensajesFinRef = useRef(null)
  const sonidoActivoRef = useRef(sonidoActivo)
  useEffect(() => { sonidoActivoRef.current = sonidoActivo }, [sonidoActivo])

  const { data: conversaciones, isLoading: cargandoLista } = useQuery({
    queryKey: ['conversaciones', tab, busqueda],
    queryFn: () => getConversaciones({ estado: tab === 'resueltos' ? 'cerrada' : undefined, buscar: busqueda || undefined }).then(r => r.data),
    refetchInterval: 6000,
  })

  // Avisa con un sonido cuando llega un mensaje nuevo a cualquier chat (si el sonido esta activo).
  const vistosRef = useRef(null)
  useEffect(() => {
    if (!conversaciones) return
    const actuales = new Map(conversaciones.map(c => [c.id, c.ultimo_mensaje_at]))
    if (vistosRef.current) {
      let hayNuevo = false
      for (const [id, ts] of actuales) {
        const anterior = vistosRef.current.get(id)
        if (ts && ts !== anterior) { hayNuevo = true; break }
      }
      if (hayNuevo && sonidoActivoRef.current) reproducirSonidoAviso()
    }
    vistosRef.current = actuales
  }, [conversaciones])

  const lista = (conversaciones ?? [])
    .filter(c => tab === 'resueltos' ? c.estado === 'cerrada' : c.estado !== 'cerrada')
    .filter(c => filtroLeido === 'todos' || c.mensajes_no_leidos > 0)
    .filter(c => filtroAsignado === 'ambos'
      || (filtroAsignado === 'mias' && c.agente_id === session?.id)
      || (filtroAsignado === 'sin_asignar' && !c.agente_id))
  const trabajandoEn = lista.filter(c => c.estado === 'abierta')
  const cola = lista.filter(c => c.estado === 'pendiente')

  const { data: conversacionSel } = useQuery({
    queryKey: ['conversacion', seleccionadoId],
    queryFn: () => getConversacion(seleccionadoId).then(r => r.data),
    enabled: !!seleccionadoId,
    refetchInterval: 6000,
  })

  const { data: mensajes } = useQuery({
    queryKey: ['mensajes', seleccionadoId],
    queryFn: () => getMensajes(seleccionadoId).then(r => r.data),
    enabled: !!seleccionadoId,
    refetchInterval: 4000,
  })

  const { data: respuestasRapidas } = useQuery({
    queryKey: ['respuestas-rapidas'],
    queryFn: () => getRespuestasRapidas().then(r => r.data),
  })

  useEffect(() => { mensajesFinRef.current?.scrollIntoView({ block: 'end' }) }, [mensajes?.length, seleccionadoId])

  const invalidarTodo = () => {
    qc.invalidateQueries({ queryKey: ['conversaciones'] })
    qc.invalidateQueries({ queryKey: ['conversacion', seleccionadoId] })
    qc.invalidateQueries({ queryKey: ['mensajes', seleccionadoId] })
  }

  const mutEnviar = useMutation({
    mutationFn: (data) => enviarMensaje(seleccionadoId, data),
    onSuccess: invalidarTodo,
  })
  const mutTomar = useMutation({ mutationFn: () => tomarConversacion(seleccionadoId), onSuccess: invalidarTodo })
  const mutDevolver = useMutation({ mutationFn: () => devolverConversacion(seleccionadoId), onSuccess: () => { invalidarTodo(); setSeleccionadoId(null) } })
  const mutResolver = useMutation({ mutationFn: () => resolverConversacion(seleccionadoId), onSuccess: () => { invalidarTodo(); setSeleccionadoId(null) } })
  const mutEnviarFlujo = useMutation({
    mutationFn: (flujoId) => enviarFlujoAConversacion(seleccionadoId, flujoId),
    onSuccess: () => { invalidarTodo(); qc.invalidateQueries({ queryKey: ['mensajes', seleccionadoId] }); setMenuFlujoAbierto(false) },
  })
  const [menuFlujoAbierto, setMenuFlujoAbierto] = useState(false)
  const [buscaFlujo, setBuscaFlujo] = useState('')
  const { data: flujosDisponibles } = useQuery({ queryKey: ['flujos-lista'], queryFn: getFlujos, select: r => r.data, enabled: menuFlujoAbierto })

  const enviarTexto = () => {
    const texto = mensaje.trim()
    if (!texto) return
    const contenido = firmar && session?.nombre ? `*${session.nombre}:*\n${texto}` : texto
    mutEnviar.mutate({ contenido })
    setMensaje('')
    setMostrarRespuestas(false)
  }

  const adjuntarArchivo = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const mime = file.type || ''
    const tipo = mime.startsWith('image/') ? 'imagen' : mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : 'documento'
    const form = new FormData()
    form.append('archivo', file)
    form.append('tipo_contenido', tipo)
    mutEnviar.mutate(form)
  }

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('archivo', blob, `nota-voz-${Date.now()}.webm`)
        form.append('tipo_contenido', 'audio')
        mutEnviar.mutate(form)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setGrabando(true)
    } catch {
      alert('No se pudo acceder al micrófono. Revisá los permisos del navegador.')
    }
  }
  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop()
    setGrabando(false)
  }

  const pedirSugerenciaIa = async () => {
    setSugiriendoIa(true)
    try {
      const { data } = await sugerirRespuestaIa(seleccionadoId)
      if (data.sugerencia) setMensaje(data.sugerencia)
      else alert(data.message || 'No se pudo generar una sugerencia')
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo generar una sugerencia')
    } finally {
      setSugiriendoIa(false)
    }
  }

  const respuestasFiltradas = useMemo(() => {
    if (!mostrarRespuestas) return []
    const q = mensaje.slice(1).toLowerCase()
    return (respuestasRapidas ?? []).filter(r => r.atajo.toLowerCase().includes(q)).slice(0, 6)
  }, [mostrarRespuestas, mensaje, respuestasRapidas])

  const onCambiarMensaje = (v) => {
    setMensaje(v)
    setMostrarRespuestas(v.startsWith('/'))
  }

  const paciente = conversacionSel?.paciente

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-[28px] shadow-lg overflow-hidden border border-slate-100">
      {/* Barra superior */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 shrink-0">
        <h1 className="text-lg font-bold text-slate-800">Inbox</h1>
        <div className="ml-auto flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none whitespace-nowrap">
            <span className="hidden sm:inline">Sonido de notificaciones</span>
            <button
              type="button"
              onClick={() => { const v = !sonidoActivo; setSonidoActivo(v); localStorage.setItem('bandeja_sonido', v ? '1' : '0') }}
              className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${sonidoActivo ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sonidoActivo ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </label>
          <button title="Notificaciones" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><Bell size={17} /></button>
          <button title="Ayuda" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><HelpCircle size={17} /></button>
          <div className="relative w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
            {(session?.nombre || '?')[0]?.toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
      {/* Panel izquierdo */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <select value={filtroLeido} onChange={e => setFiltroLeido(e.target.value)}
                className="appearance-none text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="todos">Todos</option>
                <option value="no_leidos">No leídos</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select value={filtroAsignado} onChange={e => setFiltroAsignado(e.target.value)}
                className="appearance-none text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="ambos">Ambos</option>
                <option value="mias">Mías</option>
                <option value="sin_asignar">Sin asignar</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button title="Restablecer filtros" onClick={() => { setFiltroLeido('todos'); setFiltroAsignado('ambos'); setBusqueda('') }}
              className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
              <SlidersHorizontal size={14} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[{ v: 'bandeja', l: 'Bandeja' }, { v: 'resueltos', l: 'Resueltos' }].map(f => (
              <button key={f.v} onClick={() => { setTab(f.v); setSeleccionadoId(null) }}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors rounded-lg ${tab === f.v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cargandoLista ? <ModuleLoader /> : lista.length === 0 ? (
            <div className="text-center text-slate-400 mt-10 px-4">
              <InboxIcon size={30} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">¡Nada acá!</p>
              <p className="text-xs mt-1">No se encontraron conversaciones con este estado o término de búsqueda</p>
            </div>
          ) : tab === 'resueltos' ? (
            <ListaConversaciones items={lista} seleccionadoId={seleccionadoId} onSelect={setSeleccionadoId} />
          ) : (
            <>
              {trabajandoEn.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Trabajando en</p>
                  <ListaConversaciones items={trabajandoEn} seleccionadoId={seleccionadoId} onSelect={setSeleccionadoId} />
                </>
              )}
              {cola.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Cola</p>
                  <ListaConversaciones items={cola} seleccionadoId={seleccionadoId} onSelect={setSeleccionadoId} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Panel chat */}
      {seleccionadoId && paciente ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {paciente.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{paciente.nombre} #{conversacionSel.id}</p>
              <p className="text-xs text-slate-400">{paciente.whatsapp || paciente.telefono}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {conversacionSel.estado === 'pendiente' && (
                <button onClick={() => mutTomar.mutate()} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
                  Tomar
                </button>
              )}
              {conversacionSel.estado !== 'cerrada' && (
                <>
                  <div className="relative">
                    <button onClick={() => setMenuFlujoAbierto(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors rounded-lg">
                      <GitBranch size={13} /> Enviar flujo
                    </button>
                    {menuFlujoAbierto && (
                      <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 shadow-xl rounded-xl z-20 overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input autoFocus value={buscaFlujo} onChange={e => setBuscaFlujo(e.target.value)} placeholder="Buscar flujo..."
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {(flujosDisponibles ?? [])
                            .filter(f => f.nombre.toLowerCase().includes(buscaFlujo.toLowerCase()))
                            .map(f => (
                              <button key={f.id} onClick={() => mutEnviarFlujo.mutate(f.id)} disabled={mutEnviarFlujo.isPending}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 transition-colors disabled:opacity-50">
                                {f.nombre}
                              </button>
                            ))}
                          {flujosDisponibles?.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4">No hay flujos creados</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => mutDevolver.mutate()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
                    <RotateCcw size={13} /> Devolver
                  </button>
                  <button onClick={() => mutResolver.mutate()} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg">
                    Resolver
                  </button>
                </>
              )}
              <button title="Archivar" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><Archive size={16} /></button>
              {!perfilAbierto && (
                <button onClick={() => setPerfilAbierto(true)} title="Ver perfil" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><IdCard size={16} /></button>
              )}
            </div>
          </div>

          {conversacionSel.opciones_menu_activo?.length > 0 && (
            <div className="px-5 py-2 border-b border-slate-100 bg-indigo-50/50 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-indigo-500 font-medium">Opciones del flujo activo:</span>
              {conversacionSel.opciones_menu_activo.map((op, i) => (
                <button key={i} onClick={() => setMensaje(op)}
                  className="px-2.5 py-1 text-xs bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors rounded-full">
                  {op}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
            {(mensajes ?? []).map(m => <BurbujaMensaje key={m.id} m={m} nombreAgente={session?.nombre ?? 'Agente'} />)}
            <div ref={mensajesFinRef} />
          </div>

          <div className="p-3 border-t border-slate-200 bg-white relative">
            {respuestasFiltradas.length > 0 && (
              <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {respuestasFiltradas.map(r => (
                  <button key={r.id} onClick={() => { setMensaje(r.mensaje); setMostrarRespuestas(false) }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <p className="text-xs font-medium text-indigo-600">/{r.atajo}</p>
                    <p className="text-xs text-slate-500 truncate">{r.mensaje}</p>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" checked={firmar} onChange={e => setFirmar(e.target.checked)} className="accent-indigo-600" />
                Firmar
              </label>
              <button onClick={pedirSugerenciaIa} disabled={sugiriendoIa}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                <Sparkles size={13} /> {sugiriendoIa ? 'Pensando...' : 'Sugerir con IA'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" onChange={adjuntarArchivo} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"><Paperclip size={18} /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"><Smile size={18} /></button>
              <button onClick={() => setMenuFlujoAbierto(v => !v)} title="Enviar flujo" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"><GitBranch size={18} /></button>
              <button onClick={() => onCambiarMensaje(mensaje.startsWith('/') ? mensaje : '/' + mensaje)} title="Respuestas rápidas" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"><Slash size={18} /></button>
              <input
                value={mensaje}
                onChange={e => onCambiarMensaje(e.target.value)}
                placeholder='Escriba un mensaje o presione "/" para usar las respuestas rápidas'
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onKeyDown={e => e.key === 'Enter' && enviarTexto()}
              />
              {grabando ? (
                <button onClick={detenerGrabacion} className="px-3 py-2.5 bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 rounded-xl shrink-0 animate-pulse">
                  <Square size={14} />
                </button>
              ) : mensaje.trim() ? (
                <button onClick={enviarTexto} className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 rounded-xl shrink-0">
                  <Send size={15} />
                </button>
              ) : (
                <button onClick={iniciarGrabacion} className="px-4 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-2 rounded-xl shrink-0">
                  <Mic size={15} />
                </button>
              )}
            </div>
            {mutEnviar.isError && (
              <p className="text-xs text-red-500 mt-2">{mutEnviar.error?.response?.data?.error || 'No se pudo enviar. ¿Está conectado el WhatsApp?'}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>Selecciona una conversación</p>
          </div>
        </div>
      )}

      {seleccionadoId && paciente && perfilAbierto && (
        <PerfilPanel conversacion={conversacionSel} paciente={paciente} onCerrar={() => setPerfilAbierto(false)} />
      )}
      </div>
    </div>
  )
}

function ListaConversaciones({ items, seleccionadoId, onSelect }) {
  return items.map(conv => (
    <button key={conv.id} onClick={() => onSelect(conv.id)}
      className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${seleccionadoId === conv.id ? 'bg-indigo-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
          {conv.paciente?.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-semibold text-slate-800 truncate">{conv.paciente?.nombre ?? 'Contacto'}</p>
            <span className="text-xs text-slate-400 shrink-0 ml-2">{horaDe(conv.ultimo_mensaje_at)}</span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{conv.ultimo_mensaje}</p>
        </div>
        {conv.mensajes_no_leidos > 0 && (
          <span className="w-5 h-5 bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0 rounded-full">
            {conv.mensajes_no_leidos}
          </span>
        )}
      </div>
    </button>
  ))
}
