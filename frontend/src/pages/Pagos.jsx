import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPagos, createPago, getPacientes } from '../services/api'
import { Plus, CreditCard, Banknote, ArrowUpDown, QrCode, Download } from 'lucide-react'
import Modal from '../components/Modal'

const metodoPagoIcons = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: ArrowUpDown,
  qr: QrCode,
}
const metodoPagoLabels = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', qr: 'QR' }
const estadoColors = {
  completado: 'bg-green-100 text-green-700',
  pendiente: 'bg-amber-100 text-amber-700',
  cancelado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-slate-100 text-slate-500',
}

const emptyForm = { paciente_id: '', monto: '', metodo_pago: 'efectivo', estado: 'completado', fecha: new Date().toISOString().slice(0, 10), notas: '' }

export default function Pagos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['pagos'], queryFn: () => getPagos().then(r => r.data) })
  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-select'], queryFn: () => getPacientes({ per_page: 999 }).then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createPago, onSuccess: () => { qc.invalidateQueries(['pagos']); setModal(null) } })

  const pagos = data?.data ?? []
  const pacientes = pacientesData?.data ?? []

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => { e.preventDefault(); mutCreate.mutate(form) }

  const totalCompletado = pagos.filter(p => p.estado === 'completado').reduce((s, p) => s + parseFloat(p.monto ?? 0), 0)
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + parseFloat(p.monto ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pagos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagos.length} registros de pago</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Download size={15} /> Exportar Reporte
          </button>
          <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> Registrar Pago
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cobrado', value: `Bs. ${totalCompletado.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Pendiente', value: `Bs. ${totalPendiente.toLocaleString()}`, color: 'text-amber-600' },
          { label: 'Pagos Completados', value: pagos.filter(p => p.estado === 'completado').length, color: 'text-slate-700' },
          { label: 'Pendientes', value: pagos.filter(p => p.estado === 'pendiente').length, color: 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Paciente</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Método</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Notas</th>
              <th className="px-5 py-3 font-medium text-right">Monto</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pagos.map(p => {
                const Icon = metodoPagoIcons[p.metodo_pago] ?? CreditCard
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.paciente?.nombre} {p.paciente?.apellido}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(p.fecha).toLocaleDateString('es-BO')}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Icon size={14} />
                        {metodoPagoLabels[p.metodo_pago]}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[p.estado]}`}>{p.estado}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs max-w-xs truncate">{p.notas || '—'}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800 tabular-nums">
                      Bs. {parseFloat(p.monto ?? 0).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title="Registrar Pago" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Paciente *</label>
              <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Monto (Bs.) *</label>
                <input type="number" step="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fecha *</label>
                <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Método de Pago</label>
                <select value={form.metodo_pago} onChange={e => set('metodo_pago', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {Object.entries(metodoPagoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {['completado', 'pendiente', 'cancelado', 'reembolsado'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notas</label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Registrar Pago</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
