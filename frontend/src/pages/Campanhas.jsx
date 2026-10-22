import { useState } from 'react'
import ModuleLoader from '../components/ModuleLoader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCampanhas, createCampanha, updateCampanha, deleteCampanha, getFlujos } from '../services/api'
import { Megaphone, Plus, QrCode, Copy, Search, Download, Trash2, Pencil, MoreVertical, X, ChevronDown } from 'lucide-react'
import Modal from '../components/Modal'

const emptyForm = { nombre: '', flujoId: '', frase: '', estado: 'activa' }
const terminaMal = (s) => /[.!?]\s*$/.test(s.trim())

export default function Campanhas() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null) // null | 'nuevo' | campaña
  const [form, setForm] = useState(emptyForm)
  const [qrLink, setQrLink] = useState(null)
  const [rowMenu, setRowMenu] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['campanhas'], queryFn: () => getCampanhas().then(r => r.data) })
  const { data: flujosData } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data) })
  const mutCreate = useMutation({ mutationFn: createCampanha, onSuccess: () => { qc.invalidateQueries(['campanhas']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateCampanha(id, data), onSuccess: () => { qc.invalidateQueries(['campanhas']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteCampanha, onSuccess: () => qc.invalidateQueries(['campanhas']) })

  const flujos = Array.isArray(flujosData) ? flujosData : []
  const campañas = Array.isArray(data) ? data : []
  const filtradas = campañas.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (c) => {
    const fraseMatch = /Frase: (.*)$/.exec(c.descripcion ?? '')
    setForm({ nombre: c.nombre, flujoId: '', frase: fraseMatch?.[1] ?? '', estado: c.estado ?? 'activa' })
    setModal(c); setRowMenu(null)
  }
  const formValido = form.nombre.trim() && form.flujoId && form.frase.trim() && !terminaMal(form.frase)
  const guardar = () => {
    if (!formValido) return
    const flujoNombre = flujos.find(f => String(f.id) === String(form.flujoId))?.nombre ?? ''
    const payload = {
      nombre: form.nombre.toUpperCase(),
      descripcion: `Flujo: ${flujoNombre} — Frase: ${form.frase.trim()}`,
      estado: form.estado,
    }
    if (modal === 'nuevo') mutCreate.mutate(payload)
    else mutUpdate.mutate({ id: modal.id, data: payload })
  }

  const linkDe = (c) => `${window.location.origin}/c/${c.id}`

  const copiarEnlace = async (c) => {
    try {
      await navigator.clipboard.writeText(linkDe(c))
      alert('Enlace copiado al portapapeles')
    } catch {
      prompt('Copiá el enlace:', linkDe(c))
    }
  }

  const descargarInforme = () => {
    const header = ['Campaña', 'Descripción', 'Participantes', 'Ejecuciones', 'CTR %', 'Estado']
    const rows = filtradas.map(c => [c.nombre, c.descripcion ?? '', c.participantes ?? 0, c.ejecuciones ?? 0, c.ctr ?? 0, c.estado ?? ''])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campañas_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Campañas</h1>
        <div className="flex gap-2">
          <button onClick={descargarInforme} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors">
            <Download size={15} /> Descargar Informe
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus size={15} /> Crear una nueva campaña
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-700">Todas las campañas</p>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{filtradas.length}</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Busca"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
          </div>
        </div>
        {isLoading ? (
          <ModuleLoader />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 font-medium">Campaña</th>
                <th className="px-4 py-3 font-medium text-center">Participantes</th>
                <th className="px-4 py-3 font-medium text-center">Ejecuciones</th>
                <th className="px-4 py-3 font-medium text-center">CTR %</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtradas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{c.nombre}</p>
                    <p className="text-xs text-slate-400">{c.descripcion || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.participantes ?? 0}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.ejecuciones ?? 0}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-700">{c.ctr ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end relative">
                      <button onClick={() => setQrLink(linkDe(c))} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors rounded-md">
                        <QrCode size={12} /> Mostrar QR
                      </button>
                      <button onClick={() => copiarEnlace(c)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors rounded-md">
                        <Copy size={12} /> Copiar enlace
                      </button>
                      <button onClick={() => setRowMenu(m => m === c.id ? null : c.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                        <MoreVertical size={16} />
                      </button>
                      {rowMenu === c.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-100 shadow-lg z-20 text-left">
                          <button onClick={() => openEdit(c)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                            <Pencil size={13} /> Editar
                          </button>
                          <button onClick={() => { setRowMenu(null); if (confirm('¿Eliminar campaña?')) mutDelete.mutate(c.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                            <Trash2 size={13} /> Eliminar
                          </button>
                        </div>
                      )}
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
            <p className="text-sm mt-1">Creá tu primera campaña</p>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <Modal title={modal === 'nuevo' ? 'Crear una nueva campaña' : 'Editar campaña'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <div>
              <span className="text-xs font-medium text-slate-500 block mb-1">Flujo</span>
              <div className="relative">
                <select value={form.flujoId} onChange={e => setForm(f => ({ ...f, flujoId: e.target.value }))}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="">Seleccione</option>
                  {flujos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {flujos.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">No hay flujos creados todavía — creá uno en "Flujos de Conversación".</p>
              )}
            </div>

            <div>
              <input value={form.frase} onChange={e => setForm(f => ({ ...f, frase: e.target.value }))}
                placeholder="Ingrese la frase que iniciará el bot..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <p className={`text-xs mt-1 ${terminaMal(form.frase) ? 'text-red-500' : 'text-slate-400'}`}>
                Por favor, no termine esta oración con el punto (.), exclamación (!) o signo de interrogación (?)
              </p>
            </div>

            <button onClick={guardar} disabled={!formValido || mutCreate.isPending || mutUpdate.isPending}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {modal === 'nuevo' ? (mutCreate.isPending ? 'Creando...' : 'Crear Campaña') : (mutUpdate.isPending ? 'Guardando...' : 'Guardar Cambios')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal QR */}
      {qrLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setQrLink(null)}>
          <div className="bg-white p-6 max-w-xs w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setQrLink(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            <p className="font-semibold text-slate-800 mb-4">Código QR de la campaña</p>
            <img
              alt="QR"
              className="mx-auto border border-slate-100"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrLink)}`}
            />
            <p className="text-xs text-slate-400 mt-3 break-all">{qrLink}</p>
          </div>
        </div>
      )}
    </div>
  )
}
