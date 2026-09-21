import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getMedicos } from '../services/api'
import { navGroups } from '../navConfig'
import { Plus, Pencil, Trash2, ShieldCheck, UserCog, Eye, EyeOff } from 'lucide-react'
import Modal from '../components/Modal'

const roles = ['administrador', 'medico', 'recepcion', 'enfermeria', 'contabilidad']
const rolLabels = { administrador: 'Administrador', medico: 'Médico', recepcion: 'Recepción', enfermeria: 'Enfermería', contabilidad: 'Contabilidad' }

const emptyForm = { name: '', usuario: '', password: '', rol: 'recepcion', medico_id: '', accesoCompleto: true, permisos: [] }

export default function Roles() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showPass, setShowPass] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: () => getUsuarios().then(r => r.data) })
  const { data: medicosData } = useQuery({ queryKey: ['medicos'], queryFn: () => getMedicos().then(r => r.data) })

  const mutCreate = useMutation({ mutationFn: createUsuario, onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); setModal(null) } })
  const mutUpdate = useMutation({ mutationFn: ({ id, data }) => updateUsuario(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); setModal(null) } })
  const mutDelete = useMutation({ mutationFn: deleteUsuario, onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }) })

  const usuarios = Array.isArray(data) ? data : []
  const medicos = Array.isArray(medicosData) ? medicosData : []
  const medicoSeleccionado = medicos.find(m => String(m.id) === String(form.medico_id))

  const openNew = () => { setForm(emptyForm); setShowPass(false); setModal('nuevo') }
  const openEdit = (u) => {
    setForm({
      name: u.name, usuario: u.usuario ?? '', password: '', rol: u.rol,
      medico_id: u.medico_id ?? '', accesoCompleto: !u.permisos, permisos: u.permisos ?? [],
    })
    setShowPass(false)
    setModal(u)
  }

  const toggleModulo = (to) => {
    setForm(f => ({ ...f, permisos: f.permisos.includes(to) ? f.permisos.filter(p => p !== to) : [...f.permisos, to] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name, usuario: form.usuario, rol: form.rol,
      medico_id: form.rol === 'medico' ? (form.medico_id || null) : null,
      permisos: form.accesoCompleto ? null : form.permisos,
    }
    if (form.password) payload.password = form.password
    if (modal === 'nuevo') {
      if (!form.password) return
      mutCreate.mutate(payload)
    } else {
      mutUpdate.mutate({ id: modal.id, data: payload })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Roles y Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">Credenciales de acceso y qué módulos puede ver cada quien</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Médico Vinculado</th>
                <th className="px-4 py-3 font-medium">Acceso</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.usuario}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
                      <UserCog size={12} /> {rolLabels[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.medico?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.permisos ? (
                      <span className="text-xs text-amber-600">{u.permisos.length} módulo(s)</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><ShieldCheck size={12} /> Todos</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar usuario?')) mutDelete.mutate(u.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Todavía no hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'nuevo' ? 'Nuevo Usuario' : 'Editar Usuario'} onClose={() => setModal(null)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Nombre completo *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Usuario (login) *</label>
                <input value={form.usuario} onChange={e => setForm(f => ({ ...f, usuario: e.target.value.toLowerCase().replace(/\s/g, '') }))} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Contraseña {modal === 'nuevo' ? '*' : '(dejar en blanco para no cambiar)'}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required={modal === 'nuevo'}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Rol</label>
                <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {roles.map(r => <option key={r} value={r}>{rolLabels[r]}</option>)}
                </select>
              </div>
            </div>

            {form.rol === 'medico' && (
              <div className="p-4 bg-indigo-50 rounded-xl space-y-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Médico Vinculado</label>
                <select value={form.medico_id} onChange={e => setForm(f => ({ ...f, medico_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="">— Sin vincular —</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                {medicoSeleccionado && (
                  <p className="text-xs text-indigo-600">Especialidad: <strong>{medicoSeleccionado.especialidad}</strong></p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={form.accesoCompleto} onChange={e => setForm(f => ({ ...f, accesoCompleto: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Acceso completo (ve todos los módulos del menú)</span>
              </label>

              {!form.accesoCompleto && (
                <div className="space-y-3 max-h-72 overflow-y-auto border border-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Marca los módulos y submódulos que este usuario SÍ puede ver en el menú.</p>
                  {navGroups.map(grupo => (
                    <div key={grupo.label}>
                      {grupo.items ? (
                        <>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{grupo.label}</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pl-2">
                            {grupo.items.map(item => (
                              <label key={item.to} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={form.permisos.includes(item.to)} onChange={() => toggleModulo(item.to)} className="w-3.5 h-3.5 accent-indigo-600" />
                                {item.label}
                              </label>
                            ))}
                          </div>
                        </>
                      ) : (
                        <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                          <input type="checkbox" checked={form.permisos.includes(grupo.to)} onChange={() => toggleModulo(grupo.to)} className="w-3.5 h-3.5 accent-indigo-600" />
                          {grupo.label}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                {modal === 'nuevo' ? 'Crear Usuario' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
