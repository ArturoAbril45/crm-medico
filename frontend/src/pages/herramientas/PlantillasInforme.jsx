import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlantillasInforme, createPlantillaInforme, updatePlantillaInforme, deletePlantillaInforme } from '../../services/api'
import { Plus, Trash2, Pencil, FileText } from 'lucide-react'
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

const emptyForm = { nombre: '', tipo_estudio: '', contenido: '', activo: true }

export default function PlantillasInforme() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['plantillas-informe'], queryFn: () => getPlantillasInforme().then(r => r.data) })
  const plantillas = data ?? []

  const mutCreate = useMutation({ mutationFn: createPlantillaInforme, onSuccess: () => { qc.invalidateQueries(['plantillas-informe']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updatePlantillaInforme(id, d), onSuccess: () => { qc.invalidateQueries(['plantillas-informe']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deletePlantillaInforme, onSuccess: () => qc.invalidateQueries(['plantillas-informe']) })

  const abrirNuevo = () => { setForm(emptyForm); setModal('nuevo') }
  const abrirEditar = (p) => { setForm({ nombre: p.nombre, tipo_estudio: p.tipo_estudio ?? '', contenido: p.contenido, activo: p.activo }); setModal(p.id) }
  const guardar = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal, d: form })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plantillas de Informes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Textos reutilizables para agilizar la carga de informes de imágenes</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nueva Plantilla
        </button>
      </div>

      {isLoading ? <ModuleLoader /> : plantillas.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <FileText size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No hay plantillas creadas todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plantillas.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{p.nombre}</p>
                  {p.tipo_estudio && <p className="text-xs text-slate-400">{p.tipo_estudio}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => abrirEditar(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar plantilla?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-3">{p.contenido}</p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nueva Plantilla' : 'Editar Plantilla'} size="lg" onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Tipo de Estudio"><input value={form.tipo_estudio} onChange={e => setForm(f => ({ ...f, tipo_estudio: e.target.value }))} placeholder="Ej: Radiografía de tórax" className={inputCls} /></Field>
            </div>
            <Field label="Contenido" required>
              <textarea value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))} required rows={8} className={inputCls + ' resize-none'} />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="accent-indigo-600" />
              <span className="text-sm text-slate-700">Activa</span>
            </label>
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
