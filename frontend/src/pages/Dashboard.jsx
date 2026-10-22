import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ModuleLoader from '../components/ModuleLoader'
import { dashboard } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Users, CornerUpLeft, MessageSquareX, ChevronUp, Info, TrendingUp, TrendingDown, CalendarDays, Clock, Stethoscope, ShieldCheck, DollarSign, BarChart3, CheckCircle2 } from 'lucide-react'

function Toggle({ options, value, onChange, small }) {
  const i = options.indexOf(value)
  return (
    <div className={`relative flex bg-slate-100 p-0.5 rounded-md font-medium ${small ? 'text-[11px]' : 'text-xs'}`}>
      <span
        className="absolute top-0.5 bottom-0.5 rounded-md bg-slate-900 transition-all duration-200 ease-out"
        style={{ width: `${100 / options.length}%`, left: `${(i * 100) / options.length}%` }}
      />
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`relative z-10 flex-1 whitespace-nowrap px-3 ${small ? 'py-1' : 'py-1.5'} transition-colors duration-200 ${
            opt === value ? 'text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="relative h-52 w-full">
      <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
        {[0, 50, 100, 150, 199].map(y => (
          <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        <line x1="0" y1="199" x2="600" y2="199" stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
      <span className="absolute left-0 top-0 text-[11px] text-slate-300">—</span>
      <span className="absolute left-0 bottom-0 text-[11px] text-slate-300">0</span>
    </div>
  )
}

function EmptyState({ title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <img src="/ghost.png" alt="" className="w-16 h-16 mb-4" />
      <p className="font-semibold text-slate-800">{title}</p>
      {sub && <p className="text-sm text-slate-400 mt-1 max-w-xs">{sub}</p>}
      {action}
    </div>
  )
}

function GestionChat({ chat }) {
  const sinDatos = !chat || chat.total === 0
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">Gestión de chat</h2>
          <Info size={16} className="text-slate-400" />
        </div>
        <span className="text-xs border border-slate-200 px-3 py-1.5 text-slate-500 flex items-center gap-1">
          Este mes <ChevronUp size={12} />
        </span>
      </div>
      {sinDatos ? (
        <EmptyState
          title="Aún no hay estadísticas de chats"
          sub="Verás las estadísticas en cuanto tengas tus primeros chats"
        />
      ) : (
        <div className="grid grid-cols-3 gap-3 py-4">
          {[
            { label: 'Chats este mes', value: chat.total },
            { label: 'Asignados', value: chat.asignaciones },
            { label: 'Cerrados', value: chat.chats_cerrados },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Rendimiento({ chat }) {
  const [scope, setScope] = useState('Equipo')
  const [metric, setMetric] = useState('Mediana')
  const stats = [
    { icon: Users, label: 'Asignaciones', value: chat?.asignaciones ?? 0 },
    { icon: CornerUpLeft, label: 'Primeras respuestas', value: chat?.primeras_respuestas ?? 0 },
    { icon: MessageSquareX, label: 'Chats cerrados', value: chat?.chats_cerrados ?? 0 },
  ]

  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800 text-lg">Rendimiento</h2>
          <Toggle options={['Equipo', 'Personal']} value={scope} onChange={setScope} />
        </div>
        <span className="text-xs border border-slate-200 px-3 py-1.5 text-slate-500 flex items-center gap-1">
          Este mes <ChevronUp size={12} />
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Actividad de chat */}
        <div>
          <p className="text-sm font-medium text-slate-600 mb-3">Actividad de chat</p>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="border border-slate-100 p-5 flex flex-col items-center text-center gap-2.5">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de tiempo */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-medium text-slate-600">Métricas de tiempo</p>
            <Toggle options={['Mediana', 'Promedio']} value={metric} onChange={setMetric} small />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Hasta la primera respuesta', 'Hasta el cierre'].map(label => (
              <div key={label} className="border border-slate-100 p-5 flex flex-col gap-1.5">
                <p className="text-2xl font-bold text-slate-400">–</p>
                <p className="text-xs text-slate-400">{label}</p>
                <svg className="w-full h-8 mt-1" viewBox="0 0 200 32" preserveAspectRatio="none">
                  <line x1="0" y1="31" x2="200" y2="31" stroke="#f1f5f9" strokeWidth="2" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EstadisticasMiembros({ chat }) {
  const porMiembro = chat?.por_miembro ?? []
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-slate-800">Estadísticas de chat por miembros</h2>
        <Info size={16} className="text-slate-400" />
      </div>
      {porMiembro.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <img src="/ghost.png" alt="" className="w-12 h-12 mb-4" />
          <p className="font-semibold text-slate-800">Todavía no hay chats asignados</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Cuando un agente tome una conversación, va a aparecer acá
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {porMiembro.map(m => (
            <div key={m.agente_id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {(m.agente?.name || '?')[0]?.toUpperCase()}
                </div>
                <p className="text-sm text-slate-700">{m.agente?.name ?? 'Agente'}</p>
              </div>
              <p className="text-sm font-semibold text-slate-800 tabular-nums">{m.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActividadEquipo({ chat }) {
  const legend = [
    { color: 'bg-sky-500', label: 'Chats asignados', key: 'asignados' },
    { color: 'bg-orange-500', label: 'Chats contestados', key: 'contestados' },
    { color: 'bg-teal-500', label: 'Chats cerrados', key: 'cerrados' },
  ]
  const dias = chat?.actividad_por_dia ?? []
  const max = Math.max(1, ...dias.flatMap(d => [d.asignados, d.contestados, d.cerrados]))

  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 text-lg">Actividad de equipo</h2>
        <span className="text-xs border border-slate-200 px-3 py-1.5 text-slate-500 flex items-center gap-1">
          Conteo de actividades <ChevronUp size={12} />
        </span>
      </div>

      {dias.every(d => !d.asignados && !d.contestados && !d.cerrados) ? (
        <EmptyChart />
      ) : (
        <div className="h-52 w-full flex items-end justify-between gap-2 px-1">
          {dias.map(d => (
            <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5 h-40">
                {legend.map(l => (
                  <div key={l.key} className={`w-2 rounded-t ${l.color}`} style={{ height: `${(d[l.key] / max) * 100}%` }} title={`${l.label}: ${d[l.key]}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">{new Date(d.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
        {legend.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function EstadisticasPeriodo({ citas }) {
  const porDia = citas?.por_dia ?? []
  const max = Math.max(1, ...porDia.map(d => d.total))
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Datos</p>
          <h2 className="font-semibold text-slate-800 text-lg">Estadísticas por período</h2>
        </div>
        <span className="text-xs border border-slate-200 px-3 py-1.5 text-slate-500 flex items-center gap-1">
          Este mes <ChevronUp size={12} />
        </span>
      </div>

      {porDia.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="h-52 w-full flex items-end justify-between gap-2 px-1">
          {porDia.map(d => (
            <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-indigo-100 rounded-t" style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total ? '4px' : '0' }} title={`${d.fecha}: ${d.total} citas`} />
              <span className="text-[10px] text-slate-400">{new Date(d.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClinicaStats({ clinica }) {
  const sinDatos = !clinica || (clinica.medicos_total === 0 && clinica.pacientes_reservados === 0)
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-slate-800">Panel clínico</h2>
        <Info size={16} className="text-slate-400" />
      </div>
      {sinDatos ? (
        <EmptyState
          title="Aún no hay datos clínicos"
          sub="Vas a ver acá médicos, pacientes reservados y citas en cuanto empieces a cargarlos"
        />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 py-4">
            {[
              { label: 'Médicos', value: clinica.medicos_total },
              { label: 'Médicos activos', value: clinica.medicos_activos },
              { label: 'Pacientes reservados', value: clinica.pacientes_reservados },
              { label: 'Citas este mes', value: clinica.citas_total },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-slate-800 tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 pb-3">
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> {clinica.medicos_con_google} médico(s) con Google Calendar vinculado</span>
            <span>·</span>
            <span>{clinica.pacientes_sin_reserva} paciente(s) sin reserva aún</span>
          </div>
          {clinica.citas_por_medico?.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Citas por médico</p>
              <div className="space-y-1.5">
                {clinica.citas_por_medico.map(row => (
                  <div key={row.medico_id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {row.medico ? `Dr(a). ${row.medico.nombre} ${row.medico.apellido}` : 'Médico eliminado'}
                      {row.medico?.especialidad && <span className="text-slate-400"> — {row.medico.especialidad}</span>}
                    </span>
                    <span className="font-semibold text-slate-800 tabular-nums">{row.total}</span>
                  </div>
                ))}
                {clinica.citas_sin_medico > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Sin médico asignado</span>
                    <span className="font-semibold text-slate-500 tabular-nums">{clinica.citas_sin_medico}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PacientesStats({ pacientes, clinica }) {
  const sinDatos = !pacientes || pacientes.total === 0
  const crecimiento = pacientes?.crecimiento ?? 0
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-slate-800">Pacientes</h2>
        <Info size={16} className="text-slate-400" />
      </div>
      {sinDatos ? (
        <EmptyState title="Aún no hay pacientes registrados" sub="Vas a ver acá el resumen apenas cargues el primero" />
      ) : (
        <div className="grid grid-cols-4 gap-3 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{pacientes.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{pacientes.activos}</p>
            <p className="text-xs text-slate-400 mt-0.5">Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{clinica?.pacientes_reservados ?? 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Con reserva</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums flex items-center justify-center gap-1">
              {pacientes.este_mes}
              {crecimiento !== 0 && (
                <span className={`text-xs font-medium flex items-center ${crecimiento > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {crecimiento > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(crecimiento)}%
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Nuevos este mes</p>
          </div>
        </div>
      )}
    </div>
  )
}

const estadoLabels = { pendiente: 'Pendientes', confirmada: 'Confirmadas', realizada: 'Realizadas', cancelada: 'Canceladas', no_asistio: 'No asistió' }
const estadoColores = { pendiente: 'bg-amber-400', confirmada: 'bg-indigo-500', realizada: 'bg-emerald-500', cancelada: 'bg-red-400', no_asistio: 'bg-slate-400' }

function EstadoCitas({ citas }) {
  const estados = citas?.estado ?? []
  const total = estados.reduce((s, e) => s + e.total, 0)
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 mb-3">Citas del mes por estado</h2>
      {total === 0 ? (
        <EmptyState title="Sin citas este mes" sub="Vas a ver el desglose apenas se agende la primera" />
      ) : (
        <div className="space-y-2.5">
          {estados.map(e => (
            <div key={e.estado}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{estadoLabels[e.estado] ?? e.estado}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{e.total}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${estadoColores[e.estado] ?? 'bg-slate-400'}`} style={{ width: `${(e.total / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProximasCitasHoy({ proximas }) {
  const lista = proximas ?? []
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-slate-400" />
        <h2 className="font-semibold text-slate-800">Próximas citas de hoy</h2>
      </div>
      {lista.length === 0 ? (
        <EmptyState title="Sin citas para hoy" sub="Las próximas citas del día van a aparecer acá" />
      ) : (
        <div className="space-y-2">
          {lista.map(c => (
            <div key={c.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg text-sm">
              <div className="flex items-center gap-2.5">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{new Date(c.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-slate-600">{c.paciente?.nombre} {c.paciente?.apellido}</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Stethoscope size={12} />
                {c.medico ? `Dr(a). ${c.medico.nombre} ${c.medico.apellido}` : 'Sin médico'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Ingresos({ ingresos }) {
  const crecimiento = ingresos?.crecimiento ?? 0
  const sinDatos = !ingresos || (!ingresos.este_mes && !ingresos.mes_anterior)
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={16} className="text-slate-400" />
        <h2 className="font-semibold text-slate-800">Ingresos</h2>
      </div>
      {sinDatos ? (
        <EmptyState title="Sin ingresos registrados" sub="Vas a ver el comparativo apenas se registre el primer pago" />
      ) : (
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">${Number(ingresos.este_mes).toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Este mes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">${Number(ingresos.mes_anterior).toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Mes anterior</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold tabular-nums flex items-center justify-center gap-1 ${crecimiento >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {crecimiento >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}{Math.abs(crecimiento)}%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">vs. mes anterior</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CitasPorEspecialidad({ datos }) {
  const lista = datos ?? []
  const max = Math.max(1, ...lista.map(d => d.total))
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-slate-400" />
        <h2 className="font-semibold text-slate-800">Citas por especialidad</h2>
      </div>
      {lista.length === 0 ? (
        <EmptyState title="Sin datos por especialidad" sub="Vas a ver el desglose apenas los médicos tengan especialidad y citas" />
      ) : (
        <div className="space-y-2.5">
          {lista.map(d => (
            <div key={d.especialidad}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{d.especialidad}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{d.total}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(d.total / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CitasPorHora({ datos }) {
  const porHora = new Map((datos ?? []).map(d => [d.hora, d.total]))
  const horas = Array.from({ length: 24 }, (_, h) => ({ hora: h, total: porHora.get(h) ?? 0 }))
  const max = Math.max(1, ...horas.map(h => h.total))
  const hayDatos = horas.some(h => h.total > 0)
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 mb-4">Horas pico (todas las citas)</h2>
      {!hayDatos ? (
        <EmptyChart />
      ) : (
        <div className="h-40 w-full flex items-end justify-between gap-0.5">
          {horas.map(h => (
            <div key={h.hora} className="flex-1 flex flex-col items-center gap-1" title={`${h.hora}:00 — ${h.total} citas`}>
              <div className="w-full bg-indigo-100 rounded-t" style={{ height: `${(h.total / max) * 100}%`, minHeight: h.total ? '4px' : '0' }} />
              {h.hora % 3 === 0 && <span className="text-[9px] text-slate-400">{h.hora}h</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TasaAsistencia({ clinica }) {
  const tasa = clinica?.tasa_asistencia
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={16} className="text-slate-400" />
        <h2 className="font-semibold text-slate-800">Tasa de asistencia (este mes)</h2>
      </div>
      {tasa === null || tasa === undefined ? (
        <EmptyState title="Sin datos suficientes" sub="Se calcula sobre citas realizadas, canceladas y no asistidas" />
      ) : (
        <>
          <p className="text-3xl font-bold text-slate-800 tabular-nums mb-3">{tasa}%</p>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div><p className="font-semibold text-emerald-600 text-base tabular-nums">{clinica.realizadas}</p><p className="text-slate-400 mt-0.5">Realizadas</p></div>
            <div><p className="font-semibold text-red-500 text-base tabular-nums">{clinica.no_asistio}</p><p className="text-slate-400 mt-0.5">No asistió</p></div>
            <div><p className="font-semibold text-slate-500 text-base tabular-nums">{clinica.canceladas}</p><p className="text-slate-400 mt-0.5">Canceladas</p></div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { session } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboard().then(r => r.data)
  })

  if (isLoading) return <ModuleLoader />

  const nombreCorto = (session?.nombre ?? '').split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ¡Bienvenido, {nombreCorto}!
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Espacio de trabajo — Med-Advance</p>
      </div>

      <ClinicaStats clinica={data?.clinica} />
      <PacientesStats pacientes={data?.pacientes} clinica={data?.clinica} />
      <div className="grid md:grid-cols-2 gap-6">
        <EstadoCitas citas={data?.citas} />
        <ProximasCitasHoy proximas={data?.proximas_citas} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <CitasPorEspecialidad datos={data?.clinica?.citas_por_especialidad} />
        <TasaAsistencia clinica={data?.clinica} />
      </div>
      <Ingresos ingresos={data?.ingresos} />
      <CitasPorHora datos={data?.clinica?.citas_por_hora} />
      <GestionChat chat={data?.chat} />
      <Rendimiento chat={data?.chat} />
      <EstadisticasMiembros chat={data?.chat} />
      <ActividadEquipo chat={data?.chat} />
      <EstadisticasPeriodo citas={data?.citas} />
    </div>
  )
}
