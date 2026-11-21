/* ===== Fontes oficiais: versão considerada no app e data da última conferência humana =====
   Quem mantém: o professor (campos "versao" e "conferido") e o robô scripts/monitor.mjs (lê "monitor").
   Ao revisar uma alteração: corrija os dados, atualize "versao" e "conferido" aqui e marque o alerta
   correspondente como "revisado" em dados/alertas.js.
   monitor.modo: 'links' = avisa quando aparece documento novo na página (filtro em linkFiltro);
                 'texto' = avisa quando o texto da página muda; 'dou' = busca no Diário Oficial.
   {ano} e {ano-1} nas URLs são trocados pelo ano corrente e pelo anterior. */
const MTE_NR = 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/';
const MTE_SST = 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-portarias/';
const FONTES = [
 {id:'lei8213', nome:'Lei 8.213/91 (arts. 57 e 58)', area:'prev', versao:'Texto compilado do Planalto; arts. 57 e 58 completos', conferido:'2026-11-21',
  url:'https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm', monitor:{modo:'texto', contem:'aposentadoria especial'}},
 {id:'d3048', nome:'Decreto 3.048/99 (RPS, Anexo IV)', area:'prev', versao:'Redação do Decreto 10.410/2020; Anexo IV conferido no Planalto', conferido:'2026-11-21',
  url:'https://www.planalto.gov.br/ccivil_03/decreto/d3048.htm', monitor:{modo:'texto', contem:'ANEXO IV'}},
 {id:'in128', nome:'IN PRES/INSS 128/2022 e alterações', area:'prev', versao:'Arts. 286 a 302 na redação das INs 141/2022 e 170/2024; INs até a 216/2026 conferidas', conferido:'2026-11-21',
  url:'https://www.gov.br/inss/pt-br/centrais-de-conteudo/legislacao/instrucao-normativa',
  monitor:{modo:'links', urls:['https://www.gov.br/inss/pt-br/centrais-de-conteudo/legislacao/instrucao-normativa/{ano}','https://www.gov.br/inss/pt-br/centrais-de-conteudo/legislacao/instrucao-normativa/{ano-1}'], linkFiltro:'instrucao-normativa/20\\d\\d/(in|instrucao)'}},
 {id:'ec103', nome:'EC 103/2019 e STF, ADI 6309', area:'prev', versao:'Idade mínima afastada (ADI 6309, 03/06/2026)', conferido:'2026-11-21',
  url:'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc103.htm', monitor:{modo:'texto', contem:'Art. 19'}},
 {id:'linach', nome:'LINACH (Portaria Interministerial 9/2014)', area:'prev', versao:'Grupo 1 da lista de 2014 conferido no DOU (114 agentes); sem nova edição', conferido:'2026-11-21', url:'', monitor:null},
 {id:'nho', nome:'NHO da Fundacentro', area:'ambos', versao:'NHO-01 a 11; NHO-06 na 3ª edição (2025), embora NR-09 e NR-15 citem a 2ª (2017)', conferido:'2026-11-21',
  url:'https://www.gov.br/fundacentro/pt-br/centrais-de-conteudo/biblioteca/nhos', monitor:{modo:'links', linkFiltro:'primo\\.exlibrisgroup|nho'}},
 {id:'nr01', nome:'NR-01 (GRO/PGR)', area:'trab', versao:'Portaria MTE 765/2025 (texto 2025-I-3); psicossociais desde 26/05/2026', conferido:'2026-11-21',
  url:MTE_NR+'nr-1', monitor:{modo:'links', linkFiltro:'\\.pdf'}},
 {id:'nr09', nome:'NR-09 (avaliação de agentes)', area:'trab', versao:'Anexo III alterado pela Portaria MTE 105/2026', conferido:'2026-11-21',
  url:MTE_NR+'norma-regulamentadora-no-9-nr-9', monitor:{modo:'links', linkFiltro:'\\.pdf'}},
 {id:'nr10', nome:'NR-10 (eletricidade)', area:'trab', versao:'Nova NR-10 (Portaria MTE 737/2026) em vigor a partir de 01/06/2027', conferido:'2026-11-21',
  url:MTE_NR+'norma-regulamentadora-no-10-nr-10', monitor:{modo:'links', linkFiltro:'\\.pdf'}},
 {id:'nr15', nome:'NR-15 e anexos', area:'trab', versao:'Até a Portaria MTE 2.021/2025 (item 15.4.1.3); Anexos 3, 11 e 13 conferidos com o texto oficial', conferido:'2026-11-21',
  url:MTE_NR+'norma-regulamentadora-no-15-nr-15', monitor:{modo:'links', linkFiltro:'\\.pdf'}},
 {id:'nr16', nome:'NR-16 e anexos', area:'trab', versao:'Até a Portaria MTE 2.021/2025 (Anexo V) e 1.411/2025 (Anexo VI); Anexo 4 ainda remete ao item 10.2.8 da NR-10 antiga', conferido:'2026-11-21',
  url:MTE_NR+'norma-regulamentadora-no-16-nr-16', monitor:{modo:'links', linkFiltro:'\\.pdf'}},
 {id:'sst', nome:'Portarias SST do MTE (ano corrente)', area:'trab', versao:'Lidas até a Portaria MTE 1.758/2026', conferido:'2026-11-21',
  url:MTE_SST, monitor:{modo:'links', urls:[MTE_SST+'{ano}-1', MTE_SST+'{ano}', MTE_SST+'{ano-1}-1', MTE_SST+'{ano-1}'],
   linkFiltro:'sst-portarias/20\\d\\d[^"]*/portaria[^/]*(nr-?0?1\\b|nr-?0?1-|nr-?0?9|nr-?10|nr-?15|nr-?16|nr-?17|nr-?22|insalub|pericul)'}},
 {id:'dou', nome:'Diário Oficial da União (busca por termos)', area:'ambos', versao:'—', conferido:'2026-11-21',
  url:'https://www.in.gov.br/consulta', monitor:{modo:'dou', termos:['"Norma Regulamentadora nº 15"','"Norma Regulamentadora nº 16"','"NR-15"','"NR-16"','"Instrução Normativa PRES/INSS"','"aposentadoria especial"','"Decreto nº 3.048"'],
   filtro:'^(portaria|instru[çc][ãa]o normativa|decreto|lei|medida provis|resolu[çc][ãa]o|emenda)[^(]*\\(DOU[^)]*(trabalho|previd|seguro social|poder executivo|presid[êe]ncia|congresso)'}},
 {id:'stf', nome:'STF: repercussão geral e controle concentrado', area:'ambos', versao:'Temas 555, 709, 1209, 1470, ADI 6309 e ADPF 1.337 (situação em 21/11/2026)', conferido:'2026-11-21', url:'https://portal.stf.jus.br/jurisprudenciaRepercussao/', monitor:null},
 {id:'stj', nome:'STJ: recursos repetitivos', area:'prev', versao:'Temas 534, 694, 1083, 1090, 1291, 1307 e 1475 (eletricidade, em julgamento)', conferido:'2026-11-21', url:'https://processo.stj.jus.br/repetitivos/temas_repetitivos/', monitor:null},
 {id:'tnu', nome:'TNU: representativos', area:'prev', versao:'Temas 170, 174, 211, 317 (rejulgado em 2025), 323, 337, 382, 383, 397 e 399', conferido:'2026-11-21', url:'https://www.cjf.jus.br/cjf/corregedoria-da-justica-federal/turma-nacional-de-uniformizacao', monitor:null},
 {id:'tst', nome:'TST: súmulas, OJs e temas repetitivos', area:'trab', versao:'Temas 17, 80, 82, 87, 101, 180 e 209; súmulas conferidas', conferido:'2026-11-21', url:'https://www.tst.jus.br/en/nugep-sp/recursos-repetitivos/precedentes-vinculantes', monitor:null}
];
if (typeof module !== 'undefined') module.exports = {FONTES};
