import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react'
import { getAcademyArticulo, votarAcademyArticulo } from '../../services/api'
import ModuleLoader from '../../components/ModuleLoader'
import MarkdownLite from '../../lib/markdownLite'

export default function AcademyArticulo() {
  const { slug } = useParams()
  const [votado, setVotado] = useState(false)

  const { data: articulo, isLoading } = useQuery({
    queryKey: ['academy-articulo', slug],
    queryFn: () => getAcademyArticulo(slug).then(r => r.data),
  })

  const mutVotar = useMutation({
    mutationFn: (util) => votarAcademyArticulo(articulo.id, util),
    onSuccess: () => setVotado(true),
  })

  if (isLoading) return <ModuleLoader />
  if (!articulo) return null

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/herramientas/academy" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={15} /> Volver a la Academia
      </Link>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${articulo.tipo === 'oficial' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {articulo.tipo === 'oficial' ? 'Documentación Oficial' : 'Publicación de Comunidad'}
        </span>
        <h1 className="text-2xl font-bold text-slate-800 mt-3">{articulo.titulo}</h1>
        {articulo.resumen && <p className="text-slate-500 mt-2">{articulo.resumen}</p>}

        {articulo.tipo === 'oficial' && (
          <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Documentación oficial de plataforma. No es fuente clínica. Un profesional debe revisar el catálogo antes de pacientes reales.</p>
          </div>
        )}

        <div className="mt-6">
          <MarkdownLite texto={articulo.contenido} />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          {votado ? (
            <p className="text-sm text-emerald-600 font-medium inline-flex items-center gap-1.5"><CheckCircle2 size={16} /> ¡Gracias por tu opinión!</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700 mb-3">¿Te sirvió este artículo?</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => mutVotar.mutate(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                  <ThumbsUp size={14} /> Sí, me sirvió
                </button>
                <button onClick={() => mutVotar.mutate(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <ThumbsDown size={14} /> No, faltó información
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
