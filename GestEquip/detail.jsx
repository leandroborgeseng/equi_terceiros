/* ============================================================
   GestEq — Detalhe da Solicitação (stepper: Cadastro → Documentos
   → Inspeção → Liberação). The densest screen, decomposed.
   ============================================================ */
const { useState: useStateD, useRef: useRefD, useEffect: useEffectD } = React;

/* ---------- Checklist row ---------- */
function CheckRow({ item, tri, onChange, onAttach }) {
  const [open, setOpen] = useStateD(false);
  const done = item.val && item.val !== 'nao';
  return (
    <div style={{ borderBottom: '1px solid var(--line-2)', padding: '12px 0' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 7 }}>
            {item.label}
            {item.hasFile && <span title="Comprovante anexado" style={{ color: 'var(--liberado-ink)', display: 'inline-flex' }}><Icon name="paperclip" size={13} /></span>}
          </div>
          {item.hint && <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{item.hint}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TriState value={item.val} onChange={onChange} options={tri} />
          <button className="btn btn-ghost sm" onClick={onAttach} title="Anexar comprovante" style={{ padding: '0 10px' }}>
            <Icon name="paperclip" size={14} />
          </button>
          <button className="btn btn-quiet sm" onClick={() => setOpen(o => !o)} style={{ padding: '0 8px' }}>
            <Icon name={open ? 'chevD' : 'plus'} size={14} />
          </button>
        </div>
      </div>
      {(open || item.obs) && (
        <input value={item.obs} onChange={e => onChange(item.val, e.target.value)} placeholder="Observação…"
          className="focusable" style={{
            marginTop: 9, width: '100%', height: 34, padding: '0 11px', fontSize: 13,
            border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--ink)',
          }} />
      )}
    </div>
  );
}

/* ---------- Section card ---------- */
function Section({ title, eyebrow, right, children, pad = 18 }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: `14px ${pad}px`, borderBottom: '1px solid var(--line-2)' }}>
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eyebrow}</div>}
          <div className="display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        </div>
        {right}
      </div>
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

/* ---------- Parecer selector (final verdict) ---------- */
function Verdict({ value, onChange, options }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 9 }}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} className="focusable" style={{
            cursor: 'pointer', textAlign: 'left', padding: '13px 14px', borderRadius: 'var(--r)', minHeight: 48,
            border: '1.5px solid', transition: 'all .15s var(--ease)',
            borderColor: on ? `color-mix(in oklch, ${o.color} 60%, transparent)` : 'var(--line)',
            background: on ? o.soft : 'var(--surface)',
            boxShadow: on ? `inset 0 0 0 1px color-mix(in oklch, ${o.color} 30%, transparent)` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: o.color }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: on ? o.ink : 'var(--ink)' }}>{o.label}</span>
            </div>
            {o.desc && <div style={{ fontSize: 11.5, color: on ? o.ink : 'var(--faint)', marginTop: 4, paddingLeft: 17 }}>{o.desc}</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Electrical safety instrument readout ---------- */
function SafetyReadout({ value, threshold, unit, label, fail }) {
  const pct = Math.min(100, (value / (threshold * 1.6)) * 100);
  const danger = fail || value > threshold;
  const tone = danger ? 'var(--bloqueado)' : 'var(--liberado)';
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '13px 14px', background: 'var(--surface-2)' }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 9 }}>
        <span className="mono display" style={{ fontSize: 26, fontWeight: 600, color: tone, lineHeight: 1 }}>{value}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{unit}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', marginLeft: 'auto' }}>limite {threshold}{unit}</span>
      </div>
      <div style={{ position: 'relative', height: 7, borderRadius: 99, background: 'var(--line-2)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: pct + '%', background: tone, borderRadius: 99, transition: 'width .6s var(--ease)' }} />
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${(threshold / (threshold * 1.6)) * 100}%`, width: 2, background: 'var(--ink-2)', opacity: 0.5 }} />
      </div>
      <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: danger ? 'var(--bloqueado-ink)' : 'var(--liberado-ink)', marginTop: 7 }}>
        {danger ? '✕ Fora do limite' : '✓ Dentro do limite'}
      </div>
    </div>
  );
}

/* ---------- Signature pad ---------- */
function SignaturePad({ onSign, signed }) {
  const ref = useRefD(null), drawing = useRefD(false), has = useRefD(false);
  useEffectD(() => {
    const c = ref.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr;
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#16191d'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);
  const ctxRef = useRefD(null);
  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; const p = pos(e); ctxRef.current.beginPath(); ctxRef.current.moveTo(p.x, p.y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const p = pos(e); ctxRef.current.lineTo(p.x, p.y); ctxRef.current.stroke(); has.current = true; };
  const end = () => { if (drawing.current && has.current && !signed) onSign(); drawing.current = false; };
  const clear = () => { const c = ref.current; ctxRef.current.clearRect(0, 0, c.width, c.height); has.current = false; onSign(false); };
  return (
    <div>
      <div style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface)', overflow: 'hidden' }}>
        <canvas ref={ref} style={{ width: '100%', height: 120, display: 'block', touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 26, borderBottom: '1px dashed var(--line)', pointerEvents: 'none' }} />
        <span className="eyebrow" style={{ position: 'absolute', left: 14, bottom: 8, pointerEvents: 'none' }}>Assinatura do responsável técnico</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span className="mono" style={{ fontSize: 11.5, color: signed ? 'var(--liberado-ink)' : 'var(--faint)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {signed ? <><Icon name="check" size={13} />Assinado · Núbia Costa · CREA 5060...</> : 'Assine no campo acima'}
        </span>
        <button className="btn btn-quiet sm" onClick={clear}>Limpar</button>
      </div>
    </div>
  );
}

/* ====================================================================
   STAGE PANELS
   ==================================================================== */

function StageCadastro({ r }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Section title="Solicitante" eyebrow="Anexo I · identificação"
        right={<OriginSeal origem={r.solicitante.origem} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px 20px' }}>
          <Field label="Nome">{r.solicitante.nome}</Field>
          <Field label="Registro" mono>{r.solicitante.crm}</Field>
          <Field label="Vínculo">{r.solicitante.tipo}</Field>
          <Field label="Setor / destino"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={13} style={{ color: 'var(--faint)' }} />{r.setor}</span></Field>
          <Field label="Procedimento" span={2}>{r.proc}</Field>
        </div>
      </Section>
      <Section title="Equipamento & ingresso" eyebrow="Dados do bem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px 20px' }}>
          <Field label="Equipamento" span={2}>{r.equip.nome}</Field>
          <Field label="Marca / modelo">{r.equip.marca} · {r.equip.modelo}</Field>
          <Field label="Nº de série" mono>{r.equip.serie}</Field>
          <Field label="Classe"><ClassTag c={r.classe} withDesc /></Field>
          <Field label="Tipo de ingresso">{r.ingresso}</Field>
          <Field label="Proprietário / fornecedor">{r.fornecedor}</Field>
          <Field label="Nota fiscal" mono>{r.nf}</Field>
          <Field label="OS interna" mono>{r.os}</Field>
        </div>
        {r.classe === 'D' && (
          <div style={{ marginTop: 16, padding: '11px 13px', borderRadius: 'var(--r)', background: 'var(--urgencia-soft)', border: '1px solid color-mix(in oklch, var(--urgencia) 30%, transparent)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Icon name="bolt" size={15} style={{ color: 'var(--urgencia-ink)', marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--urgencia-ink)' }}>Fluxo de urgência (Classe D)</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>Entrada excepcional autorizada. Regularização obrigatória — tarefa <b className="mono">{r.regularizacao || 'D+1'}</b> aberta para completar documentação e inspeção.</div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function StageDocumentos({ r, patch, pushToast }) {
  const [showPhotos, setShowPhotos] = useStateD(true);
  const [lightbox, setLightbox] = useStateD(null);
  const ok = r.docs.filter(d => d.val === 'sim').length;
  const setDoc = (i, val, obs) => {
    const docs = r.docs.map((d, j) => j === i ? { ...d, val, obs: obs !== undefined ? obs : d.obs } : d);
    patch({ docs });
  };
  const verdictOpts = [
    { v: 'aprovado', label: 'Aprovado', color: 'var(--liberado)', soft: 'var(--liberado-soft)', ink: 'var(--liberado-ink)', desc: 'Documentação completa' },
    { v: 'pendente', label: 'Pendente', color: 'var(--pendente)', soft: 'var(--pendente-soft)', ink: 'var(--pendente-ink)', desc: 'Falta complemento' },
    { v: 'reprovado', label: 'Reprovado', color: 'var(--bloqueado)', soft: 'var(--bloqueado-soft)', ink: 'var(--bloqueado-ink)', desc: 'Não conforme' },
  ];
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Section title="Checklist documental" eyebrow="Anexo II · 8 itens"
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
          <span className="mono" style={{ fontSize: 12, color: ok === 8 ? 'var(--liberado-ink)' : 'var(--muted)', fontWeight: 600 }}>{ok}/8</span>
          <div style={{ width: 80 }}><Meter value={ok} total={8} tone={ok === 8 ? 'var(--liberado)' : 'var(--docs)'} /></div>
        </div>}>
        <div>
          {r.docs.map((it, i) => (
            <CheckRow key={it.id} item={it} tri={window.TRI_DOCS}
              onChange={(val, obs) => setDoc(i, val, obs)}
              onAttach={() => { setDoc(i, 'sim'); patch({ docs: r.docs.map((d, j) => j === i ? { ...d, hasFile: true, val: 'sim' } : d) }); pushToast({ msg: `Comprovante anexado · ${it.label}`, icon: 'paperclip', tone: 'ok' }); }} />
          ))}
        </div>
      </Section>

      <Section title="Fotos do equipamento" eyebrow="8 ângulos · enviados pelo fornecedor"
        right={<button className="btn btn-quiet sm" onClick={() => setShowPhotos(s => !s)}><Icon name={showPhotos ? 'chevD' : 'chevR'} size={15} />{showPhotos ? 'Recolher' : 'Mostrar'}</button>}>
        {showPhotos && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {r.photos.map((p, i) => (
              <Placeholder key={p.id} label={p.label} h={104} filled={p.filled} quality={p.quality}
                onClick={() => p.filled && setLightbox(i)} active={lightbox === i} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Parecer documental" eyebrow="Decisão da Engenharia Clínica">
        <Verdict value={r.parecerDocs} onChange={v => { patch({ parecerDocs: v }); pushToast({ msg: 'Parecer documental registrado', tone: v === 'aprovado' ? 'ok' : 'warn' }); }} options={verdictOpts} />
        {(r.parecerDocs === 'pendente' || r.parecerDocs === 'reprovado') && (
          <textarea defaultValue={r.docs.find(d => d.obs)?.obs || ''} placeholder="Motivo / complemento solicitado ao fornecedor…"
            className="focusable" style={{ marginTop: 12, width: '100%', minHeight: 64, padding: 11, fontSize: 13, fontFamily: 'inherit', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface-2)', color: 'var(--ink)', resize: 'vertical' }} />
        )}
      </Section>

      {lightbox != null && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'oklch(0.2 0.01 255 / 0.62)', backdropFilter: 'blur(3px)', zIndex: 300, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px, 92vw)' }}>
            <Placeholder label={`Foto · ${r.photos[lightbox].label}`} h={360} filled />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span className="eyebrow" style={{ color: 'white' }}>{r.photos[lightbox].label} · validação OCR/IA: {r.photos[lightbox].quality === 'boa' ? 'aprovada' : 'revisar'}</span>
              <button className="btn btn-ghost sm" style={{ background: 'white' }} onClick={() => setLightbox(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StageInspecao({ r, patch, pushToast }) {
  const ok = r.insp.filter(d => d.val === 'conforme').length;
  const setIt = (i, val, obs) => patch({ insp: r.insp.map((d, j) => j === i ? { ...d, val, obs: obs !== undefined ? obs : d.obs } : d) });
  const fail = r.status === 'BLOQUEADO';
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Section title="Inspeção técnica" eyebrow="Anexo III · 7 itens"
        right={<span className="mono" style={{ fontSize: 12, color: ok === 7 ? 'var(--liberado-ink)' : 'var(--muted)', fontWeight: 600 }}>{ok}/7 conforme</span>}>
        {r.insp.map((it, i) => (
          <CheckRow key={it.id} item={it} tri={window.TRI_INSP}
            onChange={(val, obs) => setIt(i, val, obs)}
            onAttach={() => pushToast({ msg: `Evidência registrada · ${it.label}`, icon: 'camera', tone: 'ok' })} />
        ))}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Section title="Segurança elétrica" eyebrow="NBR IEC 60601" pad={16}>
          <div style={{ display: 'grid', gap: 11 }}>
            <SafetyReadout label="Corrente de fuga · paciente" value={fail ? 640 : 180} threshold={500} unit="µA" fail={fail} />
            <SafetyReadout label="Resistência de aterramento" value={fail ? 0.42 : 0.12} threshold={0.30} unit="Ω" fail={fail} />
          </div>
        </Section>
        <Section title="Higienização / CME" eyebrow="Necessidade" pad={16}>
          <div style={{ display: 'grid', gap: 9 }}>
            <label style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 13.5, color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={r.classe !== 'C'} style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} />
              Encaminhar à CME antes do uso
            </label>
            <label style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 13.5, color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} />
              Acompanhamento CCIH / NSP
            </label>
            <div style={{ marginTop: 4, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--surface-2)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--muted)' }}>
              Evento adverso? Registre em <b style={{ color: 'var(--ink-2)' }}>CME/CCIH/NSP</b>.
            </div>
          </div>
        </Section>
      </div>

      <Section title="Assinatura digital" eyebrow="Responsável pela inspeção">
        <SignaturePad signed={r._signed} onSign={(v) => patch({ _signed: v === false ? false : true })} />
      </Section>
    </div>
  );
}

function StageLiberacao({ r, patch, pushToast }) {
  const verdictOpts = [
    { v: 'liberado', label: 'Liberado', color: 'var(--liberado)', soft: 'var(--liberado-soft)', ink: 'var(--liberado-ink)', desc: 'Apto para uso' },
    { v: 'restricao', label: 'Liberado c/ restrição', color: 'var(--restricao)', soft: 'var(--restricao-soft)', ink: 'var(--restricao-ink)', desc: 'Apto com ressalvas' },
    { v: 'bloqueado', label: 'Bloqueado', color: 'var(--bloqueado)', soft: 'var(--bloqueado-soft)', ink: 'var(--bloqueado-ink)', desc: 'Uso impedido' },
  ];
  const cur = r.parecerInsp || (r.status === 'LIBERADO' ? 'liberado' : r.status === 'LIBERADO_COM_RESTRICAO' ? 'restricao' : r.status === 'BLOQUEADO' ? 'bloqueado' : null);
  const statusMap = { liberado: 'LIBERADO', restricao: 'LIBERADO_COM_RESTRICAO', bloqueado: 'BLOQUEADO' };
  const docsOk = r.docs.filter(d => d.val === 'sim').length === 8;
  const inspOk = r.insp.filter(d => d.val === 'conforme').length === 7;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* readiness summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 11 }}>
        {[
          { lbl: 'Documentos', ok: docsOk, txt: docsOk ? 'Completa' : 'Incompleta', stage: 'documentos' },
          { lbl: 'Inspeção', ok: inspOk, txt: inspOk ? 'Conforme' : 'Pendente', stage: 'inspecao' },
          { lbl: 'Assinatura', ok: r._signed, txt: r._signed ? 'Coletada' : 'Pendente' },
        ].map(s => (
          <div key={s.lbl} className="card" style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flex: 'none',
              background: s.ok ? 'var(--liberado-soft)' : 'var(--pendente-soft)', color: s.ok ? 'var(--liberado-ink)' : 'var(--pendente-ink)' }}>
              <Icon name={s.ok ? 'check' : 'warn'} size={16} />
            </span>
            <div>
              <div className="eyebrow">{s.lbl}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: s.ok ? 'var(--liberado-ink)' : 'var(--pendente-ink)' }}>{s.txt}</div>
            </div>
          </div>
        ))}
      </div>

      <Section title="Parecer final" eyebrow="Liberação · Anexo III">
        <Verdict value={cur} onChange={v => { patch({ parecerInsp: v, status: statusMap[v] }); pushToast({ msg: `Equipamento ${v === 'liberado' ? 'liberado' : v === 'restricao' ? 'liberado com restrição' : 'bloqueado'}`, tone: v === 'bloqueado' ? 'bad' : v === 'restricao' ? 'warn' : 'ok' }); }} options={verdictOpts} />
        {(cur === 'restricao' || cur === 'bloqueado') && (
          <textarea defaultValue={r.restricao || ''} placeholder={cur === 'bloqueado' ? 'Motivo do bloqueio…' : 'Ressalvas / condições de uso…'}
            className="focusable" style={{ marginTop: 12, width: '100%', minHeight: 64, padding: 11, fontSize: 13, fontFamily: 'inherit', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface-2)', color: 'var(--ink)', resize: 'vertical' }} />
        )}
      </Section>

      <Section title="Documentos gerados" eyebrow="Saídas do processo">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => pushToast({ msg: 'Etiqueta PDF gerada', icon: 'download' })}><Icon name="download" size={16} />Etiqueta PDF</button>
          <button className="btn btn-ghost" onClick={() => pushToast({ msg: 'Termo de responsabilidade gerado', icon: 'doc' })}><Icon name="doc" size={16} />Gerar termo</button>
          <button className="btn btn-ghost" onClick={() => pushToast({ msg: 'Enviado para impressão', icon: 'print' })}><Icon name="print" size={16} />Imprimir etiqueta</button>
        </div>
        {cur === 'liberado' && (
          <div style={{ marginTop: 14, padding: '13px 15px', borderRadius: 'var(--r)', background: 'var(--liberado-soft)', border: '1px solid color-mix(in oklch, var(--liberado) 30%, transparent)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon name="shield" size={18} style={{ color: 'var(--liberado-ink)' }} />
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}><b style={{ color: 'var(--liberado-ink)' }}>Apto para uso.</b> Disponível para consulta do Centro Cirúrgico.</div>
          </div>
        )}
      </Section>
    </div>
  );
}

Object.assign(window, { StageCadastro, StageDocumentos, StageInspecao, StageLiberacao, Section, SafetyReadout, SignaturePad });
