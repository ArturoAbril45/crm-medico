import { useQuery } from '@tanstack/react-query'
import { dashboard } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Users, Calendar, DollarSign, MessageSquare,
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Bot, ThumbsUp, BarChart3, Activity
} from 'lucide-react'

const estadoColor = {
  confirmada: 'bg-green-100 text-green-700',
  pendiente: 'bg-amber-100 text-amber-700',
  realizada: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-red-100 text-red-700',
  no_asistio: 'bg-slate-100 text-slate-500',
}

const barColor = {
  realizada: 'bg-green-500',
  confirmada: 'bg-indigo-500',
  pendiente: 'bg-amber-400',
  cancelada: 'bg-red-400',
  no_asistio: 'bg-slate-300',
}

// Datos de gestión de chat simulados (meses)
const mesesChat = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago']
const datosConversaciones = [320, 410, 380, 520, 490, 610, 720, 1922]
const datosChatbot = [310, 400, 370, 505, 480, 600, 710, 1874]

function KPICard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

function GestionChat() {
  const maxVal = Math.max(...datosConversaciones)
  return (
    <div className="bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-500" /> Gestión de Chat
        </h2>
        <span className="text-xs border border-slate-200 px-3 py-1 text-slate-500">Este mes</span>
      </div>

      {/* Stats del mes */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-4 bg-indigo-50">
          <p className="text-2xl font-bold text-indigo-700 tabular-nums">1.922</p>
          <p className="text-xs text-indigo-600 mt-0.5">Conversaciones (100%)</p>
        </div>
        <div className="p-4 bg-amber-50">
          <p className="text-2xl font-bold text-amber-700 tabular-nums">1.874</p>
          <p className="text-xs text-amber-600 mt-0.5">Chatbot respondió (98%)</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="flex items-end gap-2 h-28">
        {datosConversaciones.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '90px' }}>
              <div className="w-full bg-indigo-500 opacity-80 transition-all"
                style={{ height: `${(v / maxVal) * 90}px` }} title={`Conversaciones: ${v}`} />
            </div>
            <span className="text-xs text-slate-400">{mesesChat[i]}</span>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 bg-indigo-500 opacity-80" /> Conversaciones
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 bg-amber-400" /> Chatbot respondió
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { session } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboard().then(r => r.data)
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  )

  const d = data || {}
  const crecimiento = d.ingresos?.crecimiento ?? 0
  const estadosCitas = Array.isArray(d.citas?.estado) ? d.citas.estado : []
  const totalCitasMes = d.citas?.este_mes || 1

  const nombreCorto = (session?.nombre ?? '').split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ¡Bienvenido, {nombreCorto}!
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Espacio de trabajo — MedAdvance360</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Total Pacientes"
          value={d.pacientes?.total ?? 0}
          sub={`${d.pacientes?.activos ?? 0} activos`}
          color="indigo"
        />
        <KPICard
          icon={Calendar}
          label="Citas Hoy"
          value={d.citas?.hoy ?? 0}
          sub={`${d.citas?.pendientes ?? 0} pendientes`}
          color="amber"
        />
        <KPICard
          icon={DollarSign}
          label="Ingresos del Mes"
          value={`Bs. ${Number(d.ingresos?.este_mes ?? 0).toLocaleString()}`}
          sub={
            <span className={`flex items-center gap-1 ${crecimiento >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {crecimiento >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(crecimiento).toFixed(1)}% vs mes anterior
            </span>
          }
          color="green"
        />
        <KPICard
          icon={MessageSquare}
          label="Conversaciones"
          value={d.conversaciones?.activas ?? 0}
          sub="activas este mes"
          color="rose"
        />
      </div>

      {/* Fila 2: Gestión de chat + citas del día */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GestionChat />

        {/* Próximas citas de hoy */}
        <div className="bg-white border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" /> Próximas Citas de Hoy
          </h2>
          {(d.proximas_citas ?? []).length === 0
            ? <p className="text-slate-400 text-sm py-8 text-center">No hay citas programadas para hoy</p>
            : (
              <div className="space-y-3">
                {d.proximas_citas.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50">
                    <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 font-bold text-xs">
                        {(c.paciente?.nombre ?? '?')[0]}{(c.paciente?.apellido ?? '')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {c.paciente?.nombre} {c.paciente?.apellido}
                      </p>
                      <p className="text-xs text-slate-400">{c.procedimiento?.nombre ?? 'Consulta'} · {c.doctor}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(c.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`text-xs px-2 py-0.5 font-medium ${estadoColor[c.estado]}`}>
                        {c.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Fila 3: Distribución citas + KPIs secundarios */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Citas del mes por estado */}
        <div className="bg-white border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" /> Citas del Mes por Estado
          </h2>
          {estadosCitas.length === 0
            ? <p className="text-slate-400 text-sm">Sin citas este mes</p>
            : (
              <div className="space-y-3">
                {estadosCitas.map(({ estado, total }) => {
                  const pct = Math.round((total / totalCitasMes) * 100)
                  return (
                    <div key={estado}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-slate-600">{estado.replace('_', ' ')}</span>
                        <span className="font-medium text-slate-800">{total}</span>
                      </div>
                      <div className="h-2 bg-slate-100">
                        <div className={`h-2 ${barColor[estado] ?? 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* KPIs extra */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 shadow-sm p-5">
            <div className="p-2.5 bg-purple-50 text-purple-600 w-fit mb-3">
              <Bot size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">98%</p>
            <p className="text-sm text-slate-500 mt-0.5">Chatbot respondió</p>
            <p className="text-xs text-slate-400 mt-1">1.874 de 1.922</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm p-5">
            <div className="p-2.5 bg-green-50 text-green-600 w-fit mb-3">
              <ThumbsUp size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">4.8</p>
            <p className="text-sm text-slate-500 mt-0.5">Satisfacción</p>
            <p className="text-xs text-slate-400 mt-1">Promedio del mes</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm p-5">
            <div className="p-2.5 bg-amber-50 text-amber-600 w-fit mb-3">
              <Activity size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{d.citas?.este_mes ?? 0}</p>
            <p className="text-sm text-slate-500 mt-0.5">Citas este mes</p>
            <p className="text-xs text-slate-400 mt-1">Período actual</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm p-5">
            <div className="p-2.5 bg-rose-50 text-rose-600 w-fit mb-3">
              <DollarSign size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">
              Bs. {Number(d.ingresos?.mes_anterior ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">Mes anterior</p>
            <p className="text-xs text-slate-400 mt-1">Ingresos totales</p>
          </div>
        </div>
      </div>

      {/* Pacientes recientes */}
      {(d.pacientes?.recientes ?? []).length > 0 && (
        <div className="bg-white border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Pacientes Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Teléfono</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fuente</th>
                  <th className="pb-2 font-medium text-right">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {d.pacientes.recientes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{p.nombre} {p.apellido}</td>
                    <td className="py-2.5 text-slate-500">{p.telefono}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium ${
                        p.estado === 'activo' ? 'bg-green-100 text-green-700'
                        : p.estado === 'potencial' ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{p.fuente}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-800 tabular-nums">
                      Bs. {Number(p.total_gastado ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
