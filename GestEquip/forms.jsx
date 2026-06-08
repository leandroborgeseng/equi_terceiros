/* ============================================================
   GestEq — page + form primitives (exported to window)
   ============================================================ */
const { useState: useStateF } = React;

function PageHeader({ eyebrow = 'Engenharia Clínica', title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        <h1 className="display" style={{ margin: 0, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

const inputBase = {
  height: 40, width: '100%', padding: '0 12px', fontSize: 14, color: 'var(--ink)',
  border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface)',
  fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s var(--ease), box-shadow .15s var(--ease)',
};
function onFocus(e) { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }
function onBlur(e) { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }

function Input({ value, onChange, placeholder, mono, type = 'text', ...rest }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onFocus={onFocus} onBlur={onBlur} className={mono ? 'mono' : ''}
    style={{ ...inputBase, ...(mono ? { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 } : {}) }} {...rest} />;
}
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    onFocus={onFocus} onBlur={onBlur} style={{ ...inputBase, height: 'auto', padding: 12, resize: 'vertical', lineHeight: 1.45 }} />;
}
function Select({ value, onChange, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        style={{ ...inputBase, appearance: 'none', paddingRight: 34, cursor: 'pointer' }}>
        {children}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--faint)' }}>
        <Icon name="chevD" size={15} />
      </span>
    </div>
  );
}

function FormField({ label, hint, required, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'auto', minWidth: 0 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
        {required && <span style={{ color: 'var(--brand-ink)', fontSize: 12 }}>*</span>}
        {hint && <span className="eyebrow" style={{ marginLeft: 'auto' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* card with a header strip used as a form panel */
function Panel({ title, eyebrow, right, children, pad = 20 }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: `14px ${pad}px`, borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ minWidth: 0 }}>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 2 }}>{eyebrow}</div>}
            {title && <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

/* search box */
function Search({ value, onChange, placeholder, width = 260 }) {
  return (
    <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: width }}>
      <Icon name="search" size={16} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)' }} />
      <input value={value} onChange={onChange} placeholder={placeholder} onFocus={onFocus} onBlur={onBlur}
        style={{ ...inputBase, paddingLeft: 34, fontSize: 13 }} />
    </div>
  );
}

/* small filter pill row (single-select with "Todos") */
function Pills({ options, value, onChange, allLabel = 'Todos' }) {
  const all = [{ v: null, label: allLabel }, ...options];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {all.map(o => {
        const on = value === o.v;
        return (
          <button key={String(o.v)} onClick={() => onChange(o.v)} className="focusable" style={{
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '6px 12px', minHeight: 34,
            borderRadius: 999, border: '1px solid', transition: 'all .14s var(--ease)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            borderColor: on ? 'var(--brand)' : 'var(--line)', background: on ? 'var(--brand-soft)' : 'var(--surface)',
            color: on ? 'var(--brand-ink)' : 'var(--muted)',
          }}>
            {o.dot && <span className={`fill-${o.dot}`} style={{ width: 7, height: 7, borderRadius: 9 }} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* KPI stat tile */
function Stat({ label, value, unit, delta, tone = 'ink', icon, hint }) {
  const toneVar = { ink: 'var(--ink)', brand: 'var(--brand-ink)', warn: 'var(--pendente-ink)', bad: 'var(--bloqueado-ink)', blue: 'var(--inspecao-ink)' }[tone];
  return (
    <div className="card" style={{ padding: '15px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow">{label}</span>
        {icon && <span style={{ color: 'var(--faint)' }}><Icon name={icon} size={16} /></span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="display mono" style={{ fontSize: 30, fontWeight: 600, color: toneVar, lineHeight: 1 }}>{value}</span>
        {unit && <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{unit}</span>}
      </div>
      {(delta || hint) && (
        <div style={{ marginTop: 8, fontSize: 12, color: delta ? (delta > 0 ? 'var(--liberado-ink)' : 'var(--bloqueado-ink)') : 'var(--faint)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {delta != null && <span className="mono">{delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%</span>}
          {hint && <span style={{ color: 'var(--faint)' }}>{hint}</span>}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PageHeader, Input, Textarea, Select, FormField, Panel, Search, Pills, Stat });
