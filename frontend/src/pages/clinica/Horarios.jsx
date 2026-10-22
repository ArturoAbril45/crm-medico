import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedicos, getHorariosMedicos, createHorarioMedico, updateHorarioMedico, deleteHorarioMedico } from '../../services/api'
import { Plus, Trash2, Clock4, X } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const diasSemana = [
  { v: 0, l: 'DO' }, { v: 1, l: 'LU' }, { v: 2, l: 'MA' }, { v: 3, l: 'MI' },
  { v: 4, l: 'JU' }, { v: 5, l: 'VI' }, { v: 6, l: 'SÁ' },
]
const rangoOptions = [
  { v: 'indefinido', l: 'Indefinido' }, { v: 'recurrente', l: 'Recurrente' },
  { v: 'un_dia', l: 'Un día' }, { v: 'una_semana', l: 'Una semana' }, { v: 'mes', l: 'Mes' },
]
const tipoConsultaOptions = [
  { v: 'hibrido', l: 'Híbrido (Ambos)' }, { v: 'presencial', l: 'Presencial' }, { v: 'telemedicina', l: 'Telemedicina' },
]
const duracionOptions = [
  { v: '', l: '⚕️ Usar duración de práctica' },
  { v: '10', l: '10 minutos' }, { v: '15', l: '15 minutos (consulta estándar)' },
  { v: '20', l: '20 minutos' }, { v: '25', l: '25 minutos' },
  { v: '30', l: '30 minutos (práctica / procedimiento)' },
  { v: '45', l: '45 minutos' }, { v: '60', l: '60 minutos (primera consulta)' },
]

const emptyForm = {
  medico_id: '', rango_aplicacion: 'recurrente', dias_semana: [], valido_desde: '', valido_hasta: '',
  hora_inicio: '', hora_fin: '', tipo_consulta: 'hibrido', duracion_turno: '',
  requiere_coseguro: false, monto_coseguro: '',
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

export default function Horarios() {
  const qc = useQueryClient()
  const [medicoSel, setMedicoSel] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: medicosData } = useQuery({ queryKey: ['medicos-horarios'], queryFn: () => getMedicos({ per_page: 100 }).then(r => r.data) })
  const medicos = medicosData?.data ?? []

  const { data: horariosData, isLoading } = useQuery({
    queryKey: ['horarios', medicoSel],
    queryFn: () => getHorariosMedicos(medicoSel ? { medico_id: medicoSel } : {}).then(r => r.data),
  })
  const horarios = horariosData ?? []

  const mutCreate = useMutation({ mutationFn: createHorarioMedico, onSuccess: () => qc.invalidateQueries(['horarios']) })
  const mutDelete = useMutation({ mutationFn: deleteHorarioMedico, onSuccess: () => qc.invalidateQueries(['horarios']) })

  const openNew = () => { setForm({ ...emptyForm, medico_id: medicoSel }); setModal('nuevo') }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDia = (d) => set('dias_semana', form.dias_semana.includes(d) ? form.dias_semana.filter(x => x !== d) : [...form.dias_semana, d])

  const handleSubmit = (e) => {
    e.preventDefault()
    mutCreate.mutate(form, { onSuccess: () => setModal(null) })
  }

  const nombreMedico = (id) => {
    const m = medicos.find(x => String(x.id) === String(id))
    return m ? `Dr(a). ${m.nombre} ${m.apellido}` : '—'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Disponibilidad</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dile hola a una agenda perfectamente equilibrada.</p>
        </div>
        <button onClick={openNew} disabled={!medicoSel} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus size={16} /> Nuevo Horario
        </button>
      </div>

      <div className="max-w-sm">
        <label className="text-xs font-medium text-slate-600 block mb-1">Médico</label>
        <select value={medicoSel} onChange={e => setMedicoSel(e.target.value)} className={inputCls + ' bg-white'}>
          <option value="">Seleccionar médico...</option>
          {medicos.map(m => <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido}</option>)}
        </select>
        {medicos.length === 0 && <p className="text-[11px] text-slate-400 mt-1">Todavía no cargaste médicos.</p>}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-xl">
        {!medicoSel ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Clock4 size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Seleccioná un médico para ver su disponibilidad</p>
          </div>
        ) : isLoading ? (
          <ModuleLoader />
        ) : horarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Clock4 size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Sin horarios configurados</p>
            <button onClick={openNew} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus size={15} /> Nuevo Horario
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Días</th>
              <th className="px-4 py-3 font-medium">Horario</th>
              <th className="px-4 py-3 font-medium">Rango</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {horarios.map(h => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{(h.dias_semana ?? []).map(d => diasSemana.find(x => x.v === d)?.l).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{h.hora_inicio} – {h.hora_fin}</td>
                  <td className="px-4 py-3 text-slate-600">{rangoOptions.find(r => r.v === h.rango_aplicacion)?.l}</td>
                  <td className="px-4 py-3 text-slate-600">{tipoConsultaOptions.find(t => t.v === h.tipo_consulta)?.l}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar horario?')) mutDelete.mutate(h.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Gestionar Disponibilidad" size="lg" onClose={() => setModal(null)}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide -mt-2 mb-4">Configure nuevos rangos de atención — {nombreMedico(form.medico_id)}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Rango de Aplicación">
              <select value={form.rango_aplicacion} onChange={e => set('rango_aplicacion', e.target.value)} className={inputCls + ' bg-white'}>
                {rangoOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </Field>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Días de la Semana</label>
              <div className="flex gap-2">
                {diasSemana.map(d => (
                  <button key={d.v} type="button" onClick={() => toggleDia(d.v)}
                    className={`w-10 h-10 rounded-full text-xs font-semibold transition-colors ${form.dias_semana.includes(d.v) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {d.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Válido Desde"><input type="date" value={form.valido_desde} onChange={e => set('valido_desde', e.target.value)} className={inputCls} /></Field>
              <Field label="Válido Hasta"><input type="date" value={form.valido_hasta} onChange={e => set('valido_hasta', e.target.value)} className={inputCls} /></Field>
              <Field label="Inicio" required><input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} required className={inputCls} /></Field>
              <Field label="Fin" required><input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} required className={inputCls} /></Field>
            </div>

            <Field label="Tipo de Consulta">
              <select value={form.tipo_consulta} onChange={e => set('tipo_consulta', e.target.value)} className={inputCls + ' bg-white'}>
                {tipoConsultaOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </Field>

            <Field label="Duración por Turno">
              <select value={form.duracion_turno} onChange={e => set('duracion_turno', e.target.value)} className={inputCls + ' bg-white'}>
                {duracionOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Los slots se generarán según la duración elegida (o de cada práctica asignada al médico).</p>
            </Field>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Gestión de Cobro</h3>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.requiere_coseguro} onChange={e => set('requiere_coseguro', e.target.checked)} className="accent-indigo-600" />
                <span className="text-sm text-slate-700">¿Requiere Coseguro?</span>
              </label>
              {form.requiere_coseguro && (
                <Field label="Monto del Coseguro" className="max-w-xs">
                  <input type="number" step="0.01" value={form.monto_coseguro} onChange={e => set('monto_coseguro', e.target.value)} className={inputCls} />
                </Field>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Disponibilidad</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
