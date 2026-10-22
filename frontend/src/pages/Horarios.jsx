import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedicos, updateMedico } from '../services/api'
import { Clock, UserCog } from 'lucide-react'

const dias = [
  { n: '1', label: 'L' }, { n: '2', label: 'M' }, { n: '3', label: 'X' },
  { n: '4', label: 'J' }, { n: '5', label: 'V' }, { n: '6', label: 'S' }, { n: '7', label: 'D' },
]

export default function Horarios() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['medicos'], queryFn: () => getMedicos().then(r => r.data) })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateMedico(id, data), onSuccess: () => qc.invalidateQueries(['medicos']) })

  const medicos = Array.isArray(data) ? data : []
  const [local, setLocal] = useState({})

  useEffect(() => {
    const inicial = {}
    medicos.forEach(m => { inicial[m.id] = { hora_inicio: m.hora_inicio, hora_fin: m.hora_fin, dias_trabajo: m.dias_trabajo?.split(',') ?? [] } })
    setLocal(inicial)
  }, [data])

  const toggleDia = (medicoId, dia) => {
    setLocal(prev => {
      const actuales = prev[medicoId]?.dias_trabajo ?? []
      const nuevos = actuales.includes(dia) ? actuales.filter(d => d !== dia) : [...actuales, dia]
      return { ...prev, [medicoId]: { ...prev[medicoId], dias_trabajo: nuevos } }
    })
  }

  const setHora = (medicoId, campo, valor) => {
    setLocal(prev => ({ ...prev, [medicoId]: { ...prev[medicoId], [campo]: valor } }))
  }

  const guardar = (medicoId) => {
    const estado = local[medicoId]
    mutUpdate.mutate({ id: medicoId, data: { ...estado, dias_trabajo: estado.dias_trabajo.join(',') } })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Horarios</h1>
        <p className="text-sm text-slate-500 mt-0.5">Días y horas de atención de cada médico</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-100">
            {medicos.map(m => {
              const estado = local[m.id] ?? { hora_inicio: '08:00', hora_fin: '17:00', dias_trabajo: [] }
              return (
                <div key={m.id} className="p-5 flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-3 w-56 shrink-0">
                    <div className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <UserCog size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{m.nombre}</p>
                      <p className="text-xs text-slate-400 truncate">{m.especialidad}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {dias.map(d => (
                      <button key={d.n} onClick={() => toggleDia(m.id, d.n)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ` +
                          (estado.dias_trabajo.includes(d.n) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200')}>
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    <input type="time" value={estado.hora_inicio} onChange={e => setHora(m.id, 'hora_inicio', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    <span className="text-slate-400">–</span>
                    <input type="time" value={estado.hora_fin} onChange={e => setHora(m.id, 'hora_fin', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>

                  <div className="flex-1" />
                  <button onClick={() => guardar(m.id)}
                    className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Guardar
                  </button>
                </div>
              )
            })}

            {medicos.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-12">Todavía no hay médicos registrados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
