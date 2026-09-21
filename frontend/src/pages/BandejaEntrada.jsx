import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getConversaciones, getMensajesWhatsapp, enviarMensajeWhatsapp } from '../services/api'
import { Search, MessageSquare, User, Send, QrCode, Paperclip, FileText, Download } from 'lucide-react'

export default function BandejaEntrada() {
  const qc = useQueryClient()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [mensaje, setMensaje] = useState('')
  const scrollRef = useRef(null)
  const archivoInputRef = useRef(null)

  const { data: conversacionesData } = useQuery({
    queryKey: ['conversaciones'],
    queryFn: () => getConversaciones().then(r => r.data),
    refetchInterval: 5000,
  })
  const conversaciones = Array.isArray(conversacionesData) ? conversacionesData : []
  const seleccionado = conversaciones.find(c => c.id === seleccionadoId) ?? conversaciones[0] ?? null

  const { data: mensajesData } = useQuery({
    queryKey: ['mensajes-whatsapp', seleccionado?.id],
    queryFn: () => getMensajesWhatsapp(seleccionado.id).then(r => r.data),
    enabled: !!seleccionado,
    refetchInterval: 4000,
  })
  const mensajes = Array.isArray(mensajesData) ? mensajesData : []

  const mutEnviar = useMutation({
    mutationFn: enviarMensajeWhatsapp,
    onSuccess: () => {
      setMensaje('')
      qc.invalidateQueries({ queryKey: ['mensajes-whatsapp', seleccionado?.id] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [mensajes.length, seleccionado?.id])

  const filtradas = conversaciones.filter(c => {
    const coincide = (c.nombre || c.telefono || '').toLowerCase().includes(busqueda.toLowerCase())
    if (filtro === 'activos') return coincide && c.estado === 'activo'
    if (filtro === 'resueltos') return coincide && c.estado === 'resuelto'
    return coincide
  })

  const enviar = () => {
    if (!mensaje.trim() || !seleccionado) return
    mutEnviar.mutate({ conversacion_id: seleccionado.id, texto: mensaje.trim() })
  }

  const enviarArchivo = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !seleccionado) return
    const form = new FormData()
    form.append('conversacion_id', seleccionado.id)
    form.append('archivo', file)
    if (mensaje.trim()) form.append('texto', mensaje.trim())
    mutEnviar.mutate(form)
  }

  return (
    <div className="flex h-full -m-6 bg-white border border-slate-200" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Panel izquierdo */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-slate-800">Bandeja de Entrada</h1>
            <Link to="/whatsapp/conectar" title="Conectar WhatsApp" className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
              <QrCode size={17} />
            </Link>
          </div>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['todos', 'activos', 'resueltos'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors rounded-lg ${filtro === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtradas.map(conv => (
            <button key={conv.id} onClick={() => setSeleccionadoId(conv.id)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${seleccionado?.id === conv.id ? 'bg-indigo-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
                  {(conv.nombre || conv.telefono || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold text-slate-800 truncate">{conv.nombre || conv.telefono}</p>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">
                      {conv.ultimo_mensaje_at ? new Date(conv.ultimo_mensaje_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.ultimo_mensaje || 'Sin mensajes todavía'}</p>
                </div>
                {conv.no_leidos > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0 rounded-full">
                    {conv.no_leidos}
                  </span>
                )}
              </div>
            </button>
          ))}

          {filtradas.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">
              <QrCode size={22} className="mx-auto mb-2 text-slate-300" />
              Todavía no hay conversaciones.<br />
              <Link to="/whatsapp/conectar" className="text-indigo-600 font-medium hover:underline">Conecta tu WhatsApp</Link> para empezar a recibir mensajes.
            </div>
          )}
        </div>
      </div>

      {/* Panel chat */}
      {seleccionado ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {(seleccionado.nombre || seleccionado.telefono || '?')[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{seleccionado.nombre || 'Sin nombre'}</p>
              <p className="text-xs text-slate-400">{seleccionado.telefono}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${seleccionado.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {seleccionado.estado}
              </span>
              {seleccionado.paciente && (
                <span className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white flex items-center gap-1.5 rounded-lg">
                  <User size={13} /> {seleccionado.paciente.nombre}
                </span>
              )}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
            {mensajes.map(m => (
              <div key={m.id} className={`flex ${m.de === 'clinica' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm rounded-2xl ${m.de === 'clinica' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                  {m.tipo === 'imagen' && m.archivo_url && (
                    <img src={m.archivo_url} alt="" className="rounded-lg mb-1.5 max-w-full" />
                  )}
                  {m.tipo === 'audio' && m.archivo_url && (
                    <audio controls src={m.archivo_url} className="mb-1.5 max-w-full" />
                  )}
                  {m.tipo === 'documento' && m.archivo_url && (
                    <a href={m.archivo_url} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-2 mb-1.5 px-3 py-2 rounded-lg text-xs font-medium ${m.de === 'clinica' ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                      <FileText size={16} className="shrink-0" />
                      <span className="truncate flex-1">{m.archivo_nombre || 'Archivo'}</span>
                      <Download size={14} className="shrink-0" />
                    </a>
                  )}
                  {m.texto && <p>{m.texto}</p>}
                  <p className={`text-xs mt-1 text-right ${m.de === 'clinica' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {mensajes.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">Todavía no hay mensajes en esta conversación.</p>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input ref={archivoInputRef} type="file" className="hidden" onChange={enviarArchivo}
                accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx" />
              <button
                onClick={() => archivoInputRef.current?.click()}
                disabled={mutEnviar.isPending}
                title="Adjuntar foto, audio o archivo"
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribir mensaje..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onKeyDown={e => e.key === 'Enter' && enviar()}
              />
              <button
                onClick={enviar}
                disabled={mutEnviar.isPending || !mensaje.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 rounded-xl disabled:opacity-50"
              >
                <Send size={15} />
              </button>
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
    </div>
  )
}
