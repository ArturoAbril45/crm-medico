import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSiniestrosArt, createSiniestroArt, updateSiniestroArt, deleteSiniestroArt, getEmpleados } from '../../services/api'
import { Plus, Trash2, HeartPulse, Pencil } from 'lucide-react'
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

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const tipoLabels = { accidente_trabajo: 'Accidente de Trabajo', enfermedad_profesional: 'Enfermedad Profesional', accidente_in_itinere: 'Accidente In Itinere' }
const estadoColors = { denunciado: 'bg-amber-100 text-amber-700', en_tratamiento: 'bg-blue-100 text-blue-700', alta_medica: 'bg-green-100 text-green-700', rechazado: 'bg-red-100 text-red-700' }
const estadoLabels = { denunciado: 'Denunciado', en_tratamiento: 'En Tratamiento', alta_medica: 'Alta Médica', rechazado: 'Rechazado' }

const emptyForm = { empleado_id: '', tipo: 'accidente_trabajo', fecha_siniestro: new Date().toISOString().slice(0, 10), descripcion: '', art_nombre: '', numero_siniestro: '', estado: 'denunciado', dias_baja: '', fecha_alta: '' }

export default function MedicinaLaboral() {
  const qc = useQueryClient()
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['siniestros-art', estado],
    queryFn: () => getSiniestrosArt({ estado: estado || undefined }).then(r => r.data),
  })
  const siniestros = data ?? []
  const { data: empleadosData } = useQuery({ queryKey: ['empleados-siniestros'], queryFn: () => getEmpleados().then(r => r.data) })
  const empleados = empleadosData ?? []

  const mutCreate = useMutation({ mutationFn: createSiniestroArt, onSuccess: () => { qc.invalidateQueries(['siniestros-art']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updateSiniestroArt(id, d), onSuccess: () => { qc.invalidateQueries(['siniestros-art']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteSiniestroArt, onSuccess: () => qc.invalidateQueries(['siniestros-art']) })

  const abrirNuevo = () => { setForm(emptyForm); setModal('nuevo') }
  const abrirEditar = (s) => {
    setForm({
      empleado_id: s.empleado_id, tipo: s.tipo, fecha_siniestro: s.fecha_siniestro.slice(0, 10), descripcion: s.descripcion,
      art_nombre: s.art_nombre ?? '', numero_siniestro: s.numero_siniestro ?? '', estado: s.estado,
      dias_baja: s.dias_baja ?? '', fecha_alta: s.fecha_alta ? s.fecha_alta.slice(0, 10) : '',
    })
    setModal(s.id)
  }
  const guardar = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal, d: form })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medicina Laboral &amp; ART</h1>
          <p className="text-sm text-slate-500 mt-0.5">Siniestros laborales, ART y certificados médicos</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Siniestro
        </button>
      </div>

      <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls + ' bg-white max-w-[200px]'}>
        <option value="">Todos los estados</option>
        {Object.entries(estadoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : siniestros.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <HeartPulse size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay siniestros registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Empleado</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">ART</th>
              <th className="px-4 py-3 font-medium">Días de Baja</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {siniestros.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.empleado?.nombre} {s.empleado?.apellido}</td>
                  <td className="px-4 py-3 text-slate-600">{tipoLabels[s.tipo]}</td>
                  <td className="px-4 py-3 text-slate-600">{parseFechaLocal(s.fecha_siniestro).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{s.art_nombre || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.dias_baja ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[s.estado]}`}>{estadoLabels[s.estado]}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirEditar(s)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar siniestro?')) mutDelete.mutate(s.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Siniestro Laboral' : 'Editar Siniestro'} size="lg" onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Empleado" required>
              <select value={form.empleado_id} onChange={e => setForm(f => ({ ...f, empleado_id: e.target.value }))} required className={inputCls + ' bg-white'}>
                <option value="">Seleccionar empleado</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo" required>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls + ' bg-white'}>
                  {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Fecha del Siniestro" required><input type="date" value={form.fecha_siniestro} onChange={e => setForm(f => ({ ...f, fecha_siniestro: e.target.value }))} required className={inputCls} /></Field>
            </div>
            <Field label="Descripción" required><textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required rows={3} className={inputCls + ' resize-none'} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ART"><input value={form.art_nombre} onChange={e => setForm(f => ({ ...f, art_nombre: e.target.value }))} placeholder="Ej: Galeno ART" className={inputCls} /></Field>
              <Field label="N° de Siniestro (ART)"><input value={form.numero_siniestro} onChange={e => setForm(f => ({ ...f, numero_siniestro: e.target.value }))} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Estado">
                <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} className={inputCls + ' bg-white'}>
                  {Object.entries(estadoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Días de Baja"><input type="number" min="0" value={form.dias_baja} onChange={e => setForm(f => ({ ...f, dias_baja: e.target.value }))} className={inputCls} /></Field>
              <Field label="Fecha de Alta"><input type="date" value={form.fecha_alta} onChange={e => setForm(f => ({ ...f, fecha_alta: e.target.value }))} className={inputCls} /></Field>
            </div>
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
