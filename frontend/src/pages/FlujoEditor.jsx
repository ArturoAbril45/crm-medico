import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFlujo, guardarFlujo } from '../services/api'
import { GitBranch, Play, Share2, Save, Plus, MessageSquareText, ListTree, Zap, GitMerge, Shuffle, Clock, Plug, Sparkles } from 'lucide-react'
import ModuleLoader from '../components/ModuleLoader'
import NodePanel from '../components/flow/NodePanel'
import VistaPrevia from '../components/flow/VistaPrevia'
import InicioNode from '../components/flow/nodes/InicioNode'
import ContenidoNode from '../components/flow/nodes/ContenidoNode'
import MenuNode from '../components/flow/nodes/MenuNode'
import CondicionNode from '../components/flow/nodes/CondicionNode'
import AccionNode from '../components/flow/nodes/AccionNode'
import ConexionFlujoNode from '../components/flow/nodes/ConexionFlujoNode'
import RandomizerNode from '../components/flow/nodes/RandomizerNode'
import RetrasoInteligenteNode from '../components/flow/nodes/RetrasoInteligenteNode'
import IntegracionNode from '../components/flow/nodes/IntegracionNode'
import AsistenteGptNode from '../components/flow/nodes/AsistenteGptNode'

const nodeTypes = {
  inicio: InicioNode, contenido: ContenidoNode, menu: MenuNode, condicion: CondicionNode, accion: AccionNode,
  conexion_flujo: ConexionFlujoNode, randomizer: RandomizerNode, retraso_inteligente: RetrasoInteligenteNode,
  integracion: IntegracionNode, asistente_gpt: AsistenteGptNode,
}

const paletaNodos = [
  { tipo: 'contenido', label: 'Contenido', icon: MessageSquareText },
  { tipo: 'menu', label: 'Menú', icon: ListTree },
  { tipo: 'accion', label: 'Acción', icon: Zap },
  { tipo: 'condicion', label: 'Condición', icon: GitBranch },
  { tipo: 'conexion_flujo', label: 'Conexión de flujo', icon: GitMerge },
  { tipo: 'randomizer', label: 'Randomizer', icon: Shuffle },
  { tipo: 'retraso_inteligente', label: 'Retraso inteligente', icon: Clock },
  { tipo: 'integracion', label: 'Integración', icon: Plug },
  { tipo: 'asistente_gpt', label: 'Asistente de IA', icon: Sparkles },
]

function bloqueANodo(b) {
  return { id: b.client_id, type: b.tipo, position: { x: Number(b.pos_x), y: Number(b.pos_y) }, data: { config: b.config ?? {} } }
}
function edgeAFlow(e) {
  return { id: `e-${e.id}`, source: e.from_client_id, target: e.to_client_id, sourceHandle: e.from_handle ?? undefined, label: e.label ?? undefined }
}

function FlujoEditorInner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['flujo', id], queryFn: () => getFlujo(id).then(r => r.data) })

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [editando, setEditando] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const [sucio, setSucio] = useState(false)

  useEffect(() => {
    if (!data) return
    setNodes((data.bloques ?? []).map(bloqueANodo))
    setEdges((data.edges ?? []).map(edgeAFlow))
    setSucio(false)
  }, [data])

  const mutGuardar = useMutation({
    mutationFn: (payload) => guardarFlujo(id, payload),
    onSuccess: () => { qc.invalidateQueries(['flujo', id]); setSucio(false) },
  })

  const onConnect = useCallback((conn) => { setEdges(eds => addEdge(conn, eds)); setSucio(true) }, [setEdges])
  const onNodesChangeWrap = useCallback((changes) => {
    onNodesChange(changes)
    // "dimensions" y "select" son eventos internos de React Flow (medición al montar, selección visual)
    // no representan una edición real del usuario — no deben marcar el flujo como "sucio".
    if (changes.some(c => c.type !== 'dimensions' && c.type !== 'select')) setSucio(true)
  }, [onNodesChange])
  const onEdgesChangeWrap = useCallback((changes) => {
    onEdgesChange(changes)
    if (changes.some(c => c.type !== 'select')) setSucio(true)
  }, [onEdgesChange])

  const editarNodo = useCallback((nodeId) => {
    setNodes(nds => { setEditando(nds.find(n => n.id === nodeId) ?? null); return nds })
  }, [setNodes])

  const nodesConCallback = useMemo(
    () => nodes.map(n => ({ ...n, data: { ...n.data, onEdit: editarNodo } })),
    [nodes, editarNodo]
  )

  const guardarConfigNodo = (nodeId, config) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n))
    setSucio(true)
  }

  const agregarNodo = (tipo) => {
    const nuevoId = crypto.randomUUID()
    const x = 200 + Math.random() * 300
    const y = 150 + Math.random() * 300
    setNodes(nds => [...nds, { id: nuevoId, type: tipo, position: { x, y }, data: { config: {} } }])
    setSucio(true)
  }

  const guardar = () => {
    const payload = {
      bloques: nodes.map(n => ({ client_id: n.id, tipo: n.type, pos_x: n.position.x, pos_y: n.position.y, config: n.data.config ?? {} })),
      edges: edges.map(e => ({ from_client_id: e.source, to_client_id: e.target, from_handle: e.sourceHandle ?? null, label: e.label ?? null })),
    }
    mutGuardar.mutate(payload)
  }

  if (isLoading) return <ModuleLoader fixed />

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/flujos')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
            <GitBranch size={16} />
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-800">{data?.nombre}</span>
          {sucio && <span className="text-xs text-amber-500 font-medium ml-2">Cambios sin guardar</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setVistaPrevia(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
            <Play size={14} /> Vista previa
          </button>
          <button onClick={async () => { await navigator.clipboard.writeText(window.location.href); alert('Enlace copiado') }}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
            <Share2 size={14} />
          </button>
          <button onClick={guardar} disabled={mutGuardar.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors font-medium">
            <Save size={14} /> {mutGuardar.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Paleta de nodos — se oculta mientras se edita un nodo, igual que el original */}
        {!editando && (
          <div className="w-52 bg-white border-r border-slate-200 p-3 space-y-1.5 shrink-0 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1 mb-2">Agregar bloque</p>
            {paletaNodos.map(({ tipo, label, icon: Icon }) => (
              <button key={tipo} onClick={() => agregarNodo(tipo)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors">
                <Icon size={15} className="text-slate-400" /> {label}
                <Plus size={13} className="ml-auto text-slate-300" />
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodesConCallback}
            edges={edges}
            onNodesChange={onNodesChangeWrap}
            onEdgesChange={onEdgesChangeWrap}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>

        {editando && (
          <NodePanel node={editando} onClose={() => setEditando(null)} onSave={guardarConfigNodo} />
        )}
      </div>

      {vistaPrevia && (
        <VistaPrevia nodes={nodes} edges={edges} onClose={() => setVistaPrevia(false)} />
      )}
    </div>
  )
}

export default function FlujoEditor() {
  return (
    <ReactFlowProvider>
      <FlujoEditorInner />
    </ReactFlowProvider>
  )
}
