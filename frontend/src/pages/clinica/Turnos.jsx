import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCitas, createCita, updateCita, deleteCita, getPacientes, getMedicos, checkinCita } from '../../services/api'
import { Plus, Download, MoreVertical, Trash2, Pencil, CalendarClock, UserCheck } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const estadoOptions = [
  { value: 'pendiente', label: 'Programada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'realizada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]
const estadoColors = {
  pendiente: 'bg-amber-100 text-amber-700',
  confirmada: 'bg-blue-100 text-blue-700',
  realizada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  no_asistio: 'bg-slate-100 text-slate-500',
}
const tipoConsultaOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'telemedicina', label: 'Telemedicina' },
  { value: 'alta', label: 'Alta' },
  { value: 'emergencia', label: 'Emergencia' },
  { value: 'cirugia', label: 'Cirugía' },
]
const duracionOptions = [15, 20, 25, 30, 35, 40, 45, 60, 90, 120]

const emptyForm = {
  paciente_id: '', medico_id: '', fecha: '', hora: '', duracion_min: 30,
  tipo_consulta: 'presencial', cobertura_tipo: 'particular', cobertura_nombre: '',
  ubicacion: '', motivo: '', notas: '', monto: '', estado: 'pendiente',
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

function fmtFecha(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Turnos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [rowMenu, setRowMenu] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['turnos', filtroEstado],
    queryFn: () => getCitas({ estado: filtroEstado || undefined }).then(r => r.data),
  })
  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-select'], queryFn: () => getPacientes({ per_page: 100 }).then(r => r.data) })
  const { data: medicosData } = useQuery({ queryKey: ['medicos-select'], queryFn: () => getMedicos({ per_page: 100 }).then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createCita, onSuccess: () => qc.invalidateQueries(['turnos']) })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateCita(id, data), onSuccess: () => qc.invalidateQueries(['turnos']) })
  const mutDelete = useMutation({ mutationFn: deleteCita, onSuccess: () => qc.invalidateQueries(['turnos']) })
  const mutCheckin = useMutation({ mutationFn: checkinCita, onSuccess: () => qc.invalidateQueries(['turnos']) })

  const pacientes = pacientesData?.data ?? []
  const medicos = medicosData?.data ?? []
  const turnos = data?.data ?? []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (t) => {
    const dt = t.fecha_hora ? new Date(t.fecha_hora) : null
    setForm({
      ...emptyForm, ...t,
      paciente_id: t.paciente_id ?? '', medico_id: t.medico_id ?? '',
      fecha: dt ? dt.toISOString().slice(0, 10) : '',
      hora: dt ? dt.toISOString().slice(11, 16) : '',
      monto: t.monto ?? '',
    })
    setModal(t)
    setRowMenu(null)
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const { fecha, hora, ...rest } = form
    const payload = { ...rest, fecha_hora: `${fecha}T${hora}:00`, medico_id: form.medico_id || null }
    if (modal === 'nuevo') mutCreate.mutate(payload, { onSuccess: () => setModal(null) })
    else mutUpdate.mutate({ id: modal.id, data: payload }, { onSuccess: () => setModal(null) })
  }

  const descargarInforme = () => {
    const header = ['Paciente', 'Médico', 'Fecha', 'Tipo', 'Estado', 'Monto']
    const rows = turnos.map(t => [
      `${t.paciente?.nombre ?? ''} ${t.paciente?.apellido ?? ''}`.trim(),
      t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : (t.doctor ?? ''),
      fmtFecha(t.fecha_hora), t.tipo_consulta ?? '', t.estado ?? '', t.monto ?? '',
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `turnos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const esEdicion = modal && modal !== 'nuevo'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Turnos Médicos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de turnos y agenda médica</p>
        </div>
        <div className="flex gap-2">
          <button onClick={descargarInforme} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={15} /> Exportar
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nuevo Turno
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltroEstado('')} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${filtroEstado === '' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Todos</button>
        {estadoOptions.map(o => (
          <button key={o.value} onClick={() => setFiltroEstado(o.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${filtroEstado === o.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-visible">
        {isLoading ? (
          <ModuleLoader />
        ) : turnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <CalendarClock size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay turnos programadas</p>
            <button onClick={openNew} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus size={15} /> Agendar Primer Turno
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Fecha y hora</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {turnos.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors relative">
                  <td className="px-4 py-3 font-medium text-slate-800">{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido ?? ''}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.medico ? `Dr(a). ${t.medico.nombre} ${t.medico.apellido}` : (t.doctor || '—')}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtFecha(t.fecha_hora)}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{tipoConsultaOptions.find(o => o.value === t.tipo_consulta)?.label ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[t.estado] ?? 'bg-slate-100 text-slate-500'}`}>
                      {estadoOptions.find(o => o.value === t.estado)?.label ?? t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setRowMenu(m => m === t.id ? null : t.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                      <MoreVertical size={16} />
                    </button>
                    {rowMenu === t.id && (
                      <div className="absolute right-4 top-full mt-1 w-44 bg-white border border-slate-100 shadow-lg z-20 text-left rounded-lg overflow-hidden">
                        {['pendiente', 'confirmada'].includes(t.estado) && (
                          <button onClick={() => { setRowMenu(null); mutCheckin.mutate(t.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50">
                            <UserCheck size={13} /> Marcar Llegada
                          </button>
                        )}
                        <button onClick={() => openEdit(t)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => { setRowMenu(null); if (confirm('¿Eliminar turno?')) mutDelete.mutate(t.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={esEdicion ? 'Editar Turno' : 'Nuevo Turno'} size="lg" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Paciente" required>
                <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} required className={inputCls + ' bg-white'}>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </Field>
              <Field label="Médico" required>
                <select value={form.medico_id} onChange={e => set('medico_id', e.target.value)} className={inputCls + ' bg-white'}>
                  <option value="">Sin asignar</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido}</option>)}
                </select>
                {medicos.length === 0 && <p className="text-[11px] text-slate-400 mt-1">Todavía no cargaste médicos en el módulo "Médicos".</p>}
              </Field>
              <Field label="Fecha" required><input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className={inputCls} /></Field>
              <Field label="Hora" required><input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} required className={inputCls} /></Field>
              <Field label="Duración (minutos)">
                <select value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} className={inputCls + ' bg-white'}>
                  {duracionOptions.map(d => <option key={d} value={d}>{d} minutos{d === 60 ? ' (1 hora)' : d === 90 ? ' (1.5 horas)' : d === 120 ? ' (2 horas)' : ''}</option>)}
                </select>
              </Field>
              <Field label="Tipo de Consulta">
                <select value={form.tipo_consulta} onChange={e => set('tipo_consulta', e.target.value)} className={inputCls + ' bg-white'}>
                  {tipoConsultaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Cobertura y Facturación</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de Cobertura">
                  <select value={form.cobertura_tipo} onChange={e => set('cobertura_tipo', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="particular">Particular / Sin Cobertura</option>
                    <option value="obra_social">Obra Social / Convenio</option>
                  </select>
                </Field>
                {form.cobertura_tipo === 'obra_social' && (
                  <Field label="Nombre de la Obra Social">
                    <input value={form.cobertura_nombre} onChange={e => set('cobertura_nombre', e.target.value)} placeholder="Ej: OSDE, Medife, Swiss Medical..." className={inputCls} />
                  </Field>
                )}
                <Field label="Monto"><input type="number" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="45000" className={inputCls} /></Field>
                <Field label="Ubicación"><input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Ej: Consultorio 1, Piso 2" className={inputCls} /></Field>
              </div>
            </div>

            <Field label="Motivo de la consulta">
              <textarea value={form.motivo} onChange={e => set('motivo', e.target.value)} rows={2} placeholder="Describa el motivo de la consulta..." className={inputCls + ' resize-none'} />
            </Field>
            <Field label="Notas adicionales">
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} placeholder="Notas adicionales sobre el turno..." className={inputCls + ' resize-none'} />
            </Field>

            {esEdicion && (
              <Field label="Estado">
                <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls + ' bg-white max-w-xs'}>
                  {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Turno</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
