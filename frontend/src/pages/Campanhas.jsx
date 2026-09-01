import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCampanhas, createCampanha, deleteCampanha } from '../services/api'
import { Megaphone, Plus, QrCode, Copy, Search, Download, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

export default function Campanhas() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const { data, isLoading } = useQuery({ queryKey: ['campanhas'], queryFn: () => getCampanhas().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createCampanha, onSuccess: () => { qc.invalidateQueries(['campanhas']); setModal(false); setForm({ nombre: '', descripcion: '' }) } })
  const mutDelete = useMutation({ mutationFn: deleteCampanha, onSuccess: () => qc.invalidateQueries(['campanhas']) })

  const campañas = Array.isArray(data) ? data : []
  const filtradas = campañas.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const crear = () => {
    if (!form.nombre.trim()) return
    mutCreate.mutate({ ...form, nombre: form.nombre.toUpperCase() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campañas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona tus campañas de WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            <Download size={15} /> Descargar Reporte
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium rounded-lg">
            <Plus size={15} /> Crear Nueva Campaña
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Campañas', value: campañas.length },
          { label: 'Total Participantes', value: campañas.reduce((a, c) => a + (c.participantes ?? 0), 0) },
          { label: 'Total Ejecuciones', value: campañas.reduce((a, c) => a + (c.ejecuciones ?? 0), 0) },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-700">Todas las Campañas <span className="text-slate-400 font-normal ml-1">{filtradas.length}</span></p>
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50" />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-5 pb-3 pt-4 font-medium">Campaña</th>
                <th className="px-4 pb-3 pt-4 font-medium text-center">Participantes</th>
                <th className="px-4 pb-3 pt-4 font-medium text-center">Ejecuciones</th>
                <th className="px-4 pb-3 pt-4 font-medium text-center">CTR %</th>
                <th className="px-4 pb-3 pt-4 font-medium text-center">Estado</th>
                <th className="px-4 pb-3 pt-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtradas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{c.nombre}</p>
                    <p className="text-xs text-slate-400">{c.descripcion}</p>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.participantes}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.ejecuciones}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.ctr}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
                        <QrCode size={12} /> QR
                      </button>
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
                        <Copy size={12} /> Link
                      </button>
                      <button onClick={() => { if (confirm('¿Eliminar campaña?')) mutDelete.mutate(c.id) }}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtradas.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Megaphone size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay campañas</p>
            <p className="text-sm mt-1">Crea tu primera campaña</p>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Crear Nueva Campaña" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre de la campaña *</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="ej. OFERTA SEPTIEMBRE"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
              <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción opcional"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={crear} disabled={mutCreate.isPending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                {mutCreate.isPending ? 'Creando...' : 'Crear Campaña'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
