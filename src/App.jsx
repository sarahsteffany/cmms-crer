import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { supabase } from './supabase'

const MENU = [
  { to: '/dashboard', label: 'Dashboard', roles: ['*'] },
  { to: '/servicos', label: 'Serviços especiais', roles: ['assistente', 'analista', 'supervisor', 'gerente'] },
  { to: '/aprovacoes', label: 'Aprovações', roles: ['supervisor', 'gerente'] },
  { to: '/orcamentos', label: 'Orçamentos', roles: ['analista', 'supervisor', 'gerente'] },
  { to: '/compras', label: 'Compras', roles: ['assistente', 'supervisor', 'gerente'] },
  { to: '/medicoes', label: 'Medições', roles: ['analista', 'supervisor', 'gerente', 'terceira'] },
  { to: '/financeiro', label: 'Financeiro', roles: ['supervisor', 'gerente'] },
  { to: '/gases', label: 'Gases medicinais', roles: ['auxiliar', 'analista', 'supervisor', 'gerente'] },
  { to: '/diario', label: 'Diário de obra', roles: ['auxiliar', 'terceira', 'analista'] },
  { to: '/neovero', label: 'Análise Neovero', roles: ['analista', 'supervisor', 'gerente'] },
]

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('E-mail ou senha inválidos.')
  }

  return (
    <div className="center">
      <form className="card" onSubmit={entrar}>
        <h1>CMMS CRER</h1>
        {erro && <div className="err">{erro}</div>}
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

function Pagina({ titulo }) {
  return (
    <>
      <h1>{titulo}</h1>
      <p>Tela em construção.</p>
    </>
  )
}

export default function App() {
  const [sessao, setSessao] = useState(undefined)
  const [membro, setMembro] = useState(null)
  const [semVinculo, setSemVinculo] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao) { setMembro(null); return }
    supabase.from('membros').select('*').then(({ data, error }) => {
      const uid = sessao.user.id
      const meu = (data || []).find((m) => [m.user_id, m.usuario_id, m.auth_user_id, m.id].includes(uid))
      if (error || !meu) setSemVinculo(true)
      else { setMembro(meu); setSemVinculo(false) }
    })
  }, [sessao])

  if (sessao === undefined) return <div className="center">Carregando...</div>
  if (!sessao) return <Login />

  if (semVinculo) {
    return (
      <div className="center">
        <div className="card">
          <h1>Sem vínculo</h1>
          <p>Seu usuário ainda não está ligado a um tenant e papel na tabela <b>membros</b>.</p>
          <button onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </div>
    )
  }
  if (!membro) return <div className="center">Carregando perfil...</div>

  const papel = membro.papel || membro.role || ''
  const itens = MENU.filter((m) => papel === 'admin' || m.roles.includes('*') || m.roles.includes(papel))

  return (
    <div className="layout">
      <nav className="side">
        <h2>CMMS CRER</h2>
        {itens.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {i.label}
          </NavLink>
        ))}
        <div className="user">
          {sessao.user.email}<br />Papel: <b>{papel || '(vazio)'}</b><br />
          <button className="link" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {itens.map((i) => (
            <Route key={i.to} path={i.to} element={<Pagina titulo={i.label} />} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
