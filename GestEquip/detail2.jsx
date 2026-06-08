/* ============================================================
   GestEq — 6-tab detail panels (Resumo, Termo, Ciclo, Fotos)
   Documentos + Inspeção reuse panels from detail.jsx
   ============================================================ */
const { useState: useStateD2 } = React;

/* ---- Tab: Resumo ---- */
function TabResumo({ r, patch, pushToast, onOpenTab }) {
  const [lightbox, setLightbox] = useStateD2(null);
  const canDelete = !['LIBERADO', 'LIBERADO_COM_RESTRICAO', 'EM_USO'].includes(r.status);

  // Build preview items: photos + doc attachments
  const previewItems = [
    ...r.photos.map(p => ({ id: p.id, label: p.label, filled: p.filled, type: 'photo', quality: p.quality })),
    ...r.docs.filter(d => d.hasFile).map(d => ({ id: 'doc-' + d.id, label: d.label.slice(0, 16), filled: true, type: 'pdf' })),
    ...(r.nf && r.nf !== '—' ? [{ id: 'nf', label: 'NF ' + r.nf, filled: true, type: 'nf' }] : []),
  ];
  const filledCount = previewItems.filter(p => p.filled).length;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Anexos e fotos */}
      <window.Section title={`Anexos e fotos (${filledCount})`} eyebrow="Galeria consolidada"
        right={<button className="btn btn-ghost sm" onClick={() => onOpenTab('fotos')}><Icon name="camera" size={14} />Ver todas</button>}>
        <FilePreviewGrid items={previewItems} onOpen={(i) => setLightbox(i)} />
      </window.Section>

      {/* Data grid 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <window.Section title="Equipamento" eyebrow="Dados técnicos">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px 18px' }}>
            <Field label="Nome" span={2}>{r.equip.nome}</Field>
            <Field label="Marca · modelo">{r.equip.marca} · {r.equip.modelo}</Field>
            <Field label="Nº de série" mono>{r.equip.serie}</Field>
            <Field label="Classe"><ClassTag c={r.classe} withDesc /></Field>
            <Field label="Ingresso">{r.ingresso}</Field>
            <Field label="Setor" span={2}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={13} style={{ color: 'var(--faint)' }} />{r.setor}</span></Field>
          </div>
        </window.Section>

        <window.Section title="Solicitação" eyebrow="Quem solicitou">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px 18px' }}>
            <Field label="Solicitante" span={2}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{r.solicitante.nome}<OriginSeal origem={r.solicitante.origem} /></span>
            </Field>
            <Field label="CRM" mono>{r.solicitante.crm}</Field>
            <Field label="Tipo">{r.solicitante.tipo}</Field>
            <Field label="Procedimento" span={2}>{r.proc}</Field>
          </div>
        </window.Section>

        <window.Section title="Empresa (PJ)" eyebrow="Proprietário · fornecedor">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px 18px' }}>
            <Field label="Razão social" span={2}>{r.fornecedor}</Field>
            <Field label="CNPJ" mono>—</Field>
            <Field label="Contato">—</Field>
            <Field label="Nota fiscal" mono>{r.nf}</Field>
            <Field label="OS interna" mono>{r.os}</Field>
          </div>
        </window.Section>

        <window.Section title="Protocolo · origem" eyebrow="Rastreabilidade">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px 18px' }}>
            <Field label="Protocolo" mono>{r.protocolo}</Field>
            <Field label="OS interna" mono>{r.os}</Field>
            <Field label="Classe" span={2}><ClassTag c={r.classe} withDesc /></Field>
            <Field label="Criado em" mono>{window.fmtDate(r.createdAt)}</Field>
            <Field label="Prazo" mono>{window.fmtDate(r.prazo)}</Field>
          </div>
        </window.Section>
      </div>

      {/* Exclusão */}
      {canDelete && (
        <div style={{ border: '1px solid color-mix(in oklch, var(--bloqueado) 30%, transparent)', borderRadius: 'var(--r-lg)', background: 'var(--bloqueado-soft)', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, color: 'var(--bloqueado-ink)' }}>Excluir cadastro</div>
            <div style={{ fontSize: 12.5, color: 'var(--bloqueado-ink)', opacity: 0.85, marginTop: 2 }}>Equipamento ainda não validado — remoção permanente.</div>
          </div>
          <button className="btn btn-danger" onClick={() => pushToast({ msg: 'Cadastro excluído', tone: 'bad', icon: 'x' })}><Icon name="x" size={15} />Excluir</button>
        </div>
      )}

      {lightbox != null && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'oklch(0.18 0.01 255 / 0.72)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px, 92vw)' }}>
            <Placeholder label={previewItems[lightbox]?.label || '—'} h={380} filled />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span className="eyebrow" style={{ color: 'white' }}>{previewItems[lightbox]?.label}</span>
              <button className="btn btn-ghost sm" style={{ background: 'white' }} onClick={() => setLightbox(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Tab: Termo (Anexo IV) ---- */
function TabTermo({ r, patch, pushToast }) {
  const [checked, setChecked] = useStateD2(r._termoAceito || false);
  const accept = () => {
    patch({ _termoAceito: true });
    pushToast({ msg: 'Termo aceito e registrado — Annexo IV', tone: 'ok', icon: 'check' });
  };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <window.Section title="Termo de responsabilidade" eyebrow="Anexo IV · aceite digital">
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '16px 18px', fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: 'var(--ink)' }}>TERMO DE RESPONSABILIDADE — EQUIPAMENTO MÉDICO DE TERCEIROS</p>
          <p style={{ margin: '0 0 8px' }}>Pelo presente termo, a parte solicitante declara estar ciente de que o equipamento identificado neste protocolo <span className="mono" style={{ fontSize: 12, background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--line)' }}>{r.protocolo}</span> é de propriedade ou responsabilidade de terceiros, cedido temporariamente para uso no âmbito da Unimed Franca, nos termos da Norma de Procedimento NP 445.000.</p>
          <p style={{ margin: '0 0 8px' }}>A Engenharia Clínica realizou a inspeção técnica e emite parecer conforme registrado no Anexo III. O uso do equipamento fica condicionado ao cumprimento das ressalvas e restrições registradas.</p>
          <p style={{ margin: '0 0 8px' }}>O solicitante compromete-se a comunicar imediatamente qualquer evento adverso, falha técnica ou necessidade de manutenção à Engenharia Clínica e ao CME/CCIH/NSP.</p>
          <p style={{ margin: 0 }}>A retirada do equipamento só poderá ocorrer após autorização formal da Engenharia Clínica, mediante registro de RETIRADO no sistema.</p>
        </div>

        {r._termoAceito ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px', borderRadius: 'var(--r)', background: 'var(--brand-soft)', border: '1px solid var(--brand-line)' }}>
            <Icon name="check" size={18} style={{ color: 'var(--brand-ink)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)' }}>Termo aceito digitalmente</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Responsável técnico · Engenharia Clínica · Unimed Franca</div>
            </div>
          </div>
        ) : (
          <>
            <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 14, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>
              <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, flex: 'none', accentColor: 'var(--brand)' }} />
              Li e concordo com os termos acima. Confirmo que a inspeção técnica foi realizada e que o equipamento está apto para uso conforme as condições registradas.
            </label>
            <button className="btn btn-primary" disabled={!checked} onClick={accept} style={{ width: '100%' }}>
              <Icon name="check" size={16} />Confirmar aceite do Termo (Anexo IV)
            </button>
          </>
        )}
      </window.Section>
    </div>
  );
}

/* ---- Tab: Ciclo de vida ---- */
function TabCicloVida({ r, patch, pushToast }) {
  const steps = [
    { key: 'solicitacao', label: 'Solicitação', icon: 'doc', date: r.createdAt, done: true },
    { key: 'cadastro', label: 'Cadastro EC', icon: 'clipboard', date: r.createdAt, done: r.os !== '—' },
    { key: 'homologacao', label: 'Homologação', icon: 'check', date: r.prazo, done: ['LIBERADO', 'LIBERADO_COM_RESTRICAO', 'BLOQUEADO', 'EM_USO', 'RETIRADO'].includes(r.status) },
    { key: 'liberacao', label: 'Liberação', icon: 'shield', date: r.prazo, done: ['LIBERADO', 'LIBERADO_COM_RESTRICAO', 'EM_USO', 'RETIRADO'].includes(r.status) },
    { key: 'emuso', label: 'Em uso', icon: 'bolt', date: null, done: ['EM_USO', 'RETIRADO'].includes(r.status) },
    { key: 'retirada', label: 'Retirada', icon: 'truck', date: null, done: r.status === 'RETIRADO' },
  ];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <window.Section title="Linha do tempo" eyebrow="Ciclo de vida do equipamento">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flex: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', flex: 'none',
                  background: s.done ? 'var(--brand-soft)' : 'var(--surface-2)',
                  border: s.done ? '1.5px solid var(--brand-line)' : '1px solid var(--line)',
                  color: s.done ? 'var(--brand-ink)' : 'var(--faint)',
                }}>
                  <Icon name={s.done ? 'check' : s.icon} size={15} />
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: s.done ? 'var(--brand-line)' : 'var(--line-2)', minHeight: 20, margin: '3px 0' }} />}
              </div>
              <div style={{ padding: '4px 14px 16px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: s.done ? 600 : 500, color: s.done ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</span>
                  {s.date && <span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{window.fmtDate(s.date)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </window.Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <window.Section title="Armazenamento" eyebrow="Local físico" pad={16}>
          <div style={{ display: 'grid', gap: 11 }}>
            <Field label="Setor destino">{r.setor}</Field>
            <Field label="Local">{r.classe === 'A' ? 'Depósito EC — Prateleira 04' : 'Depósito de Comodatos'}</Field>
            <Field label="Armazenamento">{r.classe === 'B' || r.classe === 'C' ? 'Temporário' : 'Fixo'}</Field>
          </div>
        </window.Section>
        <window.Section title="Status atual" eyebrow="Homologação" pad={16}>
          <div style={{ marginBottom: 12 }}><StatusBadge status={r.status} size="lg" /></div>
          <div style={{ display: 'grid', gap: 8 }}>
            <Field label="Protocolo" mono>{r.protocolo}</Field>
            <Field label="OS interna" mono>{r.os}</Field>
          </div>
          {r.restricao && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--restricao-soft)', border: '1px solid color-mix(in oklch, var(--restricao) 28%, transparent)', fontSize: 12.5, color: 'var(--restricao-ink)' }}>
              <b>Restrição:</b> {r.restricao}
            </div>
          )}
        </window.Section>
      </div>

      {r.status === 'LIBERADO' && (
        <window.Section title="Registrar evento de uso / retirada" eyebrow="Transição de status">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => { patch({ status: 'EM_USO' }); pushToast({ msg: 'Status atualizado: Em uso', tone: 'ok' }); }}>
              <Icon name="bolt" size={15} />Marcar em uso
            </button>
            <button className="btn btn-danger" onClick={() => { patch({ status: 'AGUARDANDO_RETIRADA' }); pushToast({ msg: 'Status: Aguardando retirada', tone: 'warn' }); }}>
              <Icon name="truck" size={15} />Solicitar retirada
            </button>
          </div>
        </window.Section>
      )}
    </div>
  );
}

/* ---- Tab: Fotos ---- */
function TabFotos({ r, patch, pushToast }) {
  const [lightbox, setLightbox] = useStateD2(null);
  const photos = r.photos;
  const filled = photos.filter(p => p.filled).length;

  const deletePhoto = (id) => {
    const updated = r.photos.map(p => p.id === id ? { ...p, filled: false, quality: null } : p);
    patch({ photos: updated });
    pushToast({ msg: 'Foto removida', icon: 'x', tone: 'warn' });
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <window.Section title={`Galeria de fotos (${filled}/8)`} eyebrow="Anexo I · fotos obrigatórias"
        right={<button className="btn btn-ghost sm" onClick={() => pushToast({ msg: 'Adicionar nova foto', icon: 'camera' })}><Icon name="camera" size={14} />Adicionar</button>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
              <Placeholder label={p.label} h={120} filled={p.filled} quality={p.quality} onClick={() => p.filled && setLightbox(p.id)} active={lightbox === p.id} />
              {p.filled && (
                <button onClick={() => deletePhoto(p.id)} className="focusable" style={{
                  position: 'absolute', top: 6, left: 6, width: 26, height: 26, borderRadius: 7,
                  background: 'oklch(0.2 0.01 255 / 0.7)', border: 'none', cursor: 'pointer',
                  display: 'grid', placeItems: 'center', color: 'white',
                }} title="Remover foto">
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </window.Section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'oklch(0.18 0.01 255 / 0.75)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(600px, 94vw)' }}>
            <Placeholder label={photos.find(p => p.id === lightbox)?.label || ''} h={420} filled />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {photos.filter(p => p.filled).map(p => (
                  <button key={p.id} onClick={() => setLightbox(p.id)} style={{ width: 44, height: 44, borderRadius: 7, border: p.id === lightbox ? '2px solid white' : '1px solid oklch(1 0 0 / 0.3)', cursor: 'pointer', overflow: 'hidden', background: 'oklch(0.3 0.01 255)', padding: 0 }}>
                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, oklch(0.4 0.005 255) 0 5px, oklch(0.35 0.005 255) 5px 10px)' }} />
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost sm" style={{ background: 'white' }} onClick={() => setLightbox(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TabResumo, TabTermo, TabCicloVida, TabFotos });
