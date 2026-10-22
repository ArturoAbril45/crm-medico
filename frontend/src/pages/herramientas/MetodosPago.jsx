import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMetodosPago, inicializarMetodosPago, createMetodoPago, updateMetodoPago, deleteMetodoPago } from '../../services/api'
import { Plus, Trash2, CreditCard, Zap, Banknote, ArrowLeftRight, QrCode } from 'lucide-react'
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

const tipoIcons = { efectivo: Banknote, tarjeta: CreditCard, transferencia: ArrowLeftRight, qr: QrCode }
const emptyForm = { nombre: '', tipo: 'efectivo', cuenta_referencia: '', comision_porcentaje: '' }

export default function MetodosPago() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({ queryKey: ['metodos-pago'], queryFn: () => getMetodosPago().then(r => r.data) })
  const metodos = data ?? []

  const mutInicializar = useMutation({ mutationFn: inicializarMetodosPago, onSuccess: () => qc.invalidateQueries(['metodos-pago']) })
  const mutCreate = useMutation({
    mutationFn: createMetodoPago,
    onSuccess: () => { qc.invalidateQueries(['metodos-pago']); setModal(false); setForm(emptyForm) },
  })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updateMetodoPago(id, d), onSuccess: () => qc.invalidateQueries(['metodos-pago']) })
  const mutDelete = useMutation({ mutationFn: deleteMetodoPago, onSuccess: () => qc.invalidateQueries(['metodos-pago']) })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Métodos de Pago</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configuración de métodos de pago de la clínica</p>
        </div>
        {metodos.length > 0 && (
          <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> Nuevo Método
          </button>
        )}
      </div>

      {isLoading ? <ModuleLoader /> : metodos.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <CreditCard size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No hay métodos de pago configurados</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Inicializa los métodos de pago por defecto o crea uno personalizado</p>
          <div className="flex gap-3">
            <button onClick={() => mutInicializar.mutate()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              <Zap size={15} /> Inicializar Métodos por Defecto
            </button>
            <button onClick={() => { setForm(emptyForm); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
              <Plus size={15} /> Nuevo Método
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metodos.map(m => {
            const Icon = tipoIcons[m.tipo] ?? CreditCard
            return (
              <div key={m.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{m.nombre}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.tipo}</p>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('¿Eliminar método de pago?')) mutDelete.mutate(m.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 size={14} />
                  </button>
                </div>
                {m.cuenta_referencia && <p className="text-xs text-slate-500">Cuenta: {m.cuenta_referencia}</p>}
                {Number(m.comision_porcentaje) > 0 && <p className="text-xs text-slate-500">Comisión: {m.comision_porcentaje}%</p>}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={m.activo} onChange={e => mutUpdate.mutate({ id: m.id, d: { activo: e.target.checked } })} className="accent-indigo-600" />
                  <span className="text-xs text-slate-600">{m.activo ? 'Activo' : 'Inactivo'}</span>
                </label>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title="Nuevo Método de Pago" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
            <Field label="Tipo" required>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls + ' bg-white'}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="qr">QR</option>
              </select>
            </Field>
            <Field label="Cuenta / Referencia"><input value={form.cuenta_referencia} onChange={e => setForm(f => ({ ...f, cuenta_referencia: e.target.value }))} placeholder="Ej: Banco Nación - CBU ..." className={inputCls} /></Field>
            <Field label="Comisión (%)"><input type="number" step="0.01" value={form.comision_porcentaje} onChange={e => setForm(f => ({ ...f, comision_porcentaje: e.target.value }))} className={inputCls} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
