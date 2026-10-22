import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleLoader from '../components/ModuleLoader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransmisiones, createTransmision, deleteTransmision, getFlujos, getPacientes } from '../services/api'
import { Radio, Plus, Calendar, FileText, History, CheckCheck, Trash2, ChevronDown, Users, Filter } from 'lucide-react'
import Modal from '../components/Modal'

const tabs = [
  { id: 'activas', label: 'Activa y programada', icon: Calendar },
  { id: 'borradores', label: 'Borradores', icon: FileText },
  { id: 'historial', label: 'Histórico', icon: History },
]

const velocidades = [
  { id: 'muy_corto', label: 'Muy corto', rango: '1-5s' },
  { id: 'corto', label: 'Corto', rango: '5-20s' },
  { id: 'medio', label: 'Medio', rango: '20-50s' },
  { id: 'largo', label: 'Largo', rango: '50-120s' },
  { id: 'muy_largo', label: 'Muy largo', rango: '120-300s' },
]

const emptyForm = {
  nombre: '', flujoId: '', retraso: 'inteligente', velocidad: 'muy_corto',
  automatizacionPausada: false, filtroEstado: '', filtroFuente: '',
  programarMasTarde: false, fecha_envio: '', hora_envio: '',
}

function EmptyBroadcastIcon() {
  return (
    <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 6.31445C11.6569 6.31445 13 7.74333 13 9.50594L13 26.3145L10 26.3145L7 26.3145L7 9.50594C7 7.74333 8.34315 6.31445 10 6.31445Z" fill="#A4A8B8" />
      <path d="M6 26.7812C6 19.8777 11.5964 14.2812 18.5 14.2812H29.5C36.4036 14.2812 42 19.8777 42 26.7812C42 33.6848 36.4036 39.2812 29.5 39.2812H18.5C11.5964 39.2812 6 33.6848 6 26.7812Z" fill="#D5D8DC" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.9849 41.8773C16.8376 42.9621 14.9972 42.9549 13.8592 41.8557C12.7136 40.7492 12.7136 38.9552 13.8592 37.8487C15.0047 36.7423 13.8607 37.847 13.8607 37.847L13.8628 37.8452L13.8668 37.8414L13.8757 37.8329L13.8968 37.8129C13.9124 37.7982 13.9311 37.7809 13.9529 37.761C13.9965 37.7212 14.0525 37.6713 14.1206 37.6128C14.2568 37.4959 14.4424 37.3439 14.6762 37.1691C15.1427 36.8203 15.8079 36.3752 16.6613 35.9355C18.3709 35.0548 20.8591 34.1855 24 34.1855C27.1409 34.1855 29.6291 35.0548 31.3387 35.9355C32.1921 36.3752 32.8573 36.8203 33.3238 37.1691C33.5576 37.3439 33.7432 37.4959 33.8794 37.6128C33.9475 37.6713 34.0035 37.7212 34.0471 37.761C34.0689 37.7809 34.0876 37.7982 34.1032 37.8129L34.1243 37.8329L34.1332 37.8414L34.1372 37.8452L34.139 37.847L34.1408 37.8487C35.2864 38.9552 35.2864 40.7492 34.1408 41.8557C33.0028 42.9549 31.1624 42.9621 30.0151 41.8773C30.0101 41.8728 29.999 41.8629 29.9818 41.8481C29.9375 41.8101 29.8538 41.7407 29.7324 41.6499C29.4885 41.4675 29.0996 41.2043 28.5779 40.9355C27.5376 40.3996 25.9924 39.8522 24 39.8522C22.0076 39.8522 20.4624 40.3996 19.4221 40.9355C18.9004 41.2043 18.5115 41.4675 18.2676 41.6499C18.1462 41.7407 18.0625 41.8101 18.0182 41.8481C18.001 41.8629 17.9899 41.8728 17.9849 41.8773Z" fill="#A4A8B8" />
      <path d="M21.9687 25.5C21.9687 27.433 20.4087 29 18.4843 29C16.56 29 15 27.433 15 25.5C15 23.567 16.56 22 18.4843 22C20.4087 22 21.9687 23.567 21.9687 25.5Z" fill="white" />
      <path d="M33 25.5C33 27.433 31.44 29 29.5157 29C27.5913 29 26.0313 27.433 26.0313 25.5C26.0313 23.567 27.5913 22 29.5157 22C31.44 22 33 23.567 33 25.5Z" fill="white" />
    </svg>
  )
}

export default function Transmision() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [tab, setTab] = useState('activas')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [mostrarFiltro, setMostrarFiltro] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['transmisiones'], queryFn: () => getTransmisiones().then(r => r.data) })
  const { data: flujosData } = useQuery({ queryKey: ['flujos'], queryFn: () => getFlujos().then(r => r.data), enabled: modal })
  const { data: audiencia } = useQuery({
    queryKey: ['audiencia-transmision', form.filtroEstado, form.filtroFuente],
    queryFn: () => getPacientes({ estado: form.filtroEstado || undefined, fuente: form.filtroFuente || undefined, page: 1 }).then(r => r.data.meta?.total ?? 0),
    enabled: modal,
  })

  const mutCreate = useMutation({
    mutationFn: createTransmision,
    onSuccess: () => { qc.invalidateQueries(['transmisiones']); setModal(false); setForm(emptyForm) },
  })
  const mutDelete = useMutation({ mutationFn: deleteTransmision, onSuccess: () => qc.invalidateQueries(['transmisiones']) })

  const transmisiones = Array.isArray(data) ? data : []
  const flujos = Array.isArray(flujosData) ? flujosData : []
  const activas = transmisiones.filter(t => ['agendada', 'enviando'].includes(t.estado))
  const borradores = transmisiones.filter(t => t.estado === 'borrador')
  const historial = transmisiones.filter(t => t.estado === 'completada')

  const formValido = form.nombre.trim() && form.flujoId && (!form.programarMasTarde || (form.fecha_envio && form.hora_envio))

  const empezar = () => {
    if (!formValido) return
    const flujoNombre = flujos.find(f => String(f.id) === String(form.flujoId))?.nombre ?? ''
    mutCreate.mutate({
      nombre: form.nombre,
      mensaje: `Flujo: ${flujoNombre}`,
      fecha_envio: form.programarMasTarde ? form.fecha_envio : null,
      hora_envio: form.programarMasTarde ? form.hora_envio : null,
      estado: 'agendada',
    })
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
        <ModuleLoader />
      ) : (
        <>
          {tab === 'activas' && (
            <div>
              {activas.length === 0 ? (
                <div className="bg-white border border-slate-100 shadow-sm py-20 text-center">
                  <EmptyBroadcastIcon />
                  <p className="font-medium text-slate-500">No Hay Emisiones Programadas</p>
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
        <Modal title="Crear Transmisión" onClose={() => setModal(false)} size="xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Panel izquierdo: configuración */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Configuración de transmisión</p>

              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">Nombre</span>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value.slice(0, 30) }))}
                  placeholder="Sin título" maxLength={30}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <span className="text-[11px] text-slate-400 block text-right mt-0.5">{form.nombre.length}/30</span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">Flujo</span>
                <div className="relative">
                  <select value={form.flujoId} onChange={e => setForm(f => ({ ...f, flujoId: e.target.value }))}
                    className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    <option value="">Seleccione</option>
                    {flujos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">Retraso</span>
                <div className="flex gap-4">
                  {[{ id: 'inteligente', label: 'Retraso inteligente' }, { id: 'manual', label: 'Retardo manual' }].map(o => (
                    <label key={o.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" checked={form.retraso === o.id} onChange={() => setForm(f => ({ ...f, retraso: o.id }))} className="accent-indigo-600" />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Defina el retraso de tiempo con el que funcionará su transmisión. Cuanto más largo sea el retraso, menos probable es que su transmisión se confunda con spam, pero las transmisiones grandes pueden llevar mucho tiempo
              </p>

              <div className="space-y-2">
                {velocidades.map(v => (
                  <label key={v.id} className={`flex items-center gap-2 text-sm cursor-pointer ${form.retraso !== 'manual' && v.id !== form.velocidad ? 'opacity-40' : ''}`}>
                    <input type="radio" checked={form.velocidad === v.id} disabled={form.retraso !== 'manual'}
                      onChange={() => setForm(f => ({ ...f, velocidad: v.id }))} className="accent-indigo-600" />
                    <span className="text-slate-700">{v.label}</span>
                    <span className="text-slate-400 text-xs">{v.rango}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Panel derecho: segmentación */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Segmentación</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Usuarios que recibirán esta transmisión: <strong className="text-slate-900">{audiencia ?? '…'}</strong>
                  </p>
                </div>
                <button onClick={() => { setModal(false); navigate('/pacientes') }} className="text-xs text-indigo-600 hover:underline shrink-0">
                  Mostrar usuarios
                </button>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.automatizacionPausada}
                  onChange={e => setForm(f => ({ ...f, automatizacionPausada: e.target.checked }))}
                  className="accent-indigo-600 w-4 h-4" />
                Enviar a contactos con automatización pausada
              </label>

              <div className="border border-slate-100 p-4">
                {!mostrarFiltro && !form.filtroEstado && !form.filtroFuente ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Añade filtros para refinar tu audiencia</span>
                    <button onClick={() => setMostrarFiltro(true)} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                      <Filter size={12} /> Añadir filtro
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Filtros activos</span>
                      <button onClick={() => { setForm(f => ({ ...f, filtroEstado: '', filtroFuente: '' })); setMostrarFiltro(false) }} className="text-xs text-slate-400 hover:text-red-500">
                        Quitar
                      </button>
                    </div>
                    <select value={form.filtroEstado} onChange={e => setForm(f => ({ ...f, filtroEstado: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white">
                      <option value="">Estado: todos</option>
                      <option value="activo">activo</option>
                      <option value="inactivo">inactivo</option>
                      <option value="potencial">potencial</option>
                    </select>
                    <select value={form.filtroFuente} onChange={e => setForm(f => ({ ...f, filtroFuente: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white">
                      <option value="">Fuente: todas</option>
                      <option value="whatsapp">whatsapp</option>
                      <option value="referido">referido</option>
                      <option value="instagram">instagram</option>
                      <option value="facebook">facebook</option>
                      <option value="otro">otro</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users size={13} /> La audiencia se recalcula según los filtros elegidos.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
            <label className="flex items-center justify-between text-sm text-slate-700 cursor-pointer">
              Establece el tiempo y corre más tarde
              <input type="checkbox" checked={form.programarMasTarde}
                onChange={e => setForm(f => ({ ...f, programarMasTarde: e.target.checked }))}
                className="accent-indigo-600 w-4 h-4" />
            </label>

            {form.programarMasTarde && (
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.fecha_envio} onChange={e => setForm(f => ({ ...f, fecha_envio: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <input type="time" value={form.hora_envio} onChange={e => setForm(f => ({ ...f, hora_envio: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            )}

            <button onClick={empezar} disabled={!formValido || mutCreate.isPending}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {mutCreate.isPending ? 'Creando...' : '¡Empieza ahora'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
