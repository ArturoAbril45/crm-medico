import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPacientes, createPaciente, updatePaciente, deletePaciente, subirArchivoPaciente, eliminarArchivoPaciente, updateCita, getDisponibilidadMedico } from '../../services/api'
import { Plus, Search, Eye, QrCode, Globe2, Paperclip, X, Upload, FileText, Phone, Mail, MapPin, CalendarDays, Stethoscope, Pencil, Clock } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
]
const tipoDocOptions = [
  { value: 'dni', label: 'DNI' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'cedula', label: 'Cédula/ID' },
  { value: 'otro', label: 'Otro' },
]
const relacionOptions = [
  { value: 'esposo_a', label: 'Esposo/a' },
  { value: 'padre_madre', label: 'Padre/Madre' },
  { value: 'hijo_a', label: 'Hijo/a' },
  { value: 'hermano_a', label: 'Hermano/a' },
  { value: 'otro_familiar', label: 'Otro familiar' },
  { value: 'amigo_a', label: 'Amigo/a' },
  { value: 'otro', label: 'Otro' },
]
const coberturaOptions = [
  { value: 'privado', label: 'Privado' },
  { value: 'obra_social', label: 'Obra Social' },
  { value: 'prepaga', label: 'Prepaga' },
  { value: 'particular', label: 'Particular' },
]
const coberturaColors = {
  privado: 'bg-blue-100 text-blue-700',
  obra_social: 'bg-emerald-100 text-emerald-700',
  prepaga: 'bg-violet-100 text-violet-700',
  particular: 'bg-slate-100 text-slate-600',
}

const emptyForm = {
  nombre: '', segundo_nombre: '', apellido: '', fecha_nacimiento: '', genero: '',
  tipo_documento: 'dni', numero_documento: '', pais_emisor_documento: '',
  email: '', telefono_fijo: '', telefono: '',
  direccion_linea1: '', direccion_linea2: '', ciudad: '', provincia: '', codigo_postal: '', pais: '',
  tipo_sangre: '', factor_rh: '', altura_cm: '', peso_kg: '',
  emergencia_nombre: '', emergencia_telefono: '', emergencia_relacion: '',
  tipo_cobertura: '', consentimiento_red: false,
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
const hoyISO = () => new Date().toISOString().slice(0, 10)

function ReagendarCita({ cita, onDone, onCancel }) {
  const qc = useQueryClient()
  const [fecha, setFecha] = useState(cita.fecha_hora ? cita.fecha_hora.slice(0, 10) : hoyISO())
  const [slot, setSlot] = useState(null)

  const { data: disponibilidad, isFetching } = useQuery({
    queryKey: ['disponibilidad', cita.medico_id, fecha],
    queryFn: () => getDisponibilidadMedico(cita.medico_id, fecha).then(r => r.data),
    enabled: !!cita.medico_id && !!fecha,
  })

  const mutReagendar = useMutation({
    mutationFn: () => updateCita(cita.id, { fecha_hora: slot.fecha_hora }),
    onSuccess: () => { qc.invalidateQueries(['pacientes-medicos']); onDone?.() },
  })

  if (!cita.medico_id) {
    return <p className="text-xs text-amber-600 mt-2">Esta cita no tiene médico asignado, no se puede reagendar por horarios.</p>
  }

  return (
    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
      <input type="date" value={fecha} min={hoyISO()} onChange={e => { setFecha(e.target.value); setSlot(null) }}
        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      {isFetching ? (
        <p className="text-[11px] text-slate-400">Buscando horarios...</p>
      ) : (disponibilidad?.slots ?? []).length === 0 ? (
        <p className="text-[11px] text-slate-400">Sin horarios disponibles ese día. Probá otra fecha.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {disponibilidad.slots.map(s => (
            <button key={s.fecha_hora} type="button" onClick={() => setSlot(s)}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                slot?.fecha_hora === s.fecha_hora ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}>
              <Clock size={10} /> {s.hora}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white">Cancelar</button>
        <button type="button" onClick={() => mutReagendar.mutate()} disabled={!slot || mutReagendar.isPending}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-40">
          {mutReagendar.isPending ? 'Guardando...' : 'Confirmar nuevo horario'}
        </button>
      </div>
    </div>
  )
}

export default function PacientesMedicos() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // null | 'nuevo' | paciente
  const [form, setForm] = useState(emptyForm)
  const [dragOver, setDragOver] = useState(false)
  const [proximamente, setProximamente] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [editandoDetalle, setEditandoDetalle] = useState(false)
  const [formDetalle, setFormDetalle] = useState(null)
  const [reagendarId, setReagendarId] = useState(null)

  const mutUpdateDetalle = useMutation({
    mutationFn: ({ id, data }) => updatePaciente(id, data),
    onSuccess: (res) => { qc.invalidateQueries(['pacientes-medicos']); setDetalle(res.data); setEditandoDetalle(false) },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes-medicos', search, page],
    queryFn: () => getPacientes({ search, page, con_citas: true }).then(r => r.data),
    keepPreviousData: true,
  })

  const mutCreate = useMutation({
    mutationFn: createPaciente,
    onSuccess: () => qc.invalidateQueries(['pacientes-medicos']),
  })
  const mutSubirArchivo = useMutation({
    mutationFn: ({ id, formData }) => subirArchivoPaciente(id, formData),
    onSuccess: () => qc.invalidateQueries(['pacientes-medicos']),
  })
  const mutEliminarArchivo = useMutation({
    mutationFn: ({ id, archivoId }) => eliminarArchivoPaciente(id, archivoId),
    onSuccess: () => qc.invalidateQueries(['pacientes-medicos']),
  })

  const openNew = () => { setForm(emptyForm); setModal('nuevo') }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, whatsapp: form.telefono }
    mutCreate.mutate(payload, { onSuccess: () => setModal(null) })
  }

  const handleFiles = (files, pacienteId) => {
    if (!pacienteId || !files?.length) return
    for (const file of files) {
      const fd = new FormData()
      fd.append('archivo', file)
      mutSubirArchivo.mutate({ id: pacienteId, formData: fd })
    }
  }

  const pacientes = data?.data ?? []
  const meta = data?.meta ?? {}
  const esEdicion = modal && modal !== 'nuevo'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de pacientes del CRM Médico</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setProximamente('Buscador Red Global')} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Globe2 size={15} /> Buscador Red Global
          </button>
          <button onClick={() => setProximamente('QR de mi Passport')} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <QrCode size={15} /> QR de mi Passport
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nuevo Paciente
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar por nombre, documento o teléfono"
          className="w-full pl-9 pr-4 py-2 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      <div className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-xl">
        {isLoading ? (
          <ModuleLoader />
        ) : pacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <img src="/ghost.png" alt="" className="w-14 h-14 mb-3" />
            <p className="font-semibold text-slate-800">No hay pacientes registrados</p>
            <button onClick={openNew} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus size={15} /> Agregar Primer Paciente
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Médico / Especialidad</th>
              <th className="px-4 py-3 font-medium">Próxima reserva</th>
              <th className="px-4 py-3 font-medium text-center">Reservas</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pacientes.map(p => {
                const citas = p.citas ?? []
                const ultimaCita = citas[0]
                return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors relative">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-bold text-xs">{p.nombre[0]}{(p.apellido ?? ' ')[0]}</span>
                      </div>
                      <p className="font-medium text-slate-800">{p.nombre} {p.segundo_nombre} {p.apellido}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.numero_documento ? `${(p.tipo_documento || 'dni').toUpperCase()} ${p.numero_documento}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.telefono || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {ultimaCita ? (
                      <>
                        <p className="font-medium text-slate-700">{ultimaCita.medico ? `Dr(a). ${ultimaCita.medico.nombre} ${ultimaCita.medico.apellido}` : '—'}</p>
                        <p className="text-xs text-slate-400">{ultimaCita.medico?.especialidad || ultimaCita.tipo_consulta || '—'}</p>
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {ultimaCita?.fecha_hora ? new Date(ultimaCita.fecha_hora).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">{citas.length}</td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setDetalle(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
        {meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Página {meta.current_page} de {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Anterior</button>
              <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {proximamente && (
        <Modal title={proximamente} onClose={() => setProximamente(null)}>
          <p className="text-sm text-slate-500">Esta función (red de clínicas / passport digital compartido entre centros) todavía no está integrada en este sistema.</p>
          <button onClick={() => setProximamente(null)} className="mt-4 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Entendido</button>
        </Modal>
      )}

      {modal && (
        <Modal title={esEdicion ? 'Editar Paciente' : 'Nuevo Paciente'} size="xl" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-500 -mt-2 mb-4">
            {esEdicion ? 'Actualizar datos del paciente' : 'Registrar nuevo paciente en el sistema'}
          </p>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl px-3 py-2.5 mb-5">
            📋 Es primordial que los datos de los pacientes estén completos por su historia clínica.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Información Personal">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Nombre" required><input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Juan" className={inputCls} /></Field>
                <Field label="Segundo Nombre"><input value={form.segundo_nombre} onChange={e => set('segundo_nombre', e.target.value)} placeholder="Carlos" className={inputCls} /></Field>
                <Field label="Apellido" required><input value={form.apellido} onChange={e => set('apellido', e.target.value)} required placeholder="Pérez" className={inputCls} /></Field>
                <Field label="Fecha de Nacimiento" required><input type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} required className={inputCls} /></Field>
                <Field label="Género" required>
                  <select value={form.genero} onChange={e => set('genero', e.target.value)} required className={inputCls + ' bg-white'}>
                    <option value="">Seleccionar...</option>
                    {generoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Tipo de Documento">
                  <select value={form.tipo_documento} onChange={e => set('tipo_documento', e.target.value)} className={inputCls + ' bg-white'}>
                    {tipoDocOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label={`Número de Documento (${tipoDocOptions.find(t => t.value === form.tipo_documento)?.label || 'DNI'})`} required className="col-span-2">
                  <input value={form.numero_documento} onChange={e => set('numero_documento', e.target.value)} required placeholder="12345678" className={inputCls} />
                  <p className="text-[11px] text-slate-400 mt-1">Número único de identificación para distinguir pacientes con el mismo nombre</p>
                </Field>
                <Field label="País Emisor del Documento"><input value={form.pais_emisor_documento} onChange={e => set('pais_emisor_documento', e.target.value)} placeholder="Argentina" className={inputCls} /></Field>
              </div>
            </Section>

            <Section title="Datos de Contacto">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan.perez@email.com" className={inputCls} /></Field>
                <Field label="Teléfono Fijo"><input type="tel" value={form.telefono_fijo} onChange={e => set('telefono_fijo', e.target.value)} placeholder="+52 55 1234 5678" className={inputCls} /></Field>
                <Field label="Teléfono Móvil" required><input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} required placeholder="+52 55 9876 5432" className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <Field label="Dirección Línea 1" className="col-span-2"><input value={form.direccion_linea1} onChange={e => set('direccion_linea1', e.target.value)} placeholder="Calle y número" className={inputCls} /></Field>
                <Field label="Dirección Línea 2"><input value={form.direccion_linea2} onChange={e => set('direccion_linea2', e.target.value)} placeholder="Colonia, delegación, etc." className={inputCls} /></Field>
                <Field label="Ciudad"><input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Ciudad de México" className={inputCls} /></Field>
                <Field label="Estado"><input value={form.provincia} onChange={e => set('provincia', e.target.value)} placeholder="CDMX" className={inputCls} /></Field>
                <Field label="Código Postal"><input value={form.codigo_postal} onChange={e => set('codigo_postal', e.target.value)} placeholder="12345" className={inputCls} /></Field>
                <Field label="País" className="col-span-3"><input value={form.pais} onChange={e => set('pais', e.target.value)} placeholder="México" className={inputCls} /></Field>
              </div>
            </Section>

            <Section title="Información Médica">
              <div className="grid grid-cols-4 gap-4">
                <Field label="Tipo de Sangre">
                  <select value={form.tipo_sangre} onChange={e => set('tipo_sangre', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="">Seleccionar...</option>
                    <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                  </select>
                </Field>
                <Field label="Factor RH">
                  <select value={form.factor_rh} onChange={e => set('factor_rh', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="">Seleccionar...</option>
                    <option value="positivo">Positivo (+)</option><option value="negativo">Negativo (-)</option><option value="desconocido">Desconocido</option>
                  </select>
                </Field>
                <Field label="Altura (cm)"><input type="number" value={form.altura_cm} onChange={e => set('altura_cm', e.target.value)} placeholder="170" className={inputCls} /></Field>
                <Field label="Peso (kg)"><input type="number" step="0.1" value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} placeholder="70.5" className={inputCls} /></Field>
              </div>
            </Section>

            <Section title="Contacto de Emergencia">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Nombre Completo"><input value={form.emergencia_nombre} onChange={e => set('emergencia_nombre', e.target.value)} placeholder="María García" className={inputCls} /></Field>
                <Field label="Teléfono"><input type="tel" value={form.emergencia_telefono} onChange={e => set('emergencia_telefono', e.target.value)} placeholder="+52 55 1234 5678" className={inputCls} /></Field>
                <Field label="Relación">
                  <select value={form.emergencia_relacion} onChange={e => set('emergencia_relacion', e.target.value)} className={inputCls + ' bg-white'}>
                    <option value="">Seleccionar...</option>
                    {relacionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Cobertura y Seguros">
              <Field label="Tipo de Cobertura">
                <select value={form.tipo_cobertura} onChange={e => set('tipo_cobertura', e.target.value)} className={inputCls + ' bg-white max-w-xs'}>
                  <option value="">Seleccionar tipo de cobertura</option>
                  {coberturaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Section>

            <Section title="Archivos e Historial Previo">
              {esEdicion ? (
                <div>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files, modal.id) }}
                    onClick={() => document.getElementById('archivo-input')?.click()}
                    className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG (máx. 10MB por archivo)</p>
                    <input id="archivo-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => { handleFiles(e.target.files, modal.id); e.target.value = '' }} />
                  </div>
                  {(modal.archivos?.length > 0) && (
                    <div className="mt-3 space-y-1.5">
                      {modal.archivos.map(a => (
                        <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm">
                          <span className="flex items-center gap-2 text-slate-600 truncate"><FileText size={14} className="shrink-0" /> {a.nombre_original}</span>
                          <button type="button" onClick={() => mutEliminarArchivo.mutate({ id: modal.id, archivoId: a.id })} className="text-slate-400 hover:text-red-500 shrink-0"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5"><Paperclip size={13} /> Podrás adjuntar archivos (análisis, estudios, recetas) después de guardar el paciente.</p>
              )}
            </Section>

            <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-4 py-3">
              <input type="checkbox" checked={form.consentimiento_red} onChange={e => set('consentimiento_red', e.target.checked)} className="mt-0.5 accent-indigo-600" />
              <label className="text-xs text-slate-500">
                <span className="font-medium text-slate-700 block mb-0.5">Consentimiento de Red de Salud</span>
                El paciente consiente compartir su historial médico anonimizado con la Red de Salud para interconsultas y laboratorios asociados. Esta autorización permite que otras clínicas y profesionales de la red accedan a información relevante cuando sea necesario para la atención médica.
              </label>
            </div>

            <div className="flex gap-3 pt-4 -mx-6 -mb-6 px-6 pb-6 sticky bottom-0 bg-white border-t border-slate-100">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar Paciente</button>
            </div>
          </form>
        </Modal>
      )}

      {detalle && (
        <Modal title="Detalle del paciente" size="lg" onClose={() => { setDetalle(null); setEditandoDetalle(false); setReagendarId(null) }}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-700 font-bold">{detalle.nombre[0]}{(detalle.apellido ?? ' ')[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{detalle.nombre} {detalle.segundo_nombre} {detalle.apellido}</p>
                  {detalle.numero_documento && <p className="text-xs text-slate-400">{(detalle.tipo_documento || 'dni').toUpperCase()} {detalle.numero_documento}</p>}
                </div>
              </div>
              {!editandoDetalle && (
                <button onClick={() => { setFormDetalle({ ...detalle }); setEditandoDetalle(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <Pencil size={13} /> Editar datos
                </button>
              )}
            </div>

            {editandoDetalle ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono"><input value={formDetalle.telefono ?? ''} onChange={e => setFormDetalle(f => ({ ...f, telefono: e.target.value }))} className={inputCls} /></Field>
                <Field label="Email"><input type="email" value={formDetalle.email ?? ''} onChange={e => setFormDetalle(f => ({ ...f, email: e.target.value }))} className={inputCls} /></Field>
                <Field label="Dirección"><input value={formDetalle.direccion_linea1 ?? ''} onChange={e => setFormDetalle(f => ({ ...f, direccion_linea1: e.target.value }))} className={inputCls} /></Field>
                <Field label="Ciudad"><input value={formDetalle.ciudad ?? ''} onChange={e => setFormDetalle(f => ({ ...f, ciudad: e.target.value }))} className={inputCls} /></Field>
                <Field label="Fecha de Nacimiento"><input type="date" value={formDetalle.fecha_nacimiento ?? ''} onChange={e => setFormDetalle(f => ({ ...f, fecha_nacimiento: e.target.value }))} className={inputCls} /></Field>
                <Field label="Tipo de Cobertura">
                  <select value={formDetalle.tipo_cobertura ?? ''} onChange={e => setFormDetalle(f => ({ ...f, tipo_cobertura: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Sin especificar</option>
                    {coberturaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Tipo de Sangre">
                  <select value={formDetalle.tipo_sangre ?? ''} onChange={e => setFormDetalle(f => ({ ...f, tipo_sangre: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Sin especificar</option>
                    <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                  </select>
                </Field>
                <Field label="Factor RH">
                  <select value={formDetalle.factor_rh ?? ''} onChange={e => setFormDetalle(f => ({ ...f, factor_rh: e.target.value }))} className={inputCls + ' bg-white'}>
                    <option value="">Sin especificar</option>
                    <option value="positivo">Positivo (+)</option><option value="negativo">Negativo (-)</option>
                  </select>
                </Field>
                <Field label="Contacto de Emergencia"><input value={formDetalle.emergencia_nombre ?? ''} onChange={e => setFormDetalle(f => ({ ...f, emergencia_nombre: e.target.value }))} className={inputCls} /></Field>
                <Field label="Teléfono de Emergencia"><input value={formDetalle.emergencia_telefono ?? ''} onChange={e => setFormDetalle(f => ({ ...f, emergencia_telefono: e.target.value }))} className={inputCls} /></Field>
                <div className="col-span-2 flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditandoDetalle(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                  <button type="button" onClick={() => mutUpdateDetalle.mutate({ id: detalle.id, data: formDetalle })} disabled={mutUpdateDetalle.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                    {mutUpdateDetalle.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Phone size={13} className="text-slate-400 shrink-0" /> {detalle.telefono || '—'}</div>
              <div className="flex items-center gap-2 text-slate-600"><Mail size={13} className="text-slate-400 shrink-0" /> {detalle.email || '—'}</div>
              <div className="flex items-center gap-2 text-slate-600"><MapPin size={13} className="text-slate-400 shrink-0" /> {[detalle.direccion_linea1, detalle.ciudad].filter(Boolean).join(', ') || '—'}</div>
              <div className="flex items-center gap-2 text-slate-600">Nacimiento: {detalle.fecha_nacimiento ? new Date(detalle.fecha_nacimiento).toLocaleDateString() : '—'}</div>
              <div className="flex items-center gap-2 text-slate-600">Sangre: {detalle.tipo_sangre ? `${detalle.tipo_sangre} ${detalle.factor_rh === 'positivo' ? '+' : detalle.factor_rh === 'negativo' ? '-' : ''}` : '—'}</div>
              <div className="flex items-center gap-2 text-slate-600">
                Cobertura: {detalle.tipo_cobertura ? (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${coberturaColors[detalle.tipo_cobertura]}`}>
                    {coberturaOptions.find(c => c.value === detalle.tipo_cobertura)?.label}
                  </span>
                ) : '—'}
              </div>
              {detalle.emergencia_nombre && (
                <div className="col-span-2 flex items-center gap-2 text-slate-600">
                  Emergencia: {detalle.emergencia_nombre} {detalle.emergencia_telefono && `— ${detalle.emergencia_telefono}`}
                </div>
              )}
            </div>
            )}

            {(detalle.archivos?.length > 0) && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Archivos</h4>
                <div className="space-y-1.5">
                  {detalle.archivos.map(a => (
                    <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600">
                      <FileText size={14} className="shrink-0" /> {a.nombre_original}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reservas ({(detalle.citas ?? []).length})</h4>
              {(detalle.citas ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">Sin reservas registradas.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {detalle.citas.map(c => (
                    <div key={c.id} className="border border-slate-100 rounded-xl p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <CalendarDays size={13} className="text-slate-400" />
                          {c.fecha_hora ? new Date(c.fecha_hora).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">{c.estado}</span>
                      </div>
                      <p className="flex items-center gap-1.5 text-slate-500 mt-1.5">
                        <Stethoscope size={13} className="text-slate-400" />
                        {c.medico ? `Dr(a). ${c.medico.nombre} ${c.medico.apellido}` : 'Sin médico asignado'}
                        {c.medico?.especialidad && ` — ${c.medico.especialidad}`}
                      </p>
                      {c.motivo && <p className="text-xs text-slate-400 mt-1">{c.motivo}</p>}
                      {reagendarId === c.id ? (
                        <ReagendarCita cita={c} onCancel={() => setReagendarId(null)} onDone={() => setReagendarId(null)} />
                      ) : (
                        <button type="button" onClick={() => setReagendarId(c.id)}
                          className="flex items-center gap-1.5 mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                          <Clock size={12} /> Reagendar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={() => setDetalle(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cerrar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
