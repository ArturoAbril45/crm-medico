import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPedidosMkt } from '../../services/api'
import { PackageSearch } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const estadoColors = {
  pendiente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  completado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function Pedidos() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['pedidos-mkt'], queryFn: () => getPedidosMkt().then(r => r.data) })
  const pedidos = data ?? []

  if (isLoading) return <ModuleLoader fixed />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <PackageSearch size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No tienes pedidos recientes.</p>
          <button onClick={() => navigate('/marketplace/tienda-medica')} className="mt-3 text-sm font-medium text-indigo-600 hover:underline">Ir a la tienda</button>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{p.codigo}</p>
                  <p className="text-xs text-slate-400">{parseFechaLocal(p.fecha).toLocaleDateString()} · {p.items?.length ?? 0} ítem(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">${Number(p.total).toFixed(2)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[p.estado]}`}>{p.estado}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-3 space-y-1">
                {p.items?.map(i => (
                  <div key={i.id} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{i.cantidad}x {i.nombre_producto}</span>
                    <span>${(i.cantidad * Number(i.precio_unitario)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
