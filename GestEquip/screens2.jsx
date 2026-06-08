/* ============================================================
   GestEq — Fornecedores + Notas Fiscais
   ============================================================ */
const { useState: useStateS2 } = React;

function Fornecedores({ pushToast, isMobile }) {
  const [list, setList] = useStateS2(window.FORNECEDORES);
  const [form, setForm] = useStateS2({ nome: '', cnpj: '', email: '', tel: '', cidade: '' });
  const [q, setQ] = useStateS2('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = () => {
    if (!form.nome.trim()) { pushToast({ msg: 'Informe a razão social', tone: 'warn', icon: 'warn' }); return; }
    setList(l => [{ id: 'f' + Date.now(), equip: 0, nfs: 0, ...form }, ...l]);
    setForm({ nome: '', cnpj: '', email: '', tel: '', cidade: '' });
    pushToast({ msg: 'Fornecedor cadastrado', tone: 'ok' });
  };
  const filtered = list.filter(f => !q.trim() || [f.nome, f.cnpj, f.cidade].join(' ').toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Fornecedores" subtitle={`${list.length} proprietários cadastrados`} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '360px 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Novo fornecedor" eyebrow="Cadastro">
          <div style={{ display: 'grid', gap: 13 }}>
            <FormField label="Razão social / nome" required><Input value={form.nome} onChange={set('nome')} placeholder="Ex.: MedSupply Ltda" /></FormField>
            <FormField label="CNPJ"><Input value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" mono /></FormField>
            <FormField label="E-mail"><Input value={form.email} onChange={set('email')} placeholder="comercial@empresa.com.br" type="email" /></FormField>
            <FormField label="Telefone"><Input value={form.tel} onChange={set('tel')} placeholder="(00) 0000-0000" mono /></FormField>
            <FormField label="Cidade / UF"><Input value={form.cidade} onChange={set('cidade')} placeholder="Franca / SP" /></FormField>
            <button className="btn btn-primary block" onClick={submit}><Icon name="plus" size={16} />Cadastrar fornecedor</button>
          </div>
        </Panel>

        <div>
          <div style={{ marginBottom: 12 }}><Search value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar fornecedor, CNPJ, cidade…" width={340} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map(f => (
              <div key={f.id} className="card" style={{ padding: '15px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 12 }}>
                  <div className="display" style={{ width: 40, height: 40, borderRadius: 10, flex: 'none', background: 'var(--brand-soft)', color: 'var(--brand-ink)', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 600 }}>
                    {f.nome.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{f.nome}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 3 }}>{f.cnpj}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 5, fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
                  <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Icon name="doc" size={13} style={{ color: 'var(--faint)' }} />{f.email}</span>
                  <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Icon name="bell" size={13} style={{ color: 'var(--faint)' }} />{f.tel}</span>
                  <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Icon name="pin" size={13} style={{ color: 'var(--faint)' }} />{f.cidade}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingTop: 11, borderTop: '1px solid var(--line-2)' }}>
                  <span className="badge st-liberado sm"><Icon name="cube" size={11} />{f.equip} equip.</span>
                  <span className="badge st-rascunho sm"><Icon name="doc" size={11} />{f.nfs} NFs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== NOTAS FISCAIS ====================== */
function NotasFiscais({ pushToast, isMobile }) {
  const [list, setList] = useStateS2(window.NOTAS);
  const [form, setForm] = useStateS2({ numero: '', data: '', fornecedor: '', valor: '', obs: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = () => {
    if (!form.numero.trim()) { pushToast({ msg: 'Informe o número da NF', tone: 'warn', icon: 'warn' }); return; }
    setList(l => [{ id: 'n' + Date.now(), numero: form.numero, data: form.data || '2026-06-07', fornecedor: form.fornecedor || '—', valor: +form.valor || 0, equipamentos: [] }, ...l]);
    setForm({ numero: '', data: '', fornecedor: '', valor: '', obs: '' });
    pushToast({ msg: 'Nota fiscal cadastrada', tone: 'ok' });
  };

  return (
    <div>
      <PageHeader title="Notas Fiscais" subtitle={`${list.length} NFs · vários equipamentos podem compartilhar a mesma nota`} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '360px 1fr', gap: 18, alignItems: 'start' }}>
        <Panel title="Nova nota fiscal" eyebrow="Cadastro">
          <div style={{ display: 'grid', gap: 13 }}>
            <FormField label="Número da NF" required><Input value={form.numero} onChange={set('numero')} placeholder="NF-00000" mono /></FormField>
            <FormField label="Data de emissão"><Input value={form.data} onChange={set('data')} type="date" mono /></FormField>
            <FormField label="Fornecedor">
              <Select value={form.fornecedor} onChange={set('fornecedor')}>
                <option value="">Selecione…</option>
                {window.FORNECEDORES.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
              </Select>
            </FormField>
            <FormField label="Valor total" hint="R$"><Input value={form.valor} onChange={set('valor')} placeholder="0,00" mono /></FormField>
            <FormField label="Arquivo da NF">
              <Placeholder label="Anexar PDF/XML da nota" h={72} onClick={() => pushToast({ msg: 'Selecionar arquivo da NF', icon: 'paperclip' })} />
            </FormField>
            <button className="btn btn-primary block" onClick={submit}><Icon name="plus" size={16} />Cadastrar NF</button>
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 12 }}>
          {list.map(n => (
            <div key={n.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--line-2)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 9, flex: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--brand-ink)' }}><Icon name="doc" size={18} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{n.numero}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{n.fornecedor} · {window.fmtDate(n.data)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{window.fmtBRL(n.valor)}</span>
                  <button className="btn btn-ghost sm" onClick={() => pushToast({ msg: `Abrindo ${n.numero}`, icon: 'eye' })}><Icon name="paperclip" size={14} />Arquivo</button>
                </div>
              </div>
              <div style={{ padding: '11px 16px' }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Equipamentos do grupo · {n.equipamentos.length}</div>
                {n.equipamentos.length === 0 ? <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>Nenhum equipamento vinculado ainda.</span> : (
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {n.equipamentos.map((e, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 11px' }}>
                        <Icon name="cube" size={12} style={{ color: 'var(--faint)' }} />{e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Fornecedores, NotasFiscais });
