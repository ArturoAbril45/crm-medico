import { Handle, Position } from '@xyflow/react'
import { Shuffle } from 'lucide-react'

export default function RandomizerNode({ id, data }) {
  const ramas = data?.config?.ramas ?? [{ id: 'a', porcentaje: 50 }, { id: 'b', porcentaje: 50 }]
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-sky-200 shadow-sm w-56 rounded-lg overflow-hidden cursor-pointer hover:border-sky-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-sky-100 bg-sky-50">
        <Shuffle size={15} className="text-sky-500" />
        <p className="text-sm font-semibold text-slate-800">Randomizer</p>
      </div>
      <div className="p-3 relative space-y-1.5">
        {ramas.map((r, i) => (
          <div key={r.id} className="bg-sky-50 rounded-md px-2 py-1.5 text-xs text-slate-700 flex justify-between">
            <span>Rama {r.id.toUpperCase()}</span>
            <span className="text-slate-400">{r.porcentaje}%</span>
          </div>
        ))}
        {ramas.map((r, i) => (
          <Handle key={r.id} type="source" position={Position.Right} id={`rama_${r.id}`}
            style={{ top: `${((i + 0.5) / ramas.length) * 100}%` }}
            className="!bg-sky-500 !w-2.5 !h-2.5" />
        ))}
      </div>
    </div>
  )
}
