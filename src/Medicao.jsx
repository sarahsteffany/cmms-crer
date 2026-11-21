import { useCallback, useEffect, useState } from 'react';

// Ajuste aqui se o nome do papel no banco for diferente
const P = { terc: 'terceira', ana: 'analista', sup: 'supervisor', ger: 'gerente', ass: 'assistente', adm: 'admin' };
// Ajuste aqui se o nome da coluna em medicao_itens for diferente
const COL = { inf: 'quantidade_informada', conf: 'quantidade_conferida', glosa: 'glosa_valor', motivo: 'glosa_motivo', st: 'status_conferencia', os: 'numero_os' };

const TIPOS = { mensal: 'Mensal (preventiva/corretiva)', reforma: 'Reforma', compra_ferramentas: 'Compra de ferramentas', servico_especial: 'Serviço especial' };

const FLUXO = {
  em_preenchimento: [{ para: 'enviada', quem: [P.terc, P.adm], rod: 'envio', rot: 'Enviar' }],
  enviada: [{ para: 'em_conferencia', quem: [P.ana, P.adm], rot: 'Iniciar conferência' }],
  em_conferencia: [
    { para: 'com_pendencias', quem: [P.ana, P.adm], rod: 'devolucao', rot: 'Devolver com pendências' },
    { para: 'aprovada_supervisor', quem: [P.sup, P.adm], rot: 'Aprovar (supervisor)' },
  ],
  com_pendencias: [{ para: 'reenviada', quem: [P.terc, P.adm], rod: 'reenvio', rot: 'Reenviar' }],
  reenviada: [{ para: 'em_conferencia', quem: [P.ana, P.adm], rot: 'Retomar conferência' }],
  aprovada_supervisor: [{ para: 'aprovada_gerente', quem: [P.ger, P.adm], rot: 'Aprovar (gerente)' }],
  aprovada_gerente: [{ para: 'enviada_pagamento', quem: [P.ass, P.ger, P.adm], rot: 'Enviar para pagamento' }],
};

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const primeiroDia = (ym) => `${ym}-01`;
const hoje = () => new Date().toISOString().slice(0, 10);

const s = {
  box: { border: '1px solid #d9dee5', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fff' },
  th: { textAlign: 'left', padding: 6, borderBottom: '1px solid #d9dee5', fontSize: 12, background: '#f4f6f9' },
  td: { padding: 6, borderBottom: '1px solid #eef0f3', fontSize: 13 },
  btn: { padding: '6px 10px', borderRadius: 6, border: '1px solid #1F3A5F', background: '#1F3A5F', color: '#fff', cursor: 'pointer', marginRight: 6, fontSize: 12 },
  btn2: { padding: '6px 10px', borderRadius: 6, border: '1px solid #1F3A5F', background: '#fff', color: '#1F3A5F', cursor: 'pointer', marginRight: 6, fontSize: 12 },
  inp: { padding: 5, border: '1px solid #c5ccd6', borderRadius: 6, fontSize: 13 },
};

export default function Medicao({ supabase, papel, usuarioId, tenantId }) {
  const [lista, setLista] = useState([]);
  const [sel, setSel] = useState(null);
  const [itens, setItens] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [sugestao, setSugestao] = useState([]);
  const [msg, setMsg] = useState(null);
  const [vm, setVm] = useState('');

  const interna = [P.ana, P.sup, P.ger, P.ass, P.adm].includes(papel);
  const aviso = (t, erro) => setMsg({ t, erro: !!erro });
  const falha = (e) => aviso(e?.message || 'Erro ao gravar', true);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('medicoes').select('*').order('mes_referencia', { ascending: false });
    if (error) return falha(error);
    setLista(data || []);
    if (sel) setSel((data || []).find((m) => m.id === sel.id) || null);
  }, [supabase, sel?.id]);

  const abrir = useCallback(async (m) => {
    setSel(m);
    setVm(m.valor_medido ?? '');
    let r = await supabase.from('medicao_itens').select('*, contrato_itens(descricao, preco_unitario)').eq('medicao_id', m.id);
    if (r.error) r = await supabase.from('medicao_itens').select('*').eq('medicao_id', m.id);
    if (r.error) falha(r.error);
    setItens(r.data || []);
    const p = await supabase.from('medicao_parcelas').select('*').eq('medicao_id', m.id).order('mes_referencia');
    if (p.error) falha(p.error);
    setParcelas(p.data || []);
  }, [supabase]);

  useEffect(() => { carregar(); }, []);

  async function mudarStatus(t) {
    const { error } = await supabase.from('medicoes').update({ status: t.para }).eq('id', sel.id);
    if (error) return falha(error);
    aviso('Status atualizado');
    await carregar();
    const { data } = await supabase.from('medicoes').select('*').eq('id', sel.id).single();
    if (data) abrir(data);
  }

  async function salvarItem(it, campos) {
    const { error } = await supabase.from('medicao_itens').update(campos).eq('id', it.id);
    if (error) return falha(error);
    abrir(sel);
  }

  async function salvarValorMedido() {
    const { error } = await supabase.from('medicoes').update({ valor_medido: Number(vm) }).eq('id', sel.id);
    if (error) return falha(error);
    aviso('Valor medido gravado');
    carregar();
  }

  async function chamar(fn) {
    const { error } = await supabase.rpc(fn, { p_medicao: sel.id });
    if (error) return falha(error);
    aviso('Feito');
    abrir(sel);
  }

  async function propor(medicaoId, valor) {
    const { error } = await supabase.from('medicao_parcelas').insert({
      medicao_id: medicaoId, tenant_id: tenantId, mes_referencia: primeiroDia(mes),
      valor: Number(valor), status: 'proposta', proposta_por: usuarioId,
    });
    if (error) return falha(error);
    aviso('Parcela proposta');
    if (sel) abrir(sel);
  }

  async function atualizarParcela(p, campos, ok) {
    const { error } = await supabase.from('medicao_parcelas').update(campos).eq('id', p.id);
    if (error) return falha(error);
    aviso(ok);
    abrir(sel);
  }

  async function sugerir() {
    const { data, error } = await supabase.rpc('sugerir_parcelas', { p_mes: primeiroDia(mes) });
    if (error) return falha(error);
    setSugestao(data || []);
  }

  const acoes = sel ? (FLUXO[sel.status] || []).filter((t) => t.quem.includes(papel)) : [];
  const editaQtd = sel && [P.terc, P.adm].includes(papel) && ['em_preenchimento', 'com_pendencias'].includes(sel.status);
  const conferindo = sel && [P.ana, P.adm].includes(papel) && sel.status === 'em_conferencia';

  return (
    <div style={{ padding: 16, maxWidth: 1100 }}>
      <h2 style={{ marginBottom: 8 }}>Medições</h2>
      {msg && (
        <div style={{ ...s.box, borderColor: msg.erro ? '#c0392b' : '#2e8b57', color: msg.erro ? '#c0392b' : '#2e8b57' }}>
          {msg.t}
        </div>
      )}

      {interna && (
        <div style={s.box}>
          <b>Parcelas do mês</b>{' '}
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} style={s.inp} />{' '}
          <button style={s.btn2} onClick={sugerir}>Ver sugestão do saldo livre</button>
          {sugestao.length > 0 && (
            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
              <thead><tr><th style={s.th}>Medição</th><th style={s.th}>Valor sugerido</th><th style={s.th} /></tr></thead>
              <tbody>
                {sugestao.map((x, i) => {
                  const id = x.medicao_id || x.id;
                  const v = x.valor ?? x.valor_sugerido ?? x.parcela;
                  return (
                    <tr key={i}>
                      <td style={s.td}>{id}</td>
                      <td style={s.td}>{brl(v)}</td>
                      <td style={s.td}>
                        {[P.ana, P.adm].includes(papel) && <button style={s.btn} onClick={() => propor(id, v)}>Propor</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={s.box}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Mês', 'Tipo', 'Status', 'Medido', 'Pago', 'Saldo a pagar', ''].map((h) => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.id} style={{ background: sel?.id === m.id ? '#eef4ff' : 'transparent' }}>
                <td style={s.td}>{String(m.mes_referencia).slice(0, 7)}</td>
                <td style={s.td}>{TIPOS[m.tipo] || m.tipo}</td>
                <td style={s.td}>{m.status}</td>
                <td style={s.td}>{brl(m.valor_medido)}</td>
                <td style={s.td}>{brl(m.valor_pago)}</td>
                <td style={s.td}>{brl(m.saldo_pagar)}</td>
                <td style={s.td}><button style={s.btn2} onClick={() => abrir(m)}>Abrir</button></td>
              </tr>
            ))}
            {lista.length === 0 && <tr><td style={s.td} colSpan={7}>Nenhuma medição.</td></tr>}
          </tbody>
        </table>
      </div>

      {sel && (
        <>
          <div style={s.box}>
            <b>{TIPOS[sel.tipo] || sel.tipo}</b> · {String(sel.mes_referencia).slice(0, 7)} · <i>{sel.status}</i>
            <div style={{ marginTop: 8 }}>
              {acoes.map((t) => <button key={t.para} style={s.btn} onClick={() => mudarStatus(t)}>{t.rot}</button>)}
              {interna && <button style={s.btn2} onClick={() => chamar('gerar_postos_medicao')}>Gerar postos</button>}
              {interna && <button style={s.btn2} onClick={() => chamar('atualizar_cobertura_medicao')}>Atualizar cobertura</button>}
            </div>
            {interna && (
              <div style={{ marginTop: 8 }}>
                Valor medido: <input type="number" step="0.01" value={vm} onChange={(e) => setVm(e.target.value)} style={s.inp} />{' '}
                <button style={s.btn} onClick={salvarValorMedido}>Gravar</button>
                <small style={{ marginLeft: 8, color: '#667' }}>
                  Reforma, compra e serviço especial: use o valor do orçamento ou pedido aprovado.
                </small>
              </div>
            )}
          </div>

          <div style={s.box}>
            <b>Itens</b>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
              <thead>
                <tr>
                  {['Item', 'OS', 'Informado', 'Conferido', 'Glosa', 'Motivo', 'Conferência', ''].map((h) => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {itens.map((it) => (
                  <tr key={it.id}>
                    <td style={s.td}>{it.contrato_itens?.descricao || it.contrato_item_id}</td>
                    <td style={s.td}>{it[COL.os] ?? '-'}</td>
                    <td style={s.td}>
                      {editaQtd
                        ? <input type="number" min="0" defaultValue={it[COL.inf]} style={{ ...s.inp, width: 80 }}
                            onBlur={(e) => Number(e.target.value) !== Number(it[COL.inf]) && salvarItem(it, { [COL.inf]: Number(e.target.value) })} />
                        : it[COL.inf]}
                    </td>
                    <td style={s.td}>
                      {conferindo
                        ? <input type="number" min="0" defaultValue={it[COL.conf]} style={{ ...s.inp, width: 80 }}
                            onBlur={(e) => salvarItem(it, { [COL.conf]: Number(e.target.value) })} />
                        : it[COL.conf] ?? '-'}
                    </td>
                    <td style={s.td}>
                      {conferindo
                        ? <input type="number" min="0" defaultValue={it[COL.glosa]} style={{ ...s.inp, width: 80 }}
                            onBlur={(e) => salvarItem(it, { [COL.glosa]: Number(e.target.value) })} />
                        : it[COL.glosa] ?? '-'}
                    </td>
                    <td style={s.td}>{it[COL.motivo] ?? ''}</td>
                    <td style={s.td}>{it[COL.st]}</td>
                    <td style={s.td}>
                      {conferindo && (
                        <>
                          <button style={s.btn} onClick={() => salvarItem(it, { [COL.st]: 'aprovado' })}>Aprovar</button>
                          <button style={s.btn2} onClick={() => {
                            const m = window.prompt('Motivo da devolução:');
                            if (m) salvarItem(it, { [COL.st]: 'devolvido', [COL.motivo]: m });
                          }}>Devolver</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {itens.length === 0 && <tr><td style={s.td} colSpan={8}>Sem itens (normal em reforma, compra e serviço especial).</td></tr>}
              </tbody>
            </table>
          </div>

          <div style={s.box}>
            <b>Parcelas</b>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
              <thead>
                <tr>{['Mês', 'Valor', 'Status', 'Parecer', 'Doc. pagamento', ''].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {parcelas.map((p) => (
                  <tr key={p.id}>
                    <td style={s.td}>{String(p.mes_referencia).slice(0, 7)}</td>
                    <td style={s.td}>{brl(p.valor)}</td>
                    <td style={s.td}>{p.status}</td>
                    <td style={s.td}>{p.parecer || ''}</td>
                    <td style={s.td}>{p.doc_pagamento || ''}</td>
                    <td style={s.td}>
                      {p.status === 'proposta' && [P.ger, P.adm].includes(papel) && (
                        <>
                          <button style={s.btn} onClick={() => atualizarParcela(p, { status: 'aprovada', aprovada_por: usuarioId, aprovada_em: new Date().toISOString() }, 'Parcela aprovada')}>Aprovar</button>
                          <button style={s.btn2} onClick={() => {
                            const m = window.prompt('Motivo da rejeição:');
                            if (m) atualizarParcela(p, { status: 'rejeitada', parecer: m }, 'Parcela rejeitada');
                          }}>Rejeitar</button>
                        </>
                      )}
                      {p.status === 'aprovada' && [P.ass, P.ger, P.adm].includes(papel) && (
                        <button style={s.btn} onClick={() => {
                          const d = window.prompt('Nº do documento de pagamento:');
                          if (d) atualizarParcela(p, { status: 'paga', pago_em: hoje(), doc_pagamento: d }, 'Pagamento registrado');
                        }}>Registrar pagamento</button>
                      )}
                    </td>
                  </tr>
                ))}
                {parcelas.length === 0 && <tr><td style={s.td} colSpan={6}>Nenhuma parcela.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
