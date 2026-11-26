/* ===== Alertas de alteração em fontes oficiais =====
   Arquivo gravado pelo robô (scripts/monitor.mjs, GitHub Actions). Pode ser editado à mão:
   depois de revisar um alerta, troque status:'pendente' por status:'revisado'. */
const MONITOR = {"ultima":"2026-11-26","fontes":{"nr09":{"ok":"2026-11-26","falhas":2},"nr01":{"ok":"2026-11-26","falhas":2},"nr10":{"ok":"2026-11-26","falhas":2},"nr15":{"ok":"2026-11-26","falhas":2},"nr16":{"ok":"2026-11-26","falhas":2},"nho":{"ok":"2026-11-26","falhas":2},"in128":{"ok":"2026-11-26","falhas":2},"sst":{"ok":"2026-11-26","falhas":2},"ec103":{"ok":"2026-11-26","falhas":0},"lei8213":{"ok":"2026-11-26","falhas":0},"d3048":{"ok":"2026-11-26","falhas":0},"dou":{"ok":"2026-11-26","falhas":2}}};
const ALERTAS = [
 {
  "id": "in215-2026",
  "fonte": "in128",
  "data": "2026-11-21",
  "titulo": "INSTRUÇÃO NORMATIVA PRES/INSS Nº 215, DE 15 DE OUTUBRO DE 2026",
  "url": "https://www.gov.br/inss/pt-br/centrais-de-conteudo/legislacao/instrucao-normativa/2026/instrucao-normativa-pres-inss-no-215-de-15-de-outubro-de-2026",
  "tipo": "novo-documento",
  "status": "revisado",
  "nota": "Revisado em 21/11/2026: trata só de despesas imobiliárias dos imóveis do INSS (DOU 16/10/2026). Não altera a IN 128/2022."
 },
 {
  "id": "b502d085ae6e",
  "fonte": "dou",
  "nomeFonte": "Diário Oficial da União (busca por termos)",
  "data": "2026-11-25",
  "status": "revisado",
  "tipo": "novo-documento",
  "titulo": "PORTARIA MPS N° 1.656, DE 24 DE NOVEMBRO DE 2026 (DOU 25/11/2026, Ministério da Previdência Social/Gabinete do Ministro)",
  "url": "https://www.in.gov.br/web/dou/-/portaria-mps-n-1.656-de-24-de-novembro-de-2026-746119401",
  "analise": "Impacto: nenhum\n(1) A portaria dispensa, a pedido, Edvaldo Estevam Alves do mandato de Conselheiro Suplente, representante do Governo na 5ª Junta do Conselho de Recursos da Previdência Social (CRPS), a partir de 12/10/2026. É ato de pessoal, publicado na Seção 2 do DOU.\n(2) Não altera nada do que o app usa: limites de tolerância, graus, anexos da NR-15/NR-16, marcos de vigência, regras do INSS para agentes nocivos, PPP/LTCAT, adicionais ou teses de tribunais. A menção ao art. 303 do Decreto 3.048/99 serve só para fundamentar a competência do ato. Nenhuma atualização é necessária.",
  "issue": "https://github.com/rograhl75-spec/caracterizador-pericial/issues/41",
  "nota": "Revisado em 26/11/2026: ato de pessoal (dispensa de conselheiro suplente da 5ª Junta do CRPS); cita o Decreto 3.048/99 só no preâmbulo. Não altera a base do app."
 }
];
if (typeof module !== 'undefined') module.exports = {ALERTAS, MONITOR};
