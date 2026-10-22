import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getRoles, createRole, updateRole, deleteRole, getPermisos } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Plus, Trash2, Pencil, Users, ShieldCheck, Settings } from 'lucide-react'
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

export default function AjustesGlobales() {
  const [tab, setTab] = useState('usuarios')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ajustes Globales</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de usuarios, roles y permisos del sistema</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100">
        <button onClick={() => setTab('usuarios')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'usuarios' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <Users size={15} /> Usuarios
        </button>
        <button onClick={() => setTab('roles')} className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 ${tab === 'roles' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500'}`}>
          <ShieldCheck size={15} /> Roles y Permisos
        </button>
      </div>

      {tab === 'usuarios' ? <UsuariosTab /> : <RolesTab />}
    </div>
  )
}

const emptyUserForm = { name: '', email: '', password: '', rol_id: '', activo: true }

function UsuariosTab() {
  const qc = useQueryClient()
  const { session } = useAuth()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyUserForm)

  const { data: usuarios, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: () => getUsuarios().then(r => r.data) })
  const { data: roles } = useQuery({ queryKey: ['roles-lista'], queryFn: () => getRoles().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createUsuario, onSuccess: () => { qc.invalidateQueries(['usuarios']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updateUsuario(id, d), onSuccess: () => { qc.invalidateQueries(['usuarios']); setModal(null) } })
  const mutDelete = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => qc.invalidateQueries(['usuarios']),
    onError: (err) => alert(err.response?.data?.message || 'No se pudo eliminar'),
  })

  const abrirNuevo = () => { setForm(emptyUserForm); setModal('nuevo') }
  const abrirEditar = (u) => { setForm({ name: u.name, email: u.email, password: '', rol_id: u.rol_id ?? '', activo: u.activo }); setModal(u.id) }
  const guardar = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (modal !== 'nuevo' && !payload.password) delete payload.password
    if (modal === 'nuevo') mutCreate.mutate(payload)
    else mutUpdate.mutate({ id: modal, d: payload })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : (usuarios ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Users size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.rol?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirEditar(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                      {session?.id !== u.id && (
                        <button onClick={() => { if (confirm('¿Eliminar usuario?')) mutDelete.mutate(u.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Usuario' : 'Editar Usuario'} onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Nombre" required><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} /></Field>
            <Field label="Email" required><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className={inputCls} /></Field>
            <Field label={modal === 'nuevo' ? 'Contraseña' : 'Contraseña (dejar vacío para no cambiarla)'} required={modal === 'nuevo'}>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={modal === 'nuevo'} className={inputCls} />
            </Field>
            <Field label="Rol">
              <select value={form.rol_id} onChange={e => setForm(f => ({ ...f, rol_id: e.target.value }))} className={inputCls + ' bg-white'}>
                <option value="">Sin rol</option>
                {(roles ?? []).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="accent-indigo-600" />
              <span className="text-sm text-slate-700">Activo</span>
            </label>
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

const emptyRoleForm = { nombre: '', descripcion: '', permisos: [] }

function RolesTab() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyRoleForm)

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles-lista'], queryFn: () => getRoles().then(r => r.data) })
  const { data: permisosPorCategoria } = useQuery({ queryKey: ['permisos'], queryFn: () => getPermisos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createRole, onSuccess: () => { qc.invalidateQueries(['roles-lista']); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updateRole(id, d), onSuccess: () => { qc.invalidateQueries(['roles-lista']); setModal(null) } })
  const mutDelete = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries(['roles-lista']),
    onError: (err) => alert(err.response?.data?.message || 'No se pudo eliminar'),
  })

  const abrirNuevo = () => { setForm(emptyRoleForm); setModal('nuevo') }
  const abrirEditar = (r) => { setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '', permisos: r.permisos.map(p => p.id) }); setModal(r.id) }
  const guardar = (e) => {
    e.preventDefault()
    if (modal === 'nuevo') mutCreate.mutate(form)
    else mutUpdate.mutate({ id: modal, d: form })
  }
  const togglePermiso = (id) => setForm(f => ({ ...f, permisos: f.permisos.includes(id) ? f.permisos.filter(p => p !== id) : [...f.permisos, id] }))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Rol
        </button>
      </div>

      {isLoading ? <ModuleLoader /> : (roles ?? []).length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <ShieldCheck size={36} className="text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No hay roles creados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{r.nombre}</p>
                  <p className="text-xs text-slate-400">{r.usuarios_count} usuario(s) · {r.permisos.length} permiso(s)</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => abrirEditar(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar rol?')) mutDelete.mutate(r.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
              {r.descripcion && <p className="text-xs text-slate-500">{r.descripcion}</p>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Rol' : 'Editar Rol'} size="lg" onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <Field label="Nombre" required><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} /></Field>
            <Field label="Descripción"><input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className={inputCls} /></Field>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Permisos</label>
              <div className="space-y-3 max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-3">
                {Object.entries(permisosPorCategoria ?? {}).map(([categoria, permisos]) => (
                  <div key={categoria}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{categoria}</p>
                    <div className="space-y-1.5">
                      {permisos.map(p => (
                        <label key={p.id} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={form.permisos.includes(p.id)} onChange={() => togglePermiso(p.id)} className="accent-indigo-600" />
                          <span className="text-sm text-slate-700">{p.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
