/* ===== Atualizações (2ª versão): textos literais, vibração ISO, LINACH pós-Decreto 10.410/2020, palavras-chave ===== */
const ISO_VIB = [
 {id:'iso97', tipo:'vci', rot:'ISO 2631-1:1997 — limite superior da zona de cautela (HGCZ)', v:0.9, un:'m/s² (8 h)', vdv:17, nota:'Anexo B da ISO 2631-1:1997: zona de cautela entre 0,45 e 0,9 m/s² para 8 h (VDV entre 8,5 e 17 m/s¹·⁷⁵). Acima do limite superior, riscos à saúde são prováveis.'},
 {id:'iso97i', tipo:'vci', rot:'ISO 2631-1:1997 — limite inferior da zona de cautela', v:0.45, un:'m/s² (8 h)', vdv:8.5, nota:'Limite inferior da zona de cautela: abaixo dele os efeitos à saúde não foram documentados.'},
 {id:'iso85', tipo:'vci', rot:'ISO 2631:1985 — limite de exposição (eixo z, 4–8 Hz)', v:0.63, un:'m/s² (8 h)', vdv:null, nota:'ISO 2631/1-1985: limite de exposição = 2 × fronteira de proficiência reduzida por fadiga (0,315 m/s² para 8 h, eixo vertical, 4–8 Hz).'},
 {id:'iso5349', tipo:'vmb', rot:'ISO 5349 (mãos e braços) — sem limite de tolerância', v:null, un:'', vdv:null, nota:'A ISO 5349 (1986/DIS e 5349-1:2001) traz relação dose-resposta (Anexo C: Dy = 31,8 · A(8)^−1,06 anos para 10% de prevalência de dedos brancos), não um LT. Por isso o Manual do INSS (2018) trata o período como qualitativo.'}
];


/* Células "mistas" do mapa: rótulo específico e explicação */
const MXX = {
 vibracao:{rot:'Atividade ou ISO', nota:'Vibração (1997–2014): o Decreto enquadra pela atividade (perfuratrizes e marteletes pneumáticos, cód. 2.0.2); a IN 128/2022 exige superar os limites das ISO 2631 e ISO/DIS 5349; o Manual do INSS (2018) trata o período como qualitativo. A partir de 13/08/2014 vale o LT do Anexo 8 da NR-15.'},
 rad_ion:{rot:'Atividade ou LT', nota:'Radiações ionizantes (após 05/03/1997): o Decreto lista atividades (cód. 2.0.3); a IN 128/2022 (art. 294) exige superar o LT do Anexo 5 da NR-15 (CNEN NN-3.01).'},
 chumbo:{rot:'Qualitativo ou LT', nota:'Chumbo: quantitativo pelo Anexo 11 da NR-15 (LT 0,1 mg/m³), mas algumas atividades estão no Anexo 13 e são avaliadas qualitativamente.'},
 mercurio:{rot:'Qualitativo ou LT', nota:'Mercúrio: formas inorgânicas pelo Anexo 11 (LT 0,04 mg/m³); compostos orgânicos pelo Anexo 13 (qualitativo).'},
 cloro:{rot:'Qualitativo ou LT', nota:'Cloro e compostos: cloro, cloreto de vinila e outros têm LT no Anexo 11; organoclorados e demais atividades do cód. 1.0.9 são avaliados qualitativamente. Cloreto de vinila e PCB são cancerígenos LINACH.'},
 outras:{rot:'Qualitativo ou LT', nota:'Outras substâncias (cód. 1.0.19): algumas têm LT no Anexo 11 (estireno, butadieno, acrilonitrila, TDI); as demais, como aminas aromáticas, são qualitativas. Várias são cancerígenas da LINACH.'}
};

(function patch(){
  const A = id => AGENTS.find(a=>a.id===id);
  /* artigos literais da IN 128/2022 por agente */
  const ART = {ruido:['292','290'], calor:['293'], vibracao:['296'], rad_ion:['294','295'], pressao:['300'], eletricidade:['301'], frio:['301'], umidade:['301'], rni:['301'], biologico:['299'], mineracao:['302'], categoria:['287']};
  AGENTS.forEach(a=>{ a.art = ART[a.id] || (a.engine==='quimico' ? (a.linach?['297','298']:['297']) : []); });

  /* VIBRAÇÃO: Decreto × IN × Manual */
  const v=A('vibracao');
  v.periodos=[
   ['até 05/03/1997','Dec. 53.831/64 (1.1.5) e 83.080/79 (1.1.4)','Perfuratrizes e marteletes pneumáticos; máquinas a ar comprimido acima de 120 golpes/min'],
   ['06/03/1997 a 09/09/2012','Dec. 2.172/97 e 3.048/99 (2.0.2)','Decreto: trabalhos com perfuratrizes e marteletes (cód. 2.0.0: LT especificados ou atividades descritas). IN: limites das ISO 2631 e ISO/DIS 5349'],
   ['10/09/2012 a 12/08/2014','Idem + NHO-09/NHO-10 facultadas','Metodologia Fundacentro já disponível; LT do Anexo 8 ainda não vigente'],
   ['a partir de 13/08/2014','Dec. 3.048/99 (2.0.2) + Anexo 8 da NR-15','VCI: aren > 1,1 m/s² ou VDVR > 21,0 m/s¹·⁷⁵; VMB: aren > 5 m/s²']];
  v.mx=['Q','X','X','L'];
  v.perito=[PERITO_PADRAO,
   'De 06/03/1997 a 12/08/2014, o Decreto enquadra os trabalhos com perfuratrizes e marteletes pneumáticos (2.0.2). Como o código 2.0.0 admite "exposição acima dos limites de tolerância especificados", a ferramenta também enquadra a medição acima da referência ISO escolhida.',
   'O EPI não atenua vibração de forma comprovada: a informação de EPI eficaz não afasta o enquadramento (Manual INSS 2018, item 2.7.1.5).'];
  v.inss=['IN 128/2022, art. 296, II: de 06/03/1997 a 12/08/2014, enquadra quando ultrapassados os limites das ISO 2631 e ISO/DIS 5349.',
   'Manual de Aposentadoria Especial (INSS, 2018): no mesmo período a avaliação é qualitativa, porque as ISO não definem limites de tolerância. Na prática, só perfuratrizes e marteletes pneumáticos.',
   'A partir de 13/08/2014: Anexo 8 da NR-15, com NHO-09 e NHO-10 (facultadas desde 10/09/2012).'];
  v.comp = {
    cols:['Período','Decreto (Anexo IV)','IN 128/2022','Manual INSS 2018'],
    rows:[
     ['até 05/03/1997','1.1.5 (53.831): > 120 golpes/min · 1.1.4 (83.080): perfuratrizes e marteletes','Qualitativo (1.1.4) ou quantitativo (120 golpes/min)','Idem'],
     ['06/03/1997 a 12/08/2014','2.0.2: perfuratrizes e marteletes pneumáticos; 2.0.0 aceita "LT especificados"','Quantitativo: limites das ISO 2631 e ISO/DIS 5349','Qualitativo: as ISO não fixam LT; só perfuratrizes e marteletes'],
     ['a partir de 13/08/2014','2.0.2 + art. 68, §11/§12: LT da NR-15 e metodologia Fundacentro','Anexo 8 da NR-15 (NHO-09/10)','Anexo 8: VMB aren > 5; VCI aren > 1,1 ou VDVR > 21,0']]
  };
  v.juris=['T:stj1307','T:stj1090'];

  /* QUÍMICOS / LINACH — Decreto 10.410/2020 */
  AGENTS.filter(a=>a.engine==='quimico').forEach(a=>{
    if(a.linach){
      a.periodos = a.periodos.filter(p=>!p[0].startsWith('a partir de 16/10/2013'));
      a.periodos.push(['16/10/2013 a 30/06/2020','Dec. 3.048/99, art. 68, §4º (red. Dec. 8.123/13) + LINACH Grupo 1','Cancerígeno: a presença com possibilidade de exposição basta; EPI não descaracteriza']);
      a.periodos.push(['a partir de 01/07/2020','Dec. 3.048/99, art. 68, §4º (red. Dec. 10.410/20)','Avaliação qualitativa, mas medidas de controle que eliminem a nocividade descaracterizam a exposição']);
    }
    a.inss = [
     'IN 128/2022, art. 297: até 05/03/1997, qualitativo por presunção (códigos 1.2.x dos Decretos 53.831/64 e 83.080/79); a partir de 06/03/1997, Anexo IV com os Anexos 11, 12, 13 e 13-A da NR-15; a partir de 01/01/2004, NHO-02, 03, 04 e 07.',
     'Art. 287, §4º: no Anexo IV, as atividades listadas para agentes químicos são exemplificativas (as demais são exaustivas).',
     'Art. 298 (cancerígenos): Grupo 1 da LINACH, com CAS e constante do Anexo IV, avaliação qualitativa para períodos a partir de 08/10/2014; a partir de 01/07/2020, medidas de controle que eliminem a nocividade podem descaracterizar a exposição.',
     'Arts. 290–291: EPI eficaz só é considerado em demonstrações ambientais a partir de 03/12/1998, com hierarquia de controle, CA válido, troca e higienização registradas.'];
  });

  /* palavras-chave para a busca */
  const KW = {
   ruido:['barulho','dosímetro','dosimetria','NEN','Lavg','NHO-01','decibel','dB'],
   calor:['IBUTG','forno','caldeira','fundição','forneiro','siderurgia','NHO-06','temperatura'],
   vibracao:['martelete','perfuratriz','caminhão','motorista','trator','ônibus','empilhadeira','VCI','VMB','aren','VDV','ISO 2631','ISO 5349','NHO-09','NHO-10'],
   rad_ion:['raio X','radiologia','radioterapia','nuclear','CNEN','NHO-05'],
   pressao:['mergulho','mergulhador','tubulão','hiperbárica','escafandro','ar comprimido'],
   eletricidade:['eletricista','alta tensão','250 V','energia elétrica','NR-10'],
   frio:['câmara frigorífica','frigorífico','gelo'],
   umidade:['alagado','encharcado','lavador','tinturaria','salina'],
   rni:['solda','soldador','ultravioleta','infravermelho','laser','micro-ondas'],
   arsenio:['arsina','arsênico','agrotóxico'],
   asbestos:['amianto','crisotila','fibrocimento','telha','lona de freio'],
   benzeno:['benzol','solvente','gasolina','coqueria','petroquímica','VRT'],
   berilio:['glicínio'],
   cadmio:['níquel-cádmio','bateria'],
   carvao:['piche','alcatrão','betume','breu','coque','óleo mineral','parafina','antraceno','negro de fumo','graxa','óleo lubrificante','óleo queimado'],
   chumbo:['solda','bateria','acumulador','tinta','litargírio','zarcão'],
   cloro:['PVC','cloreto de vinila','PCB','organoclorado','clorofórmio','tetracloreto de carbono','piscina'],
   cromo:['cromato','bicromato','cromagem','galvanoplastia','solda inox','curtume'],
   dissulfeto:['viscose','raiom','sulfeto de carbono'],
   fosforo:['organofosforado','agrotóxico','defensivo','fertilizante'],
   manganes:['eletrodo','solda','pilha'],
   mercurio:['amálgama','termômetro','lâmpada'],
   niquel:['niquelagem','galvanoplastia'],
   petroleo:['gasolina','diesel','querosene','nafta','refinaria','frentista','asfalto','gás natural','xisto'],
   silica:['quartzo','cristobalita','jateamento','areia','pedreira','cerâmica','refratário','mármore','granito'],
   outras:['estireno','butadieno','acrilonitrila','TDI','isocianato','n-hexano','óxido de etileno','MOCA','creosoto','aminas aromáticas','benzidina','borracha','pneu'],
   biologico:['hospital','enfermagem','enfermeiro','técnico de enfermagem','médico','dentista','laboratório','esgoto','lixo','coleta','gari','cemitério','coveiro','autópsia','vírus','bactéria'],
   mineracao:['mina','subsolo','minerador'],
   categoria:['motorista','vigilante','telefonista','soldador','professor','engenheiro','CTPS']
  };
  AGENTS.forEach(a=>a.kw=KW[a.id]||[]);

  /* novas teses / ajustes */
  TESES.tnu170.tese += ' Atenção: o Decreto 10.410/2020 (vigente desde 01/07/2020) passou a admitir a descaracterização por medidas de controle que eliminem a nocividade.';
})();

/* Anexo 1 da NR-15 — Quadro (nível dB(A) → minutos) */
const A1_QUADRO = [[85,480],[86,420],[87,360],[88,300],[89,270],[90,240],[91,210],[92,180],[93,160],[94,135],[95,120],[96,105],[98,75],[100,60],[102,45],[104,35],[105,30],[106,25],[108,20],[110,15],[112,10],[114,8],[115,7]];
MARCOS.sort((x,y)=>x.d<y.d?-1:1);
