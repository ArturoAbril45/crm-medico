import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransmisiones, createTransmision, deleteTransmision } from '../services/api'
import { Radio, Plus, Calendar, FileText, History, CheckCheck, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

const tabs = [
  { id: 'activas', label: 'Activas y Agendadas', icon: Calendar },
  { id: 'borradores', label: 'Borradores', icon: FileText },
  { id: 'historial', label: 'Historial', icon: History },
]

export default function Transmision() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('activas')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', mensaje: '', fecha_envio: '', hora_envio: '', estado: 'agendada' })

  const { data, isLoading } = useQuery({ queryKey: ['transmisiones'], queryFn: () => getTransmisiones().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createTransmision, onSuccess: () => { qc.invalidateQueries(['transmisiones']); setModal(false); setForm({ nombre: '', mensaje: '', fecha_envio: '', hora_envio: '', estado: 'agendada' }) } })
  const mutDelete = useMutation({ mutationFn: deleteTransmision, onSuccess: () => qc.invalidateQueries(['transmisiones']) })

  const transmisiones = Array.isArray(data) ? data : []
  const activas = transmisiones.filter(t => ['agendada', 'enviando'].includes(t.estado))
  const borradores = transmisiones.filter(t => t.estado === 'borrador')
  const historial = transmisiones.filter(t => t.estado === 'completada')

  const crear = () => {
    if (!form.nombre.trim() || !form.mensaje.trim()) return
    mutCreate.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transmisión</h1>
          <p className="text-sm text-slate-500 mt-0.5">Envía mensajes masivos a tus pacientes</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium rounded-lg">
          <Plus size={15} /> Crear Nueva Transmisión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${tab === t.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <>
          {tab === 'activas' && (
            <div>
              {activas.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center text-slate-400">
                  <Radio size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">No hay transmisiones agendadas</p>
                  <p className="text-sm mt-1">Crea tu primera transmisión masiva</p>
                  <button onClick={() => setModal(true)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors rounded-lg">
                    Crear Transmisión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activas.map(t => (
                    <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{t.nombre}</p>
                        <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={13} /> {t.fecha_envio ?? '—'} {t.hora_envio ?? ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{t.estado}</span>
                        <button onClick={() => { if (confirm('¿Eliminar?')) mutDelete.mutate(t.id) }}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'borradores' && (
            <div>
              {borradores.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">Sin borradores guardados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {borradores.map(t => (
                    <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{t.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.mensaje}</p>
                      </div>
                      <button onClick={() => { if (confirm('¿Eliminar?')) mutDelete.mutate(t.id) }}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'historial' && (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              {historial.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <History size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-slate-500">Sin historial</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="px-5 pb-3 pt-4 font-medium">Transmisión</th>
                      <th className="px-4 pb-3 pt-4 font-medium text-center">Enviados</th>
                      <th className="px-4 pb-3 pt-4 font-medium text-center">Entregados</th>
                      <th className="px-4 pb-3 pt-4 font-medium text-center">Leídos</th>
                      <th className="px-4 pb-3 pt-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historial.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">{t.nombre}</td>
                        <td className="px-4 py-3 text-center tabular-nums text-slate-700">{t.enviados}</td>
                        <td className="px-4 py-3 text-center tabular-nums text-slate-700">{t.entregados}</td>
                        <td className="px-4 py-3 text-center tabular-nums text-slate-700">
                          <span className="flex items-center justify-center gap-1 text-blue-600">
                            <CheckCheck size={13} /> {t.leidos}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal title="Nueva Transmisión" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="ej. Oferta Septiembre"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Mensaje *</label>
              <textarea value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                placeholder="Hola {{nombre}}, tenemos una oferta especial para ti..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fecha de envío</label>
                <input type="date" value={form.fecha_envio} onChange={e => setForm(f => ({ ...f, fecha_envio: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Hora</label>
                <input type="time" value={form.hora_envio} onChange={e => setForm(f => ({ ...f, hora_envio: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={crear} disabled={mutCreate.isPending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                {mutCreate.isPending ? 'Guardando...' : 'Programar Envío'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
