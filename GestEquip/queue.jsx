/* ============================================================
   GestEq — Fila de Homologação (board / list / priority rail)
   ============================================================ */
const { useState: useStateQ, useMemo, useRef: useRefQ } = React;

/* ---- Request card (used in board + list) ---- */
function ReqCard({ r, onOpen, draggable, onDragStart, compact }) {
  const overdue = r.vencido;
  const docsOk = r.docs.filter(d => d.val === 'sim').length;
  const inspOk = r.insp.filter(d => d.val === 'conforme').length;
  const stage = window.STATUS[r.status].stage;
  return (
    <div
      className="card focusable rise"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onOpen(r.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(r.id); }}
      style={{
        cursor: 'pointer', padding: 0, overflow: 'hidden', position: 'relative',
        transition: 'box-shadow .18s var(--ease), transform .12s var(--ease), border-color .18s var(--ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--faint)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      {/* status spine */}
      <div className={`fill-${window.STATUS[r.status].cls}`} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 }} />
      <div style={{ padding: '13px 14px 12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 500 }}>{r.protocolo}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {r.urgente && <span className="badge st-urgencia sm"><Icon name="bolt" size={11} />Urgente</span>}
            {overdue && <span className="badge st-bloqueado sm"><Icon name="clock" size={11} />Vencido</span>}
            <ClassTag c={r.classe} />
          </div>
        </div>

        <div className="display" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.22, color: 'var(--ink)', marginBottom: 2, textWrap: 'balance' }}>
          {r.equip.nome}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          {r.equip.marca} · {r.equip.modelo} · <span className="mono" style={{ fontSize: 11.5 }}>{r.equip.serie}</span>
        </div>

        {!compact && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', margin: '11px 0 11px', fontSize: 12.5, color: 'var(--ink-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={13} style={{ color: 'var(--faint)' }} />{r.solicitante.nome}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={13} style={{ color: 'var(--faint)' }} />{r.setor}</span>
          </div>
        )}

        {/* mini progress: docs + inspeção */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: compact ? 10 : 0 }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span>Docs</span><span className="mono" style={{ color: docsOk === 8 ? 'var(--liberado-ink)' : 'var(--muted)' }}>{docsOk}/8</span>
            </div>
            <Meter value={docsOk} total={8} tone={docsOk === 8 ? 'var(--liberado)' : 'var(--docs)'} h={4} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span>Inspeção</span><span className="mono" style={{ color: inspOk === 7 ? 'var(--liberado-ink)' : 'var(--muted)' }}>{inspOk}/7</span>
            </div>
            <Meter value={inspOk} total={7} tone={inspOk === 7 ? 'var(--liberado)' : 'var(--inspecao)'} h={4} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 9px 16px', borderTop: '1px solid var(--line-2)', background: 'var(--surface-2)' }}>
        <StatusBadge status={r.status} size="sm" />
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{window.relTime(r.createdAt)}</span>
      </div>
    </div>
  );
}

/* ---- Filter chip (counter that filters) ---- */
function FilterChip({ active, onClick, count, label, cls }) {
  return (
    <button onClick={onClick} className="focusable" style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 13px 8px 11px', borderRadius: 10,
      border: '1px solid', cursor: 'pointer', background: active ? 'var(--brand)' : 'var(--surface)',
      borderColor: active ? 'var(--brand)' : 'var(--line)', transition: 'all .15s var(--ease)', minHeight: 44,
    }}>
      <span className={`fill-${cls}`} style={{ width: 8, height: 8, borderRadius: 9, boxShadow: active ? '0 0 0 2px oklch(1 0 0 / 0.18)' : 'none' }} />
      <span className="mono" style={{ fontSize: 17, fontWeight: 600, color: active ? 'white' : 'var(--ink)', lineHeight: 1 }}>{count}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? 'oklch(1 0 0 / 0.85)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

const COUNTERS = [
  { id: 'AGUARDANDO_DOCUMENTOS', label: 'Aguard. docs', cls: 'docs' },
  { id: 'PENDENTE_DOCUMENTOS',   label: 'Pendentes',    cls: 'pendente' },
  { id: 'AGUARDANDO_INSPECAO',   label: 'Inspeção',     cls: 'inspecao' },
  { id: 'LIBERADO',              label: 'Liberados',    cls: 'liberado' },
  { id: 'BLOQUEADO',             label: 'Bloqueados',   cls: 'bloqueado' },
  { id: '__urg',                 label: 'Urgência',     cls: 'urgencia' },
  { id: '__venc',                label: 'Vencidos',     cls: 'bloqueado' },
];

function Queue({ requests, onOpen, setStatus, pushToast, isMobile }) {
  const [view, setView] = useStateQ(isMobile ? 'list' : 'board');
  const [filter, setFilter] = useStateQ(null);
  const [q, setQ] = useStateQ('');
  const [dragId, setDragId] = useStateQ(null);
  const [overStage, setOverStage] = useStateQ(null);

  const counts = useMemo(() => {
    const c = {};
    COUNTERS.forEach(k => { c[k.id] = 0; });
    requests.forEach(r => {
      if (c[r.status] != null) c[r.status]++;
      if (r.urgente) c['__urg']++;
      if (r.vencido) c['__venc']++;
    });
    return c;
  }, [requests]);

  const filtered = useMemo(() => {
    let list = requests;
    if (filter === '__urg') list = list.filter(r => r.urgente);
    else if (filter === '__venc') list = list.filter(r => r.vencido);
    else if (filter) list = list.filter(r => r.status === filter);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(r =>
        [r.equip.nome, r.equip.serie, r.solicitante.nome, r.setor, r.protocolo, r.os].join(' ').toLowerCase().includes(t));
    }
    return list;
  }, [requests, filter, q]);

  const priority = requests.filter(r => r.urgente || r.vencido);

  const onDrop = (stageKey) => {
    if (!dragId) return;
    const r = requests.find(x => x.id === dragId);
    setOverStage(null); setDragId(null);
    if (!r || window.STATUS[r.status].stage === stageKey) return;
    const targetStatus = window.STAGES.find(s => s.key === stageKey).statuses[0];
    setStatus(dragId, targetStatus);
    pushToast({ msg: `${r.protocolo} movido para ${window.STAGES.find(s => s.key === stageKey).label}`, icon: 'arrowR' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '0 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Engenharia Clínica · NP 445.000</div>
            <h1 className="display" style={{ margin: 0, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em' }}>Fila de Homologação</h1>
            <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
              {requests.length} equipamentos no ciclo · <span className="mono" style={{ color: 'var(--urgencia-ink)' }}>{priority.length} prioritários</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={16} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)' }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar série, OS, equipamento…"
                className="focusable mono" style={{
                  height: 40, width: 240, maxWidth: '46vw', paddingLeft: 34, paddingRight: 12, fontSize: 12.5,
                  border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface)', color: 'var(--ink)',
                  fontFamily: "'IBM Plex Mono', monospace",
                }} />
            </div>
            <div className="seg">
              <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Icon name="grid" size={15} />Quadro</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><Icon name="list" size={15} />Lista</button>
            </div>
          </div>
        </div>

        {/* Priority rail */}
        {priority.length > 0 && (
          <div style={{
            border: '1px solid color-mix(in oklch, var(--urgencia) 26%, transparent)', background: 'linear-gradient(180deg, var(--urgencia-soft), var(--surface))',
            borderRadius: 'var(--r-lg)', padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="bolt" size={15} style={{ color: 'var(--urgencia-ink)' }} />
              <span className="eyebrow" style={{ color: 'var(--urgencia-ink)' }}>Prioridade · ação imediata</span>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
              {priority.map(r => (
                <button key={r.id} onClick={() => onOpen(r.id)} className="focusable card" style={{
                  cursor: 'pointer', textAlign: 'left', minWidth: 256, flex: '0 0 auto', padding: '11px 13px',
                  display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--surface)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{r.protocolo}</span>
                    {r.urgente ? <span className="badge st-urgencia sm"><Icon name="bolt" size={10} />D · {r.regularizacao || 'reg.'}</span>
                               : <span className="badge st-bloqueado sm"><Icon name="clock" size={10} />Venceu {window.fmtDate(r.prazo)}</span>}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{r.equip.nome}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.setor}</span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          {COUNTERS.map(c => (
            <FilterChip key={c.id} {...c} count={counts[c.id]} active={filter === c.id}
              onClick={() => setFilter(filter === c.id ? null : c.id)} />
          ))}
          {filter && (
            <button className="btn btn-quiet sm" onClick={() => setFilter(null)} style={{ alignSelf: 'center' }}>
              <Icon name="x" size={14} />Limpar
            </button>
          )}
        </div>
      </div>

      {/* Board / List */}
      {view === 'board' ? (
        <div style={{ flex: 1, minHeight: 460, overflowX: 'auto', overflowY: 'visible', paddingBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))', gap: 14, minHeight: '100%', height: '100%' }}>
            {window.STAGES.map(stage => {
              const items = filtered.filter(r => window.STATUS[r.status].stage === stage.key);
              const isOver = overStage === stage.key;
              return (
                <div key={stage.key}
                  onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverStage(stage.key); } }}
                  onDragLeave={(e) => { if (e.currentTarget === e.target) setOverStage(null); }}
                  onDrop={() => onDrop(stage.key)}
                  style={{
                    display: 'flex', flexDirection: 'column', minHeight: 0,
                    background: isOver ? 'var(--bg-rail)' : 'transparent',
                    borderRadius: 'var(--r-lg)', transition: 'background .15s var(--ease)',
                    outline: isOver ? '2px dashed color-mix(in oklch, var(--ink) 30%, transparent)' : 'none', outlineOffset: -2,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 6px 12px', position: 'sticky', top: 0 }}>
                    <span className="display" style={{
                      width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center',
                      fontSize: 12, fontWeight: 600, color: 'var(--surface)', background: 'var(--brand)',
                    }}>{stage.n}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{stage.label}</div>
                      <div className="eyebrow" style={{ fontSize: 9.5 }}>{stage.hint}</div>
                    </div>
                    <span className="count">{items.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto', padding: '2px 4px 12px', flex: 1 }}>
                    {items.map(r => (
                      <ReqCard key={r.id} r={r} onOpen={onOpen} compact draggable
                        onDragStart={(e) => { setDragId(r.id); e.dataTransfer.effectAllowed = 'move'; }} />
                    ))}
                    {items.length === 0 && (
                      <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--r)', padding: '20px 12px', textAlign: 'center' }}>
                        <span className="eyebrow">Vazio</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 8 }}>
          {filtered.length === 0 ? (
            <Empty icon="search" title="Nenhum equipamento encontrado" sub="Ajuste a busca ou os filtros." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filtered.map(r => <ReqCard key={r.id} r={r} onOpen={onOpen} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Queue, ReqCard });
