import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCitas, createCita, updateCita, deleteCita, getPacientes, getProcedimientos } from '../services/api'
import { Plus, Pencil, Trash2, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '../components/Modal'

const estadoColors = {
  confirmada: 'bg-green-100 text-green-700 border-green-200',
  pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  realizada: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelada: 'bg-red-100 text-red-700 border-red-200',
  no_asistio: 'bg-slate-100 text-slate-500 border-slate-200',
}

const emptyForm = { paciente_id: '', procedimiento_id: '', doctor: 'Dr. Ramón Rojas', fecha_hora: '', duracion_min: 30, estado: 'pendiente', monto: '', notas: '' }

function fmt(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

export default function Citas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [view, setView] = useState('lista') // lista | semana
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { data: citasData, isLoading } = useQuery({
    queryKey: ['citas', view, weekOffset],
    queryFn: () => {
      if (view === 'semana') {
        return getCitas({
          fecha_inicio: weekStart.toISOString().slice(0, 10),
          fecha_fin: weekEnd.toISOString().slice(0, 10)
        }).then(r => r.data)
      }
      return getCitas().then(r => r.data)
    }
  })

  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-select'], queryFn: () => getPacientes({ per_page: 999 }).then(r => r.data) })
  const { data: procsData } = useQuery({ queryKey: ['procedimientos'], queryFn: () => getProcedimientos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createCita, onSuccess: () => { qc.invalidateQueries(['citas']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateCita(id, data), onSuccess: () => { qc.invalidateQueries(['citas']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteCita, onSuccess: () => qc.invalidateQueries(['citas']) })

  const citas = Array.isArray(citasData?.data) ? citasData.data : (Array.isArray(citasData) ? citasData : [])
  const pacientes = pacientesData?.data ?? []
  const procs = Array.isArray(procsData) ? procsData : []

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (c) => {
    const fh = c.fecha_hora ? c.fecha_hora.slice(0, 16) : ''
    setForm({ ...c, fecha_hora: fh, procedimiento_id: c.procedimiento_id ?? '', notas: c.notas ?? '' })
    setModal(c)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal.id, data: form })
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d })
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Citas</h1>
          <p className="text-sm text-slate-500 mt-0.5">{citas.length} citas encontradas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button onClick={() => setView('lista')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'lista' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>Lista</button>
            <button onClick={() => setView('semana')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'semana' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>Semana</button>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nueva Cita
          </button>
        </div>
      </div>

      {view === 'semana' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft size={18} /></button>
            <span className="font-medium text-slate-700 text-sm">
              {weekStart.toLocaleDateString('es-BO', { day: '2-digit', month: 'long' })} – {weekEnd.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-96">
            {days.map((day, i) => {
              const dStr = day.toISOString().slice(0, 10)
              const dayCitas = citas.filter(c => c.fecha_hora?.slice(0, 10) === dStr)
              const isToday = dStr === today.toISOString().slice(0, 10)
              return (
                <div key={i} className="min-h-full">
                  <div className={`px-2 py-2 text-center border-b border-slate-100 ${isToday ? 'bg-indigo-50' : ''}`}>
                    <p className="text-xs text-slate-400">{dayNames[day.getDay()]}</p>
                    <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day.getDate()}</p>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {dayCitas.map(c => (
                      <div key={c.id} onClick={() => openEdit(c)} className={`p-1.5 rounded-lg text-xs cursor-pointer border ${estadoColors[c.estado]} hover:opacity-80 transition-opacity`}>
                        <p className="font-medium">{fmtTime(c.fecha_hora)}</p>
                        <p className="truncate">{c.paciente?.nombre} {c.paciente?.apellido}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Procedimiento</th>
                <th className="px-5 py-3 font-medium">Fecha y Hora</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Monto</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {citas.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{c.paciente?.nombre} {c.paciente?.apellido}</td>
                    <td className="px-5 py-3 text-slate-500">{c.procedimiento?.nombre ?? 'Consulta'}</td>
                    <td className="px-5 py-3 text-slate-600">{fmt(c.fecha_hora)}</td>
                    <td className="px-5 py-3 text-slate-500">{c.doctor}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${estadoColors[c.estado]}`}>{c.estado}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800 tabular-nums">
                      {c.monto ? `Bs. ${parseFloat(c.monto).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar cita?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nueva Cita' : 'Editar Cita'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Paciente *</label>
              <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — {p.telefono}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Procedimiento</label>
              <select value={form.procedimiento_id} onChange={e => set('procedimiento_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Consulta General</option>
                {procs.map(p => <option key={p.id} value={p.id}>{p.nombre} — Bs. {p.precio_procedimiento}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fecha y Hora *</label>
                <input type="datetime-local" value={form.fecha_hora} onChange={e => set('fecha_hora', e.target.value)} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Duración (min)</label>
                <input type="number" value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} min={15} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Doctor</label>
                <input value={form.doctor} onChange={e => set('doctor', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Monto (Bs.)</label>
                <input type="number" value={form.monto} onChange={e => set('monto', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {['pendiente', 'confirmada', 'realizada', 'cancelada', 'no_asistio'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notas</label>
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                {modal === 'nuevo' ? 'Crear Cita' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
