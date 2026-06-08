/* ============================================================
   GestEq — Indicadores + Chaves de acesso + Configurações
   ============================================================ */
const { useState: useStateS3, useMemo: useMemoS3 } = React;

/* ---- Donut chart (by classe) ---- */
function Donut({ segments, size = 168, thick = 22 }) {
  const r = (size - thick) / 2, C = 2 * Math.PI * r, cx = size / 2;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--line-2)" strokeWidth={thick} />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth={thick}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cx})`} strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray .6s var(--ease)' }} />
          );
          offset += len; return el;
        })}
        <text x={cx} y={cx - 4} textAnchor="middle" className="display" style={{ fontSize: 30, fontWeight: 600, fill: 'var(--ink)' }}>{total}</text>
        <text x={cx} y={cx + 16} textAnchor="middle" className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', fill: 'var(--faint)' }}>EQUIP.</text>
      </svg>
      <div style={{ display: 'grid', gap: 9, flex: 1, minWidth: 150 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flex: 'none' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-2)', flex: 1 }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s.value}</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--faint)', width: 36, textAlign: 'right' }}>{Math.round(s.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Indicadores({ requests, pushToast }) {
  const [periodo, setPeriodo] = useStateS3('30');
  const has = (k) => requests.filter(r => r.status === k).length;
  const liberados = has('LIBERADO') + has('LIBERADO_COM_RESTRICAO');
  const pendentes = has('AGUARDANDO_DOCUMENTOS') + has('PENDENTE_DOCUMENTOS') + has('AGUARDANDO_INSPECAO');
  const bloqueados = has('BLOQUEADO');
  const vencidos = requests.filter(r => r.vencido).length;

  const byClasse = ['A', 'B', 'C', 'D'].map((c, i) => ({
    label: `Classe ${c} · ${window.CLASSES[c].tone}`, value: requests.filter(r => r.classe === c).length,
    color: ['var(--brand)', 'var(--inspecao)', 'var(--citrus)', 'var(--urgencia)'][i],
  }));

  const statusBars = [
    { label: 'Aguard. docs', v: has('AGUARDANDO_DOCUMENTOS'), c: 'docs' },
    { label: 'Pendentes', v: has('PENDENTE_DOCUMENTOS'), c: 'pendente' },
    { label: 'Inspeção', v: has('AGUARDANDO_INSPECAO'), c: 'inspecao' },
    { label: 'Liberados', v: liberados, c: 'liberado' },
    { label: 'Bloqueados', v: bloqueados, c: 'bloqueado' },
    { label: 'Urgência', v: has('FLUXO_URGENCIA'), c: 'urgencia' },
  ];
  const maxBar = Math.max(...statusBars.map(b => b.v), 1);

  return (
    <div>
      <PageHeader title="Indicadores estratégicos" subtitle="Visão de homologação e conformidade documental"
        actions={<>
          <div className="seg">
            {['7', '30', '90'].map(p => <button key={p} className={periodo === p ? 'on' : ''} onClick={() => setPeriodo(p)}>{p}d</button>)}
          </div>
          <button className="btn btn-ghost" onClick={() => pushToast({ msg: 'Exportado CSV', icon: 'download' })}><Icon name="download" size={15} />CSV</button>
          <button className="btn btn-ghost" onClick={() => pushToast({ msg: 'Exportado PDF', icon: 'print' })}><Icon name="print" size={15} />PDF</button>
        </>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Stat label="Liberados" value={liberados} tone="brand" icon="shield" delta={8} hint="vs. período ant." />
        <Stat label="Pendentes" value={pendentes} tone="warn" icon="clock" hint="em andamento" />
        <Stat label="Bloqueados" value={bloqueados} tone="bad" icon="x" hint="uso impedido" />
        <Stat label="Vencidos" value={vencidos} tone="bad" icon="warn" hint="fora do SLA" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Panel title="Distribuição por classe" eyebrow="NP 445.000"><Donut segments={byClasse} /></Panel>
        <Panel title="Equipamentos por status" eyebrow="Pipeline atual">
          <div style={{ display: 'grid', gap: 11 }}>
            {statusBars.map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 92, fontSize: 12.5, color: 'var(--ink-2)', flex: 'none' }}>{b.label}</span>
                <div style={{ flex: 1, height: 22, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div className={`fill-${b.c}`} style={{ width: `${(b.v / maxBar) * 100}%`, height: '100%', borderRadius: 6, minWidth: b.v ? 6 : 0, transition: 'width .6s var(--ease)' }} />
                </div>
                <span className="mono" style={{ width: 22, textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{b.v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Stat label="SLA médio de homologação" value="2,4" unit="dias" tone="brand" icon="clock" delta={-12} hint="meta 3d" />
        <Stat label="Taxa de reprovação documental" value="18" unit="%" tone="warn" icon="doc" hint="6 de 33" />
        <Stat label="Documentos a vencer (30d)" value="5" unit="docs" tone="warn" icon="warn" hint="calibração/TSE" />
      </div>
    </div>
  );
}

/* ====================== CHAVES DE ACESSO ====================== */
const CHAVE_ST = { ativa: { cls: 'liberado', label: 'Ativa' }, expirada: { cls: 'pendente', label: 'Expirada' }, revogada: { cls: 'bloqueado', label: 'Revogada' } };

function Chaves({ pushToast }) {
  const [list, setList] = useStateS3(window.CHAVES);
  const [form, setForm] = useStateS3({ nome: '', email: '', tel: '', crm: '', tipo: 'Médico' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const gen = () => {
    if (!form.nome.trim()) { pushToast({ msg: 'Informe o nome do convidado', tone: 'warn', icon: 'warn' }); return; }
    const chave = 'UNIMED-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    setList(l => [{ id: 'k' + Date.now(), chave, status: 'ativa', usos: 0, max: 5, criada: '2026-06-07', expira: '2026-07-07', ...form }, ...l]);
    setForm({ nome: '', email: '', tel: '', crm: '', tipo: 'Médico' });
    pushToast({ msg: 'Chave de acesso gerada', tone: 'ok', icon: 'key' });
  };
  const toggle = (id, to) => { setList(l => l.map(k => k.id === id ? { ...k, status: to } : k)); pushToast({ msg: to === 'revogada' ? 'Chave revogada' : 'Chave reativada', tone: to === 'revogada' ? 'bad' : 'ok' }); };
  const copy = (k) => { try { navigator.clipboard?.writeText(`https://gesteq.unimedfranca.com.br/solicitar/${k}`); } catch (e) {} pushToast({ msg: 'Link copiado', icon: 'paperclip' }); };

  return (
    <div>
      <PageHeader title="Chaves de acesso" subtitle="Convites para solicitação sem login (médicos e fornecedores)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,340px) 1fr', gap: 18, alignItems: 'start' }} className="chaves-grid">
        <Panel title="Gerar chave" eyebrow="Novo convite">
          <div style={{ display: 'grid', gap: 13 }}>
            <FormField label="Nome do convidado" required><Input value={form.nome} onChange={set('nome')} placeholder="Dr. / Empresa" /></FormField>
            <FormField label="E-mail"><Input value={form.email} onChange={set('email')} placeholder="email@dominio.com" type="email" /></FormField>
            <FormField label="Telefone"><Input value={form.tel} onChange={set('tel')} placeholder="(00) 00000-0000" mono /></FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <FormField label="CRM"><Input value={form.crm} onChange={set('crm')} placeholder="CRM-SP" mono /></FormField>
              <FormField label="Tipo"><Select value={form.tipo} onChange={set('tipo')}><option>Médico</option><option>Fornecedor</option></Select></FormField>
            </div>
            <button className="btn btn-primary block" onClick={gen}><Icon name="key" size={16} />Gerar chave</button>
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 12 }}>
          {list.map(k => {
            const s = CHAVE_ST[k.status];
            return (
              <div key={k.id} className="card" style={{ padding: '15px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{k.nome}</span>
                      <span className={`badge st-${s.cls} sm`}><span className="dot" />{s.label}</span>
                      <span className="badge st-rascunho sm">{k.tipo}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{k.email} · {k.crm}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="eyebrow">Usos</div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{k.usos}/{k.max}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <code className="mono" style={{ flex: '1 1 220px', minWidth: 0, fontSize: 11.5, color: 'var(--brand-ink)', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)', borderRadius: 'var(--r-sm)', padding: '7px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>/solicitar/{k.chave}</code>
                  <button className="btn btn-ghost sm" onClick={() => copy(k.chave)} disabled={k.status !== 'ativa'}><Icon name="paperclip" size={14} />Copiar</button>
                  {k.status === 'revogada' || k.status === 'expirada'
                    ? <button className="btn btn-ghost sm" onClick={() => toggle(k.id, 'ativa')}>Reativar</button>
                    : <button className="btn btn-danger sm" onClick={() => toggle(k.id, 'revogada')}>Revogar</button>}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-2)' }}>
                  <span className="eyebrow">Criada {window.fmtDate(k.criada)}</span>
                  <span className="eyebrow">Expira {window.fmtDate(k.expira)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ====================== CONFIGURAÇÕES ====================== */
function Configuracoes({ pushToast, go }) {
  const [list, setList] = useStateS3(window.USUARIOS);
  const [showUser, setShowUser] = useStateS3(false);
  const toggleAtivo = (id) => setList(l => l.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u));

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Administração do GestEq · Unimed Franca" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 22 }}>
        {window.CONFIG_SECOES.map(s => (
          <button key={s.id} className="focusable card" disabled={s.soon}
            onClick={() => { if (s.id === 'usuarios') setShowUser(true); else if (s.id === 'chaves') go('chaves'); }}
            style={{ textAlign: 'left', padding: '16px', cursor: s.soon ? 'default' : 'pointer', opacity: s.soon ? 0.62 : 1, position: 'relative', transition: 'box-shadow .15s var(--ease), border-color .15s var(--ease)' }}
            onMouseEnter={e => { if (!s.soon) { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--brand-line)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--line)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand-ink)', display: 'grid', placeItems: 'center' }}><Icon name={s.icon} size={19} /></span>
              {s.soon ? <span className="eyebrow" style={{ border: '1px dashed var(--line)', borderRadius: 5, padding: '2px 7px' }}>Em breve</span>
                : <span className="count">{s.count}</span>}
            </div>
            <div className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{s.titulo}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {showUser && (
        <Panel title="Usuários e papéis" eyebrow="Acessos"
          right={<button className="btn btn-primary sm" onClick={() => pushToast({ msg: 'Criar novo usuário', icon: 'plus' })}><Icon name="plus" size={15} />Novo usuário</button>} pad={0}>
          <div style={{ overflow: 'hidden' }}>
            {list.map((u, i) => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr auto auto', gap: 14, alignItems: 'center', padding: '13px 20px', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <span className="display" style={{ width: 34, height: 34, borderRadius: 8, flex: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{u.nome.split(' ').slice(0, 2).map(w => w[0]).join('')}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nome}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  </div>
                </div>
                <span className="badge st-rascunho sm">{window.PAPEIS[u.papel]}</span>
                <span className={`badge st-${u.ativo ? 'liberado' : 'retirado'} sm`}><span className="dot" />{u.ativo ? 'Ativo' : 'Inativo'}</span>
                <button className="btn btn-ghost sm" onClick={() => toggleAtivo(u.id)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

Object.assign(window, { Indicadores, Chaves, Configuracoes, Donut });
