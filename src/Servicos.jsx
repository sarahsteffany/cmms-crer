import { useEffect, useState } from 'react'

// Valores assumidos: ajuste aqui se o banco usar outros
const VAL = { pend: 'pendente', ok: 'aprovado', dev: 'devolvido' }
const TIPOS = ['reforma', 'compra', 'servico_especial', 'gases']
const PRIO = ['baixa', 'media', 'alta', 'urgente']
const VALIDA = ['analista', 'admin']
const CRIA = ['analista', 'supervisor', 'gerente', 'assistente', 'auxiliar', 'admin']
const EDITA = ['analista', 'assistente']
const APROVA_ADIC = ['supervisor', 'gerente', 'admin']

const fmt = v => v == null ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dtf = d => d ? d.split('-').reverse().join('/') : '—'
const VAZIO = { titulo: '', tipo: TIPOS[0], prioridade: 'media', descricao: '', valor_previsto: '', data_prevista_inicio: '', data_prevista_fim: '', ref_neovero: '' }

export default function Servicos({ supabase, papel, membroId, tenantId }) {
  const [lista, setLista] = useState([])
  const [mem, setMem] = useState({})
  const [filtro, setFiltro] = useState('todos')
  const [sel, setSel] = useState(null)
  const [novo, setNovo] = useState(false)
  const [f, setF] = useState(VAZIO)
  const [motivo, setMotivo] = useState('')
  const [devolvendo, setDevolvendo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [rec, setRec] = useState(0)
  const [editando, setEditando] = useState(null)
  const [adic, setAdic] = useState([])
  const [ad, setAd] = useState({ tipo: 'agregar', valor: '', motivo: '' })

  const podeValidar = VALIDA.includes(papel)
  const podeCriar = CRIA.includes(papel)
  const podeEditar = EDITA.includes(papel)
  const podeAprovarAdic = APROVA_ADIC.includes(papel)

  useEffect(() => {
    let vivo = true
    async function carregar() {
      const [s, m, a] = await Promise.all([
        supabase.from('servicos_especiais')
          .select('id,numero,titulo,tipo,status,prioridade,descricao,valor_previsto,data_prevista_inicio,data_prevista_fim,ref_neovero,solicitante_id,responsavel_id,validacao,validacao_motivo,validado_em,validado_por')
          .order('numero', { ascending: false }),
        supabase.from('membros').select('id,nome'),
        supabase.from('servicos_adicionais').select('id,servico_id,tipo,valor,motivo,status,criado_em').order('criado_em')
      ])
      if (!vivo) return
      if (s.error) { setMsg({ erro: true, t: s.error.message }); return }
      const mm = {}; (m.data || []).forEach(x => { mm[x.id] = x.nome })
      setMem(mm)
      setLista(s.data || [])
      setAdic(a.error ? [] : (a.data || []))
    }
    carregar()
    return () => { vivo = false }
  }, [supabase, rec])

  const aviso = (t, erro) => { setMsg({ t, erro: !!erro }); setTimeout(() => setMsg(null), 4000) }
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const nulo = v => (v === '' || v == null ? null : v)

  async function criar(e) {
    e.preventDefault()
    if (!f.titulo.trim()) { aviso('Informe o título', true); return }
    setBusy(true)
    const { error } = await supabase.from('servicos_especiais').insert({
      titulo: f.titulo.trim(),
      tipo: f.tipo,
      prioridade: f.prioridade,
      descricao: nulo(f.descricao),
      valor_previsto: f.valor_previsto === '' ? null : Number(f.valor_previsto),
      data_prevista_inicio: nulo(f.data_prevista_inicio),
      data_prevista_fim: nulo(f.data_prevista_fim),
      ref_neovero: nulo(f.ref_neovero),
      solicitante_id: membroId,
      tenant_id: tenantId
    })
    setBusy(false)
    if (error) { aviso(error.message, true); return }
    setF(VAZIO); setNovo(false)
    aviso('Serviço cadastrado. Aguarda validação do analista.')
    setRec(r => r + 1)
  }

  async function validar(s, ok) {
    const parecer = motivo.trim()
    if (!ok && !parecer) { aviso('Informe o motivo da devolução', true); return }
    setBusy(true)
    const { data, error } = await supabase.from('servicos_especiais')
      .update({
        validacao: ok ? VAL.ok : VAL.dev,
        validacao_motivo: ok ? null : parecer,
        validado_em: new Date().toISOString(),
        validado_por: membroId
      })
      .eq('id', s.id).select('id')
    setBusy(false)
    if (error) { aviso(error.message, true); return }
    if (!data || !data.length) { aviso('Sem permissão para validar este serviço', true); return }
    setMotivo(''); setDevolvendo(false)
    aviso(ok ? 'Serviço aprovado' : 'Serviço devolvido, motivo registrado')
    setRec(r => r + 1)
  }

  const editavel = s => podeEditar && (s.validacao === VAL.pend || s.validacao === VAL.dev)

  function iniciarEdicao(s) {
    setF({
      titulo: s.titulo || '',
      tipo: s.tipo || TIPOS[0],
      prioridade: s.prioridade || 'media',
      descricao: s.descricao || '',
      valor_previsto: s.valor_previsto ?? '',
      data_prevista_inicio: s.data_prevista_inicio || '',
      data_prevista_fim: s.data_prevista_fim || '',
      ref_neovero: s.ref_neovero || ''
    })
    setEditando(s.id)
  }

  function cancelarEdicao() { setEditando(null); setF(VAZIO) }

  async function salvarEdicao(s) {
    if (!editavel(s)) { aviso('Este serviço não pode mais ser editado', true); return }
    if (!f.titulo.trim()) { aviso('Informe o título', true); return }
    setBusy(true)
    const { data, error } = await supabase.from('servicos_especiais')
      .update({
        titulo: f.titulo.trim(),
        tipo: f.tipo,
        prioridade: f.prioridade,
        descricao: nulo(f.descricao),
        valor_previsto: f.valor_previsto === '' ? null : Number(f.valor_previsto),
        data_prevista_inicio: nulo(f.data_prevista_inicio),
        data_prevista_fim: nulo(f.data_prevista_fim),
        ref_neovero: nulo(f.ref_neovero),
        validacao: VAL.pend,
        validacao_motivo: null,
        validado_em: null,
        validado_por: null
      })
      .eq('id', s.id).select('id')
    setBusy(false)
    if (error) { aviso(error.message, true); return }
    if (!data || !data.length) { aviso('Sem permissão para editar este serviço', true); return }
    cancelarEdicao()
    aviso('Serviço atualizado. Aguarda nova validação.')
    setRec(r => r + 1)
  }

  async function criarAdicional(s) {
    const valor = Number(ad.valor)
    if (!valor || valor <= 0) { aviso('Informe um valor maior que zero', true); return }
    if (!ad.motivo.trim()) { aviso('Informe o motivo do adicional', true); return }
    setBusy(true)
    const { error } = await supabase.from('servicos_adicionais').insert({
      servico_id: s.id,
      tenant_id: tenantId,
      tipo: ad.tipo,
      valor,
      motivo: ad.motivo.trim(),
      status: 'pendente',
      criado_por: membroId
    })
    setBusy(false)
    if (error) { aviso(error.message, true); return }
    setAd({ tipo: 'agregar', valor: '', motivo: '' })
    aviso('Adicional enviado para aprovação')
    setRec(r => r + 1)
  }

  async function decidirAdicional(x, ok) {
    setBusy(true)
    const { data, error } = await supabase.from('servicos_adicionais')
      .update({
        status: ok ? 'aprovado' : 'rejeitado',
        decidido_por: membroId,
        decidido_em: new Date().toISOString()
      })
      .eq('id', x.id).select('id')
    setBusy(false)
    if (error) { aviso(error.message, true); return }
    if (!data || !data.length) { aviso('Sem permissão para decidir este adicional', true); return }
    aviso(ok ? 'Adicional aprovado' : 'Adicional rejeitado')
    setRec(r => r + 1)
  }

  const cont = k => lista.filter(x => x.validacao === k).length
  const rows = lista.filter(x => filtro === 'todos' || x.validacao === filtro)
  const atual = sel ? lista.find(x => x.id === sel) : null
  const adAtual = atual ? adic.filter(x => x.servico_id === atual.id) : []
  const ajuste = adAtual.filter(x => x.status === 'aprovado')
    .reduce((t, x) => t + (x.tipo === 'suprimir' ? -1 : 1) * Number(x.valor || 0), 0)
  const badge = v => v === VAL.ok ? 'bd ok' : v === VAL.dev ? 'bd d' : 'bd w'
  const rotulo = v => v === VAL.ok ? 'Aprovado' : v === VAL.dev ? 'Devolvido' : 'Pendente'

  return (
    <div>
      {msg && <div className={'al' + (msg.erro ? '' : ' w')}>{msg.t}</div>}

      <div className="grid k4">
        <div className="card"><div className="kl">Total de serviços</div><div className="kv">{lista.length}</div></div>
        <div className="card"><div className="kl">Pendentes de validação</div><div className="kv" style={{ color: 'var(--amb)' }}>{cont(VAL.pend)}</div></div>
        <div className="card"><div className="kl">Aprovados</div><div className="kv" style={{ color: 'var(--ok)' }}>{cont(VAL.ok)}</div></div>
        <div className="card"><div className="kl">Devolvidos</div><div className="kv" style={{ color: 'var(--cor)' }}>{cont(VAL.dev)}</div></div>
      </div>

      {podeCriar && (
        <div className="card">
          <h2>Novo serviço
            <button className="btn g" onClick={() => setNovo(!novo)}>{novo ? 'Fechar' : 'Cadastrar serviço'}</button></h2>
          {novo && (
            <form onSubmit={criar}>
              <div className="grid c3">
                <div><label>Título</label><input className="in" value={f.titulo} onChange={e => set('titulo', e.target.value)} required /></div>
                <div><label>Tipo</label>
                  <select value={f.tipo} onChange={e => set('tipo', e.target.value)}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label>Prioridade</label>
                  <select value={f.prioridade} onChange={e => set('prioridade', e.target.value)}>{PRIO.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label>Valor previsto (R$)</label><input className="in" type="number" step="0.01" min="0" value={f.valor_previsto} onChange={e => set('valor_previsto', e.target.value)} /></div>
                <div><label>Início previsto</label><input className="in" type="date" value={f.data_prevista_inicio} onChange={e => set('data_prevista_inicio', e.target.value)} /></div>
                <div><label>Fim previsto</label><input className="in" type="date" value={f.data_prevista_fim} onChange={e => set('data_prevista_fim', e.target.value)} /></div>
                <div><label>Ref. Neovero</label><input className="in" value={f.ref_neovero} onChange={e => set('ref_neovero', e.target.value)} /></div>
              </div>
              <label style={{ display: 'block', marginTop: 10 }}>Descrição</label>
              <textarea className="in" rows={3} style={{ marginTop: 6 }} value={f.descricao} onChange={e => set('descricao', e.target.value)} />
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn" type="submit" disabled={busy}>Salvar serviço</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h2>Serviços especiais</h2>
        <div className="tabs">
          {[['todos', 'Todos'], [VAL.pend, 'Pendentes'], [VAL.ok, 'Aprovados'], [VAL.dev, 'Devolvidos']].map(x => (
            <button key={x[0]} className={filtro === x[0] ? 'on' : ''} onClick={() => setFiltro(x[0])}>{x[1]}</button>))}
        </div>
        <div className="wrap">
          <table>
            <thead><tr><th>Nº</th><th>Título</th><th>Tipo</th><th>Prioridade</th><th className="num">Previsto</th><th>Validação</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="hint">Nenhum serviço encontrado.</td></tr>}
              {rows.map(s => (
                <tr key={s.id}>
                  <td className="mono">{s.numero != null ? s.numero : '—'}</td>
                  <td>{s.titulo}</td>
                  <td>{s.tipo || '—'}</td>
                  <td>{s.prioridade || '—'}</td>
                  <td className="num">{fmt(s.valor_previsto)}</td>
                  <td><span className={badge(s.validacao)}>{rotulo(s.validacao)}</span></td>
                  <td><span className="bd">{s.status || '—'}</span></td>
                  <td><button className="btn g" onClick={() => { setSel(sel === s.id ? null : s.id); setDevolvendo(false); setMotivo(''); setEditando(null); setF(VAZIO) }}>{sel === s.id ? 'Ocultar' : 'Detalhes'}</button></td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {atual && (
        <div className="card">
          <h2>{atual.titulo} <span className={badge(atual.validacao)}>{rotulo(atual.validacao)}</span></h2>
          <div className="grid c3" style={{ marginBottom: 10 }}>
            <div><div className="kl">Número</div><b>{atual.numero != null ? atual.numero : '—'}</b></div>
            <div><div className="kl">Tipo</div><b>{atual.tipo || '—'}</b></div>
            <div><div className="kl">Prioridade</div><b>{atual.prioridade || '—'}</b></div>
            <div><div className="kl">Valor previsto</div><b className="mono">{fmt(atual.valor_previsto)}</b></div>
            <div><div className="kl">Início previsto</div><b>{dtf(atual.data_prevista_inicio)}</b></div>
            <div><div className="kl">Fim previsto</div><b>{dtf(atual.data_prevista_fim)}</b></div>
            <div><div className="kl">Solicitante</div><b>{mem[atual.solicitante_id] || '—'}</b></div>
            <div><div className="kl">Responsável</div><b>{mem[atual.responsavel_id] || '—'}</b></div>
            <div><div className="kl">Ref. Neovero</div><b>{atual.ref_neovero || '—'}</b></div>
          </div>
          <div className="kl">Descrição</div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: 10 }}>{atual.descricao || 'Sem descrição cadastrada.'}</div>

          {atual.validacao === VAL.dev && atual.validacao_motivo && (
            <div className="al">Devolvido: {atual.validacao_motivo}</div>)}
          {atual.validado_por && (
            <div className="hint">Validado por {mem[atual.validado_por] || '—'} em {atual.validado_em ? new Date(atual.validado_em).toLocaleString('pt-BR') : '—'}</div>)}

          {editavel(atual) && editando !== atual.id && (
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn g" onClick={() => iniciarEdicao(atual)}>Editar serviço</button>
            </div>)}
          {atual.validacao === VAL.ok && (
            <div className="hint" style={{ marginTop: 10 }}>Serviço aprovado não pode ser editado. Use um adicional para agregar ou suprimir valor.</div>)}

          {editando === atual.id && (
            <div style={{ marginTop: 10 }}>
              <div className="grid c3">
                <div><label>Título</label><input className="in" value={f.titulo} onChange={e => set('titulo', e.target.value)} /></div>
                <div><label>Tipo</label>
                  <select value={f.tipo} onChange={e => set('tipo', e.target.value)}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label>Prioridade</label>
                  <select value={f.prioridade} onChange={e => set('prioridade', e.target.value)}>{PRIO.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label>Valor previsto (R$)</label><input className="in" type="number" step="0.01" min="0" value={f.valor_previsto} onChange={e => set('valor_previsto', e.target.value)} /></div>
                <div><label>Início previsto</label><input className="in" type="date" value={f.data_prevista_inicio} onChange={e => set('data_prevista_inicio', e.target.value)} /></div>
                <div><label>Fim previsto</label><input className="in" type="date" value={f.data_prevista_fim} onChange={e => set('data_prevista_fim', e.target.value)} /></div>
                <div><label>Ref. Neovero</label><input className="in" value={f.ref_neovero} onChange={e => set('ref_neovero', e.target.value)} /></div>
              </div>
              <label style={{ display: 'block', marginTop: 10 }}>Descrição</label>
              <textarea className="in" rows={3} style={{ marginTop: 6 }} value={f.descricao} onChange={e => set('descricao', e.target.value)} />
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn" disabled={busy} onClick={() => salvarEdicao(atual)}>Salvar alterações</button>
                <button className="btn g" onClick={cancelarEdicao}>Cancelar</button>
              </div>
            </div>)}

          {(atual.validacao === VAL.ok || adAtual.length > 0) && (
            <div style={{ marginTop: 14 }}>
              <div className="kl">Adicionais (agregar ou suprimir)</div>
              {adAtual.length > 0 && (
                <div className="wrap">
                  <table>
                    <thead><tr><th>Tipo</th><th className="num">Valor</th><th>Motivo</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {adAtual.map(x => (
                        <tr key={x.id}>
                          <td>{x.tipo === 'suprimir' ? 'Suprimir' : 'Agregar'}</td>
                          <td className="num">{fmt(x.valor)}</td>
                          <td>{x.motivo}</td>
                          <td><span className={x.status === 'aprovado' ? 'bd ok' : x.status === 'rejeitado' ? 'bd d' : 'bd w'}>{x.status}</span></td>
                          <td>
                            {podeAprovarAdic && x.status === 'pendente' && (
                              <div className="row">
                                <button className="btn" disabled={busy} onClick={() => decidirAdicional(x, true)}>Aprovar</button>
                                <button className="btn r" disabled={busy} onClick={() => decidirAdicional(x, false)}>Rejeitar</button>
                              </div>)}
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>)}
              {atual.valor_previsto != null && adAtual.length > 0 && (
                <div className="hint" style={{ marginTop: 6 }}>Valor atual com adicionais aprovados: <b className="mono">{fmt(Number(atual.valor_previsto) + ajuste)}</b></div>)}
              {podeEditar && atual.validacao === VAL.ok && (
                <div style={{ marginTop: 10 }}>
                  <div className="grid c3">
                    <div><label>Tipo</label>
                      <select value={ad.tipo} onChange={e => setAd(x => ({ ...x, tipo: e.target.value }))}>
                        <option value="agregar">Agregar valor</option>
                        <option value="suprimir">Suprimir valor</option>
                      </select></div>
                    <div><label>Valor (R$)</label><input className="in" type="number" step="0.01" min="0" value={ad.valor} onChange={e => setAd(x => ({ ...x, valor: e.target.value }))} /></div>
                    <div><label>Motivo (obrigatório)</label><input className="in" value={ad.motivo} onChange={e => setAd(x => ({ ...x, motivo: e.target.value }))} /></div>
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="btn" disabled={busy} onClick={() => criarAdicional(atual)}>Enviar adicional para aprovação</button>
                  </div>
                </div>)}
            </div>)}

          {podeValidar && atual.validacao === VAL.pend && editando !== atual.id && (
            devolvendo ? (
              <div style={{ marginTop: 10 }}>
                <textarea className="in" rows={2} placeholder="Motivo da devolução (obrigatório)" value={motivo} onChange={e => setMotivo(e.target.value)} />
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn r" disabled={busy} onClick={() => validar(atual, false)}>Confirmar devolução</button>
                  <button className="btn g" onClick={() => setDevolvendo(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn" disabled={busy} onClick={() => validar(atual, true)}>Aprovar serviço</button>
                <button className="btn r" disabled={busy} onClick={() => setDevolvendo(true)}>Devolver</button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
