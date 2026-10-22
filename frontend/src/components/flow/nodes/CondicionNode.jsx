import { Handle, Position } from '@xyflow/react'
import { GitBranch } from 'lucide-react'

export default function CondicionNode({ id, data }) {
  const { campo, operador, valor } = data?.config ?? {}
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-amber-200 shadow-sm w-60 rounded-lg overflow-hidden cursor-pointer hover:border-amber-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-100 bg-amber-50">
        <GitBranch size={15} className="text-amber-500" />
        <p className="text-sm font-semibold text-slate-800">Condición</p>
      </div>
      <div className="p-3 relative">
        <p className="text-xs text-slate-700 font-mono bg-slate-50 rounded-md px-2 py-1.5">
          {campo && operador ? `${campo} ${operador} ${valor ?? ''}` : 'Sin condición — hacé clic para editar'}
        </p>
        <div className="flex justify-between mt-3 text-[11px] text-slate-400">
          <span>Verdadero</span>
          <span>Falso</span>
        </div>
        <Handle type="source" position={Position.Right} id="true" style={{ top: '38%' }} className="!bg-green-500 !w-2.5 !h-2.5" />
        <Handle type="source" position={Position.Right} id="false" style={{ top: '62%' }} className="!bg-red-500 !w-2.5 !h-2.5" />
      </div>
    </div>
  )
}
