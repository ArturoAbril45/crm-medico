import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMonitorTv } from '../../services/api'
import { HeartPulse, Volume2, Clock, Tv } from 'lucide-react'

export default function MonitorTv() {
  const [ahora, setAhora] = useState(new Date())
  const { data } = useQuery({
    queryKey: ['monitor-tv'],
    queryFn: () => getMonitorTv().then(r => r.data),
    refetchInterval: 8000,
  })

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const fecha = ahora.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()

  const llamando = data?.llamando
  const atendidos = data?.atendidos ?? []

  return (
    <div className="-m-6 min-h-[calc(100vh-73px)] bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">SISTEMA DE LLAMADO</h1>
              <p className="text-[11px] font-semibold text-indigo-400 tracking-wide">MED-ADVANCE · CENTRAL DE ATENCIÓN</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{hora}</p>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">{fecha}</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-5 mt-5">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-sky-400 min-h-[420px] flex items-end p-5">
            <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5">
              <HeartPulse size={15} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">MED-ADVANCE</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-indigo-600">Llamando ahora</p>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-wide">PACIENTE EN CURSO</p>
                </div>
                <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                  {llamando ? 1 : 0}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center border-t border-slate-100 mt-4 pt-6">
                {llamando ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">{llamando.paciente}</p>
                    <p className="text-sm text-slate-500 mt-1">{llamando.medico}</p>
                  </>
                ) : (
                  <>
                    <Volume2 size={26} className="text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-400 tracking-wide">SIN LLAMADO ACTIVO</p>
                  </>
                )}
              </div>

              <div className="border-t border-red-100 mt-4 pt-3">
                <p className="text-[11px] font-bold text-red-500 tracking-wide text-center mb-2">YA ATENDIDOS</p>
                {atendidos.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-2">AÚN NO HAY PACIENTES ATENDIDOS</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {atendidos.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 bg-white rounded-md">
                        <span className="text-slate-600">{a.paciente}</span>
                        <span className="text-slate-400">{a.medico}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] font-semibold text-indigo-400 tracking-wide">ESPERA ESTIMADA</p>
                  <p className="text-xs font-bold text-slate-700">TIEMPO PROMEDIO</p>
                </div>
              </div>
              <p className="text-xl font-bold text-indigo-600">~{data?.espera_promedio ?? 0}m</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] font-semibold text-slate-400 tracking-wide mt-5">
          RESPETE SU TURNO &nbsp;·&nbsp; SILENCIO POR FAVOR &nbsp;·&nbsp; MED-ADVANCE
        </p>
      </div>
    </div>
  )
}
