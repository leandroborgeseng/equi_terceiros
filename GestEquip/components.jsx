/* ============================================================
   GestEq — shared components (exported to window)
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------------- Icons (simple stroke set) ---------------- */
const I = {
  queue:   'M4 6h16M4 12h10M4 18h7',
  cube:    'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z M12 3v18 M4 7.5l8 4.5 8-4.5',
  truck:   'M3 7h11v8H3z M14 10h4l3 3v2h-7 M6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3 M17.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3',
  doc:     'M7 3h7l4 4v14H7z M14 3v4h4',
  bell:    'M6 16V10a6 6 0 1112 0v6l2 2H4l2-2z M10 20a2 2 0 004 0',
  chart:   'M4 20V4 M4 20h16 M8 16v-5 M13 16V8 M18 16v-8',
  key:     'M14 7a3 3 0 11-3 3 M11 10l-7 7v3h3l1-1h2v-2h2l1.5-1.5',
  gear:    'M12 9a3 3 0 100 6 3 3 0 000-6z M19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1L14.5 2h-4l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6a7 7 0 00.1-1z',
  check:   'M5 12.5l4.5 4.5L19 7',
  x:       'M6 6l12 12M18 6L6 18',
  minus:   'M5 12h14',
  plus:    'M12 5v14M5 12h14',
  chevR:   'M9 6l6 6-6 6',
  chevL:   'M15 6l-6 6 6 6',
  chevD:   'M6 9l6 6 6-6',
  arrowR:  'M5 12h14M13 6l6 6-6 6',
  search:  'M11 4a7 7 0 105 12 7 7 0 00-5-12z M16.5 16.5L21 21',
  camera:  'M4 8h3l1.5-2h7L17 8h3v11H4z M12 16a3 3 0 100-6 3 3 0 000 6z',
  paperclip:'M8 12l6-6a3 3 0 014 4l-7 7a4.5 4.5 0 11-6.5-6.5L11 4',
  bolt:    'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  clock:   'M12 7v5l3 2 M12 3a9 9 0 100 18 9 9 0 000-18z',
  warn:    'M12 4l9 16H3L12 4z M12 10v4 M12 17.5v.5',
  user:    'M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0',
  signal:  'M3 17l4-1 3 2 4-8 3 4 4-1',
  download:'M12 4v11 M8 11l4 4 4-4 M5 20h14',
  print:   'M7 9V3h10v6 M7 17H4v-7h16v7h-3 M7 14h10v6H7z',
  pin:     'M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  flask:   'M9 3v6l-4.5 8a2 2 0 001.8 3h11.4a2 2 0 001.8-3L15 9V3 M8 3h8 M7.5 15h9',
  shield:  'M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4',
  grid:    'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  list:    'M4 6h16M4 12h16M4 18h16',
  pen:     'M4 20l1-4L16 5l3 3L8 19l-4 1z',
  filter:  'M4 5h16l-6 7v6l-4 2v-8L4 5z',
  exit:    'M14 4h5v16h-5 M3 12h11 M10 8l-4 4 4 4',
  dots:    'M5 12h.01M12 12h.01M19 12h.01',
  eye:     'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 100-6 3 3 0 000 6z',
  copy:    'M8 4v12h12V4H8z M4 8v12h12',
  qr:      'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M19 14v3 M14 19h3 M19 19v3',
  tag:     'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  clipboard:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 9 5a2 2 0 00-2-2h-2a2 2 0 00-2 2 M9 12h6 M9 16h4',
  package: 'M21 8l-9-5-9 5v8l9 5 9-5V8z M12 3v18 M3.3 7l8.7 5 8.7-5',
  refresh: 'M3 12a9 9 0 104-7.5 M3 4v4h4',
};
function Icon({ name, size = 18, stroke = 1.7, className = '', style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {(I[name] || '').split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
    </svg>
  );
}

/* ---------------- StatusBadge ---------------- */
function StatusBadge({ status, size = '', dot = true }) {
  const s = window.STATUS[status];
  if (!s) return null;
  return (
    <span className={`badge st-${s.cls} ${size}`}>
      {dot && <span className="dot" />}{s.label}
    </span>
  );
}

/* ---------------- Class tag ---------------- */
function ClassTag({ c, withDesc = false }) {
  const info = window.CLASSES[c];
  if (!info) return null;
  return (
    <span title={info.desc} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
      color: 'var(--ink-2)', background: 'var(--surface-2)', border: '1px solid var(--line)',
      borderRadius: 6, padding: '2px 8px',
    }}>
      <b className="display" style={{ fontSize: 12 }}>{info.label}</b>
      {withDesc && <span style={{ color: 'var(--faint)', fontWeight: 500 }}>{info.tone}</span>}
    </span>
  );
}

/* ---------------- Origin seal (público / EC / formalização) ---------------- */
function OriginSeal({ origem }) {
  const map = {
    publico: { t: 'Público', d: 'Solicitação sem login' },
    chave:   { t: 'Convite',  d: 'Validado por chave de acesso' },
    ec:      { t: 'Cadastro EC', d: 'Originado pela Engenharia Clínica' },
    formal:  { t: 'Formalização', d: 'Já no parque tecnológico' },
  };
  const m = map[origem]; if (!m) return null;
  return (
    <span title={m.d} className="eyebrow" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)',
      border: '1px dashed var(--line)', borderRadius: 5, padding: '2px 7px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 9, background: 'var(--faint)' }} />{m.t}
    </span>
  );
}

/* ---------------- Striped image placeholder ---------------- */
function Placeholder({ label, h = 120, filled = false, quality, onClick, active }) {
  return (
    <button onClick={onClick} className="focusable" style={{
      position: 'relative', height: h, width: '100%', borderRadius: 'var(--r)',
      border: filled ? '1px solid var(--line)' : '1px dashed color-mix(in oklch, var(--faint) 55%, transparent)',
      background: filled
        ? 'repeating-linear-gradient(135deg, oklch(0.948 0.004 255) 0 7px, oklch(0.9 0.006 255) 7px 14px)'
        : 'var(--surface-2)',
      cursor: onClick ? 'pointer' : 'default', overflow: 'hidden', display: 'block', padding: 0,
      outline: active ? '2px solid var(--ink)' : 'none', outlineOffset: 2,
    }}>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 5,
      }}>
        {!filled && <Icon name="camera" size={18} style={{ color: 'var(--faint)' }} />}
        {filled && <Icon name="cube" size={20} style={{ color: 'var(--faint)', opacity: 0.7 }} />}
        <span className="eyebrow" style={{ color: filled ? 'var(--ink-2)' : 'var(--faint)', background: filled ? 'oklch(1 0 0 / 0.7)' : 'transparent', padding: filled ? '1px 6px' : 0, borderRadius: 4 }}>{label}</span>
      </span>
      {filled && quality && (
        <span className="eyebrow" style={{
          position: 'absolute', top: 6, right: 6, padding: '1px 6px', borderRadius: 5,
          background: quality === 'boa' ? 'var(--liberado-soft)' : 'var(--pendente-soft)',
          color: quality === 'boa' ? 'var(--liberado-ink)' : 'var(--pendente-ink)',
          border: `1px solid color-mix(in oklch, ${quality === 'boa' ? 'var(--liberado)' : 'var(--pendente)'} 30%, transparent)`,
        }}>{quality === 'boa' ? '✓ Nítida' : '! Baixa'}</span>
      )}
    </button>
  );
}

/* ---------------- Data field (label + mono value) ---------------- */
function Field({ label, children, mono = false, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'auto', minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 3 }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: mono ? 13 : 14, fontWeight: 500, color: 'var(--ink)', overflowWrap: 'anywhere' }}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Segmented tri-state (Sim/Não/N/A or Conforme/NC/N/A) ---------------- */
function TriState({ value, onChange, options }) {
  return (
    <div role="radiogroup" style={{ display: 'inline-flex', gap: 4 }}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button key={o.v} role="radio" aria-checked={on} onClick={() => onChange(on ? null : o.v)}
            className="focusable" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
              padding: '5px 10px', borderRadius: 7, minHeight: 30,
              border: '1px solid', transition: 'all .14s var(--ease)',
              borderColor: on ? `color-mix(in oklch, ${o.color} 50%, transparent)` : 'var(--line)',
              background: on ? o.soft : 'var(--surface)',
              color: on ? o.ink : 'var(--muted)',
            }}>
            {o.icon && <Icon name={o.icon} size={13} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Progress meter ---------------- */
function Meter({ value, total, tone = 'var(--ink)', h = 5 }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ height: h, borderRadius: 99, background: 'var(--line-2)', overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: tone, borderRadius: 99, transition: 'width .5s var(--ease)' }} />
    </div>
  );
}

/* ---------------- Toast ---------------- */
function Toast({ toast }) {
  if (!toast) return null;
  const tone = toast.tone || 'ink';
  const colors = {
    ink: ['var(--ink)', 'white'],
    ok: ['var(--liberado)', 'white'],
    warn: ['var(--pendente)', 'white'],
    bad: ['var(--bloqueado)', 'white'],
  }[tone];
  return (
    <div className="toast-in" style={{
      position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, background: colors[0], color: colors[1],
      padding: '11px 18px', borderRadius: 999, boxShadow: 'var(--shadow-lg)',
      display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, maxWidth: '90vw',
    }}>
      <Icon name={toast.icon || 'check'} size={17} />{toast.msg}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
function Empty({ icon = 'queue', title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--faint)' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
        display: 'grid', placeItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--faint)',
      }}><Icon name={icon} size={24} /></div>
      <div className="display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, marginTop: 4, color: 'var(--faint)' }}>{sub}</div>}
    </div>
  );
}

const TRI_DOCS = [
  { v: 'sim', label: 'Sim',  icon: 'check', color: 'var(--liberado)', soft: 'var(--liberado-soft)', ink: 'var(--liberado-ink)' },
  { v: 'nao', label: 'Não',  icon: 'x',     color: 'var(--bloqueado)', soft: 'var(--bloqueado-soft)', ink: 'var(--bloqueado-ink)' },
  { v: 'na',  label: 'N/A',  icon: 'minus', color: 'var(--faint)',     soft: 'var(--surface-2)',      ink: 'var(--muted)' },
];
const TRI_INSP = [
  { v: 'conforme', label: 'Conforme', icon: 'check', color: 'var(--liberado)', soft: 'var(--liberado-soft)', ink: 'var(--liberado-ink)' },
  { v: 'nc',       label: 'N/C',      icon: 'x',     color: 'var(--bloqueado)', soft: 'var(--bloqueado-soft)', ink: 'var(--bloqueado-ink)' },
  { v: 'na',       label: 'N/A',      icon: 'minus', color: 'var(--faint)',     soft: 'var(--surface-2)',      ink: 'var(--muted)' },
];

function relTime(iso) {
  const d = new Date(iso), now = new Date('2026-06-07T10:00:00');
  const h = Math.round((now - d) / 36e5);
  if (h < 1) return 'agora há pouco';
  if (h < 24) return `há ${h}h`;
  const dd = Math.round(h / 24);
  return `há ${dd}d`;
}
function fmtDate(iso) {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/* ---------------- FilePreviewGrid ---------------- */
function FilePreviewGrid({ items, onOpen }) {
  // items: [{id, label, filled, type:'photo'|'pdf'|'nf', quality}]
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '18px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
        <Icon name="camera" size={20} style={{ marginBottom: 6 }} />
        <div className="eyebrow">Nenhum arquivo cadastrado</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 9 }}>
      {items.map((it, i) => (
        <button key={it.id || i} onClick={() => onOpen && onOpen(i)} className="focusable" style={{
          cursor: onOpen ? 'pointer' : 'default', padding: 0, border: 'none', background: 'none', textAlign: 'left',
        }}>
          <div style={{
            height: 72, borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 5, position: 'relative',
            border: it.filled ? '1px solid var(--line)' : '1px dashed color-mix(in oklch, var(--faint) 45%, transparent)',
            background: it.type === 'pdf'
              ? 'oklch(0.965 0.04 30)'
              : it.filled
                ? 'repeating-linear-gradient(135deg, oklch(0.948 0.004 255) 0 7px, oklch(0.9 0.006 255) 7px 14px)'
                : 'var(--surface-2)',
          }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Icon name={it.type === 'pdf' ? 'doc' : it.type === 'nf' ? 'doc' : 'camera'} size={18}
                style={{ color: it.type === 'pdf' ? 'var(--bloqueado-ink)' : it.filled ? 'var(--faint)' : 'var(--faint)' }} />
              {it.type === 'pdf' && <span className="eyebrow" style={{ color: 'var(--bloqueado-ink)', fontSize: 9 }}>PDF</span>}
            </div>
            {it.filled && it.quality && (
              <span className="eyebrow" style={{
                position: 'absolute', top: 4, right: 4, fontSize: 8.5, padding: '1px 5px', borderRadius: 4,
                background: it.quality === 'boa' ? 'var(--liberado-soft)' : 'var(--pendente-soft)',
                color: it.quality === 'boa' ? 'var(--liberado-ink)' : 'var(--pendente-ink)',
              }}>{it.quality === 'boa' ? '✓' : '!'}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{it.label}</div>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBadge, ClassTag, OriginSeal, Placeholder, Field, TriState, Meter, Toast, Empty,
  TRI_DOCS, TRI_INSP, relTime, fmtDate, FilePreviewGrid,
});
