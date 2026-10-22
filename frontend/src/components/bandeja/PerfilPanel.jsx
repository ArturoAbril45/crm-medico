import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, ChevronDown, ChevronUp, Plus, Ghost, Phone, Mail, CalendarDays, IdCard,
  StickyNote, Tag, Repeat, MoreVertical,
} from 'lucide-react'
import {
  tomarConversacion, devolverConversacion, resolverConversacion, toggleAutomatizacionConversacion,
  getNotasPaciente, crearNotaPaciente, actualizarEtiquetasPaciente, getCitas,
} from '../../services/api'
import AgendamientoModal from './AgendamientoModal'

function Seccion({ titulo, badge, icono: Icono, children, accionBoton, defaultAbierto = true }) {
  const [abierto, setAbierto] = useState(defaultAbierto)
  return (
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setAbierto(v => !v)} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {Icono && <Icono size={15} className="text-slate-400" />}
          {titulo}
          {badge != null && (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span>
          )}
        </button>
        <div className="flex items-center gap-1">
          {accionBoton}
          <button onClick={() => setAbierto(v => !v)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            {abierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>
      {abierto && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

export default function PerfilPanel({ conversacion, paciente, onCerrar }) {
  const qc = useQueryClient()
  const [nuevaNota, setNuevaNota] = useState('')
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')
  const [formCita, setFormCita] = useState(false)

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['conversacion', conversacion.id] })
    qc.invalidateQueries({ queryKey: ['conversaciones'] })
  }

  const mutEstado = useMutation({
    mutationFn: (estado) => estado === 'abierta' ? tomarConversacion(conversacion.id) : estado === 'pendiente' ? devolverConversacion(conversacion.id) : resolverConversacion(conversacion.id),
    onSuccess: invalidar,
  })
  const mutAuto = useMutation({
    mutationFn: () => toggleAutomatizacionConversacion(conversacion.id),
    onSuccess: invalidar,
    onError: () => alert('Esta función todavía no está disponible en el servidor (falta una actualización pendiente).'),
  })

  const { data: notas } = useQuery({
    queryKey: ['notas-paciente', paciente.id],
    queryFn: () => getNotasPaciente(paciente.id).then(r => r.data),
    retry: false,
  })
  const mutNota = useMutation({
    mutationFn: (texto) => crearNotaPaciente(paciente.id, texto),
    onSuccess: () => { setNuevaNota(''); qc.invalidateQueries({ queryKey: ['notas-paciente', paciente.id] }) },
    onError: () => alert('Esta función todavía no está disponible en el servidor (falta una actualización pendiente).'),
  })

  const mutEtiquetas = useMutation({
    mutationFn: (etiquetas) => actualizarEtiquetasPaciente(paciente.id, etiquetas),
    onSuccess: () => { setNuevaEtiqueta(''); qc.invalidateQueries({ queryKey: ['conversacion', conversacion.id] }) },
    onError: () => alert('Esta función todavía no está disponible en el servidor (falta una actualización pendiente).'),
  })

  const { data: citas } = useQuery({
    queryKey: ['citas-paciente', paciente.id],
    queryFn: () => getCitas({ paciente_id: paciente.id }).then(r => r.data?.data ?? r.data ?? []),
  })
  const automatizacionActiva = conversacion.automatizacion_activa !== false
  const etiquetas = paciente.etiquetas ?? []
  const datosUsuario = [
    { icono: Phone, label: 'Teléfono', valor: paciente.whatsapp || paciente.telefono },
    { icono: Mail, label: 'E-mail', valor: paciente.email },
    { icono: CalendarDays, label: 'Fecha de inscripción', valor: paciente.created_at ? new Date(paciente.created_at).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : null },
    { icono: IdCard, label: 'Documento', valor: paciente.numero_documento },
  ]
  const datosLlenos = datosUsuario.filter(d => d.valor).length

  return (
    <div className="w-80 border-l border-slate-200 flex flex-col shrink-0 bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="font-bold text-slate-800">Perfil</h2>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><MoreVertical size={16} /></button>
          <button onClick={onCerrar} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={16} /></button>
        </div>
      </div>

      <div className="p-4 space-y-3 border-b border-slate-100">
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
          <Ghost size={16} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 leading-tight">Administrador</p>
            <p className="text-xs font-medium text-slate-700 truncate" title={conversacion.agente?.name ? undefined : 'Ningún atendente asignado'}>
              {conversacion.agente?.name ?? 'Ningún atendente asignado'}
            </p>
          </div>
        </div>

        <select
          value={conversacion.estado}
          onChange={e => mutEstado.mutate(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="pendiente">Pendiente</option>
          <option value="abierta">Abierto</option>
          <option value="cerrada">Cerrado</option>
        </select>

        <button
          onClick={() => mutAuto.mutate()}
          className={`w-full text-center text-xs font-semibold py-2.5 rounded-xl transition-colors ${automatizacionActiva ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          Automatización está {automatizacionActiva ? 'activada' : 'pausada'}
        </button>
      </div>

      <Seccion titulo="Datos del usuario" badge={datosLlenos} icono={IdCard}>
        <div className="space-y-2.5">
          {datosUsuario.map(d => (
            <div key={d.label} className="flex items-start gap-2 text-xs">
              <d.icono size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-400">{d.label}</p>
                <p className="text-slate-700 font-medium truncate">{d.valor || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Notas" icono={StickyNote}>
        <div className="space-y-2 mb-2">
          {(notas ?? []).length === 0 && <p className="text-xs text-slate-400">Sin notas todavía.</p>}
          {(notas ?? []).map(n => (
            <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{n.texto}</p>
              <p className="text-[10px] text-slate-400 mt-1">{n.usuario?.name ?? 'Agente'} · {new Date(n.created_at).toLocaleDateString('es-BO')}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input value={nuevaNota} onChange={e => setNuevaNota(e.target.value)} placeholder="Agregar nota..."
            className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={e => e.key === 'Enter' && nuevaNota.trim() && mutNota.mutate(nuevaNota.trim())} />
          <button onClick={() => nuevaNota.trim() && mutNota.mutate(nuevaNota.trim())}
            className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0"><Plus size={14} /></button>
        </div>
      </Seccion>

      <Seccion titulo="Eventos de la agenda" badge={(citas ?? []).length} icono={CalendarDays}
        accionBoton={<button onClick={() => setFormCita(true)} className="p-1 text-slate-400 hover:text-indigo-600 rounded" title="Agendar cita"><Plus size={15} /></button>}>
        <div className="space-y-2">
          {(citas ?? []).length === 0 && <p className="text-xs text-slate-400">Sin eventos agendados.</p>}
          {(citas ?? []).map(c => (
            <div key={c.id} className="bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-2">
              <p className="text-xs font-medium text-slate-700">{c.motivo || c.tipo_consulta}</p>
              <p className="text-[11px] text-slate-500">
                {new Date(c.fecha_hora).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })} · {c.estado}
                {c.medico && ` · ${c.medico.nombre} ${c.medico.apellido}`}
              </p>
            </div>
          ))}
          {!formCita && (
            <button onClick={() => setFormCita(true)}
              className="w-full text-xs font-medium text-indigo-600 border border-dashed border-indigo-200 hover:bg-indigo-50 rounded-lg py-2 transition-colors">
              + Agendar cita
            </button>
          )}
          {formCita && (
            <AgendamientoModal
              paciente={paciente}
              onClose={() => setFormCita(false)}
              onCreada={() => qc.invalidateQueries({ queryKey: ['citas-paciente', paciente.id] })}
            />
          )}
        </div>
      </Seccion>

      <Seccion titulo="Etiquetas" icono={Tag}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {etiquetas.length === 0 && <p className="text-xs text-slate-400">Sin etiquetas.</p>}
          {etiquetas.map((et, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
              {et}
              <button onClick={() => mutEtiquetas.mutate(etiquetas.filter((_, idx) => idx !== i))} className="hover:text-indigo-900">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input value={nuevaEtiqueta} onChange={e => setNuevaEtiqueta(e.target.value)} placeholder="Nueva etiqueta..."
            className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={e => e.key === 'Enter' && nuevaEtiqueta.trim() && mutEtiquetas.mutate([...etiquetas, nuevaEtiqueta.trim()])} />
          <button onClick={() => nuevaEtiqueta.trim() && mutEtiquetas.mutate([...etiquetas, nuevaEtiqueta.trim()])}
            className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0"><Plus size={14} /></button>
        </div>
      </Seccion>

      <Seccion titulo="Secuencias" icono={Repeat} defaultAbierto={false}>
        <p className="text-xs text-slate-400">No hay secuencias disponibles todavía para este contacto.</p>
      </Seccion>
    </div>
  )
}
