import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProveedoresMkt, createProveedorMkt, deleteProveedorMkt } from '../../services/api'
import { Plus, Trash2, Store, MapPin } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const categorias = ['laboratorio', 'farmacia', 'insumos', 'equipos', 'servicios', 'otro']
const categoriaLabels = { laboratorio: 'Laboratorio', farmacia: 'Farmacia', insumos: 'Insumos', equipos: 'Equipos', servicios: 'Servicios', otro: 'Otro' }
const provincias = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'San Luis', 'Tucumán', 'Salta', 'Jujuy',
  'Misiones', 'Entre Ríos', 'Neuquén', 'Río Negro', 'Chaco', 'Corrientes', 'Santiago del Estero',
  'San Juan', 'La Pampa', 'Catamarca', 'La Rioja', 'Chubut', 'Formosa', 'Santa Cruz', 'Tierra del Fuego',
]

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const emptyForm = { nombre: '', categoria: 'farmacia', provincia: '', ciudad: '', descripcion: '' }

export default function Proveedores() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [categoria, setCategoria] = useState('')
  const [provincia, setProvincia] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores-mkt', categoria, provincia],
    queryFn: () => getProveedoresMkt({ categoria: categoria || undefined, provincia: provincia || undefined }).then(r => r.data),
  })
  const proveedores = data ?? []

  const mutCreate = useMutation({
    mutationFn: createProveedorMkt,
    onSuccess: () => { qc.invalidateQueries(['proveedores-mkt']); setModal(false); setForm(emptyForm) },
  })
  const mutDelete = useMutation({ mutationFn: deleteProveedorMkt, onSuccess: () => qc.invalidateQueries(['proveedores-mkt']) })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Directorio de Proveedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">{proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''} disponible{proveedores.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls + ' bg-white max-w-[200px]'}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{categoriaLabels[c]}</option>)}
        </select>
        <select value={provincia} onChange={e => setProvincia(e.target.value)} className={inputCls + ' bg-white max-w-[200px]'}>
          <option value="">Todas las provincias</option>
          {provincias.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {isLoading ? <ModuleLoader /> : proveedores.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <Store size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No se encontraron proveedores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {p.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{categoriaLabels[p.categoria]}</p>
                  </div>
                </div>
                <button onClick={() => { if (confirm('¿Eliminar proveedor?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                  <Trash2 size={14} />
                </button>
              </div>
              {(p.provincia || p.ciudad) && (
                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {[p.ciudad, p.provincia].filter(Boolean).join(', ')}</p>
              )}
              <button onClick={() => navigate(`/marketplace/tienda-medica?proveedor_id=${p.id}`)} className="w-full text-center text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50">
                Ver catálogo ({p.productos_count})
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Nuevo Proveedor" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría" required>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls + ' bg-white'}>
                  {categorias.map(c => <option key={c} value={c}>{categoriaLabels[c]}</option>)}
                </select>
              </Field>
              <Field label="Provincia">
                <select value={form.provincia} onChange={e => setForm(f => ({ ...f, provincia: e.target.value }))} className={inputCls + ' bg-white'}>
                  <option value="">—</option>
                  {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Ciudad"><input value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} className={inputCls} /></Field>
            <Field label="Descripción"><textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} className={inputCls + ' resize-none'} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
