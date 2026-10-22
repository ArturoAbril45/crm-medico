import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConfiguracionAfip, updateConfiguracionAfip,
  getComprobantesAfip, createComprobanteAfip, emitirComprobanteAfip, anularComprobanteAfip, deleteComprobanteAfip,
  getPacientes,
} from '../../services/api'
import { Plus, Trash2, Send, Ban, Receipt, Settings, AlertTriangle } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const tipoComprobanteLabels = {
  factura_a: 'Factura A', factura_b: 'Factura B', factura_c: 'Factura C',
  nota_credito_a: 'Nota de Crédito A', nota_credito_b: 'Nota de Crédito B', nota_credito_c: 'Nota de Crédito C',
  nota_debito_a: 'Nota de Débito A', nota_debito_b: 'Nota de Débito B', nota_debito_c: 'Nota de Débito C',
}
const estadoColors = { borrador: 'bg-slate-100 text-slate-600', emitido: 'bg-green-100 text-green-700', anulado: 'bg-red-100 text-red-700' }

export default function Afip() {
  const [tab, setTab] = useState('comprobantes')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Facturación AFIP</h1>
        <p className="text-sm text-slate-500 mt-0.5">Emisión de comprobantes electrónicos</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100">
        <button onClick={() => setTab('comprobantes')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'comprobantes' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <Receipt size={15} /> Comprobantes
        </button>
        <button onClick={() => setTab('config')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'config' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <Settings size={15} /> Configuración
        </button>
      </div>

      {tab === 'comprobantes' ? <ComprobantesTab /> : <ConfiguracionTab />}
    </div>
  )
}

function ComprobantesTab() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ paciente_id: '', tipo_comprobante: 'factura_b', monto: '', fecha: new Date().toISOString().slice(0, 10) })

  const { data, isLoading } = useQuery({ queryKey: ['comprobantes-afip'], queryFn: () => getComprobantesAfip().then(r => r.data) })
  const comprobantes = data ?? []
  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-afip'], queryFn: () => getPacientes({ per_page: 100 }).then(r => r.data) })
  const pacientes = pacientesData?.data ?? []

  const mutCreate = useMutation({
    mutationFn: createComprobanteAfip,
    onSuccess: () => { qc.invalidateQueries(['comprobantes-afip']); setModal(false) },
  })
  const mutEmitir = useMutation({ mutationFn: emitirComprobanteAfip, onSuccess: () => qc.invalidateQueries(['comprobantes-afip']) })
  const mutAnular = useMutation({ mutationFn: anularComprobanteAfip, onSuccess: () => qc.invalidateQueries(['comprobantes-afip']) })
  const mutDelete = useMutation({ mutationFn: deleteComprobanteAfip, onSuccess: () => qc.invalidateQueries(['comprobantes-afip']) })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Comprobante
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : comprobantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Receipt size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay comprobantes registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">CAE</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-28"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {comprobantes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{tipoComprobanteLabels[c.tipo_comprobante]}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{String(c.numero).padStart(8, '0')}</td>
                  <td className="px-4 py-3 text-slate-600">{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido ?? ''}` : 'Consumidor Final'}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">${Number(c.monto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.cae || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[c.estado]}`}>{c.estado}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {c.estado === 'borrador' && (
                        <button onClick={() => mutEmitir.mutate(c.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-md" title="Emitir"><Send size={14} /></button>
                      )}
                      {c.estado === 'emitido' && (
                        <button onClick={() => { if (confirm('¿Anular comprobante?')) mutAnular.mutate(c.id) }} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md" title="Anular"><Ban size={14} /></button>
                      )}
                      {c.estado === 'borrador' && (
                        <button onClick={() => { if (confirm('¿Eliminar comprobante?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nuevo Comprobante" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Tipo de Comprobante" required>
              <select value={form.tipo_comprobante} onChange={e => setForm(f => ({ ...f, tipo_comprobante: e.target.value }))} className={inputCls + ' bg-white'}>
                {Object.entries(tipoComprobanteLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Cliente">
              <select value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} className={inputCls + ' bg-white'}>
                <option value="">Consumidor Final</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monto" required><input type="number" step="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Fecha" required><input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required className={inputCls} /></Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar como Borrador</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

const configAfipDefaults = { cuit: '', razon_social: '', punto_venta: 1, condicion_iva: 'monotributo', ambiente: 'testing', activo: false }

function ConfiguracionTab() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['config-afip'], queryFn: () => getConfiguracionAfip().then(r => r.data) })
  const [form, setForm] = useState(configAfipDefaults)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    if (data && !cargado) {
      setForm({ cuit: data.cuit ?? '', razon_social: data.razon_social ?? '', punto_venta: data.punto_venta ?? 1, condicion_iva: data.condicion_iva ?? 'monotributo', ambiente: data.ambiente ?? 'testing', activo: data.activo ?? false })
      setCargado(true)
    }
  }, [data, cargado])

  const mutUpdate = useMutation({ mutationFn: updateConfiguracionAfip, onSuccess: () => qc.invalidateQueries(['config-afip']) })

  if (isLoading) return <ModuleLoader />

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">La conexión con el webservice oficial de AFIP (WSFE) todavía no está integrada — requiere certificado digital y clave fiscal del contribuyente. Mientras tanto, el CAE que se genera al emitir un comprobante es simulado, para que el flujo de trabajo sea usable.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutUpdate.mutate(form) }} className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="CUIT"><input value={form.cuit} onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))} placeholder="20-12345678-9" className={inputCls} /></Field>
          <Field label="Punto de Venta"><input type="number" value={form.punto_venta} onChange={e => setForm(f => ({ ...f, punto_venta: e.target.value }))} className={inputCls} /></Field>
        </div>
        <Field label="Razón Social"><input value={form.razon_social} onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Condición IVA">
            <select value={form.condicion_iva} onChange={e => setForm(f => ({ ...f, condicion_iva: e.target.value }))} className={inputCls + ' bg-white'}>
              <option value="responsable_inscripto">Responsable Inscripto</option>
              <option value="monotributo">Monotributo</option>
              <option value="exento">Exento</option>
              <option value="consumidor_final">Consumidor Final</option>
            </select>
          </Field>
          <Field label="Ambiente">
            <select value={form.ambiente} onChange={e => setForm(f => ({ ...f, ambiente: e.target.value }))} className={inputCls + ' bg-white'}>
              <option value="testing">Testing</option>
              <option value="produccion">Producción</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="accent-indigo-600" />
          <span className="text-sm text-slate-700">Facturación electrónica activa</span>
        </label>
        <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Configuración</button>
      </form>
    </div>
  )
}
