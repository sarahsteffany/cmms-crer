import { useEffect, useState } from 'react'
import * as sb from './supabase'
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
.grid{display:grid;gap:14px;margin-bottom:14px}.k4{grid-template-columns:repeat(4,1fr)}.c2{grid-template-columns:1.4fr 1fr}.c3{grid-template-columns:repeat(3,1fr)}.i6{grid-template-columns:repeat(6,1fr)}
@media(max-width:1100px){.k4,.c2,.c3{grid-template-columns:1fr 1fr}.i6{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.app{flex-direction:column}aside{width:100%;height:auto;position:static}.k4,.c2,.c3,.i6{grid-template-columns:1fr}}
.card{background:var(--p);border:1px solid var(--b);border-radius:16px;padding:16px;margin-bottom:14px}
.grid>.card{margin-bottom:0}
.kl{color:var(--m);font-size:12px}.kv{font-size:26px;font-weight:800;letter-spacing:-1px;margin:4px 0}.ks{font-size:12px;color:var(--m)}
.bar{height:8px;background:var(--p2);border-radius:9px;overflow:hidden;margin:8px 0}.bar i{display:block;height:100%;background:var(--lime);border-radius:9px}
.bar.w i{background:var(--amb)}.bar.d i{background:var(--cor)}
.bd{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:600;background:var(--p2);color:var(--m);border:1px solid var(--b)}
.bd.ok{color:var(--ok);border-color:#1f4d34;background:#12241b}.bd.w{color:var(--amb);border-color:#5a4210;background:#2a2110}
.bd.d{color:var(--cor);border-color:#5e2822;background:#2b1513}.bd.l{color:#111;background:var(--lime);border-color:var(--lime)}
.ind{padding:12px}.ind .kv{font-size:19px}.ind.bad{border-color:#5e2822}.ind.good{border-color:#23402f}
.btn{background:var(--lime);color:#111;border:0;border-radius:9px;padding:7px 12px;font:inherit;font-weight:700;cursor:pointer}
.btn.g{background:var(--p2);color:var(--t);border:1px solid var(--b)}.btn.r{background:#2b1513;color:var(--cor);border:1px solid #5e2822}
.btn:disabled{opacity:.35;cursor:not-allowed}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{position:sticky;top:0;background:var(--p);text-align:left;color:var(--m);font-weight:600;padding:8px;border-bottom:1px solid var(--b);font-size:11px;text-transform:uppercase;letter-spacing:.05em}
td{padding:9px 8px;border-bottom:1px solid var(--b);vertical-align:top}
tr:hover td{background:#1a1b21}.num{text-align:right;white-space:nowrap}
.wrap{overflow:auto;max-height:480px;border-radius:10px}
.ap{border:1px solid var(--b);border-radius:12px;padding:12px;margin-bottom:10px;background:var(--p2)}
.ap .t{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.flow{display:flex;gap:6px;align-items:center;margin:8px 0;font-size:11px;flex-wrap:wrap}
.flow span{padding:2px 8px;border-radius:99px;border:1px solid var(--b);color:var(--m)}
.flow span.done{color:var(--ok);border-color:#1f4d34}.flow span.cur{background:var(--lime);color:#111;border-color:var(--lime);font-weight:700}
.flow span.ar{border:0;padding:0}
.al{background:#2b1513;border:1px solid #5e2822;color:var(--cor);border-radius:9px;padding:6px 10px;font-size:12px;margin:6px 0}
.al.w{color:var(--amb);background:#2a2110;border-color:#5a4210}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.tl{position:relative;padding-left:24px}.tl:before{content:"";position:absolute;left:7px;top:6px;bottom:6px;width:2px;background:var(--b)}
.ph{position:relative;margin-bottom:14px}.ph:before{content:"";position:absolute;left:-23px;top:3px;width:12px;height:12px;border-radius:50%;background:var(--b);border:2px solid var(--p)}
.ph.done:before{background:var(--lime)}.ph.doing:before{background:var(--amb);box-shadow:0 0 0 4px #ffb02033}.ph.back:before{background:var(--cor)}
.ph b{display:block}.ph small{color:var(--m)}
.tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.tabs button{background:var(--p2);color:var(--m);border:1px solid var(--b);border-radius:99px;padding:5px 12px;cursor:pointer;font:inherit}.tabs button.on{background:var(--lime);color:#111;border-color:var(--lime);font-weight:700}
.st{display:flex;align-items:center;gap:10px;margin:7px 0;font-size:12.5px}.st>span:first-child{width:130px;color:var(--m)}.st .bar{flex:1;margin:0}
.in{width:100%;background:var(--p2);border:1px solid var(--b);color:var(--t);border-radius:9px;padding:8px;font:inherit}
.mono{font-variant-numeric:tabular-nums}.hint{font-size:11px;color:var(--m)}
#toast{position:fixed;bottom:22px;right:22px;background:var(--lime);color:#111;padding:10px 16px;border-radius:12px;font-weight:700;opacity:0;transition:.3s;pointer-events:none}#toast.on{opacity:1}
.login{min-height:100vh;display:grid;place-items:center;padding:20px}
.login form{width:340px;background:var(--p);border:1px solid var(--b);border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:12px}
`

const fmt = v => v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const TETO = 180000, MO = 129000, LIVRE = TETO - MO
const FL = { analista: 'Analistas', supervisor: 'Supervisor', gerente: 'Gerente' }
const P = {
  gerente: { n: 'Gerente de Infraestrutura', i: 'GI', lvl: 'gerente', nav: ['painel', 'aprov', 'medicao', 'servico'] },
  supervisor: { n: 'Supervisor de Infraestrutura', i: 'SI', lvl: 'supervisor', nav: ['painel', 'aprov', 'medicao', 'servico'] },
  analista: { n: 'Analista de Manutenção', i: 'AM', lvl: 'analista', nav: ['painel', 'medicao', 'servico'] },
  assistente: { n: 'Assistente Administrativo', i: 'AA', nav: ['painel', 'servico'] },
  auxiliar: { n: 'Auxiliar de Manutenção', i: 'AX', nav: ['painel', 'servico'] },
  terceira: { n: 'Empresa terceira (ORBIS)', i: 'OR', nav: ['painel', 'medicao'] }
}
const NL = { painel: 'Painel', aprov: 'Aprovações', medicao: 'Medição', servico: 'Serviço' }
const MAPA = { admin: 'gerente', gerente: 'gerente', supervisor: 'supervisor', analista: 'analista', assistente: 'assistente', auxiliar: 'auxiliar', terceira: 'terceira', terceiro: 'terceira', fornecedor: 'terceira' }

const AP0 = [
  { id: 1, t: 'Orçamento', ti: 'Mudança de layout · Ambulatório B', v: 27800, saldo: 1, f: ['supervisor', 'gerente'], i: 0, src: 'SINAPI 14 itens · GoInfra 3 · Mercado 2' },
  { id: 2, t: 'Compra', ti: 'Trena a laser (3 cotações, menor valor)', v: 389.9, saldo: 1, f: ['supervisor', 'gerente'], i: 0, src: 'Mercado · 3 cotações anexadas' },
  { id: 3, t: 'Composição própria', ti: 'Troca de forro em gesso acartonado', v: null, saldo: 0, f: ['analista', 'supervisor', 'gerente'], i: 0, src: 'Memória de cálculo anexada · criada pela ORBIS' },
  { id: 4, t: 'Orçamento', ti: 'Reforma da sala de espera · Ortopedia', v: 18900, saldo: 1, f: ['supervisor', 'gerente'], i: 1, src: 'SINAPI 22 itens · GoInfra 5' },
  { id: 5, t: 'Medição', ti: 'Setembro · Parte 2 (10/09 a 30/09)', v: 92730.21, saldo: 0, f: ['analista', 'supervisor', 'gerente'], i: 1, src: 'Conferida pelos analistas · 38 itens' },
  { id: 6, t: 'Orçamento', ti: 'Troca de piso · Corredor 3', v: 14200, saldo: 1, f: ['supervisor', 'gerente'], i: 1, src: 'SINAPI 9 itens' }
]
const IT0 = [
  { os: '202616862', tp: 'PREVENTIVA', d: 'Torneira lavatório temporizada', fo: 'SINAPI', cod: '36796', q: 3, u: 161.28, b: 25, abc: 'A', st: 'p' },
  { os: '202616510', tp: 'CORRETIVA', d: 'Ducha / chuveiro metálico articulável', fo: 'SINAPI', cod: '38190', q: 1, u: 399.51, b: 25, abc: 'A', st: 'p' },
  { os: '202617022', tp: 'CORRETIVA', d: 'Válvula de descarga metálica 1 1/2"', fo: 'SINAPI', cod: '10228', q: 1, u: 328, b: 25, abc: 'A', st: 'p' },
  { os: '202616453', tp: 'CORRETIVA', d: 'Aquecedor versátil 220V', fo: 'Mercado', cod: '6', q: 1, u: 317.6, b: 25, abc: 'A', st: 'p' },
  { os: '202616090', tp: 'CORRETIVA', d: 'Válvula de descarga mictório (lançamento 1)', fo: 'SINAPI', cod: '21112', q: 1, u: 282.34, b: 25, abc: 'B', st: 'p', fl: 'Possível duplicidade: OS aparece 2 vezes' },
  { os: '202616090', tp: 'CORRETIVA', d: 'Válvula de descarga mictório (lançamento 2)', fo: 'SINAPI', cod: '21112', q: 1, u: 282.34, b: 25, abc: 'B', st: 'p', fl: 'Possível duplicidade: OS aparece 2 vezes' },
  { os: '202616014', tp: 'CORRETIVA', d: 'Luminária plafon LED 40x40 embutir', fo: 'GoInfra', cod: '4072', q: 1, u: 110.01, b: 25, abc: 'B', st: 'p', fl: 'Possível duplicidade: luminária lançada 2 vezes' },
  { os: '202616514', tp: 'CORRETIVA', d: 'Sifão metálico para tanque', fo: 'GoInfra', cod: 'H703', q: 1, u: 184.9, b: 25, abc: 'B', st: 'p', fl: 'Mês de referência: GoInfra 09/2026 e SINAPI 05/2026' },
  { os: '202616478', tp: 'CORRETIVA', d: 'Hora de eletricista (troca de tomada)', fo: 'SINAPI', cod: '88264', q: null, u: 0, b: 0, abc: 'C', st: 'p', fl: 'Quantidade vazia' },
  { os: '202616591', tp: 'CORRETIVA', d: 'Hora de eletricista (troca de ducha)', fo: 'SINAPI', cod: '88264', q: 1.45, u: 0, b: 0, abc: 'C', st: 'p', fl: 'Erro de fórmula na célula (FALSO)' },
  { os: '202616980', tp: 'AQUISIÇÃO', d: 'Malha helanca lisa branca (30 m)', fo: 'Mercado', cod: '29', q: 30, u: 10.75, b: 16.8, abc: 'B', st: 'a' },
  { os: '202616741', tp: 'CORRETIVA', d: 'Lâmpada LED tubular 18/20W', fo: 'SINAPI', cod: '39387', q: 16, u: 8.14, b: 25, abc: 'C', st: 'd', cm: 'Quantidade diverge do diário de obra (12 un).' }
]
const POSTOS = [
  { n: 'Encarregado · 44h', v: 8219.95, pv: 22, cb: 22 },
  { n: 'Eletricista · 44h', v: 6400, pv: 22, cb: 21 },
  { n: 'Pintor/forro · diurno', v: 5200, pv: 22, cb: 22 },
  { n: 'Eletricista · 12/36 noturno', v: 6900, pv: 15, cb: 14 },
  { n: 'Auxiliar · 12/36 noturno', v: 4300, pv: 15, cb: 15 }
]
const IND = [
  ['I · 1º atendimento', '01:10:12', '≤ 2h', 1], ['II · Corretivas executadas', '85,87%', '≥ 85%', 1],
  ['III · Plano de manutenção', '96,04%', '≥ 98%', 0], ['IV · Corretivas > 30 dias', '1,935%', '≤ 2%', 1],
  ['V · Preventivas > 60 dias', '0%', '0%', 1], ['VI · Serv. especiais fora do prazo', '0%', '0%', 1]
]
const tot = i => i.q == null ? null : i.q * i.u * (1 + i.b / 100)
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

function Shell({ membro, email }) {
  const papelBase = MAPA[String(membro.papel || '').toLowerCase()]
  const isAdmin = String(membro.papel).toLowerCase() === 'admin'
  const [prof, setProf] = useState(papelBase || 'auxiliar')
  const [view, setView] = useState('painel')
  const [comp, setComp] = useState(38420)
  const [fil, setFil] = useState('todos')
  const [AP, setAP] = useState(AP0)
  const [IT, setIT] = useState(IT0)
  const [toastMsg, setToastMsg] = useState('')
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 30000); return () => clearInterval(t) }, [])

  const toast = m => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2200) }
  const pr = P[prof], lv = pr.lvl
  const v = pr.nav.includes(view) ? view : 'painel'
  const disp = LIVRE - comp
  const mine = a => lv && a.f[a.i] === lv
  const setItem = (k, patch) => setIT(IT.map((x, j) => j === k ? { ...x, ...patch } : x))

  function decide(id, ok) {
    const a = AP.find(x => x.id === id)
    if (!ok) { setAP(AP.filter(x => x.id !== id)); toast('Devolvido para ajuste, com motivo registrado') }
    else if (a.i < a.f.length - 1) { setAP(AP.map(x => x.id === id ? { ...x, i: x.i + 1 } : x)); toast('Aprovado. Segue para ' + FL[a.f[a.i + 1]]) }
    else { setAP(AP.filter(x => x.id !== id)); if (a.saldo) setComp(comp + a.v); toast('Aprovação final. Lançamento criado no financeiro') }
  }

  const ApCard = ({ a, act }) => (
    <div className="ap">
      <div className="t">
        <div><span className="bd l">{a.t}</span> <b>{a.ti}</b><div className="hint">{a.src}</div></div>
        <b className="mono">{fmt(a.v)}</b>
      </div>
      <div className="flow">{a.f.map((x, k) => [k > 0 && <span key={'a' + k} className="ar">→</span>, <span key={x} className={k < a.i ? 'done' : k === a.i ? 'cur' : ''}>{FL[x]}</span>])}</div>
      {a.saldo && a.v > disp && mine(a) ? <div className="al">Aprovar estoura o saldo livre em {fmt(a.v - disp)}. Decida sabendo o impacto.</div> : null}
      {act && mine(a)
        ? <div className="row">
          <button className="btn" onClick={() => decide(a.id, 1)}>Aprovar{a.f[a.i] === 'analista' ? ' (validar)' : ''}</button>
          <button className="btn r" onClick={() => decide(a.id, 0)}>Devolver</button>
          <button className="btn g" onClick={() => toast('Memória de pesquisa de preço aberta')}>Memória de preço</button>
        </div>
        : <div className="hint">Aguardando: {FL[a.f[a.i]]}</div>}
    </div>
  )

  const Kpis = () => {
    const pc = Math.min(100, comp / LIVRE * 100), me = AP.filter(mine).length
    return (
      <div className="grid k4">
        <div className="card"><div className="kl">Saldo livre do mês</div>
          <div className="kv mono" style={{ color: disp < 0 ? 'var(--cor)' : 'var(--lime)' }}>{fmt(disp)}</div>
          <div className={'bar ' + (pc > 85 ? 'd' : pc > 60 ? 'w' : '')}><i style={{ width: pc + '%' }} /></div>
          <div className="ks">Teto {fmt(TETO)} − mão de obra {fmt(MO)} = {fmt(LIVRE)}<br />Comprometido: {fmt(comp)}</div></div>
        <div className="card"><div className="kl">Aprovações pendentes</div>
          <div className="kv">{lv === 'analista' ? AP.length : me}</div>
          <div className="ks">{lv === 'analista' ? `${me} para você validar` : `aguardam a sua aprovação · ${AP.length - me} em outros níveis`}</div></div>
        <div className="card"><div className="kl">Prazo da medição</div>
          <div className="kv">{left(nextD(1, 14))}</div><div className="ks">envio até dia 1 · 14h</div>
          <div className="ks" style={{ marginTop: 6 }}>Fechamento: <b style={{ color: 'var(--amb)' }}>{left(nextD(5, 13))}</b> (dia 5 · 13h)</div></div>
        <div className="card"><div className="kl">Indicadores contratuais</div>
          <div className="kv">{IND.filter(x => x[3]).length}/6</div>
          <div className="ks">na meta · <span style={{ color: 'var(--cor)' }}>1 abaixo da meta (III)</span></div></div>
      </div>
    )
  }
  const Indicadores = () => (
    <div className="card"><h2>Indicadores do contrato · Setembro/2026 <span className="hint">dados ilustrativos</span></h2>
      <div className="grid i6">{IND.map(x => (
        <div key={x[0]} className={'card ind ' + (x[3] ? 'good' : 'bad')}><div className="kl">{x[0]}</div>
          <div className="kv mono" style={{ color: x[3] ? 'var(--t)' : 'var(--cor)' }}>{x[1]}</div>
          <span className={'bd ' + (x[3] ? 'ok' : 'd')}>meta {x[2]}</span></div>))}</div></div>
  )
  const Status = () => (
    <div className="card"><h2>Serviços especiais por status</h2>
      {[['Solicitado', 6], ['Em andamento', 9], ['Aguard. aprovação', 4], ['Em execução', 5], ['Em medição', 2], ['Concluído', 18]].map(x => (
        <div className="st" key={x[0]}><span>{x[0]}</span><div className="bar"><i style={{ width: x[1] / 18 * 100 + '%' }} /></div><b>{x[1]}</b></div>))}</div>
  )

  function Painel() {
    const nP = IT.filter(i => i.st === 'p').length, nD = IT.filter(i => i.st === 'd').length, nA = IT.filter(i => i.st === 'a').length
    if (['gerente', 'supervisor', 'analista'].includes(prof)) return (<>
      <Kpis /><Indicadores />
      {prof === 'analista' ? (
        <div className="grid c2">
          <div className="card"><h2>Aprovações pendentes <span className="hint">você valida; supervisor e gerente aprovam</span></h2>
            {AP.length ? AP.map(a => <ApCard key={a.id} a={a} act />) : <div className="hint">Nada pendente.</div>}</div>
          <div>
            <div className="card"><h2>Fila de conferência</h2>
              <div className="st"><span>A conferir</span><div className="bar"><i style={{ width: nP / IT.length * 100 + '%' }} /></div><b>{nP}</b></div>
              <div className="st"><span>Devolvidos</span><div className="bar w"><i style={{ width: nD / IT.length * 100 + '%' }} /></div><b>{nD}</b></div>
              <div className="st"><span>Aprovados</span><div className="bar"><i style={{ width: nA / IT.length * 100 + '%' }} /></div><b>{nA}</b></div>
              <button className="btn" onClick={() => setView('medicao')}>Abrir conferência</button></div>
            <div className="card"><h2>Divergências detectadas</h2>
              <div className="al w">2 OS com lançamento duplicado</div>
              <div className="al w">1 item sem quantidade, 1 com erro de fórmula</div>
              <div className="al w">Mês de referência: GoInfra 09/2026 e SINAPI 05/2026</div>
              <div className="al">Posto 44h "coberto" sem nenhuma OS em 3 dias</div></div>
            <Status />
          </div>
        </div>
      ) : (
        <div className="grid c2">
          <div className="card"><h2>Só você aprova <span className="bd l">{AP.filter(mine).length} para {FL[lv]}</span></h2>
            {AP.filter(mine).length ? AP.filter(mine).map(a => <ApCard key={a.id} a={a} act />) : <div className="hint">Nenhuma aprovação aguardando você.</div>}</div>
          <div><Status />
            <div className="card"><h2>Atrasos e alertas</h2>
              <div className="al w">Medição: 3 itens devolvidos há mais de 48h</div>
              <div className="al w">4 cilindros com teste hidrostático a vencer em 30 dias</div>
              <div className="al">Indicador III abaixo da meta (96,04% &lt; 98%)</div></div></div>
        </div>
      )}
    </>)
    if (prof === 'assistente') return (<>
      <div className="grid c3">
        <div className="card"><div className="kl">Processos SES abertos</div><div className="kv">3</div><div className="ks">1 aguardando liberação</div></div>
        <div className="card"><div className="kl">Empenhos a registrar</div><div className="kv" style={{ color: 'var(--amb)' }}>2</div></div>
        <div className="card"><div className="kl">Pagamentos em curso</div><div className="kv">1</div><div className="ks">e-Compras / e-Doc</div></div>
      </div>
      <div className="card"><h2>Processos de investimento</h2>
        <table><thead><tr><th>Nº processo</th><th>Serviço</th><th className="num">Solicitado</th><th className="num">Liberado</th><th>Status</th></tr></thead><tbody>
          <tr><td>2026/SES-0412</td><td>Mudança de layout · Ambulatório B</td><td className="num">{fmt(27800)}</td><td className="num">—</td><td><span className="bd w">Aguardando liberação</span></td></tr>
          <tr><td>2026/SES-0377</td><td>Reforma da sala de espera</td><td className="num">{fmt(18900)}</td><td className="num">{fmt(18900)}</td><td><span className="bd ok">Recurso liberado</span></td></tr>
          <tr><td>2026/SES-0431</td><td>Troca de piso · Corredor 3</td><td className="num">{fmt(14200)}</td><td className="num">—</td><td><span className="bd">Enviado</span></td></tr>
        </tbody></table></div>
      <div className="card"><h2>Pagamento da medição</h2>
        <div className="grid c3">
          <div><label>Canal</label><select><option>e-Compras</option><option>e-Doc</option></select></div>
          <div><label>Nº do processo / documento</label><input className="in" defaultValue="OCS04.2026.JUL.03868" /></div>
          <div><label>Ordem de compra</label><input className="in" defaultValue="206149" /></div></div>
        <button className="btn" onClick={() => toast('Medição marcada como enviada para pagamento')}>Marcar como enviada para pagamento</button></div>
    </>)
    if (prof === 'auxiliar') return (
      <div className="grid c2">
        <div className="card"><h2>Diário de obra rápido</h2>
          <label>Efetivo presente</label>
          <div style={{ margin: '8px 0', lineHeight: 2 }}>{['Encarregado 44h', 'Eletricista 44h', 'Eletricista 12/36', 'Auxiliar 44h', 'Pintor/forro'].map(x => (
            <label key={x} style={{ textTransform: 'none', fontSize: 13, color: 'var(--t)', marginRight: 14 }}><input type="checkbox" defaultChecked /> {x}</label>))}</div>
          <label>Tempo parado (minutos)</label><input className="in" type="number" defaultValue={0} style={{ margin: '6px 0 10px' }} />
          <label>Atividades do dia</label><textarea className="in" rows={3} style={{ marginTop: 6 }} />
          <div className="row" style={{ marginTop: 10 }}><button className="btn g" onClick={() => toast('Foto anexada')}>Anexar foto</button><button className="btn" onClick={() => toast('Diário salvo')}>Salvar diário</button></div></div>
        <div className="card"><h2>Cilindros a vencer · 66 no total</h2>
          <table><thead><tr><th>Código</th><th>Gás</th><th>Dono</th><th>Teste vence</th></tr></thead><tbody>
            <tr><td>CRER-O2-014</td><td>O₂</td><td>IBG</td><td><span className="bd d">12 dias</span></td></tr>
            <tr><td>CRER-O2-031</td><td>O₂</td><td>Unidade</td><td><span className="bd w">24 dias</span></td></tr>
            <tr><td>CRER-N2O-003</td><td>N₂O</td><td>Unidade</td><td><span className="bd w">29 dias</span></td></tr>
            <tr><td>CRER-AR-009</td><td>Ar comp.</td><td>IBG</td><td><span className="bd w">30 dias</span></td></tr>
          </tbody></table><br /><button className="btn" onClick={() => toast('Leitor de QR/serial aberto')}>Ler cilindro</button></div>
      </div>
    )
    const dv = IT.filter(i => i.st === 'd').length, fl = IT.filter(i => i.fl).length
    return (
      <div className="grid k4">
        <div className="card"><div className="kl">Prazo de envio</div><div className="kv">{left(nextD(1, 14))}</div><div className="ks">dia 1 · 14h</div></div>
        <div className="card"><div className="kl">Devolvidos pelo fiscal</div><div className="kv" style={{ color: 'var(--amb)' }}>{dv}</div><div className="ks">reenvie só o apontado</div></div>
        <div className="card"><div className="kl">Bloqueados pela validação</div><div className="kv" style={{ color: 'var(--cor)' }}>{fl}</div><div className="ks">corrigir antes de enviar</div></div>
        <div className="card"><div className="kl">Lançamento do mês</div><div className="kv">{IT.length} itens</div><button className="btn" onClick={() => setView('medicao')}>Abrir medição</button></div>
      </div>
    )
  }

  function Medicao() {
    const ter = prof === 'terceira'
    const rows = IT.filter(i => fil === 'todos' || (fil === 'alerta' ? i.fl : i.st === fil))
    const ap = IT.filter(i => i.st === 'a').length, bloq = IT.filter(i => i.fl).length
    return (<>
      <div className="grid c3">
        <div className="card"><div className="kl">Conferência</div><div className="kv">{ap}/{IT.length} itens</div><div className="bar"><i style={{ width: ap / IT.length * 100 + '%' }} /></div>
          <div className="ks">Fechamento: <b style={{ color: 'var(--amb)' }}>{left(nextD(5, 13))}</b></div></div>
        <div className="card"><div className="kl">Validação automática antes do envio</div><div className="kv" style={{ color: bloq ? 'var(--cor)' : 'var(--ok)' }}>{bloq} bloqueio(s)</div>
          <div className="ks">duplicidade, quantidade vazia, fórmula, mês de referência</div></div>
        <div className="card"><div className="kl">Total conferido (c/ BDI)</div><div className="kv mono">{fmt(IT.filter(i => i.st === 'a').reduce((s, i) => s + (tot(i) || 0), 0))}</div>
          <div className="ks">Total lançado: {fmt(IT.reduce((s, i) => s + (tot(i) || 0), 0))}</div></div>
      </div>
      <div className="card"><h2>Itens por OS <span className="hint">ordenados pela Curva ABC</span></h2>
        <div className="tabs">{[['todos', 'Todos'], ['p', 'A conferir'], ['d', 'Devolvidos'], ['a', 'Aprovados'], ['alerta', 'Com alerta']].map(x => (
          <button key={x[0]} className={fil === x[0] ? 'on' : ''} onClick={() => setFil(x[0])}>{x[1]}</button>))}</div>
        <div className="wrap"><table><thead><tr><th>OS</th><th>Tipo</th><th>Descrição</th><th>Fonte</th><th className="num">Qtd</th><th className="num">Unit.</th><th className="num">Total c/ BDI</th><th>ABC</th><th>Status</th><th>Ação</th></tr></thead><tbody>
          {rows.map(i => {
            const k = IT.indexOf(i), t = tot(i)
            return (<tr key={k}>
              <td className="mono">{i.os}</td><td><span className="hint">{i.tp}</span></td>
              <td>{i.d}{i.fl && <div className="al w" style={{ margin: '4px 0 0' }}>{i.fl}</div>}{i.cm && <div className="hint">Comentário: {i.cm}</div>}</td>
              <td>{i.fo}<div className="hint">{i.cod}</div></td>
              <td className="num">{i.q == null ? '—' : i.q}</td><td className="num">{i.u ? fmt(i.u) : 'R$ 0,00'}</td>
              <td className="num"><b>{t == null ? '—' : fmt(t)}</b></td>
              <td><span className={'bd ' + (i.abc === 'A' ? 'l' : '')}>{i.abc}</span></td>
              <td>{i.st === 'a' ? <span className="bd ok">Aprovado</span> : i.st === 'd' ? <span className="bd w">Devolvido</span> : <span className="bd">A conferir</span>}</td>
              <td>{ter
                ? (i.st === 'd' ? <button className="btn g" onClick={() => { setItem(k, { st: 'p' }); toast('Item reenviado ao fiscal') }}>Reenviar</button>
                  : i.fl ? <button className="btn g" onClick={() => toast('Abrir item para corrigir')}>Corrigir</button> : null)
                : (lv && i.st === 'p' ? <div className="row">
                  <button className="btn" disabled={!!i.fl} title={i.fl ? 'Corrija o alerta antes' : ''} onClick={() => { setItem(k, { st: 'a' }); toast('Item aprovado') }}>Aprovar</button>
                  <button className="btn r" onClick={() => { setItem(k, { st: 'd', cm: 'Devolvido pelo fiscal.' }); toast('Item devolvido com comentário') }}>Devolver</button></div> : null)}</td>
            </tr>)
          })}
        </tbody></table></div>
        <div className="hint" style={{ marginTop: 8 }}>Horas de mão de obra entram com R$ 0,00, pois já são pagas nos postos fixos.</div></div>
      <div className="card"><h2>Mão de obra fixa por posto <span className="hint">valor ÷ dias previstos × dias cobertos</span></h2>
        <table><thead><tr><th>Posto</th><th className="num">Valor mensal</th><th className="num">Previstos</th><th className="num">Cobertos</th><th className="num">Desconto</th><th className="num">A pagar</th></tr></thead><tbody>
          {POSTOS.map(x => { const pg = x.v / x.pv * x.cb; return (
            <tr key={x.n}><td>{x.n}</td><td className="num">{fmt(x.v)}</td><td className="num">{x.pv}</td>
              <td className="num">{x.cb < x.pv ? <span className="bd d">{x.cb}</span> : x.cb}</td>
              <td className="num">{x.v - pg > 0.01 ? fmt(x.v - pg) : '—'}</td><td className="num"><b>{fmt(pg)}</b></td></tr>) })}
        </tbody></table></div>
      {(lv === 'supervisor' || lv === 'gerente') && <div className="row"><button className="btn" onClick={() => toast('Relatório final gerado')}>Gerar relatório final</button></div>}
    </>)
  }

  function Servico() {
    const ph = [['Briefing', 'done', 'Aceito pelo solicitante · Ortopedia'], ['Projeto de layout', 'back', 'v2 · refeito após a aprovação (mudança de sala)'], ['Aprovação do projeto', 'done', 'Aprovado em 28/10'], ['Orçamento', 'doing', 'Aguardando supervisor · em paralelo ao projeto v2'], ['Pedido de investimento (SES)', 'doing', 'Aguardando liberação · processo 2026/SES-0412'], ['Cronograma', 'wait', 'Começa após a liberação'], ['Execução + diário de obra', 'wait', '—'], ['Medição', 'wait', '—']]
    return (<>
      <div className="grid c2">
        <div className="card"><h2>Linha do tempo das fases <span className="hint">podem rodar em paralelo, voltar ou ser puladas</span></h2>
          <div className="tl">{ph.map(x => (
            <div key={x[0]} className={'ph ' + (x[1] === 'wait' ? '' : x[1])}>
              <b>{x[0]} {x[1] === 'back' ? <span className="bd d">refeito</span> : x[1] === 'doing' ? <span className="bd w">em andamento</span> : x[1] === 'done' ? <span className="bd ok">concluída</span> : null}</b>
              <small>{x[2]}</small></div>))}</div></div>
        <div>
          <div className="card"><h2>Financeiro do serviço</h2>
            <div className="st"><span>Solicitado</span><div className="bar"><i style={{ width: '100%' }} /></div><b className="mono">{fmt(27800)}</b></div>
            {['Liberado', 'Comprometido', 'Pago'].map(x => <div className="st" key={x}><span>{x}</span><div className="bar"><i style={{ width: 0 }} /></div><b>—</b></div>)}</div>
          <div className="card"><h2>Pesquisa de preço · Trena a laser <span className="bd ok">concluída</span></h2>
            <div className="st"><span>1 · SINAPI</span><span className="bd d">não encontrado</span></div>
            <div className="st"><span>2 · GoInfra</span><span className="bd d">não encontrado</span></div>
            <div className="st"><span>3 · Comp. própria</span><span className="bd d">não encontrada</span></div>
            <div className="st"><span>4 · Mercado</span><span className="bd ok">3 cotações</span></div>
            <table><tbody>
              <tr><td>Fornecedor A</td><td className="num"><b style={{ color: 'var(--lime)' }}>{fmt(389.9)}</b></td><td><span className="bd l">menor valor</span></td></tr>
              <tr><td>Fornecedor B</td><td className="num">{fmt(412)}</td><td></td></tr>
              <tr><td>Fornecedor C</td><td className="num">{fmt(455.5)}</td><td></td></tr></tbody></table></div>
        </div>
      </div>
    </>)
  }

  const titulo = { painel: `Painel · ${pr.n}`, aprov: 'Aprovações', medicao: 'Medição · Setembro · Parte 2', servico: 'Mudança de layout · Ambulatório B' }[v]
  const sub = { painel: 'Setembro/2026 · CRER · dados ilustrativos', aprov: 'Fluxo: Analistas → Supervisor → Gerente. O diretor assina o pagamento fora do sistema.', medicao: '10/09 a 30/09/2026 · e-Compras OCS04.2026.JUL.03868 · OC 206149 · BDI 25%', servico: 'Serviço especial · Prioridade alta · Coordenação de Ortopedia' }[v]

  return (
    <div className="app">
      <aside>
        <div className="logo">Manut<b>Hub</b><small>CRER · Infraestrutura</small></div>
        {isAdmin && <div><label>Ver como</label>
          <select value={prof} onChange={e => { setProf(e.target.value); setView('painel') }}>
            {Object.keys(P).map(k => <option key={k} value={k}>{P[k].n}</option>)}</select></div>}
        <nav>{pr.nav.map(n => (
          <button key={n} className={v === n ? 'on' : ''} onClick={() => setView(n)}>{NL[n]}
            {n === 'aprov' && <span className="bd l" style={{ marginLeft: 'auto' }}>{AP.filter(mine).length}</span>}</button>))}</nav>
        <div className="user"><div className="av">{pr.i}</div>
          <div>{membro.nome || email}<br /><span>{pr.n}</span><br /><button className="out" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>
      </aside>
      <main>
        <h1>{titulo}</h1><div className="sub">{sub}</div>
        {v === 'painel' && <Painel />}
        {v === 'aprov' && (<>
          <div className="card"><h2>Aguardando você</h2>{AP.filter(mine).length ? AP.filter(mine).map(a => <ApCard key={a.id} a={a} act />) : <div className="hint">Nada aguardando você.</div>}</div>
          <div className="card"><h2>Em outros níveis</h2>{AP.filter(a => !mine(a)).length ? AP.filter(a => !mine(a)).map(a => <ApCard key={a.id} a={a} />) : <div className="hint">Vazio.</div>}</div>
        </>)}
        {v === 'medicao' && <Medicao />}
        {v === 'servico' && <Servico />}
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
    supabase.from('membros').select('nome,papel').eq('user_id', sessao.user.id).eq('ativo', true).maybeSingle()
      .then(({ data }) => setMembro(data || null))
  }, [sessao])

  return (<>
    <style>{CSS}</style>
    {sessao === undefined ? <div className="login"><span className="hint">Carregando…</span></div>
      : !sessao ? <Login />
        : membro === undefined ? <div className="login"><span className="hint">Carregando perfil…</span></div>
          : !membro ? <div className="login"><div className="card">Sem vínculo no CRER. Peça ao administrador.<br /><br /><button className="btn" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>
            : <Shell membro={membro} email={sessao.user.email} />}
  </>)
}
