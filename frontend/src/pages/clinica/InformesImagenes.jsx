import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInformesImagen, createInformeImagen, updateInformeImagen, getPacientes, getPlantillasInforme } from '../../services/api'
import { Plus, RefreshCw, ScanLine, FileText } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const estadoOptions = [
  { value: 'pendiente', label: 'Pendiente de informar' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'preliminar', label: 'Preliminar' },
  { value: 'firmado', label: 'Firmado' },
]
const estadoColors = {
  pendiente: 'bg-amber-100 text-amber-700',
  borrador: 'bg-slate-100 text-slate-600',
  preliminar: 'bg-blue-100 text-blue-700',
  firmado: 'bg-green-100 text-green-700',
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

const emptyForm = { paciente_id: '', tipo_estudio: '', estado: 'pendiente', contenido: '', fecha: new Date().toISOString().slice(0, 10) }

export default function InformesImagenes() {
  const qc = useQueryClient()
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['informes-imagen', desde, hasta, estado],
    queryFn: () => getInformesImagen({ desde: desde || undefined, hasta: hasta || undefined, estado: estado || undefined }).then(r => r.data),
  })
  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-informes'], queryFn: () => getPacientes({ per_page: 100 }).then(r => r.data) })
  const pacientes = pacientesData?.data ?? []
  const { data: plantillas } = useQuery({ queryKey: ['plantillas-informe'], queryFn: () => getPlantillasInforme().then(r => r.data) })

  const mutCreate = useMutation({
    mutationFn: createInformeImagen,
    onSuccess: () => { qc.invalidateQueries(['informes-imagen']); setModal(false); setForm(emptyForm) },
  })

  const informes = data?.informes ?? []
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const guardar = (e) => {
    e.preventDefault()
    mutCreate.mutate(form)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Informes de Estudios por Imágenes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Turnos de tu departamento pendientes e informados</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Nuevo Informe
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pendientes', value: data?.pendientes ?? 0, color: 'text-amber-600' },
          { label: 'Borradores', value: data?.borradores ?? 0, color: 'text-slate-600' },
          { label: 'Preliminares', value: data?.preliminares ?? 0, color: 'text-blue-600' },
          { label: 'Firmados', value: data?.firmados ?? 0, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <Field label="Desde"><input type="date" value={desde} onChange={e => setDesde(e.target.value)} className={inputCls} /></Field>
        <Field label="Hasta"><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className={inputCls} /></Field>
        <Field label="Estado">
          <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls + ' bg-white'}>
            <option value="">Todos</option>
            {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <button onClick={() => refetch()} className="mt-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <ModuleLoader />
        ) : informes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <ScanLine size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay turnos de estudios por imágenes en este período.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Tipo de Estudio</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {informes.map(i => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{i.paciente ? `${i.paciente.nombre} ${i.paciente.apellido ?? ''}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600 flex items-center gap-1.5"><FileText size={13} className="text-slate-400" /> {i.tipo_estudio}</td>
                  <td className="px-4 py-3 text-slate-600">{i.medico ? `Dr(a). ${i.medico.nombre} ${i.medico.apellido}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(i.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[i.estado]}`}>{estadoOptions.find(o => o.value === i.estado)?.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nuevo Informe" size="lg" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Paciente" required>
                <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} required className={inputCls + ' bg-white'}>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </Field>
              <Field label="Fecha" required><input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className={inputCls} /></Field>
              <Field label="Tipo de Estudio" required><input value={form.tipo_estudio} onChange={e => set('tipo_estudio', e.target.value)} required placeholder="Ej: Radiografía de tórax" className={inputCls} /></Field>
              <Field label="Estado">
                <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls + ' bg-white'}>
                  {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            {plantillas?.length > 0 && (
              <Field label="Usar plantilla (opcional)">
                <select onChange={e => { const p = plantillas.find(x => String(x.id) === e.target.value); if (p) set('contenido', p.contenido) }} defaultValue="" className={inputCls + ' bg-white'}>
                  <option value="">Sin plantilla</option>
                  {plantillas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </Field>
            )}
            <Field label="Contenido del informe">
              <textarea value={form.contenido} onChange={e => set('contenido', e.target.value)} rows={5} placeholder="Hallazgos, impresión diagnóstica..." className={inputCls + ' resize-none'} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Informe</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
