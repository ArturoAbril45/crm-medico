import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPacientes, deletePaciente } from '../services/api'
import { Plus, Search, Pencil, Trash2, Eye, Droplet, Download, Upload } from 'lucide-react'

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

export default function Pacientes() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes', search, page],
    queryFn: () => getPacientes({ search, page }).then(r => r.data),
    keepPreviousData: true,
  })

  const mutDelete = useMutation({ mutationFn: deletePaciente, onSuccess: () => qc.invalidateQueries({ queryKey: ['pacientes'] }) })

  const pacientes = data?.data ?? []
  const meta = data ? { total: data.total, current_page: data.current_page, last_page: data.last_page } : {}

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{meta.total ?? 0} pacientes registrados</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Upload size={15} /> Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Download size={15} /> Exportar
          </button>
          <Link to="/pacientes/nuevo" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nuevo Paciente
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar por nombre, historia clínica, documento, teléfono o email..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Historia</th>
              <th className="px-5 py-3 font-medium">Paciente</th>
              <th className="px-5 py-3 font-medium">Edad</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Info. Médica</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Total Gastado</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pacientes.map(p => {
                const edad = calcularEdad(p.fecha_nacimiento)
                return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.numero_historia ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-bold text-xs">{p.nombre[0]}{(p.apellido ?? ' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{p.nombre} {p.apellido}</p>
                        <p className="text-xs text-slate-400">{p.numero_documento ? `${p.tipo_documento}: ${p.numero_documento}` : p.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{edad !== null ? `${edad} años` : '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{p.telefono}</td>
                  <td className="px-5 py-3">
                    {p.tipo_sangre ? (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><Droplet size={12} /> {p.tipo_sangre}</span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800 tabular-nums">
                    Bs. {parseFloat(p.total_gastado ?? 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => navigate(`/pacientes/${p.id}`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver"><Eye size={14} /></button>
                      <button onClick={() => navigate(`/pacientes/${p.id}/editar`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar paciente?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          </div>
        )}
        {/* Paginación */}
        {meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Página {meta.current_page} de {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Anterior</button>
              <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
