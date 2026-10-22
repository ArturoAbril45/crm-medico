import { Handle, Position } from '@xyflow/react'
import { Play } from 'lucide-react'

export default function InicioNode() {
  return (
    <div className="bg-white border border-slate-200 shadow-sm w-56 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50">
        <Play size={15} className="text-slate-600" />
        <p className="text-sm font-semibold text-slate-800">Bloque Inicial</p>
      </div>
      <div className="p-3 text-xs text-slate-400 leading-relaxed">
        Tu flujo empieza en este bloque.
        Conectalo con otro bloque.
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
