import { Handle, Position } from '@xyflow/react'
import { Star, Image, Video, FileText, Music, Save, Power, User } from 'lucide-react'

const iconosBloque = { imagen: Image, video: Video, archivo: FileText, audio: Music, guardar: Save, autooff: Power, contacto: User }

function PreviewBloque({ b }) {
  if (b.type === 'retraso') {
    return (
      <div className="bg-red-50 rounded-lg px-2.5 py-2 space-y-0.5">
        <p className="text-[11px] font-medium text-red-500">Atraso</p>
        <p className="text-[10px] text-slate-400">
          {b.escritura ?? true ? 'Digitando' : 'Esperando'} {b.segundos ?? 3} seg...
        </p>
      </div>
    )
  }
  if (b.type === 'texto' || !b.type) {
    return (
      <p className="text-xs text-slate-700 bg-slate-50 rounded-md px-2 py-1.5 line-clamp-3">
        {b.texto || '(vacío)'}
      </p>
    )
  }
  const Icon = iconosBloque[b.type] ?? FileText
  const detalle = b.type === 'guardar' ? (b.campo ? `Campo: ${b.campo}` : 'Sin campo elegido')
    : b.type === 'autooff' ? 'Apaga la automatización'
    : b.type === 'contacto' ? (b.nombre || 'Sin nombre')
    : (b.url || 'Sin URL')
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-md px-2 py-1.5">
      <Icon size={13} className="text-red-400 shrink-0" />
      <p className="text-xs text-slate-600 truncate">{detalle}</p>
    </div>
  )
}

export default function ContenidoNode({ id, data }) {
  const bloques = data?.config?.bloques ?? []
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-red-200 shadow-sm w-64 rounded-lg overflow-hidden cursor-pointer hover:border-red-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Star size={15} className="text-red-500" />
        <p className="text-sm font-semibold text-slate-800">Contenido</p>
      </div>
      <div className="px-3 pb-2 space-y-2 max-h-52 overflow-y-auto">
        {bloques.length === 0 && (
          <p className="text-xs text-slate-400 italic">Sin mensajes — hacé clic para editar</p>
        )}
        {bloques.map((b, i) => <PreviewBloque key={i} b={b} />)}
      </div>
      <div className="flex items-center justify-end gap-1.5 px-3 py-1.5 border-t border-slate-100 text-[11px] text-slate-400">
        El siguiente paso
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
