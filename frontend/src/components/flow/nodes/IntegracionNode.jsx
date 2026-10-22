import { Handle, Position } from '@xyflow/react'
import { Plug } from 'lucide-react'

const labels = {
  zapier: 'Zapier ⚡', webhook: 'Webhook 🔗', google_sheets: 'Hojas de Google 📊', rd_station: 'RD Station 🔶',
}

export default function IntegracionNode({ id, data }) {
  const tipo = data?.config?.tipo
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-pink-200 shadow-sm w-56 rounded-lg overflow-hidden cursor-pointer hover:border-pink-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-pink-100 bg-pink-50">
        <Plug size={15} className="text-pink-500" />
        <p className="text-sm font-semibold text-slate-800">Integración</p>
      </div>
      <div className="p-3">
        {tipo ? (
          <p className="text-xs text-slate-700">{labels[tipo] ?? tipo}</p>
        ) : (
          <p className="text-xs font-medium text-pink-700 bg-pink-50 border border-dashed border-pink-300 rounded-lg px-3 py-2 text-center">
            Añadir método de integración
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
