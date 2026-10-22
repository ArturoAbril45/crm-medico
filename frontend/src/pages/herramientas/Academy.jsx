import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { GraduationCap, Plus, ShieldCheck, Clock, BadgeCheck, Users2, CheckCircle2, XCircle } from 'lucide-react'
import { getAcademy, moderarAcademyArticulo } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ModuleLoader from '../../components/ModuleLoader'
import Modal from '../../components/Modal'

export default function Academy() {
  const { session } = useAuth()
  const qc = useQueryClient()
  const [modulo, setModulo] = useState('')
  const [tipo, setTipo] = useState('')
  const [moderacion, setModeracion] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['academy', modulo, tipo, moderacion],
    queryFn: () => getAcademy({ modulo: modulo || undefined, tipo: tipo || undefined, estado: moderacion ? 'pendiente' : undefined }).then(r => r.data),
  })
  const publicaciones = data ?? []
  const modulos = [...new Set(publicaciones.map(p => p.modulo).filter(Boolean))]

  const mutModerar = useMutation({
    mutationFn: ({ id, estado }) => moderarAcademyArticulo(id, estado),
    onSuccess: () => qc.invalidateQueries(['academy']),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap size={24} className="text-indigo-500" /> Centro de Conocimiento Médico
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Centro de conocimiento oficial, investigación clínica y simuladores de dosificación</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModeracion(m => !m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${moderacion ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <ShieldCheck size={16} /> Moderación
          </button>
          <Link to="/herramientas/academy/nueva"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> Nueva Publicación
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={modulo} onChange={e => setModulo(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Todos los módulos</option>
          {modulos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={tipo} onChange={e => setTipo(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Todos los tipos</option>
          <option value="oficial">Documentación Oficial</option>
          <option value="comunidad">Publicación de Comunidad</option>
        </select>
      </div>

      {isLoading ? <ModuleLoader /> : publicaciones.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <GraduationCap size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">{moderacion ? 'No hay publicaciones pendientes de moderar' : 'No hay publicaciones todavía'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicaciones.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.tipo === 'oficial' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {p.tipo === 'oficial' ? <span className="inline-flex items-center gap-1"><BadgeCheck size={12} /> Documentación Oficial</span> : <span className="inline-flex items-center gap-1"><Users2 size={12} /> Publicación de Comunidad</span>}
                </span>
                <span className="text-xs text-slate-400 inline-flex items-center gap-1"><Clock size={12} /> {p.minutos_lectura} min de lectura</span>
              </div>
              <Link to={`/herramientas/academy/${p.slug}`} className="font-semibold text-slate-800 hover:text-indigo-600 leading-snug">{p.titulo}</Link>
              {p.resumen && <p className="text-sm text-slate-500 mt-1.5 flex-1 line-clamp-3">{p.resumen}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                <span className="text-[11px] tracking-wide text-slate-400 font-medium">PLATAFORMA MED-ADVANCE</span>
                {moderacion ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => mutModerar.mutate({ id: p.id, estado: 'publicado' })} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md"><CheckCircle2 size={16} /></button>
                    <button onClick={() => mutModerar.mutate({ id: p.id, estado: 'rechazado' })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><XCircle size={16} /></button>
                  </div>
                ) : (
                  <Link to={`/herramientas/academy/${p.slug}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Leer Artículo</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
