import { Handle, Position } from '@xyflow/react'
import { Clock, Copy, Trash2 } from 'lucide-react'

const unidadLabel = { minutos: 'min', horas: 'h', dias: 'días' }

export default function RetrasoInteligenteNode({ id, data }) {
  const { cantidad, unidad, modo } = data?.config ?? {}
  const configurado = modo === 'fecha' ? !!data?.config?.fecha : !!cantidad

  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-orange-200 shadow-sm w-56 rounded-lg overflow-hidden cursor-pointer hover:border-orange-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-orange-100 bg-orange-50">
        <Clock size={15} className="text-orange-500" />
        <p className="text-sm font-semibold text-slate-800">Retraso inteligente</p>
        <div className="ml-auto flex gap-1 text-slate-300">
          <Trash2 size={13} />
          <Copy size={13} />
        </div>
      </div>
      <div className="p-3">
        {configurado ? (
          <p className="text-xs text-slate-700">
            {modo === 'fecha' ? `Continúa el ${data.config.fecha} ${data.config.hora ?? ''}` : `Espera ${cantidad} ${unidadLabel[unidad] ?? 'min'}`}
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2">Establecer el tiempo de espera antes del siguiente paso</p>
            <p className="text-xs font-medium text-orange-700 bg-orange-50 border border-dashed border-orange-300 rounded-lg px-3 py-2 text-center">
              Añadir retardo
            </p>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
