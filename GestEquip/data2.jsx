/* ============================================================
   GestEq — mock data for the management screens
   ============================================================ */

const FORNECEDORES = [
  { id: 'f1', nome: 'MedSupply Distribuidora Ltda', cnpj: '12.345.678/0001-90', email: 'comercial@medsupply.com.br', tel: '(16) 3721-4400', cidade: 'Ribeirão Preto / SP', equip: 4, nfs: 3 },
  { id: 'f2', nome: 'Dräger Brasil S.A.', cnpj: '01.234.567/0001-12', email: 'sac@draeger.com.br', tel: '(11) 4689-4900', cidade: 'São Paulo / SP', equip: 2, nfs: 2 },
  { id: 'f3', nome: 'Mindray do Brasil', cnpj: '09.876.543/0001-21', email: 'atendimento@mindray.com.br', tel: '(11) 2090-8800', cidade: 'São Paulo / SP', equip: 3, nfs: 2 },
  { id: 'f4', nome: 'GE Healthcare do Brasil', cnpj: '00.123.456/0001-77', email: 'contato@gehealthcare.com', tel: '(11) 3067-8000', cidade: 'São Paulo / SP', equip: 2, nfs: 1 },
  { id: 'f5', nome: 'WEM Equipamentos Eletrônicos', cnpj: '55.444.333/0001-02', email: 'vendas@wem.com.br', tel: '(16) 3512-1200', cidade: 'Ribeirão Preto / SP', equip: 1, nfs: 1 },
  { id: 'f6', nome: 'Magnamed Tecnologia Médica', cnpj: '07.888.999/0001-44', email: 'comercial@magnamed.com.br', tel: '(11) 4308-5400', cidade: 'Cotia / SP', equip: 1, nfs: 1 },
];

const NOTAS = [
  { id: 'n1', numero: 'NF-88241', data: '2026-06-04', fornecedor: 'MedSupply Distribuidora Ltda', valor: 184200, equipamentos: ['Bomba de Infusão Volumétrica', 'Bomba de Seringa', 'Monitor de Transporte'] },
  { id: 'n2', numero: 'NF-88305', data: '2026-06-06', fornecedor: 'Mindray do Brasil', valor: 96500, equipamentos: ['Monitor Multiparamétrico', 'Central de Monitorização'] },
  { id: 'n3', numero: 'NF-88150', data: '2026-06-03', fornecedor: 'Dräger Brasil S.A.', valor: 312000, equipamentos: ['Aparelho de Anestesia', 'Ventilador UTI'] },
  { id: 'n4', numero: 'NF-88070', data: '2026-06-02', fornecedor: 'GE Healthcare do Brasil', valor: 145800, equipamentos: ['Ultrassom Portátil'] },
  { id: 'n5', numero: 'NF-88299', data: '2026-06-06', fornecedor: 'Magnamed Tecnologia Médica', valor: 58300, equipamentos: ['Ventilador Pulmonar'] },
];

const CHAVES = [
  { id: 'k1', chave: 'UNIMED-F8K2-A91D', nome: 'Dr. Helena Marques', email: 'helena.marques@crm.org', tel: '(16) 99812-4410', crm: 'CRM-SP 142.880', tipo: 'Médico', status: 'ativa', usos: 2, max: 5, criada: '2026-05-28', expira: '2026-06-28' },
  { id: 'k2', chave: 'UNIMED-3JX7-B40C', nome: 'MedSupply — Comercial', email: 'comercial@medsupply.com.br', tel: '(16) 3721-4400', crm: '—', tipo: 'Fornecedor', status: 'ativa', usos: 1, max: 10, criada: '2026-06-01', expira: '2026-07-01' },
  { id: 'k3', chave: 'UNIMED-9QW1-C77E', nome: 'Dr. Rafael Tavares', email: 'rafael.tavares@crm.org', tel: '(16) 99440-2231', crm: 'CRM-SP 98.110', tipo: 'Médico', status: 'expirada', usos: 3, max: 3, criada: '2026-04-20', expira: '2026-05-20' },
  { id: 'k4', chave: 'UNIMED-5RT8-D12F', nome: 'Dra. Camila Reis', email: 'camila.reis@crm.org', tel: '(16) 99120-8855', crm: 'CRM-SP 120.554', tipo: 'Médico', status: 'revogada', usos: 0, max: 5, criada: '2026-05-15', expira: '2026-06-15' },
];

const USUARIOS = [
  { id: 'u1', nome: 'Núbia Costa',     email: 'nubia.costa@unimedfranca.com.br',  papel: 'ENGENHARIA_CLINICA', crm: '—', ativo: true },
  { id: 'u2', nome: 'CarlosADM',      email: 'carlos.adm@unimedfranca.com.br',    papel: 'ADMIN',              crm: '—', ativo: true },
  { id: 'u3', nome: 'Dr. Helena Marques', email: 'helena.marques@unimedfranca.com.br', papel: 'MEDICO',        crm: 'CRM-SP 142.880', ativo: true },
  { id: 'u4', nome: 'Recepção CC',     email: 'centro.cirurgico@unimedfranca.com.br', papel: 'CENTRO_CIRURGICO', crm: '—', ativo: true },
  { id: 'u5', nome: 'Equipe CME',      email: 'cme@unimedfranca.com.br',           papel: 'CME_CCIH_NSP',       crm: '—', ativo: false },
];

const PAPEIS = {
  ADMIN: 'Administrador', ENGENHARIA_CLINICA: 'Engenharia Clínica', MEDICO: 'Médico',
  FORNECEDOR: 'Fornecedor', CENTRO_CIRURGICO: 'Centro Cirúrgico', CME_CCIH_NSP: 'CME / CCIH / NSP',
};

const CONFIG_SECOES = [
  { id: 'usuarios',   icon: 'user',  titulo: 'Usuários e papéis', desc: 'Gerencie acessos e funções', count: 5, ativo: true },
  { id: 'chaves',     icon: 'key',   titulo: 'Chaves de acesso',  desc: 'Convites para solicitação',  count: 4, ativo: true },
  { id: 'setores',    icon: 'pin',   titulo: 'Setores',           desc: 'Unidades e destinos',        count: 12, soon: true },
  { id: 'impressoras',icon: 'print', titulo: 'Impressoras',       desc: 'Etiquetas e termos',         count: 3,  soon: true },
  { id: 'templates',  icon: 'doc',   titulo: 'Templates',         desc: 'Modelos de documentos',      count: 7,  soon: true },
  { id: 'auditoria',  icon: 'shield',titulo: 'Auditoria',         desc: 'Trilha e rastreabilidade',   count: 0,  soon: true },
];

const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

Object.assign(window, { FORNECEDORES, NOTAS, CHAVES, USUARIOS, PAPEIS, CONFIG_SECOES, fmtBRL });
