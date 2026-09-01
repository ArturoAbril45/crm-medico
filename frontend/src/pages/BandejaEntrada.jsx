import { useState } from 'react'
import { Search, MessageSquare, CheckCheck, User, Send, Paperclip, Smile } from 'lucide-react'

const conversaciones = [
  { id: 1, nombre: 'María García', telefono: '+591 70123456', ultimo: 'Quisiera saber sobre el precio de la rinoplastia', hora: '10:32', no_leidos: 2, estado: 'activo' },
  { id: 2, nombre: 'Carlos Mendoza', telefono: '+591 71234567', ultimo: 'Gracias por la información, lo pensaré', hora: '09:15', no_leidos: 0, estado: 'resuelto' },
  { id: 3, nombre: 'Ana Flores', telefono: '+591 72345678', ultimo: '¿Tienen disponibilidad para el viernes?', hora: '08:50', no_leidos: 1, estado: 'activo' },
  { id: 4, nombre: 'Roberto Lima', telefono: '+591 73456789', ultimo: 'Perfecto, confirmo la cita para el lunes', hora: 'Ayer', no_leidos: 0, estado: 'resuelto' },
  { id: 5, nombre: 'Lucía Vargas', telefono: '+591 74567890', ultimo: 'Hola, necesito información sobre blefaroplastia', hora: 'Ayer', no_leidos: 3, estado: 'activo' },
]

const mensajesDemo = [
  { id: 1, texto: 'Hola, buenos días. Quisiera consultar sobre el procedimiento de rinoplastia.', de: 'cliente', hora: '10:20' },
  { id: 2, texto: 'Buenos días, María. Con gusto le informo. La rinoplastia es un procedimiento que puede mejorar la forma y función de la nariz.', de: 'clinica', hora: '10:22' },
  { id: 3, texto: 'Quisiera saber sobre el precio de la rinoplastia', de: 'cliente', hora: '10:32' },
]

export default function BandejaEntrada() {
  const [seleccionado, setSeleccionado] = useState(conversaciones[0])
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const filtradas = conversaciones.filter(c => {
    const coincide = c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    if (filtro === 'activos') return coincide && c.estado === 'activo'
    if (filtro === 'resueltos') return coincide && c.estado === 'resuelto'
    return coincide
  })

  return (
    <div className="flex h-full -m-6 bg-white border border-slate-200" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Panel izquierdo */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-800 mb-3">Bandeja de Entrada</h1>
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
            <button key={conv.id} onClick={() => setSeleccionado(conv)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${seleccionado?.id === conv.id ? 'bg-indigo-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
                  {conv.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold text-slate-800 truncate">{conv.nombre}</p>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{conv.hora}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.ultimo}</p>
                </div>
                {conv.no_leidos > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0 rounded-full">
                    {conv.no_leidos}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel chat */}
      {seleccionado ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header chat */}
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {seleccionado.nombre[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{seleccionado.nombre}</p>
              <p className="text-xs text-slate-400">{seleccionado.telefono}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${seleccionado.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {seleccionado.estado}
              </span>
              <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 rounded-lg">
                <User size={13} /> Ver Paciente
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
            {mensajesDemo.map(m => (
              <div key={m.id} className={`flex ${m.de === 'clinica' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm rounded-2xl ${m.de === 'clinica' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                  <p>{m.texto}</p>
                  <p className={`text-xs mt-1 text-right ${m.de === 'clinica' ? 'text-indigo-200' : 'text-slate-400'}`}>{m.hora}</p>
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <CheckCheck size={12} /> Chatbot respondió — esperando respuesta del cliente
            </p>
          </div>

          {/* Input mensaje */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><Paperclip size={18} /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><Smile size={18} /></button>
              <input
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribir mensaje..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onKeyDown={e => e.key === 'Enter' && setMensaje('')}
              />
              <button
                onClick={() => setMensaje('')}
                className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 rounded-xl"
              >
                <Send size={15} />
              </button>
            </div>
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
