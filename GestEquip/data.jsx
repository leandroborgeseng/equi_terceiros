/* ============================================================
   GestEq — mock data + status system config
   Exposed on window for other babel scripts.
   ============================================================ */

// 12-state status system. cls = css class suffix, stage = pipeline column
const STATUS = {
  RASCUNHO:               { label: 'Rascunho',            cls: 'rascunho',   stage: 'cadastro'   },
  AGUARDANDO_CADASTRO:    { label: 'Aguard. cadastro',    cls: 'aguard-cad', stage: 'cadastro'   },
  AGUARDANDO_DOCUMENTOS:  { label: 'Aguard. documentos',  cls: 'docs',       stage: 'documentos' },
  PENDENTE_DOCUMENTOS:    { label: 'Pendente docs',       cls: 'pendente',   stage: 'documentos' },
  AGUARDANDO_INSPECAO:    { label: 'Aguard. inspeção',    cls: 'inspecao',   stage: 'inspecao'   },
  LIBERADO:               { label: 'Liberado',            cls: 'liberado',   stage: 'liberacao'  },
  LIBERADO_COM_RESTRICAO: { label: 'Liberado c/ restr.',  cls: 'restricao',  stage: 'liberacao'  },
  BLOQUEADO:              { label: 'Bloqueado',           cls: 'bloqueado',  stage: 'liberacao'  },
  EM_USO:                 { label: 'Em uso',              cls: 'emuso',      stage: 'arquivo'    },
  AGUARDANDO_RETIRADA:    { label: 'Aguard. retirada',    cls: 'retirada',   stage: 'arquivo'    },
  RETIRADO:               { label: 'Retirado',            cls: 'retirado',   stage: 'arquivo'    },
  FLUXO_URGENCIA:         { label: 'Fluxo urgência',      cls: 'urgencia',   stage: 'cadastro'   },
};

const STAGES = [
  { key: 'cadastro',   label: 'Cadastro',      n: 1, hint: 'Recebimento e dados',  statuses: ['RASCUNHO','AGUARDANDO_CADASTRO','FLUXO_URGENCIA'] },
  { key: 'documentos', label: 'Documentação',  n: 2, hint: 'Checklist Anexo II',   statuses: ['AGUARDANDO_DOCUMENTOS','PENDENTE_DOCUMENTOS'] },
  { key: 'inspecao',   label: 'Inspeção',      n: 3, hint: 'Técnica Anexo III',    statuses: ['AGUARDANDO_INSPECAO'] },
  { key: 'liberacao',  label: 'Liberação',     n: 4, hint: 'Parecer e etiqueta',   statuses: ['LIBERADO','LIBERADO_COM_RESTRICAO','BLOQUEADO'] },
];

const CLASSES = {
  A: { label: 'A', desc: 'Permanência > 30 dias', tone: 'Permanente' },
  B: { label: 'B', desc: 'Temporário programado', tone: 'Programado' },
  C: { label: 'C', desc: 'Esporádico',            tone: 'Esporádico' },
  D: { label: 'D', desc: 'Urgência / emergência', tone: 'Urgência'   },
};

// Document checklist template (Anexo II) — 8 items
const DOC_ITEMS = [
  { id: 'anvisa',     label: 'Registro ANVISA do equipamento',     hint: 'Nº de registro válido / vigente' },
  { id: 'manual',     label: 'Manual de operação (PT-BR)',          hint: 'Manual do usuário em português' },
  { id: 'manut',      label: 'Comprovante de manutenção preventiva', hint: 'Última preventiva ≤ 12 meses' },
  { id: 'calib',      label: 'Certificado de calibração',           hint: 'RBC / laboratório acreditado' },
  { id: 'tse',        label: 'Laudo de segurança elétrica (TSE)',   hint: 'Conforme NBR IEC 60601' },
  { id: 'apolice',    label: 'Apólice de seguro / responsabilidade', hint: 'Cobertura do proprietário' },
  { id: 'nf',         label: 'Nota fiscal / comodato vinculado',    hint: 'Documento de origem' },
  { id: 'treino',     label: 'Treinamento da equipe assistencial',  hint: 'Registro de capacitação' },
];

// Inspection template (Anexo III) — 7 items
const INSP_ITEMS = [
  { id: 'integridade', label: 'Integridade física do gabinete' },
  { id: 'cabos',       label: 'Cabos, conectores e plugue' },
  { id: 'acessorios',  label: 'Acessórios e itens declarados' },
  { id: 'identif',     label: 'Identificação e nº de série legíveis' },
  { id: 'funcional',   label: 'Teste funcional básico' },
  { id: 'alarmes',     label: 'Alarmes e sinalizações' },
  { id: 'limpeza',     label: 'Limpeza / condição higiênica' },
];

const PHOTO_SLOTS = [
  { id: 'frontal',    label: 'Frontal' },
  { id: 'traseira',   label: 'Traseira' },
  { id: 'etiqueta',   label: 'Etiqueta' },
  { id: 'serie',      label: 'Nº de série' },
  { id: 'acessorios', label: 'Acessórios' },
  { id: 'cabos',      label: 'Cabos' },
  { id: 'plugue',     label: 'Plugue' },
  { id: 'montado',    label: 'Montado' },
];

// helper to build a docs checklist given how many are approved
const mkDocs = (okCount, pend) => DOC_ITEMS.map((it, i) => ({
  ...it,
  val: i < okCount ? 'sim' : (pend && i === okCount ? 'nao' : null),
  hasFile: i < okCount,
  obs: pend && i === okCount ? 'Documento ilegível — reenviar.' : '',
}));
const mkInsp = (n) => INSP_ITEMS.map((it, i) => ({ ...it, val: i < n ? 'conforme' : null, obs: '' }));
const mkPhotos = (n) => PHOTO_SLOTS.map((p, i) => ({ ...p, filled: i < n, quality: i < n ? (i % 4 === 1 ? 'baixa' : 'boa') : null }));

// ---------- requests ----------
const REQUESTS = [
  {
    id: 'GE-2026-0142', protocolo: 'GE-2026-0142', status: 'AGUARDANDO_INSPECAO',
    equip: { nome: 'Bomba de Infusão Volumétrica', marca: 'Baxter', modelo: 'Sigma Spectrum', serie: 'BX-SS-44193' },
    solicitante: { nome: 'Dr. Helena Marques', crm: 'CRM-SP 142.880', tipo: 'Médico', origem: 'publico' },
    setor: 'Centro Cirúrgico — Sala 3', proc: 'Artroplastia de quadril', classe: 'B', ingresso: 'Comodato',
    fornecedor: 'MedSupply Distribuidora', nf: 'NF-88241', os: 'OS-2026-0310',
    createdAt: '2026-06-05T08:12:00', prazo: '2026-06-08', urgente: false, vencido: false,
    docs: mkDocs(8, false), insp: mkInsp(0), photos: mkPhotos(8),
    parecerDocs: 'aprovado',
  },
  {
    id: 'GE-2026-0148', protocolo: 'GE-2026-0148', status: 'FLUXO_URGENCIA',
    equip: { nome: 'Desfibrilador / Cardioversor', marca: 'Philips', modelo: 'HeartStart XL+', serie: 'PH-XL-7720' },
    solicitante: { nome: 'Dr. Rafael Tavares', crm: 'CRM-SP 98.110', tipo: 'Médico', origem: 'publico' },
    setor: 'UTI Adulto — Leito 7', proc: 'Suporte avançado de vida', classe: 'D', ingresso: 'Empréstimo',
    fornecedor: 'Hospital São Lucas', nf: '—', os: 'OS-2026-0314',
    createdAt: '2026-06-07T02:40:00', prazo: '2026-06-08', urgente: true, vencido: false,
    docs: mkDocs(2, false), insp: mkInsp(0), photos: mkPhotos(5),
    parecerDocs: null, regularizacao: 'D+1',
  },
  {
    id: 'GE-2026-0139', protocolo: 'GE-2026-0139', status: 'PENDENTE_DOCUMENTOS',
    equip: { nome: 'Bisturi Eletrônico', marca: 'WEM', modelo: 'SS-501', serie: 'WEM-501-2231' },
    solicitante: { nome: 'Dra. Camila Reis', crm: 'CRM-SP 120.554', tipo: 'Médico', origem: 'chave' },
    setor: 'Centro Cirúrgico — Sala 1', proc: 'Colecistectomia', classe: 'C', ingresso: 'Demonstração',
    fornecedor: 'WEM Equipamentos', nf: 'NF-88190', os: 'OS-2026-0301',
    createdAt: '2026-06-03T14:20:00', prazo: '2026-06-06', urgente: false, vencido: true,
    docs: mkDocs(4, true), insp: mkInsp(0), photos: mkPhotos(6),
    parecerDocs: 'pendente',
  },
  {
    id: 'GE-2026-0151', protocolo: 'GE-2026-0151', status: 'AGUARDANDO_DOCUMENTOS',
    equip: { nome: 'Monitor Multiparamétrico', marca: 'Mindray', modelo: 'BeneVision N12', serie: 'MR-N12-5582' },
    solicitante: { nome: 'Eng. Clínica — Núbia Costa', crm: '—', tipo: 'Eng. Clínica', origem: 'ec' },
    setor: 'UTI Neonatal', proc: 'Monitorização contínua', classe: 'A', ingresso: 'Aluguel',
    fornecedor: 'Mindray do Brasil', nf: 'NF-88305', os: 'OS-2026-0320',
    createdAt: '2026-06-06T10:05:00', prazo: '2026-06-10', urgente: false, vencido: false,
    docs: mkDocs(1, false), insp: mkInsp(0), photos: mkPhotos(2),
    parecerDocs: null,
  },
  {
    id: 'GE-2026-0150', protocolo: 'GE-2026-0150', status: 'AGUARDANDO_DOCUMENTOS',
    equip: { nome: 'Ventilador Pulmonar', marca: 'Magnamed', modelo: 'Oxymag', serie: 'MG-OXY-3014' },
    solicitante: { nome: 'Dr. Paulo Andrade', crm: 'CRM-SP 76.221', tipo: 'Médico', origem: 'publico' },
    setor: 'Pronto-Socorro', proc: 'Ventilação de transporte', classe: 'B', ingresso: 'Comodato',
    fornecedor: 'Magnamed', nf: 'NF-88299', os: 'OS-2026-0319',
    createdAt: '2026-06-06T09:00:00', prazo: '2026-06-09', urgente: false, vencido: false,
    docs: mkDocs(3, false), insp: mkInsp(0), photos: mkPhotos(4),
    parecerDocs: null,
  },
  {
    id: 'GE-2026-0136', protocolo: 'GE-2026-0136', status: 'AGUARDANDO_INSPECAO',
    equip: { nome: 'Aparelho de Anestesia', marca: 'Drägerwerk', modelo: 'Fabius Plus', serie: 'DR-FAB-1180' },
    solicitante: { nome: 'Dr. Sérgio Lima', crm: 'CRM-SP 51.903', tipo: 'Médico', origem: 'publico' },
    setor: 'Centro Cirúrgico — Sala 5', proc: 'Anestesia geral', classe: 'A', ingresso: 'Comodato',
    fornecedor: 'Dräger Brasil', nf: 'NF-88150', os: 'OS-2026-0295',
    createdAt: '2026-06-04T11:30:00', prazo: '2026-06-08', urgente: false, vencido: false,
    docs: mkDocs(8, false), insp: mkInsp(3), photos: mkPhotos(8),
    parecerDocs: 'aprovado',
  },
  {
    id: 'GE-2026-0133', protocolo: 'GE-2026-0133', status: 'AGUARDANDO_CADASTRO',
    equip: { nome: 'Bomba de Seringa', marca: 'B.Braun', modelo: 'Perfusor Space', serie: 'BB-PS-9921' },
    solicitante: { nome: 'Dra. Ana Beatriz', crm: 'CRM-SP 133.207', tipo: 'Médico', origem: 'publico' },
    setor: 'UTI Adulto — Leito 2', proc: 'Sedação contínua', classe: 'C', ingresso: 'Empréstimo',
    fornecedor: 'B.Braun', nf: '—', os: '—',
    createdAt: '2026-06-06T16:45:00', prazo: '2026-06-10', urgente: false, vencido: false,
    docs: mkDocs(0, false), insp: mkInsp(0), photos: mkPhotos(3),
    parecerDocs: null,
  },
  {
    id: 'GE-2026-0128', protocolo: 'GE-2026-0128', status: 'LIBERADO',
    equip: { nome: 'Ultrassom Portátil', marca: 'GE Healthcare', modelo: 'Vivid iq', serie: 'GE-VIQ-6604' },
    solicitante: { nome: 'Dr. Marcos Vinícius', crm: 'CRM-SP 64.118', tipo: 'Médico', origem: 'chave' },
    setor: 'Centro Cirúrgico — Sala 2', proc: 'Punção guiada', classe: 'B', ingresso: 'Aluguel',
    fornecedor: 'GE Healthcare', nf: 'NF-88070', os: 'OS-2026-0280',
    createdAt: '2026-06-02T13:10:00', prazo: '2026-06-05', urgente: false, vencido: false,
    docs: mkDocs(8, false), insp: mkInsp(7), photos: mkPhotos(8),
    parecerDocs: 'aprovado', parecerInsp: 'liberado',
  },
  {
    id: 'GE-2026-0124', protocolo: 'GE-2026-0124', status: 'LIBERADO_COM_RESTRICAO',
    equip: { nome: 'Foco Cirúrgico Móvel', marca: 'Baisheng', modelo: 'LED-500', serie: 'BS-L500-1140' },
    solicitante: { nome: 'Dr. Otávio Pires', crm: 'CRM-SP 89.442', tipo: 'Médico', origem: 'publico' },
    setor: 'Centro Cirúrgico — Sala 4', proc: 'Pequenas cirurgias', classe: 'C', ingresso: 'Demonstração',
    fornecedor: 'Baisheng Imports', nf: 'NF-88012', os: 'OS-2026-0271',
    createdAt: '2026-06-01T10:00:00', prazo: '2026-06-04', urgente: false, vencido: false,
    docs: mkDocs(8, false), insp: mkInsp(7), photos: mkPhotos(8),
    parecerDocs: 'aprovado', parecerInsp: 'restricao', restricao: 'Uso restrito a procedimentos eletivos; reavaliar bateria reserva em 30 dias.',
  },
  {
    id: 'GE-2026-0119', protocolo: 'GE-2026-0119', status: 'BLOQUEADO',
    equip: { nome: 'Eletrocautério', marca: 'Emai', modelo: 'BP-400', serie: 'EM-BP400-7702' },
    solicitante: { nome: 'Dr. Tiago Mendes', crm: 'CRM-SP 47.330', tipo: 'Médico', origem: 'publico' },
    setor: 'Centro Cirúrgico — Sala 1', proc: 'Procedimento eletivo', classe: 'C', ingresso: 'Empréstimo',
    fornecedor: 'Emai Indústria', nf: 'NF-87990', os: 'OS-2026-0260',
    createdAt: '2026-05-31T09:20:00', prazo: '2026-06-03', urgente: false, vencido: false,
    docs: mkDocs(6, true), insp: mkInsp(5), photos: mkPhotos(8),
    parecerDocs: 'pendente', parecerInsp: 'bloqueado', restricao: 'Reprovado no teste de corrente de fuga (> 500 µA).',
  },
];

Object.assign(window, { STATUS, STAGES, CLASSES, DOC_ITEMS, INSP_ITEMS, PHOTO_SLOTS, REQUESTS });
