import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPaciente } from '../services/api'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Droplet, IdCard, Calendar, ClipboardList, CreditCard } from 'lucide-react'

const estadoColors = {
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-slate-100 text-slate-500',
  potencial: 'bg-blue-100 text-blue-700',
}

function calcularEdad(fecha) {
  if (!fecha) return null
  const nac = new Date(fecha)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export default function PacienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: p, isLoading } = useQuery({ queryKey: ['paciente', id], queryFn: () => getPaciente(id).then(r => r.data) })

  if (isLoading || !p) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
  }

  const edad = calcularEdad(p.fecha_nacimiento)

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/pacientes')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} /> Volver a Pacientes
        </button>
        <Link to={`/pacientes/${id}/editar`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Pencil size={15} /> Editar
        </Link>
      </div>

      {/* Cabecera */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">{p.nombre?.[0]}{(p.apellido ?? ' ')[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{p.nombre} {p.segundo_nombre} {p.apellido}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[p.estado]}`}>{p.estado}</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Historia clínica {p.numero_historia ?? '—'}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              {edad !== null && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {edad} años</span>}
              {p.tipo_sangre && <span className="flex items-center gap-1.5"><Droplet size={14} className="text-red-400" /> {p.tipo_sangre}</span>}
              {p.numero_documento && <span className="flex items-center gap-1.5"><IdCard size={14} className="text-slate-400" /> {p.tipo_documento}: {p.numero_documento}</span>}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100 text-sm">
          <span className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {p.telefono}{p.telefono_fijo ? ` · ${p.telefono_fijo}` : ''}</span>
          <span className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" /> {p.email || '—'}</span>
          <span className="flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-slate-400" /> {p.ciudad || '—'}, {p.pais || '—'}</span>
        </div>
        {p.notas && <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">{p.notas}</p>}
      </div>

      {/* Historial de consultas */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={16} className="text-indigo-500" /> Historial de Consultas</h2>
        {(p.consultas ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Sin consultas registradas todavía.</p>
        ) : (
          <div className="space-y-3">
            {p.consultas.map(c => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-800">{c.motivo}</span>
                  <span className="text-slate-400">{new Date(c.fecha).toLocaleDateString('es-BO')}</span>
                </div>
                {c.diagnostico && <p className="text-xs text-slate-500 mt-1">Diagnóstico: {c.diagnostico}</p>}
                {c.medico && <p className="text-xs text-slate-400 mt-0.5">Médico: {c.medico.nombre}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citas */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /> Citas</h2>
        {(p.citas ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Sin citas registradas todavía.</p>
        ) : (
          <div className="space-y-3">
            {p.citas.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                <div>
                  <p className="font-medium text-slate-800">{c.procedimiento?.nombre ?? 'Consulta General'}</p>
                  <p className="text-xs text-slate-400">{c.doctor}</p>
                </div>
                <span className="text-slate-500">{new Date(c.fecha_hora).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagos */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={16} className="text-indigo-500" /> Pagos</h2>
        {(p.pagos ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Sin pagos registrados todavía.</p>
        ) : (
          <div className="space-y-3">
            {p.pagos.map(pg => (
              <div key={pg.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                <span className="text-slate-600">{new Date(pg.fecha).toLocaleDateString('es-BO')} · {pg.metodo_pago}</span>
                <span className="font-semibold text-slate-800">Bs. {parseFloat(pg.monto ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
