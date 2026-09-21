import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProcedimientos, createProcedimiento, updateProcedimiento, deleteProcedimiento } from '../services/api'
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import Modal from '../components/Modal'

const categorias = ['Cirugía Facial', 'Cirugía Corporal', 'Tratamiento Estético', 'Consulta']
const emptyForm = {
  nombre: '', descripcion: '', categoria: 'Cirugía Facial', precio_consulta: 250,
  tipo_precio: 'fijo', precio_procedimiento: '', precio_base: '', porcentaje_descuento: '', duracion_min: 60,
}

export default function Procedimientos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['procedimientos'], queryFn: () => getProcedimientos().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createProcedimiento, onSuccess: () => { qc.invalidateQueries(['procedimientos']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateProcedimiento(id, data), onSuccess: () => { qc.invalidateQueries(['procedimientos']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteProcedimiento, onSuccess: () => qc.invalidateQueries(['procedimientos']) })

  const procs = Array.isArray(data) ? data : []
  const grouped = procs.reduce((acc, p) => { const k = p.categoria; if (!acc[k]) acc[k] = []; acc[k].push(p); return acc }, {})

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (p) => {
    setForm({
      ...p, descripcion: p.descripcion ?? '', tipo_precio: p.tipo_precio ?? 'fijo',
      precio_base: p.precio_base ?? '', porcentaje_descuento: p.porcentaje_descuento ?? '',
    })
    setModal(p)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal.id, data: form })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Procedimientos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Catálogo de procedimientos y precios</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Procedimiento
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-indigo-50 rounded-xl"><Stethoscope size={18} className="text-indigo-600" /></div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('¿Desactivar procedimiento?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">{p.nombre}</h3>
                    <p className="text-xs text-slate-400 mb-3">{p.descripcion}</p>
                    <div className="space-y-1 text-sm">
                      {p.precio_consulta > 0 && <div className="flex justify-between"><span className="text-slate-500">Consulta</span><span className="font-semibold text-slate-700">Bs. {parseFloat(p.precio_consulta).toLocaleString()}</span></div>}
                      {p.tipo_precio === 'porcentaje' && p.precio_base > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Procedimiento</span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 line-through">Bs. {parseFloat(p.precio_base).toLocaleString()}</span>
                            <span className="text-xs font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">-{p.porcentaje_descuento}%</span>
                            <span className="font-semibold text-indigo-600">Bs. {parseFloat(p.precio_procedimiento).toLocaleString()}</span>
                          </span>
                        </div>
                      ) : p.precio_procedimiento > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Procedimiento</span><span className="font-semibold text-indigo-600">Bs. {parseFloat(p.precio_procedimiento).toLocaleString()}</span></div>
                      )}
                      <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-50 mt-2">
                        <span>Duración</span><span>{p.duracion_min} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Procedimiento' : 'Editar Procedimiento'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Categoría</label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Precio Consulta</label>
                <input type="number" value={form.precio_consulta} onChange={e => set('precio_consulta', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Duración (min)</label>
                <input type="number" value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipo de Precio del Procedimiento</label>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {[['fijo', 'Precio Fijo'], ['porcentaje', '% de Descuento']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => set('tipo_precio', v)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${form.tipo_precio === v ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {form.tipo_precio === 'porcentaje' ? (
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-xl">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Precio Base (Bs.)</label>
                  <input type="number" value={form.precio_base} onChange={e => set('precio_base', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">% de Descuento</label>
                  <input type="number" value={form.porcentaje_descuento} onChange={e => set('porcentaje_descuento', e.target.value)} min={0} max={100} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <p className="col-span-2 text-xs text-indigo-600">
                  Precio final: <strong>Bs. {form.precio_base ? (form.precio_base * (1 - (form.porcentaje_descuento || 0) / 100)).toFixed(2) : '0.00'}</strong>
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Precio Proced. (Bs.)</label>
                <input type="number" value={form.precio_procedimiento} onChange={e => set('precio_procedimiento', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                {modal === 'nuevo' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
