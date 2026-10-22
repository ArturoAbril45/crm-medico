import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMedicos, createMedico, updateMedico, deleteMedico, googleConnectUrl, desconectarGoogleMedico, getHorariosMedicos, createHorarioMedico, deleteHorarioMedico } from '../../services/api'
import { Plus, Search, MoreVertical, Trash2, Pencil, UserCog, X, GraduationCap, Award, CalendarDays, CheckCircle2, Clock4 } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const paises = [
  'Brasil', 'Argentina', 'México', 'Estados Unidos', 'Colombia', 'Chile', 'Perú', 'Ecuador',
  'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay', 'España', 'Portugal', 'Francia', 'Alemania',
  'Italia', 'Reino Unido', 'Canadá', 'Australia', 'Nueva Zelanda',
]
const monedas = [
  { v: 'USD', l: 'USD - $' }, { v: 'MXN', l: 'MXN - $' }, { v: 'ARS', l: 'ARS - $' }, { v: 'CLP', l: 'CLP - $' },
  { v: 'COP', l: 'COP - $' }, { v: 'PEN', l: 'PEN - S/' }, { v: 'BRL', l: 'BRL - R$' }, { v: 'BOB', l: 'BOB - Bs.' },
  { v: 'UYU', l: 'UYU - $U' }, { v: 'PYG', l: 'PYG - ₲' }, { v: 'EUR', l: 'EUR - €' }, { v: 'GBP', l: 'GBP - £' },
]
const idiomasDisponibles = ['Español', 'Portugués', 'Inglés', 'Francés', 'Alemán', 'Italiano']

const emptyForm = {
  nombre: '', apellido: '', email: '', telefono: '', especialidad: '', subespecialidad: '',
  numero_licencia: '', pais_licencia: '', anos_experiencia: '', tarifa_consulta: '', moneda_tarifa: 'USD',
  educacion: [], certificaciones: [], idiomas: [], activo: true,
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

function ListaEditable({ label, icon: Icon, items, onChange, placeholder }) {
  const [nuevo, setNuevo] = useState('')
  const agregar = () => { if (!nuevo.trim()) return; onChange([...items, nuevo.trim()]); setNuevo('') }
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1.5"><Icon size={13} /> {label}</label>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-400 mb-2">No hay {label.toLowerCase()} agregadas.</p>
      ) : (
        <div className="space-y-1.5 mb-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-600">
              <span className="truncate">{it}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 shrink-0"><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregar() } }}
          className={inputCls} />
        <button type="button" onClick={agregar} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 shrink-0">+ Agregar</button>
      </div>
    </div>
  )
}

const diasSemana = [
  { v: 1, l: 'Lun' }, { v: 2, l: 'Mar' }, { v: 3, l: 'Mié' }, { v: 4, l: 'Jue' },
  { v: 5, l: 'Vie' }, { v: 6, l: 'Sáb' }, { v: 0, l: 'Dom' },
]

const MINUTOS_HORA = ['00', '15', '30', '45']
const to12 = (hhmm) => {
  const [h, m] = (hhmm || '09:00').split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return { h12, m: String(m).padStart(2, '0'), ampm }
}
const to24 = (h12, m, ampm) => {
  let h = Number(h12) % 12
  if (ampm === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${m}`
}

function SelectorHoraAMPM({ value, onChange }) {
  const { h12, m, ampm } = to12(value)
  const selCls = "border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
  return (
    <div className="flex items-center gap-1">
      <select value={h12} onChange={e => onChange(to24(e.target.value, m, ampm))} className={selCls}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-slate-400 text-xs">:</span>
      <select value={m} onChange={e => onChange(to24(h12, e.target.value, ampm))} className={selCls}>
        {MINUTOS_HORA.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
      <select value={ampm} onChange={e => onChange(to24(h12, m, e.target.value))} className={selCls}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

function DisponibilidadMedico({ medicoId }) {
  const qc = useQueryClient()
  const [dias, setDias] = useState([])
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('17:00')

  const { data: horarios } = useQuery({
    queryKey: ['horarios', medicoId],
    queryFn: () => getHorariosMedicos({ medico_id: medicoId }).then(r => r.data),
  })

  const mutCrear = useMutation({
    mutationFn: createHorarioMedico,
    onSuccess: () => { qc.invalidateQueries(['horarios', medicoId]); setDias([]) },
  })
  const mutBorrar = useMutation({
    mutationFn: deleteHorarioMedico,
    onSuccess: () => qc.invalidateQueries(['horarios', medicoId]),
  })

  const toggleDia = (d) => setDias(x => x.includes(d) ? x.filter(v => v !== d) : [...x, d])

  const agregar = () => {
    if (!dias.length || !horaInicio || !horaFin) return
    mutCrear.mutate({
      medico_id: medicoId, rango_aplicacion: 'indefinido', dias_semana: dias,
      hora_inicio: horaInicio, hora_fin: horaFin, tipo_consulta: 'hibrido',
    })
  }

  return (
    <div className="space-y-3">
      {horarios?.length > 0 && (
        <div className="space-y-1.5">
          {horarios.map(h => (
            <div key={h.id} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-600">
              <span>
                {(h.dias_semana ?? []).map(d => diasSemana.find(x => x.v === d)?.l).join(', ') || '—'}
                <span className="text-slate-400"> · </span>{h.hora_inicio}–{h.hora_fin}
              </span>
              <button type="button" onClick={() => mutBorrar.mutate(h.id)} className="text-slate-400 hover:text-red-500 shrink-0"><X size={13} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {diasSemana.map(d => (
          <button key={d.v} type="button" onClick={() => toggleDia(d.v)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${dias.includes(d.v) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
            {d.l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <SelectorHoraAMPM value={horaInicio} onChange={setHoraInicio} />
        <span className="text-slate-400 text-sm">a</span>
        <SelectorHoraAMPM value={horaFin} onChange={setHoraFin} />
        <button type="button" onClick={agregar} disabled={!dias.length || mutCrear.isPending}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 shrink-0 disabled:opacity-40">
          + Agregar
        </button>
      </div>
      <p className="text-[11px] text-slate-400">Podés agregar varios horarios distintos: elegí los días, la hora, tocá "+ Agregar", y repetí para otro rango (ej. lunes 9am–10pm, y jueves a viernes 7am–5pm por separado).</p>
    </div>
  )
}

export default function Medicos() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [rowMenu, setRowMenu] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['medicos', search],
    queryFn: () => getMedicos({ search }).then(r => r.data),
  })

  const mutCreate = useMutation({ mutationFn: createMedico, onSuccess: () => qc.invalidateQueries(['medicos']) })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateMedico(id, data), onSuccess: () => qc.invalidateQueries(['medicos']) })
  const mutDelete = useMutation({ mutationFn: deleteMedico, onSuccess: () => qc.invalidateQueries(['medicos']) })
  const mutDesconectarGoogle = useMutation({
    mutationFn: desconectarGoogleMedico,
    onSuccess: () => qc.invalidateQueries(['medicos']),
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const google = params.get('google')
    if (!google) return
    alert(google === 'ok' ? 'Cuenta de Google vinculada correctamente.' : 'No se pudo vincular la cuenta de Google. Probá de nuevo.')
    window.history.replaceState({}, '', window.location.pathname)
    qc.invalidateQueries(['medicos'])
  }, [])

  const medicos = data?.data ?? []
  const esEdicion = modal && modal !== 'nuevo'

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const openEdit = (m) => {
    setForm({ ...emptyForm, ...m, educacion: m.educacion ?? [], certificaciones: m.certificaciones ?? [], idiomas: m.idiomas ?? [] })
    setModal(m)
    setRowMenu(null)
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') {
      // No cerramos el modal: lo pasamos a modo edición con el médico recién
      // creado para que el botón "Vincular con Google Calendario" aparezca
      // de una, sin que el usuario tenga que reabrirlo desde la lista.
      mutCreate.mutate(form, {
        onSuccess: (res) => {
          const creado = res.data
          setForm(f => ({ ...f, ...creado }))
          setModal(creado)
        },
      })
    } else {
      mutUpdate.mutate({ id: modal.id, data: form }, { onSuccess: () => setModal(null) })
    }
  }

  const toggleIdioma = (idioma) => {
    set('idiomas', form.idiomas.includes(idioma) ? form.idiomas.filter(i => i !== idioma) : [...form.idiomas, idioma])
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Médicos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestione el equipo médico y sus agendas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Nuevo Médico
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, apellido o email..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-visible">
        {isLoading ? (
          <ModuleLoader />
        ) : medicos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <UserCog size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Todos los Profesionales (0)</p>
            <button onClick={openNew} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus size={15} /> Nuevo Médico
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Especialidad</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Licencia</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {medicos.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors relative">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-bold text-xs">{m.nombre[0]}{(m.apellido ?? ' ')[0]}</span>
                      </div>
                      <p className="font-medium text-slate-800">Dr(a). {m.nombre} {m.apellido}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.especialidad || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.telefono || m.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.numero_licencia || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${m.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setRowMenu(x => x === m.id ? null : m.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                      <MoreVertical size={16} />
                    </button>
                    {rowMenu === m.id && (
                      <div className="absolute right-4 top-full mt-1 w-40 bg-white border border-slate-100 shadow-lg z-20 text-left rounded-lg overflow-hidden">
                        <button onClick={() => openEdit(m)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => { setRowMenu(null); if (confirm('¿Eliminar médico?')) mutDelete.mutate(m.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={esEdicion ? 'Editar Médico' : 'Nuevo Médico'} size="xl" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-500 -mt-2 mb-5">Registrar nuevo médico en el sistema</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" required><input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Juan" className={inputCls} /></Field>
                <Field label="Apellido" required><input value={form.apellido} onChange={e => set('apellido', e.target.value)} required placeholder="Pérez" className={inputCls} /></Field>
                <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan.perez@email.com" className={inputCls} /></Field>
                <Field label="Teléfono Móvil"><input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+52 55 1234 5678" className={inputCls} /></Field>
              </div>
              {esEdicion ? (
                modal.google_calendar_conectado ? (
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle2 size={15} /> Cuenta vinculada
                    </span>
                    <button type="button" onClick={() => mutDesconectarGoogle.mutate(modal.id)}
                      className="text-xs font-medium text-slate-500 hover:text-red-600">
                      Desvincular
                    </button>
                  </div>
                ) : (
                  <a href={googleConnectUrl(modal.id)}
                    className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 w-fit">
                    <CalendarDays size={15} className="text-slate-400" /> Vincular con Google Calendario
                  </a>
                )
              ) : (
                <p className="text-xs text-slate-400">Guardá el médico primero para poder vincular su Google Calendar.</p>
              )}
            </div>

            {esEdicion && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Clock4 size={14} className="text-slate-400" /> Disponibilidad
                </h3>
                <DisponibilidadMedico medicoId={modal.id} />
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Información Profesional</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Especialidad" required>
                  <input list="especialidades" value={form.especialidad} onChange={e => set('especialidad', e.target.value)} required placeholder="Escriba o seleccione una especialidad..." className={inputCls} />
                  <datalist id="especialidades">
                    <option>Cardiología</option><option>Pediatría</option><option>Dermatología</option>
                    <option>Ginecología</option><option>Traumatología</option><option>Cirugía General</option>
                    <option>Clínica Médica</option><option>Psiquiatría</option><option>Psicología</option>
                  </datalist>
                </Field>
                <Field label="Subespecialidad"><input value={form.subespecialidad} onChange={e => set('subespecialidad', e.target.value)} placeholder="Ej: Cardiología Pediátrica" className={inputCls} /></Field>
                <Field label="Número de Licencia"><input value={form.numero_licencia} onChange={e => set('numero_licencia', e.target.value)} placeholder="Ej: 12345" className={inputCls} /></Field>
                <Field label="País de Licencia">
                  <select value={form.pais_licencia} onChange={e => set('pais_licencia', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="">Seleccionar país</option>
                    {paises.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Años de Experiencia"><input type="number" value={form.anos_experiencia} onChange={e => set('anos_experiencia', e.target.value)} placeholder="Ej: 10" className={inputCls} /></Field>
                <Field label="Tarifa de Consulta">
                  <div className="flex gap-2">
                    <input type="number" step="0.01" value={form.tarifa_consulta} onChange={e => set('tarifa_consulta', e.target.value)} placeholder="Ej: 50.00" className={inputCls} />
                    <select value={form.moneda_tarifa} onChange={e => set('moneda_tarifa', e.target.value)} className={inputCls + ' bg-white max-w-[7rem]'}>
                      {monedas.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                  </div>
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Formación Académica</h3>
              <ListaEditable label="Educación" icon={GraduationCap} items={form.educacion} onChange={v => set('educacion', v)} placeholder="Ej: Medicina - Universidad de Buenos Aires (2010)" />
              <ListaEditable label="Certificaciones" icon={Award} items={form.certificaciones} onChange={v => set('certificaciones', v)} placeholder="Ej: Board Certified en Cardiología" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Idiomas que Habla</label>
              <div className="flex flex-wrap gap-2">
                {idiomasDisponibles.map(idioma => (
                  <button key={idioma} type="button" onClick={() => toggleIdioma(idioma)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${form.idiomas.includes(idioma) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {idioma}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="accent-indigo-600" />
              <span className="text-sm font-medium text-slate-700">Médico Activo</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Médico</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
