import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMiTienda, getMiProveedor, createProductoMkt, updateProductoMkt, deleteProductoMkt } from '../../services/api'
import { Plus, Trash2, Pencil, Store } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const emptyForm = { nombre: '', categoria: '', unidad_medida: 'unidad', tipo: 'fisico', precio: '', stock: '', descripcion: '' }

export default function MiTienda() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: productos, isLoading } = useQuery({ queryKey: ['mi-tienda'], queryFn: () => getMiTienda().then(r => r.data) })
  const { data: miProveedor } = useQuery({ queryKey: ['mi-proveedor'], queryFn: () => getMiProveedor().then(r => r.data) })
  const lista = productos ?? []

  const mutCreate = useMutation({
    mutationFn: (d) => createProductoMkt({ ...d, proveedor_id: miProveedor.id }),
    onSuccess: () => { qc.invalidateQueries(['mi-tienda']); setModal(null) },
  })
  const mutUpdate = useMutation({
    mutationFn: ({ id, d }) => updateProductoMkt(id, { ...d, proveedor_id: miProveedor.id }),
    onSuccess: () => { qc.invalidateQueries(['mi-tienda']); setModal(null) },
  })
  const mutDelete = useMutation({ mutationFn: deleteProductoMkt, onSuccess: () => qc.invalidateQueries(['mi-tienda']) })

  const abrirNuevo = () => { setForm(emptyForm); setModal('nuevo') }
  const abrirEditar = (p) => { setForm({ nombre: p.nombre, categoria: p.categoria ?? '', unidad_medida: p.unidad_medida, tipo: p.tipo, precio: p.precio, stock: p.stock ?? '', descripcion: p.descripcion ?? '' }); setModal(p.id) }
  const guardar = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal, d: form })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mi Tienda</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publicá tus productos y servicios en el Marketplace.</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Store size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Todavía no publicaste ningún producto</p>
            <button onClick={abrirNuevo} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              <Plus size={15} /> Nuevo Producto
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {lista.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${p.tipo === 'digital' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{p.tipo}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium">${Number(p.precio).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.tipo === 'digital' ? '—' : (p.stock ?? '—')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirEditar(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar producto?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Producto' : 'Editar Producto'} onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo" required>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls + ' bg-white'}>
                  <option value="fisico">Físico</option>
                  <option value="digital">Digital</option>
                </select>
              </Field>
              <Field label="Precio" required><input type="number" step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} required className={inputCls} /></Field>
            </div>
            {form.tipo === 'fisico' && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Unidad de Medida">
                  <select value={form.unidad_medida} onChange={e => setForm(f => ({ ...f, unidad_medida: e.target.value }))} className={inputCls + ' bg-white'}>
                    {['unidad', 'tablet', 'caja', 'frasco', 'paquete'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
                <Field label="Stock"><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputCls} /></Field>
              </div>
            )}
            <Field label="Categoría"><input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls} /></Field>
            <Field label="Descripción"><textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} className={inputCls + ' resize-none'} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
