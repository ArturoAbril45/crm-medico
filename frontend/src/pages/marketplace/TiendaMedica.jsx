import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductosMkt, getProveedoresMkt, agregarAlCarrito } from '../../services/api'
import { ShoppingCart, Package, Check } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"

export default function TiendaMedica() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const proveedorId = searchParams.get('proveedor_id') || ''
  const [categoria, setCategoria] = useState('')
  const [agregadoId, setAgregadoId] = useState(null)

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos-mkt', proveedorId, categoria],
    queryFn: () => getProductosMkt({ tipo: 'fisico', proveedor_id: proveedorId || undefined, categoria: categoria || undefined }).then(r => r.data),
  })
  const { data: proveedores } = useQuery({ queryKey: ['proveedores-mkt-filtro'], queryFn: () => getProveedoresMkt().then(r => r.data) })

  const mutAgregar = useMutation({
    mutationFn: agregarAlCarrito,
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['carrito'])
      setAgregadoId(vars.producto_id)
      setTimeout(() => setAgregadoId(null), 1500)
    },
  })

  const lista = productos ?? []
  const categorias = [...new Set(lista.map(p => p.categoria).filter(Boolean))]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tienda Médica</h1>
        <p className="text-sm text-slate-500 mt-0.5">{lista.length} producto{lista.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={proveedorId} onChange={e => setSearchParams(e.target.value ? { proveedor_id: e.target.value } : {})} className={inputCls + ' max-w-[220px]'}>
          <option value="">Todos los proveedores</option>
          {(proveedores ?? []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls + ' max-w-[200px]'}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? <ModuleLoader /> : lista.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <Package size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lista.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{p.unidad_medida}</span>
              <p className="font-semibold text-slate-800 text-sm mt-1 flex-1">{p.nombre}</p>
              <p className="text-xs text-slate-400 mt-0.5">{p.proveedor?.nombre}</p>
              <p className="text-lg font-bold text-slate-800 mt-2">${Number(p.precio).toFixed(0)} <span className="text-xs font-normal text-slate-400">{p.moneda}</span></p>
              <button onClick={() => mutAgregar.mutate({ producto_id: p.id })}
                className={`mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${agregadoId === p.id ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {agregadoId === p.id ? <><Check size={14} /> Agregado</> : <><ShoppingCart size={14} /> Agregar al carrito</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
