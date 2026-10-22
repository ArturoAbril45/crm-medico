import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado,
  getLicenciasEmpleado, createLicenciaEmpleado, updateLicenciaEmpleado, deleteLicenciaEmpleado,
} from '../../services/api'
import { Plus, Trash2, Pencil, Users, CalendarClock, Check, X as XIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const estadoColors = { activo: 'bg-green-100 text-green-700', licencia: 'bg-amber-100 text-amber-700', vacaciones: 'bg-blue-100 text-blue-700', inactivo: 'bg-slate-100 text-slate-500' }
const tipoContratoLabels = { planta_permanente: 'Planta Permanente', plazo_fijo: 'Plazo Fijo', honorarios: 'Honorarios', pasante: 'Pasante' }
const tipoLicenciaLabels = { vacaciones: 'Vacaciones', enfermedad: 'Enfermedad', personal: 'Personal', maternidad_paternidad: 'Maternidad/Paternidad', otro: 'Otro' }
const estadoLicColors = { pendiente: 'bg-amber-100 text-amber-700', aprobada: 'bg-green-100 text-green-700', rechazada: 'bg-red-100 text-red-700' }

const emptyEmpleado = { nombre: '', apellido: '', documento_identidad: '', cargo: '', departamento: '', fecha_ingreso: new Date().toISOString().slice(0, 10), salario: '', tipo_contrato: 'planta_permanente', telefono: '', email: '', estado: 'activo' }
const emptyLicencia = { empleado_id: '', tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', motivo: '' }

export default function RRHH() {
  const [tab, setTab] = useState('empleados')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recursos Humanos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestión de empleados, licencias y vacaciones</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100">
        <button onClick={() => setTab('empleados')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'empleados' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <Users size={15} /> Empleados
        </button>
        <button onClick={() => setTab('licencias')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'licencias' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <CalendarClock size={15} /> Licencias y Vacaciones
        </button>
      </div>

      {tab === 'empleados' ? <EmpleadosTab /> : <LicenciasTab />}
    </div>
  )
}

function EmpleadosTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyEmpleado)

  const { data, isLoading } = useQuery({
    queryKey: ['empleados', search, estado],
    queryFn: () => getEmpleados({ search: search || undefined, estado: estado || undefined }).then(r => r.data),
  })
  const empleados = data ?? []

  const mutCreate = useMutation({ mutationFn: createEmpleado, onSuccess: () => { qc.invalidateQueries(['empleados']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updateEmpleado(id, d), onSuccess: () => { qc.invalidateQueries(['empleados']); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteEmpleado, onSuccess: () => qc.invalidateQueries(['empleados']) })

  const abrirNuevo = () => { setForm(emptyEmpleado); setModal('nuevo') }
  const abrirEditar = (e) => {
    setForm({
      nombre: e.nombre, apellido: e.apellido, documento_identidad: e.documento_identidad ?? '',
      cargo: e.cargo, departamento: e.departamento ?? '', fecha_ingreso: e.fecha_ingreso.slice(0, 10),
      salario: e.salario ?? '', tipo_contrato: e.tipo_contrato, telefono: e.telefono ?? '', email: e.email ?? '', estado: e.estado,
    })
    setModal(e.id)
  }
  const guardar = (ev) => {
    ev.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal, d: form })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o cargo..." className={inputCls + ' max-w-xs'} />
          <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls + ' bg-white max-w-[160px]'}>
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="licencia">Licencia</option>
            <option value="vacaciones">Vacaciones</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Empleado
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : empleados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Users size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay empleados registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Contrato</th>
              <th className="px-4 py-3 font-medium">Ingreso</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {empleados.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.nombre} {e.apellido}</td>
                  <td className="px-4 py-3 text-slate-600">{e.cargo}{e.departamento ? ` · ${e.departamento}` : ''}</td>
                  <td className="px-4 py-3 text-slate-600">{tipoContratoLabels[e.tipo_contrato]}</td>
                  <td className="px-4 py-3 text-slate-600">{parseFechaLocal(e.fecha_ingreso).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoColors[e.estado]}`}>{e.estado}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirEditar(e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar empleado?')) mutDelete.mutate(e.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Empleado' : 'Editar Empleado'} size="lg" onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Apellido" required><input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cargo" required><input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} required placeholder="Ej: Recepcionista" className={inputCls} /></Field>
              <Field label="Departamento"><input value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Documento de Identidad"><input value={form.documento_identidad} onChange={e => setForm(f => ({ ...f, documento_identidad: e.target.value }))} className={inputCls} /></Field>
              <Field label="Tipo de Contrato" required>
                <select value={form.tipo_contrato} onChange={e => setForm(f => ({ ...f, tipo_contrato: e.target.value }))} className={inputCls + ' bg-white'}>
                  {Object.entries(tipoContratoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de Ingreso" required><input type="date" value={form.fecha_ingreso} onChange={e => setForm(f => ({ ...f, fecha_ingreso: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Salario"><input type="number" step="0.01" value={form.salario} onChange={e => setForm(f => ({ ...f, salario: e.target.value }))} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono"><input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inputCls} /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} /></Field>
            </div>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} className={inputCls + ' bg-white'}>
                <option value="activo">Activo</option>
                <option value="licencia">Licencia</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function LicenciasTab() {
  const qc = useQueryClient()
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyLicencia)

  const { data, isLoading } = useQuery({
    queryKey: ['licencias-empleado', estado],
    queryFn: () => getLicenciasEmpleado({ estado: estado || undefined }).then(r => r.data),
  })
  const licencias = data ?? []
  const { data: empleadosData } = useQuery({ queryKey: ['empleados-licencias'], queryFn: () => getEmpleados().then(r => r.data) })
  const empleados = empleadosData ?? []

  const mutCreate = useMutation({
    mutationFn: createLicenciaEmpleado,
    onSuccess: () => { qc.invalidateQueries(['licencias-empleado']); setModal(false); setForm(emptyLicencia) },
  })
  const mutUpdate = useMutation({ mutationFn: ({ id, estado }) => updateLicenciaEmpleado(id, { estado }), onSuccess: () => { qc.invalidateQueries(['licencias-empleado']); qc.invalidateQueries(['empleados']) } })
  const mutDelete = useMutation({ mutationFn: deleteLicenciaEmpleado, onSuccess: () => qc.invalidateQueries(['licencias-empleado']) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls + ' bg-white max-w-[180px]'}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button onClick={() => { setForm(emptyLicencia); setModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nueva Solicitud
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : licencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <CalendarClock size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay solicitudes de licencias</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {licencias.map(l => (
              <div key={l.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{l.empleado?.nombre} {l.empleado?.apellido} · {tipoLicenciaLabels[l.tipo]}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{parseFechaLocal(l.fecha_inicio).toLocaleDateString()} — {parseFechaLocal(l.fecha_fin).toLocaleDateString()}</p>
                  {l.motivo && <p className="text-xs text-slate-500 mt-1">{l.motivo}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoLicColors[l.estado]}`}>{l.estado}</span>
                  {l.estado === 'pendiente' && (
                    <>
                      <button onClick={() => mutUpdate.mutate({ id: l.id, estado: 'aprobada' })} className="p-1.5 text-green-500 hover:bg-green-50 rounded-md" title="Aprobar"><Check size={16} /></button>
                      <button onClick={() => mutUpdate.mutate({ id: l.id, estado: 'rechazada' })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Rechazar"><XIcon size={16} /></button>
                    </>
                  )}
                  <button onClick={() => { if (confirm('¿Eliminar solicitud?')) mutDelete.mutate(l.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Nueva Solicitud de Licencia" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Empleado" required>
              <select value={form.empleado_id} onChange={e => setForm(f => ({ ...f, empleado_id: e.target.value }))} required className={inputCls + ' bg-white'}>
                <option value="">Seleccionar empleado</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
              </select>
            </Field>
            <Field label="Tipo" required>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls + ' bg-white'}>
                {Object.entries(tipoLicenciaLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Desde" required><input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Hasta" required><input type="date" value={form.fecha_fin} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} required className={inputCls} /></Field>
            </div>
            <Field label="Motivo"><textarea value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} rows={3} className={inputCls + ' resize-none'} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Solicitar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
