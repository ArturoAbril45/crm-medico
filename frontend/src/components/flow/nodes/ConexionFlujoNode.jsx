import { Handle, Position } from '@xyflow/react'
import { GitMerge } from 'lucide-react'

export default function ConexionFlujoNode({ id, data }) {
  const nombreFlujo = data?.config?.nombreFlujo ?? ''
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-green-200 shadow-sm w-56 rounded-lg overflow-hidden cursor-pointer hover:border-green-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-green-100 bg-green-50">
        <GitMerge size={15} className="text-green-600" />
        <p className="text-sm font-semibold text-slate-800">Conexión de flujo</p>
      </div>
      <div className="p-3 text-xs text-slate-700">
        {nombreFlujo || <span className="text-slate-300 italic">Sin flujo — hacé clic para editar</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
