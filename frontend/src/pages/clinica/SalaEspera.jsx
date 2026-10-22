import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSalaEspera, atenderCita, completarCita } from '../../services/api'
import { RefreshCw, Tv, Armchair, Play, CheckCircle2 } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

const estadoColors = {
  en_espera: 'bg-amber-100 text-amber-700',
  en_progreso: 'bg-blue-100 text-blue-700',
}
const estadoLabels = { en_espera: 'En espera', en_progreso: 'En progreso' }

export default function SalaEspera() {
  const qc = useQueryClient()
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sala-espera'],
    queryFn: () => getSalaEspera().then(r => r.data),
    refetchInterval: 15000,
  })

  const mutAtender = useMutation({ mutationFn: atenderCita, onSuccess: () => qc.invalidateQueries(['sala-espera']) })
  const mutCompletar = useMutation({ mutationFn: completarCita, onSuccess: () => qc.invalidateQueries(['sala-espera']) })

  const pacientes = data?.pacientes ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Sala de Espera</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitoreo de flujo de pacientes en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} /> Actualizar
          </button>
          <Link to="/clinica/monitor" className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Tv size={15} /> Abrir Monitor TV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">En Espera</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{data?.en_espera ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Espera Promedio</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{data?.espera_promedio ?? 0} <span className="text-base font-normal text-slate-400">min</span></p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Espera Máxima</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{data?.espera_maxima ?? 0} <span className="text-base font-normal text-slate-400">min</span></p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="font-semibold text-slate-700 text-sm">Pacientes en Sala</p>
        </div>
        {isLoading ? (
          <ModuleLoader />
        ) : pacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Armchair size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay pacientes en sala de espera en este momento</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Asignado a</th>
              <th className="px-4 py-3 font-medium">Especialidad</th>
              <th className="px-4 py-3 font-medium">Tiempo de Espera</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pacientes.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.paciente}</td>
                  <td className="px-4 py-3 text-slate-600">{p.medico}</td>
                  <td className="px-4 py-3 text-slate-600">{p.especialidad}</td>
                  <td className="px-4 py-3 text-slate-600">{p.espera_minutos} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[p.estado]}`}>{estadoLabels[p.estado]}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.estado === 'en_espera' ? (
                      <button onClick={() => mutAtender.mutate(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md">
                        <Play size={12} /> Atender
                      </button>
                    ) : (
                      <button onClick={() => mutCompletar.mutate(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 rounded-md">
                        <CheckCircle2 size={12} /> Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-center text-[11px] text-slate-300 uppercase tracking-wide">Med-Advance · Central de Monitoreo Clinic-Flow</p>
    </div>
  )
}
