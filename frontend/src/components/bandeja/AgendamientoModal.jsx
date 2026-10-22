import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Stethoscope, CalendarDays, Clock, X } from 'lucide-react'
import {
  getMedicosEspecialidades, getMedicos, getDisponibilidadMedico, createCita, updatePaciente,
} from '../../services/api'

const hoyISO = () => new Date().toISOString().slice(0, 10)
const inputCls = "w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"

const HORAS_MANUALES = Array.from({ length: (20 - 7) * 2 + 1 }, (_, i) => {
  const totalMin = 7 * 60 + i * 30
  const h = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const m = String(totalMin % 60).padStart(2, '0')
  return `${h}:${m}`
})

export default function AgendamientoModal({ paciente, onClose, onCreada }) {
  const qc = useQueryClient()
  const [especialidad, setEspecialidad] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [slot, setSlot] = useState(null)
  const [horaManual, setHoraManual] = useState('')
  const [mostrarHoras, setMostrarHoras] = useState(false)
  const [form, setForm] = useState({
    nombre: [paciente.nombre, paciente.apellido].filter(Boolean).join(' ').trim(),
    correo: paciente.email ?? '',
    celular: paciente.whatsapp || paciente.telefono || '',
    dni: paciente.numero_documento ?? '',
    descripcion: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: especialidades } = useQuery({ queryKey: ['medicos-especialidades'], queryFn: () => getMedicosEspecialidades().then(r => r.data) })
  const { data: medicosData } = useQuery({
    queryKey: ['medicos-lista', especialidad],
    queryFn: () => getMedicos({ especialidad: especialidad || undefined, activo: true }).then(r => r.data),
  })
  const medicos = medicosData?.data ?? medicosData ?? []

  const { data: disponibilidad, isFetching: cargandoSlots } = useQuery({
    queryKey: ['disponibilidad', medicoId, fecha],
    queryFn: () => getDisponibilidadMedico(medicoId, fecha).then(r => r.data),
    enabled: !!medicoId && !!fecha,
  })

  const mutAgendar = useMutation({
    mutationFn: async () => {
      const cambios = {}
      const nombreActual = [paciente.nombre, paciente.apellido].filter(Boolean).join(' ').trim()
      if (form.nombre.trim() && form.nombre.trim() !== nombreActual) {
        const partes = form.nombre.trim().split(' ')
        cambios.nombre = partes[0]
        cambios.apellido = partes.slice(1).join(' ')
      }
      if (form.correo.trim() && form.correo.trim() !== (paciente.email ?? '')) cambios.email = form.correo.trim()
      if (form.dni.trim() && form.dni.trim() !== (paciente.numero_documento ?? '')) cambios.numero_documento = form.dni.trim()
      if (Object.keys(cambios).length) await updatePaciente(paciente.id, cambios)

      return createCita({
        paciente_id: paciente.id,
        medico_id: medicoId,
        fecha_hora: slot.fecha_hora,
        duracion_min: slot.duracion_min,
        motivo: form.descripcion || 'Consulta',
        estado: 'confirmada',
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citas-paciente', paciente.id] })
      onCreada?.()
      onClose()
    },
  })

  const medicoSeleccionado = medicos.find(m => String(m.id) === String(medicoId))
  const puedeAgendar = medicoId && slot && form.nombre.trim() && form.celular.trim()

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Agendar cita</p>
        <button onClick={onClose} className="p-0.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>

      <div>
        <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Stethoscope size={12} /> Especialidad y médico</p>
        <div className="space-y-1.5">
          <select value={especialidad} onChange={e => { setEspecialidad(e.target.value); setMedicoId(''); setSlot(null) }} className={inputCls}>
            <option value="">Todas las especialidades</option>
            {(especialidades ?? []).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={medicoId} onChange={e => { setMedicoId(e.target.value); setSlot(null) }} className={inputCls}>
            <option value="">Elegí un médico...</option>
            {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}{m.especialidad ? ` — ${m.especialidad}` : ''}</option>)}
          </select>
        </div>
      </div>

      {medicoId && (
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1"><CalendarDays size={12} /> Disponibilidad de {medicoSeleccionado?.nombre}</p>
          <input type="date" value={fecha} min={hoyISO()} onChange={e => { setFecha(e.target.value); setSlot(null); setHoraManual('') }} className={inputCls + ' mb-2'} />
          {cargandoSlots ? (
            <p className="text-[11px] text-slate-400">Buscando horarios...</p>
          ) : (disponibilidad?.slots ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {disponibilidad.slots.map(s => (
                <button key={s.fecha_hora} onClick={() => { setSlot(s); setHoraManual(''); setMostrarHoras(false) }}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                    slot?.fecha_hora === s.fecha_hora && !horaManual ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}>
                  <Clock size={10} /> {s.hora}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={() => setMostrarHoras(v => !v)}
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
            <Clock size={11} /> {horaManual ? `Hora: ${horaManual}` : 'Poner hora'}
          </button>

          {mostrarHoras && (
            <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-32 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-lg">
              {HORAS_MANUALES.map(h => (
                <button key={h} type="button" onClick={() => {
                  setHoraManual(h)
                  setSlot({ fecha_hora: `${fecha} ${h}:00`, duracion_min: 30 })
                  setMostrarHoras(false)
                }}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                    horaManual === h ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}>
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
        <p className="text-[11px] font-medium text-slate-500">Datos del paciente</p>
        <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre completo" className={inputCls} />
        <input value={form.celular} onChange={e => set('celular', e.target.value)} placeholder="Celular" className={inputCls} />
        <input value={form.correo} onChange={e => set('correo', e.target.value)} placeholder="Correo" type="email" className={inputCls} />
        <input value={form.dni} onChange={e => set('dni', e.target.value)} placeholder="DNI / documento" className={inputCls} />
        <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Motivo de la consulta / descripción"
          rows={2} className={inputCls + ' resize-none'} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white">Cancelar</button>
        <button onClick={() => mutAgendar.mutate()} disabled={!puedeAgendar || mutAgendar.isPending}
          className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
          {mutAgendar.isPending ? 'Agendando...' : 'Agendar cita'}
        </button>
      </div>
    </div>
  )
}
