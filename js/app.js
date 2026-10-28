/* ===== Interface ===== */
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ST = {E:'Especial', N:'Não especial', C:'Controverso', I:'Dados insuficientes'};
const MX = {Q:['Qualitativo','q'], L:['Limite (LT)','l'], X:['Misto','x'], N:['Não arrolado','n'], C:['Via judicial','c'], P:['Categoria','p']};
const agById = id => AGENTS.find(a=>a.id===id);
const brn = v => String(v).replace('.',',');
const fmtDias = d => { const t=amd(d); return t.a+' a '+t.m+' m '+t.d+' d'; };

const EXEMPLO = {nome:'Caso exemplo (fictício) — operador de produção', sexo:'H', rows:[
 {empresa:'Metalúrgica Alfa Ltda.', funcao:'Auxiliar de produção', ini:'1991-02-01', fim:'1996-12-31', agente:'ruido', tempo:25, epi:false, d:{lavg:88, te:480}},
 {empresa:'Metalúrgica Alfa Ltda.', funcao:'Operador de prensa', ini:'1997-01-01', fim:'2003-12-31', agente:'ruido', tempo:25, epi:true, d:{lavg:89, te:480}},
 {empresa:'Metalúrgica Alfa Ltda.', funcao:'Operador de prensa', ini:'2004-01-01', fim:'2011-06-30', agente:'ruido', tempo:25, epi:true, d:{lavg:86.5, te:528, ne3:84}},
 {empresa:'Fundição Beta S.A.', funcao:'Forneiro', ini:'2011-07-01', fim:'2020-03-31', agente:'calor', tempo:25, epi:false, d:{ibutg:28.9, ativ:'moderada', regime:'cont', m:300, fonte:'artificial'}},
 {empresa:'Ambiental Coleta Ltda.', funcao:'Coletor de resíduos', ini:'2020-04-01', fim:'2025-12-31', agente:'biologico', tempo:25, epi:false, d:{alinea:'g'}}
]};

let S = {gq:'', agq:'', tq:'', tab:'inicio', caso:JSON.parse(JSON.stringify(EXEMPLO)), ag:'ruido', a15:1, a16:'a2', tf:'todos', lib:'d3048_IV', q:'', ins:{}, per:{}};
try { const raw=localStorage.getItem('caracterizador:v1'); if(raw){ const o=JSON.parse(raw); if(o&&o.caso&&Array.isArray(o.caso.rows)) S.caso=o.caso; } } catch(e){}
function save(){ try{ localStorage.setItem('caracterizador:v1', JSON.stringify({caso:S.caso})); }catch(e){} }

const TABS = [['inicio','Início'],['painel','Painel'],['aposentadoria','Aposentadoria especial'],['agentes','Agentes nocivos'],['insalubridade','Insalubridade'],['periculosidade','Periculosidade'],['teses','Teses'],['biblioteca','Biblioteca']];

function chip(st, short){ return '<span class="chip st-'+st+'">'+(short?st==='E'?'Especial':st==='N'?'Não':st==='C'?'Controverso':'Faltam dados':ST[st])+'</span>'; }


/* ---------- INÍCIO (apresentação) ---------- */
function renderInicio(){
  const n = {ag:AGENTS.length, a11:A11.length, a13:A13FULL.filter(x=>x.g!=='nota').length, nr16:NR16.length, teses:Object.keys(TESES).length};
  const card=(href,eb,tit,txt,cta)=>'<a class="icard" href="#'+href+'"><span class="eyebrow">'+eb+'</span><h3>'+tit+'</h3><p>'+txt+'</p><span class="ilink">'+cta+' →</span></a>';
  return '<section class="hero"><div class="hero-in"><img class="hero-logo" alt="Grahl Consultoria e Treinamentos" src="'+BRAND.logo+'"><div class="hero-txt"><p class="eyebrow">Ferramenta didática · Elaboração de Laudos Técnicos</p><h2>Caracterização de agentes nocivos, do decreto ao laudo</h2><p>O Caracterizador Pericial reúne, num só lugar, a legislação previdenciária e trabalhista usada para caracterizar <b>aposentadoria especial</b>, <b>insalubridade</b> e <b>periculosidade</b>. Ele aplica as regras de cada período, compara o critério do perito com o do INSS e mostra a fundamentação de cada conclusão.</p><div class="hero-btns"><a class="btn" href="#aposentadoria">Começar uma análise</a><a class="btn ghost" href="#agentes">Consultar agentes nocivos</a><button class="btn ghost" data-focusg="1">Pesquisar em tudo</button></div></div></div>'+
   '<dl class="hero-num"><div><dt>'+n.ag+'</dt><dd>agentes com ficha e simulador</dd></div><div><dt>'+n.a11+'</dt><dd>substâncias do Anexo 11, com sinônimos</dd></div><div><dt>'+n.a13+'</dt><dd>atividades do Anexo 13</dd></div><div><dt>'+n.nr16+'</dt><dd>anexos da NR-16 estruturados</dd></div><div><dt>'+n.teses+'</dt><dd>teses, súmulas e OJs</dd></div></dl></section>'+
   '<section class="isec"><h2 class="ih">Objetivo</h2><p class="ilead">Apoiar alunos e profissionais na leitura técnica das normas: identificar qual regra vale em cada período, qual o limite de tolerância, qual a metodologia de avaliação e onde a jurisprudência diverge do INSS. A ferramenta não substitui o laudo; ela organiza o raciocínio que o laudo precisa demonstrar.</p>'+
   '<div class="icards">'+card('aposentadoria','Previdenciário','Aposentadoria especial','Divide cada período nos marcos legais (1964, 1979, 1995, 1997, 2003, 2019) e avalia pelo critério do perito e pela IN 128/2022, com totais e conversão até 13/11/2019.','Analisar um caso')+
   card('insalubridade','Trabalhista · NR-15','Insalubridade','Calculadoras de ruído (dose, Lavg, leituras), calor, vibração, Quadro 1 do Anexo 11 completo e as listas integrais dos Anexos 13 e 14.','Abrir a NR-15')+
   card('periculosidade','Trabalhista · NR-16','Periculosidade','Todos os anexos com seus itens, quadros e áreas de risco, exclusões e frequência da exposição (Súmula 364).','Abrir a NR-16')+'</div></section>'+
   '<section class="isec"><h2 class="ih">Como usar</h2><ol class="steps"><li><b>Pesquise</b><span>Digite no campo do topo um agente, substância, atividade ou tese, inclusive por sinônimo (toluol, amianto, H2S).</span></li><li><b>Consulte a ficha</b><span>Em Agentes nocivos, veja o enquadramento por período, o texto dos decretos, a IN 128 literal e as três leituras: perito, INSS e jurisprudência.</span></li><li><b>Simule</b><span>Informe período e medição na ficha ou monte o caso completo em Aposentadoria especial.</span></li><li><b>Imprima</b><span>Gere o relatório, a ficha ou a consulta no papel timbrado, em PDF ou papel.</span></li></ol></section>'+
   '<div class="grid2"><section class="isec panel"><h2 class="ih">Base normativa</h2><ul class="blist"><li>Lei 8.213/91 e Decreto 3.048/99 (Anexo IV), com Decretos 53.831/64, 83.080/79, 2.172/97, 4.882/03, 8.123/13 e 10.410/20</li><li>IN PRES/INSS 128/2022 e alterações (INs 133, 141, 170 e 212)</li><li>Manual de Aposentadoria Especial do INSS (2018)</li><li>NR-15 e NR-16 atualizadas, com a Portaria MTE 2.021/2025</li><li>NHO da Fundacentro (01, 06, 09, 10 e demais) e ISO 2631/5349</li><li>LINACH (Portaria Interministerial 9/2014)</li><li>Teses do STF, STJ, TNU e súmulas e OJs do TST</li></ul><p class="fine">Base conferida em 28/10/2026. Confira sempre a redação oficial antes de citar.</p></section>'+
   '<section class="isec panel about"><h2 class="ih">Sobre a Grahl</h2><img class="about-logo" alt="" src="'+BRAND.logo+'"><p><b>Grahl Consultoria e Treinamentos</b> é conduzida por <b>Rogério Grahl</b>, Engenheiro Químico e Engenheiro de Segurança do Trabalho, com cerca de 30 anos de experiência.</p><ul class="blist"><li>Perícia judicial previdenciária e trabalhista</li><li>Assistência técnica em ações de insalubridade e periculosidade</li><li>LTCAT, PPP e laudos de condições ambientais</li><li>Consultoria industrial em segurança e higiene ocupacional</li><li>Treinamentos e docência em pós-graduação</li></ul><p class="small">CREA-SC 10392239/D · visto CREA-PR 081075</p><div class="contacts"><a href="https://grahlconsultoria.com.br/" target="_blank" rel="noopener">grahlconsultoria.com.br</a><span>Instagram @rogerio_grahl</span><span>LinkedIn e Facebook: Rogério Grahl</span></div></section></div>'+
   '<p class="fine center">Ferramenta didática desenvolvida para a disciplina Elaboração de Laudos Técnicos. Os resultados não substituem a análise do caso concreto, a inspeção do local de trabalho nem o laudo técnico assinado por profissional habilitado.</p>';
}

/* ---------- PAINEL ---------- */
function renderPainel(){
  const t=totais(S.caso), dif=t.perito.dias-t.inss.dias;
  const card=(lab,val,sub,cls='')=>'<div class="stat '+cls+'"><span class="lab">'+lab+'</span><span class="val">'+val+'</span><span class="sub">'+sub+'</span></div>';
  let h='<section class="intro"><div><p class="eyebrow">Caso carregado</p><h2>'+esc(S.caso.nome||'Caso sem nome')+'</h2><p class="muted">'+S.caso.rows.length+' período(s) · '+(S.caso.sexo==='M'?'mulher':'homem')+' · edite na aba <a href="#aposentadoria">Aposentadoria especial</a></p></div></section>';
  h+='<div class="stats">'+
    card('Tempo especial · critério do perito', fmtDias(t.perito.dias), t.perito.dias.toLocaleString('pt-BR')+' dias', 'acc')+
    card('Tempo especial · INSS (IN 128/2022)', fmtDias(t.inss.dias), t.inss.dias.toLocaleString('pt-BR')+' dias')+
    card('Diferença entre os critérios', fmtDias(Math.abs(dif)), (dif>=0?'a favor do critério do perito':'a favor do INSS')+' · '+t.diverg+' trecho(s) divergente(s)')+
    card('Acréscimo por conversão até 13/11/2019', fmtDias(t.perito.conv), 'perito · INSS: '+fmtDias(t.inss.conv))+
  '</div>';
  h+='<section class="panel"><div class="ph"><h3>Linha do tempo do caso</h3><div class="legend">'+['E','N','C','I'].map(s=>'<span><i class="sw st-'+s+'"></i>'+ST[s]+'</span>').join('')+'</div></div><div class="scrollx">'+timelineSVG()+'</div></section>';
  h+='<div class="grid2"><section class="panel"><div class="ph"><h3>Mapa de enquadramento</h3><p class="muted small">Como cada agente é caracterizado em cada fase da legislação. Toque no agente para abrir a ficha.</p></div><div class="scrollx">'+matriz()+'</div></section>';
  h+='<section class="panel"><div class="ph"><h3>Marcos legais</h3></div><ol class="marcos">'+MARCOS.map(m=>'<li><time>'+fmtBR(m.d)+'</time><div><b>'+esc(m.t)+'</b><span>'+esc(m.s)+'</span></div></li>').join('')+'</ol></section></div>';
  return h;
}
function timelineSVG(){
  const segs=[]; for(const row of S.caso.rows){ const ag=agById(row.agente); if(!ag) continue; const r=avaliar(row,ag); r.segs.forEach(s=>segs.push({...s, ag:ag.nome, row})); }
  if(!segs.length) return '<p class="muted pad">Inclua períodos na aba Aposentadoria especial.</p>';
  const y0=+segs.reduce((m,s)=>s.ini<m?s.ini:m,'9999').slice(0,4), y1=+segs.reduce((m,s)=>s.fim>m?s.fim:m,'0000').slice(0,4)+1;
  const W=1000, L=92, Rr=16, x=d=>{ const ms=toMs(d), a=Date.UTC(y0,0,1), b=Date.UTC(y1,0,1); return L+(ms-a)/(b-a)*(W-L-Rr); };
  const H=190, lanes=[['perito','Perito',64],['inss','INSS',112]];
  let g='<svg class="tl" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Linha do tempo dos períodos analisados">';
  const step=(y1-y0)>24?5:(y1-y0)>12?2:1;
  for(let y=y0;y<=y1;y++){ const xx=x(y+'-01-01'); if((y-y0)%step===0){ g+='<line class="grid" x1="'+xx+'" x2="'+xx+'" y1="44" y2="140"/><text class="tick" x="'+xx+'" y="160" text-anchor="middle">'+y+'</text>'; } }
  const mk=[['1997-03-05','05/03/1997'],['2003-11-18','18/11/2003'],['2019-11-13','EC 103']];
  mk.forEach(([d,l],k)=>{ const xx=x(d); if(xx<L||xx>W-Rr) return; g+='<line class="marco" x1="'+xx+'" x2="'+xx+'" y1="30" y2="140"/><text class="mlab" x="'+xx+'" y="'+(22)+'" text-anchor="middle">'+l+'</text>'; });
  lanes.forEach(([k,lab,yy])=>{ g+='<text class="lane" x="0" y="'+(yy+15)+'">'+lab+'</text>';
    segs.forEach(s=>{ const a=x(s.ini), b=x(addDays(s.fim,1)); g+='<rect class="seg st-'+s[k].st+'" x="'+a.toFixed(1)+'" y="'+yy+'" width="'+Math.max(1.5,b-a-1).toFixed(1)+'" height="24" rx="3"><title>'+esc(s.ag+' · '+fmtBR(s.ini)+' a '+fmtBR(s.fim)+' · '+ST[s[k].st]+' — '+s[k].txt)+'</title></rect>'; }); });
  g+='<text class="tick" x="'+L+'" y="180">Passe o cursor ou toque nos trechos para ver o fundamento.</text></svg>';
  return g;
}
function mxCell(a,m){ if(m!=='X'||!MXX[a.id]) return '<span class="mxc mx-'+MX[m][1]+'">'+MX[m][0]+'</span>'; const k=Object.keys(MXX).filter(id=>agById(id)).indexOf(a.id)+1; return '<span class="mxc mx-x" title="'+esc(MXX[a.id].nota)+'">'+esc(MXX[a.id].rot)+' <sup>'+k+'</sup></span>'; }
function matriz(){
  const cols=['até 05/03/1997','06/03/1997 a 18/11/2003','19/11/2003 a 13/11/2019','após 13/11/2019'];
  let h='<table class="mx"><thead><tr><th>Agente</th>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
  for(const g of GRUPOS){ h+='<tr class="grp"><td colspan="5">'+g+'</td></tr>';
    AGENTS.filter(a=>a.grupo===g).forEach(a=>{ h+='<tr><td><a href="#agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a></td>'+a.mx.map(m=>'<td>'+mxCell(a,m)+'</td>').join('')+'</tr>'; }); }
  const notas=Object.keys(MXX).filter(id=>agById(id)).map((id,k)=>'<li id="mxn-'+id+'"><b>'+(k+1)+'</b> '+esc(MXX[id].nota)+'</li>').join('');
  return h+'</tbody></table><div class="mxleg"><p><b>Como ler:</b> <span class="mxc mx-q">Qualitativo</span> basta a exposição na atividade descrita · <span class="mxc mx-l">Limite (LT)</span> exige medição acima do limite de tolerância · <span class="mxc mx-x">Atividade ou LT</span> o critério depende da norma ou do composto (ver nota numerada) · <span class="mxc mx-c">Via judicial</span> fora do Anexo IV, só com prova técnica em juízo · <span class="mxc mx-n">Não arrolado</span> sem enquadramento · <span class="mxc mx-p">Categoria</span> pela profissão, até 28/04/1995.</p><ol class="mxnotas">'+notas+'</ol></div>';
}

/* ---------- APOSENTADORIA (caso) ---------- */
function agentSelect(v){
  return GRUPOS.map(g=>'<optgroup label="'+g+'">'+AGENTS.filter(a=>a.grupo===g).map(a=>'<option value="'+a.id+'"'+(a.id===v?' selected':'')+'>'+esc(a.nome)+'</option>').join('')+'</optgroup>').join('');
}
function fld(i,f,lab,val,type='number',extra=''){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="'+type+'" data-r="'+i+'" data-f="'+f+'" value="'+esc(val??'')+'" '+extra+'></label>'; }
function sel(i,f,lab,val,opts){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><select id="'+id+'" data-r="'+i+'" data-f="'+f+'">'+opts.map(([k,t])=>'<option value="'+k+'"'+(String(val??'')===String(k)?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>'; }
function cb(i,f,lab,val){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="cb" for="'+id+'"><input id="'+id+'" type="checkbox" data-r="'+i+'" data-f="'+f+'"'+(val?' checked':'')+'><span>'+lab+'</span></label>'; }
function campos(row,i){
  const a=agById(row.agente), d=row.d||{};
  switch(a.engine){
    case 'ruido': { const mr=d.mr||'lavg';
      let h=sel(i,'d.mr','Como a medição foi informada',mr,[['lavg','Lavg informado (laudo/PPP)'],['dose','Dose do dosímetro (%)'],['nps','Leituras pontuais (NPS × tempo)']])+fld(i,'d.te','Jornada Te (min)',d.te??480,'number','step="1"');
      if(mr==='lavg') h+=fld(i,'d.lavg','Lavg dB(A) · q = 5',d.lavg,'number','step="0.1" inputmode="decimal"')+fld(i,'d.ne3','NE q = 3 (NHO-01) · opcional',d.ne3,'number','step="0.1" inputmode="decimal"');
      if(mr==='dose') h+=fld(i,'d.dose5','Dose q = 5 (%)',d.dose5,'number','step="0.1"')+fld(i,'d.tm','Tempo de medição (min)',d.tm??d.te??480,'number','step="1"')+fld(i,'d.dose3','Dose q = 3 (%) · opcional',d.dose3,'number','step="0.1"');
      if(mr==='nps'){ const rows=npsRows(d); const n=Math.max(rows.length,1);
        h+='<div class="npsbox wide2"><table class="pt calc"><thead><tr><th>NPS dB(A)</th><th>Tempo (min)</th></tr></thead><tbody>'+Array.from({length:n},(_,k)=>'<tr><td><input type="number" step="0.1" id="r'+i+'-nps-'+k+'-0" data-r="'+i+'" data-f="d.nps.'+k+'.0" value="'+esc(rows[k]?rows[k][0]??'':'')+'" aria-label="NPS '+(k+1)+'"></td><td><input type="number" step="1" id="r'+i+'-nps-'+k+'-1" data-r="'+i+'" data-f="d.nps.'+k+'.1" value="'+esc(rows[k]?rows[k][1]??'':'')+'" aria-label="Tempo '+(k+1)+'"></td></tr>').join('')+'</tbody></table><div class="btns"><button class="ghost sm" data-npsr="'+i+'">Adicionar leitura</button><button class="ghost sm" data-npsx="'+i+'">Remover última</button></div><p class="fine">Lavg = 16,61·log[(1/T)·Σ tᵢ·10^(Lᵢ/16,61)]; NE (q = 3) = 10·log[(1/T)·Σ tᵢ·10^(Lᵢ/10)].</p></div>'; }
      return h; }
    case 'calor': return fld(i,'d.ibutg','IBUTG ou TE (°C)',d.ibutg,'number','step="0.1"')+sel(i,'d.fonte','Fonte de calor',d.fonte||'artificial',[['artificial','Fonte artificial'],['fechado','Ambiente fechado sem fonte artificial'],['ceu','Céu aberto, só carga solar']])+sel(i,'d.ativ','Atividade (Anexo 3 original)',d.ativ||'moderada',[['leve','Leve'],['moderada','Moderada'],['pesada','Pesada']])+sel(i,'d.regime','Regime (Quadro 1 original)',d.regime||'cont',Object.entries(Q1_ORIG).map(([k,v])=>[k,v.rot]))+fld(i,'d.m','M (W) · a partir de 11/12/2019',d.m,'number','step="1"')+cb(i,'d.caldeira','Alimentação de caldeira a carvão ou lenha (até 1997)',d.caldeira);
    case 'vibracao': return sel(i,'d.tipo','Tipo',d.tipo||'vci',[['vci','Corpo inteiro (VCI)'],['vmb','Mãos e braços (VMB)']])+fld(i,'d.aren','aren (m/s²)',d.aren,'number','step="0.01"')+fld(i,'d.vdv','VDVR (m/s¹·⁷⁵)',d.vdv,'number','step="0.1"')+sel(i,'d.iso','Referência ISO (1997–2014)',d.iso||'iso97',ISO_VIB.filter(x=>x.tipo!=='vmb').map(x=>[x.id,x.rot]))+cb(i,'d.martelete','Perfuratriz ou martelete pneumático',d.martelete);
    case 'radion': return cb(i,'d.cond','Atividade descrita (2.0.3 / 1.1.3)',d.cond)+sel(i,'d.lt','Acima do LT do Anexo 5?',d.lt||'',[['','Não informado'],['sim','Sim'],['nao','Não']]);
    case 'eletricidade': return cb(i,'d.cond','Exposição permanente acima de 250 V',d.cond);
    case 'ate97': case 'quali': return cb(i,'d.cond','Condição ou atividade descrita no decreto',d.cond);
    case 'categoria': return cb(i,'d.cond','Atividade ou grupo profissional listado',d.cond)+fld(i,'d.cod','Código (ex.: 2.4.4)',d.cod,'text');
    case 'quimico': { const modos=[['qual','Qualitativo (Anexo 13/13-A)'],['quant','Quantitativo (Anexos 11/12)']]; if(a.linach) modos.push(['linach','Cancerígeno LINACH Grupo 1']);
      return sel(i,'d.modo','Forma de avaliação',d.modo||a.modo,modos)+cb(i,'d.cond','Exposição nas operações/atividades descritas',d.cond)+fld(i,'d.conc','Concentração',d.conc,'number','step="any"')+fld(i,'d.lt','LT (mesma unidade)',d.lt,'number','step="any"'); }
    case 'biologico': return cb(i,'d.saude97','Até 1997: contato com doentes, animais ou materiais infectocontagiantes',d.saude97)+sel(i,'d.alinea','A partir de 06/03/1997: alínea do 3.0.1',d.alinea||'',[['','Nenhuma'],['a','a) estabelecimentos de saúde'],['b','b) animais infectados / soros e vacinas'],['c','c) autópsia, anatomia, anátomo-histologia'],['d','d) exumação; resíduos de animais'],['e','e) galerias, fossas e tanques de esgoto'],['f','f) esvaziamento de biodigestores'],['g','g) coleta e industrialização do lixo']]);
  }
  return '';
}
function rowCard(row,i){
  const a=agById(row.agente);
  return '<article class="row" data-i="'+i+'"><header><span class="idx">'+String(i+1).padStart(2,'0')+'</span><div class="rtt"><b>'+esc(row.funcao||'Função')+'</b><span>'+esc(row.empresa||'Empresa')+'</span></div><button class="ghost sm" data-del="'+i+'" aria-label="Remover período '+(i+1)+'">Remover</button></header>'+
   '<div class="fields">'+fld(i,'empresa','Empresa',row.empresa,'text')+fld(i,'funcao','Função',row.funcao,'text')+fld(i,'ini','Início',row.ini,'date')+fld(i,'fim','Fim',row.fim,'date')+
   '<label class="f wide" for="r'+i+'-agente"><span>Agente nocivo</span><select id="r'+i+'-agente" data-r="'+i+'" data-f="agente" data-re="1">'+agentSelect(row.agente)+'</select></label>'+
   sel(i,'tempo','Tempo exigido',row.tempo||a.tempo,[['25','25 anos'],['20','20 anos'],['15','15 anos']])+
   (a.engine==='ruido'?'<p class="note">Ruído: EPI não descaracteriza (STF, Tema 555).</p>':cb(i,'epi','EPI eficaz informado no PPP/LTCAT',row.epi))+
   '</div><div class="fields ag">'+campos(row,i)+'</div><div class="res" id="res-'+i+'">'+resTable(row)+'</div></article>';
}
function resTable(row){
  const a=agById(row.agente); const r=avaliar(row,a);
  if(r.erro) return '<p class="warn">'+r.erro+'</p>';
  const rinfo = a.engine==='ruido' ? ruidoDerive(row.d||{}).info : '';
  return (rinfo?'<p class="rinfo">'+esc(rinfo)+'</p>':'')+'<div class="scrollx"><table class="rt"><thead><tr><th>Trecho</th><th>Dias</th><th>Base</th><th>Critério do perito</th><th>INSS</th></tr></thead><tbody>'+
   r.segs.map(s=>'<tr'+(s.perito.st!==s.inss.st?' class="dv"':'')+'><td class="mono">'+fmtBR(s.ini)+'<br>'+fmtBR(s.fim)+'</td><td class="mono">'+s.dias.toLocaleString('pt-BR')+'</td><td>'+esc(s.base)+'</td><td>'+chip(s.perito.st)+'<small>'+esc(s.perito.txt)+'</small></td><td>'+chip(s.inss.st)+'<small>'+esc(s.inss.txt)+'</small></td></tr>').join('')+'</tbody></table></div>';
}
function totBar(){
  const t=totais(S.caso);
  return '<div class="totbar"><div><span>Perito</span><b>'+fmtDias(t.perito.dias)+'</b></div><div><span>INSS</span><b>'+fmtDias(t.inss.dias)+'</b></div><div><span>Conversão até 13/11/2019 (perito)</span><b>+ '+fmtDias(t.perito.conv)+'</b></div><div><span>Trechos divergentes</span><b>'+t.diverg+'</b></div></div>';
}
function renderCaso(){
  const c=S.caso;
  return '<section class="intro"><div><p class="eyebrow">Análise de caso</p><h2>Aposentadoria especial por período</h2><p class="muted">Cada período é dividido nos marcos legais do agente e avaliado por dois critérios: o do perito, com a metodologia do professor, e o do INSS (IN 128/2022). Fatores de conversão do art. 70 do Decreto 3.048/99, só até 13/11/2019.</p></div></section>'+
  '<div class="casehead"><label class="f wide" for="c-nome"><span>Identificação do caso</span><input id="c-nome" type="text" data-c="nome" value="'+esc(c.nome)+'"></label>'+
  '<label class="f" for="c-sexo"><span>Segurado</span><select id="c-sexo" data-c="sexo"><option value="H"'+(c.sexo!=='M'?' selected':'')+'>Homem</option><option value="M"'+(c.sexo==='M'?' selected':'')+'>Mulher</option></select></label>'+
  '<div class="btns"><button data-act="add">Adicionar período</button><button class="ghost" data-act="ex">Carregar exemplo</button><button class="ghost" data-act="clr">Limpar caso</button><button class="ghost" data-act="copy">Copiar quadro-resumo</button><button class="printbtn" data-print="caso">Imprimir relatório</button></div></div>'+
  '<div id="totbar">'+totBar()+'</div><div class="rows">'+c.rows.map(rowCard).join('')+'</div>'+
  (c.rows.length?'':'<p class="empty">Nenhum período. Use <b>Adicionar período</b> ou <b>Carregar exemplo</b>.</p>')+
  '<p class="fine">Os dois critérios aplicam a informação de EPI eficaz a partir de 03/12/1998, conforme o STJ (Tema 1090), salvo ruído e cancerígenos LINACH. Contagem em dias corridos; a conversão em anos, meses e dias usa 365/30 dias.</p>';
}
function resumoTexto(){
  const linhas=['Período\tEmpresa\tFunção\tAgente\tBase legal\tCritério do perito\tINSS'];
  S.caso.rows.forEach(row=>{ const a=agById(row.agente); avaliar(row,a).segs.forEach(s=>linhas.push(fmtBR(s.ini)+' a '+fmtBR(s.fim)+'\t'+(row.empresa||'')+'\t'+(row.funcao||'')+'\t'+a.nome+'\t'+s.base+'\t'+ST[s.perito.st]+' — '+s.perito.txt+'\t'+ST[s.inss.st]+' — '+s.inss.txt)); });
  const t=totais(S.caso); linhas.push('','Tempo especial (perito): '+fmtDias(t.perito.dias)+' ('+t.perito.dias+' dias)','Tempo especial (INSS): '+fmtDias(t.inss.dias)+' ('+t.inss.dias+' dias)');
  return linhas.join('\n');
}

/* ---------- AGENTES ---------- */
const SIM_DEF = {ruido:{mr:'lavg',lavg:88,te:480}, calor:{ibutg:28.5,ativ:'moderada',regime:'cont',m:300,fonte:'artificial'}, vibracao:{tipo:'vci',aren:0.95,iso:'iso97'}, biologico:{alinea:'a',saude97:true}};
function simRow(){ S.sim=S.sim||{}; const a=agById(S.ag); if(!S.sim[a.id]) S.sim[a.id]={agente:a.id, ini:'1990-01-01', fim:'2025-12-31', tempo:a.tempo, epi:false, d:JSON.parse(JSON.stringify(SIM_DEF[a.id]||(a.engine==='quimico'?{modo:a.modo,cond:true}:{cond:true})))}; return S.sim[a.id]; }
function simHtml(a){
  const row=simRow();
  return '<section class="simbox"><div class="fhead"><h3>Simular enquadramento</h3><div class="btns"><button class="ghost sm" data-simrst="1">Restaurar exemplo</button><button class="ghost sm" data-simuse="1">Incluir na análise de caso</button></div></div><p class="muted small">Informe um período e as condições de exposição: a ferramenta divide o período nos marcos legais deste agente e mostra o resultado pelo critério do perito e pelo INSS.</p>'+
   '<div class="fields">'+fld('s','ini','Início',row.ini,'date')+fld('s','fim','Fim',row.fim,'date')+sel('s','tempo','Tempo exigido',row.tempo||a.tempo,[['25','25 anos'],['20','20 anos'],['15','15 anos']])+(a.engine==='ruido'?'<p class="note">Ruído: EPI não descaracteriza (STF, Tema 555).</p>':cb('s','epi','EPI eficaz informado no PPP/LTCAT',row.epi))+'</div><div class="fields ag">'+campos(row,'s')+'</div><div class="res" id="res-s">'+resTable(row)+'</div></section>';
}

function libRows(tab, codes){ return (LIB[tab]||[]).filter(r=>codes.includes(r[0])); }
function renderAgentes(){
  const a=agById(S.ag);
  const aq=normTxt(S.agq||''); const vis=x=>!aq||normTxt(x.nome+' '+(x.kw||[]).join(' ')+' '+x.c53.join(' ')+' '+(x.cIV||'')).includes(aq);
  let list='<nav class="aglist" aria-label="Agentes"><label class="f" for="agq"><span>Filtrar agentes</span><input id="agq" type="search" data-st="agq" value="'+esc(S.agq||'')+'" placeholder="Ex.: solda, amianto, 1.0.19"></label><label class="f agsel" for="agsel"><span>Agente</span><select id="agsel" data-agsel="1">'+GRUPOS.map(g=>'<optgroup label="'+g+'">'+AGENTS.filter(x=>x.grupo===g&&vis(x)).map(x=>'<option value="'+x.id+'"'+(x.id===a.id?' selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</optgroup>').join('')+'</select></label>'+GRUPOS.map(g=>{ const xs=AGENTS.filter(x=>x.grupo===g&&vis(x)); return xs.length?'<div class="agg"><p>'+g+'</p>'+xs.map(x=>'<button data-ag="'+x.id+'" class="'+(x.id===a.id?'on':'')+'" aria-pressed="'+(x.id===a.id)+'"><span>'+esc(x.nome)+'</span><small>'+esc(x.cIV?x.cIV.split(' / ')[0]:(x.c53[0]||''))+'</small></button>').join('')+'</div>':''; }).join('')+(AGENTS.some(vis)?'':'<p class="agempty">Nenhum agente encontrado.</p>')+'</nav>';
  const codes=[...(a.c53.length?['53.831: '+a.c53.join(', ')]:[]),...(a.c83.length?['83.080: '+a.c83.join(', ')]:[]),(a.cIV?'Anexo IV: '+a.cIV:'Fora do Anexo IV'),'NR-15: '+a.nr15];
  let f='<article class="ficha"><header><div class="fhead"><p class="eyebrow">'+a.grupo+'</p><button class="printbtn" data-print="ficha">Imprimir ficha</button></div><h2>'+esc(a.nome)+'</h2><div class="codes">'+codes.map(c=>'<span>'+esc(c)+'</span>').join('')+'<span>'+a.tempo+' anos</span></div></header>';
  f+='<div class="mxrow">'+['até 05/03/1997','06/03/1997–18/11/2003','19/11/2003–13/11/2019','após 13/11/2019'].map((p,k)=>'<div><span>'+p+'</span><b class="mxc mx-'+MX[a.mx[k]][1]+'">'+(a.mx[k]==='X'&&MXX[a.id]?esc(MXX[a.id].rot):MX[a.mx[k]][0])+'</b></div>').join('')+'</div>'+(a.mx.includes('X')&&MXX[a.id]?'<p class="mxnote"><b>Por que "'+esc(MXX[a.id].rot)+'"?</b> '+esc(MXX[a.id].nota)+'</p>':'');
  f+='<h3>Enquadramento por período</h3><div class="scrollx"><table class="pt"><thead><tr><th>Período</th><th>Norma</th><th>Critério</th></tr></thead><tbody>'+a.periodos.map(p=>'<tr><td class="mono">'+esc(p[0])+'</td><td>'+esc(p[1])+'</td><td>'+esc(p[2])+'</td></tr>').join('')+'</tbody></table></div>';
  f+=simHtml(a);
  const jur=(a.juris||[]).map(j=>TESES[j.slice(2)]).filter(Boolean);
  f+='<h3>Três leituras</h3><div class="tri"><section class="col perito"><h4>Critério do perito</h4><ul>'+a.perito.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section><section class="col inss"><h4>INSS · IN 128/2022</h4><ul>'+a.inss.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section><section class="col juris"><h4>Jurisprudência</h4>'+(jur.length?'<ul>'+jur.map(t=>'<li><b>'+t.trib+', '+t.num+'</b> — '+esc(t.tese)+'</li>').join('')+'</ul>':'<p class="muted">Sem tese específica cadastrada.</p>')+'</section></div>';
  /* textos legais */
  let leg='';
  const blk=(tit,rows,cols)=>rows.length?'<details open><summary>'+tit+'</summary>'+rows.map(r=>'<div class="lt"><span class="cd">'+esc(r[0])+'</span><div>'+cols.map(k=>r[k]?'<p>'+esc(r[k])+'</p>':'').join('')+'</div></div>').join('')+'</details>':'';
  if(a.id==='categoria'){ leg+=blk('Decreto 53.831/64 — atividades profissionais (2.x)',LIB.d53831_at,[1,2,4]); leg+=blk('Decreto 83.080/79 — Anexo II',LIB.d83080_II,[1,2]); }
  else { leg+=blk('Decreto 53.831/64',libRows('d53831_ag',a.c53),[1,2,3,4,5]); leg+=blk('Decreto 83.080/79 — Anexo I',libRows('d83080_I',a.c83),[1,2,3]);
    const civ=a.cIV?a.cIV.split(' / '):[]; leg+=blk('Decreto 2.172/97 — Anexo IV',libRows('d2172_IV',civ),[1,2]); leg+=blk('Decreto 3.048/99 — Anexo IV',libRows('d3048_IV',civ),[1,2]); }
  const can=(LIB.ag_cancer||[]).filter(r=>a.cIV&&r[1]===a.cIV); if(can.length) leg+='<details><summary>LINACH Grupo 1 relacionados (com CAS)</summary><div class="scrollx"><table class="pt"><thead><tr><th>LINACH</th><th>CAS</th></tr></thead><tbody>'+can.map(r=>'<tr><td>'+esc(r[2])+'</td><td class="mono pre">'+esc(r[3])+'</td></tr>').join('')+'</tbody></table></div></details>';
  const ex=(a.sheet&&LIB.extras[a.sheet])||[]; const exb=ex.filter(b=>/MANUAL|CONSIDERA/.test(b.h));
  if(exb.length) leg+='<details><summary>Manual de Aposentadoria Especial (INSS, 2018) — trechos</summary>'+exb.map(b=>'<div class="lt"><div><p class="eyebrow">'+esc(b.h)+'</p><p>'+esc(b.t)+'</p></div></div>').join('')+'</details>';
  if(a.comp) f+='<h3>Decreto × IN × Manual do INSS</h3><div class="scrollx"><table class="pt cmp"><thead><tr>'+a.comp.cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+a.comp.rows.map(r=>'<tr>'+r.map((c,k)=>'<td'+(k===0?' class="mono"':'')+'>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  if(a.id==='vibracao') f+='<h3>Referências ISO para 06/03/1997 a 12/08/2014</h3><div class="isogrid">'+ISO_VIB.map(x=>'<div class="iso"><b>'+esc(x.rot)+'</b>'+(x.v!==null?'<span class="isov">'+String(x.v).replace('.',',')+' '+x.un+(x.vdv?' · VDV '+String(x.vdv).replace('.',',')+' m/s¹·⁷⁵':'')+'</span>':'<span class="isov">sem LT</span>')+'<p>'+esc(x.nota)+'</p></div>').join('')+'</div><p class="fine">A IN 128/2022 não diz qual edição ou qual valor da ISO usar. Na análise de caso, escolha a referência no campo "Referência ISO"; o padrão é o limite superior da zona de cautela da ISO 2631-1:1997.</p>';
  if(a.art&&a.art.length) f+='<details class="lit"><summary>Texto literal da IN PRES/INSS 128/2022 — art. '+a.art.join(', ')+'</summary>'+a.art.map(n=>(IN128[n]||[]).map((p,k)=>'<p'+(k===0?' class="art0"':'')+'>'+esc(p)+'</p>').join('')).join('<hr>')+(a.art.includes('293')?'<p class="fine">Redação dada pela IN PRES/INSS 141/2022.</p>':'')+'</details>';
  f+='<h3>Texto das normas</h3>'+(leg||'<p class="muted">Sem texto cadastrado.</p>')+'<p class="fine">Textos transcritos das planilhas originais do curso. Confira sempre a redação oficial no Planalto.</p></article>';
  return '<div class="agwrap">'+list+f+'</div>';
}

/* ---------- INSALUBRIDADE ---------- */
const GRAU = {máximo:40, médio:20, mínimo:10};
function insv(k,def){ const v=S.ins[k]; return v===undefined?def:v; }
function iin(k,lab,def,attrs='step="any"'){ return '<label class="f" for="i-'+k+'"><span>'+lab+'</span><input id="i-'+k+'" type="number" data-ins="'+k+'" value="'+esc(insv(k,def))+'" '+attrs+'></label>'; }
function isel(k,lab,def,opts){ const v=insv(k,def); return '<label class="f" for="i-'+k+'"><span>'+lab+'</span><select id="i-'+k+'" data-ins="'+k+'">'+opts.map(([a,b])=>'<option value="'+a+'"'+(String(v)===String(a)?' selected':'')+'>'+esc(b)+'</option>').join('')+'</select></label>'; }
function icb(k,lab){ return '<label class="cb" for="i-'+k+'"><input id="i-'+k+'" type="checkbox" data-ins="'+k+'"'+(insv(k,false)?' checked':'')+'><span>'+lab+'</span></label>'; }
function resultado(ok,grau,txt){
  const pct=GRAU[grau]; const base=+(insv('base','')||0);
  const val= ok&&pct&&base ? ' · R$ '+(base*pct/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' por mês' : '';
  return '<div class="verdict '+(ok===null?'v-i':ok?'v-e':'v-n')+'"><b>'+(ok===null?'Faltam dados':ok?'Insalubre — grau '+grau+(pct?' ('+pct+'%)':''):'Não caracteriza insalubridade')+val+'</b><p>'+txt+'</p></div>';
}
function tmaxQuadro(L){ if(L<85) return Infinity; for(const [n,t] of A1_QUADRO){ if(n>=L) return t; } return 7; }
function calcIns(an){
  const n=v=>num(insv(v,''));
  switch(an.calc){
    case 'ruido': {
      const m1=insv('m1','nps');
      const modoSel=isel('m1','Como a medição foi informada','nps',[['nps','Leituras pontuais (NPS × tempo)'],['dose','Dose do dosímetro (%)'],['lavg','Lavg (q = 5) e jornada']]);
      if(m1!=='nps'){
        const te=num(insv('te1',480)); let D=null, lavg=null, extra='';
        if(m1==='dose'){ const dm=num(insv('dm','')), tm=num(insv('tm1',480)); if(dm!==null&&tm){ D=dm/100*te/tm; lavg=85+16.61*log10(dm/100*480/tm); extra='Dose projetada para a jornada = dose medida × Te/Tm.'; } }
        else { const L=num(insv('lv','')); if(L!==null){ lavg=L; D=(te/480)*Math.pow(2,(L-85)/5); extra='Dose = (Te/480) × 2^((Lavg − 85)/5).'; } }
        const nen = D!==null&&D>0 ? 85+16.61*log10(D) : null;
        const body=modoSel+(m1==='dose'?iin('dm','Dose medida (%)','','step="0.1"')+iin('tm1','Tempo de medição Tm (min)',480,'step="1"'):iin('lv','Lavg dB(A) · q = 5','','step="0.1"'))+iin('te1','Jornada Te (min)',480,'step="1"');
        return body+'<div class="kv"><div><span>Dose na jornada</span><b>'+(D===null?'—':(D*100).toFixed(1).replace('.',',')+'%')+'</b></div><div><span>Lavg</span><b>'+(lavg===null?'—':f1(lavg))+' dB(A)</b></div><div><span>NEN 8 h (q = 5)</span><b>'+(nen===null?'—':f1(nen))+' dB(A)</b></div></div>'+resultado(D===null?null:D>1,'médio','Dose acima de 100% caracteriza (item 6 do Anexo 1). '+extra);
      }
      const rows=insv('nps',[[88,240],[92,120],[80,120]]), modo=insv('rmode','tab');
      let D=0, Te=0, max=0; const lin=rows.map((r,k)=>{ const L=num(r[0]), t=num(r[1]); if(L===null||t===null) return '<tr><td colspan="4">—</td></tr>'; Te+=t; max=Math.max(max,L); const T= L<85?Infinity:(modo==='tab'?tmaxQuadro(L):480/Math.pow(2,(L-85)/5)); const c=t/T; D+=c; return '<tr><td><input type="number" step="0.1" aria-label="NPS da linha '+(k+1)+'" data-nps="'+k+'" data-c="0" value="'+r[0]+'"></td><td><input type="number" step="1" aria-label="Tempo da linha '+(k+1)+'" data-nps="'+k+'" data-c="1" value="'+r[1]+'"></td><td class="mono">'+(T===Infinity?'—':Math.round(T))+'</td><td class="mono">'+(c*100).toFixed(1).replace('.',',')+'%</td></tr>'; }).join('');
      const lavg = D>0&&Te>0 ? 85+16.61*log10(D*480/Te) : null, nn = D>0 ? 85+16.61*log10(D) : null;
      return modoSel+isel('rmode','Tempo máximo permissível','tab',[['tab','Quadro do Anexo 1 (item 4)'],['form','Fórmula q = 5 (dosímetro)']])+'<p class="fine">'+(insv('rmode','tab')==='tab'?'Item 4: para nível intermediário, vale o tempo do nível imediatamente mais elevado do Quadro.':'Tempo máximo = 480 / 2^((NPS − 85)/5) min, como integra o dosímetro.')+'</p>'+
        '<div class="scrollx"><table class="pt calc"><thead><tr><th>NPS dB(A)</th><th>Tempo (min)</th><th>Tempo máximo (min)</th><th>Dose parcial</th></tr></thead><tbody>'+lin+'</tbody></table></div><div class="btns"><button class="ghost sm" data-nps-add="1">Adicionar nível</button><button class="ghost sm" data-nps-del="1">Remover último</button></div>'+
        '<div class="kv"><div><span>Dose</span><b>'+(D*100).toFixed(1).replace('.',',')+'%</b></div><div><span>Lavg ('+Te+' min)</span><b>'+(lavg===null?'—':f1(lavg))+' dB(A)</b></div><div><span>NEN 8 h (q = 5)</span><b>'+(nn===null?'—':f1(nn))+' dB(A)</b></div></div>'+
        resultado(D>1,'médio','Item 6 do Anexo 1: soma C/T acima da unidade. Níveis abaixo de 85 dB(A) não somam dose.'+(max>115?' Atenção: acima de 115 dB(A) sem proteção adequada é risco grave e iminente (item 7).':''))+
        '<details><summary>Quadro do Anexo 1</summary><div class="q1grid">'+A1_QUADRO.map(([l,t])=>'<span><b>'+l+'</b> '+(t>=60?Math.floor(t/60)+' h'+(t%60?' '+t%60+' min':''):t+' min')+'</span>').join('')+'</div></details>';
    }
    case 'impacto': { const p=n('pico'), t=insv('pt','lin'), lt=t==='lin'?130:120, rg=t==='lin'?140:130;
      return iin('pico','Nível de pico',132)+isel('pt','Medição','lin',[['lin','dB linear (pico), resposta para impacto'],['c','dB(C), resposta rápida (FAST)']])+resultado(p===null?null:p>lt,'médio','LT '+lt+(t==='lin'?' dB linear':' dB(C)')+' (itens 2 e 3).'+(p!==null&&p>rg?' Acima de '+rg+': risco grave e iminente (item 4).':'')); }
    case 'calor': { const t=n('ib'), m=n('m'), amb=insv('amb','fonte'), q=lookupM(m);
      const opts=[['','Escolher no Quadro 2…']]; Q2_2019.forEach(([g,it])=>it.forEach(([a,w])=>opts.push([String(w)+'|'+g+' — '+a, g+' — '+a+' ('+w+' W)'])));
      const body=iin('ib','IBUTG médio (°C)',29.5)+isel('q2sel','Atividade (Quadro 2 do Anexo 3)','',opts)+iin('m','Taxa metabólica M (W)',300,'step="1"')+isel('amb','Ambiente','fonte',[['fonte','Com fonte artificial de calor'],['fechado','Ambiente fechado'],['ceu','Céu aberto sem fonte artificial']]);
      if(amb==='ceu') return body+resultado(false,'médio','O Anexo 3 não se aplica a atividades a céu aberto sem fonte artificial (item 1.1.1). Até 10/12/2019 valia a OJ 173, II, do TST.');
      if(t===null||!q) return body+resultado(null,'médio','Informe IBUTG e M entre 100 e 606 W.');
      return body+'<div class="kv"><div><span>Linha do Quadro 1</span><b>'+q.m+' W</b></div><div><span>Limite de exposição</span><b>'+f1(q.lt)+' °C</b></div></div>'+resultado(t>q.lt,'médio','IBUTG '+f1(t)+(t>q.lt?' > ':' ≤ ')+f1(q.lt)+' °C (item 2.3). O anexo não fixa regra para M fora da tabela; a ferramenta usa a linha imediatamente superior, que é a mais conservadora. Com várias atividades, use a M média ponderada dos 60 min mais críticos (item 2.4).'); }
    case 'vibracao': { const tp=insv('vt','vci'), ar=n('ar'), vd=n('vd');
      const body=isel('vt','Tipo','vci',[['vci','Corpo inteiro (VCI)'],['vmb','Mãos e braços (VMB)']])+iin('ar','aren (m/s²)',1.2)+(tp==='vci'?iin('vd','VDVR (m/s¹·⁷⁵)',''):'');
      const ok= tp==='vci' ? ((ar!==null&&ar>1.1)||(vd!==null&&vd>21)) : (ar!==null&&ar>5);
      return body+resultado(ar===null&&vd===null?null:ok,'médio',tp==='vci'?'LT: aren 1,1 m/s² ou VDVR 21,0 m/s¹·⁷⁵ (item 2.2). O empregador deve comprovar a avaliação dos dois parâmetros (item 2.2.1).':'LT: aren 5 m/s² (item 2.1).'); }
    case 'quim11': return quim11();
    case 'poeira': { const tp=insv('pt2','resp'), c=n('pc'), qz=n('qz');
      let lt=null, un='mg/m³';
      if(tp==='resp'&&qz!==null) lt=8/(qz+2); if(tp==='total'&&qz!==null) lt=24/(qz+3); if(tp==='mppdc'&&qz!==null){lt=8.5/(qz+10);un='mppdc';} if(tp==='asb'){lt=2.0;un='f/cm³';} if(tp==='mn') lt=5; if(tp==='mnf') lt=1;
      const body=isel('pt2','Agente','resp',[['resp','Sílica livre — poeira respirável'],['total','Sílica livre — poeira total'],['mppdc','Sílica livre — contagem (impinger, mppdc)'],['asb','Asbesto (fibras respiráveis de crisotila)'],['mn','Manganês — poeiras (extração, tratamento, moagem, transporte)'],['mnf','Manganês — fumos (metalurgia, eletrodos de solda, pilhas)']])+((tp==='resp'||tp==='total'||tp==='mppdc')?iin('qz','% de quartzo',10):'')+iin('pc','Concentração ('+un+')','');
      return body+(lt!==null?'<div class="kv"><div><span>Limite de tolerância</span><b>'+brn(+lt.toFixed(3))+' '+un+'</b></div></div>':'')+resultado(c===null||lt===null?null:c>lt,'máximo',(tp==='resp'?'LT = 8 / (%quartzo + 2) mg/m³.':tp==='total'?'LT = 24 / (%quartzo + 3) mg/m³.':tp==='mppdc'?'LT = 8,5 / (%quartzo + 10) mppdc.':tp==='asb'?'LT 2,0 f/cm³ (item 12). Extração e uso do amianto proibidos pelo STF (ADI 3.937, 2017).':'Manganês: até 5 mg/m³ (poeiras) ou 1 mg/m³ (fumos), jornada de até 8 h.')); }
  }
  return '';
}
function normTxt(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function a11Match(s,q){ if(!q) return true; const nq=normTxt(q); return [s.n,...(s.vide||[]),...(s.al||[])].some(x=>normTxt(x).includes(nq)); }
function quim11(){
  const n=v=>num(insv(v,'')); const q=insv('q11',''); const sel=insv('sub',null); const s= sel===null?null:A11[+sel];
  const un=insv('un', s&&s.ppm===null?'mg':'ppm');
  let lt = s ? (un==='ppm'?s.ppm:s.mg) : n('lt'); const teto = s ? s.teto : insv('teto',false); const g = s ? (s.g||'médio') : insv('gq','médio');
  const md=n('md'), mx=n('mx');
  const list=A11.map((x,k)=>[x,k]).filter(([x])=>a11Match(x,q));
  let h='<label class="f grow" for="i-q11"><span>Pesquisar no Quadro 1 (nome, sinônimo ou fórmula)</span><input id="i-q11" type="search" data-ins="q11" value="'+esc(q)+'" placeholder="Ex.: tolueno, toluol, MEK, H2S, formol"></label>';
  h+='<div class="scrollx a11wrap"><table class="pt a11"><thead><tr><th>Agente químico</th><th>Outros nomes</th><th>ppm</th><th>mg/m³</th><th>Teto</th><th>Pele</th><th>Grau</th><th></th></tr></thead><tbody>'+
   list.map(([x,k])=>'<tr class="'+(String(sel)===String(k)?'on':'')+'"><td><b>'+hl(x.n,q)+'</b>'+(x.obs?'<small>'+esc(x.obs)+'</small>':'')+'</td><td class="small">'+[...(x.vide||[]),...(x.al||[])].map(a=>hl(a,q)).join('; ')+'</td><td class="mono">'+(x.ppm===null?'—':brn(x.ppm))+'</td><td class="mono">'+(x.mg===null?'—':brn(x.mg))+'</td><td>'+(x.teto?'<span class="tag t-teto">teto</span>':'')+'</td><td>'+(x.pele?'<span class="tag">pele</span>':'')+'</td><td>'+(x.g?'<em class="g-'+(x.g==='máximo'?'max':x.g==='médio'?'med':'min')+'">'+x.g+'</em>':'—')+'</td><td>'+((x.ppm!==null||x.mg!==null)?'<button class="ghost sm" data-a11="'+k+'">Usar</button>':'')+'</td></tr>').join('')+
   '</tbody></table></div><p class="fine a11n">'+list.length+' de '+A11.length+' entradas do Quadro 1. "Outros nomes": remissões "vide" do próprio quadro e nomes usuais ou fórmulas acrescentados para pesquisa. LT válidos para jornada de até 48 h semanais (item 10).</p>';
  h+='<div class="subcalc"><h4>'+(s?'Avaliação: '+esc(s.n):'Avaliação (escolha um agente ou informe o LT)')+'</h4>';
  if(s) h+=isel('un','Unidade','ppm',[...(s.ppm!==null?[['ppm','ppm (LT '+brn(s.ppm)+')']]:[]),...(s.mg!==null?[['mg','mg/m³ (LT '+brn(s.mg)+')']]:[])])+(s?'<button class="ghost sm" data-a11clr="1">Limpar escolha</button>':'');
  else h+=iin('lt','LT do Quadro 1','')+isel('gq','Grau','médio',[['mínimo','Mínimo'],['médio','Médio'],['máximo','Máximo']])+icb('teto','Agente com valor teto');
  h+=iin('md','Média das amostras ('+(s?(un==='ppm'?'ppm':'mg/m³'):'mesma unidade')+')','')+iin('mx','Maior amostra','');
  if(lt===null||lt===undefined||(md===null&&mx===null)) return h+resultado(null,g,'Informe os resultados das amostras (mínimo de 10 amostragens instantâneas por ponto, intervalo de 20 min — item 6).')+'</div>';
  const fd= lt<=1?3: lt<=10?2: lt<=100?1.5: lt<=1000?1.25:1.1, vmax=lt*fd; let ok, txt;
  if(teto){ ok=(mx??md)>lt; txt='Valor teto (item 9): nenhuma amostra pode superar o LT de '+brn(lt)+'.'; }
  else { ok=(md!==null&&md>lt); txt='Item 8: média '+(md===null?'—':brn(md))+(ok?' > ':' ≤ ')+'LT '+brn(lt)+'. FD = '+brn(fd)+'; valor máximo = '+brn(+vmax.toFixed(3))+(mx!==null&&mx>vmax?' — amostra acima do valor máximo: risco grave e iminente (item 7).':'.'); }
  return h+resultado(ok,g,txt)+'</div>';
}
function a13Lista(){
  const q=insv('q13',''), gf=insv('g13','todos'), sel=insv('a13sel','');
  const it=A13FULL.map((x,k)=>[x,k]).filter(([x])=>x.g!=='nota'&&(gf==='todos'||x.g===gf)&&(!q||normTxt(x.t+' '+x.ag).includes(normTxt(q))));
  let h='<div class="libbar"><label class="f grow" for="i-q13"><span>Pesquisar no Anexo 13</span><input id="i-q13" type="search" data-ins="q13" value="'+esc(q)+'" placeholder="Ex.: pintura, galvanoplastia, diesel, isocianato"></label>'+isel('g13','Grau','todos',[['todos','Todos'],['máximo','Máximo'],['médio','Médio'],['mínimo','Mínimo'],['proibido','Proibido']])+'</div>';
  let cur=''; h+='<div class="opts a13">';
  for(const [x,k] of it){ if(x.ag!==cur){ cur=x.ag; h+='<p class="a13ag">'+esc(cur.charAt(0)+cur.slice(1).toLowerCase())+'</p>'; }
    h+='<label class="opt'+(x.exc?' exc':'')+'" for="a13-'+k+'"><input type="radio" name="a13" id="a13-'+k+'" data-ins="a13sel" value="'+k+'"'+(String(sel)===String(k)?' checked':'')+(x.exc?' disabled':'')+'><span><em class="g-'+(x.g==='máximo'?'max':x.g==='médio'?'med':x.g==='mínimo'?'min':'max')+'">'+x.g+'</em>'+hl(x.t,q)+'</span></label>'; }
  h+='</div><p class="fine">'+it.length+' atividade(s). Itens riscados foram excluídos ou revogados. A caracterização é qualitativa, por inspeção no local (item 15.1.3); exclui os agentes dos Anexos 11 e 12 (item 1).</p>';
  const s= sel===''?null:A13FULL[+sel];
  if(!s) return h+resultado(null,'médio','Escolha a atividade constatada.');
  if(s.g==='proibido') return h+'<div class="verdict v-c"><b>Exposição proibida</b><p>'+esc(s.t)+': nenhuma exposição ou contato é permitido; processo não hermetizado é risco grave e iminente.</p></div>';
  return h+resultado(true,s.g,esc(s.ag.charAt(0)+s.ag.slice(1).toLowerCase())+': '+s.t);
}
function renderInsal(){
  const an=NR15.find(x=>String(x.n)===String(S.a15))||NR15[0];
  let h='<section class="intro"><div><p class="eyebrow">NR-15 · Trabalhista</p><h2>Insalubridade</h2><p class="muted">Adicional de 40%, 20% ou 10% conforme o grau (item 15.2). Com mais de um agente, vale só o de grau mais elevado (item 15.3). Base: salário mínimo, salvo norma coletiva (Súmula Vinculante 4).</p></div></section>';
  h+='<div class="anx" role="tablist" aria-label="Anexos da NR-15">'+NR15.map(x=>'<button role="tab" aria-selected="'+(x===an)+'" data-a15="'+x.n+'" class="'+(x===an?'on':'')+(x.tipo==='revogado'?' off':'')+'"><b>Anexo '+x.n+(x.tipo==='revogado'?' · revogado':'')+'</b><span>'+esc(x.t)+'</span></button>').join('')+'</div>';
  const wide = an.n===11||an.n===13;
  h+='<div class="grid2 '+(wide?'one':'wide-l')+'"><section class="panel" id="pinsal"><div class="ph"><div class="fhead"><p class="eyebrow">Anexo '+an.n+' · grau '+esc(an.g)+'</p><button class="printbtn" data-print="insal">Imprimir ou salvar PDF</button></div><h3>'+esc(an.t)+'</h3><p>'+esc(an.s)+'</p></div><div class="calcbox" id="calcbox">';
  if(an.tipo==='calc') h+=calcIns(an);
  else if(an.tipo==='quali') h+=icb('q'+an.n,'Condição constatada em inspeção (laudo qualitativo)')+resultado(insv('q'+an.n,false),an.g==='máximo'?'máximo':'médio','Caracterização qualitativa.');
  else if(an.tipo==='lista' && an.lista==='a14'){ const k=insv('a14',''); h+='<div class="opts">'+A14.map((x,j)=>'<label class="opt" for="a14-'+j+'"><input type="radio" name="a14" id="a14-'+j+'" data-ins="a14" value="'+j+'"'+(String(k)===String(j)?' checked':'')+'><span><em class="g-'+(x.g==='máximo'?'max':'med')+'">'+x.g+'</em>'+esc(x.t)+'</span></label>').join('')+'</div>'+(k===''?resultado(null,'médio','Escolha a atividade.'):resultado(true,A14[k].g,'Contato permanente na atividade listada. Para insalubridade, o Anexo 14 se aplica; para aposentadoria especial, não (código 3.0.1).')); }
  else if(an.tipo==='lista' && an.lista==='a13') h+=a13Lista();
  else h+='<p class="muted">Anexo revogado. Não gera adicional.</p>';
  h+='</div></section><aside class="panel"><div class="ph"><h3>Valor do adicional</h3></div>'+'<label class="f" for="i-base"><span>Base de cálculo (R$)</span><input id="i-base" type="number" step="0.01" data-ins="base" value="'+esc(insv('base',''))+'" placeholder="Salário mínimo ou piso da norma coletiva"></label><p class="fine">Informe a base para ver o valor mensal no resultado.</p><div class="ph"><h3>Súmulas e OJs</h3></div><ul class="sm-list">'+['s47','s80','s289','s448','oj173','sv4','irr17'].map(k=>'<li><b>'+TESES[k].num+'</b> '+esc(TESES[k].tese)+'</li>').join('')+'</ul></aside></div>';
  return h;
}

/* ---------- PERICULOSIDADE ---------- */
const EXPQ = {
 q2:{rot:'Pólvoras químicas, artifícios pirotécnicos e produtos para misturas explosivas (Quadro 2)', t:[[4500,45],[45000,90],[90000,110],[225000,180]]},
 q3:{rot:'Explosivos iniciadores (Quadro 3)', t:[[20,75],[200,220],[900,300],[2200,370],[4500,460],[6800,500],[9000,530]]},
 q4:{rot:'Explosivos de ruptura e pólvoras mecânicas (Quadro 4)', t:[[23,45],[45,75],[90,110],[135,160],[180,200],[225,220],[270,250],[300,265],[360,280],[400,300],[450,310],[680,345],[900,365],[1300,405],[1800,435],[2200,460],[2700,480],[3100,490],[3600,510],[4000,520],[4500,530],[6800,570],[9000,620],[11300,660],[13600,700],[18100,780],[22600,860],[34000,1000],[45300,1100],[68000,1150],[90700,1250],[113300,1350]]}
};
const pk = (an,sel,k)=>an+':'+sel+':'+k;
function pget(k,d){ const v=S.per[k]; return v===undefined?d:v; }
function pcb(id,k,lab){ return '<label class="cb" for="'+id+'"><input id="'+id+'" type="checkbox" data-per="'+k+'"'+(pget(k,false)?' checked':'')+'><span>'+lab+'</span></label>'; }
function pin(k,lab,attrs='step="any"'){ const id='p-'+k.replace(/[^a-z0-9]/gi,'-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="number" data-per="'+k+'" value="'+esc(pget(k,''))+'" '+attrs+'></label>'; }
function psel(k,lab,opts,d){ const id='p-'+k.replace(/[^a-z0-9]/gi,'-'), v=pget(k,d); return '<label class="f" for="'+id+'"><span>'+lab+'</span><select id="'+id+'" data-per="'+k+'">'+opts.map(([a,b])=>'<option value="'+a+'"'+(String(v)===String(a)?' selected':'')+'>'+esc(b)+'</option>').join('')+'</select></label>'; }
function selected(an,sel){ const sec=an.secoes.find(s=>s.sel===sel); if(!sec) return []; return sec.itens.filter(it=>pget(pk(an.id,sel,it[0]),false)); }
function calcExplosivos(an){
  const tp=pget('a1:exp:tp','q4'), kg=num(pget('a1:exp:kg','')), dist=num(pget('a1:exp:d','')), bar=pget('a1:exp:bar',false);
  const q=EXPQ[tp]; let r=null, acima=false;
  if(kg!==null){ const row=q.t.find(([lim])=>kg<=lim); if(row) r=row[1]; else { r=q.t[q.t.length-1][1]; acima=true; } if(bar&&tp==='q4') r=r/2; }
  const dentro = r!==null && dist!==null && dist<=r;
  let h='<div class="pcalc">'+psel('a1:exp:tp','Material armazenado',Object.entries(EXPQ).map(([k,v])=>[k,v.rot]),'q4')+pin('a1:exp:kg','Quantidade armazenada (kg)')+(tp==='q4'?pcb('p-a1-bar','a1:exp:bar','Depósito barricado ou entrincheirado (distância reduzida à metade)'):'')+pin('a1:exp:d','Distância do posto de trabalho ao depósito (m)')+'</div>';
  if(r!==null) h+='<div class="kv"><div><span>Raio da área de risco</span><b>'+brn(r)+' m</b></div>'+(dist!==null?'<div><span>Posto de trabalho</span><b>'+(dentro?'dentro da área de risco':'fora da área de risco')+'</b></div>':'')+'</div>'+(acima?'<p class="warn">Quantidade acima do máximo admitido pelo quadro, que não pode ser ultrapassado.</p>':'');
  return {h, ok:dentro, txt: dentro?'Permanência na área de risco do depósito (item 3, raio de '+brn(r)+' m).':''};
}
function calcTransporte(){
  const tp=pget('a2:tr:tp','liq'), q=num(pget('a2:tr:q','')), prop=pget('a2:tr:prop',false), e41=pget('a2:tr:41',false), e42=pget('a2:tr:42',false);
  const lim= tp==='liq'?200:135, un= tp==='liq'?'litros':'kg';
  let h='<div class="pcalc">'+psel('a2:tr:tp','Produto transportado',[['liq','Inflamável líquido'],['gas','Inflamável gasoso liquefeito']],'liq')+pin('a2:tr:q','Quantidade total transportada ('+un+')')+pcb('p-a2-prop','a2:tr:prop','Somente tanques de consumo próprio, originais de fábrica ou suplementares certificados (16.6.1 e 16.6.1.1)')+(tp==='liq'?pcb('p-a2-41','a2:tr:41','Embalagens certificadas dentro dos limites do Quadro I (item 4.1)')+pcb('p-a2-42','a2:tr:42','Recipientes de até 5 L lacrados na fabricação (item 4.2)'):'')+'</div>';
  let ok=false, txt='';
  if(q!==null){ if(prop) txt='Tanques de consumo próprio não contam (16.6.1.1).'; else if(tp==='liq'&&(e41||e42)) txt='Excluído pelo item '+(e41?'4.1':'4.2')+' do Anexo 2.'; else if(q>=lim){ ok=true; txt='Transporte de '+brn(q)+' '+un+' (limite de pequenas quantidades: '+lim+' '+un+'; item 16.6 e alínea '+(tp==='liq'?'j':'l')+' do Anexo 2).'; } else txt='Até '+lim+' '+un+': pequena quantidade, excluída pelo item 16.6.'; }
  if(txt) h+='<p class="'+(ok?'okline':'muted small')+'">'+esc(txt)+'</p>';
  return {h, ok, txt};
}
function secHtml(an,sec){
  let h='<section class="sec16"><h4>'+esc(sec.tit)+'</h4>';
  if(sec.txt) h+='<p class="just">'+esc(sec.txt)+'</p>';
  if(sec.lista) h+='<details><summary>Ver '+sec.lista.length+' itens</summary><dl class="dl16">'+sec.lista.map(([k,t])=>'<dt>'+esc(k)+'</dt><dd>'+esc(t)+'</dd>').join('')+'</dl></details>';
  if(sec.sel){ const exc=sec.sel==='exc';
    h+='<div class="scrollx"><table class="pt t16'+(exc?' exc':'')+'"><thead><tr><th class="ck"><span class="sr">Marcar</span></th><th>Item</th>'+sec.cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+
      sec.itens.map(it=>{ const k=pk(an.id,sec.sel,it[0]), id='p-'+k.replace(/[^a-z0-9]/gi,'-'), on=pget(k,false); return '<tr class="'+(on?'on':'')+'"><td class="ck"><input type="checkbox" id="'+id+'" data-per="'+k+'"'+(on?' checked':'')+' aria-label="'+esc(sec.tit+' — '+it[0])+'"></td><td class="mono"><label for="'+id+'">'+esc(it[0])+'</label></td><td><label for="'+id+'">'+esc(it[1])+'</label></td><td>'+esc(it[2])+'</td></tr>'; }).join('')+'</tbody></table></div>';
  }
  if(sec.calc==='explosivos'){ const c=calcExplosivos(an); h+=c.h; }
  if(sec.calc==='transporte'){ const c=calcTransporte(); h+=c.h; }
  return h+'</section>';
}
function avaliaPeric(an){
  const atv=selected(an,'atv'), area=selected(an,'area'), exc=selected(an,'exc'), cond=selected(an,'cond'), sep=selected(an,'sep');
  const why=[]; let base=false, falta='';
  if(an.id==='a1'){ const c=calcExplosivos(an); base=atv.length>0||c.ok; atv.forEach(x=>why.push('Quadro 1, alínea '+x[0]+') '+x[1].toLowerCase())); if(c.ok) why.push(c.txt); if(!base) falta='Marque a atividade do Quadro 1 ou calcule a posição em relação ao depósito (item 3).'; }
  else if(an.id==='a2'){ const c=calcTransporte(); base=atv.length>0||area.length>0||c.ok; atv.forEach(x=>why.push('Item 1, alínea '+x[0]+') — direito: '+x[2].toLowerCase())); area.forEach(x=>why.push('Área de risco 3.'+x[0]+') '+x[1]+': '+x[2].toLowerCase())); if(c.ok) why.push(c.txt); if(!base) falta='Marque a atividade (item 1), a área de risco (item 3) ou informe o transporte.'; }
  else if(an.id==='a3'){ base=cond.length>0&&atv.length>0; cond.forEach(x=>why.push('Item 2, alínea '+x[0]+') '+x[1])); atv.forEach(x=>why.push('Item 3: '+x[1])); if(!base) falta=!cond.length?'Falta atender a uma das condições do item 2 (quem é profissional de segurança).':'Marque a atividade do item 3.'; }
  else if(an.id==='a4'){ const abc=atv.filter(x=>x[0]!=='d'), d=atv.some(x=>x[0]==='d'); base=abc.length>0||(d&&sep.length>0); atv.forEach(x=>why.push('Item 1, alínea '+x[0]+') '+x[2])); sep.forEach(x=>why.push('Quadro I, atividade '+x[0])); if(!base) falta= d?'Para o SEP (alínea d), marque a atividade e a área do Quadro I.':'Marque a hipótese do item 1.'; }
  else { base=atv.length>0; atv.forEach(x=>why.push((an.id==='ar'?'Atividade ':'Item ')+x[0]+': '+x[1])); if(!base) falta='Marque a atividade ou operação do anexo.'; }
  const fr=pget('fr','perm'); const frOk = fr==='perm'||fr==='int';
  if(!base) return {st:'I', b:'Faltam elementos para caracterizar', p:falta};
  if(exc.length) return {st:'N', b:'Periculosidade não caracterizada', p:'Hipótese de exclusão: '+exc.map(x=>x[0]+' — '+x[1]).join('; ')+'.'};
  if(!frOk) return {st:'N', b:'Periculosidade não caracterizada', p:'Contato eventual ou habitual por tempo extremamente reduzido (Súmula 364'+(an.id==='a4'?'; Anexo 4, item 3':'')+').'};
  return {st:'E', b:'Periculosidade caracterizada — adicional de 30%', p:why.join(' · ')+(fr==='int'?' Exposição intermitente: adicional integral (Súmula 364'+(an.id==='a4'?'; Anexo 4, item 3':'')+').':'')};
}
function renderPeric(){
  const an=NR16.find(x=>x.id===S.a16)||NR16[0], sal=num(pget('sal',''));
  let h='<section class="intro"><div><p class="eyebrow">NR-16 · CLT, art. 193</p><h2>Periculosidade</h2><p class="muted">Adicional de 30% sobre o salário-base, sem gratificações, prêmios ou participação nos lucros (item 16.2). O empregado pode optar pela insalubridade; os adicionais não se acumulam (art. 193, §2º; IRR Tema 17). Marque, em cada anexo, os itens da norma constatados na inspeção.</p></div></section>';
  h+='<div class="anx anx16" role="tablist" aria-label="Anexos da NR-16">'+NR16.map(x=>'<button role="tab" aria-selected="'+(x===an)+'" data-a16="'+x.id+'" class="'+(x===an?'on':'')+'"><b>'+esc(x.n)+'</b><span>'+esc(x.t)+'</span></button>').join('')+'</div>';
  const r=avaliaPeric(an);
  h+='<div class="grid2 one"><section class="panel" id="pperic"><div class="ph"><div class="fhead"><p class="eyebrow">'+esc(an.n)+' · '+esc(an.port)+'</p><button class="printbtn" data-print="peric">Imprimir ou salvar PDF</button></div><h3>'+esc(an.t)+'</h3></div>'+
   an.secoes.map(sec=>secHtml(an,sec)).join('')+
   '<section class="sec16"><h4>Frequência da exposição (Súmula 364'+(an.id==='a4'?' e item 3 do Anexo 4':'')+')</h4><fieldset class="fr"><legend class="sr">Frequência</legend>'+[['perm','Permanente'],['int','Intermitente'],['ev','Eventual (fortuito)'],['red','Habitual por tempo extremamente reduzido']].map(([k,t])=>'<label class="cb" for="fr-'+k+'"><input type="radio" name="fr" id="fr-'+k+'" data-per="fr" value="'+k+'"'+(pget('fr','perm')===k?' checked':'')+'><span>'+t+'</span></label>').join('')+'</fieldset></section>'+
   '<div class="pcalc">'+pin('sal','Salário-base (R$) — opcional','step="0.01"')+'</div>'+
   '<div class="verdict '+(r.st==='E'?'v-e':r.st==='N'?'v-n':'v-i')+'"><b>'+esc(r.b)+(r.st==='E'&&sal?' · R$ '+(sal*0.3).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' por mês':'')+'</b><p>'+esc(r.p)+'</p></div>'+
   '<div class="btns"><button class="ghost sm" data-perclr="'+an.id+'">Limpar marcações deste anexo</button></div></section>'+
   '<aside class="panel"><div class="ph"><h3>Itens gerais da NR-16</h3></div><dl class="dl16 small">'+NR16_GERAL.map(([k,t])=>'<dt>'+k+'</dt><dd>'+esc(t)+'</dd>').join('')+'</dl><div class="ph"><h3>Jurisprudência relacionada</h3></div><ul class="sm-list">'+(an.j.length?an.j.map(k=>'<li><b>'+TESES[k].num+'</b> '+esc(TESES[k].tese)+'</li>').join(''):'<li>Sem súmula específica cadastrada.</li>')+'<li><b>IRR Tema 17</b> '+esc(TESES.irr17.tese)+'</li></ul><p class="fine">Na aposentadoria especial, a periculosidade por si só não gera tempo especial depois de 1997: veja STF, Tema 1209, e a ficha de eletricidade.</p></aside></div>';
  return h;
}

/* ---------- TESES ---------- */
function renderTeses(){
  const f=S.tf, tq=normTxt(S.tq||''); const items=Object.entries(TESES).filter(([k,t])=>(f==='todos'||(f==='prev'&&t.area==='prev')||(f==='trab'&&t.area==='trab')||t.trib===f)&&(!tq||normTxt(t.num+' '+t.titulo+' '+t.tese+' '+t.trib).includes(tq)));
  const usos=k=>AGENTS.filter(a=>(a.juris||[]).includes('T:'+k));
  let h='<section class="intro"><div><p class="eyebrow">Jurisprudência</p><h2>Teses que mudam o laudo</h2><p class="muted">Resumos didáticos, sem a redação oficial. Antes de citar, confira a íntegra e verifique se houve revisão ou modulação.</p></div></section>';
  h+='<div class="libbar"><label class="f grow" for="tq"><span>Pesquisar nas teses</span><input id="tq" type="search" data-st="tq" value="'+esc(S.tq||'')+'" placeholder="Ex.: EPI, ruído, vigilante, Súmula 364"></label></div>';
  h+='<div class="filt">'+[['todos','Todas'],['prev','Previdenciário'],['trab','Trabalhista'],['STF','STF'],['STJ','STJ'],['TNU','TNU'],['TST','TST']].map(([k,t])=>'<button data-tf="'+k+'" class="'+(f===k?'on':'')+'">'+t+'</button>').join('')+'</div>';
  h+='<div class="teses">'+items.map(([k,t])=>{ const u=usos(k); return '<article class="tese"><header><span class="trib t-'+t.trib+'">'+t.trib+'</span><b>'+esc(t.num)+'</b>'+(t.ano?'<span class="ano">'+t.ano+'</span>':'')+'</header><h4>'+esc(t.titulo)+'</h4><p>'+esc(t.tese)+'</p>'+(t.ref&&t.ref!=='—'?'<p class="ref">'+esc(t.ref)+'</p>':'')+(u.length?'<p class="uso">Fichas: '+u.map(a=>'<a href="#agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a>').join(', ')+'</p>':'')+'</article>'; }).join('')+'</div>';
  return h;
}

/* ---------- BIBLIOTECA ---------- */
const LIBT = [
 ['d3048_IV','Anexo IV — Decreto 3.048/99',['Código','Agente nocivo e atividades','Tempo']],
 ['d2172_IV','Anexo IV — Decreto 2.172/97',['Código','Agente nocivo e atividades','Tempo']],
 ['d53831_ag','Decreto 53.831/64 — agentes (1.x)',['Código','Campo de aplicação','Serviços e atividades','Classificação','Tempo','Observações']],
 ['d53831_at','Decreto 53.831/64 — atividades profissionais (2.x)',['Código','Campo de aplicação','Atividades','Classificação','Tempo','Observações']],
 ['d83080_I','Decreto 83.080/79 — Anexo I (agentes)',['Código','Campo de aplicação','Atividade profissional','Tempo']],
 ['d83080_II','Decreto 83.080/79 — Anexo II (grupos profissionais)',['Código','Atividade profissional','Tempo']],
 ['linach','LINACH — Grupo 1 (Portaria Interministerial 9/2014)',['Agente','CAS']],
 ['ag_cancer','Cancerígenos do Anexo IV × LINACH',['Agente do Anexo IV','Código','LINACH Grupo 1','CAS']],
 ['aq_quant','Químicos do Anexo IV com limite (NR-15, Anexo 11/12)',['Agente','Valor teto','Absorção pela pele','ppm','mg/m³']],
 ['aq_qual','Químicos do Anexo IV de avaliação qualitativa',['Agente']],
 ['txt_resumo','Resumo da legislação previdenciária',['Texto']],
 ['txt_cpc','CPC — prova pericial (arts. 464 a 480)',['Texto']],
 ['txt_regressivas','Ações regressivas do INSS — fundamentos',['Texto']],
 ['txt_legcompl','Legislação complementar do Decreto 53.831/64',['Texto']]
];
function hl(s,q){ s=esc(s); if(!q) return s; const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'); return s.replace(re,'<mark>$1</mark>'); }
function cellHtml(v,q){ v=String(v||''); if(/^https?:\/\//.test(v)) return '<a href="'+esc(v)+'" target="_blank" rel="noopener">'+esc(v.replace(/^https?:\/\/(www\.)?/,'').slice(0,60))+'…</a>'; return hl(v,q); }
function renderBib(){
  const q=S.q.trim(), norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(), nq=norm(q);
  const tabs = S.lib==='todas' ? LIBT : LIBT.filter(t=>t[0]===S.lib);
  let h='<section class="intro"><div><p class="eyebrow">Biblioteca</p><h2>Normas e quadros do curso</h2><p class="muted">Conteúdo das planilhas originais (Agentes Nocivos e Legislação Previdenciária), agora pesquisável. A IN 77/2015 foi revogada pela IN 128/2022 e não consta aqui.</p></div></section>';
  h+='<div class="libbar"><label class="f" for="lib-sel"><span>Quadro</span><select id="lib-sel" data-lib="1"><option value="todas"'+(S.lib==='todas'?' selected':'')+'>Todos os quadros</option>'+LIBT.map(t=>'<option value="'+t[0]+'"'+(S.lib===t[0]?' selected':'')+'>'+esc(t[1])+'</option>').join('')+'</select></label><label class="f grow" for="lib-q"><span>Pesquisar</span><input id="lib-q" type="search" value="'+esc(S.q)+'" placeholder="Ex.: soldagem, 1.0.19, caldeira, benzeno" data-q="1"></label></div>';
  let total=0;
  for(const [k,tit,heads] of tabs){
    let rows=LIB[k]||[]; rows=rows.map(r=>Array.isArray(r)?r:[r]);
    if(nq) rows=rows.filter(r=>norm(r.join(' ')).includes(nq));
    if(!rows.length) continue; total+=rows.length;
    const shown = rows.slice(0, S.lib==='todas'?25:400);
    h+='<section class="panel"><div class="ph"><h3>'+esc(tit)+'</h3><p class="muted small">'+rows.length+' registro(s)'+(shown.length<rows.length?' · mostrando '+shown.length:'')+'</p></div><div class="scrollx"><table class="pt lib"><thead><tr>'+heads.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+shown.map(r=>'<tr>'+heads.map((_,j)=>'<td class="pre">'+cellHtml(r[j],q)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>';
  }
  if(!total) h+='<p class="empty">Nada encontrado para "'+esc(q)+'".</p>';
  return h;
}

/* ---------- roteamento e eventos ---------- */
/* ---------- BUSCA GERAL ---------- */
let IDX=null;
function buildIndex(){
  const E=[]; const add=(sec,t,s,go,extra='')=>E.push({sec,t,s,go,n:normTxt(t+' '+s+' '+extra)});
  AGENTS.forEach(a=>add('Aposentadoria especial — agentes',a.nome,[a.c53.length?'53.831: '+a.c53.join(', '):'',a.cIV?'Anexo IV: '+a.cIV:'','NR-15: '+a.nr15].filter(Boolean).join(' · '),'ag:'+a.id,(a.kw||[]).join(' ')+' '+a.periodos.flat().join(' ')+' '+a.perito.join(' ')+' '+a.inss.join(' ')));
  A11.forEach((x,k)=>add('NR-15, Anexo 11 — agentes químicos com LT',x.n,(x.ppm!==null?x.ppm+' ppm · ':'')+(x.mg!==null?x.mg+' mg/m³ · ':'')+(x.g?'grau '+x.g:'')+(x.teto?' · valor teto':'')+([...(x.vide||[]),...(x.al||[])].length?' · também: '+[...(x.vide||[]),...(x.al||[])].join(', '):''),'a11:'+k));
  A13FULL.forEach((x,k)=>{ if(x.g!=='nota') add('NR-15, Anexo 13 — atividades com agentes químicos',x.t,x.ag.charAt(0)+x.ag.slice(1).toLowerCase()+' · grau '+x.g+(x.exc?' · excluído/revogado':''),'a13:'+k); });
  A14.forEach(x=>add('NR-15, Anexo 14 — agentes biológicos',x.t,'grau '+x.g,'a15:14'));
  NR15.forEach(x=>add('NR-15 — anexos',('Anexo '+x.n+' — '+x.t),x.s,'a15:'+x.n));
  NR16.forEach(x=>x.secoes.forEach(sec=>{ (sec.itens||[]).forEach(it=>add('NR-16 — periculosidade',x.n+' ('+x.t+') — '+it[1],sec.tit+(it[2]?' · '+it[2]:''),'a16:'+x.id)); (sec.lista||[]).forEach(it=>add('NR-16 — periculosidade',x.n+' ('+x.t+') — '+sec.tit.split(' — ')[0]+' '+it[0],it[1],'a16:'+x.id)); if(sec.txt) add('NR-16 — periculosidade',x.n+' ('+x.t+') — '+sec.tit,sec.txt,'a16:'+x.id); })); NR16_GERAL.forEach(([k,t])=>add('NR-16 — periculosidade','Item '+k,t,'a16:a2'));
  Object.entries(TESES).forEach(([k,t])=>add('Teses e súmulas',t.trib+', '+t.num+' — '+t.titulo,t.tese,'tese:'+k));
  MARCOS.forEach(m=>add('Marcos legais',fmtBR(m.d)+' — '+m.t,m.s,'painel'));
  LIBT.forEach(([k,tit])=>(LIB[k]||[]).forEach(r=>{ const row=Array.isArray(r)?r:[r]; const txt=row.filter(Boolean).join(' · '); if(/^https?:/.test(txt)) return; add('Biblioteca — '+tit, row[0].length>90?row[0].slice(0,90)+'…':row[0], row.slice(1).join(' · '), 'lib:'+k, txt); }));
  return E;
}
function snippet(s,terms){ const n=normTxt(s); let i=-1; for(const t of terms){ i=n.indexOf(t); if(i>=0) break; } if(i<0||s.length<180) return s; const a=Math.max(0,i-60); return (a?'…':'')+s.slice(a,a+180)+'…'; }
function hlTerms(s,terms){ let h=esc(s); terms.forEach(t=>{ if(t.length<2) return; const src=esc(s); /* destaque sem acento */ const re=new RegExp('('+t.split('').map(c=>({a:'[aáàâã]',e:'[eéê]',i:'[ií]',o:'[oóôõ]',u:'[uúü]',c:'[cç]'}[c]||c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))).join('')+')','gi'); h=h.replace(re,'<mark>$1</mark>'); }); return h; }
function renderBusca(){
  const q=(S.gq||'').trim(); const terms=normTxt(q).split(/\s+/).filter(Boolean);
  let h='<section class="intro"><div><p class="eyebrow">Pesquisa geral</p><h2>'+(q?'Resultados para "'+esc(q)+'"':'Pesquise em todas as abas')+'</h2><p class="muted">Agentes nocivos, Anexos 11, 13 e 14 da NR-15, NR-16, teses, marcos legais e a biblioteca de decretos. Use mais de uma palavra para refinar.</p></div></section>';
  if(terms.length===0||q.length<2) return h+'<div class="chips">'+['tolueno','solda','martelete','coleta de lixo','caldeira','frentista','galvanoplastia','benzeno','EPI'].map(x=>'<button class="ghost sm" data-gq="'+x+'">'+x+'</button>').join('')+'</div>';
  IDX = IDX || buildIndex();
  const hits=IDX.filter(e=>terms.every(t=>e.n.includes(t)));
  if(!hits.length) return h+'<p class="empty">Nada encontrado. Tente um sinônimo (ex.: "toluol", "amianto") ou uma palavra só.</p>';
  const groups={}; hits.forEach(e=>(groups[e.sec]=groups[e.sec]||[]).push(e));
  h+='<p class="muted small">'+hits.length+' resultado(s) em '+Object.keys(groups).length+' seção(ões).</p><div class="sres">';
  for(const [sec,list] of Object.entries(groups)){
    h+='<section class="panel"><div class="ph"><h3>'+esc(sec)+'</h3><p class="muted small">'+list.length+' resultado(s)</p></div><ul class="hits">'+list.slice(0,12).map(e=>'<li><button class="hit" data-go="'+esc(e.go)+'"><b>'+hlTerms(e.t,terms)+'</b><span>'+hlTerms(snippet(e.s,terms),terms)+'</span></button></li>').join('')+'</ul>'+(list.length>12?'<p class="fine">Mais '+(list.length-12)+' resultado(s): refine a pesquisa'+(list[0].go.startsWith('lib:')?' ou abra a biblioteca':'')+'.</p>':'')+'</section>';
  }
  return h+'</div>';
}
function go(dest){
  const [k,v]=dest.split(':');
  if(k==='ag'){ S.ag=v; location.hash='agentes'; }
  else if(k==='a11'){ S.a15=11; S.ins.sub=+v; S.ins.q11=A11[+v].n; location.hash='insalubridade'; }
  else if(k==='a13'){ S.a15=13; S.ins.a13sel=v; S.ins.q13=''; S.ins.g13='todos'; location.hash='insalubridade'; }
  else if(k==='a15'){ S.a15=isNaN(+v)?v:+v; location.hash='insalubridade'; }
  else if(k==='a16'){ S.a16=v; location.hash='periculosidade'; }
  else if(k==='tese'){ S.tf='todos'; S.tq=TESES[v].num; location.hash='teses'; }
  else if(k==='lib'){ S.lib=v; S.q=S.gq||''; location.hash='biblioteca'; }
  else location.hash=k;
  if(location.hash==='#'+S.tab){ route(); }
}

function render(){
  document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')==='#'+S.tab?'page':'false'));
  const m=$('#main');
  m.innerHTML = S.tab==='inicio'?renderInicio(): S.tab==='busca'?renderBusca(): S.tab==='painel'?renderPainel(): S.tab==='aposentadoria'?renderCaso(): S.tab==='agentes'?renderAgentes(): S.tab==='insalubridade'?renderInsal(): S.tab==='periculosidade'?renderPeric(): S.tab==='teses'?renderTeses(): renderBib();
}
function route(){ const h=location.hash.slice(1); S.tab = TABS.some(t=>t[0]===h)?h:(h==='busca'?'busca':'inicio'); render(); }
window.addEventListener('hashchange', ()=>{ route(); window.scrollTo(0,0); });

function setPath(obj, path, val){ const ps=path.split('.'); let o=obj; for(let k=0;k<ps.length-1;k++){ o[ps[k]]=o[ps[k]]||{}; o=o[ps[k]]; } o[ps[ps.length-1]]=val; }
function refreshCaso(i){ if(i==='s'){ const el=$('#res-s'); if(el) el.innerHTML=resTable(simRow()); return; } const el=$('#res-'+i); if(el) el.innerHTML=resTable(S.caso.rows[i]); const tb=$('#totbar'); if(tb) tb.innerHTML=totBar(); const r=S.caso.rows[i], art=document.querySelector('.row[data-i="'+i+'"] .rtt'); if(art) art.innerHTML='<b>'+esc(r.funcao||'Função')+'</b><span>'+esc(r.empresa||'Empresa')+'</span>'; }
function refocus(id){ const el=document.getElementById(id); if(!el) return; el.focus(); try{ if(el.type==='text'||el.type==='search'){ const L=el.value.length; el.setSelectionRange(L,L); } }catch(e){} }

document.addEventListener('input', ev=>{
  const t=ev.target;
  if(t.id==='gq'){ S.gq=t.value; if(S.gq.trim().length>=2){ if(S.tab!=='busca'){ S.tab='busca'; history.replaceState(null,'','#busca'); } render(); } else if(S.tab==='busca') render(); return; }
  if(t.dataset.r!==undefined){ const isSim=t.dataset.r==='s', i=isSim?'s':+t.dataset.r, f=t.dataset.f, row=isSim?simRow():S.caso.rows[i];
    if(f==='d.mr'){ row.d=row.d||{}; row.d.mr=t.value; if(!isSim) save(); const id=t.id; render(); refocus(id); return; }
    let v = t.type==='checkbox'?t.checked:t.value;
    if(f==='agente'){ row.agente=v; row.d={}; row.tempo=agById(v).tempo; save(); render(); const s=$('#r'+i+'-agente'); if(s) s.focus(); return; }
    if(f==='tempo') v=+v;
    setPath(row,f,v); if(!isSim) save(); refreshCaso(i); return; }
  if(t.dataset.c){ S.caso[t.dataset.c]=t.value; save(); if(t.dataset.c==='sexo'){ const tb=$('#totbar'); if(tb) tb.innerHTML=totBar(); } return; }
  if(t.dataset.ins!==undefined){ const k=t.dataset.ins; S.ins[k]= t.type==='checkbox'?t.checked:t.value;
    if(k==='q2sel' && t.value) S.ins.m=t.value.split('|')[0];
    if(k==='un'){ /* troca de unidade mantém a substância */ }
    const id=t.id; render(); if(t.type!=='radio'&&t.type!=='checkbox') refocus(id); return; }
  if(t.dataset.nps!==undefined){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); rows[+t.dataset.nps][+t.dataset.c]=t.value; S.ins.nps=rows; const id=t.getAttribute('aria-label'); render(); const el=document.querySelector('[aria-label="'+id+'"]'); if(el) el.focus(); return; }
  if(t.dataset.per!==undefined){ S.per[t.dataset.per]= t.type==='checkbox'?t.checked:t.value; const id=t.id; render(); refocus(id); return; }
  if(t.dataset.st){ S[t.dataset.st]=t.value; const id=t.id; render(); refocus(id); return; }
  if(t.dataset.q){ S.q=t.value; render(); refocus('lib-q'); return; }
  if(t.dataset.lib){ S.lib=t.value; render(); return; }
  if(t.dataset.agsel){ S.ag=t.value; render(); return; }
});
document.addEventListener('click', ev=>{
  const tab=ev.target.closest('.tabs a'); if(tab && tab.getAttribute('href')===location.hash){ route(); return; }
  const b=ev.target.closest('button, a[data-ag]'); if(!b) return;
  if(b.dataset.focusg){ const g=$('#gq'); g.focus(); g.scrollIntoView({block:'center'}); return; }
  if(b.dataset.go){ go(b.dataset.go); window.scrollTo(0,0); return; }
  if(b.dataset.gq){ const g=$('#gq'); g.value=b.dataset.gq; S.gq=b.dataset.gq; render(); return; }
  if(b.dataset.ag){ S.ag=b.dataset.ag; if(S.tab!=='agentes'){ location.hash='agentes'; } else { render(); } if(b.tagName==='BUTTON'){ const f=$('.ficha'); if(f&&window.innerWidth<860) f.scrollIntoView({behavior:'smooth'}); } return; }
  if(b.dataset.a11!==undefined){ S.ins.sub=+b.dataset.a11; delete S.ins.un; render(); const sc=$('.subcalc'); if(sc) sc.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
  if(b.dataset.a11clr){ delete S.ins.sub; delete S.ins.un; render(); return; }
  if(b.dataset.npsr!==undefined||b.dataset.npsx!==undefined){ const k=b.dataset.npsr??b.dataset.npsx, row=k==='s'?simRow():S.caso.rows[+k]; row.d=row.d||{}; const o=row.d.nps||(row.d.nps={}); const n=Object.keys(o).length; if(b.dataset.npsr!==undefined){ o[Math.max(n,1)]={0:'',1:''}; if(!n) o[0]={0:'',1:''}; } else if(n>1) delete o[n-1]; if(k!=='s') save(); render(); return; }
  if(b.dataset.simuse){ const r=JSON.parse(JSON.stringify(simRow())); r.empresa=''; r.funcao='Simulação — '+agById(r.agente).nome; S.caso.rows.push(r); save(); b.textContent='Incluído no caso'; setTimeout(()=>{ if(b.isConnected) b.textContent='Incluir na análise de caso'; },2000); return; }
  if(b.dataset.simrst){ delete S.sim[S.ag]; render(); return; }
  if(b.dataset.del!==undefined){ S.caso.rows.splice(+b.dataset.del,1); save(); render(); return; }
  if(b.dataset.act==='add'){ const last=S.caso.rows[S.caso.rows.length-1]; const ini= last&&last.fim?addDays(last.fim,1):'2000-01-01'; S.caso.rows.push({empresa:'',funcao:'',ini, fim:addDays(ini,364), agente:'ruido', tempo:25, epi:false, d:{te:480}}); save(); render(); const r=document.querySelectorAll('.row'); if(r.length) r[r.length-1].scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if(b.dataset.act==='ex'){ S.caso=JSON.parse(JSON.stringify(EXEMPLO)); save(); render(); return; }
  if(b.dataset.act==='clr'){ if(b.dataset.armed){ S.caso={nome:'Novo caso',sexo:'H',rows:[]}; save(); render(); } else { b.dataset.armed='1'; b.textContent='Toque de novo para limpar'; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent='Limpar caso'; } },3000); } return; }
  if(b.dataset.act==='copy'){ const txt=resumoTexto(); const done=()=>{ b.textContent='Quadro copiado'; setTimeout(()=>b.textContent='Copiar quadro-resumo',2000); };
    try{ navigator.clipboard.writeText(txt).then(done, ()=>fallbackCopy(txt,b)); }catch(e){ fallbackCopy(txt,b); } return; }
  if(b.dataset.a15){ S.a15=b.dataset.a15; render(); return; }
  if(b.dataset.a16){ S.a16=b.dataset.a16; render(); return; }
  if(b.dataset.perclr){ Object.keys(S.per).forEach(k=>{ if(k.startsWith(b.dataset.perclr+':')) delete S.per[k]; }); render(); return; }
  if(b.dataset.tf){ S.tf=b.dataset.tf; render(); return; }
  if(b.dataset.npsAdd){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); rows.push([85,60]); S.ins.nps=rows; render(); return; }
  if(b.dataset.npsDel){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); if(rows.length>1) rows.pop(); S.ins.nps=rows; render(); return; }
});
document.addEventListener('keydown', ev=>{ if(ev.key==='/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ ev.preventDefault(); $('#gq').focus(); } });
function fallbackCopy(txt,b){ let ta=document.getElementById('copyarea'); if(!ta){ ta=document.createElement('textarea'); ta.id='copyarea'; ta.className='copyarea'; ta.setAttribute('aria-label','Quadro-resumo para copiar'); b.closest('.casehead').after(ta); } ta.value=txt; ta.hidden=false; ta.focus(); ta.select(); b.textContent='Selecione e copie o texto abaixo'; }


/* ---------- IMPRESSÃO EM PAPEL TIMBRADO ---------- */
const hoje = () => new Date().toLocaleDateString('pt-BR');
function freeze(node){
  const c=node.cloneNode(true);
  c.querySelectorAll('.printbtn, .btns, button, .a11wrap, .fine.a11n').forEach(e=>e.remove());
  c.querySelectorAll('table.t16 tbody tr').forEach(tr=>{ const i=tr.querySelector('input'); if(i && !i.checked) tr.remove(); });
  c.querySelectorAll('table.t16').forEach(tb=>{ if(!tb.querySelector('tbody tr')){ const p=document.createElement('p'); p.className='muted small'; p.textContent='Nenhum item marcado.'; tb.replaceWith(p); } });
  c.querySelectorAll('.sec16 details').forEach(d=>d.remove());
  c.querySelectorAll('.opts').forEach(o=>{ o.querySelectorAll('.opt').forEach(l=>{ const i=l.querySelector('input'); if(i && !i.checked) l.remove(); }); o.querySelectorAll('.a13ag').forEach(h=>{ const nx=h.nextElementSibling; if(!nx||!nx.classList.contains('opt')) h.remove(); }); });
  c.querySelectorAll('input, select').forEach(el=>{
    const orig = el;
    let v='';
    if(el.tagName==='SELECT'){ const o=orig.options[orig.selectedIndex]; v=o?o.text:''; }
    else if(el.type==='checkbox'||el.type==='radio'){ v= orig.checked?'☑':'☐'; }
    else v=orig.value||'—';
    const sp=document.createElement('span'); sp.className='pv'; sp.textContent=v; el.replaceWith(sp);
  });
  c.querySelectorAll('details').forEach(d=>d.setAttribute('open',''));
  return c.innerHTML;
}
function reportCaso(){
  const c=S.caso, t=totais(c);
  let rows='';
  c.rows.forEach(row=>{ const a=agById(row.agente); const r=avaliar(row,a); r.segs.forEach((s,k)=>{ rows+='<tr><td class="mono">'+fmtBR(s.ini)+' a '+fmtBR(s.fim)+'</td><td>'+(k===0?esc(row.empresa||'—')+'<br><small>'+esc(row.funcao||'')+'</small>':'')+'</td><td>'+esc(a.nome)+'</td><td>'+esc(s.base)+'</td><td><b>'+ST[s.perito.st]+'</b><br><small>'+esc(s.perito.txt)+'</small></td><td><b>'+ST[s.inss.st]+'</b><br><small>'+esc(s.inss.txt)+'</small></td></tr>'; }); });
  return '<h1>Análise de enquadramento — aposentadoria especial</h1><p class="meta"><b>Caso:</b> '+esc(c.nome||'—')+' · <b>Segurado:</b> '+(c.sexo==='M'?'mulher':'homem')+' · <b>Emitido em:</b> '+hoje()+'</p>'+
   '<table class="rep"><thead><tr><th>Período</th><th>Empresa / função</th><th>Agente</th><th>Base legal</th><th>Critério do perito</th><th>INSS (IN 128/2022)</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<table class="tot"><tr><th>Tempo especial — critério do perito</th><td>'+fmtDias(t.perito.dias)+' ('+t.perito.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Tempo especial — INSS</th><td>'+fmtDias(t.inss.dias)+' ('+t.inss.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Acréscimo por conversão até 13/11/2019 (perito / INSS)</th><td>'+fmtDias(t.perito.conv)+' / '+fmtDias(t.inss.conv)+'</td></tr><tr><th>Trechos divergentes</th><td>'+t.diverg+'</td></tr></table>'+
   '<p class="nota">Critério do perito: ruído pela NR-15 (q = 5), Lavg até 18/11/2003 e NEN a partir de 19/11/2003; calor pelo código 2.0.4 do Decreto 3.048/99; agentes biológicos pelo rol do código 3.0.1. Contagem em dias corridos; anos, meses e dias aproximados por 365/30. Conversão pelo art. 70 do Decreto 3.048/99, só até 13/11/2019 (EC 103/2019).</p>';
}
function printOut(kind){
  let html='', ori='portrait';
  if(kind==='caso'){ html=reportCaso(); ori='landscape'; }
  else if(kind==='ficha'){ const f=$('.ficha'); html='<p class="meta">Ficha de agente nocivo · emitida em '+hoje()+'</p>'+freeze(f); }
  else if(kind==='insal'){ html='<h1>Insalubridade — NR-15</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pinsal')); }
  else if(kind==='peric'){ html='<h1>Periculosidade — NR-16</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pperic')); }
  const root=$('#printroot');
  root.innerHTML='<img class="lh" alt="" src="'+(ori==='landscape'?BRAND.a4h:BRAND.a4v)+'"><table class="pwrap"><thead><tr><td><div class="sp-top"></div></td></tr></thead><tbody><tr><td class="pbody">'+html+'<p class="disc">Documento gerado pelo Caracterizador Pericial — ferramenta didática; não substitui a análise do caso concreto nem a redação oficial das normas. Grahl Consultoria e Treinamentos · grahlconsultoria.com.br</p></td></tr></tbody><tfoot><tr><td><div class="sp-bot"></div></td></tr></tfoot></table>';
  root.dataset.ori=ori;
  $('#pagestyle').textContent='@page{size:A4 '+ori+';margin:0}';
  const emFrame = (()=>{ try{ return window.self!==window.top; }catch(e){ return true; } })();
  if(emFrame){ openPreview(ori); return; }
  document.body.classList.add('printing');
  const done=()=>{ document.body.classList.remove('printing'); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done);
  setTimeout(()=>{ window.print(); setTimeout(done,1500); },80);
}
function openPreview(ori){
  const ov=$('#preview'); ov.hidden=false; ov.dataset.ori=ori;
  ov.querySelector('.pvbody').innerHTML='<div class="sheet '+ori+'">'+$('#printroot').innerHTML+'</div>';
  ov.querySelector('.pvclose').focus();
}
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-print]'); if(b){ printOut(b.dataset.print); return; }
  if(ev.target.id==='pvtry'){ document.body.classList.add('printing'); try{ window.print(); }catch(e){} setTimeout(()=>document.body.classList.remove('printing'),1500); return; }
  if(ev.target.closest('.pvclose')||ev.target.id==='preview'){ $('#preview').hidden=true; }
});
document.addEventListener('keydown', ev=>{ if(ev.key==='Escape'){ const p=$('#preview'); if(p&&!p.hidden) p.hidden=true; } });

document.getElementById('logo').src=BRAND.logo;
document.getElementById('tabs').innerHTML = TABS.map(([k,t])=>'<a href="#'+k+'">'+t+'</a>').join('');
route();