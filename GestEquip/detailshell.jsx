/* ============================================================
   GestEq — Detail shell v2: 6 tabs + QuickActions + FlowPills
   ============================================================ */
const { useState: useDSS } = React;

/* ---- NF link modal ---- */
function NFModal({ r, patch, pushToast, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'oklch(0.2 0.01 255 / 0.55)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 40px' }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 'min(520px, 96vw)', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--line-2)' }}>
          <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>Vincular nota fiscal</div>
          <button className="btn btn-quiet sm" onClick={onClose} style={{ padding: 6 }}><Icon name="x" size={16} /></button>
        </div>
        {r.nf && r.nf !== '—' && (
          <div style={{ padding: '12px 18px', background: 'var(--brand-soft)', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, color: 'var(--brand-ink)', fontWeight: 600 }}>Vinculada: <span className="mono">{r.nf}</span></span>
            <button className="btn btn-danger sm" onClick={() => { patch({ nf: '—' }); pushToast({ msg: 'NF desvinculada', tone: 'warn' }); onClose(); }}>Desvincular</button>
          </div>
        )}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {(window.NOTAS || []).map(n => (
            <button key={n.id} onClick={() => { patch({ nf: n.numero }); pushToast({ msg: `NF ${n.numero} vinculada`, tone: 'ok', icon: 'doc' }); onClose(); }}
              style={{ width: '100%', textAlign: 'left', padding: '13px 18px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer', background: r.nf === n.numero ? 'var(--brand-soft)' : 'transparent', transition: 'background .12s var(--ease)' }}
              onMouseEnter={e => { if (r.nf !== n.numero) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (r.nf !== n.numero) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono">{n.numero}</span>
                    {r.nf === n.numero && <span className="badge st-liberado sm"><Icon name="check" size={10} />Vinculada</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{n.fornecedor} · {window.fmtDate(n.data)}</div>
                </div>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{window.fmtBRL(n.valor)}</span>
              </div>
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line-2)' }}>
          <button className="btn btn-ghost sm" onClick={() => { pushToast({ msg: 'Ir para cadastro de NFs', icon: 'doc' }); onClose(); }}><Icon name="plus" size={14} />Cadastrar nova NF</button>
        </div>
      </div>
    </div>
  );
}

/* ---- Quick action bar ---- */
function QuickActions({ r, patch, pushToast, onNFClick }) {
  const nfLinked = r.nf && r.nf !== '—';
  const btns = [
    { label: 'Cadastro EC', icon: 'clipboard', style: { background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink-2)' }, action: () => pushToast({ msg: 'Abrindo cadastro EC', icon: 'clipboard' }) },
    { label: 'Duplicar', icon: 'copy', style: { background: 'oklch(0.966 0.016 245)', borderColor: 'oklch(0.845 0.055 245)', color: 'oklch(0.46 0.105 245)' }, action: () => pushToast({ msg: `Duplicando ${r.protocolo}`, icon: 'copy' }) },
    { label: 'QR', icon: 'qr', style: {}, ghost: true, action: () => pushToast({ msg: 'QR de consulta pública', icon: 'qr' }) },
    { label: 'Etiqueta', icon: 'tag', style: {}, ghost: true, action: () => pushToast({ msg: 'Gerar etiqueta PDF', icon: 'download' }) },
    { label: 'PDF Termo', icon: 'doc', style: { background: 'var(--brand-soft)', borderColor: 'var(--brand-line)', color: 'var(--brand-ink)' }, action: () => pushToast({ msg: 'Abrindo PDF do Termo', icon: 'doc' }) },
    {
      label: nfLinked ? r.nf : 'Vincular NF',
      icon: 'doc',
      style: { background: 'oklch(0.966 0.042 83)', borderColor: 'oklch(0.82 0.09 80)', color: 'oklch(0.51 0.1 74)' },
      action: onNFClick
    },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 0' }}>
      {btns.map((b) => (
        <button key={b.label} onClick={b.action} className="focusable" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          height: 34, padding: '0 12px', borderRadius: 999, border: '1px solid var(--line)',
          fontFamily: "'Public Sans', sans-serif", fontSize: 12.5, fontWeight: 600,
          background: 'var(--surface)', color: 'var(--ink-2)', transition: 'all .14s var(--ease)',
          ...b.style,
        }}
          onMouseEnter={e => { if (!b.style.background) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { if (!b.style.background) e.currentTarget.style.background = 'var(--surface)'; }}>
          <Icon name={b.icon} size={13} />{b.label}
        </button>
      ))}
    </div>
  );
}

/* ---- Flow pills (4 steps: Documentos→Termo→Inspeção→Liberação) ---- */
function FlowPills({ r, activeTab, onPick }) {
  const docsOk = r.docs.filter(d => d.val === 'sim').length === 8 && r.parecerDocs === 'aprovado';
  const steps = [
    { key: 'documentos', label: 'Documentos', done: docsOk },
    { key: 'termo', label: 'Termo', done: !!r._termoAceito },
    { key: 'inspecao', label: 'Inspeção', done: r.insp.filter(d => d.val === 'conforme').length === 7 && !!r._signed },
    { key: 'ciclo', label: 'Liberação', done: ['LIBERADO', 'LIBERADO_COM_RESTRICAO', 'BLOQUEADO'].includes(r.status) },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', padding: '4px 0 10px' }}>
      {steps.map((s, i) => {
        const active = activeTab === s.key;
        return (
          <React.Fragment key={s.key}>
            <button onClick={() => onPick(s.key)} className="focusable" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              height: 30, padding: '0 12px', borderRadius: 999, border: '1px solid',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
              transition: 'all .14s var(--ease)',
              borderColor: s.done ? 'var(--brand-line)' : active ? 'var(--line)' : 'var(--line-2)',
              background: s.done ? 'var(--brand-soft)' : active ? 'var(--surface-2)' : 'transparent',
              color: s.done ? 'var(--brand-ink)' : active ? 'var(--ink-2)' : 'var(--faint)',
            }}>
              {s.done ? <Icon name="check" size={12} /> : <span style={{ width: 6, height: 6, borderRadius: 9, background: 'currentColor' }} />}
              {s.label}
            </button>
            {i < steps.length - 1 && <Icon name="chevR" size={13} style={{ color: 'var(--line)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---- Tab nav (6 tabs, scrollable) ---- */
const TABS = [
  { key: 'resumo',      label: 'Resumo',       icon: 'list' },
  { key: 'documentos',  label: 'Documentos',   icon: 'doc' },
  { key: 'termo',       label: 'Termo',        icon: 'shield' },
  { key: 'inspecao',    label: 'Inspeção',     icon: 'check' },
  { key: 'ciclo',       label: 'Ciclo de vida',icon: 'package' },
  { key: 'fotos',       label: 'Fotos',        icon: 'camera', badge: true },
];

function TabNav({ active, onPick, photoCount }) {
  return (
    <div style={{
      position: 'sticky', top: -1, zIndex: 20, margin: '0 -4px',
      background: 'color-mix(in oklch, var(--bg) 92%, transparent)', backdropFilter: 'blur(10px)',
      borderBottom: '2px solid var(--line-2)', paddingBottom: 0,
    }}>
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 4px' }}>
        {TABS.map(t => {
          const on = active === t.key;
          return (
            <button key={t.key} onClick={() => onPick(t.key)} className="focusable" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 14px', flex: 'none',
              border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: "'Public Sans', sans-serif",
              fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? 'var(--brand-ink)' : 'var(--muted)',
              borderBottom: on ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -2, transition: 'color .14s var(--ease)', whiteSpace: 'nowrap',
            }}>
              <Icon name={t.icon} size={15} stroke={on ? 2 : 1.6} />
              {t.label}
              {t.badge && photoCount > 0 && (
                <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, background: on ? 'var(--brand)' : 'var(--surface-2)', color: on ? 'white' : 'var(--muted)', border: on ? 'none' : '1px solid var(--line)' }}>
                  {photoCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- DetailScreen (main) ---- */
function DetailScreen({ r, patch, onBack, pushToast, isMobile }) {
  const initTab = new URLSearchParams(location.search).get('tab') || 'resumo';
  const [activeTab, setActiveTab] = useDSS(initTab);
  const [showNF, setShowNF] = useDSS(false);

  const photoCount = r.photos.filter(p => p.filled).length;
  const tab = activeTab;

  const tabContent = {
    resumo:     <window.TabResumo r={r} patch={patch} pushToast={pushToast} onOpenTab={setActiveTab} />,
    documentos: <window.StageDocumentos r={r} patch={patch} pushToast={pushToast} />,
    termo:      <window.TabTermo r={r} patch={patch} pushToast={pushToast} />,
    inspecao:   <window.StageInspecao r={r} patch={patch} pushToast={pushToast} />,
    ciclo:      <window.TabCicloVida r={r} patch={patch} pushToast={pushToast} />,
    fotos:      <window.TabFotos r={r} patch={patch} pushToast={pushToast} />,
  };

  const tabIdx = TABS.findIndex(t => t.key === tab);
  const nextTab = TABS[tabIdx + 1];
  const advanceLabel = { documentos: 'Avançar para Termo', termo: 'Avançar para Inspeção', inspecao: 'Concluir inspeção', ciclo: 'Registrar liberação' }[tab];

  return (
    <div>
      <button onClick={onBack} className="btn btn-quiet sm" style={{ marginBottom: 12, paddingLeft: 8 }}>
        <Icon name="chevL" size={16} />Equipamentos
      </button>

      {/* Instrument header */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 0 148px', minHeight: 116, borderRight: isMobile ? 'none' : '1px solid var(--line-2)', borderBottom: isMobile ? '1px solid var(--line-2)' : 'none' }}>
            <div className={`fill-${window.STATUS[r.status].cls}`} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 }} />
            <Placeholder label={r.equip.marca} h={isMobile ? 100 : 116} filled />
          </div>
          <div style={{ flex: '1 1 auto', padding: '14px 16px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--faint)' }}>{r.protocolo}</span>
                  <OriginSeal origem={r.solicitante.origem} />
                  {r.urgente && <span className="badge st-urgencia sm"><Icon name="bolt" size={11} />Urgente</span>}
                </div>
                <h1 className="display" style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{r.equip.nome}</h1>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{r.equip.marca} · {r.equip.modelo} · <span className="mono">{r.equip.serie}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                <StatusBadge status={r.status} size="lg" />
                <ClassTag c={r.classe} withDesc />
              </div>
            </div>
          </div>
        </div>
        {/* Quick actions */}
        <div style={{ padding: '4px 16px 10px', borderTop: '1px solid var(--line-2)' }}>
          <QuickActions r={r} patch={patch} pushToast={pushToast} onNFClick={() => setShowNF(true)} />
        </div>
      </div>

      {/* Flow pills */}
      <FlowPills r={r} activeTab={activeTab} onPick={setActiveTab} />

      {/* Tab nav (sticky) */}
      <TabNav active={activeTab} onPick={setActiveTab} photoCount={photoCount} />

      {/* Tab content */}
      <div className="rise" key={activeTab} style={{ paddingTop: 18, paddingBottom: 100 }}>
        {tabContent[activeTab]}
      </div>

      {/* Sticky footer: tab-specific action */}
      {advanceLabel && (
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 20,
          background: 'color-mix(in oklch, var(--surface) 92%, transparent)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--line)', padding: '11px 0 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        }}>
          {tabIdx > 0 && <button className="btn btn-ghost" onClick={() => setActiveTab(TABS[tabIdx - 1].key)}><Icon name="chevL" size={16} />{TABS[tabIdx - 1].label}</button>}
          {nextTab && <button className="btn btn-primary" onClick={() => { setActiveTab(nextTab.key); pushToast({ msg: advanceLabel, icon: 'arrowR' }); }}>
            {advanceLabel}<Icon name="arrowR" size={16} />
          </button>}
        </div>
      )}

      {showNF && <NFModal r={r} patch={patch} pushToast={pushToast} onClose={() => setShowNF(false)} />}
    </div>
  );
}

Object.assign(window, { DetailScreen, QuickActions, FlowPills, TabNav, NFModal });
