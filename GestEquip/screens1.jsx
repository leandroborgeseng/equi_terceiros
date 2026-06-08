/* ============================================================
   GestEq — Equipamentos (v2: thumbnails, filters, batch) + Pendências
   ============================================================ */
const { useState: useStateS1v2, useMemo: useMemoS1v2 } = React;

/* ---- Photo thumbnails strip ---- */
function PhotoStrip({ photos, onClick }) {
  const filled = photos.filter(p => p.filled);
  const show = filled.slice(0, 4);
  const rest = filled.length - 4;
  if (filled.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
        <span style={{ width: 18, height: 14, borderRadius: 3, border: '1px dashed var(--line)', display: 'inline-block' }} />
        <span className="eyebrow" style={{ fontSize: 9.5 }}>Sem fotos</span>
      </div>
    );
  }
  return (
    <div onClick={e => { e.stopPropagation(); onClick && onClick(); }}
      style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7, cursor: onClick ? 'pointer' : 'default' }}>
      {show.map(p => (
        <div key={p.id} title={p.label} style={{
          width: 28, height: 18, borderRadius: 3, flexShrink: 0, overflow: 'hidden',
          background: 'repeating-linear-gradient(135deg, oklch(0.92 0.005 255) 0 4px, oklch(0.87 0.006 255) 4px 8px)',
          border: '1px solid var(--line)',
        }} />
      ))}
      {rest > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 5px' }}>+{rest}</span>}
      <Icon name="camera" size={11} style={{ color: 'var(--faint)', marginLeft: 2 }} />
    </div>
  );
}

/* ---- Equip row ---- */
function EquipRow({ r, onOpen, pushToast, isMobile, selected, onSelect }) {
  const s = window.STATUS[r.status];
  const blueBtn = { background: 'oklch(0.966 0.016 245)', borderColor: 'oklch(0.845 0.055 245)', color: 'oklch(0.46 0.105 245)' };
  return (
    <div style={{ position: 'relative' }}>
      <div className={`fill-${s.cls}`} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 }} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '28px 1fr' : '28px 1.6fr 0.85fr 1fr 0.62fr auto', gap: 12, alignItems: 'start', padding: '13px 14px 13px 20px', borderBottom: '1px solid var(--line-2)', transition: 'background .13s var(--ease)', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => onOpen(r.id)}>
        <div onClick={e => e.stopPropagation()} style={{ paddingTop: 3 }}>
          <input type="checkbox" checked={selected} onChange={() => onSelect(r.id)} style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{r.equip.nome}</span>
            {r.solicitante.origem === 'publico' && <OriginSeal origem="publico" />}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            {r.equip.marca} · {r.equip.modelo} ·&nbsp;
            <span className="mono" style={{ fontSize: 11.5 }}>{r.equip.serie}</span>
          </div>
          <div style={{ display: 'flex', gap: '3px 10px', flexWrap: 'wrap', marginTop: 4, fontSize: 11.5, color: 'var(--faint)' }}>
            <span className="mono">{r.protocolo}</span>
            <span className="mono">{r.os}</span>
          </div>
          {/* photo strip */}
          <PhotoStrip photos={r.photos} onClick={() => onOpen(r.id)} />
        </div>
        <div style={{ paddingTop: 3 }}><StatusBadge status={r.status} size="sm" /></div>
        <div style={{ minWidth: 0, paddingTop: 3 }}>
          <div className="eyebrow" style={{ marginBottom: 2 }}>Setor</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.setor}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Icon name="user" size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.solicitante.nome.split(' ')[0]} {r.solicitante.nome.split(' ').slice(-1)}</div>
        </div>
        <div style={{ paddingTop: 3 }}><ClassTag c={r.classe} /></div>
        <div style={{ display: 'flex', gap: 6, paddingTop: 3 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-primary sm" onClick={() => onOpen(r.id)} style={{ fontSize: 12, padding: '0 10px' }}>Avaliar <Icon name="chevR" size={13} /></button>
          <button className="btn btn-ghost sm" onClick={() => pushToast({ msg: `Cadastro EC · ${r.protocolo}`, icon: 'clipboard' })} style={{ fontSize: 12, padding: '0 9px' }}>EC</button>
          <button className="btn btn-ghost sm" onClick={() => pushToast({ msg: `Duplicando ${r.protocolo}`, icon: 'copy' })} style={{ fontSize: 12, padding: '0 9px', ...blueBtn, border: '1px solid' }}><Icon name="copy" size={13} /></button>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Equipamentos screen ---- */
function Equipamentos({ requests, onOpen, pushToast, isMobile }) {
  const [q, setQ] = useStateS1v2('');
  const [st, setSt] = useStateS1v2(null);
  const [cl, setCl] = useStateS1v2(null);
  const [medFilter, setMedFilter] = useStateS1v2('');
  const [fornFilter, setFornFilter] = useStateS1v2('');
  const [selected, setSelected] = useStateS1v2(new Set());

  const medicos = useMemoS1v2(() => [...new Set(requests.map(r => r.solicitante.nome))].sort(), [requests]);
  const fornecedores = useMemoS1v2(() => [...new Set(requests.map(r => r.fornecedor))].sort(), [requests]);

  const list = useMemoS1v2(() => requests.filter(r => {
    if (st && r.status !== st) return false;
    if (cl && r.classe !== cl) return false;
    if (medFilter && r.solicitante.nome !== medFilter) return false;
    if (fornFilter && r.fornecedor !== fornFilter) return false;
    if (q.trim()) {
      const t = q.toLowerCase();
      if (![r.equip.nome, r.equip.serie, r.solicitante.nome, r.setor, r.protocolo, r.os, r.fornecedor].join(' ').toLowerCase().includes(t)) return false;
    }
    return true;
  }), [requests, q, st, cl, medFilter, fornFilter]);

  const hasFilters = !!(st || cl || medFilter || fornFilter || q.trim());
  const clearAll = () => { setSt(null); setCl(null); setMedFilter(''); setFornFilter(''); setQ(''); };

  const toggleSel = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allVisible = list.length > 0 && list.every(r => selected.has(r.id));
  const toggleAll = () => setSelected(allVisible ? new Set() : new Set(list.map(r => r.id)));

  const statusOpts = [
    { v: 'AGUARDANDO_DOCUMENTOS', label: 'Aguard. docs', dot: 'docs' },
    { v: 'PENDENTE_DOCUMENTOS',   label: 'Pendentes',    dot: 'pendente' },
    { v: 'AGUARDANDO_INSPECAO',   label: 'Inspeção',     dot: 'inspecao' },
    { v: 'LIBERADO',              label: 'Liberados',    dot: 'liberado' },
    { v: 'BLOQUEADO',             label: 'Bloqueados',   dot: 'bloqueado' },
    { v: 'FLUXO_URGENCIA',        label: 'Urgência',     dot: 'urgencia' },
  ];
  const classOpts = Object.keys(window.CLASSES).map(c => ({ v: c, label: `Classe ${c}` }));

  return (
    <div>
      <PageHeader title="Equipamentos" subtitle={`${requests.length} equipamentos de terceiros · ${requests.filter(r => r.status === 'LIBERADO').length} liberados`}
        actions={<button className="btn btn-primary" onClick={() => pushToast({ msg: 'Novo cadastro', icon: 'plus' })}><Icon name="plus" size={16} />Novo equipamento</button>} />

      {/* Search + entity filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <Search value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar série, OS, equipamento, médico, fornecedor…" width={380} />
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 180 }}>
            <Icon name="user" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }} />
            <select value={medFilter} onChange={e => setMedFilter(e.target.value)}
              style={{ height: 40, width: '100%', paddingLeft: 30, paddingRight: 28, fontSize: 13, border: '1px solid var(--line)', borderRadius: 'var(--r)', background: medFilter ? 'var(--brand-soft)' : 'var(--surface)', color: medFilter ? 'var(--brand-ink)' : 'var(--ink)', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="">Todos os médicos</option>
              {medicos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Icon name="chevD" size={14} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: 180 }}>
            <Icon name="truck" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }} />
            <select value={fornFilter} onChange={e => setFornFilter(e.target.value)}
              style={{ height: 40, width: '100%', paddingLeft: 30, paddingRight: 28, fontSize: 13, border: '1px solid var(--line)', borderRadius: 'var(--r)', background: fornFilter ? 'var(--brand-soft)' : 'var(--surface)', color: fornFilter ? 'var(--brand-ink)' : 'var(--ink)', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="">Todos os fornecedores</option>
              {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <Icon name="chevD" size={14} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Status + classe pills */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div><div className="eyebrow" style={{ marginBottom: 7 }}>Status</div><Pills options={statusOpts} value={st} onChange={setSt} /></div>
        <div><div className="eyebrow" style={{ marginBottom: 7 }}>Classe</div><Pills options={classOpts} value={cl} onChange={setCl} /></div>
      </div>

      {/* Active filter summary bar */}
      {hasFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 14px', marginBottom: 12, borderRadius: 'var(--r)', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)', fontSize: 13 }}>
          <span style={{ color: 'var(--brand-ink)', fontWeight: 600 }}>{list.length} equipamento{list.length !== 1 ? 's' : ''}</span>
          {medFilter && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'white', border: '1px solid var(--brand-line)', borderRadius: 999, padding: '2px 9px 2px 8px', fontSize: 12.5, color: 'var(--brand-ink)' }}><Icon name="user" size={11} />{medFilter.split(' ').slice(0, 2).join(' ')}<button onClick={() => setMedFilter('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: 'var(--brand-ink)', marginLeft: 2, display: 'flex' }}><Icon name="x" size={11} /></button></span>}
          {fornFilter && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'white', border: '1px solid var(--brand-line)', borderRadius: 999, padding: '2px 9px 2px 8px', fontSize: 12.5, color: 'var(--brand-ink)' }}><Icon name="truck" size={11} />{fornFilter.split(' ')[0]}<button onClick={() => setFornFilter('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: 'var(--brand-ink)', marginLeft: 2, display: 'flex' }}><Icon name="x" size={11} /></button></span>}
          <button className="btn btn-quiet sm" onClick={clearAll} style={{ marginLeft: 'auto', fontSize: 12.5 }}>Limpar filtros</button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Column headers + batch bar */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '28px 1fr' : '28px 1.6fr 0.85fr 1fr 0.62fr auto', gap: 12, padding: '9px 14px 9px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={allVisible} onChange={toggleAll} style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} />
          </div>
          {selected.size > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: isMobile ? '2' : '2 / -1' }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--brand-ink)', fontWeight: 600 }}>{selected.size} selecionado{selected.size !== 1 ? 's' : ''}</span>
              <button className="btn btn-primary sm" onClick={() => { pushToast({ msg: `Gerando etiquetas A4 para ${selected.size} equipamento(s)`, icon: 'tag' }); setSelected(new Set()); }}>
                <Icon name="tag" size={14} />Etiquetas A4 ({selected.size})
              </button>
              <button className="btn btn-quiet sm" onClick={() => setSelected(new Set())}>Limpar seleção</button>
            </div>
          ) : !isMobile && (
            <>
              {['Equipamento', 'Status', 'Setor · Médico', 'Classe', ''].map((h, i) => (
                <div key={i} className="eyebrow" style={{ justifySelf: i === 4 ? 'end' : 'start' }}>{h}</div>
              ))}
            </>
          )}
        </div>

        {list.length === 0 ? <Empty icon="search" title="Nenhum equipamento encontrado" sub="Ajuste a busca ou os filtros." />
          : list.map(r => <EquipRow key={r.id} r={r} onOpen={onOpen} pushToast={pushToast} isMobile={isMobile} selected={selected.has(r.id)} onSelect={toggleSel} />)}
      </div>
    </div>
  );
}

/* ====================== PENDÊNCIAS ====================== */
function PendItem({ r, onOpen, tag, tone, icon }) {
  return (
    <div className="focusable card" tabIndex={0} onClick={() => onOpen(r.id)} onKeyDown={e => e.key === 'Enter' && onOpen(r.id)}
      style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', transition: 'box-shadow .15s var(--ease)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div className={`fill-${tone}`} style={{ width: 4, flex: 'none' }} />
      <div style={{ padding: '13px 16px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <span className={`badge st-${tone} sm`}><Icon name={icon} size={11} />{tag}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{r.protocolo}</span>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{r.equip.nome}</div>
        <div style={{ display: 'flex', gap: '4px 14px', flexWrap: 'wrap', marginTop: 5, fontSize: 12.5, color: 'var(--muted)' }}>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="user" size={12} style={{ color: 'var(--faint)' }} />{r.solicitante.nome}</span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="pin" size={12} style={{ color: 'var(--faint)' }} />{r.setor}</span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" size={12} style={{ color: 'var(--faint)' }} />Prazo {window.fmtDate(r.prazo)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14, color: 'var(--faint)' }}><Icon name="chevR" size={18} /></div>
    </div>
  );
}

function Pendencias({ requests, onOpen }) {
  const vencidos  = requests.filter(r => r.vencido);
  const urgencia  = requests.filter(r => r.status === 'FLUXO_URGENCIA');
  const pendDocs  = requests.filter(r => r.status === 'PENDENTE_DOCUMENTOS' && !r.vencido);
  const retirada  = requests.filter(r => r.status === 'AGUARDANDO_RETIRADA');
  const total = vencidos.length + urgencia.length + pendDocs.length + retirada.length;

  const Group = ({ title, items, tag, tone, icon, sub }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
        <span className={`fill-${tone}`} style={{ width: 9, height: 9, borderRadius: 9 }} />
        <h2 className="display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        <span className="count">{items.length}</span>
        {sub && <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{sub}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 }}>
        {items.map(r => <PendItem key={r.id} r={r} onOpen={onOpen} tag={tag} tone={tone} icon={icon} />)}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Pendências" subtitle={`${total} itens exigem ação da Engenharia Clínica`} />
      {total === 0 ? <div className="card"><Empty icon="check" title="Nenhuma pendência" sub="Tudo em dia." /></div> : (
        <>
          <Group title="Vencidos" items={vencidos} tag="Vencido" tone="bloqueado" icon="warn" sub="Prazo regulatório ultrapassado" />
          <Group title="Fluxo de urgência" items={urgencia} tag="Regularizar" tone="urgencia" icon="bolt" sub="Classe D — regularização obrigatória" />
          <Group title="Documentação pendente" items={pendDocs} tag="Complemento" tone="pendente" icon="doc" />
          <Group title="Aguardando retirada" items={retirada} tag="Retirada" tone="retirada" icon="truck" />
        </>
      )}
    </div>
  );
}

Object.assign(window, { Equipamentos, Pendencias });
