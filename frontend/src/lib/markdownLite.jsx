function inline(texto, key) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((p, i) => p.startsWith('**') && p.endsWith('**')
    ? <strong key={`${key}-${i}`}>{p.slice(2, -2)}</strong>
    : <span key={`${key}-${i}`}>{p}</span>)
}

export default function MarkdownLite({ texto }) {
  if (!texto) return null
  const lineas = texto.split('\n')
  const bloques = []
  let listaActual = null

  const cerrarLista = () => { if (listaActual) { bloques.push(listaActual); listaActual = null } }

  lineas.forEach((linea, i) => {
    const l = linea.trim()
    if (!l) { cerrarLista(); return }

    if (l.startsWith('## ')) {
      cerrarLista()
      bloques.push(<h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2">{l.slice(3)}</h3>)
      return
    }
    const numMatch = l.match(/^\d+\.\s+(.*)/)
    const guionMatch = l.match(/^-\s+(.*)/)
    if (numMatch || guionMatch) {
      const tipo = numMatch ? 'ol' : 'ul'
      const contenido = (numMatch || guionMatch)[1]
      if (!listaActual || listaActual.type !== tipo) {
        cerrarLista()
        listaActual = { type: tipo, key: i, items: [] }
      }
      listaActual.items.push(contenido)
      return
    }
    cerrarLista()
    bloques.push(<p key={i} className="text-sm text-slate-600 leading-relaxed mb-3">{inline(l, i)}</p>)
  })
  cerrarLista()

  return (
    <div>
      {bloques.map((b, i) => {
        if (b && b.type === 'ol') {
          return <ol key={b.key} className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 mb-4 pl-1">{b.items.map((it, j) => <li key={j}>{inline(it, `${b.key}-${j}`)}</li>)}</ol>
        }
        if (b && b.type === 'ul') {
          return <ul key={b.key} className="list-disc list-inside space-y-1.5 text-sm text-slate-600 mb-4 pl-1">{b.items.map((it, j) => <li key={j}>{inline(it, `${b.key}-${j}`)}</li>)}</ul>
        }
        return b
      })}
    </div>
  )
}
