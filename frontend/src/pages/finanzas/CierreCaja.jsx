import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCierreCajaHoy, getCierresCaja, cerrarCaja, reabrirCaja } from '../../services/api'
import { Calculator, Banknote, CreditCard, ArrowLeftRight, QrCode, Lock, LockOpen, History } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const medios = [
  { key: 'total_efectivo', label: 'Efectivo', icon: Banknote, color: 'text-green-600 bg-green-50' },
  { key: 'total_tarjeta', label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  { key: 'total_transferencia', label: 'Transferencia', icon: ArrowLeftRight, color: 'text-purple-600 bg-purple-50' },
  { key: 'total_qr', label: 'QR', icon: QrCode, color: 'text-indigo-600 bg-indigo-50' },
]

export default function CierreCaja() {
  const qc = useQueryClient()
  const [egresos, setEgresos] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const { data: cierre, isLoading } = useQuery({ queryKey: ['cierre-caja-hoy'], queryFn: () => getCierreCajaHoy().then(r => r.data), refetchInterval: 30000 })
  const { data: historial } = useQuery({ queryKey: ['cierres-caja-historial'], queryFn: () => getCierresCaja({ limit: 10 }).then(r => r.data) })

  const mutCerrar = useMutation({
    mutationFn: () => cerrarCaja(cierre.id, { egresos: egresos || 0, observaciones }),
    onSuccess: () => { qc.invalidateQueries(['cierre-caja-hoy']); qc.invalidateQueries(['cierres-caja-historial']) },
  })
  const mutReabrir = useMutation({
    mutationFn: () => reabrirCaja(cierre.id),
    onSuccess: () => qc.invalidateQueries(['cierre-caja-hoy']),
  })

  if (isLoading || !cierre) return <ModuleLoader fixed />

  const totalIngresos = medios.reduce((s, m) => s + Number(cierre[m.key]), 0)
  const egresosActual = cierre.estado === 'cerrado' ? Number(cierre.egresos) : Number(egresos || 0)
  const saldo = totalIngresos - egresosActual

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Calculator size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cierre de Caja</h1>
          <p className="text-sm text-slate-500 mt-0.5">{parseFechaLocal(cierre.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${cierre.estado === 'cerrado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {cierre.estado === 'cerrado' ? <Lock size={13} /> : <LockOpen size={13} />}
          {cierre.estado === 'cerrado' ? 'Cerrada' : 'Abierta'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {medios.map(m => (
          <div key={m.key} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
              <m.icon size={17} />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">${Number(cierre[m.key]).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Ingresos</span>
          <span className="font-semibold text-slate-800">${totalIngresos.toFixed(2)}</span>
        </div>

        {cierre.estado === 'abierto' ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Egresos / Retiros</label>
                <input type="number" step="0.01" value={egresos} onChange={e => setEgresos(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Observaciones</label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} placeholder="Notas del cierre..." className={inputCls + ' resize-none'} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Egresos / Retiros</span>
            <span className="font-semibold text-slate-800">${Number(cierre.egresos).toFixed(2)}</span>
          </div>
        )}

        {cierre.estado === 'cerrado' && cierre.observaciones && (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">{cierre.observaciones}</p>
        )}

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="font-semibold text-slate-700">Saldo Final</span>
          <span className="text-2xl font-bold text-indigo-600">${saldo.toFixed(2)}</span>
        </div>

        {cierre.estado === 'abierto' ? (
          <button onClick={() => mutCerrar.mutate()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            <Lock size={16} /> Cerrar Caja del Día
          </button>
        ) : (
          <button onClick={() => mutReabrir.mutate()} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
            <LockOpen size={16} /> Reabrir Caja
          </button>
        )}
      </div>

      {historial && historial.length > 1 && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <History size={15} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Historial de Cierres</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Total Ingresos</th>
              <th className="px-4 py-2.5 font-medium">Egresos</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {historial.filter(h => h.id !== cierre.id).map(h => (
                <tr key={h.id}>
                  <td className="px-4 py-2.5 text-slate-600">{parseFechaLocal(h.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">${medios.reduce((s, m) => s + Number(h[m.key]), 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-slate-600">${Number(h.egresos).toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${h.estado === 'cerrado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{h.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
