import { useState, useEffect } from 'react'
import { Building2, Plus, X, Search } from 'lucide-react'
import { getCompanias, createCompania } from '../services/api'

function iniciales(nombre) {
  return (nombre || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function Companias() {
  const [companias, setCompanias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setCargando(true)
    getCompanias().then(({ data }) => setCompanias(data)).finally(() => setCargando(false))
  }
  useEffect(() => { cargar() }, [])

  async function guardar() {
    if (!nombreNuevo.trim()) return
    setGuardando(true)
    try {
      await createCompania({ nombre: nombreNuevo.trim() })
      setModal(false)
      setNombreNuevo('')
      cargar()
    } finally {
      setGuardando(false)
    }
  }

  const filtradas = companias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || String(c.id).includes(busqueda)
  )

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Compañías</h1>
          <p className="text-sm text-slate-400 mt-0.5">Clínicas que usan Med-Advance — vinculá o desvinculá su WhatsApp desde acá</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={15} /> Agregar nueva compañía
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        {cargando && <p className="text-sm text-slate-400 text-center py-10">Cargando...</p>}
        {!cargando && filtradas.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">Sin compañías todavía</p>
        )}
        {filtradas.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
            <div className="relative w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0">
              {iniciales(c.nombre)}
              <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${c.whatsapp_conectado ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{c.nombre}</p>
              <p className="text-xs text-slate-400">ID {c.id} · {c.usuarios_count} usuario{c.usuarios_count === 1 ? '' : 's'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-medium ${c.whatsapp_conectado ? 'text-emerald-600' : 'text-red-500'}`}>
                {c.whatsapp_conectado ? 'Conectado' : 'Desconectado'}
              </p>
              {c.whatsapp_telefono && <p className="text-[11px] text-slate-400">{c.whatsapp_telefono}</p>}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                <p className="font-semibold text-slate-800">Nueva compañía</p>
              </div>
              <button onClick={() => setModal(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Nombre de la clínica</label>
            <input value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)} autoFocus
              placeholder="ej. Clínica San Pablo"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando || !nombreNuevo.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {guardando ? 'Creando...' : 'Crear compañía'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
