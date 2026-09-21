import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPaciente, createPaciente, updatePaciente } from '../services/api'
import { ArrowLeft, User, Mail, AlertCircle } from 'lucide-react'

const emptyForm = {
  nombre: '', segundo_nombre: '', apellido: '', fecha_nacimiento: '', genero: 'masculino', tipo_sangre: '',
  tipo_documento: 'DNI', numero_documento: '', pais_documento: 'Bolivia',
  email: '', telefono: '', telefono_fijo: '', whatsapp: '',
  ciudad: '', pais: 'Bolivia', estado: 'potencial', fuente: 'whatsapp', notas: '',
}

const generoOptions = ['masculino', 'femenino', 'otro']
const tipoDocumentoOptions = ['DNI', 'Cédula de Identidad', 'Pasaporte', 'Carnet de Extranjería']
const tipoSangreOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const estadoOptions = ['activo', 'inactivo', 'potencial']
const fuenteOptions = ['whatsapp', 'referido', 'instagram', 'facebook', 'otro']

export default function PacienteForm() {
  const { id } = useParams()
  const editando = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  const { data } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => getPaciente(id).then(r => r.data),
    enabled: editando,
  })

  useEffect(() => {
    if (data) {
      setForm({
        ...emptyForm,
        ...data,
        fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.slice(0, 10) : '',
      })
    }
  }, [data])

  const mutCreate = useMutation({
    mutationFn: createPaciente,
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['pacientes'] }); navigate(`/pacientes/${res.data.id}`) },
  })
  const mutUpdate = useMutation({
    mutationFn: (d) => updatePaciente(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); qc.invalidateQueries({ queryKey: ['paciente', id] }); navigate(`/pacientes/${id}`) },
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editando) mutUpdate.mutate(form)
    else mutCreate.mutate(form)
  }
  const pending = mutCreate.isPending || mutUpdate.isPending

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ArrowLeft size={15} /> Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-800">{editando ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {editando ? `Actualiza los datos de ${data?.nombre ?? ''} ${data?.apellido ?? ''}` : 'Registra un nuevo paciente en el sistema'}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50 rounded-xl">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">Es esencial que los datos del paciente estén completos para su historia clínica.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <User size={16} className="text-indigo-500" /> Información Personal
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Segundo Nombre</label>
              <input value={form.segundo_nombre ?? ''} onChange={e => set('segundo_nombre', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Apellido</label>
              <input value={form.apellido ?? ''} onChange={e => set('apellido', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Fecha de Nacimiento</label>
              <input type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Género</label>
              <select value={form.genero ?? 'masculino'} onChange={e => set('genero', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white capitalize">
                {generoOptions.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipo de Sangre</label>
              <select value={form.tipo_sangre ?? ''} onChange={e => set('tipo_sangre', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">— Sin especificar —</option>
                {tipoSangreOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipo de Documento</label>
              <select value={form.tipo_documento ?? 'DNI'} onChange={e => set('tipo_documento', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {tipoDocumentoOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Número de Documento</label>
              <input value={form.numero_documento ?? ''} onChange={e => set('numero_documento', e.target.value)}
                placeholder="12345678"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <p className="text-xs text-slate-400 mt-1">Identifica al paciente frente a otros con el mismo nombre</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">País Emisor del Documento</label>
              <input value={form.pais_documento ?? ''} onChange={e => set('pais_documento', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Mail size={16} className="text-indigo-500" /> Datos de Contacto
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
              <input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Teléfono Fijo</label>
              <input value={form.telefono_fijo ?? ''} onChange={e => set('telefono_fijo', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Celular *</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">WhatsApp</label>
              <input value={form.whatsapp ?? ''} onChange={e => set('whatsapp', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Ciudad</label>
              <input value={form.ciudad ?? ''} onChange={e => set('ciudad', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">País</label>
              <input value={form.pais ?? ''} onChange={e => set('pais', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Seguimiento Comercial</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {estadoOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Fuente</label>
              <select value={form.fuente} onChange={e => set('fuente', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {fuenteOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-600 block mb-1">Notas</label>
            <textarea value={form.notas ?? ''} onChange={e => set('notas', e.target.value)} rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={pending} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
            {pending ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Crear Paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
