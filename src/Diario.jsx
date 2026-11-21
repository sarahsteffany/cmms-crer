import { useEffect, useState, useCallback } from 'react'

// Ajuste aqui se algum nome de coluna/tabela for diferente no banco
const COL = {
  tabela: 'diario_obra',
  data: 'data',
  servico: 'servico_id',
  efetivo: 'efetivo',
  parado: 'tempo_parado_min',
  atividades: 'atividades',
  foto: 'foto_path',
  autor: 'criado_por',
  criado: 'criado_em'
}
const BUCKET = 'diario-obra'
const POSTOS = ['Encarregado 44h', 'Eletricista 44h', 'Eletricista 12/36', 'Auxiliar 44h', 'Pintor/forro']
const PODE_LANCAR = ['auxiliar', 'terceira', 'analista', 'admin']

const hoje = () => new Date().toISOString().slice(0, 10)
const dtf = d => (d ? d.split('-').reverse().join('/') : '—')

export default function Diario({ supabase, papel, membroId, tenantId }) {
  const [mes, setMes] = useState(hoje().slice(0, 7))
  const [lista, setLista] = useState([])
  const [servicos, setServicos] = useState([])
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ data: hoje(), servico: '', efetivo: [...POSTOS], parado: 0, atividades: '', arquivo: null })

  const pode = PODE_LANCAR.includes(String(papel || '').toLowerCase())

  const carregar = useCallback(async () => {
    setErro('')
    const ini = mes + '-01'
    const [a, b] = await Promise.all([
      supabase.from(COL.tabela).select('*').gte(COL.data, ini).lt(COL.data, proximoMes(mes)).order(COL.data, { ascending: false }),
      supabase.from('servicos_especiais').select('id,titulo,numero').order('numero', { ascending: false })
    ])
    if (a.error) setErro(a.error.message)
    setLista(a.data || [])
    setServicos(b.data || [])
  }, [supabase, mes])

  useEffect(() => { carregar() }, [carregar])

  function proximoMes(m) {
    const [y, n] = m.split('-').map(Number)
    return n === 12 ? `${y + 1}-01-01` : `${y}-${String(n + 1).padStart(2, '0')}-01`
  }

  const avisar = t => { setMsg(t); setTimeout(() => setMsg(''), 2500) }
  const alt = (k, v) => setF(x => ({ ...x, [k]: v }))
  const marcar = p => alt('efetivo', f.efetivo.includes(p) ? f.efetivo.filter(x => x !== p) : [...f.efetivo, p])

  async function salvar(e) {
    e.preventDefault()
    if (!f.atividades.trim()) { setErro('Descreva as atividades do dia.'); return }
    setBusy(true); setErro('')
    let path = null
    if (f.arquivo) {
      path = `${tenantId}/${Date.now()}-${f.arquivo.name.replace(/[^\w.\-]/g, '_')}`
      const up = await supabase.storage.from(BUCKET).upload(path, f.arquivo)
      if (up.error) { setBusy(false); setErro('Foto não enviada: ' + up.error.message); return }
    }
    const { error } = await supabase.from(COL.tabela).insert({
      tenant_id: tenantId,
      [COL.data]: f.data,
      [COL.servico]: f.servico || null,
      [COL.efetivo]: f.efetivo,
      [COL.parado]: Number(f.parado) || 0,
      [COL.atividades]: f.atividades.trim(),
      [COL.foto]: path,
      [COL.autor]: membroId
    })
    setBusy(false)
    if (error) { setErro(error.message); return }
    setF({ data: hoje(), servico: '', efetivo: [...POSTOS], parado: 0, atividades: '', arquivo: null })
    avisar('Diário salvo')
    carregar()
  }

  async function verFoto(path) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)
    if (error) { setErro(error.message); return }
    window.open(data.signedUrl, '_blank')
  }

  const nomeServ = id => {
    const s = servicos.find(x => x.id === id)
    return s ? (s.numero != null ? `#${s.numero} · ` : '') + s.titulo : '—'
  }
  const totParado = lista.reduce((s, x) => s + (Number(x[COL.parado]) || 0), 0)

  return (
    <>
      {erro && <div className="al">{erro}</div>}
      {msg && <div className="al w">{msg}</div>}

      {pode && (
        <form className="card" onSubmit={salvar}>
          <h2>Novo registro do dia</h2>
          <div className="grid c3" style={{ marginBottom: 10 }}>
            <div><label>Data</label><input className="in" type="date" value={f.data} max={hoje()} onChange={e => alt('data', e.target.value)} required /></div>
            <div><label>Serviço (opcional)</label>
              <select value={f.servico} onChange={e => alt('servico', e.target.value)}>
                <option value="">Rotina geral</option>
                {servicos.map(s => <option key={s.id} value={s.id}>{(s.numero != null ? `#${s.numero} · ` : '') + s.titulo}</option>)}
              </select></div>
            <div><label>Tempo parado (min)</label><input className="in" type="number" min="0" value={f.parado} onChange={e => alt('parado', e.target.value)} /></div>
          </div>
          <label>Efetivo presente</label>
          <div style={{ margin: '8px 0 12px', lineHeight: 2 }}>
            {POSTOS.map(p => (
              <label key={p} style={{ textTransform: 'none', fontSize: 13, color: 'var(--t)', marginRight: 14 }}>
                <input type="checkbox" checked={f.efetivo.includes(p)} onChange={() => marcar(p)} /> {p}
              </label>))}
          </div>
          <label>Atividades do dia</label>
          <textarea className="in" rows={3} style={{ margin: '6px 0 10px' }} value={f.atividades} onChange={e => alt('atividades', e.target.value)} />
          <label>Foto (opcional)</label>
          <input className="in" type="file" accept="image/*" style={{ margin: '6px 0 12px' }} onChange={e => alt('arquivo', e.target.files[0] || null)} />
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar diário'}</button>
        </form>
      )}

      <div className="card">
        <h2>Histórico <input className="in" type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ width: 160 }} /></h2>
        <div className="hint" style={{ marginBottom: 8 }}>{lista.length} registro(s) · {totParado} min parados no mês</div>
        <div className="wrap">
          <table>
            <thead><tr><th>Data</th><th>Serviço</th><th>Efetivo</th><th className="num">Parado</th><th>Atividades</th><th>Foto</th></tr></thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan={6} className="hint">Nenhum registro neste mês.</td></tr>}
              {lista.map(x => (
                <tr key={x.id}>
                  <td className="mono">{dtf(x[COL.data])}</td>
                  <td>{nomeServ(x[COL.servico])}</td>
                  <td>{Array.isArray(x[COL.efetivo]) ? x[COL.efetivo].length : '—'}<div className="hint">{Array.isArray(x[COL.efetivo]) ? x[COL.efetivo].join(', ') : ''}</div></td>
                  <td className="num">{x[COL.parado] ? <span className="bd w">{x[COL.parado]} min</span> : '—'}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{x[COL.atividades]}</td>
                  <td>{x[COL.foto] ? <button className="btn g" type="button" onClick={() => verFoto(x[COL.foto])}>Ver</button> : '—'}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
