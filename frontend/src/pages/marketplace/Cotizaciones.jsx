import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCotizaciones, createCotizacion, deleteCotizacion, getProveedoresMkt } from '../../services/api'
import { Plus, Trash2, FileQuestion, X } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const estadoColors = { pendiente: 'bg-amber-100 text-amber-700', respondida: 'bg-blue-100 text-blue-700', aceptada: 'bg-green-100 text-green-700', rechazada: 'bg-red-100 text-red-700' }

const emptyItem = { descripcion: '', cantidad: 1 }

export default function Cotizaciones() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [proveedorId, setProveedorId] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [items, setItems] = useState([{ ...emptyItem }])

  const { data, isLoading } = useQuery({ queryKey: ['cotizaciones'], queryFn: () => getCotizaciones().then(r => r.data) })
  const cotizaciones = data ?? []
  const { data: proveedores } = useQuery({ queryKey: ['proveedores-mkt-cotiz'], queryFn: () => getProveedoresMkt().then(r => r.data) })

  const mutCreate = useMutation({
    mutationFn: createCotizacion,
    onSuccess: () => { qc.invalidateQueries(['cotizaciones']); setModal(false); setProveedorId(''); setMensaje(''); setItems([{ ...emptyItem }]) },
  })
  const mutDelete = useMutation({ mutationFn: deleteCotizacion, onSuccess: () => qc.invalidateQueries(['cotizaciones']) })

  const setItem = (idx, k, v) => setItems(its => its.map((it, i) => i === idx ? { ...it, [k]: v } : it))
  const guardar = (e) => {
    e.preventDefault()
    mutCreate.mutate({ proveedor_id: proveedorId, mensaje, items })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Cotizaciones</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nueva Cotización
        </button>
      </div>

      {isLoading ? <ModuleLoader /> : cotizaciones.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <FileQuestion size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No has solicitado ninguna cotización aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map(c => (
            <div key={c.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{c.proveedor?.nombre}</p>
                  <p className="text-xs text-slate-400">{parseFechaLocal(c.fecha).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[c.estado]}`}>{c.estado}</span>
                  <button onClick={() => { if (confirm('¿Eliminar cotización?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
              {c.mensaje && <p className="text-sm text-slate-500 mt-2">{c.mensaje}</p>}
              <div className="border-t border-slate-100 mt-3 pt-3 space-y-1">
                {c.items?.map(i => (
                  <p key={i.id} className="text-sm text-slate-600">{i.cantidad}x {i.descripcion}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Nueva Cotización" size="lg" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Proveedor" required>
              <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} required className={inputCls + ' bg-white'}>
                <option value="">Seleccionar proveedor</option>
                {(proveedores ?? []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </Field>
            <Field label="Mensaje"><textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={2} className={inputCls + ' resize-none'} /></Field>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Ítems a cotizar</label>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input value={it.descripcion} onChange={e => setItem(idx, 'descripcion', e.target.value)} placeholder="Descripción" required className={inputCls} />
                    <input type="number" min="1" value={it.cantidad} onChange={e => setItem(idx, 'cantidad', e.target.value)} className={inputCls + ' w-24'} />
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(its => its.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500"><X size={16} /></button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setItems(its => [...its, { ...emptyItem }])} className="mt-2 text-xs font-medium text-indigo-600 hover:underline">+ Agregar ítem</button>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Solicitar Cotización</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
