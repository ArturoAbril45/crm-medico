export default function ModuleLoader({ fixed = false }) {
  return (
    <div className={`${fixed ? 'fixed' : 'absolute'} inset-0 z-40 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin" />
        <img src="/logo-clinica.png" alt="Med-Advance" className="w-12 h-12 object-contain" />
      </div>
      <p className="text-sm font-medium text-slate-400">Cargando...</p>
    </div>
  )
}
