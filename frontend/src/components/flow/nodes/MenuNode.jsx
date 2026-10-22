import { Handle, Position } from '@xyflow/react'
import { LayoutGrid, ChevronRight } from 'lucide-react'

export default function MenuNode({ id, data }) {
  const opciones = data?.config?.opciones ?? []
  const pregunta = data?.config?.pregunta ?? ''
  const entradaInvalida = data?.config?.textoEntradaInvalida ?? ''
  const limitarErrores = data?.config?.limitarErrores ?? 3
  const enviado = data?.config?.stats?.enviado ?? 0
  const clicada = data?.config?.stats?.clicadaPct ?? 0

  return (
    <div
      onClick={() => data?.onEdit?.(id)}
      className="bg-white border border-violet-200 shadow-sm w-72 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-300 transition-colors"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 px-3.5 py-3">
        <LayoutGrid size={16} className="text-violet-500" />
        <p className="text-sm font-semibold text-slate-800">Menú</p>
      </div>
      <div className="px-3.5 pb-1 grid grid-cols-2 gap-2">
        <div className="border border-violet-100 rounded-lg py-1.5 text-center">
          <p className="text-sm font-bold text-violet-600">{enviado}</p>
          <p className="text-[10px] text-slate-400">Enviado</p>
        </div>
        <div className="border border-violet-100 rounded-lg py-1.5 text-center">
          <p className="text-sm font-bold text-violet-600">{clicada}%</p>
          <p className="text-[10px] text-slate-400">Clickeado</p>
        </div>
      </div>
      <div className="px-3.5 py-2.5 space-y-2">
        <div>
          <p className="text-xs text-slate-400">Texto de la pregunta</p>
          {pregunta && <p className="text-xs text-slate-700 mt-0.5">{pregunta}</p>}
        </div>
        <div className="relative space-y-2">
          {opciones.map((op, i) => (
            <div key={op.id ?? i} className="flex items-center justify-between gap-2 bg-violet-50 rounded-lg px-2.5 py-1.5">
              <div>
                <p className="text-[10px] text-violet-400">Respuesta {i + 1}</p>
                <p className="text-xs text-slate-700">{op.texto || '...'}</p>
              </div>
              <span className="text-[10px] font-medium text-violet-400 shrink-0">CTR {op.ctrPct ?? 0}%</span>
            </div>
          ))}
          {opciones.map((op, i) => (
            <Handle
              key={op.id ?? i}
              type="source"
              position={Position.Right}
              id={`option_${op.id ?? i}`}
              style={{ top: `${((i + 0.5) / opciones.length) * 100}%` }}
              className="!bg-violet-500 !w-2.5 !h-2.5"
            />
          ))}
        </div>
        <div>
          <p className="text-xs text-slate-400">Texto para entrada inválida</p>
          {entradaInvalida && <p className="text-xs text-slate-700 mt-0.5">{entradaInvalida}</p>}
        </div>
        <div>
          <p className="text-xs text-slate-400">Salida de error</p>
          <p className="text-xs text-slate-700 mt-0.5">
            Limitar la cantidad de errores y después usar salida adicional: <span className="font-semibold">{limitarErrores}</span>
          </p>
        </div>
      </div>
      <div className="relative flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
        Si el usuario no responde
        <ChevronRight size={13} className="text-violet-400" />
        <Handle type="source" position={Position.Right} id="inactivity" className="!bg-slate-400 !w-2.5 !h-2.5" />
      </div>
    </div>
  )
}
