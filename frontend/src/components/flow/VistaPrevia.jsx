import Modal from '../Modal'
import { User, Paperclip, Mic } from 'lucide-react'

export default function VistaPrevia({ nodes, edges, onClose }) {
  const inicio = nodes.find(n => n.type === 'inicio')
  const pasos = []
  let actual = inicio
  const visitados = new Set()

  while (actual && !visitados.has(actual.id) && pasos.length < 30) {
    visitados.add(actual.id)
    if (actual.type === 'contenido') pasos.push(actual)
    const siguiente = edges.find(e => e.source === actual.id)
    actual = siguiente ? nodes.find(n => n.id === siguiente.target) : null
  }

  const items = pasos.flatMap(nodo => nodo.data.config?.bloques ?? [])
  const hora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

  return (
    <Modal title="Visualización" onClose={onClose} size="sm">
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 flex flex-col h-[520px]">
        {/* Tarjeta de contacto */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User size={13} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">Contacto de prueba</p>
            <p className="text-xs text-slate-400">Ir a la tarjeta de contacto</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Este flujo todavía no tiene bloques de contenido conectados desde el inicio.
            </p>
          ) : items.map((b, i) => b.type === 'retraso' ? (
            <div key={i} className="text-center">
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {b.segundos ?? 3} segundos de retraso
              </span>
            </div>
          ) : (
            <div key={i} className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%]">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{b.texto || '(vacío)'}</p>
              <p className="text-[10px] text-slate-300 text-right mt-1">{hora}</p>
            </div>
          ))}
        </div>

        {/* Barra inferior (deshabilitada) */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-slate-100 shrink-0">
          <Paperclip size={16} className="text-indigo-400 shrink-0" />
          <textarea disabled placeholder="" className="flex-1 h-8 resize-none text-sm bg-transparent outline-none" />
          <Mic size={16} className="text-slate-300 shrink-0" />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Simulación simplificada — sigue el primer camino desde "Bloque Inicial", sin ramas de menú/condición.
      </p>
    </Modal>
  )
}
