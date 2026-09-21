import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEstadoBot, conectarBot, desconectarBot } from '../services/api'
import { QrCode, CheckCircle2, Smartphone, Power, RefreshCw } from 'lucide-react'

export default function ConectarWhatsapp() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-estado'],
    queryFn: () => getEstadoBot().then(r => r.data),
    refetchInterval: 3000,
  })

  const mutConectar = useMutation({ mutationFn: conectarBot, onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-estado'] }) })
  const mutDesconectar = useMutation({ mutationFn: desconectarBot, onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-estado'] }) })

  const conectado = !!data?.conectado
  const qr = data?.qr

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
          <QrCode size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Conectar WhatsApp</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vincula un número de WhatsApp real para chatear con tus pacientes</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {isLoading ? (
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        ) : conectado ? (
          <>
            <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-full mb-4">
              <CheckCircle2 size={30} />
            </div>
            <p className="text-slate-800 font-semibold text-lg">WhatsApp conectado</p>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Smartphone size={14} /> {data.numero}
            </p>
            <button
              onClick={() => mutDesconectar.mutate()}
              disabled={mutDesconectar.isPending}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              <Power size={16} /> {mutDesconectar.isPending ? 'Desconectando...' : 'Desconectar'}
            </button>
          </>
        ) : qr ? (
          <>
            <img src={qr} alt="Código QR de WhatsApp" className="w-56 h-56 rounded-xl border border-slate-100" />
            <p className="text-sm text-slate-600 mt-4 font-medium">Escanea este código con WhatsApp</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              WhatsApp → Dispositivos vinculados → Vincular un dispositivo. El código se actualiza solo si expira.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full mb-4">
              <QrCode size={28} />
            </div>
            <p className="text-slate-700 font-medium">Sin conexión activa</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              {data?.error ? data.error : 'Genera un código QR para vincular un número de WhatsApp.'}
            </p>
            <button
              onClick={() => mutConectar.mutate()}
              disabled={mutConectar.isPending}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={16} className={mutConectar.isPending ? 'animate-spin' : ''} />
              {mutConectar.isPending ? 'Generando...' : 'Generar código QR'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
