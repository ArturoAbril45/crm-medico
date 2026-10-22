import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductosMkt, getBibliotecaDigital, agregarAlCarrito } from '../../services/api'
import { ShoppingCart, Sparkles, Library, Check } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

export default function TiendaDigital() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('tienda')
  const [agregadoId, setAgregadoId] = useState(null)

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos-digitales'],
    queryFn: () => getProductosMkt({ tipo: 'digital', incluir_propios: 1 }).then(r => r.data),
    enabled: tab === 'tienda',
  })
  const { data: biblioteca, isLoading: isLoadingBiblioteca } = useQuery({
    queryKey: ['biblioteca-digital'],
    queryFn: () => getBibliotecaDigital().then(r => r.data),
    enabled: tab === 'biblioteca',
  })

  const mutAgregar = useMutation({
    mutationFn: agregarAlCarrito,
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['carrito'])
      setAgregadoId(vars.producto_id)
      setTimeout(() => setAgregadoId(null), 1500)
    },
  })

  const lista = productos ?? []
  const items = biblioteca ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Marketplace</h1>
        <p className="text-sm text-slate-500 mt-0.5">Descubre recursos y guías digitales para optimizar tu gestión.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100">
        <button onClick={() => setTab('tienda')} className={`px-4 py-2.5 text-sm font-semibold ${tab === 'tienda' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>Tienda</button>
        <button onClick={() => setTab('biblioteca')} className={`px-4 py-2.5 text-sm font-semibold ${tab === 'biblioteca' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>Mi Biblioteca</button>
      </div>

      {tab === 'tienda' ? (
        isLoading ? <ModuleLoader /> : lista.length === 0 ? (
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
            <Sparkles size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Todavía no publicaste productos digitales</p>
            <p className="text-xs text-slate-400 mt-1">Podés crearlos desde Mi Tienda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lista.map(p => (
              <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 text-sm">{p.nombre}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">Digital</span>
                </div>
                {p.descripcion && <p className="text-xs text-slate-500">{p.descripcion}</p>}
                <p className="text-lg font-bold text-slate-800">${Number(p.precio).toFixed(0)}</p>
                <button onClick={() => mutAgregar.mutate({ producto_id: p.id })}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${agregadoId === p.id ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {agregadoId === p.id ? <><Check size={14} /> Agregado</> : <><ShoppingCart size={14} /> Comprar Ahora</>}
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        isLoadingBiblioteca ? <ModuleLoader /> : items.length === 0 ? (
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
            <Library size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Tu biblioteca está vacía</p>
            <p className="text-xs text-slate-400 mt-1">Los productos digitales que compres aparecerán acá</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-50">
            {items.map(i => (
              <div key={i.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{i.nombre_producto}</p>
                  <p className="text-xs text-slate-400">Pedido {i.pedido?.codigo}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Disponible</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
