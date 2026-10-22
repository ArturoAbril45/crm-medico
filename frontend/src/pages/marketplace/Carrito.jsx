import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCarrito, actualizarCarritoItem, eliminarCarritoItem, checkoutCarrito } from '../../services/api'
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

export default function Carrito() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['carrito'], queryFn: () => getCarrito().then(r => r.data) })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const mutActualizar = useMutation({ mutationFn: ({ id, cantidad }) => actualizarCarritoItem(id, { cantidad }), onSuccess: () => qc.invalidateQueries(['carrito']) })
  const mutEliminar = useMutation({ mutationFn: eliminarCarritoItem, onSuccess: () => qc.invalidateQueries(['carrito']) })
  const mutCheckout = useMutation({
    mutationFn: checkoutCarrito,
    onSuccess: (res) => { qc.invalidateQueries(['carrito']); navigate('/marketplace/pedidos'); },
  })

  if (isLoading) return <ModuleLoader fixed />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Mi Carrito</h1>

      {items.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <ShoppingCart size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">Tu carrito está vacío.</p>
          <button onClick={() => navigate('/marketplace/tienda-medica')} className="mt-3 text-sm font-medium text-indigo-600 hover:underline">Ir a la tienda</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-50">
            {items.map(i => (
              <div key={i.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{i.producto?.nombre}</p>
                  <p className="text-xs text-slate-400">{i.producto?.proveedor?.nombre} · ${Number(i.producto?.precio).toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1">
                  <button onClick={() => mutActualizar.mutate({ id: i.id, cantidad: Math.max(1, i.cantidad - 1) })} className="p-1 text-slate-500 hover:text-slate-800"><Minus size={13} /></button>
                  <span className="text-sm font-medium w-6 text-center">{i.cantidad}</span>
                  <button onClick={() => mutActualizar.mutate({ id: i.id, cantidad: i.cantidad + 1 })} className="p-1 text-slate-500 hover:text-slate-800"><Plus size={13} /></button>
                </div>
                <p className="font-semibold text-slate-800 w-20 text-right">${(i.cantidad * Number(i.producto?.precio ?? 0)).toFixed(2)}</p>
                <button onClick={() => mutEliminar.mutate(i.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 h-fit space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="text-2xl font-bold text-slate-800">${Number(total).toFixed(2)}</span>
            </div>
            <button onClick={() => mutCheckout.mutate()} disabled={mutCheckout.isPending}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {mutCheckout.isPending ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
