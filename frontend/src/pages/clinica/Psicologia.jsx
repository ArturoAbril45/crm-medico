import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { buscarPacientesPsicologia } from '../../services/api'
import { Search, Brain, ChevronRight } from 'lucide-react'

export default function Psicologia() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isFetching } = useQuery({
    queryKey: ['psicologia-pacientes', search],
    queryFn: () => buscarPacientesPsicologia(search).then(r => r.data),
    enabled: search.trim().length >= 2,
  })
  const resultados = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
          <Brain size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Central de Psicología</h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase mt-0.5">Sesiones, escalas clínicas y plan de tratamiento</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-2">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente por nombre, DNI o expediente..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {search.trim().length < 2 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 flex flex-col items-center text-center">
          <Brain size={40} className="text-slate-200 mb-3" />
          <p className="font-semibold text-slate-500">Buscá un paciente para ver o registrar su historial de psicología</p>
        </div>
      ) : isFetching ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 flex items-center justify-center">
          <p className="text-sm text-slate-400">Buscando...</p>
        </div>
      ) : resultados.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 flex flex-col items-center text-center">
          <Brain size={40} className="text-slate-200 mb-3" />
          <p className="font-semibold text-slate-500">No hay pacientes que coincidan con la búsqueda</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-50">
          {resultados.map(p => (
            <button key={p.id} onClick={() => navigate(`/clinica/psicologia/${p.id}`)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
              <div>
                <p className="font-semibold text-slate-800">{p.nombre} {p.apellido}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.numero_documento ? `DNI ${p.numero_documento}` : p.telefono || 'Sin documento registrado'} · {p.sesiones_count} sesión(es)</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
