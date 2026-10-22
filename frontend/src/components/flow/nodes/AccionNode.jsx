import { Handle, Position } from '@xyflow/react'
import { Zap } from 'lucide-react'

export default function AccionNode({ id, data }) {
  const { tipoAccion, valor } = data?.config ?? {}
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-amber-200 shadow-sm w-56 rounded-lg overflow-hidden cursor-pointer hover:border-amber-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-100 bg-amber-50">
        <Zap size={15} className="text-amber-500" />
        <p className="text-sm font-semibold text-slate-800">Acción</p>
      </div>
      <div className="p-3">
        {tipoAccion ? (
          <div className="text-xs text-slate-700">
            <p className="font-medium">{tipoAccion}</p>
            {valor && <p className="text-slate-400 mt-0.5">{valor}</p>}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2">¿Qué medidas se deben tomar?</p>
            <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-dashed border-amber-300 rounded-lg px-3 py-2 text-center">
              Añadir Acción
            </p>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
