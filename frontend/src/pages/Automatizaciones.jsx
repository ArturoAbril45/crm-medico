import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAutomatizaciones, createAutomatizacion, updateAutomatizacion, toggleAutomatizacion, deleteAutomatizacion, getFlujos } from '../services/api'
import { Plus, Pencil, Trash2, Zap, ToggleLeft, ToggleRight } from 'lucide-react'
import Modal from '../components/Modal'

const emptyForm = { nombre: '', flujo_id: '', tipo: 'palabra_clave', palabra_clave: '', condicion: 'es_igual', activo: true }
const tipoLabels = { palabra_clave: 'Palabra Clave', evento: 'Evento', horario: 'Horario' }
const condicionLabels = { contiene: 'Contiene', es_igual: 'Es igual a', empieza_con: 'Empieza con' }

export default function Automatizaciones() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['automatizaciones'], queryFn: () => getAutomatizaciones().then(r => r.data) })
  const { data: flujosList } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createAutomatizacion, onSuccess: () => { qc.invalidateQueries(['automatizaciones']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateAutomatizacion(id, data), onSuccess: () => { qc.invalidateQueries(['automatizaciones']); setModal(null) } })
  const mutToggle = useMutation({ mutationFn: toggleAutomatizacion, onSuccess: () => qc.invalidateQueries(['automatizaciones']) })
  const mutDelete = useMutation({ mutationFn: deleteAutomatizacion, onSuccess: () => qc.invalidateQueries(['automatizaciones']) })

  const autos = Array.isArray(data) ? data : []
  const flujos = Array.isArray(flujosList) ? flujosList : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (a) => { setForm({ nombre: a.nombre, flujo_id: a.flujo_id ?? '', tipo: a.tipo, palabra_clave: a.palabra_clave ?? '', condicion: a.condicion ?? 'es_igual', activo: a.activo }); setModal(a) }
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
          <h1 className="text-2xl font-bold text-slate-800">Automatizaciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">{autos.filter(a => a.activo).length} activas · {autos.length} total</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nueva Automatización
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {autos.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${a.activo ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${a.activo ? 'bg-amber-50' : 'bg-slate-100'}`}>
                <Zap size={18} className={a.activo ? 'text-amber-500' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 text-sm">{a.nombre}</h3>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{tipoLabels[a.tipo]}</span>
                </div>
                {a.palabra_clave && (
                  <p className="text-xs text-slate-400 mt-1">
                    {condicionLabels[a.condicion]}: <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">"{a.palabra_clave}"</span>
                  </p>
                )}
                {a.flujo && <p className="text-xs text-indigo-500 mt-0.5">→ {a.flujo.nombre}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 tabular-nums">{(a.ejecuciones ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">ejecuciones</p>
                </div>
                <button onClick={() => mutToggle.mutate(a.id)} className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700">
                  {a.activo ? <ToggleRight size={22} className="text-indigo-500" /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm('¿Eliminar automatización?')) mutDelete.mutate(a.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {autos.length === 0 && <div className="text-center py-16 text-slate-400">No hay automatizaciones configuradas</div>}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nueva Automatización' : 'Editar Automatización'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Flujo a ejecutar</label>
              <select value={form.flujo_id} onChange={e => set('flujo_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Sin flujo</option>
                {flujos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {form.tipo === 'palabra_clave' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Condición</label>
                  <select value={form.condicion} onChange={e => set('condicion', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {Object.entries(condicionLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Palabra clave</label>
                  <input value={form.palabra_clave} onChange={e => set('palabra_clave', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm text-slate-700">Automatización activa</span>
            </label>
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
