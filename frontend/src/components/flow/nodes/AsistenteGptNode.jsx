import { Handle, Position } from '@xyflow/react'
import { Sparkles } from 'lucide-react'

export default function AsistenteGptNode({ id, data }) {
  const config = data?.config ?? {}
  const instrucciones = config.instrucciones ?? ''
  const enviado = config.stats?.enviado ?? 0
  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-teal-200 shadow-sm w-60 rounded-lg overflow-hidden cursor-pointer hover:border-teal-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-teal-100 bg-teal-50">
        <Sparkles size={15} className="text-teal-500" />
        <p className="text-sm font-semibold text-slate-800">Assistente GPT</p>
      </div>
      <div className="px-3 pt-2.5">
        <div className="bg-slate-50 rounded-lg py-1.5 text-center">
          <p className="text-sm font-bold text-slate-700">{enviado}</p>
          <p className="text-[10px] text-slate-400">Enviado</p>
        </div>
      </div>
      <div className="p-3 text-xs text-slate-500">
        {instrucciones ? (
          <p className="line-clamp-3">{instrucciones}</p>
        ) : (
          <span className="text-slate-300 italic">Adicioná instrucciones detalladas y datos sobre tu empresa</span>
        )}
      </div>
      <div className="px-3 pb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-1">
          <Sparkles size={11} /> Asistente IA
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  )
}
