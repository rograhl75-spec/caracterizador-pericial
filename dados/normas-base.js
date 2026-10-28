/* ===== Base normativa curada ===== */
const MARCOS = [
  {d:'1964-03-25', t:'Decreto 53.831/64', s:'Quadro anexo: agentes (1.x) e categorias profissionais (2.x).'},
  {d:'1979-01-24', t:'Decreto 83.080/79', s:'Anexos I (agentes) e II (grupos profissionais).'},
  {d:'1995-04-28', t:'Lei 9.032/95 (véspera: 28/04/1995)', s:'Fim do enquadramento por categoria profissional; exige exposição permanente, não ocasional nem intermitente.'},
  {d:'1996-10-14', t:'MP 1.523/96', s:'LTCAT passa a fundamentar os formulários; informação sobre EPC.'},
  {d:'1997-03-05', t:'Último dia dos Decretos 53.831 e 83.080', s:'A partir de 06/03/1997 vale o Anexo IV do Decreto 2.172/97.'},
  {d:'1998-12-03', t:'MP 1.729/98 → Lei 9.732/98', s:'Informação sobre EPI eficaz passa a ser considerada.'},
  {d:'1999-05-07', t:'Decreto 3.048/99', s:'Anexo IV do RPS (redação atual, com alterações).'},
  {d:'2003-11-19', t:'Decreto 4.882/03', s:'Ruído: NEN > 85 dB(A); metodologia Fundacentro (NHO).'},
  {d:'2004-01-01', t:'PPP obrigatório', s:'INSS exige NHO-01 (NEN) para ruído e NHO-06 para calor.'},
  {d:'2013-10-17', t:'Decreto 8.123/13', s:'Art. 68, §4º: cancerígenos (LINACH) — avaliação qualitativa.'},
  {d:'2012-09-10', t:'NHO-09 e NHO-10 (Fundacentro)', s:'Metodologia de vibração (VCI e VMB); facultada pelo INSS desde esta data.'},
  {d:'2014-08-13', t:'Anexo 8 NR-15 (Portaria 1.297/14)', s:'Vibração: limites aren e VDVR para enquadramento.'},
  {d:'2014-10-08', t:'Portaria Interministerial 9/14 (LINACH)', s:'INSS: Grupo 1 com CAS — EPI/EPC não descaracterizam.'},
  {d:'2019-11-13', t:'EC 103/2019', s:'Último dia para conversão de tempo especial em comum; idade mínima.'},
  {d:'2019-12-11', t:'Portaria SEPRT 1.359/19', s:'Novo Anexo 3 da NR-15 (calor), com LT em função de M (W).'},
  {d:'2020-07-01', t:'Decreto 10.410/20', s:'Art. 68, §4º: cancerígenos — medidas de controle que eliminem a nocividade descaracterizam a exposição.'},
  {d:'2022-03-29', t:'IN PRES/INSS 128/2022', s:'Revoga a IN 77/2015; alterada pelas INs 133, 141, 170 e 212 (a 212/2026 não altera agentes nocivos).'}
];

/* Regras gerais de conversão (Decreto 3.048/99, art. 70 — redação anterior à EC 103) */
const FATORES = {15:{M:2.00,H:2.33},20:{M:1.50,H:1.75},25:{M:1.20,H:1.40}};

/* matriz: P1 até 05/03/1997 | P2 06/03/1997–18/11/2003 | P3 19/11/2003–13/11/2019 | P4 a partir de 14/11/2019
   Q = qualitativo | L = quantitativo (limite) | N = não arrolado | C = controverso (só via judicial) | X = misto */
const GRUPOS = ['Físicos','Químicos','Biológicos','Associação e categoria'];

const PERITO_PADRAO = 'Sem posição própria registrada para este agente: adota-se a leitura do Decreto (Anexo IV e art. 68 do RPS).';
const QUIM_INSS = [ /* substituído em data2.js (patch) */
  'IN 128/2022, art. 297: até 05/03/1997, enquadramento qualitativo por presunção (códigos 1.2.x dos Decretos 53.831/64 e 83.080/79).',
  'A partir de 06/03/1997: agentes do Anexo IV, com os Anexos 11, 12, 13 e 13-A da NR-15 (qualitativo ou quantitativo conforme o agente).',
  'A partir de 01/01/2004: metodologias das NHO-02, 03, 04 e 07 da Fundacentro.',
  'Cancerígenos do Grupo 1 da LINACH com CAS e constantes do Anexo IV: a partir de 08/10/2014, avaliação qualitativa; EPC/EPI não descaracterizam.',
  'EPI eficaz informado em demonstração ambiental a partir de 03/12/1998 afasta o enquadramento (arts. 290–291).'
];
const QUIM_JURIS = [
  'TNU, Tema 170: o art. 68, §4º (Decreto 8.123/13) aplica-se também a períodos anteriores — para cancerígenos LINACH, sem avaliação quantitativa e sem descaracterização por EPI.',
  'STJ, Tema 1090 (2025): EPI eficaz informado no PPP afasta, em princípio, a especialidade; cabe ao segurado provar a ineficácia; havendo dúvida, decide-se a favor do segurado.'
];

const AGENTS = [
/* ---------------- FÍSICOS ---------------- */
{id:'ruido', nome:'Ruído', grupo:'Físicos', engine:'ruido', tempo:25, c53:['1.1.6'], c83:['1.1.5'], cIV:'2.0.1', sheet:'RUÍDO', nr15:'Anexos 1 e 2', mx:['L','L','L','L'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.6) e 83.080/79 (1.1.5)','Acima de 80 dB(A)'],
  ['06/03/1997 a 18/11/2003','Dec. 2.172/97 e 3.048/99 (2.0.1)','Acima de 90 dB(A)'],
  ['a partir de 19/11/2003','Dec. 3.048/99, red. Dec. 4.882/03 (2.0.1)','NEN superior a 85 dB(A)']],
 perito:[
  'Metodologia da NR-15, Anexo 1, com fator de duplicação q = 5 em todos os períodos.',
  'Até 18/11/2003 compara-se sempre o Lavg: a legislação remetia ao Anexo 1 da NR-15 na íntegra.',
  'A partir de 19/11/2003 compara-se somente o NEN, calculado conforme a jornada com q = 5: NEN = Lavg + 16,61 · log₁₀(Te/480).',
  'EPI não descaracteriza a exposição a ruído (STF, Tema 555).',
  'Havendo enquadramento, o PPP recebe o código GFIP 04.'],
 inss:[
  'IN 128/2022, art. 292: até 05/03/1997, acima de 80 dB(A); de 06/03/1997 a 10/10/2001, acima de 90 dB(A); de 11/10/2001 a 18/11/2003, acima de 90 dB(A), com histograma ou memória de cálculo.',
  'A partir de 01/01/2004: NEN acima de 85 dB(A), pela NHO-01 da Fundacentro (q = 3), facultada desde 19/11/2003.',
  'O PPP precisa informar a técnica (NHO-01/NEN). Para o INSS, citar só "dosímetro" ou "dosimetria" não basta (Manual 2018).',
  'A declaração de EPI eficaz não afasta o enquadramento por ruído.'],
 juris:['T:stj694','T:stj1083','T:tnu174','T:tnu317','T:stf555']},

{id:'calor', nome:'Calor', grupo:'Físicos', engine:'calor', tempo:25, c53:['1.1.1'], c83:['1.1.1'], cIV:'2.0.4', sheet:'CALOR', nr15:'Anexo 3', mx:['L','L','L','L'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.1) e 83.080/79 (1.1.1)','TE acima de 28 °C de fonte artificial; ou alimentação de caldeiras a carvão ou lenha; ou atividades do Anexo II do 83.080/79, códigos 2.5.1, 2.5.2 e 2.5.5 (IN 141/2022, art. 293, I, a, 2)'],
  ['06/03/1997 a 10/12/2019','Dec. 2.172/97 e 3.048/99 (2.0.4)','Acima dos LT do Anexo 3 da NR-15 (redação original: Quadros 1, 2 e 3)'],
  ['a partir de 11/12/2019','Dec. 3.048/99 (2.0.4) + Portaria SEPRT 1.359/19','Acima do LT do Quadro 1 do novo Anexo 3, em função de M (W)']],
 perito:[
  'Aplica-se o Decreto 3.048/99, código 2.0.4: calor acima dos limites de tolerância da NR-15. O Decreto prevalece sobre a IN do INSS, que é mais restritiva (hierarquia normativa).',
  'De 06/03/1997 a 10/12/2019: LT do Anexo 3 original (Quadro 1 por tipo de atividade e regime de descanso no próprio local; Quadro 2 por taxa metabólica em kcal/h quando o descanso é em outro local), sem exigir fonte artificial. O Anexo 3 original abrangia ambientes externos com carga solar.',
  'A partir de 11/12/2019: LT do Quadro 1 do novo Anexo 3, em função de M (W). O próprio Anexo 3 não se aplica a céu aberto sem fonte artificial (item 1.1.1); a ferramenta marca esse caso como controverso.',
  'Havendo enquadramento, o PPP recebe o código GFIP 04.'],
 inss:[
  'IN 128/2022, art. 293 (red. IN 141/2022): exige fonte artificial de calor.',
  'Até 05/03/1997: acima de 28 °C, sem exigir IBUTG; ou atividades do Anexo II do Decreto 83.080/79.',
  'De 06/03/1997 a 18/11/2003: Anexo 3 da NR-15, Quadros 1, 2 e 3. De 01/01/2004 a 10/12/2019: mesmos LT, com metodologia da NHO-06 (facultada desde 19/11/2003).',
  'A partir de 11/12/2019: ambientes fechados ou com fonte artificial, LT do novo Anexo 3 e NHO-06.',
  'Os períodos de descanso no próprio local contam como tempo de serviço.'],
 juris:['T:tnu323','T:stj1090']},

{id:'vibracao', nome:'Vibração', grupo:'Físicos', engine:'vibracao', tempo:25, c53:['1.1.5'], c83:['1.1.4'], cIV:'2.0.2', sheet:'VIBRAÇÃO', nr15:'Anexo 8', mx:['Q','X','X','L'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.5) e 83.080/79 (1.1.4)','Perfuratrizes e marteletes pneumáticos; máquinas a ar comprimido acima de 120 golpes/min'],
  ['06/03/1997 a 12/08/2014','Dec. 2.172/97 e 3.048/99 (2.0.2)','Trabalhos com perfuratrizes e marteletes; INSS: limites das ISO 2631 e ISO/DIS 5349'],
  ['a partir de 13/08/2014','Dec. 3.048/99 (2.0.2) + Anexo 8 da NR-15','VCI: aren > 1,1 m/s² ou VDVR > 21,0 m/s¹·⁷⁵; VMB: aren > 5 m/s²']],
 perito:[PERITO_PADRAO,'O código 2.0.0 admite enquadramento pela exposição acima dos limites especificados ou pelas atividades descritas.'],
 inss:['IN 128/2022, art. 296: até 05/03/1997, qualitativo (1.1.4) ou quantitativo (1.1.5, 120 golpes/min); de 06/03/1997 a 12/08/2014, limites das ISO 2631 e ISO/DIS 5349; a partir de 13/08/2014, limites do Anexo 8 da NR-15 (metodologia NHO-09 e NHO-10).'],
 juris:['T:stj1307','T:stj1090']},

{id:'rad_ion', nome:'Radiações ionizantes', grupo:'Físicos', engine:'radion', tempo:25, c53:['1.1.4'], c83:['1.1.3'], cIV:'2.0.3', sheet:'RADIAÇÃO', nr15:'Anexo 5', mx:['Q','X','X','X'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.4) e 83.080/79 (1.1.3)','Qualitativo: atividades descritas'],
  ['a partir de 06/03/1997','Dec. 2.172/97 e 3.048/99 (2.0.3)','Atividades descritas (alíneas a–g); INSS exige superar o LT do Anexo 5 da NR-15']],
 perito:[PERITO_PADRAO,'O código 2.0.0 admite enquadramento pelas atividades descritas no 2.0.3.'],
 inss:['IN 128/2022, arts. 294–295: até 05/03/1997, qualitativo; a partir de 06/03/1997, quando ultrapassados os LT do Anexo 5 da NR-15 (CNEN NN-3.01); raios X em radiologia: NHO-05.'],
 juris:['T:stj1090']},

{id:'pressao', nome:'Pressão atmosférica anormal', grupo:'Físicos', engine:'quali', tempo:25, c53:['1.1.7'], c83:['1.1.6'], cIV:'2.0.5', sheet:'PRESSÃO', nr15:'Anexo 6', mx:['Q','Q','Q','Q'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.7) e 83.080/79 (1.1.6 — 20 anos)','Escafandristas, mergulhadores, caixões e tubulões pneumáticos'],
  ['a partir de 06/03/1997','Dec. 2.172/97 e 3.048/99 (2.0.5)','Caixões ou câmaras hiperbáricas; tubulões ou túneis sob ar comprimido; mergulho']],
 perito:[PERITO_PADRAO],
 inss:['IN 128/2022, art. 300: até 05/03/1997, códigos 1.1.7 (53.831) ou 1.1.6 (83.080); depois, atividades do código 2.0.5.'],
 juris:['T:tnu337']},

{id:'eletricidade', nome:'Eletricidade', grupo:'Físicos', engine:'eletricidade', tempo:25, c53:['1.1.8'], c83:[], cIV:null, sheet:'ELETRICIDADE', nr15:'— (NR-16, Anexo IV)', mx:['Q','C','C','C'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.8)','Tensão superior a 250 V, em caráter permanente'],
  ['a partir de 06/03/1997','Não arrolado no Anexo IV','Somente pela via judicial, com prova técnica']],
 perito:['Até 05/03/1997: tensão superior a 250 V (código 1.1.8).','Depois de 05/03/1997 o agente não consta do Anexo IV; a ferramenta marca como controverso quando há exposição acima de 250 V.'],
 inss:['IN 128/2022, art. 301: frio, eletricidade, radiações não ionizantes e umidade só enquadram até 05/03/1997.'],
 juris:['T:stj534','T:stf1209']},

{id:'frio', nome:'Frio', grupo:'Físicos', engine:'ate97', tempo:25, c53:['1.1.2'], c83:['1.1.2'], cIV:null, sheet:'FRIO', nr15:'Anexo 9', mx:['Q','C','C','C'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.2) e 83.080/79 (1.1.2)','Temperatura inferior a 12 °C de fonte artificial; câmaras frigoríficas e fabricação de gelo'],
  ['a partir de 06/03/1997','Não arrolado no Anexo IV','Somente pela via judicial']],
 perito:[PERITO_PADRAO], inss:['IN 128/2022, art. 301: só até 05/03/1997.'], juris:['T:stj534']},

{id:'umidade', nome:'Umidade', grupo:'Físicos', engine:'ate97', tempo:25, c53:['1.1.3'], c83:[], cIV:null, sheet:'UMIDADE', nr15:'Anexo 10', mx:['Q','C','C','C'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.3)','Contato direto e permanente com água: lavadores, tintureiros, salinas'],
  ['a partir de 06/03/1997','Não arrolado no Anexo IV','Somente pela via judicial']],
 perito:[PERITO_PADRAO], inss:['IN 128/2022, art. 301: só até 05/03/1997.'], juris:['T:stj534']},

{id:'rni', nome:'Radiações não ionizantes', grupo:'Físicos', engine:'ate97', tempo:25, c53:['1.1.4'], c83:[], cIV:null, sheet:'RADIAÇÃO', nr15:'Anexo 7', mx:['Q','C','C','C'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.1.4)','Infravermelho, ultravioleta; soldadores a arco elétrico e oxiacetileno'],
  ['a partir de 06/03/1997','Não arrolado no Anexo IV','Somente pela via judicial']],
 perito:[PERITO_PADRAO], inss:['IN 128/2022, art. 301: só até 05/03/1997.'], juris:['T:stj534']},

/* ---------------- QUÍMICOS ---------------- */
{id:'arsenio', nome:'Arsênio e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.1'], c83:['1.2.1'], cIV:'1.0.1', sheet:'ARSÊNICO', modo:'qual', linach:true, nr15:'Anexo 13', mx:['Q','Q','Q','Q']},
{id:'asbestos', nome:'Asbestos (amianto)', grupo:'Químicos', engine:'quimico', tempo:20, c53:['1.2.10'], c83:['1.2.12'], cIV:'1.0.2', sheet:'ASBESTO', modo:'quant', linach:true, nr15:'Anexo 12 (2,0 f/cm³)', mx:['Q','L','L','L']},
{id:'benzeno', nome:'Benzeno e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.11'], c83:['1.2.10'], cIV:'1.0.3', sheet:'BENZENO', modo:'qual', linach:true, nr15:'Anexo 13-A', mx:['Q','Q','Q','Q']},
{id:'berilio', nome:'Berílio e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.2'], c83:['1.2.2'], cIV:'1.0.4', sheet:'BERÍLIO', modo:'qual', linach:true, nr15:'—', mx:['Q','Q','Q','Q']},
{id:'bromo', nome:'Bromo e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.11'], cIV:'1.0.5', sheet:'BROMO', modo:'quant', nr15:'Anexo 11 (0,08 ppm)', mx:['Q','L','L','L']},
{id:'cadmio', nome:'Cádmio e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.3'], c83:['1.2.3'], cIV:'1.0.6', sheet:'CÁDMIO', modo:'qual', linach:true, nr15:'—', mx:['Q','Q','Q','Q']},
{id:'carvao', nome:'Carvão mineral e derivados', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.10','1.2.11'], c83:['1.2.10','1.2.12'], cIV:'1.0.7', sheet:'CARVÃO MINERAL', modo:'qual', linach:true, nr15:'Anexo 13 (hidrocarbonetos)', mx:['Q','Q','Q','Q']},
{id:'chumbo', nome:'Chumbo e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.4'], c83:['1.2.4'], cIV:'1.0.8', sheet:'CHUMBO', modo:'quant', nr15:'Anexo 11 (0,1 mg/m³) e Anexo 13', mx:['Q','X','X','X']},
{id:'cloro', nome:'Cloro e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.10','1.2.11'], cIV:'1.0.9', sheet:'CLORO', modo:'quant', linach:true, nr15:'Anexo 11 (cloro 0,8 ppm)', mx:['Q','X','X','X']},
{id:'cromo', nome:'Cromo e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.5'], c83:['1.2.5'], cIV:'1.0.10', sheet:'CROMO', modo:'qual', linach:true, nr15:'Anexo 13', mx:['Q','Q','Q','Q']},
{id:'dissulfeto', nome:'Dissulfeto de carbono', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.11'], c83:['1.2.10'], cIV:'1.0.11', sheet:'DISSULFETO DE CARBONO', modo:'quant', nr15:'Anexo 11 (16 ppm)', mx:['Q','L','L','L']},
{id:'fosforo', nome:'Fósforo e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.6'], c83:['1.2.6'], cIV:'1.0.12', sheet:'FÓSFORO', modo:'qual', linach:true, nr15:'Anexo 13', mx:['Q','Q','Q','Q']},
{id:'iodo', nome:'Iodo', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.11'], cIV:'1.0.13', sheet:'IODO', modo:'qual', nr15:'—', mx:['Q','Q','Q','Q']},
{id:'manganes', nome:'Manganês e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.7'], c83:['1.2.7'], cIV:'1.0.14', sheet:'MANGANÊS', modo:'quant', nr15:'Anexo 12', mx:['Q','L','L','L']},
{id:'mercurio', nome:'Mercúrio e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.8'], c83:['1.2.8'], cIV:'1.0.15', sheet:'MERCÚRIO', modo:'quant', nr15:'Anexo 11 e Anexo 13', mx:['Q','X','X','X']},
{id:'niquel', nome:'Níquel e compostos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.11'], cIV:'1.0.16', sheet:'NÍQUEL', modo:'qual', nr15:'Anexo 11 (níquel carbonila)', mx:['Q','Q','Q','Q']},
{id:'petroleo', nome:'Petróleo, xisto, gás natural e derivados', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.11'], c83:['1.2.10'], cIV:'1.0.17', sheet:'PETRÓLEO E SEUS DERIVADOS', modo:'qual', linach:true, nr15:'Anexo 13 (hidrocarbonetos)', mx:['Q','Q','Q','Q']},
{id:'silica', nome:'Sílica livre', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.10'], c83:['1.2.12'], cIV:'1.0.18', sheet:'POEIRAS MINERAIS', modo:'quant', linach:true, nr15:'Anexo 12', mx:['Q','L','L','L']},
{id:'outras', nome:'Outras substâncias químicas (grupos I e II)', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.11'], c83:['1.2.10'], cIV:'1.0.19', sheet:'TÓXICOS ORGÂNICOS', modo:'qual', linach:true, nr15:'Anexos 11 e 13', mx:['Q','X','X','X']},
{id:'ouro', nome:'Ouro', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.9'], cIV:null, sheet:'OURO', modo:'qual', nr15:'—', mx:['Q','N','N','N']},
{id:'inorg', nome:'Outros tóxicos inorgânicos', grupo:'Químicos', engine:'quimico', tempo:25, c53:['1.2.9'], c83:['1.2.11'], cIV:null, sheet:'OUTROS TÓXICOS INORGÂNICOS', modo:'qual', nr15:'—', mx:['Q','N','N','N']},

/* ---------------- BIOLÓGICOS ---------------- */
{id:'biologico', nome:'Agentes biológicos', grupo:'Biológicos', engine:'biologico', tempo:25, c53:['1.3.1','1.3.2'], c83:['1.3.1','1.3.2','1.3.3','1.3.4','1.3.5'], cIV:'3.0.1', sheet:'AGENTES BIOLÓGICOS', nr15:'Anexo 14 (não usado no previdenciário)', mx:['Q','Q','Q','Q'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.3.1, 1.3.2) e 83.080/79 (1.3.1 a 1.3.5)','Contato com doentes, animais ou materiais infectocontagiantes'],
  ['a partir de 06/03/1997','Dec. 2.172/97 e 3.048/99 (3.0.1)','Exposição unicamente nas atividades relacionadas nas alíneas a–g']],
 perito:[
  'Caracteriza-se apenas pelo rol de atividades do Anexo IV do Decreto 3.048/99, código 3.0.1 (alíneas a–g).',
  'O Anexo 14 da NR-15 não é usado para caracterizar aposentadoria especial: ele serve à insalubridade.',
  'Havendo enquadramento, o PPP recebe o código GFIP 04.'],
 inss:['IN 128/2022, art. 299: até 05/03/1997, atividades de assistência à saúde e demais códigos 1.3.x; a partir de 06/03/1997, só as atividades do Anexo IV. Em estabelecimentos de saúde, só o contato com pacientes portadores de doenças infectocontagiosas ou o manuseio de materiais contaminados.','Para biológicos, o EPI só é eficaz se eliminar totalmente a possibilidade de contaminação (Manual 2018).'],
 juris:['T:tnu211','T:stj1090']},

/* ---------------- ASSOCIAÇÃO / CATEGORIA ---------------- */
{id:'mineracao', nome:'Mineração subterrânea (associação de agentes)', grupo:'Associação e categoria', engine:'quali', tempo:15, c53:['1.2.10'], c83:['1.2.12'], cIV:'4.0.1 / 4.0.2', sheet:null, nr15:'—', mx:['Q','Q','Q','Q'],
 periodos:[
  ['até 05/03/1997','Dec. 53.831/64 (1.2.10)','Subsolo, frentes de trabalho: 15 anos; subsolo afastado: 20 anos; céu aberto: 25 anos'],
  ['a partir de 06/03/1997','Dec. 2.172/97 e 3.048/99 (4.0.1 e 4.0.2)','Subsolo em frente de produção: 15 anos; afastado das frentes: 20 anos']],
 perito:[PERITO_PADRAO,'Nas associações de agentes acima do LT, vale o enquadramento que exigir menor tempo (4.0.0).'],
 inss:['IN 128/2022, art. 302: associação de agentes enquadra exclusivamente nas atividades do código 4.0.0.'], juris:[]},

{id:'categoria', nome:'Categoria profissional', grupo:'Associação e categoria', engine:'categoria', tempo:25, c53:['2.x'], c83:['Anexo II'], cIV:null, sheet:null, nr15:'—', mx:['P','N','N','N'],
 periodos:[
  ['até 28/04/1995','Dec. 53.831/64 (2.x) e Anexo II do Dec. 83.080/79','Enquadramento pela atividade ou grupo profissional (presunção legal)'],
  ['a partir de 29/04/1995','Lei 9.032/95','Exige prova de exposição efetiva a agente nocivo']],
 perito:['Até 28/04/1995: basta comprovar o exercício da atividade listada (CTPS, formulário).','Depois: só por exposição a agente nocivo.'],
 inss:['IN 128/2022, art. 269, §1º: "Fica assegurada a caracterização por categoria profissional, até 28 de abril de 1995, véspera da publicação da Lei nº 9.032."','Art. 269, §2º: a conversão do tempo especial em comum só vale para períodos até 13/11/2019 (EC 103/2019).','Art. 269, §3º: o Decreto 4.882/2003 não retroage.'],
 juris:['T:stf1209','T:stj1307']}
];

/* textos padrão para químicos */
AGENTS.forEach(a=>{
  if(a.engine==='quimico'){
    const ate = 'até 05/03/1997';
    a.periodos = a.periodos || [
      [ate, 'Dec. 53.831/64 ('+a.c53.join(', ')+') e 83.080/79 ('+(a.c83.join(', ')||'—')+')', 'Qualitativo, por presunção de exposição nas operações descritas'],
      ['a partir de 06/03/1997', a.cIV ? 'Dec. 2.172/97 e 3.048/99 ('+a.cIV+')' : 'Não arrolado no Anexo IV', a.cIV ? (a.modo==='quant' ? 'Quantitativo: concentração acima do LT da NR-15 ('+a.nr15+')' : 'Qualitativo: exposição nas atividades exemplificadas ('+a.nr15+')') : 'Sem enquadramento a partir de 06/03/1997']
    ];
    if(a.linach) a.periodos.push(['a partir de 17/10/2013','Dec. 3.048/99, art. 68, §4º (Dec. 8.123/13) + LINACH Grupo 1','Cancerígeno: presença com possibilidade de exposição basta; EPI não descaracteriza']);
    a.perito = a.perito || [PERITO_PADRAO, 'O rol de agentes do Anexo IV é exaustivo; as atividades listadas são exemplificativas (código 1.0.0).'];
    a.inss = a.inss || QUIM_INSS;
    a.juris = a.juris || ['T:tnu170','T:stj1090'];
  }
});

/* ===== Jurisprudência (resumos didáticos — conferir a íntegra) ===== */
const TESES = {
 stf555:{trib:'STF',num:'Tema 555',ref:'ARE 664.335',ano:2014,area:'prev',titulo:'EPI e aposentadoria especial',
   tese:'Se o EPI for realmente capaz de neutralizar a nocividade, não há respaldo para a aposentadoria especial. No caso de ruído acima do limite, a declaração de eficácia do EPI no PPP não descaracteriza o tempo especial.'},
 stf709:{trib:'STF',num:'Tema 709',ref:'RE 791.961',ano:2020,area:'prev',titulo:'Continuidade em atividade especial',
   tese:'É constitucional vedar a continuidade da aposentadoria especial se o beneficiário permanece ou retorna a atividade especial.'},
 stf1209:{trib:'STF',num:'Tema 1209',ref:'RE 1.368.225',ano:2026,area:'prev',titulo:'Vigilante',
   tese:'A atividade de vigilante, com ou sem arma de fogo, não se caracteriza como especial para a aposentadoria do art. 201, §1º, da Constituição (julgado em 18/02/2026). O fundamento de que a periculosidade, por si só, não gera aposentadoria especial pode repercutir em outros agentes de risco, como a eletricidade: acompanhar.'},
 stj534:{trib:'STJ',num:'Tema 534',ref:'REsp 1.306.113',ano:2012,area:'prev',titulo:'Eletricidade após 05/03/1997',
   tese:'As normas que listam agentes e atividades nocivos são exemplificativas. É possível reconhecer como especial, depois de 05/03/1997, o trabalho com exposição a eletricidade, desde que permanente, não ocasional nem intermitente, e comprovado por prova técnica.'},
 stj694:{trib:'STJ',num:'Tema 694',ref:'REsp 1.398.260',ano:2014,area:'prev',titulo:'Ruído entre 1997 e 2003',
   tese:'O limite para o ruído é de 90 dB de 06/03/1997 a 18/11/2003. O limite de 85 dB do Decreto 4.882/03 não retroage.'},
 stj1083:{trib:'STJ',num:'Tema 1083',ref:'REsp 1.886.795',ano:2021,area:'prev',titulo:'Ruído variável: NEN',
   tese:'Com níveis de ruído variáveis, a especialidade é aferida pelo NEN. Na falta dessa informação, adota-se o nível máximo (pico), desde que perícia judicial comprove habitualidade e permanência.'},
 stj1090:{trib:'STJ',num:'Tema 1090',ref:'—',ano:2025,area:'prev',titulo:'EPI eficaz no PPP',
   tese:'A informação de EPI eficaz no PPP descaracteriza, em princípio, o tempo especial, salvo exceções. Cabe ao segurado provar a ineficácia: falta de adequação ao risco, certificado irregular, falta de manutenção ou de treinamento. Havendo dúvida sobre a eficácia, decide-se a favor do segurado.'},
 stj1307:{trib:'STJ',num:'Tema 1307',ref:'REsp 2.164.724',ano:2026,area:'prev',titulo:'Motoristas e cobradores: penosidade',
   tese:'É possível reconhecer como especial, por penosidade, a atividade de motorista ou cobrador de ônibus e de motorista de caminhão após a Lei 9.032/95, desde que perícia técnica individualizada comprove exposição habitual e permanente a condições concretas de desgaste à saúde.'},
 stj1291:{trib:'STJ',num:'Tema 1291',ref:'—',ano:2025,area:'prev',titulo:'Contribuinte individual não cooperado',
   tese:'O contribuinte individual não cooperado pode ter reconhecida a atividade especial após a Lei 9.032/95, se comprovar a exposição; não se exige formulário emitido por empresa. Há recurso extraordinário pendente no STF.'},
 tnu170:{trib:'TNU',num:'Tema 170',ref:'PEDILEF',ano:2018,area:'prev',titulo:'Cancerígenos (LINACH)',
   tese:'O art. 68, §4º, do Decreto 3.048/99 (Decreto 8.123/13) aplica-se a períodos anteriores. Para qualquer período, dispensa avaliação quantitativa, e o EPI não descaracteriza.'},
 tnu174:{trib:'TNU',num:'Tema 174',ref:'PEDILEF 0505614-83.2017',ano:2018,area:'prev',titulo:'Metodologia do ruído',
   tese:'A partir de 19/11/2003, é obrigatório usar a NHO-01 ou a NR-15, com medição de toda a jornada, vedada a medição pontual. O PPP deve indicar a técnica e a norma. Na omissão ou dúvida, deve-se apresentar o LTCAT.'},
 tnu211:{trib:'TNU',num:'Tema 211',ref:'PEDILEF',ano:2019,area:'prev',titulo:'Agentes biológicos',
   tese:'Para agentes biológicos, exige-se a probabilidade da exposição, avaliando pela profissiografia se ela é indissociável da produção do bem ou da prestação do serviço, independentemente de tempo mínimo de exposição na jornada.'},
 tnu317:{trib:'TNU',num:'Tema 317',ref:'—',ano:2024,area:'prev',titulo:'Dosimetria no PPP',
   tese:'A menção a dosimetria ou dosímetro no PPP gera presunção relativa de que se observou a NHO-01 e/ou a NR-15. Havendo dúvida fundada ou omissão, afasta-se a presunção e exige-se o laudo técnico.'},
 tnu323:{trib:'TNU',num:'Tema 323',ref:'—',ano:2025,area:'prev',titulo:'Calor: taxa metabólica',
   tese:'De 06/03/1997 a 18/11/2003: com descanso no próprio local e atividade de mesma categoria, dispensa-se informar a taxa metabólica; com descanso em outro local ou categorias distintas, é obrigatória a taxa média ponderada M (kcal/h). Em período posterior, é obrigatória a NHO-06 e a taxa M (W).'},
 tnu337:{trib:'TNU',num:'Tema 337',ref:'—',ano:2025,area:'prev',titulo:'Aeronauta: pressão hipobárica',
   tese:'Após a Lei 9.032/95, a pressão hipobárica, por si só, não torna especial a atividade de aeronauta sem estudo técnico conclusivo.'},
 /* trabalhistas */
 sv4:{trib:'STF',num:'Súmula Vinculante 4',ref:'—',ano:2008,area:'trab',titulo:'Base de cálculo da insalubridade',
   tese:'O salário mínimo não pode ser indexador de base de cálculo; até nova lei ou norma coletiva, mantém-se o salário mínimo como base (art. 192 da CLT).'},
 s47:{trib:'TST',num:'Súmula 47',ref:'—',ano:null,area:'trab',titulo:'Insalubridade intermitente',tese:'O trabalho em condições insalubres em caráter intermitente não afasta o adicional.'},
 s80:{trib:'TST',num:'Súmula 80',ref:'—',ano:null,area:'trab',titulo:'Eliminação por EPI',tese:'A eliminação da insalubridade por EPI aprovado pelo órgão competente exclui o adicional.'},
 s289:{trib:'TST',num:'Súmula 289',ref:'—',ano:null,area:'trab',titulo:'Fornecimento de EPI',tese:'Fornecer o EPI não exime o empregador: ele deve tomar as medidas que diminuam ou eliminem a nocividade, inclusive fiscalizar o uso efetivo.'},
 s448:{trib:'TST',num:'Súmula 448',ref:'—',ano:2014,area:'trab',titulo:'Classificação oficial; lixo e sanitários',tese:'Não basta o laudo pericial: a atividade precisa constar da relação oficial do MTE. Limpeza de banheiros de uso público ou coletivo de grande circulação e a respectiva coleta de lixo enquadram-se no grau máximo do Anexo 14 (lixo urbano).'},
 oj173:{trib:'TST',num:'OJ 173 SDI-1',ref:'—',ano:2012,area:'trab',titulo:'Céu aberto',tese:'I: não há adicional pela exposição à radiação solar (falta previsão legal). II: há adicional pelo calor acima do LT, inclusive em ambiente externo com carga solar, conforme o Anexo 3 da época. O Anexo 3 vigente desde 11/12/2019 não se aplica a céu aberto sem fonte artificial (item 1.1.1).'},
 s364:{trib:'TST',num:'Súmula 364',ref:'—',ano:null,area:'trab',titulo:'Periculosidade: frequência',tese:'É devido o adicional na exposição permanente ou intermitente. É indevido no contato eventual ou habitual por tempo extremamente reduzido.'},
 s191:{trib:'TST',num:'Súmula 191',ref:'—',ano:null,area:'trab',titulo:'Base da periculosidade',tese:'O adicional de periculosidade incide sobre o salário básico, sem outros adicionais.'},
 s39:{trib:'TST',num:'Súmula 39',ref:'—',ano:null,area:'trab',titulo:'Frentistas',tese:'Os empregados que operam bomba de gasolina têm direito ao adicional de periculosidade.'},
 oj345:{trib:'TST',num:'OJ 345 SDI-1',ref:'—',ano:null,area:'trab',titulo:'Radiação ionizante',tese:'A exposição a radiação ionizante ou substância radioativa enseja adicional de periculosidade (Portaria 518/2003).'},
 oj385:{trib:'TST',num:'OJ 385 SDI-1',ref:'—',ano:null,area:'trab',titulo:'Inflamáveis em prédio vertical',tese:'É devido o adicional a todos os empregados de prédio vertical onde haja armazenamento de inflamável em quantidade acima do limite legal.'},
 irr17:{trib:'TST',num:'IRR Tema 17',ref:'—',ano:2019,area:'trab',titulo:'Cumulação de adicionais',tese:'É vedada a cumulação dos adicionais de insalubridade e periculosidade, ainda que os fatos geradores sejam distintos (art. 193, §2º, da CLT).'}
};

/* ===== NR-15 ===== */
const NR15 = [
 {n:1, t:'Ruído contínuo ou intermitente', g:'médio', tipo:'calc', calc:'ruido', s:'LT de 85 dB(A) para 8 h, fator de duplicação q = 5. Dose acima de 100% caracteriza. Acima de 115 dB(A) sem proteção: risco grave e iminente.'},
 {n:2, t:'Ruído de impacto', g:'médio', tipo:'calc', calc:'impacto', s:'LT de 130 dB linear (pico) ou 120 dB(C) em resposta rápida. Acima de 140 dB(lin) ou 130 dB(C) sem proteção: risco grave e iminente.'},
 {n:3, t:'Calor', g:'médio', tipo:'calc', calc:'calor', s:'IBUTG médio acima do LT do Quadro 1, em função da taxa metabólica M (W). Não se aplica a céu aberto sem fonte artificial (item 1.1.1).'},
 {n:4, t:'Iluminamento', g:'—', tipo:'revogado', s:'Revogado pela Portaria MTPS 3.751/1990. Iluminação não gera adicional.'},
 {n:5, t:'Radiações ionizantes', g:'máximo', tipo:'quali', s:'LT da norma CNEN NN-3.01. Superar o LT caracteriza.'},
 {n:6, t:'Trabalho sob condições hiperbáricas', g:'máximo', tipo:'quali', s:'Ar comprimido (tubulões, túneis) e mergulho.'},
 {n:7, t:'Radiações não ionizantes', g:'médio', tipo:'quali', s:'Micro-ondas, ultravioleta e laser, por laudo de inspeção. A radiação solar não gera adicional (OJ 173, I).'},
 {n:8, t:'Vibração', g:'médio', tipo:'calc', calc:'vibracao', s:'VMB: aren > 5 m/s². VCI: aren > 1,1 m/s² ou VDVR > 21,0 m/s¹·⁷⁵.'},
 {n:9, t:'Frio', g:'médio', tipo:'quali', s:'Câmaras frigoríficas ou locais com condições similares, sem proteção adequada, por laudo de inspeção.'},
 {n:10, t:'Umidade', g:'médio', tipo:'quali', s:'Locais alagados ou encharcados, com umidade excessiva, por laudo de inspeção.'},
 {n:11, t:'Agentes químicos com limite de tolerância', g:'conforme Quadro 1', tipo:'calc', calc:'quim11', s:'Quadro 1 completo, pesquisável por nome, sinônimo ou fórmula. Caracteriza quando a média das amostras supera o LT; para agentes com valor teto, quando qualquer amostra supera o LT. O grau é o do Quadro 1.'},
 {n:12, t:'Poeiras minerais', g:'máximo', tipo:'calc', calc:'poeira', s:'Asbesto (2,0 f/cm³), manganês e sílica livre cristalizada (LT por % de quartzo).'},
 {n:13, t:'Agentes químicos (avaliação qualitativa)', g:'mínimo, médio ou máximo, por atividade', tipo:'lista', lista:'a13', s:'Lista integral do anexo: insalubridade pela atividade descrita, por inspeção no local, sem medição.'},
 {n:'13-A', t:'Benzeno', g:'ver Anexo 13', tipo:'quali', s:'Estabelece o VRT-MPT e medidas de prevenção. Não fixa grau de insalubridade: o grau é atribuído pelo perito (interpretação usual: por analogia com o Anexo 13).'},
 {n:14, t:'Agentes biológicos', g:'médio ou máximo', tipo:'lista', lista:'a14', s:'Avaliação qualitativa, pelo contato permanente nas atividades listadas.'}
];
const A14 = [
 {g:'máximo', t:'Pacientes em isolamento por doenças infectocontagiosas, e objetos de seu uso não previamente esterilizados'},
 {g:'máximo', t:'Carnes, glândulas, vísceras, sangue, ossos, couros, pelos e dejeções de animais portadores de doenças infectocontagiosas (carbunculose, brucelose, tuberculose)'},
 {g:'máximo', t:'Esgotos (galerias e tanques)'},
 {g:'máximo', t:'Lixo urbano (coleta e industrialização). Inclui banheiros de uso público ou coletivo de grande circulação (Súmula 448, II)'},
 {g:'médio', t:'Hospitais, serviços de emergência, enfermarias, ambulatórios, postos de vacinação e outros estabelecimentos de saúde humana: só o pessoal em contato com pacientes ou com objetos de seu uso não esterilizados'},
 {g:'médio', t:'Estabelecimentos de atendimento e tratamento de animais: só o pessoal em contato com os animais'},
 {g:'médio', t:'Contato em laboratórios com animais destinados ao preparo de soro, vacinas e outros produtos'},
 {g:'médio', t:'Laboratórios de análise clínica e histopatologia: só o pessoal técnico'},
 {g:'médio', t:'Gabinetes de autópsia, anatomia e histoanatomopatologia: só o pessoal técnico'},
 {g:'médio', t:'Cemitérios (exumação de corpos)'},
 {g:'médio', t:'Estábulos e cavalariças'},
 {g:'médio', t:'Resíduos de animais deteriorados'}
];
const A13 = [
 {ag:'Arsênico', g:'máximo, médio ou mínimo', ex:'Máximo: extração e preparação de compostos; tintas e praguicidas à base de arsênico. Mínimo: pintura com pigmentos de arsênico ao ar livre.'},
 {ag:'Carvão', g:'máximo, médio ou mínimo', ex:'Máximo: trabalho permanente no subsolo em frente de trabalho. Graus menores conforme o local.'},
 {ag:'Chumbo', g:'máximo, médio ou mínimo', ex:'Máximo: fabricação de compostos de chumbo, pintura a pistola com pigmentos de chumbo. Também há LT no Anexo 11.'},
 {ag:'Cromo', g:'máximo ou médio', ex:'Máximo: fabricação de cromatos e bicromatos; pintura a pistola com pigmentos de cromo. Médio: cromagem eletrolítica.'},
 {ag:'Fósforo', g:'máximo ou médio', ex:'Máximo: extração e preparação de fósforo branco; fabricação de defensivos fosforados.'},
 {ag:'Hidrocarbonetos e outros compostos de carbono', g:'máximo, médio ou mínimo', ex:'Máximo: destilação do alcatrão e do petróleo; manipulação de alcatrão, breu, betume, antraceno, óleos minerais, óleo queimado e parafina; pintura a pistola com solventes aromáticos.'},
 {ag:'Mercúrio', g:'máximo', ex:'Fabricação e manipulação de compostos orgânicos de mercúrio.'},
 {ag:'Silicatos', g:'máximo', ex:'Operações que desprendam poeira de silicatos em trabalhos permanentes no subsolo, em minas e túneis.'},
 {ag:'Substâncias cancerígenas', g:'—', ex:'Exposição proibida (4-aminodifenil, benzidina, betanaftilamina, 4-nitrodifenil): não há meio de exposição permitido.'},
 {ag:'Operações diversas', g:'máximo, médio ou mínimo', ex:'Lista heterogênea (ex.: grau máximo para operações com cádmio e seus compostos). Conferir a lista integral do anexo.'}
];

/* Anexo 3 (2019) — Quadro 1: M (W) → IBUTG máx (°C); idêntico à Tabela 2 da NHO-06 */
const Q1_2019 = [[100,33.7],[102,33.6],[104,33.5],[106,33.4],[108,33.3],[110,33.2],[112,33.1],[115,33.0],[117,32.9],[119,32.8],[122,32.7],[124,32.6],[127,32.5],[129,32.4],[132,32.3],[135,32.2],[137,32.1],[140,32.0],[143,31.9],[146,31.8],[149,31.7],[152,31.6],[155,31.5],[158,31.4],[161,31.3],[165,31.2],[168,31.1],[171,31.0],[175,30.9],[178,30.8],[182,30.7],[186,30.6],[189,30.5],[193,30.4],[197,30.3],[201,30.2],[205,30.1],[209,30.0],[214,29.9],[218,29.8],[222,29.7],[227,29.6],[231,29.5],[236,29.4],[241,29.3],[246,29.2],[251,29.1],[256,29.0],[261,28.9],[266,28.8],[272,28.7],[277,28.6],[283,28.5],[289,28.4],[294,28.3],[300,28.2],[306,28.1],[313,28.0],[319,27.9],[325,27.8],[332,27.7],[339,27.6],[346,27.5],[353,27.4],[360,27.3],[367,27.2],[374,27.1],[382,27.0],[390,26.9],[398,26.8],[406,26.7],[414,26.6],[422,26.5],[431,26.4],[440,26.3],[448,26.2],[458,26.1],[467,26.0],[476,25.9],[486,25.8],[496,25.7],[506,25.6],[516,25.5],[526,25.4],[537,25.3],[548,25.2],[559,25.1],[570,25.0],[582,24.9],[594,24.8],[606,24.7]];
/* Anexo 3 original — Quadro 1 (descanso no próprio local): limite superior de IBUTG por regime e atividade */
const Q1_ORIG = {
 cont:{rot:'Trabalho contínuo', leve:30.0, moderada:26.7, pesada:25.0},
 r4515:{rot:'45 min trabalho / 15 min descanso', leve:30.6, moderada:28.0, pesada:25.9},
 r3030:{rot:'30 min trabalho / 30 min descanso', leve:31.4, moderada:29.4, pesada:27.9},
 r1545:{rot:'15 min trabalho / 45 min descanso', leve:32.2, moderada:31.1, pesada:30.0}
};

