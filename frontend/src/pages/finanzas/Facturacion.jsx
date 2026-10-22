import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConvenios, createConvenio, deleteConvenio,
  getPrestaciones, createPrestacion, deletePrestacion,
  getPracticasFacturables, createPracticaFacturable, updatePracticaFacturable, deletePracticaFacturable,
  getPresentaciones, generarPresentacion, deletePresentacion,
  getHonorarios, actualizarHonorarioPorcentaje,
  getPacientes, getMedicos,
} from '../../services/api'
import { Plus, Trash2, FileSpreadsheet, RefreshCw, Landmark, LayoutGrid, List } from 'lucide-react'
import Modal from '../../components/Modal'
import ModuleLoader from '../../components/ModuleLoader'

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

function parseFechaLocal(fecha) {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Field({ label, required, className = '', children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const estadoOptions = [
  { v: 'sin_marcar', l: 'Sin marcar', c: 'bg-slate-100 text-slate-600' },
  { v: 'lista', l: 'Lista', c: 'bg-blue-100 text-blue-700' },
  { v: 'presentada', l: 'Presentada', c: 'bg-amber-100 text-amber-700' },
  { v: 'debitada', l: 'Debitada', c: 'bg-red-100 text-red-700' },
  { v: 'cobrada', l: 'Cobrada', c: 'bg-green-100 text-green-700' },
  { v: 'anulada', l: 'Anulada', c: 'bg-slate-200 text-slate-500' },
]

const tabs = ['Convenios', 'Nomenclador', 'Prácticas', 'Presentaciones', 'Honorarios']

export default function Facturacion() {
  const [tab, setTab] = useState('Convenios')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Facturación Médica</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestión SaaS integral de convenios, nomencladores y presentaciones.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-100 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Convenios' && <ConveniosTab />}
      {tab === 'Nomenclador' && <NomencladorTab />}
      {tab === 'Prácticas' && <PracticasTab />}
      {tab === 'Presentaciones' && <PresentacionesTab />}
      {tab === 'Honorarios' && <HonorariosTab />}
    </div>
  )
}

function ConveniosTab() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', codigo: '', reglas_facturacion: '' })

  const { data, isLoading } = useQuery({ queryKey: ['convenios'], queryFn: () => getConvenios().then(r => r.data) })
  const convenios = data ?? []

  const mutCreate = useMutation({
    mutationFn: createConvenio,
    onSuccess: () => { qc.invalidateQueries(['convenios']); setModal(false); setForm({ nombre: '', codigo: '', reglas_facturacion: '' }) },
  })
  const mutDelete = useMutation({ mutationFn: deleteConvenio, onSuccess: () => qc.invalidateQueries(['convenios']) })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuevo Convenio
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : convenios.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Landmark size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No se encontraron convenios</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Reglas de Facturación</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {convenios.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{c.codigo || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-md truncate">{c.reglas_facturacion || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar convenio?')) mutDelete.mutate(c.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nuevo Convenio" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Nombre (Obra Social / Prepaga)" required>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inputCls} />
            </Field>
            <Field label="Código (Ej: RNOS-400800)">
              <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Reglas de Facturación (Opcional)">
              <textarea value={form.reglas_facturacion} onChange={e => setForm(f => ({ ...f, reglas_facturacion: e.target.value }))} rows={4} className={inputCls + ' resize-none'} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function NomencladorTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ codigo: '', descripcion: '', categoria: '', tipo: '', valor_base: '' })

  const { data, isLoading } = useQuery({ queryKey: ['prestaciones', search], queryFn: () => getPrestaciones({ search: search || undefined }).then(r => r.data) })
  const prestaciones = data ?? []

  const mutCreate = useMutation({
    mutationFn: createPrestacion,
    onSuccess: () => { qc.invalidateQueries(['prestaciones']); setModal(false); setForm({ codigo: '', descripcion: '', categoria: '', tipo: '', valor_base: '' }) },
  })
  const mutDelete = useMutation({ mutationFn: deletePrestacion, onSuccess: () => qc.invalidateQueries(['prestaciones']) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o descripción..." className={inputCls + ' max-w-xs'} />
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Nuev. Prestación
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : prestaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <FileSpreadsheet size={36} className="text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">No hay servicios registrados o no coinciden con la búsqueda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Valor Base</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {prestaciones.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.descripcion}</td>
                  <td className="px-4 py-3 text-slate-600">{p.categoria || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.tipo || '—'}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">${Number(p.valor_base).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar prestación?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nueva Prestación" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Código" required><input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Valor Base"><input type="number" step="0.01" value={form.valor_base} onChange={e => setForm(f => ({ ...f, valor_base: e.target.value }))} className={inputCls} /></Field>
            </div>
            <Field label="Descripción" required><input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría"><input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls} /></Field>
              <Field label="Tipo"><input value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls} /></Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function PracticasTab() {
  const qc = useQueryClient()
  const [estado, setEstado] = useState('')
  const [periodo] = useState(new Date().toISOString().slice(0, 7))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ paciente_id: '', medico_id: '', convenio_id: '', monto: '', estado: 'lista', fecha: new Date().toISOString().slice(0, 10) })

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['practicas', periodo, estado],
    queryFn: () => getPracticasFacturables({ periodo, estado: estado || undefined }).then(r => r.data),
  })
  const practicas = data?.practicas ?? []

  const { data: pacientesData } = useQuery({ queryKey: ['pacientes-practicas'], queryFn: () => getPacientes({ per_page: 100 }).then(r => r.data) })
  const pacientes = pacientesData?.data ?? []
  const { data: conveniosData } = useQuery({ queryKey: ['convenios'], queryFn: () => getConvenios().then(r => r.data) })
  const convenios = conveniosData ?? []
  const { data: medicosData } = useQuery({ queryKey: ['medicos-practicas'], queryFn: () => getMedicos({ per_page: 100 }).then(r => r.data) })
  const medicos = medicosData?.data ?? []

  const mutCreate = useMutation({
    mutationFn: createPracticaFacturable,
    onSuccess: () => { qc.invalidateQueries(['practicas']); setModal(false) },
  })
  const mutUpdate = useMutation({ mutationFn: ({ id, d }) => updatePracticaFacturable(id, d), onSuccess: () => qc.invalidateQueries(['practicas']) })
  const mutDelete = useMutation({ mutationFn: deletePracticaFacturable, onSuccess: () => qc.invalidateQueries(['practicas']) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls + ' bg-white max-w-[200px]'}>
          <option value="">Todos los estados</option>
          {estadoOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> Nueva Práctica
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : practicas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <p className="font-semibold text-slate-800">No hay prácticas cargadas en {periodo}.</p>
            <p className="text-xs text-slate-400 mt-1">Se cargan desde el turno del paciente.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Convenio</th>
              <th className="px-4 py-3 font-medium">Prestación</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {practicas.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.paciente?.nombre} {p.paciente?.apellido}</td>
                  <td className="px-4 py-3 text-slate-600">{p.convenio?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.prestacion?.descripcion || '—'}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">${Number(p.monto).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select value={p.estado} onChange={e => mutUpdate.mutate({ id: p.id, d: { estado: e.target.value } })}
                      className={`text-[11px] font-medium rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${estadoOptions.find(o => o.v === p.estado)?.c}`}>
                      {estadoOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar práctica?')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nueva Práctica Facturable" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutCreate.mutate(form) }} className="space-y-4">
            <Field label="Paciente" required>
              <select value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} required className={inputCls + ' bg-white'}>
                <option value="">Seleccionar paciente</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Convenio">
                <select value={form.convenio_id} onChange={e => setForm(f => ({ ...f, convenio_id: e.target.value }))} className={inputCls + ' bg-white'}>
                  <option value="">Particular</option>
                  {convenios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </Field>
              <Field label="Médico">
                <select value={form.medico_id} onChange={e => setForm(f => ({ ...f, medico_id: e.target.value }))} className={inputCls + ' bg-white'}>
                  <option value="">Sin asignar</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monto" required><input type="number" step="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required className={inputCls} /></Field>
              <Field label="Fecha" required><input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required className={inputCls} /></Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function PresentacionesTab() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ convenio_id: '', periodo: new Date().toISOString().slice(0, 7) })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['presentaciones'], queryFn: () => getPresentaciones().then(r => r.data) })
  const presentaciones = data ?? []
  const { data: conveniosData } = useQuery({ queryKey: ['convenios'], queryFn: () => getConvenios().then(r => r.data) })
  const convenios = conveniosData ?? []

  const mutGenerar = useMutation({
    mutationFn: generarPresentacion,
    onSuccess: () => { qc.invalidateQueries(['presentaciones']); qc.invalidateQueries(['practicas']); setModal(false); setError('') },
    onError: (err) => setError(err.response?.data?.message || 'No se pudo generar la presentación'),
  })
  const mutDelete = useMutation({ mutationFn: deletePresentacion, onSuccess: () => { qc.invalidateQueries(['presentaciones']); qc.invalidateQueries(['practicas']) } })

  const statusColors = { borrador: 'bg-slate-100 text-slate-600', presentada: 'bg-amber-100 text-amber-700', liquidada: 'bg-green-100 text-green-700' }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Generar Presentación
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? <ModuleLoader /> : presentaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <p className="font-semibold text-slate-800">Todavía no generaste ninguna presentación.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Período</th>
              <th className="px-4 py-3 font-medium">Convenio Institucional</th>
              <th className="px-4 py-3 font-medium">Presentado</th>
              <th className="px-4 py-3 font-medium">Liquidación ($)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 w-10"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {presentaciones.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.periodo}</td>
                  <td className="px-4 py-3 text-slate-600">{p.convenio?.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{p.presentado_en ? parseFechaLocal(p.presentado_en).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">${Number(p.liquidacion).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar presentación? Las prácticas volverán a estado "Lista".')) mutDelete.mutate(p.id) }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Generar Presentación" onClose={() => setModal(false)}>
          <form onSubmit={(e) => { e.preventDefault(); mutGenerar.mutate(form) }} className="space-y-4">
            <Field label="Convenio" required>
              <select value={form.convenio_id} onChange={e => setForm(f => ({ ...f, convenio_id: e.target.value }))} required className={inputCls + ' bg-white'}>
                <option value="">Seleccionar convenio</option>
                {convenios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Período" required>
              <input type="month" value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} required className={inputCls} />
            </Field>
            <p className="text-xs text-slate-400">Se agruparán todas las prácticas en estado "Lista" de ese convenio y período.</p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Generar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function HonorariosTab() {
  const qc = useQueryClient()
  const [vista, setVista] = useState('tarjetas')
  const [periodo] = useState(new Date().toISOString().slice(0, 7))

  const { data, isLoading } = useQuery({ queryKey: ['honorarios', periodo], queryFn: () => getHonorarios({ periodo }).then(r => r.data) })
  const medicos = data ?? []

  const mutPorcentaje = useMutation({
    mutationFn: ({ id, d }) => actualizarHonorarioPorcentaje(id, d),
    onSuccess: () => qc.invalidateQueries(['honorarios']),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button onClick={() => setVista('tarjetas')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${vista === 'tarjetas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          <LayoutGrid size={14} /> Tarjetas
        </button>
        <button onClick={() => setVista('lista')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${vista === 'lista' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
          <List size={14} /> Lista
        </button>
      </div>

      {isLoading ? <ModuleLoader /> : medicos.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl py-16 flex flex-col items-center text-center">
          <p className="font-semibold text-slate-500">Dr/a. Sin Profesionales</p>
        </div>
      ) : vista === 'tarjetas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicos.map(m => (
            <div key={m.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {m.nombre.charAt(0)}{m.apellido?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Dr(a). {m.nombre} {m.apellido}</p>
                  <p className="text-xs text-slate-400">{m.especialidad || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">STATUS NÓMINA: VALIDADO</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Configurar %</label>
                <input type="number" defaultValue={m.honorario_porcentaje} min="0" max="100"
                  onBlur={e => mutPorcentaje.mutate({ id: m.id, d: { honorario_porcentaje: e.target.value } })}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs" />
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm">
                <span className="text-slate-500">Liquidación</span>
                <span className="font-bold text-slate-800">${Number(m.liquidacion).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">%</th>
              <th className="px-4 py-3 font-medium">Total Cobrado</th>
              <th className="px-4 py-3 font-medium">Liquidación</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {medicos.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">Dr(a). {m.nombre} {m.apellido}</td>
                  <td className="px-4 py-3">
                    <input type="number" defaultValue={m.honorario_porcentaje} min="0" max="100"
                      onBlur={e => mutPorcentaje.mutate({ id: m.id, d: { honorario_porcentaje: e.target.value } })}
                      className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs" />
                  </td>
                  <td className="px-4 py-3 text-slate-600">${Number(m.total_cobrado).toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">${Number(m.liquidacion).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
