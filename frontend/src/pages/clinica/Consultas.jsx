import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCostosConsulta, createCostoConsulta, deleteCostoConsulta } from '../../services/api'
import { Plus, Trash2, ClipboardList } from 'lucide-react'
import ModuleLoader from '../../components/ModuleLoader'

const emptyForm = { categoria: '', denominacion: '', valor: '', diferencia: '', observaciones: '' }
const inputCls = "w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
const fmtMoney = (n) => `$${Number(n).toLocaleString('es-AR')}`

export default function Consultas() {
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [agregando, setAgregando] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['costos-consulta'], queryFn: () => getCostosConsulta().then(r => r.data) })
  const mutCreate = useMutation({
    mutationFn: createCostoConsulta,
    onSuccess: () => { qc.invalidateQueries(['costos-consulta']); setForm(emptyForm); setAgregando(false) },
  })
  const mutDelete = useMutation({ mutationFn: deleteCostoConsulta, onSuccess: () => qc.invalidateQueries(['costos-consulta']) })

  const costos = data ?? []
  const grupos = costos.reduce((acc, c) => { (acc[c.categoria] ??= []).push(c); return acc }, {})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const guardar = (e) => {
    e.preventDefault()
    if (!form.categoria.trim() || !form.denominacion.trim()) return
    mutCreate.mutate(form)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Costos de Consultas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona y administra los valores de consulta médica, especialidades y obras sociales.</p>
        </div>
        <button onClick={() => setAgregando(a => !a)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Agregar Valor
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100 text-xs">
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Denominación / Obra Social</th>
            <th className="px-4 py-3 font-medium">Valor ($)</th>
            <th className="px-4 py-3 font-medium">Diferencia ($)</th>
            <th className="px-4 py-3 font-medium">Observaciones</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {agregando && (
              <tr className="bg-indigo-50/40">
                <td className="px-4 py-2"><input value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Categoría" className={inputCls} /></td>
                <td className="px-4 py-2"><input value={form.denominacion} onChange={e => set('denominacion', e.target.value)} placeholder="Ej: DOSEP" className={inputCls} /></td>
                <td className="px-4 py-2"><input type="number" value={form.valor} onChange={e => set('valor', e.target.value)} className={inputCls} /></td>
                <td className="px-4 py-2"><input type="number" value={form.diferencia} onChange={e => set('diferencia', e.target.value)} className={inputCls} /></td>
                <td className="px-4 py-2"><input value={form.observaciones} onChange={e => set('observaciones', e.target.value)} placeholder="Notas" className={inputCls} /></td>
                <td className="px-4 py-2">
                  <button onClick={guardar} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700">Guardar</button>
                </td>
              </tr>
            )}
            {isLoading ? (
              <tr><td colSpan={6}><ModuleLoader /></td></tr>
            ) : costos.length === 0 && !agregando ? (
              <tr><td colSpan={6}>
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <ClipboardList size={36} className="text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-800">No hay valores de consulta cargados</p>
                </div>
              </td></tr>
            ) : Object.entries(grupos).map(([categoria, items]) => (
              <Fragment key={categoria}>
                <tr className="bg-slate-50">
                  <td colSpan={6} className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{categoria}</td>
                </tr>
                {items.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{c.categoria}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{c.denominacion}</td>
                    <td className="px-4 py-2.5 text-slate-700">{fmtMoney(c.valor)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{fmtMoney(c.diferencia)}</td>
                    <td className="px-4 py-2.5 text-slate-400">{c.observaciones || '-'}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { if (confirm('¿Eliminar este valor?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
