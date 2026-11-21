/* ===== Alertas de alteração em fontes oficiais =====
   Arquivo gravado pelo robô (scripts/monitor.mjs, GitHub Actions). Pode ser editado à mão:
   depois de revisar um alerta, troque status:'pendente' por status:'revisado'. */
const MONITOR = {"ultima":"2026-11-21"};
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
 }
];
if (typeof module !== 'undefined') module.exports = {ALERTAS, MONITOR};
