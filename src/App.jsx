import { useEffect, useState } from 'react'
import * as sb from './supabase'
import MedicaoTela from './Medicao'
import ServicosTela from './Servicos'
import DiarioTela from './Diario'
const supabase = sb.supabase || sb.default

const CSS = `
:root{--bg:#0d0e11;--p:#16171c;--p2:#1d1f26;--b:#2a2c35;--t:#ececf0;--m:#8d8f9c;--lime:#c6f432;--amb:#ffb020;--cor:#ff6b5b;--ok:#4ade80}
*{box-sizing:border-box;margin:0}
html,body,#root{min-height:100vh}
body{background:var(--bg);color:var(--t);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.app{display:flex;min-height:100vh}
aside{width:224px;background:var(--p);border-right:1px solid var(--b);padding:18px 14px;display:flex;flex-direction:column;gap:18px;position:sticky;top:0;height:100vh;flex-shrink:0}
.logo{font-weight:800;font-size:18px;letter-spacing:-.5px}.logo b{color:var(--lime)}
.logo small{display:block;font-weight:500;font-size:11px;color:var(--m);letter-spacing:0}
label{font-size:11px;color:var(--m);text-transform:uppercase;letter-spacing:.08em}
select{width:100%;margin-top:6px;background:var(--p2);color:var(--t);border:1px solid var(--b);border-radius:10px;padding:9px;font:inherit}
nav button{display:flex;gap:10px;align-items:center;width:100%;background:none;border:0;color:var(--m);padding:10px 12px;border-radius:10px;font:inherit;cursor:pointer;text-align:left}
nav button:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--b)}
nav button:hover{background:var(--p2);color:var(--t)}
nav button.on{background:var(--p2);color:var(--lime)}nav button.on:before{background:var(--lime)}
.user{margin-top:auto;display:flex;gap:10px;align-items:center;font-size:12px;color:var(--m)}
.user .out{background:none;border:0;color:var(--cor);cursor:pointer;font:inherit;font-size:12px;padding:0;margin-top:2px}
.av{width:34px;height:34px;border-radius:10px;background:var(--lime);color:#111;display:grid;place-items:center;font-weight:800;flex-shrink:0}
main{flex:1;padding:26px 30px;min-width:0}
h1{font-size:22px;letter-spacing:-.5px}h2{font-size:14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.sub{color:var(--m);margin:2px 0 20px}
.grid{display:grid;gap:14px;margin-bottom:14px}.k4{grid-template-columns:repeat(4,1fr)}.c2{grid-template-columns:1.4fr 1fr}.c3{grid-template-columns:repeat(3,1fr)}
@media(max-width:1100px){.k4,.c2,.c3{grid-template-columns:1fr 1fr}}
@media(max-width:760px){.app{flex-direction:column}aside{width:100%;height:auto;position:static}.k4,.c2,.c3{grid-template-columns:1fr}}
.card{background:var(--p);border:1px solid var(--b);border-radius:16px;padding:16px;margin-bottom:14px}
.grid>.card{margin-bottom:0}
.kl{color:var(--m);font-size:12px}.kv{font-size:26px;font-weight:800;letter-spacing:-1px;margin:4px 0}.ks{font-size:12px;color:var(--m)}
.bar{height:8px;background:var(--p2);border-radius:9px;overflow:hidden;margin:8px 0}.bar i{display:block;height:100%;background:var(--lime);border-radius:9px}
.bar.w i{background:var(--amb)}.bar.d i{background:var(--cor)}
.bd{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:600;background:var(--p2);color:var(--m);border:1px solid var(--b)}
.bd.ok{color:var(--ok);border-color:#1f4d34;background:#12241b}.bd.w{color:var(--amb);border-color:#5a4210;background:#2a2110}
.bd.d{color:var(--cor);border-color:#5e2822;background:#2b1513}.bd.l{color:#111;background:var(--lime);border-color:var(--lime)}
.btn{background:var(--lime);color:#111;border:0;border-radius:9px;padding:7px 12px;font:inherit;font-weight:700;cursor:pointer}
.btn.g{background:var(--p2);color:var(--t);border:1px solid var(--b)}.btn.r{background:#2b1513;color:var(--cor);border:1px solid #5e2822}
.btn:disabled{opacity:.35;cursor:not-allowed}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{background:var(--p);text-align:left;color:var(--m);font-weight:600;padding:8px;border-bottom:1px solid var(--b);font-size:11px;text-transform:uppercase;letter-spacing:.05em}
td{padding:9px 8px;border-bottom:1px solid var(--b);vertical-align:top}
tr:hover td{background:#1a1b21}.num{text-align:right;white-space:nowrap}
.ap{border:1px solid var(--b);border-radius:12px;padding:12px;margin-bottom:10px;background:var(--p2)}
.ap .t{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.al{background:#2b1513;border:1px solid #5e2822;color:var(--cor);border-radius:9px;padding:6px 10px;font-size:12px;margin:6px 0}
.al.w{color:var(--amb);background:#2a2110;border-color:#5a4210}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.st{display:flex;align-items:center;gap:10px;margin:7px 0;font-size:12.5px}.st>span:first-child{width:130px;color:var(--m)}.st .bar{flex:1;margin:0}
.in{width:100%;background:var(--p2);border:1px solid var(--b);color:var(--t);border-radius:9px;padding:8px;font:inherit}
.mono{font-variant-numeric:tabular-nums}.hint{font-size:11px;color:var(--m)}
#toast{position:fixed;bottom:22px;right:22px;background:var(--lime);color:#111;padding:10px 16px;border-radius:12px;font-weight:700;opacity:0;transition:.3s;pointer-events:none}#toast.on{opacity:1}
.login{min-height:100vh;display:grid;place-items:center;padding:20px}
.login form{width:340px;background:var(--p);border:1px solid var(--b);border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:12px}
`

const fmt = v => v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const FL = { analista: 'Analistas', supervisor: 'Supervisor', gerente: 'Gerente' }
const P = {
  gerente: { n: 'Gerente de Infraestrutura', i: 'GI', lvl: 'gerente', nav: ['painel', 'aprov', 'medicao', 'servicos', 'diario'] },
  supervisor: { n: 'Supervisor de Infraestrutura', i: 'SI', lvl: 'supervisor', nav: ['painel', 'aprov', 'medicao', 'servicos', 'diario'] },
  analista: { n: 'Analista de Manutenção', i: 'AM', lvl: 'analista', nav: ['painel', 'medicao', 'servicos', 'diario'] },
  assistente: { n: 'Assistente Administrativo', i: 'AA', nav: ['painel', 'servicos'] },
  auxiliar: { n: 'Auxiliar de Manutenção', i: 'AX', nav: ['painel', 'servicos', 'diario'] },
  terceira: { n: 'Empresa terceira (ORBIS)', i: 'OR', nav: ['painel', 'medicao', 'diario'] }
}
const NL = { painel: 'Painel', aprov: 'Aprovações', medicao: 'Medição', servicos: 'Serviços', diario: 'Diário de obra' }
const MAPA = { admin: 'gerente', gerente: 'gerente', supervisor: 'supervisor', analista: 'analista', assistente: 'assistente', auxiliar: 'auxiliar', terceira: 'terceira', terceiro: 'terceira', fornecedor: 'terceira' }
const EM_CURSO = ['em_andamento', 'em_execucao', 'em_medicao']
const ENCERRADO = /conclu|cancel|rejeit|recus/i

const dtf = d => d ? d.split('-').reverse().join('/') : '—'
const rot = s => String(s || 'sem status').replace(/_/g, ' ')
function nextD(d, h) { const n = new Date(); let x = new Date(n.getFullYear(), n.getMonth(), d, h); if (x < n) x = new Date(n.getFullYear(), n.getMonth() + 1, d, h); return x }
function left(x) { const s = Math.max(0, x - new Date()) / 1000; return Math.floor(s / 86400) + 'd ' + Math.floor(s % 86400 / 3600) + 'h ' + Math.floor(s % 3600 / 60) + 'min' }

function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [erro, setErro] = useState('')
  async function entrar(e) {
    e.preventDefault(); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('E-mail ou senha inválidos.')
  }
  return (
    <div className="login">
      <form onSubmit={entrar}>
        <div className="logo">Manut<b>Hub</b><small>CRER · Infraestrutura</small></div>
        <input className="in" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="in" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
        {erro && <div className="al">{erro}</div>}
        <button className="btn" type="submit">Entrar</button>
      </form>
    </div>
  )
}

function Shell({ membro, email, userId }) {
  const papelBase = MAPA[String(membro.papel || '').toLowerCase()]
  const isAdmin = String(membro.papel).toLowerCase() === 'admin'
  const [prof, setProf] = useState(papelBase || 'auxiliar')
  const [view, setView] = useState('painel')
  const [toastMsg, setToastMsg] = useState('')
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 30000); return () => clearInterval(t) }, [])
  const [rec, setRec] = useState(0)
  const [devId, setDevId] = useState(null)
  const [ver, setVer] = useState(null)
  const [motivo, setMotivo] = useState({})
  const [busy, setBusy] = useState(null)
  const [db, setDb] = useState({ ok: false, erro: '', par: null, serv: [], apr: [], cil: [], mem: {} })

  useEffect(() => {
    let vivo = true
    async function carregar() {
      const d = new Date()
      const mes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01'
      const [p, s, a, c, g, m] = await Promise.all([
        supabase.from('parametros_financeiros').select('teto,mao_obra_fixa,saldo_livre').eq('mes', mes).maybeSingle(),
        supabase.from('servicos_especiais').select('id,titulo,status,valor_previsto,numero,tipo,descricao,prioridade,data_prevista_inicio,data_prevista_fim,ref_neovero,solicitante_id,responsavel_id'),
        supabase.from('aprovacoes').select('id,tipo,nivel,papel_requerido,status,servico_id,registro_id').eq('status', 'pendente').order('nivel'),
        supabase.from('cilindros').select('codigo_crer,proprietario,gas_tipo_id,validade_teste').order('validade_teste'),
        supabase.from('gases_tipos').select('id,sigla'),
        supabase.from('membros').select('id,nome')
      ])
      if (!vivo) return
      const erro = [p, s, a, c, g].map(r => r.error && r.error.message).filter(Boolean).join(' | ')
      const gm = {}; (g.data || []).forEach(x => { gm[x.id] = x.sigla })
      const mm = {}; ((m && m.data) || []).forEach(x => { mm[x.id] = x.nome })
      setDb({
        ok: true, erro, par: p.data, serv: s.data || [], apr: a.data || [], mem: mm,
        cil: (c.data || []).filter(x => x.validade_teste).map(x => ({ ...x, gas: gm[x.gas_tipo_id] || '—' }))
      })
    }
    carregar()
    return () => { vivo = false }
  }, [rec])

  const toast = m => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2200) }
  const go = n => { setView(n); setRec(r => r + 1) }
  const pr = P[prof], lv = pr.lvl
  const papelTela = isAdmin && prof === 'gerente' ? 'admin' : prof
  const v = pr.nav.includes(view) ? view : 'painel'

  const teto = db.par ? Number(db.par.teto) : 0
  const mo = db.par ? Number(db.par.mao_obra_fixa) : 0
  const livre = db.par ? Number(db.par.saldo_livre) : 0
  const comprometido = db.serv.filter(x => EM_CURSO.includes(x.status)).reduce((s, x) => s + Number(x.valor_previsto || 0), 0)
  const disp = livre - comprometido
  const dias = d => Math.ceil((new Date(d + 'T00:00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000)
  const cil30 = db.cil.filter(x => dias(x.validade_teste) <= 30).length
  const atrasados = db.serv.filter(x => x.data_prevista_fim && !ENCERRADO.test(x.status || '') && dias(x.data_prevista_fim) < 0)
  const ativos = db.serv.filter(x => EM_CURSO.includes(x.status)).length
  const porStatus = Object.entries(db.serv.reduce((m, x) => { const k = x.status || 'sem status'; m[k] = (m[k] || 0) + 1; return m }, {}))
  const maxS = Math.max(1, ...porStatus.map(x => x[1]))
  const minhaDb = x => !!lv && x.papel_requerido === lv
  const nMinhas = db.apr.filter(minhaDb).length

  async function decidirDb(x, ok) {
    const parecer = (motivo[x.id] || '').trim()
    if (!ok && !parecer) { toast('Informe o motivo da devolução'); return }
    setBusy(x.id)
    const { data, error } = await supabase.from('aprovacoes')
      .update({ status: ok ? 'aprovado' : 'rejeitado', aprovador_id: membro.id, parecer: ok ? null : parecer })
      .eq('id', x.id).eq('status', 'pendente').select('id')
    setBusy(null)
    if (error) { toast(error.message); return }
    if (!data || !data.length) { toast('Sem permissão ou já decidida'); setRec(r => r + 1); return }
    setDevId(null)
    setMotivo(m => ({ ...m, [x.id]: '' }))
    toast(ok ? 'Aprovação gravada' : 'Devolvido, motivo registrado')
    setRec(r => r + 1)
  }

  const aprDb = modo => {
    const l = db.apr.filter(x => modo === 'minhas' ? minhaDb(x) : modo === 'outras' ? !minhaDb(x) : true)
    if (!l.length) return <div className="hint">Nenhuma aprovação pendente.</div>
    return l.map(x => {
      const s = db.serv.find(y => y.id === x.servico_id)
      const trava = db.apr.some(y => y.servico_id === x.servico_id && y.registro_id === x.registro_id && y.tipo === x.tipo && y.nivel < x.nivel)
      return (
        <div className="ap" key={x.id}>
          <div className="t">
            <div><span className="bd l">{x.tipo}</span> <b>{s ? s.titulo : '—'}</b>
              <div className="hint">Nível {x.nivel} · aguarda {FL[x.papel_requerido] || x.papel_requerido}</div></div>
            <b className="mono">{s ? fmt(Number(s.valor_previsto)) : '—'}</b>
          </div>
          {s && <div style={{ margin: '8px 0' }}>
            <button className="btn g" onClick={() => setVer(ver === x.id ? null : x.id)}>{ver === x.id ? 'Ocultar detalhes' : 'Ver detalhes'}</button>
            {ver === x.id && (
              <div className="card" style={{ marginTop: 8, marginBottom: 0 }}>
                <div className="grid c3" style={{ marginBottom: 10 }}>
                  <div><div className="kl">Número</div><b>{s.numero != null ? s.numero : '—'}</b></div>
                  <div><div className="kl">Tipo</div><b>{s.tipo || '—'}</b></div>
                  <div><div className="kl">Prioridade</div><b>{s.prioridade || '—'}</b></div>
                  <div><div className="kl">Status</div><b>{rot(s.status)}</b></div>
                  <div><div className="kl">Valor previsto</div><b className="mono">{fmt(Number(s.valor_previsto))}</b></div>
                  <div><div className="kl">Ref. Neovero</div><b>{s.ref_neovero || '—'}</b></div>
                  <div><div className="kl">Início previsto</div><b>{dtf(s.data_prevista_inicio)}</b></div>
                  <div><div className="kl">Fim previsto</div><b>{dtf(s.data_prevista_fim)}</b></div>
                  <div><div className="kl">Solicitante</div><b>{db.mem[s.solicitante_id] || '—'}</b></div>
                  <div><div className="kl">Responsável</div><b>{db.mem[s.responsavel_id] || '—'}</b></div>
                </div>
                <div className="kl">Descrição</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{s.descricao || 'Sem descrição cadastrada.'}</div>
              </div>)}
          </div>}
          {minhaDb(x) && (trava
            ? <div className="al w">Aguardando o nível anterior aprovar.</div>
            : devId === x.id
              ? <div>
                <textarea className="in" rows={2} placeholder="Motivo da devolução (obrigatório)" value={motivo[x.id] || ''} onChange={e => setMotivo({ ...motivo, [x.id]: e.target.value })} />
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn r" disabled={busy === x.id} onClick={() => decidirDb(x, false)}>Confirmar devolução</button>
                  <button className="btn g" onClick={() => setDevId(null)}>Cancelar</button>
                </div>
              </div>
              : <div className="row">
                <button className="btn" disabled={busy === x.id} onClick={() => decidirDb(x, true)}>Aprovar{x.nivel === 0 ? ' (validar)' : ''}</button>
                <button className="btn r" disabled={busy === x.id} onClick={() => setDevId(x.id)}>Devolver</button>
              </div>)}
        </div>)
    })
  }

  const Kpis = () => {
    const pc = livre > 0 ? Math.min(100, Math.max(0, comprometido / livre * 100)) : 100
    return (
      <div className="grid k4">
        <div className="card"><div className="kl">Saldo livre do mês</div>
          <div className="kv mono" style={{ color: disp < 0 ? 'var(--cor)' : 'var(--lime)' }}>{fmt(disp)}</div>
          <div className={'bar ' + (pc > 85 ? 'd' : pc > 60 ? 'w' : '')}><i style={{ width: pc + '%' }} /></div>
          <div className="ks">Teto {fmt(teto)} − mão de obra {fmt(mo)} = {fmt(livre)}<br />Comprometido: {fmt(comprometido)}</div></div>
        <div className="card"><div className="kl">Aprovações pendentes</div>
          <div className="kv">{lv === 'analista' ? db.apr.length : nMinhas}</div>
          <div className="ks">{lv === 'analista' ? `${nMinhas} para você validar` : `aguardam a sua aprovação · ${db.apr.length - nMinhas} em outros níveis`}</div></div>
        <div className="card"><div className="kl">Prazo da medição</div>
          <div className="kv">{left(nextD(1, 14))}</div><div className="ks">envio até dia 1 · 14h</div>
          <div className="ks" style={{ marginTop: 6 }}>Fechamento: <b style={{ color: 'var(--amb)' }}>{left(nextD(5, 13))}</b> (dia 5 · 13h)</div></div>
        <div className="card"><div className="kl">Serviços em curso</div>
          <div className="kv">{ativos}</div>
          <div className="ks">{db.serv.length} serviço(s) no total · {atrasados.length} atrasado(s)</div></div>
      </div>
    )
  }

  const Status = () => (
    <div className="card"><h2>Serviços por status</h2>
      {porStatus.length === 0 && <div className="hint">Nenhum serviço cadastrado.</div>}
      {porStatus.map(x => (
        <div className="st" key={x[0]}><span>{rot(x[0])}</span><div className="bar"><i style={{ width: x[1] / maxS * 100 + '%' }} /></div><b>{x[1]}</b></div>))}</div>
  )

  const Alertas = () => (
    <div className="card"><h2>Atrasos e alertas</h2>
      {disp < 0 && <div className="al">Saldo livre negativo em {fmt(-disp)}.</div>}
      {db.ok && !db.par && <div className="al w">Sem parâmetros financeiros cadastrados para este mês.</div>}
      {atrasados.length > 0 && <div className="al w">{atrasados.length} serviço(s) com data prevista vencida: {atrasados.slice(0, 3).map(x => x.titulo).join(', ')}{atrasados.length > 3 ? '…' : ''}</div>}
      {cil30 > 0 && <div className="al w">{cil30} cilindro(s) com teste hidrostático vencido ou a vencer em 30 dias</div>}
      {disp >= 0 && db.par && !atrasados.length && !cil30 && <div className="hint">Nenhum alerta no momento.</div>}
    </div>
  )

  const Cilindros = () => (
    <div className="card"><h2>Cilindros por validade do teste <span className="hint">{db.cil.length} no total</span></h2>
      {db.cil.length === 0 ? <div className="hint">Nenhum cilindro cadastrado.</div> :
        <table><thead><tr><th>Código</th><th>Gás</th><th>Dono</th><th>Teste vence</th></tr></thead><tbody>
          {db.cil.slice(0, 8).map(x => {
            const n = dias(x.validade_teste)
            return (<tr key={x.codigo_crer}><td>{x.codigo_crer}</td><td>{x.gas}</td><td>{x.proprietario === 'ibg' ? 'IBG' : 'Unidade'}</td>
              <td><span className={'bd ' + (n <= 15 ? 'd' : n <= 30 ? 'w' : '')}>{n < 0 ? `vencido há ${-n} dias` : `${n} dias`}</span></td></tr>)
          })}
        </tbody></table>}
    </div>
  )

  function Painel() {
    if (['gerente', 'supervisor', 'analista'].includes(prof)) return (<>
      <Kpis />
      <div className="grid c2">
        <div className="card">
          <h2>{prof === 'analista' ? 'Aprovações pendentes' : 'Aguardando você'}
            <span className="hint">{prof === 'analista' ? 'você valida; supervisor e gerente aprovam' : `${nMinhas} para ${FL[lv]}`}</span></h2>
          {aprDb(prof === 'analista' ? 'todas' : 'minhas')}</div>
        <div><Status /><Alertas /></div>
      </div>
      <Cilindros />
    </>)
    if (prof === 'assistente') return (<>
      <div className="grid c3">
        <div className="card"><div className="kl">Serviços cadastrados</div><div className="kv">{db.serv.length}</div></div>
        <div className="card"><div className="kl">Aprovações em andamento</div><div className="kv" style={{ color: 'var(--amb)' }}>{db.apr.length}</div><div className="ks">aguardando analistas, supervisor ou gerente</div></div>
        <div className="card"><div className="kl">Serviços em curso</div><div className="kv">{ativos}</div><button className="btn" onClick={() => go('servicos')}>Abrir serviços</button></div>
      </div>
      <div className="grid c2"><Status /><Alertas /></div>
    </>)
    if (prof === 'auxiliar') return (<>
      <div className="grid c3">
        <div className="card"><div className="kl">Serviços em curso</div><div className="kv">{ativos}</div><button className="btn" onClick={() => go('servicos')}>Ver serviços</button></div>
        <div className="card"><div className="kl">Diário de obra</div><div className="kv" style={{ fontSize: 16 }}>Lançar o dia</div><button className="btn" onClick={() => go('diario')}>Abrir diário</button></div>
        <div className="card"><div className="kl">Cilindros a vencer (30 dias)</div><div className="kv" style={{ color: cil30 ? 'var(--amb)' : 'var(--t)' }}>{cil30}</div></div>
      </div>
      <Cilindros />
    </>)
    return (
      <div className="grid k4">
        <div className="card"><div className="kl">Prazo de envio</div><div className="kv">{left(nextD(1, 14))}</div><div className="ks">dia 1 · 14h</div></div>
        <div className="card"><div className="kl">Fechamento</div><div className="kv" style={{ color: 'var(--amb)' }}>{left(nextD(5, 13))}</div><div className="ks">dia 5 · 13h</div></div>
        <div className="card"><div className="kl">Medição do mês</div><button className="btn" style={{ marginTop: 8 }} onClick={() => go('medicao')}>Abrir medição</button></div>
        <div className="card"><div className="kl">Diário de obra</div><button className="btn" style={{ marginTop: 8 }} onClick={() => go('diario')}>Abrir diário</button></div>
      </div>
    )
  }

  const mesTxt = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const titulo = { painel: `Painel · ${pr.n}`, aprov: 'Aprovações', medicao: 'Medições', servicos: 'Serviços especiais', diario: 'Diário de obra' }[v]
  const sub = { painel: `${mesTxt} · CRER`, aprov: 'Fluxo: Analistas → Supervisor → Gerente. O diretor assina o pagamento fora do sistema.', medicao: 'Medição mensal, conferência e parcelas de pagamento', servicos: 'Cadastro, validação e acompanhamento', diario: 'Lançamento diário e histórico por mês' }[v]

  return (
    <div className="app">
      <aside>
        <div className="logo">Manut<b>Hub</b><small>CRER · Infraestrutura</small></div>
        {isAdmin && <div><label>Ver como</label>
          <select value={prof} onChange={e => { setProf(e.target.value); go('painel') }}>
            {Object.keys(P).map(k => <option key={k} value={k}>{P[k].n}</option>)}</select></div>}
        <nav>{pr.nav.map(n => (
          <button key={n} className={v === n ? 'on' : ''} onClick={() => go(n)}>{NL[n]}
            {n === 'aprov' && <span className="bd l" style={{ marginLeft: 'auto' }}>{nMinhas}</span>}</button>))}</nav>
        <div className="user"><div className="av">{pr.i}</div>
          <div>{membro.nome || email}<br /><span>{pr.n}</span><br /><button className="out" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>
      </aside>
      <main>
        <h1>{titulo}</h1><div className="sub">{sub}</div>
        {db.erro && <div className="al">Erro ao ler o banco: {db.erro}</div>}
        {v === 'painel' && Painel()}
        {v === 'aprov' && (<>
          <div className="card"><h2>Aguardando você</h2>{aprDb('minhas')}</div>
          <div className="card"><h2>Em outros níveis</h2>{aprDb('outras')}</div>
        </>)}
        {v === 'medicao' && <MedicaoTela supabase={supabase} papel={papelTela} usuarioId={userId} tenantId={membro.tenant_id} />}
        {v === 'servicos' && <ServicosTela supabase={supabase} papel={papelTela} membroId={membro.id} tenantId={membro.tenant_id} />}
        {v === 'diario' && <DiarioTela supabase={supabase} papel={papelTela} membroId={membro.id} tenantId={membro.tenant_id} />}
      </main>
      <div id="toast" className={toastMsg ? 'on' : ''}>{toastMsg}</div>
    </div>
  )
}

export default function App() {
  const [sessao, setSessao] = useState(undefined)
  const [membro, setMembro] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao) { setMembro(undefined); return }
    supabase.from('membros').select('id,nome,papel,tenant_id').eq('user_id', sessao.user.id).eq('ativo', true).maybeSingle()
      .then(({ data }) => setMembro(data || null))
  }, [sessao])

  return (<>
    <style>{CSS}</style>
    {sessao === undefined ? <div className="login"><span className="hint">Carregando…</span></div>
      : !sessao ? <Login />
        : membro === undefined ? <div className="login"><span className="hint">Carregando perfil…</span></div>
          : !membro ? <div className="login"><div className="card">Sem vínculo no CRER. Peça ao administrador.<br /><br /><button className="btn" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>
            : <Shell membro={membro} email={sessao.user.email} userId={sessao.user.id} />}
  </>)
}
