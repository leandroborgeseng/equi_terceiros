/* ============================================================
   GestEq — App shell: nav, routing, responsive frame
   ============================================================ */
const { useState: useStateA, useEffect: useEffectA, useCallback: useCB } = React;

function useMedia(q) {
  const [m, setM] = useStateA(() => window.matchMedia(q).matches);
  useEffectA(() => {
    const mq = window.matchMedia(q);
    const fn = e => setM(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [q]);
  return m;
}

const NAV = [
  { id: 'fila',        label: 'Fila de Homologação', icon: 'queue',  primary: true },
  { id: 'equipamentos', label: 'Equipamentos',       icon: 'cube',   primary: true },
  { id: 'fornecedores', label: 'Fornecedores',       icon: 'truck' },
  { id: 'notas',       label: 'Notas Fiscais',       icon: 'doc' },
  { id: 'pendencias',  label: 'Pendências',          icon: 'bell',   primary: true, badge: true },
  { id: 'indicadores', label: 'Indicadores',         icon: 'chart',  primary: true },
  { id: 'chaves',      label: 'Chaves de acesso',    icon: 'key' },
  { id: 'config',      label: 'Configurações',       icon: 'gear' },
];

function Logo({ size = 34 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="display" style={{
        width: size, height: size, borderRadius: 9, background: 'var(--brand)', color: 'white',
        display: 'grid', placeItems: 'center', fontSize: size * 0.42, fontWeight: 700, letterSpacing: '-0.03em',
        boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.18)', position: 'relative', flex: 'none',
      }}>
        GE
        <span style={{ position: 'absolute', right: 5, bottom: 5, width: 5, height: 5, borderRadius: 9, background: 'var(--citrus)' }} />
      </div>
      <div style={{ lineHeight: 1 }}>
        <div className="display" style={{ fontSize: size * 0.5, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>GestEq</div>
        <div className="eyebrow" style={{ fontSize: 8.5, marginTop: 2 }}>Eng. Clínica</div>
      </div>
    </div>
  );
}

function Sidebar({ route, go, pendCount }) {
  return (
    <aside style={{
      width: 248, flex: 'none', borderRight: '1px solid var(--line)', background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '20px 18px 14px' }}><Logo /></div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        <div className="eyebrow" style={{ padding: '8px 10px 6px' }}>Núcleo EC</div>
        {NAV.map(n => {
          const on = route === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} className="focusable" style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', marginBottom: 2,
              borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: on ? 'var(--brand)' : 'transparent', color: on ? 'white' : 'var(--ink-2)',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: on ? 600 : 500, transition: 'background .14s var(--ease)',
            }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
              <Icon name={n.icon} size={18} style={{ opacity: on ? 1 : 0.7 }} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge && pendCount > 0 && (
                <span className="mono" style={{
                  fontSize: 10.5, fontWeight: 600, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 5,
                  display: 'grid', placeItems: 'center',
                  background: on ? 'oklch(1 0 0 / 0.16)' : 'var(--pendente-soft)', color: on ? 'white' : 'var(--pendente-ink)',
                }}>{pendCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
          <div className="display" style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>NC</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Núbia Costa</div>
            <div className="eyebrow" style={{ fontSize: 9 }}>Engenharia Clínica</div>
          </div>
          <button className="btn btn-quiet sm" style={{ padding: 6 }} title="Sair"><Icon name="exit" size={16} /></button>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ route, go, pendCount }) {
  const items = NAV.filter(n => n.primary);
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, background: 'color-mix(in oklch, var(--surface) 92%, transparent)',
      backdropFilter: 'blur(12px)', borderTop: '1px solid var(--line)', display: 'flex',
      padding: '6px 6px calc(6px + env(safe-area-inset-bottom, 0px))',
    }}>
      {items.map(n => {
        const on = route === n.id;
        return (
          <button key={n.id} onClick={() => go(n.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 4px',
            border: 'none', background: 'transparent', cursor: 'pointer', color: on ? 'var(--brand)' : 'var(--faint)',
            position: 'relative', minHeight: 52,
          }}>
            <span style={{ position: 'relative' }}>
              <Icon name={n.icon} size={21} stroke={on ? 2 : 1.7} />
              {n.badge && pendCount > 0 && <span style={{ position: 'absolute', top: -3, right: -6, width: 7, height: 7, borderRadius: 9, background: 'var(--pendente)', border: '1.5px solid var(--surface)' }} />}
            </span>
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: '-0.01em' }}>{n.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

function PlaceholderScreen({ nav }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Engenharia Clínica</div>
        <h1 className="display" style={{ margin: 0, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em' }}>{nav.label}</h1>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <Empty icon={nav.icon} title="Tela seguinte deste redesign"
          sub="Mesmo sistema visual — cabeçalho de página, cards hairline, badges de status e formulários padronizados. Posso construí-la em seguida." />
      </div>
    </div>
  );
}

function App() {
  const wide = useMedia('(max-width: 880px)');
  const isMobile = wide || new URLSearchParams(location.search).get('m') === '1';
  const [requests, setRequests] = useStateA(() => window.REQUESTS.map(r => ({ ...r, _signed: ['LIBERADO', 'LIBERADO_COM_RESTRICAO'].includes(r.status) })));
  const [route, setRoute] = useStateA('fila');
  const [openId, setOpenId] = useStateA(new URLSearchParams(location.search).get('open') || null);
  const [toast, setToast] = useStateA(null);

  const pushToast = useCB((t) => {
    setToast(t);
    clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffectA(() => {
    const s = new URLSearchParams(location.search).get('scroll');
    if (s) { const m = document.querySelector('main'); if (m) requestAnimationFrame(() => { m.scrollTop = +s; }); }
  }, []);

  const patchRequest = useCB((id, patch) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);
  const setStatus = useCB((id, status) => patchRequest(id, { status }), [patchRequest]);

  const go = (r) => { setOpenId(null); setRoute(r); };
  const pendCount = requests.filter(r => r.vencido || r.status === 'PENDENTE_DOCUMENTOS' || r.status === 'FLUXO_URGENCIA').length;
  const openReq = openId ? requests.find(r => r.id === openId) : null;

  const content = openReq ? (
    <DetailScreen r={openReq} patch={(p) => patchRequest(openReq.id, p)} onBack={() => setOpenId(null)} pushToast={pushToast} isMobile={isMobile} />
  ) : route === 'fila' ? (
    <Queue requests={requests} onOpen={setOpenId} setStatus={setStatus} pushToast={pushToast} isMobile={isMobile} />
  ) : route === 'equipamentos' ? (
    <Equipamentos requests={requests} onOpen={setOpenId} pushToast={pushToast} isMobile={isMobile} />
  ) : route === 'pendencias' ? (
    <Pendencias requests={requests} onOpen={setOpenId} />
  ) : route === 'fornecedores' ? (
    <Fornecedores pushToast={pushToast} isMobile={isMobile} />
  ) : route === 'notas' ? (
    <NotasFiscais pushToast={pushToast} isMobile={isMobile} />
  ) : route === 'indicadores' ? (
    <Indicadores requests={requests} pushToast={pushToast} />
  ) : route === 'chaves' ? (
    <Chaves pushToast={pushToast} />
  ) : route === 'config' ? (
    <Configuracoes pushToast={pushToast} go={go} />
  ) : (
    <PlaceholderScreen nav={NAV.find(n => n.id === route)} />
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {!isMobile && <Sidebar route={route} go={go} pendCount={pendCount} />}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Topbar */}
        <header style={{
          flex: 'none', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: isMobile ? '0 16px' : '0 28px', borderBottom: '1px solid var(--line)',
          background: 'color-mix(in oklch, var(--surface) 86%, transparent)', backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          {isMobile ? <Logo size={30} /> : (
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>GestEq</span><Icon name="chevR" size={12} /><span style={{ color: 'var(--ink-2)' }}>{openReq ? 'Detalhe do equipamento' : NAV.find(n => n.id === route)?.label}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge st-liberado sm" title="Fila offline sincronizada"><Icon name="signal" size={11} />Sincronizado</span>
            {!isMobile && ['fila','equipamentos'].includes(route) && <button className="btn btn-primary sm" onClick={() => pushToast && pushToast({ msg: 'Novo equipamento', icon: 'plus' })}><Icon name="plus" size={15} />Novo equipamento</button>}
            {isMobile && <button className="btn btn-ghost sm" style={{ padding: 7 }}><Icon name="bell" size={17} /></button>}
          </div>
        </header>

        {/* Page body */}
        <main style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          padding: isMobile ? '18px 16px calc(76px + env(safe-area-inset-bottom,0px))' : '24px 28px 20px',
        }}>
          <div style={{ minHeight: '100%', maxWidth: 1320, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            {content}
          </div>
        </main>
      </div>

      {isMobile && !openReq && <BottomNav route={route} go={go} pendCount={pendCount} />}
      <Toast toast={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
