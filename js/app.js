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
/* ===== Casos salvos (vários) — ficam só neste navegador ===== */
const STORE='caracterizador:v2', STORE_PERFIL='caracterizador:perfil';
let DB={ativo:null, casos:{}};
const novoId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const agora=()=>new Date().toISOString();
function limpaCaso(c){ c=c||{}; c.nome=c.nome||'Caso sem nome'; c.sexo=c.sexo==='M'?'M':'H'; c.rows=(Array.isArray(c.rows)?c.rows:[]).filter(r=>r&&AGENTS.some(a=>a.id===r.agente)); return c; }
try{
  const raw=localStorage.getItem(STORE);
  if(raw){ const o=JSON.parse(raw); if(o&&o.casos&&typeof o.casos==='object') DB=o; }
  else { const v1=localStorage.getItem('caracterizador:v1'); /* migração do formato antigo (um caso só) */
    if(v1){ const o=JSON.parse(v1); if(o&&o.caso&&Array.isArray(o.caso.rows)){ const id=novoId(); DB={ativo:id,casos:{[id]:Object.assign(o.caso,{id,alterado:agora()})}}; } } }
}catch(e){}
Object.keys(DB.casos).forEach(id=>{ DB.casos[id]=limpaCaso(DB.casos[id]); DB.casos[id].id=id; });
function casosOrdenados(){ return Object.values(DB.casos).sort((x,y)=>String(y.alterado||'').localeCompare(String(x.alterado||''))); }
if(!DB.ativo||!DB.casos[DB.ativo]){ const l=casosOrdenados(); if(l.length) DB.ativo=l[0].id; else { const id=novoId(); DB.casos[id]=Object.assign(JSON.parse(JSON.stringify(EXEMPLO)),{id,alterado:agora()}); DB.ativo=id; } }
S.caso=DB.casos[DB.ativo];
function persist(){ try{ localStorage.setItem(STORE, JSON.stringify(DB)); return true; }catch(e){ avisar('Não foi possível salvar no navegador (armazenamento cheio ou bloqueado). Exporte seus casos para não perdê-los.'); return false; } }
function save(){ S.caso.alterado=agora(); DB.casos[DB.ativo]=S.caso; persist(); }

const TABS = [['inicio','Início'],['funcao','Por função'],['aposentadoria','Aposentadoria especial'],['insalubridade','Insalubridade'],['periculosidade','Periculosidade'],['teses','Teses'],['biblioteca','Biblioteca'],['perfil','Perfil e dados']];
const AP_SUB = [['agentes','Consulta por agente','Critério, campo, metodologia, simulação e PPP'],['data','Regra na data','Linha do tempo e o que valia numa data'],['comparar','Comparar agentes','Dois ou três agentes lado a lado'],['caso','Simulação de enquadramento','Períodos de trabalho testados contra as regras'],['resultado','Resultado da simulação','Tempo especial simulado, linha do tempo e divergências']];

function chip(st, short){ return '<span class="chip st-'+st+'">'+(short?st==='E'?'Especial':st==='N'?'Não':st==='C'?'Controverso':'Faltam dados':ST[st])+'</span>'; }


/* ---------- INÍCIO (apresentação) ---------- */
function renderInicio(){
  const n = {ag:AGENTS.length, a11:A11.length, a13:A13FULL.filter(x=>x.g!=='nota').length, nr16:NR16.length, teses:Object.keys(TESES).length};
  const area=(cls,eb,tit,txt,links)=>'<article class="acard '+cls+'"><p class="eyebrow">'+eb+'</p><h3>'+tit+'</h3><p>'+txt+'</p><div class="alinks">'+links.map(([h,t],k)=>'<a class="'+(k?'sec':'pri')+'" href="#'+h+'">'+t+(k?'':' →')+'</a>').join('')+'</div></article>';
  return '<section class="hero"><div class="hero-in"><img class="hero-logo" alt="Grahl Consultoria e Treinamentos" src="'+BRAND.logo+'"><div class="hero-txt"><p class="eyebrow">Consulta técnica para laudos, pareceres e perícias</p><h2>Do texto legal ao laudo, período a período</h2><p>Legislação trabalhista e previdenciária num só lugar: qual regra vale em cada época, qual o limite, como medir e como fundamentar a conclusão em <b>aposentadoria especial</b>, <b>insalubridade</b> e <b>periculosidade</b>.</p><div class="hero-btns"><button class="btn" data-focusg="1">Pesquisar agente, substância ou atividade</button></div></div></div>'+
   '<dl class="hero-num"><div><dt>'+n.ag+'</dt><dd>agentes com ficha e simulador</dd></div><div><dt>'+n.a11+'</dt><dd>substâncias do Anexo 11, com sinônimos</dd></div><div><dt>'+n.a13+'</dt><dd>atividades do Anexo 13</dd></div><div><dt>'+n.nr16+'</dt><dd>anexos da NR-16 estruturados</dd></div><div><dt>'+n.teses+'</dt><dd>teses, súmulas e OJs</dd></div></dl></section>'+
   '<section class="isec"><div class="ihead"><h2 class="ih">Escolha a área</h2><p class="ilead">Cada área segue a sua própria legislação. A NR-15 só entra no previdenciário quando a norma do período remete a ela.</p></div>'+
   '<div class="acards">'+area('a-prev','Previdenciário · Decreto 3.048/99, Anexo IV','Aposentadoria especial','Agentes nocivos em cinco passos: critério por período, levantamento em campo, metodologia, simulação e PPP. Inclui a simulação de enquadramento por período.',[['aposentadoria/agentes','Consultar um agente'],['aposentadoria/caso','Simular períodos']])+
   area('a-ins','Trabalhista · NR-15','Insalubridade','Limites e graus dos anexos da NR-15, calculadoras de ruído, calor e vibração, Quadro 1 do Anexo 11 e as listas integrais dos Anexos 13 e 14.',[['insalubridade','Abrir a NR-15']])+
   area('a-per','Trabalhista · NR-16','Periculosidade','Todos os anexos com itens, quadros e áreas de risco, hipóteses de exclusão e frequência da exposição (Súmula 364).',[['periculosidade','Abrir a NR-16']])+'</div></section>'+favoritosInicio()+recentesInicio()+novidadesHtml()+
   '<section class="forwho"><h2 class="ih">Para quem</h2><div class="fw-grid"><div><b>Atuação</b><ul class="chips"><li>Perito judicial</li><li>Assistente técnico</li><li>Laudos extrajudiciais</li><li>Pareceres técnicos</li></ul></div><div><b>Profissão</b><ul class="chips"><li>Engenheiro de segurança do trabalho</li><li>Médico do trabalho</li><li>Técnico de segurança do trabalho</li><li>Enfermeiro do trabalho</li></ul></div></div></section>'+
   '<section class="isec"><h2 class="ih">Como usar</h2><ol class="steps"><li><b>Pesquise</b><span>Digite no campo do topo um agente, substância, atividade ou tese, inclusive por sinônimo (toluol, amianto, H2S).</span></li><li><b>Escolha a área</b><span>Aposentadoria especial, insalubridade ou periculosidade: cada uma com a sua legislação e os seus critérios por período.</span></li><li><b>Siga os passos</b><span>Critério, levantamento em campo, metodologia e simulação com os seus dados, com a nota do especialista ao lado do critério oficial.</span></li><li><b>Imprima</b><span>Gere o relatório, a ficha ou a consulta no papel timbrado, em PDF ou papel.</span></li></ol></section>'+
   '<div class="grid2"><section class="isec panel"><h2 class="ih">Base normativa</h2><ul class="blist"><li>Lei 8.213/91 e Decreto 3.048/99 (Anexo IV), com Decretos 53.831/64, 83.080/79, 2.172/97, 4.882/03, 8.123/13 e 10.410/20</li><li>IN PRES/INSS 128/2022 e alterações posteriores, até a IN 212/2026</li><li>Manual de Aposentadoria Especial do INSS (2018)</li><li>NR-15 e NR-16 atualizadas, com a Portaria MTE 2.021/2025</li><li>NHO da Fundacentro (01, 06, 09, 10 e demais) e ISO 2631/5349</li><li>LINACH (Portaria Interministerial 9/2014)</li><li>Teses do STF, STJ, TNU e súmulas e OJs do TST</li></ul><p class="fine">Datas de conferência de cada fonte na tabela abaixo. Confira sempre a redação oficial antes de citar.</p></section>'+
   '<section class="isec panel about"><h2 class="ih">Sobre a Grahl</h2><img class="about-logo" alt="" src="'+BRAND.logo+'"><p><b>Grahl Consultoria e Treinamentos</b> é conduzida por <b>Rogério Grahl</b>, Engenheiro Químico e Engenheiro de Segurança do Trabalho, com mais de 30 anos na indústria química e 19 anos em segurança do trabalho. Desde 2015 dedica-se à consultoria técnica, às perícias judiciais e à assistência técnica, e é professor de pós-graduação na disciplina Elaboração de Laudos Técnicos.</p><ul class="blist"><li><b>Perícia judicial:</b> insalubridade (NR-15), periculosidade (NR-16) e acidentes de trabalho; aposentadoria especial e ações regressivas; perícias em processos químicos</li><li><b>Assistência técnica:</b> análise preventiva do posto de trabalho, elaboração de quesitos e impugnação técnica de laudos</li><li><b>Auditoria de conformidade:</b> PGR, LIP e LTCAT confrontados com as condições reais de operação</li><li><b>Consultoria industrial:</b> injeção de poliuretano rígido (processo descontínuo) e responsabilidade técnica no setor químico</li><li><b>Docência e treinamento:</b> perícia judicial, laudos de insalubridade, periculosidade e aposentadoria especial</li></ul><p class="small">Engenharia de Segurança do Trabalho (UEL, 2007) · MBA em Gestão Empresarial (FGV, 2003) · Engenharia Química (FURB, 1995)</p><p class="small">CREA-SC 1039223-9 · CRQ 09302007 · Londrina, PR</p><div class="contacts"><a href="https://grahlconsultoria.com.br/" target="_blank" rel="noopener">grahlconsultoria.com.br</a><span>WhatsApp (43) 99884-6888</span><span>Instagram @rogerio_grahl</span></div></section></div>'+
   fontesHtml()+
   '<p class="fine center">Ferramenta de consulta técnica. Os resultados não substituem a análise do caso concreto, a inspeção do local de trabalho nem o laudo técnico assinado por profissional habilitado.</p>';
}

/* ---------- PAINEL ---------- */

/* ---------- APOSENTADORIA ESPECIAL: subabas ---------- */
function renderAposentadoria(){
  const sub=S.ap||'agentes', t=totais(S.caso);
  const badge={agentes:AGENTS.length+' agentes', data:S.dt?brData(S.dt):'consulta', comparar:(S.cmpAg||CMP_PADRAO).filter(Boolean).length+' agentes', caso:S.caso.rows.length+' período(s)', resultado:fmtDias(t.perito.dias)};
  const nav='<nav class="subnav" aria-label="Aposentadoria especial">'+AP_SUB.map(([k,tit,desc],i)=>'<a href="#aposentadoria/'+k+'" class="'+(k===sub?'on':'')+'" aria-current="'+(k===sub?'page':'false')+'"><span class="sn-n">'+(i+1)+'</span><span class="sn-t"><b>'+tit+'</b><small>'+desc+'</small></span><span class="sn-b">'+esc(badge[k])+'</span></a>').join('')+'</nav>';
  const head='<section class="aphead"><div><p class="eyebrow">Previdenciário · Lei 8.213/91, arts. 57 e 58 · Decreto 3.048/99, Anexo IV</p><h2>Aposentadoria especial</h2></div>'+nav+'</section>';
  const body = sub==='caso'?renderCaso(): sub==='resultado'?renderPainel(): sub==='data'?renderRegraData(): sub==='comparar'?renderComparar(): renderAgentes();
  return head+body;
}
function renderPainel(){
  const t=totais(S.caso), dif=t.perito.dias-t.inss.dias;
  const card=(lab,val,sub,cls='')=>'<div class="stat '+cls+'"><span class="lab">'+lab+'</span><span class="val">'+val+'</span><span class="sub">'+sub+'</span></div>';
  let h='<section class="intro"><div><p class="eyebrow">Simulação carregada</p><h2>'+esc(S.caso.nome||'Caso sem nome')+'</h2><p class="muted">'+S.caso.rows.length+' período(s) · '+(S.caso.sexo==='M'?'mulher':'homem')+' · edite na aba <a href="#aposentadoria/caso">Análise de caso</a></p></div></section>';
  h+='<div class="stats">'+
    card('Tempo especial · nota do especialista', fmtDias(t.perito.dias), t.perito.dias.toLocaleString('pt-BR')+' dias', 'acc')+
    card('Tempo especial · INSS (IN 128/2022)', fmtDias(t.inss.dias), t.inss.dias.toLocaleString('pt-BR')+' dias')+
    card('Diferença entre os critérios', fmtDias(Math.abs(dif)), (dif>=0?'a favor da nota do especialista':'a favor do INSS')+' · '+t.diverg+' trecho(s) divergente(s)')+
    card('Acréscimo por conversão até 13/11/2019', fmtDias(t.perito.conv), 'especialista · INSS: '+fmtDias(t.inss.conv))+
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
  const H=190, lanes=[['perito','Especialista',64],['inss','INSS',112]];
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
    AGENTS.filter(a=>a.grupo===g).forEach(a=>{ h+='<tr><td><a href="#aposentadoria/agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a></td>'+a.mx.map(m=>'<td>'+mxCell(a,m)+'</td>').join('')+'</tr>'; }); }
  const notas=Object.keys(MXX).filter(id=>agById(id)).map((id,k)=>'<li id="mxn-'+id+'"><b>'+(k+1)+'</b> '+esc(MXX[id].nota)+'</li>').join('');
  return h+'</tbody></table><div class="mxleg"><p><b>Como ler:</b> <span class="mxc mx-q">Qualitativo</span> basta a exposição na atividade descrita · <span class="mxc mx-l">Limite (LT)</span> exige medição acima do limite de tolerância · <span class="mxc mx-x">Atividade ou LT</span> o critério depende da norma ou do composto (ver nota numerada) · <span class="mxc mx-c">Via judicial</span> fora do Anexo IV, só com prova técnica em juízo · <span class="mxc mx-n">Não arrolado</span> sem enquadramento · <span class="mxc mx-p">Categoria</span> pela profissão, até 28/04/1995.</p><ol class="mxnotas">'+notas+'</ol></div>';
}

/* ---------- APOSENTADORIA (caso) ---------- */
function agentSelect(v){
  return GRUPOS.map(g=>'<optgroup label="'+g+'">'+AGENTS.filter(a=>a.grupo===g).map(a=>'<option value="'+a.id+'"'+(a.id===v?' selected':'')+'>'+esc(a.nome)+'</option>').join('')+'</optgroup>').join('');
}
function fld(i,f,lab,val,type='number',extra=''){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="'+(type==='number'?'text" inputmode="decimal':type)+'" data-r="'+i+'" data-f="'+f+'" value="'+esc(val??'')+'" '+extra+'></label>'; }
function sel(i,f,lab,val,opts){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><select id="'+id+'" data-r="'+i+'" data-f="'+f+'">'+opts.map(([k,t])=>'<option value="'+k+'"'+(String(val??'')===String(k)?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>'; }
function cb(i,f,lab,val){ const id='r'+i+'-'+f.replace('.','-'); return '<label class="cb" for="'+id+'"><input id="'+id+'" type="checkbox" data-r="'+i+'" data-f="'+f+'"'+(val?' checked':'')+'><span>'+lab+'</span></label>'; }
function campos(row,i){
  const a=agById(row.agente), d=row.d||{};
  switch(a.engine){
    case 'ruido': { const mr=d.mr||'lavg';
      let h=sel(i,'d.mr','Como a medição foi informada',mr,[['lavg','Lavg informado (laudo/PPP)'],['dose','Dose do dosímetro (%)'],['nps','Leituras pontuais (NPS × tempo)']])+fld(i,'d.te','Jornada Te (min)',d.te??480,'number','step="1"');
      if(mr==='lavg') h+=fld(i,'d.lavg','Lavg dB(A) · q = 5',d.lavg,'number','step="0.1"')+fld(i,'d.ne3','NE q = 3 (NHO-01) · opcional',d.ne3,'number','step="0.1"');
      if(mr==='dose') h+=fld(i,'d.dose5','Dose q = 5 (%)',d.dose5,'number','step="0.1"')+fld(i,'d.tm','Tempo de medição (min)',d.tm??d.te??480,'number','step="1"')+fld(i,'d.dose3','Dose q = 3 (%) · opcional',d.dose3,'number','step="0.1"');
      if(mr==='nps'){ const rows=npsRows(d); const n=Math.max(rows.length,1);
        h+='<div class="npsbox wide2"><table class="pt calc"><thead><tr><th>NPS dB(A)</th><th>Tempo (min)</th></tr></thead><tbody>'+Array.from({length:n},(_,k)=>'<tr><td><input type="text" inputmode="decimal" step="0.1" id="r'+i+'-nps-'+k+'-0" data-r="'+i+'" data-f="d.nps.'+k+'.0" value="'+esc(rows[k]?rows[k][0]??'':'')+'" aria-label="NPS '+(k+1)+'"></td><td><input type="text" inputmode="decimal" step="1" id="r'+i+'-nps-'+k+'-1" data-r="'+i+'" data-f="d.nps.'+k+'.1" value="'+esc(rows[k]?rows[k][1]??'':'')+'" aria-label="Tempo '+(k+1)+'"></td></tr>').join('')+'</tbody></table><div class="btns"><button class="ghost sm" data-npsr="'+i+'">Adicionar leitura</button><button class="ghost sm" data-npsx="'+i+'">Remover última</button></div><p class="fine">Lavg = 16,61·log[(1/T)·Σ tᵢ·10^(Lᵢ/16,61)]; NE (q = 3) = 10·log[(1/T)·Σ tᵢ·10^(Lᵢ/10)].</p></div>'; }
      h+='<div class="epibox wide2"><label class="cb"><input type="checkbox" id="r'+i+'-d-epiu" data-r="'+i+'" data-f="d.epiu"'+(d.epiu?' checked':'')+'> <b>Protetor auditivo informado</b> (considerado a partir de 03/12/1998)</label>';
      if(d.epiu){
        h+='<div class="fields">'+fld(i,'d.ca','Número do CA',d.ca,'text')+'<div class="f"><span>Consulta oficial</span><button class="ghost sm" data-caq="'+esc(d.ca||'')+'" type="button">Consultar CA no MTE ↗</button></div>'+fld(i,'d.cav','Validade do CA (opcional)',d.cav,'date')+fld(i,'d.nrr','Atenuação NRRsf (dB)',d.nrr,'number','step="1"')+'</div>'+
           '<p class="fine">Condições do art. 291 da IN 128/2022 (todas exigidas para considerar o EPI eficaz):</p><div class="ckcols">'+
           [['c1','Hierarquia: EPC e medidas administrativas antes do EPI'],['c2','Uso ininterrupto e funcionamento conforme o fabricante'],['c3','CA válido no período de uso'],['c4','Troca periódica comprovada por recibo'],['c5','Higienização']].map(([k,t])=>cb(i,'d.'+k,t,d[k])).join('')+'</div>';
      }
      h+='</div>';
      return h; }
    case 'calor': return fld(i,'d.ibutg','IBUTG ou TE (°C)',d.ibutg,'number','step="0.1"')+sel(i,'d.fonte','Fonte de calor',d.fonte||'artificial',[['artificial','Fonte artificial'],['fechado','Ambiente fechado sem fonte artificial'],['ceu','Céu aberto, só carga solar']])+sel(i,'d.ativ','Atividade (Anexo 3 original)',d.ativ||'moderada',[['leve','Leve'],['moderada','Moderada'],['pesada','Pesada']])+sel(i,'d.regime','Regime de trabalho (Anexo 3 original)',d.regime||'cont',Object.entries(Q1_ORIG).map(([k,v])=>[k,'Quadro 1 · '+v.rot]).concat([['q2','Quadro 2 · descanso em outro local (kcal/h)']]))+(d.regime==='q2'?fld(i,'d.mk','M média ponderada (kcal/h) · Quadro 2',d.mk,'number'):'')+fld(i,'d.m','M (W) · a partir de 11/12/2019',d.m,'number','step="1"')+fld(i,'d.av','Ajuste de vestimenta (°C, NHO-06) · a partir de 2004',d.av,'number')+cb(i,'d.caldeira','Alimentação de caldeira a carvão ou lenha (até 1997)',d.caldeira);
    case 'vibracao': return sel(i,'d.tipo','Tipo',d.tipo||'vci',[['vci','Corpo inteiro (VCI)'],['vmb','Mãos e braços (VMB)']])+fld(i,'d.aren','aren (m/s²)',d.aren,'number','step="0.01"')+fld(i,'d.vdv','VDVR (m/s¹·⁷⁵)',d.vdv,'number','step="0.1"')+sel(i,'d.iso','Referência ISO (1997–2014)',d.iso||'iso97',ISO_VIB.filter(x=>x.tipo!=='vmb').map(x=>[x.id,x.rot]))+cb(i,'d.martelete','Perfuratriz ou martelete pneumático',d.martelete);
    case 'radion': return cb(i,'d.cond','Atividade descrita (2.0.3 / 1.1.3)',d.cond)+sel(i,'d.lt','Acima do LT do Anexo 5?',d.lt||'',[['','Não informado'],['sim','Sim'],['nao','Não']]);
    case 'eletricidade': return cb(i,'d.cond','Exposição permanente acima de 250 V',d.cond);
    case 'ate97': case 'quali': return cb(i,'d.cond','Condição ou atividade descrita no decreto',d.cond);
    case 'categoria': return cb(i,'d.cond','Atividade ou grupo profissional listado',d.cond)+fld(i,'d.cod','Código (ex.: 2.4.4)',d.cod,'text');
    case 'quimico': { const modos=[['qual','Qualitativo (Anexo 13/13-A)'],['quant','Quantitativo (Anexos 11/12)']]; if(a.linach) modos.push(['linach','Cancerígeno LINACH Grupo 1']);
      return sel(i,'d.modo','Forma de avaliação',d.modo||a.modo,modos)+cb(i,'d.cond','Exposição nas operações/atividades descritas',d.cond)+fld(i,'d.conc','Concentração',d.conc,'number','step="any"')+fld(i,'d.lt','LT (mesma unidade)',d.lt,'number','step="any"'); }
    case 'biologico': return cb(i,'d.saude97','Até 1997: contato com doentes, animais ou materiais infectocontagiantes',d.saude97)+sel(i,'d.alinea','A partir de 06/03/1997: alínea do 3.0.1',d.alinea||'',[['','Nenhuma'],['a','a) estabelecimentos de saúde'],['b','b) animais infectados / soros e vacinas'],['c','c) autópsia, anatomia, anátomo-histologia'],['d','d) exumação; resíduos de animais'],['e','e) galerias, fossas e tanques de esgoto'],['f','f) esvaziamento de biodigestores'],['g','g) coleta e industrialização do lixo']])+cb(i,'d.t383','Saúde em hospital: procedimentos com aerossol, urgência/UTI/pronto-socorro/centro cirúrgico ou ala infectocontagiosa (TNU, Tema 383)',d.t383);
  }
  return '';
}
function rowCard(row,i){
  const a=agById(row.agente);
  return '<article class="row" data-i="'+i+'"><header><span class="idx">'+String(i+1).padStart(2,'0')+'</span><div class="rtt"><b>'+esc(row.funcao||'Função')+'</b><span>'+esc(row.empresa||'Empresa')+'</span></div><div class="btns"><button class="ghost sm" data-ag="'+esc(row.agente)+'">Ver ficha do agente</button><button class="ghost sm" data-del="'+i+'" aria-label="Remover período '+(i+1)+'">Remover</button></div></header>'+
   '<div class="fields">'+fld(i,'empresa','Empresa',row.empresa,'text')+fld(i,'funcao','Função',row.funcao,'text')+fld(i,'ini','Início',row.ini,'date')+fld(i,'fim','Fim',row.fim,'date')+
   '<label class="f wide" for="r'+i+'-agente"><span>Agente nocivo</span><select id="r'+i+'-agente" data-r="'+i+'" data-f="agente" data-re="1">'+agentSelect(row.agente)+'</select></label>'+
   sel(i,'tempo','Tempo exigido',row.tempo||a.tempo,[['25','25 anos'],['20','20 anos'],['15','15 anos']])+
   (a.engine==='ruido'?'':cb(i,'epi','EPI eficaz informado no PPP/LTCAT',row.epi))+
   '</div><div class="fields ag">'+campos(row,i)+'</div><div class="res" id="res-'+i+'">'+resTable(row)+'</div></article>';
}
function resTable(row){
  const a=agById(row.agente); const r=avaliar(row,a);
  if(r.erro) return '<p class="warn">'+r.erro+'</p>';
  const rinfo = a.engine==='ruido' ? ruidoDerive(row.d||{}).info : '';
  return (rinfo?'<p class="rinfo">'+esc(rinfo)+'</p>':'')+'<div class="scrollx"><table class="rt"><thead><tr><th>Trecho</th><th>Dias</th><th>Base</th><th>Nota do especialista</th><th>INSS</th></tr></thead><tbody>'+
   r.segs.map(s=>'<tr'+(s.perito.st!==s.inss.st?' class="dv"':'')+'><td class="mono">'+fmtBR(s.ini)+'<br>'+fmtBR(s.fim)+'</td><td class="mono">'+s.dias.toLocaleString('pt-BR')+'</td><td>'+esc(s.base)+'</td><td>'+chip(s.perito.st)+'<small>'+esc(s.perito.txt)+'</small></td><td>'+chip(s.inss.st)+'<small>'+esc(s.inss.txt)+'</small></td></tr>').join('')+'</tbody></table></div>';
}
function totBar(){
  const t=totais(S.caso);
  return '<div class="totbar"><div><span>Nota do especialista</span><b>'+fmtDias(t.perito.dias)+'</b></div><div><span>INSS</span><b>'+fmtDias(t.inss.dias)+'</b></div><div><span>Conversão até 13/11/2019 (perito)</span><b>+ '+fmtDias(t.perito.conv)+'</b></div><div><span>Trechos divergentes</span><b>'+t.diverg+'</b></div></div>';
}
function renderCaso(){
  const c=S.caso;
  return '<section class="intro"><div><p class="eyebrow">Simulação de enquadramento</p><h2>Aposentadoria especial por período</h2><p class="muted">Informe os períodos e os dados de exposição para ver como cada regra os trataria. Cada período é dividido nos marcos legais do agente e comparado com dois critérios: o do especialista (critério técnico da Grahl, com a fundamentação de cada ponto) e o do INSS (IN 128/2022). Fatores de conversão do art. 70 do Decreto 3.048/99, só até 13/11/2019.</p></div></section>'+
  '<div class="consulta-aviso" role="note"><b>Ferramenta de consulta.</b> A simulação aplica as regras aos dados digitados; não examina documentos, não verifica a habitualidade nem a qualidade da prova e não substitui o laudo, o parecer ou a decisão. O resultado é um ponto de partida para a análise do profissional.</div>'+
  casebar()+'<div class="casehead"><label class="f wide" for="c-nome"><span>Identificação do caso</span><input id="c-nome" type="text" data-c="nome" value="'+esc(c.nome)+'"></label>'+
  '<label class="f" for="c-sexo"><span>Segurado</span><select id="c-sexo" data-c="sexo"><option value="H"'+(c.sexo!=='M'?' selected':'')+'>Homem</option><option value="M"'+(c.sexo==='M'?' selected':'')+'>Mulher</option></select></label>'+
  '<div class="btns"><button data-act="add">Adicionar período</button><button class="ghost" data-act="clr">Limpar períodos</button><button class="ghost" data-act="copy">Copiar quadro-resumo</button><button class="printbtn" data-print="caso">Imprimir simulação</button></div></div>'+
  '<div id="totbar">'+totBar()+'</div><div class="rows">'+c.rows.map(rowCard).join('')+'</div>'+
  (c.rows.length?'':'<p class="empty">Nenhum período. Use <b>Adicionar período</b> ou crie um caso a partir do <button class="linkbtn" data-act="ex">exemplo</button>.</p>')+
  '<p class="fine">Os dois critérios aplicam a informação de EPI eficaz a partir de 03/12/1998, conforme o STJ (Tema 1090), salvo ruído e cancerígenos LINACH. Contagem em dias corridos; a conversão em anos, meses e dias usa 365/30 dias.</p>';
}
function resumoTexto(){
  const linhas=['Período\tEmpresa\tFunção\tAgente\tBase legal\tNota do especialista\tINSS'];
  S.caso.rows.forEach(row=>{ const a=agById(row.agente); avaliar(row,a).segs.forEach(s=>linhas.push(fmtBR(s.ini)+' a '+fmtBR(s.fim)+'\t'+(row.empresa||'')+'\t'+(row.funcao||'')+'\t'+a.nome+'\t'+s.base+'\t'+ST[s.perito.st]+' — '+s.perito.txt+'\t'+ST[s.inss.st]+' — '+s.inss.txt)); });
  const t=totais(S.caso); linhas.push('','Tempo especial (perito): '+fmtDias(t.perito.dias)+' ('+t.perito.dias+' dias)','Tempo especial (INSS): '+fmtDias(t.inss.dias)+' ('+t.inss.dias+' dias)');
  return linhas.join('\n');
}

/* ---------- AGENTES ---------- */
const SIM_DEF = {ruido:{mr:'lavg',lavg:88,te:480}, calor:{ibutg:28.5,ativ:'moderada',regime:'cont',m:300,fonte:'artificial'}, vibracao:{tipo:'vci',aren:0.95,iso:'iso97'}, biologico:{alinea:'a',saude97:true}};
function simRow(){ S.sim=S.sim||{}; const a=agById(S.ag); if(!S.sim[a.id]) S.sim[a.id]={agente:a.id, ini:'1990-01-01', fim:'2025-12-31', tempo:a.tempo, epi:false, d:JSON.parse(JSON.stringify(SIM_DEF[a.id]||(a.engine==='quimico'?{modo:a.modo,cond:true}:{cond:true})))}; return S.sim[a.id]; }
function simHtml(a){
  const row=simRow();
  return '<section class="simbox"><div class="fhead"><h3>Simular enquadramento</h3><div class="btns"><button class="ghost sm" data-simrst="1">Restaurar exemplo</button><button class="ghost sm" data-simuse="1">Incluir na simulação</button></div></div><p class="muted small">Informe um período e as condições de exposição: a ferramenta divide o período nos marcos legais deste agente e mostra o resultado pela nota do especialista e pelo INSS.</p>'+
   '<div class="fields">'+fld('s','ini','Início',row.ini,'date')+fld('s','fim','Fim',row.fim,'date')+sel('s','tempo','Tempo exigido',row.tempo||a.tempo,[['25','25 anos'],['20','20 anos'],['15','15 anos']])+(a.engine==='ruido'?'':cb('s','epi','EPI eficaz informado no PPP/LTCAT',row.epi))+'</div><div class="fields ag">'+campos(row,'s')+'</div><div class="res" id="res-s">'+resTable(row)+'</div></section>';
}



/* ---------- LEITURAS INSTANTÂNEAS (NHT-06 / NR-15, Anexo 1) ---------- */
const NHT06_TAB = [[80,960],[81,835],[82,725],[83,630],[84,550],[85,480],[86,415],[87,360],[88,315],[89,275],[90,240],[91,205],[92,180],[93,155],[94,135],[95,120],[96,104],[97,90],[98,79],[99,69],[100,60],[101,52],[102,45],[103,39],[104,34],[105,30],[106,26],[107,22],[108,19],[109,17],[110,15],[111,13],[112,11],[113,9],[114,8],[115,7]];
const LI_MET = {
  nht06:{rot:'NHT-06 (1985), critérios próprios', desc:'média das leituras arredondada algebricamente para o inteiro (item VI.4.f); Ti da tabela da NHT-06, de 80 a 115 dB(A) (item VI.6.b); dose arredondada para décimos (item VI.6.c); sem cálculo de dose se houver nível acima de 115 dB(A) (item VI.6.e)'},
  nht06q:{rot:'NHT-06 + Quadro do Anexo 1 (nota do especialista)', desc:'média das leituras arredondada para o inteiro (NHT-06, item VI.4.f); Ti do Quadro do Anexo 1 da NR-15 com o nível imediatamente superior para os níveis ausentes do Quadro (item 4); de 80 a 84 dB(A), tabela da NHT-06 (limiar de 80 dB(A)); dose em décimos; sem cálculo acima de 115 dB(A)'},
  nht06a:{rot:'NHT-06 com Apêndice 1 (ajuste à NR-15)', desc:'média arredondada para o inteiro; Ti do Quadro do Anexo 1 da NR-15, com o nível imediatamente superior para os níveis ausentes do Quadro; níveis abaixo de 85 dB(A) desprezados; dose em décimos; sem cálculo acima de 115 dB(A)'},
  nr15:{rot:'NR-15, Anexo 1 (item 4), limiar de 80 dB(A)', desc:'média arredondada a 0,1 dB; Ti do Quadro do Anexo 1 com o nível imediatamente superior (item 4); de 80 a 84 dB(A), tabela da NHT-06 (limiar de 80 dB(A), nota do especialista)'},
  form:{rot:'Fórmula q = 5', desc:'média arredondada a 0,1 dB; Ti = 480 / 2^((L − 85)/5), a partir de 80 dB(A)'}
};
const LI_DEF={te:'480', met:'nht06q', s:[{n:'Operação da prensa',l:'92; 93; 92',t:'150'},{n:'Abastecimento',l:'87; 88,5; 88',t:'180'},{n:'Inspeção',l:'84; 83; 84',t:'90'},{n:'Refeitório e pausas',l:'72; 74; 73',t:'60'},{n:'',l:'',t:''},{n:'',l:'',t:''}]};
function liState(){ if(!S.li) S.li=JSON.parse(JSON.stringify(LI_DEF)); if(!LI_MET[S.li.met]) S.li.met='nht06q'; return S.li; }
function liParse(str){ return String(str||'').split(/[;\s\/]+/).map(x=>num(x)).filter(x=>x!==null); }
const nextUp=(tab,L)=>{ for(const [n,t] of tab){ if(n>=L) return t; } return tab.at(-1)[1]; };
function liMean(ls,met){ const m=ls.reduce((a,b)=>a+b,0)/ls.length; return isNht(met) ? Math.round(m) : r1(m); }
function isNht(k){ return k==='nht06'||k==='nht06a'||k==='nht06q'; }
function liTi(L, met){
  if(met==='form') return L<80 ? Infinity : 480/Math.pow(2,(L-85)/5);
  if(met==='nht06') return L<80 ? Infinity : nextUp(NHT06_TAB,L);
  if(met==='nht06a') return L<85 ? Infinity : nextUp(A1_QUADRO,L);
  if(met==='nht06q'){ if(L<80) return Infinity; return L<85 ? nextUp(NHT06_TAB,L) : nextUp(A1_QUADRO,L); }
  if(L<80) return Infinity;
  if(L<85) return nextUp(NHT06_TAB,L);
  return nextUp(A1_QUADRO,L);
}
function liDose(sit,met){ return sit.reduce((a,x)=>{ const m=liMean(x.ls,met), ti=liTi(m,met); return a+(isFinite(ti)?x.t/ti:0); },0); }
function liCalc(c){
  const te=num(c.te); if(te===null||te<=0) return {err:'Informe a jornada Te em minutos.'};
  const met=c.met, nht=isNht(met);
  const sit=c.s.map((x,i)=>({i, n:x.n||('Situação '+(i+1)), ls:liParse(x.l), t:num(x.t)})).filter(x=>x.ls.length&&x.t!==null&&x.t>0);
  if(!sit.length) return {err:'Informe ao menos uma situação acústica com leituras e tempo.'};
  sit.forEach(x=>{ x.m=liMean(x.ls,met); x.amp=Math.max(...x.ls)-Math.min(...x.ls); x.ti=liTi(x.m,met); x.fr=isFinite(x.ti)?x.t/x.ti:0; });
  const over = sit.some(x=>Math.max(...x.ls)>115||x.m>115);
  const T=sit.reduce((a,x)=>a+x.t,0), base=Math.max(T,te);
  let D=sit.reduce((a,x)=>a+x.fr,0); const Dshow = nht ? Math.round(D*10)/10 : D;
  const semDose = nht && over;
  const ok=D>0 && !semDose;
  const lavg = ok ? 85+16.61*log10(D*480/T) : null;
  const ne = ok ? 85+16.61*log10(D*480/base) : null;
  const nen = ok ? 85+16.61*log10(D) : null;
  const outros = Object.keys(LI_MET).filter(k=>k!==met).map(k=>{ const d=liDose(sit,k), n=isNht(k); return [k, n&&over?null:(n?Math.round(d*10)/10:d)]; });
  return {te, T, base, D, Dshow, nht, semDose, lavg, ne, nen, sit, over, outros};
}
function liRes(){
  const c=liState(), r=liCalc(c);
  if(r.err) return '<p class="note">'+esc(r.err)+'</p>';
  const tfmt=t=>!isFinite(t)?'—':t>=60?Math.floor(t/60)+' h'+(Math.round(t%60)?' '+Math.round(t%60)+' min':''):Math.round(t)+' min';
  const lim = c.met==='nht06a'?85:80;
  let h='<div class="scrollx"><table class="pt"><thead><tr><th>Situação acústica</th><th>Leituras dB(A)</th><th>Média'+(r.nht?' (inteiro)':'')+'</th><th>Tempo na jornada (Ci)</th><th>Tempo máximo (Ti)</th><th>Ci / Ti</th></tr></thead><tbody>'+
   r.sit.map(x=>'<tr><td>'+esc(x.n)+'</td><td class="mono">'+x.ls.map(v=>brn0(v)).join(' · ')+(x.ls.length<3?' <small>(menos de 3)</small>':'')+(x.amp>3?' <small>(variação '+brn0(Math.round(x.amp*10)/10)+' dB)</small>':'')+'</td><td>'+(r.nht?String(x.m):f1(x.m))+'</td><td>'+x.t+' min</td><td>'+(isFinite(x.ti)?tfmt(x.ti):'abaixo de '+lim+' dB(A): não soma')+'</td><td>'+(isFinite(x.ti)?brn0(Math.round(x.fr*1000)/1000):'0')+'</td></tr>').join('')+
   '</tbody></table></div>';
  if(r.over) h+='<div class="verdict v-c"><b>Nível acima de 115 dB(A)</b><p>A NR-15 não permite exposição acima de 115 dB(A) sem proteção adequada (itens 5 e 7). '+(r.nht?'Pela NHT-06 (item VI.6.e), o cálculo da dose não é realizado: registrar \"Situação de Emergência\".':'A NHT-06 manda não calcular a dose nesse caso; o valor abaixo é só ilustrativo.')+'</p></div>';
  const kv=(k,v,s)=>'<div><span>'+k+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  const dtxt = r.semDose ? 'não calculada' : r.nht ? brn0(r.Dshow)+' ('+brn0(Math.round(r.Dshow*100))+'%)' : brn0(Math.round(r.D*1000)/10)+'%';
  h+='<div class="kv">'+kv('Dose da jornada', dtxt, r.semDose?'nível acima de 115 dB(A)':'Σ Ci/Ti = '+brn0(Math.round(r.D*1000)/1000)+(r.nht?'; arredondada para décimos':''))+
     kv('Lavg do período avaliado ('+r.T+' min)', r.lavg===null?'—':f1(r.lavg)+' dB(A)')+
     kv('NE (jornada de '+r.base+' min)', r.ne===null?'—':f1(r.ne)+' dB(A)')+
     kv('NEN (8 h, q = 5)', r.nen===null?'—':f1(r.nen)+' dB(A)', r.nen===null?'':(r1(r.nen)>85?'acima de 85 dB(A)':'até 85 dB(A)'))+'</div>';
  if(r.T<r.te) h+='<p class="note">As situações somam '+r.T+' min, menos que a jornada de '+r.te+' min: o restante foi tratado como abaixo do limiar. Se não for, inclua a situação que falta.</p>';
  if(r.T>r.te) h+='<p class="note">As situações somam '+r.T+' min, mais que a jornada informada ('+r.te+' min): o cálculo usou '+r.T+' min como jornada.</p>';
  h+='<p class="small">Dose pelos outros métodos: '+r.outros.map(([k,d])=>LI_MET[k].rot+': <b>'+(d===null?'não calculada':isNht(k)?brn0(d):brn0(Math.round(d*1000)/10)+'%')+'</b>').join(' · ')+'.</p>'+
   '<p class="fine">Método: '+LI_MET[c.met].rot+' — '+LI_MET[c.met].desc+'. Lavg = 85 + 16,61 · log(D · 480 / T); NE = 85 + 16,61 · log(D · 480 / Te); NEN = 85 + 16,61 · log(D), calculados com a dose sem arredondamento. Até 18/11/2003 compare o Lavg da jornada (80 ou 90 dB(A)); a partir de 19/11/2003, o NEN (85 dB(A)).</p>';
  return h;
}
function liHtml(){
  const c=liState(), inp=(k,lab,val,ph)=>'<label class="f"><span>'+lab+'</span><input type="text" '+(k.endsWith('.n')||k.endsWith('.l')?'':'inputmode="decimal" ')+'id="li-'+k.replace(/\./g,'-')+'" data-li="'+k+'" value="'+esc(val||'')+'"'+(ph?' placeholder="'+ph+'"':'')+'></label>';
  return '<section class="simbox" id="libox"><div class="fhead"><h3>Leituras instantâneas: dose, Lavg, NE e NEN</h3><div class="btns"><button class="ghost sm" data-lirst="1">Restaurar exemplo</button></div></div><p class="muted small">Avaliação por medidor de leitura instantânea (NHT-06 R/E; NR-15, Anexo 1): para cada situação acústica, informe as leituras (pelo menos 3, separadas por ponto e vírgula) e o tempo total na jornada.</p>'+
   '<div class="fields">'+inp('te','Jornada Te (min)',c.te)+'<label class="f"><span>Método</span><select data-lisel="met">'+Object.entries(LI_MET).map(([k,m])=>'<option value="'+k+'"'+(c.met===k?' selected':'')+'>'+m.rot+'</option>').join('')+'</select></label></div>'+
   '<div class="lirows">'+c.s.map((x,i)=>'<div class="fields">'+inp('s.'+i+'.n','Situação '+(i+1),x.n,'Ex.: operação da prensa')+inp('s.'+i+'.l','Leituras dB(A)',x.l,'88; 89; 88,5')+inp('s.'+i+'.t','Tempo na jornada (min)',x.t)+'</div>').join('')+'</div>'+
   '<div class="res" id="lires">'+liRes()+'</div></section>';
}
/* ---------- COMPARADOR DE GRANDEZAS (ruído) ---------- */
const CMP_DEF={modo:'nps', te:'600', tm:'', rep:true, l5:'', l3:'', r:[['92','120'],['86','240'],['78','120'],['95','60'],['','']]};
function cmpState(){ if(!S.cmp) S.cmp=JSON.parse(JSON.stringify(CMP_DEF)); return S.cmp; }
function cmpCalc(c){
  const te=num(c.te); if(te===null||te<=0) return {err:'Informe a jornada Te em minutos.'};
  let l5=null,l3=null,tm=null,info='';
  if(c.modo==='nps'){
    const rows=c.r.map(([L,t])=>[num(L),num(t)]).filter(([L,t])=>L!==null&&t!==null&&t>0);
    if(!rows.length) return {err:'Informe ao menos uma leitura (nível e tempo).'};
    tm=rows.reduce((a,[,t])=>a+t,0);
    const e5=rows.reduce((a,[L,t])=>a+(L>=80?t*Math.pow(10,L/16.61):0),0), e3=rows.reduce((a,[L,t])=>a+(L>=80?t*Math.pow(10,L/10):0),0);
    if(e5<=0) return {err:'Todas as leituras estão abaixo do limiar de integração (80 dB(A)): dose nula.'};
    l5=16.61*log10(e5/tm); l3=10*log10(e3/tm);
    const abaixo=rows.filter(([L])=>L<80).reduce((a,[,t])=>a+t,0);
    info=rows.length+' leitura(s) somando '+tm+' min'+(abaixo?'; '+abaixo+' min abaixo de 80 dB(A) contam no tempo, mas não somam energia (limiar de integração)':'')+'.';
  } else { l5=num(c.l5); l3=num(c.l3); tm=num(c.tm)||te; if(l5===null&&l3===null) return {err:'Informe o Lavg (q = 5) e/ou o Leq (q = 3) do período medido.'}; }
  const rep = c.rep || tm>=te;
  const one=(Lm,q)=>{ if(Lm===null) return null; const k=q===5?16.61:10;
    const ne = rep ? Lm : Lm + k*log10(Math.min(tm,te)/te);
    const nen = ne + k*log10(te/480);
    const dose = 100*Math.pow(2,(r1(nen)-85)/q);
    const tmax = 480/Math.pow(2,(ne-85)/q);
    return {Lm, ne, nen, dose, tmax}; };
  return {te, tm, rep, info, q5:one(l5,5), q3:one(l3,3)};
}
function cmpRes(){
  const c=cmpState(), r=cmpCalc(c);
  if(r.err) return '<p class="note">'+esc(r.err)+'</p>';
  const v=(x,k,dec)=>x?(k==='dose'?brn0(Math.round(x[k]*10)/10)+'%':k==='tmax'?(x[k]>=1440?'> 24 h':Math.round(x[k])+' min'):f1(x[k])+' dB(A)'):'—';
  const ok=x=>x?(r1(x.nen)>85?'<b class="okline">acima de 85 dB(A)</b>':'até 85 dB(A)'):'—';
  const d = (r.q5&&r.q3)? r1(r.q3.nen)-r1(r.q5.nen) : null;
  return (r.info?'<p class="muted small">'+esc(r.info)+'</p>':'')+
   '<div class="scrollx"><table class="pt"><thead><tr><th>Grandeza</th><th>q = 5 (NR-15)</th><th>q = 3 (NHO-01)</th></tr></thead><tbody>'+
   '<tr><td>Nível médio do período medido ('+r.tm+' min)</td><td>Lavg '+v(r.q5,'Lm')+'</td><td>Leq '+v(r.q3,'Lm')+'</td></tr>'+
   '<tr><td>NE — nível representativo da jornada ('+r.te+' min)</td><td>'+v(r.q5,'ne')+'</td><td>'+v(r.q3,'ne')+'</td></tr>'+
   '<tr><td>NEN — normalizado para 8 h</td><td>'+v(r.q5,'nen')+'</td><td>'+v(r.q3,'nen')+'</td></tr>'+
   '<tr><td>Dose diária (critério 85 dB(A))</td><td>'+v(r.q5,'dose')+'</td><td>'+v(r.q3,'dose')+'</td></tr>'+
   '<tr><td>Tempo máximo diário no NE</td><td>'+v(r.q5,'tmax')+'</td><td>'+v(r.q3,'tmax')+'</td></tr>'+
   '<tr><td>NEN frente ao limite de 85 dB(A)</td><td>'+ok(r.q5)+'</td><td>'+ok(r.q3)+'</td></tr>'+
   '</tbody></table></div>'+
   (d!==null?(()=>{ const dm=r.q3.ne-r.q5.ne, dn=(r.q3.nen-r.q3.ne)-(r.q5.nen-r.q5.ne); return '<p class="small">Diferença NEN (q = 3) − NEN (q = 5): <b>'+(d>0?'+':'')+brn0(Math.round(d*10)/10)+' dB</b>, sendo '+(dm>=0?'+':'')+brn0(Math.round(dm*10)/10)+' dB da média (a média por energia, q = 3, pesa mais os níveis altos; com ruído estável essa parcela é zero) e '+(dn>=0?'+':'')+brn0(Math.round(dn*10)/10)+' dB da normalização para 8 h (com jornada acima de 480 min a correção 16,61 · log, de q = 5, é maior que a 10 · log, de q = 3; abaixo de 480 min, o contrário).</p>'; })():'')+
   '<p class="fine">Fórmulas: Lavg = 16,61 · log[Σ(t·10^(L/16,61))/T]; Leq = 10 · log[Σ(t·10^(L/10))/T]; NEN = NE + k · log(Te/480), com k = 16,61 (q = 5) ou 10 (q = 3). Limiar de integração de 80 dB(A) nos dois critérios. '+(r.rep?'A medição foi tratada como representativa da jornada (NE = nível médio medido).':'O tempo não medido foi tratado como sem exposição acima do limiar (NE reduzido pela razão Tm/Te).')+' Arredondamento a 0,1 antes da comparação.</p>';
}
function cmpHtml(){
  const c=cmpState(), inp=(k,lab,val,ph)=>'<label class="f"><span>'+lab+'</span><input type="text" inputmode="decimal" id="cmp-'+k.replace(/\./g,'-')+'" data-cmp="'+k+'" value="'+esc(val||'')+'"'+(ph?' placeholder="'+ph+'"':'')+'></label>';
  let h='<section class="simbox" id="cmpbox"><div class="fhead"><h3>Comparar grandezas: q = 5 × q = 3</h3><div class="btns"><button class="ghost sm" data-cmprst="1">Restaurar exemplo</button></div></div><p class="muted small">Os mesmos dados calculados pelos dois critérios: Lavg, NE e NEN com q = 5 (NR-15) e Leq, NE e NEN com q = 3 (NHO-01).</p>'+
   '<div class="fields"><label class="f"><span>Entrada</span><select data-cmpsel="modo"><option value="nps"'+(c.modo==='nps'?' selected':'')+'>Leituras (nível e tempo)</option><option value="medio"'+(c.modo==='medio'?' selected':'')+'>Lavg e Leq já medidos</option></select></label>'+inp('te','Jornada Te (min)',c.te)+
   '<label class="cb"><input type="checkbox" data-cmpcb="rep"'+(c.rep?' checked':'')+'> A medição representa a jornada</label></div>';
  if(c.modo==='nps') h+='<div class="fields">'+c.r.map((x,i)=>inp('r.'+i+'.0','Nível '+(i+1)+' dB(A)',x[0])+inp('r.'+i+'.1','Tempo '+(i+1)+' (min)',x[1])).join('')+'</div>';
  else h+='<div class="fields">'+inp('l5','Lavg q = 5 (dB(A))',c.l5)+inp('l3','Leq q = 3 (dB(A))',c.l3)+inp('tm','Tempo medido Tm (min)',c.tm,'= Te se vazio')+'</div>';
  return h+'<div class="res" id="cmpres">'+cmpRes()+'</div></section>';
}
/* ---------- PROTÓTIPO: RUÍDO EM 5 PASSOS ---------- */
const RS_STEPS=[['criterio','Critério por período','O que vale em cada época?'],['campo','Levantamento em campo','Como medir?'],['metodo','Metodologia e cálculo','Qual norma e qual grandeza?'],['simular','Simular','Com os meus dados, enquadra?'],['documentar','Documentar','Como registrar no PPP e no laudo?']];
const RS_MANUAL=[
 ['Até 28/04/1995','Acima de 80 dB(A)','NR-15, Anexo 1','Decreto 53.831/64','Laudo técnico','Sem obrigatoriedade de informação','1.1.6','IS SSS-501.19/71, ISS-132, SB-40, DISES BE 5235'],
 ['29/04/1995 a 13/10/1996','Acima de 80 dB(A)','NR-15, Anexo 1','Decreto 53.831/64','LTCAT ou demais demonstrações ambientais','Sem obrigatoriedade de informação','1.1.6','DSS-8030'],
 ['14/10/1996 a 05/03/1997','Acima de 80 dB(A)','NR-15, Anexo 1','Decreto 53.831/64; MP 1.523/96','LTCAT ou demais demonstrações ambientais','Informação sobre EPC','1.1.6','DSS-8030'],
 ['06/03/1997 a 02/12/1998','Acima de 90 dB(A)','NR-15, Anexo 1','Decreto 2.172/97','LTCAT ou demais demonstrações ambientais','Informação sobre EPC','2.0.1','DSS-8030'],
 ['03/12/1998 a 06/05/1999','Acima de 90 dB(A)','NR-15, Anexo 1','Decreto 2.172/97; Lei 9.528/97','LTCAT ou demais demonstrações ambientais','Informação sobre EPC e EPI','2.0.1','DSS-8030, DIRBEN-8030'],
 ['07/05/1999 a 18/11/2003','Acima de 90 dB(A)','NR-15, Anexo 1','Decreto 3.048/99','LTCAT (a IN 170/2024 retirou a exigência de histograma a partir de 11/10/2001)','Informação sobre EPC e EPI','2.0.1','DSS-8030, DIRBEN-8030'],
 ['19/11/2003 a 31/12/2003','Acima do LT de 85 dB(A)','NR-15 ou NHO-01','Decreto 3.048/99, red. Decreto 4.882/03','LTCAT ou demais demonstrações ambientais','Informação sobre EPC e EPI','2.0.1','DIRBEN-8030'],
 ['A partir de 01/01/2004','Acima do LT de 85 dB(A), em NEN','NHO-01 (INSS)','Decreto 3.048/99, red. Decreto 4.882/03; IN 99/2003; (+) art. 68, § 12 (Decreto 8.123/13)','LTCAT, se necessário','Informação sobre EPC e EPI','2.0.1','PPP'],
 ['(+) A partir de 01/01/2023','Acima do LT de 85 dB(A), em NEN','NHO-01 (INSS)','IN 128/2022, art. 292; Portaria MTP 313/2021 (red. Portaria MTP 1.010/2021)','LTCAT','Informação sobre EPC e EPI','2.0.1','PPP eletrônico (eSocial, S-2240)']];
const RS_HARM=[
 ['Até 05/03/1997','Decreto 53.831 (80 dB) e Decreto 83.080 (90 dB) vigentes juntos','O INSS aplica 80 dB(A), o mais favorável'],
 ['Até 05/03/1997','Limite previdenciário de 80 dB(A) abaixo do limite trabalhista de 85 dB(A)','Limiar de integração de 85 dB(A) despreza a faixa de 80 a 85 que enquadra'],
 ['Até 02/12/1998','Valores múltiplos de ruído no formulário: acima e abaixo do LT vão à Perícia Médica com histograma ou memória de cálculo (IN 128, art. 292, §2º, red. IN 170/2024)','Sem histograma, o período pode ficar sem enquadramento'],
 ['A partir de 19/11/2003','O decreto toma da NR-15 os limites (q = 5) e da Fundacentro só o método; o INSS exige o NEN da NHO-01 (q = 3). As NHO não fixam limites (Portaria Fundacentro 675/2021)','O mesmo ambiente pode enquadrar por um critério e não pelo outro'],
 ['19/11 a 31/12/2003','A IN cria transição que o decreto não prevê','INSS aceita NR-15 ou NHO-01'],
 ['A partir de 17/10/2013','O § 12 (Decreto 8.123) deixa de citar os limites da legislação trabalhista; a IN mantém o Quadro do Anexo 1','A IN sustenta a referência à NR-15 que o decreto retirou'],
 ['Todos','O INSS só aceita "NEN" escrito no PPP; "dosímetro" ou "dosimetria" não são técnica','PPP tecnicamente correto pode ser recusado por redação']];
const RS_CK={
 'Antes da vistoria':['Função, setor, período e jornada do segurado (Te), com a fonte da jornada: controle de ponto, empresa ou observação','Layout, máquinas e fontes de ruído; turnos e ciclos de trabalho','Grupos homogêneos de exposição; em perícia por similaridade, o critério de escolha do paradigma','Documentos da empresa: LTCAT, PGR/PPRA, PPP e laudos anteriores'],
 'Equipamento':['Dosímetro configurado: critério 85 dB(A), q = 5, limiar 80 dB(A), circuito A, resposta lenta','Calibrador acústico e certificados de calibração do dosímetro e do calibrador válidos','Baterias carregadas; relógio do aparelho acertado'],
 'Medição':['Calibração antes da medição, anotando o valor','Microfone na zona auditiva (150 ± 50 mm do ouvido), do lado mais exposto','Jornada inteira ou período representativo com ciclos completos; na dúvida, a jornada inteira','Horário de início e fim, tempo efetivo e interrupções','Atividades e máquinas em operação; condição operacional habitual','Leituras instantâneas: pelo menos 3 por situação acústica, com o tempo de cada situação (cronômetro)','EPI usado (tipo e CA) e EPC existentes'],
 'Depois da medição':['Calibração final e desvio dentro do aceito pela norma (NHT-06: ± 1 dB; NHT-09: ± 0,5 dB)','Relatório do aparelho com parâmetros, dose, Lavg e histograma','Medição parcial: projetar a dose para a jornada (Te)','Fotos do posto e do posicionamento do microfone']};
function rsStep(){ const k=S.rstep||'criterio'; return RS_STEPS.some(s=>s[0]===k)?k:'criterio'; }
function rsNav(cur){
  return '<nav class="rsnav" aria-label="Passos">'+RS_STEPS.map(([k,t,q],i)=>'<button data-rstep="'+k+'" class="'+(k===cur?'on':'')+'" aria-current="'+(k===cur?'step':'false')+'"><b>'+(i+1)+'</b><span>'+t+'</span><small>'+q+'</small></button>').join('')+'</nav>';
}
function rsPager(cur){ const i=RS_STEPS.findIndex(s=>s[0]===cur), p=RS_STEPS[i-1], n=RS_STEPS[i+1];
  return '<div class="rspager">'+(p?'<button class="ghost" data-rstep="'+p[0]+'">← '+(i)+'. '+p[1]+'</button>':'<span></span>')+(n?'<button data-rstep="'+n[0]+'">'+(i+2)+'. '+n[1]+' →</button>':'')+'</div>'; }
function tbl(head, rows, cls){ return '<div class="scrollx"><table class="pt'+(cls?' '+cls:'')+'"><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,k)=>'<td'+(k===0?' class="mono"':'')+'>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'; }
function rsCriterio(a){
  const jur=(a.juris||[]).map(j=>TESES[j.slice(2)]).filter(Boolean);
  return '<p class="lead">O ruído enquadra com 25 anos de exposição, em três limites sucessivos: acima de 80 dB(A) até 05/03/1997, acima de 90 dB(A) até 18/11/2003 e NEN acima de 85 dB(A) desde 19/11/2003.</p>'+
   '<h3>Quadro-resumo por período</h3><p class="fine">Formato do Manual de Aposentadoria Especial do INSS (2018, Quadro 17); acréscimos marcados com (+).</p>'+
   tbl(['Período','Enquadramento','Metodologia','Legislação','Demonstrações ambientais','Equipamento de proteção','Código','Formulários'], RS_MANUAL.map(r=>r.map(esc)), 'manual')+
   '<div class="tri"><section class="col perito"><h4>Nota do especialista</h4><ul>'+['NR-15, Anexo 1, com q = 5, em todos os períodos.','Até 18/11/2003, compara-se o Lavg da jornada.','A partir de 19/11/2003, o NEN com q = 5: NEN = Lavg + 16,61 · log(Te/480).','Dosímetro: critério 85 dB(A), q = 5, limiar 80 dB(A).','Arredondamento a 0,1 dB antes da comparação.','EPI e EPC: o laudo informa a proteção e a sua eficácia (Lei 8.213, art. 58, § 2º; Decreto 3.048, art. 68, § 5º). Efeito sobre o enquadramento: posição em aberto.'].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><p class="fine">Fundamentos: Decreto 4.882/03, art. 68, § 11 (\"limites de tolerância\" da legislação trabalhista); IN 128/2022, art. 292, IV, a; Portaria Fundacentro 675/2021, art. 2º; Manual INSS 2018, Quadro 17; NHT-06 e NHT-09.</p></section>'+
   '<section class="col inss"><h4>INSS · IN 128/2022, art. 292</h4><ul>'+a.inss.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section></div>'+
   '<details><summary>EPI e EPC: o que diz cada norma (por hierarquia)</summary><p class="small">Nenhuma lei ou decreto diz que o EPI \"não descaracteriza\" o ruído: essa regra é do STF (Tema 555), um critério jurídico, incorporado pela IN 128.</p>'+
   tbl(['Nível','Norma','O que diz'],[
    ['Constituição','Art. 201, § 1º, II (EC 103/2019)','Aposentadoria especial para atividades com \"efetiva exposição\" a agentes prejudiciais à saúde'],
    ['Lei','Lei 8.213/91, art. 58, § 2º','O laudo informa a tecnologia de proteção coletiva ou individual que diminua a intensidade a limites de tolerância e recomenda a sua adoção'],
    ['Lei','Lei 8.213/91, art. 57, §§ 6º e 7º','Contribuição adicional de 12, 9 ou 6 pontos conforme a atividade permita a aposentadoria especial; só sobre a remuneração do exposto'],
    ['Decreto','Decreto 3.048/99, art. 68, § 5º','O laudo traz a tecnologia de proteção coletiva ou individual e a sua eficácia'],
    ['Decreto','Decreto 3.048/99, art. 202, §§ 1º e 2º','Adicional de 12, 9 ou 6 pontos se a atividade ensejar aposentadoria especial'],
    ['IN','IN 128/2022, arts. 290 e 291','EPI considerado desde 03/12/1998, se comprovadamente eliminar ou neutralizar; no ruído, a declaração de EPI eficaz não descaracteriza'],
    ['Receita','ADI RFB 2/2019; IN RFB 2.110/2022, arts. 231 e 232','Cobra o adicional com ruído acima do limite, mesmo com EPI eficaz']].map(r=>r.map(esc)))+
   '<ul><li><b>STF, Tema 555 (ARE 664.335, 04/12/2014):</b> sem direito se o EPI neutralizar; no ruído, a declaração no PPP não descaracteriza. Não decidiu sobre a contribuição adicional da empresa.</li><li><b>STJ, Tema 1090 (REsp 2.082.072, 09/04/2025):</b> EPI eficaz no PPP descaracteriza, em princípio; ônus do segurado; dúvida a favor do segurado; ruído excepcionado.</li><li><b>Contribuição de 6%:</b> CARF majoritariamente a favor da Receita; TRF4 (1ª Turma, out./2025) afastou o adicional com prova técnica de EPI eficaz; ADI 7773 (CNI) no STF, suspensa para conciliação (jul./2026).</li><li><b>Trabalhista:</b> a NR-15 (15.4.1, b) admite neutralização pelo EPI.</li></ul></details>'+
   '<details><summary>Onde as normas não se harmonizam ('+RS_HARM.length+' pontos)</summary>'+tbl(['Período','Desarmonia','Efeito prático'], RS_HARM.map(r=>r.map(esc)))+'</details>'+
   '<details><summary>Contexto jurídico (não é critério técnico)</summary><p class="fine">Serve para escrever o laudo de modo a responder antecipadamente ao que o juízo e as partes vão perguntar.</p><ul>'+jur.map(t=>'<li><b>'+t.trib+', '+t.num+'</b> — '+esc(t.tese)+'</li>').join('')+'</ul></details>';
}
function rsCampo(){
  S.rck=S.rck||{}; let n=0, done=0;
  const h=Object.entries(RS_CK).map(([g,items])=>'<section class="ckgrp"><h4>'+g+'</h4>'+items.map((t,i)=>{ const id=g+'|'+i; n++; if(S.rck[id]) done++; return '<label class="cb ck"><input type="checkbox" data-rck="'+esc(id)+'"'+(S.rck[id]?' checked':'')+'> <span>'+esc(t)+'</span></label>'; }).join('')+'</section>').join('');
  return '<p class="lead">Roteiro para a vistoria, pensado para uso no tablet. O resultado só vale se a medição representar a jornada do segurado.</p><p class="small"><b id="ckcount">'+done+' de '+n+'</b> itens conferidos. <button class="ghost sm" data-rckclr="1">Limpar</button></p><div class="ckwrap">'+h+'</div>'+
   '<details><summary>Jornada representativa: o que dizem as normas</summary>'+tbl(['Norma','Jornada','Medição mais curta que a jornada'],[
    ['NR-15, Anexo 1 (1978)','\"Máxima exposição diária permissível\"; dose soma os períodos \"durante a jornada de trabalho\"','Não trata de amostragem'],
    ['NHT-06 R/E (1985)','Ciclo de exposição e situações acústicas; tempos por informação da empresa confirmada em campo','Pelo menos 3 leituras por situação; dose montada pelos tempos de cada situação'],
    ['NHT-09 R/E (1986)','\"Como regra\", amostragem de toda a jornada','Número inteiro de ciclos; dúvida leva à jornada inteira; dose extrapolada por regra de três'],
    ['NHO-01 (2001)','NE é o \"nível médio representativo da exposição ocupacional diária\"','Ciclos suficientes; rotinas compostas; projetar a dose para a jornada diária efetiva']].map(r=>r.map(esc)))+'</details>';
}
function rsTimeline(){
  const x=y=>((y-1975)/(2027-1975)*100).toFixed(2)+'%', w=(a,b)=>((b-a)/(2027-1975)*100).toFixed(2)+'%';
  const bar=(cls,a,b,txt)=>'<div class="tlb '+cls+'" style="left:'+x(a)+';width:'+w(a,b)+'"><span>'+txt+'</span></div>';
  const ticks=[1980,1985,1990,1995,2000,2005,2010,2015,2020,2025];
  return '<div class="ntl" role="img" aria-label="Linha do tempo das normas de ruído">'+
   '<div class="ntl-row"><span class="ntl-lab">Limite previdenciário</span><div class="ntl-track">'+bar('lim80',1975,1997.17,'acima de 80 dB(A)')+bar('lim90',1997.17,2003.88,'acima de 90')+bar('lim85',2003.88,2027,'NEN acima de 85 dB(A)')+'</div></div>'+
   '<div class="ntl-row"><span class="ntl-lab">Limite de tolerância</span><div class="ntl-track">'+bar('nr15',1978.44,2027,'NR-15, Anexo 1 · 85 dB(A) / 8 h · q = 5')+'</div></div>'+
   '<div class="ntl-row"><span class="ntl-lab">Método · leituras</span><div class="ntl-track">'+bar('met',1985,2001,'NHT-06 · q = 5')+bar('met2',2001,2027,'NHO-01 · q = 3')+'</div></div>'+
   '<div class="ntl-row"><span class="ntl-lab">Método · dosímetro</span><div class="ntl-track">'+bar('met',1986,2001,'NHT-09 · q = 5')+bar('met2',2001,2027,'NHO-01 · NE e NEN')+'</div></div>'+
   '<div class="ntl-row ntl-axis"><span class="ntl-lab"></span><div class="ntl-track">'+ticks.map(t=>'<i style="left:'+x(t)+'">'+t+'</i>').join('')+'</div></div></div>';
}
const NORMAS_CARDS=[
 {n:'NR-15, Anexo 1', p:'Limite de tolerância', lim:true, f:[
  ['Publicação','Portaria MTb 3.214, de 08/06/1978 (DOU 06/07/1978)'],
  ['Revogação','Vigente'],
  ['Instrumento','Medidor de nível de pressão sonora, circuito A, resposta lenta'],
  ['q / limiar','5 · Quadro a partir de 85 dB(A)'],
  ['Dose','D = C1/T1 + C2/T2 + … + Cn/Tn','fx','Item 6; Ti do Quadro, com o nível imediatamente superior quando o nível não consta dele (item 4)'],
  ['Lavg (q = 5)','Lavg = 85 + 16,61 · log(D · 480 / T)','fx','A NR-15 não traz fórmula de nível; a expressão decorre do q = 5 do Quadro. T = tempo avaliado, em minutos']]},
 {n:'NHT-06 R/E', p:'Método · leituras instantâneas', f:[
  ['Publicação','Fundacentro, 1985 (série técnica experimental)'],
  ['Revogação','Cancelada e substituída pela NHO-01 (2001)'],
  ['Instrumento','Medidor de leitura instantânea, 3 leituras por situação acústica'],
  ['q / limiar','5 · 80 dB(A) (Apêndice 1: 85 dB(A))'],
  ['Dose','D = Σ Ci / Ti','fx','Média de cada situação arredondada ao inteiro; Ti do Quadro do Anexo 1 (nota do especialista); dose em décimos'],
  ['Lavg (q = 5)','Lavg = 85 + 16,61 · log(D · 480 / T)','fx','A NHT-06 conclui pela dose e não traz fórmula de nível; a expressão decorre do q = 5. T em minutos']]},
 {n:'NHT-09 R/E', p:'Método · dosímetro', f:[
  ['Publicação','Fundacentro, texto de setembro/1985, publicado em 1986 (Revista Brasileira de Saúde Ocupacional, nº 53)'],
  ['Revogação','Cancelada e substituída pela NHO-01 (2001)'],
  ['Instrumento','Dosímetro com 5 dB por dobro de dose, como a NR-15'],
  ['q / limiar','5 · 80 dB(A) (Apêndice 1)'],
  ['Dose','D = CD / 100','fx','CD = contagem do visor, em %. A dose é o critério da norma (item IV). Amostra menor que a jornada: CD da jornada = CD · Te / TM (Apêndice 2, regra de três)'],
  ['Lavg (q = 5)','"Leq" = 80 + 16,61 · log(0,16 · CD / TM)','fx','Apêndice 3, TM em horas. Dá o mesmo valor que 85 + 16,61 · log(D · 480 / T), com T em minutos; o nome "Leq" vem da definição de energia do item III.8, mas o número é o Lavg']]},
 {n:'NHO-01', p:'Método · dosímetro ou integrador', f:[
  ['Publicação','Fundacentro, 2001'],
  ['Revogação','Vigente (cancelou as NHT-06, 07 e 09)'],
  ['Instrumento','Dosímetro (preferencial) ou medidor integrador'],
  ['q / limiar','3 (critério da própria NHO) · 80 dB(A)'],
  ['Dose','D = Σ Cn / Tn, com Tn = 480 / 2^((L − 85)/3)','fx','Tabela 1 da NHO-01; dose em %'],
  ['NE e NEN','NE = 10 · log(480/TE · D/100) + 85; NEN = NE + 10 · log(TE/480)','fx','q = 3. A NHO-01 só cita o termo Lavg (Nível Médio) na terminologia'],
  ['Lavg (q = 5)','Lavg = 85 + 16,61 · log(D5 · 480 / T)','fx','Nota do especialista: para o Lavg, a dose D5 tem de ser apurada com q = 5 (dosímetro configurado em q = 5 ou Ti do Quadro). A dose da NHO-01 (q = 3) não serve para essa fórmula']]}];
function ncardHtml(c){ return '<article class="ncard'+(c.lim?' nlim':'')+'"><header><b>'+esc(c.n)+'</b><span>'+esc(c.p)+'</span></header><dl>'+c.f.map(([k,v,fx,nt])=>'<dt>'+esc(k)+'</dt><dd>'+(fx?'<code class="fx">'+esc(v)+'</code>':esc(v))+(nt?'<small>'+esc(nt)+'</small>':'')+'</dd>').join('')+'</dl></article>'; }
function rsMetodo(){
  return '<div class="keynote"><b>Você não precisa escolher entre as normas.</b> A NR-15 dá o limite; as NHT e a NHO dão o jeito de medir. A data da medição define o método, e o limite é sempre o do Anexo 1 da NR-15 (nota do especialista; as NHO não fixam limites, Portaria Fundacentro 675/2021).</div>'+
   '<h3>O que existia em cada época</h3>'+rsTimeline()+
   '<h3>As quatro normas, nos mesmos termos</h3><div class="ncards">'+NORMAS_CARDS.map(ncardHtml).join('')+'</div>'+
   '<h3>O que comparar em cada período (q = 5)</h3>'+tbl(['Período','Grandeza','Limite'],[['Até 05/03/1997','Lavg da jornada','Acima de 80 dB(A)'],['06/03/1997 a 18/11/2003','Lavg da jornada','Acima de 90 dB(A)'],['A partir de 19/11/2003','NEN = Lavg + 16,61 · log(Te/480)','Acima de 85 dB(A)']].map(r=>r.map(esc)))+
   '<details><summary>Grandezas: Lavg, Leq, NE, NEN e TWA</summary>'+tbl(['Sigla','O que é','q','Normalizado para 8 h?','Uso'],[
    ['Leq','Média por igual energia no período medido','3','Não','Não serve para q = 5'],
    ['Lavg','Nível médio do período medido, com o q escolhido','5 ou 3','Não','Até 18/11/2003, se representa a jornada'],
    ['NE','Nível médio representativo da exposição diária','O da média','Não','Base do NEN'],
    ['NEN','NE convertido para 8 h','O da média','Sim','A partir de 19/11/2003'],
    ['TWA','Dose expressa como nível de 8 h (OSHA)','Configurável','Sim','= NEN com q = 5 só com critério 85 e jornada inteira']].map(r=>r.map(esc)))+'<p class="formula">NEN (q = 5) = Lavg + 16,61 · log(Te/480) = 85 + 16,61 · log(D)<br>NEN (q = 3) = NE + 10 · log(Te/480)</p></details>'+
   '<details><summary>Armadilhas frequentes</summary><ul><li>NHT-09 (até 2001): o "Leq" do Apêndice 3 não é o Leq de energia (q = 3) da definição do item III.8. A fórmula usa 16,61, ou seja, q = 5 e limiar de 80 dB(A): o resultado é o mesmo número que hoje se chama Lavg e se compara com o limite do período.</li><li>NHT-06 (até 2001): a ordem é arredondar a média ao inteiro e só depois buscar o Ti no Quadro do Anexo 1, subindo para o nível imediatamente superior apenas quando o inteiro não consta do Quadro. Aplicar o item 4 direto sobre 88,4 dB(A) leva a 89 dB(A) (4 h 30 min); o correto é 88 dB(A) (5 h). Já 97 dB(A), ausente do Quadro, usa o Ti de 98 dB(A) (1 h 15 min).</li><li>A tabela de Ti do corpo da NHT-06 difere levemente do Quadro (88 dB(A): 5 h 15 min × 5 h). O limite é o do Quadro; a NHT dá o método (nota do especialista).</li><li>Leq (q = 3) da empresa não se compara com o critério q = 5: peça o Lavg ou a dose.</li><li>TWA de medição curta conta o tempo não medido como silêncio: projete a dose para Te.</li><li>Dosímetro no padrão OSHA (critério 90 dB(A)) dá dose e TWA em outra base.</li><li>Jornada acima de 480 min aumenta o NEN; abaixo, reduz.</li><li>Horas extras: nenhuma norma técnica trata delas; pela lógica de dose, a hora extra habitual entra em Te (ponto em aberto).</li></ul></details>';
}
function uRefresh(){ const box=$('#ures'); if(!box) return; const r=uCalc(); box.innerHTML=uRes(); uSync(r); const rs=$('#res-s'); if(rs) rs.innerHTML=resTable(simRow()); const fl=$('#rs-d-lavg'); if(fl&&r&&!r.err&&r.lavg!==null) fl.value=String(r1(r.lavg)).replace('.',','); const ft=$('#rs-d-te'); if(ft&&r&&!r.err&&r.te) ft.value=r.te; }
/* ---------- SIMULADOR ÚNICO ---------- */
const U_DEF={per:'todos', quando:'desde2001', tipo:'leituras', te:'480', dose:'', tm:'', lavg:''};
function uState(){ if(!S.u) S.u=JSON.parse(JSON.stringify(U_DEF)); if(!S.u.per) S.u.per='todos'; return S.u; }
const U_PER=[['p1','Até 05/03/1997','Lavg','80'],['p2','06/03/1997 a 18/11/2003','Lavg','90'],['p3','A partir de 19/11/2003','NEN','85']];
function uExtemp(u){ if(u.per==='todos') return ''; const depois=u.quando==='desde2001'; if(u.per==='p1'&&depois) return 'posterior'; if(u.per==='p3'&&!depois) return 'anterior'; return ''; }
function uMetodo(u){ const ant=u.quando==='ate2001';
  if(u.tipo==='leituras') return ant?['nht06q','NHT-06 R/E (1985) para obter o nível: média ao inteiro; depois o Quadro do Anexo 1 da NR-15 para o Ti, com o nível imediatamente superior quando o nível não consta do Quadro; dose em décimos']:['nr15','NR-15, Anexo 1: média a 0,1 dB, Ti do Quadro com o nível imediatamente superior (item 4), limiar de 80 dB(A)'];
  if(u.tipo==='dose') return ant?['nht09','NHT-09 R/E (1986): o critério é a dose; o nível vem do Apêndice 3, "Leq" = 80 + 16,61 · log(0,16 · CD / TM), que com q = 5 equivale ao Lavg; limiar 80 dB(A)']:['dose5','NR-15 com q = 5 (nota do especialista): Lavg = 85 + 16,61 · log(D · 480 / Tm), limiar 80 dB(A)'];
  return ['lavg','Lavg (q = 5) informado no laudo ou no PPP']; }
function uCalc(){
  const u=uState(), te=num(u.te); if(te===null||te<=0) return {err:'Informe a jornada Te em minutos.'};
  const [met]=uMetodo(u);
  if(u.tipo==='leituras'){ const c=JSON.parse(JSON.stringify(liState())); c.met=met; c.te=String(te); const r=liCalc(c); if(r.err) return r; return {lavg:r.lavg, ne:r.ne, nen:r.nen, dose:r.D, doseTxt:r.semDose?'não calculada':(r.nht?brn0(r.Dshow)+' ('+brn0(Math.round(r.Dshow*100))+'%)':brn0(Math.round(r.D*1000)/10)+'%'), te:r.base, tm:r.T, over:r.over, li:r}; }
  if(u.tipo==='dose'){ const D=num(u.dose), tm=num(u.tm)||te; if(D===null||D<=0) return {err:'Informe a dose (%) e o tempo de medição.'};
    const lavg=85+16.61*log10(D/100*480/tm); const ne=lavg; const nen=ne+16.61*log10(te/480); const Dj=D/100*te/tm;
    return {lavg, ne, nen, dose:Dj, doseTxt:brn0(Math.round(Dj*1000)/10)+'%'+(tm!==te?' (projetada para a jornada, amostra representativa)':''), te, tm}; }
  const L=num(u.lavg); if(L===null) return {err:'Informe o Lavg (q = 5).'};
  return {lavg:L, ne:L, nen:L+16.61*log10(te/480), dose:Math.pow(2,(L-85)/5)*te/480, doseTxt:brn0(Math.round(Math.pow(2,(L-85)/5)*te/480*1000)/10)+'%', te, tm:te};
}
function uSync(r){ if(!r||r.err||r.lavg===null) return; const row=simRow(); row.d=row.d||{}; row.d.mr='lavg'; row.d.lavg=String(r1(r.lavg)); row.d.te=String(r.te); }
function uRes(){
  const u=uState(), r=uCalc(); if(r.err) return '<p class="note">'+esc(r.err)+'</p>';
  if(r.lavg===null) return (r.over?'<div class="verdict v-c"><b>Nível acima de 115 dB(A)</b><p>Pela NHT-06 a dose não é calculada: registrar \"Situação de Emergência\" (NR-15, Anexo 1, itens 5 e 7).</p></div>':'<p class="note">Sem dose: leituras abaixo do limiar.</p>');
  const kv=(k,v,sm)=>'<div><span>'+k+'</span><b>'+v+'</b>'+(sm?'<small>'+sm+'</small>':'')+'</div>';
  const ver=(v,lim)=>r1(v)>lim?'<span class="pill pe">Especial</span>':'<span class="pill pn">Não especial</span>';
  let h=(r.over?'<div class="verdict v-c"><b>Nível acima de 115 dB(A)</b><p>NR-15, Anexo 1, itens 5 e 7: exposição não permitida sem proteção adequada.</p></div>':'')+
   '<div class="kv">'+kv('Lavg do período medido',f1(r.lavg)+' dB(A)',r.tm+' min')+kv('NE da jornada',f1(r.ne)+' dB(A)',r.te+' min')+kv('NEN (8 h, q = 5)',f1(r.nen)+' dB(A)')+kv('Dose da jornada',r.doseTxt)+'</div>'+
   '<h4 class="sub">'+(u.per==='todos'?'Se este resultado representar a exposição em…':'Período analisado e limite da época')+'</h4>'+
   '<div class="scrollx"><table class="pt uper"><thead><tr><th>Período</th><th>Compara</th><th>Resultado</th></tr></thead><tbody>'+
   U_PER.map(([k,t,g,lim])=>{ const v=g==='NEN'?r.nen:r.ne; return '<tr class="'+(u.per==='todos'?'':k===u.per?'sel':'dim')+'"><td class="mono">'+t+'</td><td>'+g+' '+f1(v)+' × '+lim+' dB(A)</td><td>'+ver(v,+lim)+'</td></tr>'; }).join('')+'</tbody></table></div>'+uExtNote(u)+
   '<p class="fine">Nota do especialista (q = 5). O quadro \"Enquadrar um período\", abaixo, já recebeu este Lavg e esta jornada: informe as datas e o EPI.</p>';
  if(r.li) h+='<details><summary>Ver o cálculo por situação acústica</summary>'+liResFrom(r.li)+'</details>';
  return h;
}
function liResFrom(r){ return '<div class="scrollx"><table class="pt"><thead><tr><th>Situação</th><th>Média</th><th>Ci</th><th>Ti</th><th>Ci/Ti</th></tr></thead><tbody>'+r.sit.map(x=>'<tr><td>'+esc(x.n)+'</td><td>'+(r.nht?String(x.m):f1(x.m))+'</td><td>'+x.t+' min</td><td>'+(isFinite(x.ti)?Math.round(x.ti)+' min':'não soma')+'</td><td>'+(isFinite(x.ti)?brn0(Math.round(x.fr*1000)/1000):'0')+'</td></tr>').join('')+'</tbody></table></div>'; }
function uExtNote(u){ const x=uExtemp(u);
  const base='<b>Laudo extemporâneo.</b> O limite é o do período analisado; a medição segue as normas vigentes na data da avaliação ambiental (IN 128/2022, art. 289). O INSS aceita LTCAT emitido antes ou depois do período desde que a empresa declare que não houve alteração no ambiente ou na organização do trabalho: leiaute, máquinas e equipamentos, proteção coletiva, níveis de ação (art. 279).';
  if(x==='posterior') return '<div class="note ext">'+base+' Nota do especialista: para comparar com o limite de 80 dB(A), o resultado precisa estar em q = 5 (Lavg); se o laudo trouxer só o NEN da NHO-01 (q = 3), peça a dose em q = 5 ou o histograma.</div>';
  if(x==='anterior') return '<div class="note ext">'+base+' Medição anterior a 2001 usada para período a partir de 19/11/2003: o INSS exige o NEN da NHO-01 para avaliações a partir de 01/01/2004 (art. 289, parágrafo único), e o laudo antigo tende a ser questionado.</div>';
  return ''; }
function uHtml(){
  const u=uState(), [,metTxt]=uMetodo(u);
  const seg=(k,opts)=>'<div class="seg" role="group">'+opts.map(([v,t])=>'<button type="button" data-useg="'+k+'" data-v="'+v+'" class="'+(u[k]===v?'on':'')+'" aria-pressed="'+(u[k]===v)+'">'+t+'</button>').join('')+'</div>';
  const inp=(k,lab,ph)=>'<label class="f"><span>'+lab+'</span><input type="text" inputmode="decimal" id="u-'+k+'" data-uf="'+k+'" value="'+esc(u[k]||'')+'"'+(ph?' placeholder="'+ph+'"':'')+'></label>';
  let fields='';
  if(u.tipo==='leituras'){ const c=liState(); const li=(k,lab,val,ph,dec)=>'<label class="f"><span>'+lab+'</span><input type="text" '+(dec?'inputmode="decimal" ':'')+'id="li-'+k.replace(/\./g,'-')+'" data-li="'+k+'" value="'+esc(val||'')+'"'+(ph?' placeholder="'+ph+'"':'')+'></label>';
    fields='<div class="lirows">'+c.s.map((x,i)=>'<div class="fields">'+li('s.'+i+'.n','Situação '+(i+1),x.n,'Ex.: operação da prensa')+li('s.'+i+'.l','Leituras dB(A)',x.l,'88; 89; 88,5')+li('s.'+i+'.t','Tempo na jornada (min)',x.t,'',1)+'</div>').join('')+'</div>'; }
  else if(u.tipo==='dose') fields='<div class="fields">'+inp('dose','Dose do dosímetro (%) · q = 5')+inp('tm','Tempo de medição (min)','= Te se vazio')+'</div>';
  else fields='<div class="fields">'+inp('lavg','Lavg dB(A) · q = 5')+'</div>';
  return '<section class="simbox" id="ubox"><div class="fhead"><h3>1. Calcular a exposição</h3><button class="ghost sm" data-ursr="1">Restaurar exemplo</button></div>'+
   '<div class="qgrid"><div class="q"><span class="ql">Período a ser analisado <small>define o limite</small></span>'+seg('per',[['todos','Todos'],['p1','Até 05/03/1997'],['p2','06/03/1997 a 18/11/2003'],['p3','Desde 19/11/2003']])+'</div><div class="q"><span class="ql">Quando foi feita a medição? <small>define o método (IN 128, art. 289)</small></span>'+seg('quando',[['ate2001','Antes da NHO-01 (até 2001)'],['desde2001','Com a NHO-01 (2001 em diante)']])+'</div><div class="q"><span class="ql">O que você tem em mãos?</span>'+seg('tipo',[['leituras','Leituras instantâneas'],['dose','Dose do dosímetro'],['lavg','Lavg calculado']])+'</div>'+inp('te','Jornada Te (min)')+'</div>'+
   '<p class="mnote"><b>Método aplicado:</b> '+esc(metTxt)+'</p>'+fields+'<div class="res" id="ures">'+uRes()+'</div></section>';
}
function rsSimular(a){
  const r=uCalc(); uSync(r);
  return '<p class="lead">Informe o período analisado e quando foi feita a medição: o período define o limite e a data da medição define o método, o que cobre também o laudo extemporâneo. A ferramenta mostra Lavg, NE e NEN. Depois, enquadre o período com datas e EPI.</p>'+uHtml()+
   simHtml(a).replace('<h3>Simular enquadramento</h3>','<h3>2. Enquadrar um período</h3>')+
   '<details class="cmpdet"><summary>Comparar com outros critérios (q = 3, NHT-06 × NR-15, fórmula)</summary>'+cmpHtml()+'</details>';
}
function rsDocumentar(){
  return '<p class="lead">PPP em papel para períodos até 31/12/2022; exclusivamente eletrônico (eSocial, S-2240) a partir de 01/01/2023 (Portaria MTP 313/2021, red. Portaria MTP 1.010/2021; Portaria MTP 334/2022).</p><h3>PPP em papel, seção 15</h3>'+
   tbl(['Período','15.3 Fator de risco','15.4 Intensidade (até 15 caracteres)','15.5 Técnica (até 40 caracteres)'],[
    ['Até 05/03/1997','Ruído contínuo ou intermitente','Lavg em dB(A)','NR-15 Anexo 1 - Lavg q=5'],
    ['06/03/1997 a 18/11/2003','Ruído contínuo ou intermitente','Lavg em dB(A)','NR-15 Anexo 1 - Lavg q=5'],
    ['A partir de 19/11/2003','Ruído contínuo ou intermitente','NEN 87,3 dB(A)','NHO-01 Fundacentro - NEN']].map(r=>r.map(esc)))+
   '<ul><li><b>13.7 Ocorrência GFIP/eSocial:</b> 04 quando houver enquadramento (25 anos).</li><li><b>15.7 EPI eficaz:</b> informar a partir de 03/12/1998, com o CA (15.8); para ruído não afasta o enquadramento.</li><li>Nunca escrever só \"dosímetro\", \"dosimetria\" ou \"decibelímetro\" no 15.5.</li><li>Qualquer mudança nos campos 15.2 a 15.8 abre nova linha de período.</li></ul>'+
   '<p class="note"><b>Em aberto:</b> o INSS exige o NEN da NHO-01 (q = 3) a partir de 2004; a nota do especialista usa q = 5. Opções: NHO-01 no PPP e q = 5 no laudo; NEN q = 5 no PPP; ou os dois valores, identificados.</p>'+
   '<h3>O laudo deve trazer</h3><ul>'+['Norma e versão seguidas, com fator q, critério e limiar do dosímetro','Tempo de medição, jornada (Te) e por que a amostra representa a jornada','Resultado na grandeza do período (Lavg até 18/11/2003; NEN depois), a 0,1 dB','Calibração antes e depois, com o desvio','Maior nível observado e sua frequência','EPI informado e a observação de que não altera a conclusão para ruído','Períodos por similaridade, com o critério de semelhança'].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
}
function rsHtml(a){
  const cur=rsStep(), i=RS_STEPS.findIndex(s=>s[0]===cur);
  const body = cur==='criterio'?rsCriterio(a): cur==='campo'?rsCampo(): cur==='metodo'?rsMetodo(): cur==='simular'?rsSimular(a): rsDocumentar();
  return '<article class="ficha rs"><header><div class="fhead"><p class="eyebrow">Físicos · em 5 passos</p><span class="btns">'+favBtn('ag:ruido','Ruído — ficha do agente')+linkBtn('ag:ruido')+'<button class="printbtn" data-print="ficha">Imprimir passo</button></span></div><h2>Ruído contínuo ou intermitente</h2><div class="codes"><span>53.831: 1.1.6</span><span>83.080: 1.1.5</span><span>Anexo IV: 2.0.1</span><span>25 anos</span></div></header>'+
   rsNav(cur)+'<section class="rsbody"><p class="eyebrow">Passo '+(i+1)+' de 5</p><h3 class="rsq">'+RS_STEPS[i][2]+'</h3>'+body+'</section>'+rsPager(cur)+'</article>';
}

function libRows(tab, codes){ return (LIB[tab]||[]).filter(r=>codes.includes(r[0])); }
function renderAgentes(){
  const a=agById(S.ag);
  const aq=normTxt(S.agq||''); const vis=x=>!aq||normTxt(x.nome+' '+(x.kw||[]).join(' ')+' '+x.c53.join(' ')+' '+(x.cIV||'')).includes(aq);
  let list='<nav class="aglist" aria-label="Agentes"><label class="f" for="agq"><span>Filtrar agentes</span><input id="agq" type="search" data-st="agq" value="'+esc(S.agq||'')+'" placeholder="Ex.: solda, amianto, 1.0.19"></label><label class="f agsel" for="agsel"><span>Agente</span><select id="agsel" data-agsel="1">'+GRUPOS.map(g=>'<optgroup label="'+g+'">'+AGENTS.filter(x=>x.grupo===g&&vis(x)).map(x=>'<option value="'+x.id+'"'+(x.id===a.id?' selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</optgroup>').join('')+'</select></label>'+GRUPOS.map(g=>{ const xs=AGENTS.filter(x=>x.grupo===g&&vis(x)); return xs.length?'<div class="agg"><p>'+g+'</p>'+xs.map(x=>'<button data-ag="'+x.id+'" class="'+(x.id===a.id?'on':'')+'" aria-pressed="'+(x.id===a.id)+'"><span>'+esc(x.nome)+'</span><small>'+esc(x.cIV?x.cIV.split(' / ')[0]:(x.c53[0]||''))+'</small></button>').join('')+'</div>':''; }).join('')+(AGENTS.some(vis)?'':'<p class="agempty">Nenhum agente encontrado.</p>')+'</nav>';
  if(a.id==='ruido') return '<div class="agwrap">'+list+comVerTambem(rsHtml(a),'ag:ruido')+'</div>';
  const codes=[...(a.c53.length?['53.831: '+a.c53.join(', ')]:[]),...(a.c83.length?['83.080: '+a.c83.join(', ')]:[]),(a.cIV?'Anexo IV: '+a.cIV:'Fora do Anexo IV'),'NR-15: '+a.nr15];
  let f='<article class="ficha"><header><div class="fhead"><p class="eyebrow">'+a.grupo+'</p><span class="btns">'+favBtn('ag:'+a.id,a.nome+' — ficha do agente')+linkBtn('ag:'+a.id)+'<button class="printbtn" data-print="ficha">Imprimir ficha</button></span></div><h2>'+esc(a.nome)+'</h2><div class="codes">'+codes.map(c=>'<span>'+esc(c)+'</span>').join('')+'<span>'+a.tempo+' anos</span></div></header>';
  f+='<div class="mxrow">'+['até 05/03/1997','06/03/1997–18/11/2003','19/11/2003–13/11/2019','após 13/11/2019'].map((p,k)=>'<div><span>'+p+'</span><b class="mxc mx-'+MX[a.mx[k]][1]+'">'+(a.mx[k]==='X'&&MXX[a.id]?esc(MXX[a.id].rot):MX[a.mx[k]][0])+'</b></div>').join('')+'</div>'+(a.mx.includes('X')&&MXX[a.id]?'<p class="mxnote"><b>Por que "'+esc(MXX[a.id].rot)+'"?</b> '+esc(MXX[a.id].nota)+'</p>':'');
  f+='<h3>Enquadramento por período</h3><div class="scrollx"><table class="pt"><thead><tr><th>Período</th><th>Norma</th><th>Critério</th></tr></thead><tbody>'+a.periodos.map(p=>'<tr><td class="mono">'+esc(p[0])+'</td><td>'+esc(p[1])+'</td><td>'+esc(p[2])+'</td></tr>').join('')+'</tbody></table></div>';
  f+=simHtml(a);
  if(a.id==='ruido') f+=liHtml()+cmpHtml();
  const jur=(a.juris||[]).map(j=>TESES[j.slice(2)]).filter(Boolean);
  f+='<h3>Três leituras</h3><div class="tri"><section class="col perito"><h4>Nota do especialista</h4><ul>'+a.perito.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section><section class="col inss"><h4>INSS · IN 128/2022</h4><ul>'+a.inss.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section><section class="col juris"><h4>Jurisprudência</h4>'+(jur.length?'<ul>'+jur.map(t=>'<li><b>'+t.trib+', '+t.num+'</b> — '+esc(t.tese)+'</li>').join('')+'</ul>':'<p class="muted">Sem tese específica cadastrada.</p>')+'</section></div>';
  /* textos legais */
  let leg='';
  const blk=(tit,rows,cols)=>rows.length?'<details open><summary>'+tit+'</summary>'+rows.map(r=>'<div class="lt"><span class="cd">'+esc(r[0])+'</span><div>'+cols.map(k=>r[k]?'<p>'+esc(r[k])+'</p>':'').join('')+'</div></div>').join('')+'</details>':'';
  if(a.id==='categoria'){ leg+=blk('Decreto 53.831/64 — atividades profissionais (2.x)',LIB.d53831_at,[1,2,4]); leg+=blk('Decreto 83.080/79 — Anexo II',LIB.d83080_II,[1,2]); }
  else { leg+=blk('Decreto 53.831/64',libRows('d53831_ag',a.c53),[1,2,3,4,5]); leg+=blk('Decreto 83.080/79 — Anexo I',libRows('d83080_I',a.c83),[1,2,3]);
    const civ=a.cIV?a.cIV.split(' / '):[]; leg+=blk('Decreto 2.172/97 — Anexo IV',libRows('d2172_IV',civ),[1,2]); leg+=blk('Decreto 3.048/99 — Anexo IV',libRows('d3048_IV',civ),[1,2]); }
  const can=(LIB.ag_cancer||[]).filter(r=>a.cIV&&r[1]===a.cIV); if(can.length) leg+='<details><summary>LINACH Grupo 1 relacionados (com CAS)</summary><div class="scrollx"><table class="pt"><thead><tr><th>LINACH</th><th>CAS</th></tr></thead><tbody>'+can.map(r=>'<tr><td>'+esc(r[2])+'</td><td class="mono pre">'+esc(r[3])+'</td></tr>').join('')+'</tbody></table></div></details>';
  const ex=(a.sheet&&LIB.extras[a.sheet])||[]; const exb=ex.filter(b=>/MANUAL|CONSIDERA/.test(b.h));
  if(exb.length) leg+='<details><summary>Manual de Aposentadoria Especial (INSS, 2018) — trechos</summary><p class="fine">Atenção: o Manual foi redigido sob a IN 77/2015, revogada pela IN 128/2022. Os artigos citados nos trechos são da IN 77; confira a correspondência na IN 128.</p>'+exb.map(b=>'<div class="lt"><div><p class="eyebrow">'+esc(b.h)+'</p><p>'+esc(b.t)+'</p></div></div>').join('')+'</details>';
  if(a.comp) f+='<h3>Decreto × IN × Manual do INSS</h3><div class="scrollx"><table class="pt cmp"><thead><tr>'+a.comp.cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+a.comp.rows.map(r=>'<tr>'+r.map((c,k)=>'<td'+(k===0?' class="mono"':'')+'>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  if(a.id==='vibracao') f+='<h3>Referências ISO para 06/03/1997 a 12/08/2014</h3><div class="isogrid">'+ISO_VIB.map(x=>'<div class="iso"><b>'+esc(x.rot)+'</b>'+(x.v!==null?'<span class="isov">'+String(x.v).replace('.',',')+' '+x.un+(x.vdv?' · VDV '+String(x.vdv).replace('.',',')+' m/s¹·⁷⁵':'')+'</span>':'<span class="isov">sem LT</span>')+'<p>'+esc(x.nota)+'</p></div>').join('')+'</div><p class="fine">A IN 128/2022 não diz qual edição ou qual valor da ISO usar. Na simulação de enquadramento, escolha a referência no campo "Referência ISO"; o padrão é o limite superior da zona de cautela da ISO 2631-1:1997.</p>';
  if(a.art&&a.art.length) f+='<details class="lit"><summary>Texto literal da IN PRES/INSS 128/2022 — art. '+a.art.join(', ')+'</summary>'+a.art.map(n=>(IN128[n]||[]).map((p,k)=>'<p'+(k===0?' class="art0"':'')+'>'+esc(p)+'</p>').join('')).join('<hr>')+(a.art.includes('293')?'<p class="fine">Redação dada pela IN PRES/INSS 141/2022.</p>':'')+'<p class="fine">Abrir no texto navegável: '+a.art.map(n=>'<a href="#biblioteca/textos/in128/'+n+'">art. '+n+'</a>').join(', ')+'</p></details>';
  f+='<h3>Texto das normas</h3>'+(leg||'<p class="muted">Sem texto cadastrado.</p>')+'<p class="fine">Textos transcritos das normas e do Manual do INSS. Confira sempre a redação oficial no Planalto.</p></article>';
  return '<div class="agwrap">'+list+comVerTambem(f,'ag:'+a.id)+'</div>';
}

/* ---------- INSALUBRIDADE ---------- */
const GRAU = {máximo:40, médio:20, mínimo:10};
function insv(k,def){ const v=S.ins[k]; return v===undefined?def:v; }
function iin(k,lab,def,attrs='step="any"'){ return '<label class="f" for="i-'+k+'"><span>'+lab+'</span><input id="i-'+k+'" type="text" inputmode="decimal" data-ins="'+k+'" value="'+esc(insv(k,def))+'" '+attrs+'></label>'; }
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
        const te=num(insv('te1',480)); let D=null, lavg=null, extra=''; if(te===null||te<=0) return modoSel+iin('te1','Jornada Te (min)',480,'step="1"')+resultado(null,'médio','Jornada Te inválida: informe a jornada em minutos (maior que zero).');
        if(m1==='dose'){ const dm=num(insv('dm','')), tm=num(insv('tm1',480)); if(dm!==null&&tm){ D=dm/100*te/tm; lavg=85+16.61*log10(dm/100*480/tm); extra='Dose projetada para a jornada = dose medida × Te/Tm.'; } }
        else { const L=num(insv('lv','')); if(L!==null){ lavg=L; D=(te/480)*Math.pow(2,(L-85)/5); extra='Dose = (Te/480) × 2^((Lavg − 85)/5).'; } }
        const nen = D!==null&&D>0 ? 85+16.61*log10(D) : null;
        const body=modoSel+(m1==='dose'?iin('dm','Dose medida (%)','','step="0.1"')+iin('tm1','Tempo de medição Tm (min)',480,'step="1"'):iin('lv','Lavg dB(A) · q = 5','','step="0.1"'))+iin('te1','Jornada Te (min)',480,'step="1"');
        return body+'<div class="kv"><div><span>Dose na jornada</span><b>'+(D===null?'—':(D*100).toFixed(1).replace('.',',')+'%')+'</b></div><div><span>Lavg</span><b>'+(lavg===null?'—':f1(lavg))+' dB(A)</b></div><div><span>NEN 8 h (q = 5)</span><b>'+(nen===null?'—':f1(nen))+' dB(A)</b></div></div>'+resultado(D===null?null:r1(D*100)>100,'médio','Dose acima de 100% caracteriza (item 6 do Anexo 1). Dose arredondada a 0,1% antes da comparação. '+extra);
      }
      const rows=insv('nps',[[88,240],[92,120],[80,120]]), modo=insv('rmode','tab');
      let D=0, Te=0, max=0; const lin=rows.map((r,k)=>{ const L=num(r[0]), t=num(r[1]); if(L===null||t===null) return '<tr><td colspan="4">—</td></tr>'; Te+=t; max=Math.max(max,L); const T= L<85?Infinity:(modo==='tab'?tmaxQuadro(L):480/Math.pow(2,(L-85)/5)); const c=t/T; D+=c; return '<tr><td><input type="text" inputmode="decimal" step="0.1" aria-label="NPS da linha '+(k+1)+'" data-nps="'+k+'" data-c="0" value="'+r[0]+'"></td><td><input type="text" inputmode="decimal" step="1" aria-label="Tempo da linha '+(k+1)+'" data-nps="'+k+'" data-c="1" value="'+r[1]+'"></td><td class="mono">'+(T===Infinity?'—':Math.round(T))+'</td><td class="mono">'+(c*100).toFixed(1).replace('.',',')+'%</td></tr>'; }).join('');
      const lavg = D>0&&Te>0 ? 85+16.61*log10(D*480/Te) : null, nn = D>0 ? 85+16.61*log10(D) : null;
      return modoSel+isel('rmode','Tempo máximo permissível','tab',[['tab','Quadro do Anexo 1 (item 4)'],['form','Fórmula q = 5 (dosímetro)']])+'<p class="fine">'+(insv('rmode','tab')==='tab'?'Item 4: para nível intermediário, vale o tempo do nível imediatamente mais elevado do Quadro.':'Tempo máximo = 480 / 2^((NPS − 85)/5) min, como integra o dosímetro.')+'</p>'+
        '<div class="scrollx"><table class="pt calc"><thead><tr><th>NPS dB(A)</th><th>Tempo (min)</th><th>Tempo máximo (min)</th><th>Dose parcial</th></tr></thead><tbody>'+lin+'</tbody></table></div><div class="btns"><button class="ghost sm" data-nps-add="1">Adicionar nível</button><button class="ghost sm" data-nps-del="1">Remover último</button></div>'+
        '<div class="kv"><div><span>Dose</span><b>'+(D*100).toFixed(1).replace('.',',')+'%</b></div><div><span>Lavg ('+Te+' min)</span><b>'+(lavg===null?'—':f1(lavg))+' dB(A)</b></div><div><span>NEN 8 h (q = 5)</span><b>'+(nn===null?'—':f1(nn))+' dB(A)</b></div></div>'+
        resultado(r1(D*100)>100||max>115,'médio',(max>115?'Item 5 do Anexo 1: não é permitida exposição acima de 115 dB(A) sem proteção adequada; há nível acima de 115 dB(A), o que caracteriza independentemente da dose e configura risco grave e iminente (item 7). ':'')+'Item 6 do Anexo 1: soma C/T acima da unidade. Níveis abaixo de 85 dB(A) não somam dose.'+(insv('rmode','tab')==='tab'?' Com o Quadro, o Lavg é estimado a partir da dose tabelada e pode diferir do Lavg integrado pelo dosímetro.':' A fórmula reproduz a integração do dosímetro; o Anexo 1 manda usar o Quadro (item 4), que pode dar dose maior para níveis intermediários.'))+
        '<details><summary>Quadro do Anexo 1</summary><div class="q1grid">'+A1_QUADRO.map(([l,t])=>'<span><b>'+l+'</b> '+(t>=60?Math.floor(t/60)+' h'+(t%60?' '+t%60+' min':''):t+' min')+'</span>').join('')+'</div></details>';
    }
    case 'impacto': { const p=n('pico'), t=insv('pt','lin'), lt=t==='lin'?130:120, rg=t==='lin'?140:130;
      return iin('pico','Nível de pico',132)+isel('pt','Medição','lin',[['lin','dB linear (pico), resposta para impacto'],['c','dB(C), resposta rápida (FAST)']])+resultado(p===null?null:p>lt,'médio','LT '+lt+(t==='lin'?' dB linear':' dB(C)')+' (itens 2 e 3).'+(p!==null&&p>rg?' Acima de '+rg+': risco grave e iminente (item 4).':'')); }
    case 'calor': { const t0=n('ib'), av=n('av')||0, t=t0===null?null:r1(t0+av), m=n('m'), amb=insv('amb','fonte'), q=lookupM(m);
      const opts=[['','Escolher no Quadro 2…']]; Q2_2019.forEach(([g,it])=>it.forEach(([a,w])=>opts.push([String(w)+'|'+g+' — '+a, g+' — '+a+' ('+w+' W)'])));
      const body=iin('ib','IBUTG médio (°C)',29.5)+iin('av','Ajuste de vestimenta (°C, NHO-06) · opcional','')+isel('q2sel','Atividade (Quadro 2 do Anexo 3)','',opts)+iin('m','Taxa metabólica M (W)',300,'step="1"')+isel('amb','Ambiente','fonte',[['fonte','Com fonte artificial de calor'],['fechado','Ambiente fechado'],['ceu','Céu aberto sem fonte artificial']]);
      if(amb==='ceu') return body+resultado(false,'médio','O Anexo 3 não se aplica a atividades a céu aberto sem fonte artificial (item 1.1.1). Até 10/12/2019 valia a OJ 173, II, do TST.');
      if(t===null||m===null) return body+resultado(null,'médio','Informe IBUTG e M.');
      if(!q) return body+resultado(null,'médio','M fora do Quadro 1 do Anexo 3: a tabela vai de 100 a 606 W. Verifique a taxa metabólica.');
      return body+'<div class="kv"><div><span>Linha do Quadro 1</span><b>'+q.m+' W</b></div><div><span>Limite de exposição</span><b>'+f1(q.lt)+' °C</b></div></div>'+resultado(t>q.lt,'médio','IBUTG '+f1(t)+(av?' (medido '+f1(t0)+' + vestimenta '+f1(av)+')':'')+(t>q.lt?' > ':' ≤ ')+f1(q.lt)+' °C (item 2.3; valor arredondado a 0,1 °C). O anexo não fixa regra para M fora da tabela; a ferramenta usa a linha imediatamente superior, que é a mais conservadora. Com várias atividades, use a M média ponderada dos 60 min mais críticos (item 2.4).'); }
    case 'vibracao': { const tp=insv('vt','vci'), ar=n('ar'), vd=n('vd');
      const body=isel('vt','Tipo','vci',[['vci','Corpo inteiro (VCI)'],['vmb','Mãos e braços (VMB)']])+iin('ar','aren (m/s²)',1.2)+(tp==='vci'?iin('vd','VDVR (m/s¹·⁷⁵)',''):'');
      const ok= tp==='vci' ? ((ar!==null&&ar>1.1)||(vd!==null&&vd>21)) : (ar!==null&&ar>5);
      return body+resultado(ar===null&&vd===null?null:ok,'médio',tp==='vci'?'LT: aren 1,1 m/s² ou VDVR 21,0 m/s¹·⁷⁵ (item 2.2). O empregador deve comprovar a avaliação dos dois parâmetros (item 2.2.1).':'LT: aren 5 m/s² (item 2.1).'); }
    case 'quim11': return quim11();
    case 'poeira': { const tp=insv('pt2','resp'), c=n('pc'), qz=n('qz');
      let lt=null, un='mg/m³';
      if(tp==='resp'&&qz!==null) lt=8/(qz+2); if(tp==='total'&&qz!==null) lt=24/(qz+3); if(tp==='mppdc'&&qz!==null){lt=8.5/(qz+10);un='mppdc';} if(tp==='asb'){lt=2.0;un='f/cm³';} if(tp==='mn') lt=5; if(tp==='mnf') lt=1;
      const body=isel('pt2','Agente','resp',[['resp','Sílica livre — poeira respirável'],['total','Sílica livre — poeira total'],['mppdc','Sílica livre — contagem (impinger, mppdc)'],['asb','Asbesto (fibras respiráveis de crisotila)'],['mn','Manganês — poeiras (extração, tratamento, moagem, transporte)'],['mnf','Manganês — fumos (metalurgia, eletrodos de solda, pilhas)']])+((tp==='resp'||tp==='total'||tp==='mppdc')?iin('qz','% de quartzo',10):'')+iin('pc','Concentração ('+un+')','');
      return body+(lt!==null?'<div class="kv"><div><span>Limite de tolerância</span><b>'+(tp==='asb'?'2,0':brn(+lt.toFixed(3)))+' '+un+'</b></div></div>':'')+resultado(c===null||lt===null?null:c>lt,'máximo',(tp==='resp'?'LT = 8 / (%quartzo + 2) mg/m³. LT válidos para jornadas de até 48 h semanais; acima disso devem ser deduzidos (item 6.1).':tp==='total'?'LT = 24 / (%quartzo + 3) mg/m³. LT válidos para jornadas de até 48 h semanais; acima disso devem ser deduzidos (item 6.1).':tp==='mppdc'?'LT = 8,5 / (%quartzo + 10) mppdc. LT válidos para jornadas de até 48 h semanais; acima disso devem ser deduzidos (item 6.1).':tp==='asb'?'LT 2,0 f/cm³ (item 12). Extração e uso do amianto proibidos pelo STF (ADI 3.937, 2017).':'Manganês: até 5 mg/m³ (poeiras) ou 1 mg/m³ (fumos), jornada de até 8 h.')); }
  }
  return '';
}
function normTxt(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function a11Match(s,q){ if(!q) return true; const nq=normTxt(q); return [s.n,...(s.vide||[]),...(s.al||[])].some(x=>normTxt(x).includes(nq)); }
function quim11(){
  const n=v=>num(insv(v,'')); const q=insv('q11',''); const sel=insv('sub',null); const s= sel===null?null:A11[+sel];
  const un=insv('un', s&&s.ppm===null?'mg':'ppm');
  let lt = s ? (un==='ppm'?s.ppm:s.mg) : n('lt'); const teto = s ? s.teto : insv('teto',false); const g = s ? (s.g||'médio') : insv('gq','médio');
  const md=n('md'), mx=n('mx'), hs=n('hs');
  const list=A11.map((x,k)=>[x,k]).filter(([x])=>a11Match(x,q));
  let h='<label class="f grow" for="i-q11"><span>Pesquisar no Quadro 1 (nome, sinônimo ou fórmula)</span><input id="i-q11" type="search" data-ins="q11" value="'+esc(q)+'" placeholder="Ex.: tolueno, toluol, MEK, H2S, formol"></label>';
  h+='<div class="scrollx a11wrap"><table class="pt a11"><thead><tr><th>Agente químico</th><th>Outros nomes</th><th>ppm</th><th>mg/m³</th><th>Teto</th><th>Pele</th><th>Grau</th><th></th></tr></thead><tbody>'+
   list.map(([x,k])=>'<tr class="'+(String(sel)===String(k)?'on':'')+'"><td><b>'+hl(x.n,q)+'</b>'+(x.obs?'<small>'+esc(x.obs)+'</small>':'')+'</td><td class="small">'+[...(x.vide||[]),...(x.al||[])].map(a=>hl(a,q)).join('; ')+'</td><td class="mono">'+(x.ppm===null?'—':brn(x.ppm))+'</td><td class="mono">'+(x.mg===null?'—':brn(x.mg))+'</td><td>'+(x.teto?'<span class="tag t-teto">teto</span>':'')+'</td><td>'+(x.pele?'<span class="tag">pele</span>':'')+'</td><td>'+(x.g?'<em class="g-'+(x.g==='máximo'?'max':x.g==='médio'?'med':'min')+'">'+x.g+'</em>':'—')+'</td><td>'+((x.ppm!==null||x.mg!==null)?'<button class="ghost sm" data-a11="'+k+'">Usar</button>':'')+'</td></tr>').join('')+
   '</tbody></table></div><p class="fine a11n">'+list.length+' de '+A11.length+' entradas do Quadro 1. "Outros nomes": remissões "vide" do próprio quadro e nomes usuais ou fórmulas acrescentados para pesquisa. LT válidos para jornada de até 48 h semanais (item 10).</p>';
  h+='<div class="subcalc"><h4>'+(s?'Avaliação: '+esc(s.n):'Avaliação (escolha um agente ou informe o LT)')+'</h4>';
  if(s) h+=isel('un','Unidade','ppm',[...(s.ppm!==null?[['ppm','ppm (LT '+brn(s.ppm)+')']]:[]),...(s.mg!==null?[['mg','mg/m³ (LT '+brn(s.mg)+')']]:[])])+(s?'<button class="ghost sm" data-a11clr="1">Limpar escolha</button>':'');
  else h+=iin('lt','LT do Quadro 1','')+isel('gq','Grau','médio',[['mínimo','Mínimo'],['médio','Médio'],['máximo','Máximo']])+icb('teto','Agente com valor teto');
  h+=iin('hs','Jornada semanal (h) · opcional','','step="0.5"')+iin('md','Média das amostras ('+(s?(un==='ppm'?'ppm':'mg/m³'):'mesma unidade')+')','')+iin('mx','Maior amostra','');
  if(lt===null||lt===undefined||(md===null&&mx===null)) return h+resultado(null,g,'Informe os resultados das amostras (mínimo de 10 amostragens instantâneas por ponto, intervalo de 20 min — item 6).')+'</div>';
  let bs='';
  if(hs!==null && hs>48 && hs<168 && !teto){ const fr=(48/hs)*((168-hs)/120); bs=' Jornada de '+brn(hs)+' h/semana (acima das 48 h do item 10): LT corrigido por Brief & Scala, FR = (48/h)·((168 − h)/120) = '+fr.toFixed(3).replace('.',',')+' → LT '+brn(+(lt*fr).toFixed(3))+'. Pressuposto da ferramenta: base semanal de 48 h e recuperação de 120 h, como no modelo semanal de Brief & Scala; a NR-15 não traz a fórmula.'; lt=+(lt*fr).toFixed(4); }
  const fd= lt<=1?3: lt<=10?2: lt<=100?1.5: lt<=1000?1.25:1.1, vmax=lt*fd; let ok, txt;
  if(teto){ ok=(mx??md)>lt; txt='Valor teto (item 9): nenhuma amostra pode superar o LT de '+brn(lt)+'.'; }
  else { ok=(md!==null&&md>lt); txt='Item 8: média '+(md===null?'—':brn(md))+(ok?' > ':' ≤ ')+'LT '+brn(lt)+'. FD = '+brn(fd)+'; valor máximo = '+brn(+vmax.toFixed(3))+(mx!==null&&mx>vmax?' — amostra acima do valor máximo: risco grave e iminente (item 7).':'.'); }
  const grave = !teto && mx!==null && mx>vmax;
  return h+resultado(ok,g,txt+bs)+(grave?'<div class="verdict v-c"><b>Risco grave e iminente (item 7)</b><p>Amostra de '+brn(mx)+' acima do valor máximo '+brn(+vmax.toFixed(3))+' (LT × FD). A situação exige ação imediata, independentemente da média.</p></div>':'')+'</div>';
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
  h+='<div class="grid2 '+(wide?'one':'wide-l')+'"><section class="panel" id="pinsal"><div class="ph"><div class="fhead"><p class="eyebrow">Anexo '+an.n+' · grau '+esc(an.g)+'</p><span class="btns">'+favBtn('a15:'+an.n,'NR-15, Anexo '+an.n+' — '+an.t)+linkBtn('a15:'+an.n)+'<button class="printbtn" data-print="insal">Imprimir ou salvar PDF</button></span></div><h3>'+esc(an.t)+'</h3><p>'+esc(an.s)+'</p></div><div class="calcbox" id="calcbox">';
  if(an.tipo==='calc') h+=calcIns(an);
  else if(an.tipo==='quali' && an.n==='13-A'){ const g=insv('g13a',''); h+=icb('q13-A','Exposição ao benzeno constatada em inspeção')+isel('g13a','Grau atribuído pelo perito','',[['','Escolher…'],['máximo','Máximo'],['médio','Médio'],['mínimo','Mínimo']])+'<p class="fine">O Anexo 13-A não fixa grau. A escolha é do perito, por analogia com o Anexo 13 (hidrocarbonetos e outros compostos de carbono); a ferramenta não presume grau.</p>'+(insv('q13-A',false)&&!g?resultado(null,'médio','Escolha o grau atribuído no laudo.'):resultado(insv('q13-A',false),g||'médio','Caracterização qualitativa (Anexo 13-A).')); }
  else if(an.tipo==='quali') h+=icb('q'+an.n,'Condição constatada em inspeção (laudo qualitativo)')+resultado(insv('q'+an.n,false),an.g==='máximo'?'máximo':'médio','Caracterização qualitativa.');
  else if(an.tipo==='lista' && an.lista==='a14'){ const k=insv('a14',''); h+='<div class="opts">'+A14.map((x,j)=>'<label class="opt" for="a14-'+j+'"><input type="radio" name="a14" id="a14-'+j+'" data-ins="a14" value="'+j+'"'+(String(k)===String(j)?' checked':'')+'><span><em class="g-'+(x.g==='máximo'?'max':'med')+'">'+x.g+'</em>'+esc(x.t)+'</span></label>').join('')+'</div>'+(k===''?resultado(null,'médio','Escolha a atividade.'):resultado(true,A14[k].g,'Contato permanente na atividade listada. Para insalubridade, o Anexo 14 se aplica; para aposentadoria especial, não (código 3.0.1).')); }
  else if(an.tipo==='lista' && an.lista==='a13') h+=a13Lista();
  else h+='<p class="muted">Anexo revogado. Não gera adicional.</p>';
  h+='</div></section><aside class="panel"><div class="ph"><h3>Valor do adicional</h3></div>'+'<label class="f" for="i-base"><span>Base de cálculo (R$)</span><input id="i-base" type="text" inputmode="decimal" step="0.01" data-ins="base" value="'+esc(insv('base',''))+'" placeholder="Salário mínimo ou piso da norma coletiva"></label><p class="fine">Informe a base para ver o valor mensal no resultado.</p><div class="ph"><h3>Súmulas e OJs</h3></div><ul class="sm-list">'+['s47','s80','s289','s448','oj173','sv4','irr17','tst80','tst180','tst209'].map(k=>'<li><b>'+TESES[k].num+'</b> '+esc(TESES[k].tese)+'</li>').join('')+'</ul><div class="ph"><h3>Itens gerais</h3></div><dl class="dl16 small"><dt>NR-15, 15.4.1.3</dt><dd>O laudo caracterizador da insalubridade deve ficar disponível aos trabalhadores, aos sindicatos das categorias profissionais e à inspeção do trabalho (Portaria MTE 2.021/2025, vigente desde 03/04/2026).</dd><dt>NR-01, 1.5.2</dt><dd>A caracterização de atividades insalubres ou perigosas segue a NR-15 e a NR-16. Os fatores de risco psicossociais (item 1.5.3.1.4, vigente desde 26/05/2026, Portarias MTE 1.419/2024 e 765/2025) entram no PGR, mas não geram adicional nem tempo especial.</dd></dl></aside></div>';
  return h+verTambemHtml('a15:'+S.a15);
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
function pin(k,lab,attrs='step="any"'){ const id='p-'+k.replace(/[^a-z0-9]/gi,'-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="text" inputmode="decimal" data-per="'+k+'" value="'+esc(pget(k,''))+'" '+attrs+'></label>'; }
function psel(k,lab,opts,d){ const id='p-'+k.replace(/[^a-z0-9]/gi,'-'), v=pget(k,d); return '<label class="f" for="'+id+'"><span>'+lab+'</span><select id="'+id+'" data-per="'+k+'">'+opts.map(([a,b])=>'<option value="'+a+'"'+(String(v)===String(a)?' selected':'')+'>'+esc(b)+'</option>').join('')+'</select></label>'; }
function selected(an,sel){ const sec=an.secoes.find(s=>s.sel===sel); if(!sec) return []; return sec.itens.filter(it=>pget(pk(an.id,sel,it[0]),false)); }
function calcExplosivos(an){
  const tp=pget('a1:exp:tp','q4'), kg=num(pget('a1:exp:kg','')), dist=num(pget('a1:exp:d','')), bar=pget('a1:exp:bar',false);
  const q=EXPQ[tp]; let r=null, acima=false;
  if(kg!==null){ const row=q.t.find(([lim])=>kg<=lim); if(row) r=row[1]; else { r=q.t[q.t.length-1][1]; acima=true; } if(bar&&tp==='q4') r=r/2; }
  const dentro = r!==null && dist!==null && dist<=r;
  let h='<div class="pcalc">'+psel('a1:exp:tp','Material armazenado',Object.entries(EXPQ).map(([k,v])=>[k,v.rot]),'q4')+pin('a1:exp:kg','Quantidade armazenada (kg)')+(tp==='q4'?pcb('p-a1-bar','a1:exp:bar','Depósito barricado ou entrincheirado (distância reduzida à metade)'):'')+pin('a1:exp:d','Distância do posto de trabalho ao depósito (m)')+'</div>';
  if(r!==null) h+='<div class="kv"><div><span>Raio da área de risco</span><b>'+brn(r)+' m</b></div>'+(dist!==null?'<div><span>Posto de trabalho</span><b>'+(dentro?'dentro da área de risco':'fora da área de risco')+'</b></div>':'')+'</div>'+(acima?'<p class="warn">'+(tp==='q4'?'Quantidade acima da última linha do Quadro 4 (113.300 kg): o quadro não fixa distância para quantidades maiores; adotada a maior distância do quadro (1.350 m).':'Quantidade acima do máximo admitido pelo quadro, que não pode ser ultrapassado.')+'</p>':'');
  return {h, ok:dentro, txt: dentro?'Permanência na área de risco do depósito (item 3, raio de '+brn(r)+' m).':''};
}
function calcTransporte(){
  const tp=pget('a2:tr:tp','liq'), q=num(pget('a2:tr:q','')), prop=pget('a2:tr:prop',false), e41=pget('a2:tr:41',false), e42=pget('a2:tr:42',false);
  const lim= tp==='liq'?200:135, un= tp==='liq'?'litros':'kg';
  let h='<div class="pcalc">'+psel('a2:tr:tp','Produto transportado',[['liq','Inflamável líquido'],['gas','Inflamável gasoso liquefeito']],'liq')+pin('a2:tr:q','Quantidade total transportada ('+un+')')+pcb('p-a2-prop','a2:tr:prop','Somente tanques de consumo próprio, originais de fábrica ou suplementares certificados (16.6.1 e 16.6.1.1)')+(tp==='liq'?pcb('p-a2-41','a2:tr:41','Embalagens certificadas dentro dos limites do Quadro I (item 4.1)')+pcb('p-a2-42','a2:tr:42','Recipientes de até 5 L lacrados na fabricação (item 4.2)'):'')+'</div>';
  let ok=false, txt='';
  if(q!==null){ if(prop) txt='Transporte não caracterizado: tanques de consumo próprio não contam (16.6.1 e 16.6.1.1).'; else if(tp==='liq'&&(e41||e42)) txt='Transporte não caracterizado: excluído pelo item '+(e41?'4.1':'4.2')+' do Anexo II.'; else if(q>=lim){ ok=true; txt='Transporte perigoso: '+brn(q)+' '+un+' (igual ou acima de '+lim+' '+un+'; item 16.6 e alínea '+(tp==='liq'?'j':'l')+' do Anexo II).'+(q===lim?' Exatamente no limite: o item 16.6 exclui o transporte "até" '+lim+' '+un+', mas a alínea '+(tp==='liq'?'j':'l')+' do Anexo II o considera perigoso a partir de '+lim+' '+un+'; a norma é contraditória neste ponto.':''); } else txt='Transporte não caracterizado: '+brn(q)+' '+un+', abaixo de '+lim+' '+un+' (pequena quantidade, item 16.6). Pela alínea '+(tp==='liq'?'j':'l')+' do Anexo II, a partir de '+lim+' '+un+' já é perigoso.'; }
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
  h+='<div class="grid2 one"><section class="panel" id="pperic"><div class="ph"><div class="fhead"><p class="eyebrow">'+esc(an.n)+' · '+esc(an.port)+'</p><span class="btns">'+favBtn('a16:'+an.id,'NR-16, '+an.n+' — '+an.t)+linkBtn('a16:'+an.id)+'<button class="printbtn" data-print="peric">Imprimir ou salvar PDF</button></span></div><h3>'+esc(an.t)+'</h3></div>'+
   an.secoes.map(sec=>secHtml(an,sec)).join('')+
   '<section class="sec16"><h4>Frequência da exposição (Súmula 364'+(an.id==='a4'?' e item 3 do Anexo 4':'')+')</h4><fieldset class="fr"><legend class="sr">Frequência</legend>'+[['perm','Permanente'],['int','Intermitente'],['ev','Eventual (fortuito)'],['red','Habitual por tempo extremamente reduzido']].map(([k,t])=>'<label class="cb" for="fr-'+k+'"><input type="radio" name="fr" id="fr-'+k+'" data-per="fr" value="'+k+'"'+(pget('fr','perm')===k?' checked':'')+'><span>'+t+'</span></label>').join('')+'</fieldset></section>'+
   '<div class="pcalc">'+pin('sal','Salário-base (R$) — opcional','step="0.01"')+'</div>'+
   '<div class="verdict '+(r.st==='E'?'v-e':r.st==='N'?'v-n':'v-i')+'"><b>'+esc(r.b)+(r.st==='E'&&sal?' · R$ '+(sal*0.3).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' por mês':'')+'</b><p>'+esc(r.p)+'</p></div>'+
   '<div class="btns"><button class="ghost sm" data-perclr="'+an.id+'">Limpar marcações deste anexo</button></div></section>'+
   '<aside class="panel"><div class="ph"><h3>Itens gerais da NR-16</h3></div><dl class="dl16 small">'+NR16_GERAL.map(([k,t])=>'<dt>'+k+'</dt><dd>'+esc(t)+'</dd>').join('')+'</dl><div class="ph"><h3>Jurisprudência relacionada</h3></div><ul class="sm-list">'+(an.j.length?an.j.map(k=>'<li><b>'+TESES[k].num+'</b> '+esc(TESES[k].tese)+'</li>').join(''):'<li>Sem súmula específica cadastrada.</li>')+'<li><b>IRR Tema 17</b> '+esc(TESES.irr17.tese)+'</li></ul><p class="fine">Na aposentadoria especial, a periculosidade por si só não gera tempo especial depois de 1997: veja STF, Tema 1209, e a ficha de eletricidade.</p></aside></div>';
  return h+verTambemHtml('a16:'+S.a16);
}

/* ---------- TESES ---------- */
const SIT_ROT={firmada:'Tese firmada', embargos:'Embargos pendentes', julgamento:'Em julgamento', revisao:'Em revisão'};
const sitRot = t => t.sit==='firmada' && /Súmula|OJ/.test(t.num) ? 'Vigente' : SIT_ROT[t.sit]||'Tese firmada';
function citacao(k){ const t=TESES[k]; return t.trib+', '+t.num+(t.ref&&t.ref!=='—'?' ('+t.ref+')':'')+(t.ano?', '+t.ano:'')+' — '+t.titulo+'. '+t.tese+' ['+sitRot(t)+'. Resumo do Caracterizador Pericial: confira a íntegra antes de citar.]'; }
function renderTeses(){
  const f=S.tf, fs=S.tsit||'todas', tq=normTxt(S.tq||''); const items=Object.entries(TESES).filter(([k,t])=>(f==='todos'||(f==='prev'&&t.area==='prev')||(f==='trab'&&t.area==='trab')||t.trib===f)&&(fs==='todas'||(fs==='abertas'?t.sit!=='firmada':t.sit==='firmada'))&&(!tq||normTxt(t.num+' '+t.titulo+' '+t.tese+' '+t.trib+' '+(t.ref||'')).includes(tq)));
  const usos=k=>AGENTS.filter(a=>(a.juris||[]).includes('T:'+k));
  const nAbertas=Object.values(TESES).filter(t=>t.sit!=='firmada').length;
  let h='<section class="intro"><div><p class="eyebrow">Jurisprudência</p><h2>Teses que mudam a análise</h2><p class="muted">Resumos para consulta, sem a redação oficial. Antes de citar, confira a íntegra e verifique se houve revisão ou modulação. A etiqueta mostra a situação em '+brData((FONTES_OK.find(x=>x.id==='stj')||{}).conferido||'')+'.</p></div></section>';
  h+='<div class="libbar"><label class="f grow" for="tq"><span>Pesquisar nas teses</span><input id="tq" type="search" data-st="tq" value="'+esc(S.tq||'')+'" placeholder="Ex.: EPI, ruído, vigilante, Súmula 364, REsp 2.082.072"></label></div>';
  h+='<div class="filt">'+[['todos','Todas'],['prev','Previdenciário'],['trab','Trabalhista'],['STF','STF'],['STJ','STJ'],['TNU','TNU'],['TST','TST']].map(([k,t])=>'<button data-tf="'+k+'" class="'+(f===k?'on':'')+'">'+t+'</button>').join('')+'</div>';
  h+='<div class="filt">'+[['todas','Qualquer situação'],['firmadas','Firmadas e vigentes'],['abertas','Em aberto ('+nAbertas+')']].map(([k,t])=>'<button data-tsit="'+k+'" class="'+(fs===k?'on':'')+'">'+t+'</button>').join('')+'</div>';
  h+='<div class="resbar"><p class="muted small">'+items.length+' resultado(s).</p>'+(items.length?'<button class="printbtn" data-print="teses">Imprimir '+(items.length===1?'esta tese':'estas '+items.length+' teses')+'</button>':'')+'</div>';
  h+='<div class="teses">'+items.map(([k,t])=>{ const u=usos(k); return '<article class="tese" id="tese-'+k+'"><header><span class="trib t-'+t.trib+'">'+t.trib+'</span><b>'+esc(t.num)+'</b>'+(t.ano?'<span class="ano">'+t.ano+'</span>':'')+'<span class="sit sit-'+t.sit+'">'+esc(sitRot(t))+'</span></header><h4>'+esc(t.titulo)+'</h4><p>'+esc(t.tese)+'</p>'+(t.ref&&t.ref!=='—'?'<p class="ref">'+esc(t.ref)+'</p>':'')+(u.length?'<p class="uso">Fichas: '+u.map(a=>'<a href="#aposentadoria/agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a>').join(', ')+'</p>':'')+'<div class="btns">'+favBtn('tese:'+k,t.trib+', '+t.num+' — '+t.titulo)+'<button class="ghost sm" data-cite="'+k+'">Copiar citação</button><button class="ghost sm" data-tlink="'+k+'">Copiar link</button><button class="ghost sm" data-print="tese:'+k+'">Imprimir</button></div></article>'; }).join('')+'</div>';
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
 ['linach_manual','LINACH — considerações do Manual de Aposentadoria Especial (INSS, 2018)',['Texto']],
 ['glossario','Glossário técnico e jurídico',['Termo','Definição']],
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
  const vis='<nav class="subtabs" aria-label="Biblioteca"><a href="#biblioteca"'+(S.libv!=='textos'?' class="on" aria-current="page"':'')+'>Quadros e tabelas</a><a href="#biblioteca/textos"'+(S.libv==='textos'?' class="on" aria-current="page"':'')+'>Textos legais navegáveis</a></nav>';
  if(S.libv==='textos') return '<section class="intro"><div><p class="eyebrow">Biblioteca</p><h2>Textos legais navegáveis</h2><p class="muted">Lei 8.213/91 (arts. 57 e 58), IN 128/2022 (arts. 286 a 302), NR-01 (item 1.5 e Anexo I) e os itens gerais da NR-15 e da NR-16, com link e citação para cada artigo ou item.</p></div></section>'+vis+renderTextos();
  const q=S.q.trim(), norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(), nq=norm(q);
  const tabs = S.lib==='todas' ? LIBT : LIBT.filter(t=>t[0]===S.lib);
  let h='<section class="intro"><div><p class="eyebrow">Biblioteca</p><h2>Normas e quadros</h2><p class="muted">Conteúdo das planilhas originais (Agentes Nocivos e Legislação Previdenciária), agora pesquisável. A IN 77/2015 foi revogada pela IN 128/2022 e não consta aqui.</p></div></section>';
  h+=vis;
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
  if(typeof FUNCOES!=='undefined') FUNCOES.forEach((x,i)=>add('Consulta por função',x.f,x.obs,'funcao:'+i,(x.sin||[]).join(' ')));
  docsTexto().forEach(d=>d.itens.forEach(it=>add('Textos legais — '+d.curto,it.rot+' — '+d.tit.split(' — ')[0],it.pars.join(' '),'txt:'+d.id+'/'+it.id)));
  MARCOS.forEach(m=>add('Marcos legais',fmtBR(m.d)+' — '+m.t,m.s,'aposentadoria/resultado'));
  if(typeof NOVIDADES!=='undefined') NOVIDADES.forEach(n=>add('Novidades na base',n.titulo,n.resumo,n.ir||'inicio'));
  LIBT.forEach(([k,tit])=>(LIB[k]||[]).forEach(r=>{ const row=Array.isArray(r)?r:[r]; const txt=row.filter(Boolean).join(' · '); if(/^https?:/.test(txt)) return; add('Biblioteca — '+tit, row[0].length>90?row[0].slice(0,90)+'…':row[0], row.slice(1).join(' · '), 'lib:'+k, txt); }));
  return E;
}
function snippet(s,terms){ const n=normTxt(s); let i=-1; for(const t of terms){ i=n.indexOf(t); if(i>=0) break; } if(i<0||s.length<180) return s; const a=Math.max(0,i-60); return (a?'…':'')+s.slice(a,a+180)+'…'; }
function hlTerms(s,terms){ let h=esc(s); terms.forEach(t=>{ if(t.length<2) return; const src=esc(s); /* destaque sem acento */ const re=new RegExp('('+t.split('').map(c=>({a:'[aáàâã]',e:'[eéê]',i:'[ií]',o:'[oóôõ]',u:'[uúü]',c:'[cç]'}[c]||c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))).join('')+')','gi'); h=h.replace(re,'<mark>$1</mark>'); }); return h; }
function renderBusca(){
  const q=(S.gq||'').trim(); const terms=normTxt(q).split(/\s+/).filter(Boolean);
  let h='<section class="intro"><div><p class="eyebrow">Pesquisa geral</p><h2>'+(q.length>=2?'Resultados para "'+esc(q)+'"':'Pesquise em todas as abas')+'</h2><p class="muted">Agentes nocivos, Anexos 11, 13 e 14 da NR-15, NR-16, teses, marcos legais e a biblioteca de decretos. Use mais de uma palavra para refinar.</p></div></section>';
  if(terms.length===0||q.length<2) return h+'<div class="chips">'+['tolueno','solda','martelete','coleta de lixo','caldeira','frentista','galvanoplastia','benzeno','EPI'].map(x=>'<button class="ghost sm" data-gq="'+x+'">'+x+'</button>').join('')+'</div>';
  IDX = IDX || buildIndex();
  /* primeiro as palavras que começam pelo termo (NEN não casa com "permanente"); se nada, busca em qualquer parte */
  const inicio=terms.map(t=>new RegExp('(^|[^a-z0-9])'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  let hits=IDX.filter(e=>inicio.every(re=>re.test(e.n)));
  if(!hits.length) hits=IDX.filter(e=>terms.every(t=>e.n.includes(t)));
  if(!hits.length) return h+'<p class="empty">Nada encontrado. Tente um sinônimo (ex.: "toluol", "amianto") ou uma palavra só.</p>';
  const groups={}; hits.forEach(e=>(groups[e.sec]=groups[e.sec]||[]).push(e));
  h+='<p class="muted small">'+hits.length+' resultado(s) em '+Object.keys(groups).length+' seção(ões).</p><div class="sres">';
  for(const [sec,list] of Object.entries(groups)){
    h+='<section class="panel"><div class="ph"><h3>'+esc(sec)+'</h3><p class="muted small">'+list.length+' resultado(s)</p></div><ul class="hits">'+list.slice(0,12).map(e=>'<li><button class="hit" data-go="'+esc(e.go)+'"><b>'+hlTerms(e.t,terms)+'</b><span>'+hlTerms(snippet(e.s,terms),terms)+'</span></button></li>').join('')+'</ul>'+(list.length>12?'<p class="fine">Mais '+(list.length-12)+' resultado(s): refine a pesquisa'+(list[0].go.startsWith('lib:')?' ou abra a biblioteca':'')+'.</p>':'')+'</section>';
  }
  return h+'</div>';
}
let SRCH=null, GO_REPLACE=false;
const slugTx=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function setHash(h){ if(GO_REPLACE){ GO_REPLACE=false; if(location.hash==='#'+h){ history.replaceState(null,'','#'+h); route(); } else location.replace('#'+h); } else location.hash=h; }
/* link direto e permanente para qualquer conteúdo: #ir/<destino>, ex.: #ir/ag:calor, #ir/a15:3, #ir/a16:a2, #ir/funcao:soldador */
function linkDireto(key){ const [k,v]=key.split(':'); if(k==='funcao'&&!isNaN(+v)&&FUNCOES[+v]) key='funcao:'+slugTx(FUNCOES[+v].f); return location.href.split('#')[0]+'#ir/'+key; }
/* depois de abrir um link direto, rola até o conteúdo (no celular a ficha fica abaixo da lista) */
function irAoConteudo(){ setTimeout(()=>{ const b=document.querySelector('main [data-golink], main .tese.alvo, main .txart.alvo'); const t=b&&(b.closest('.alvo')||b.closest('article,section')); if(!t||t.classList.contains('alvo')) return; const hd=document.querySelector('header.band'); const topo=hd&&getComputedStyle(hd).position==='sticky'?hd.getBoundingClientRect().bottom:0; window.scrollTo(0, Math.max(0, t.getBoundingClientRect().top+window.scrollY-topo-8)); },80); }
/* confere se o destino de um link direto existe (link antigo ou digitado errado cai no Início) */
function destinoValido(dest){ const i=dest.indexOf(':'); if(i<1) return false; const k=dest.slice(0,i), v=dest.slice(i+1); if(!v) return false;
  if(k==='ag') return AGENTS.some(a=>a.id===v);
  if(k==='a15') return NR15.some(x=>String(x.n)===v);
  if(k==='a16') return NR16.some(x=>x.id===v);
  if(k==='a11') return !!A11[+v]; if(k==='a13') return !!A13FULL[+v];
  if(k==='funcao') return isNaN(+v)?FUNCOES.some(x=>slugTx(x.f)===v):!!FUNCOES[+v];
  if(k==='tese') return !!TESES[v];
  if(k==='txt'||k==='lib') return true;
  return false; }
function linkBtn(key){ return '<button class="ghost sm" data-golink="'+esc(key)+'" title="Copiar o endereço direto desta consulta">Copiar link</button>'; }
document.addEventListener('click', ev=>{ const b=ev.target.closest('[data-golink]'); if(!b) return; copiar(linkDireto(b.dataset.golink),'Link copiado. Quem abrir vai direto a esta consulta.'); });
function go(dest){
  const [k,v]=dest.split(':'); SRCH={tq:null,q:null,q11:null,q13:null,fromGo:true};
  if(k==='ag'){ S.ag=v; S.ap='agentes'; setHash('aposentadoria/agentes'); }
  else if(k==='a11'){ S.a15=11; S.ins.sub=+v; S.ins.q11=A11[+v].n; SRCH.q11=S.ins.q11; setHash('insalubridade'); }
  else if(k==='a13'){ S.a15=13; S.ins.a13sel=v; S.ins.q13=''; S.ins.g13='todos'; setHash('insalubridade'); }
  else if(k==='a15'){ S.a15=isNaN(+v)?v:+v; setHash('insalubridade'); }
  else if(k==='a16'){ S.a16=v; setHash('periculosidade'); }
  else if(k==='funcao'){ S.fsel=isNaN(+v)?(i=>i<0?S.fsel:i)(FUNCOES.findIndex(x=>slugTx(x.f)===v)):+v; S.fq=''; setHash('funcao'); }
  else if(k==='tese'){ S.tf='todos'; S.tsit='todas'; S.tq=''; setHash('teses/'+v); }
  else if(k==='txt'){ setHash('biblioteca/textos/'+v); }
  else if(k==='lib'){ S.lib=v; S.q=S.gq||''; SRCH.q=S.q; setHash('biblioteca'); }
  else setHash(k);
  if(location.hash==='#'+S.tab){ route(); }
}

function render(){
  document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')==='#'+S.tab?'page':'false'));
  const m=$('#main');
  m.innerHTML = ajudaHtml() + (S.tab==='inicio'?renderInicio(): S.tab==='busca'?renderBusca(): S.tab==='aposentadoria'?renderAposentadoria(): S.tab==='insalubridade'?renderInsal(): S.tab==='periculosidade'?renderPeric(): S.tab==='teses'?renderTeses(): S.tab==='perfil'?renderPerfil(): S.tab==='funcao'?renderFuncao(): renderBib());
  registrarVisto(); marcarSiglas();
}
function route(){ let h=location.hash.slice(1); if(h.startsWith('ir/')){ const dest=decodeURIComponent(h.slice(3)); if(destinoValido(dest)){ GO_REPLACE=true; go(dest); irAoConteudo(); return true; } h='inicio'; } const LEG={agentes:'aposentadoria/agentes',painel:'aposentadoria/resultado'}; if(LEG[h]){ h=LEG[h]; history.replaceState(null,'','#'+h); } const [h0,h1,h2,h3]=h.split('/');
  if(SRCH){ if(SRCH.fromGo){ SRCH.fromGo=false; } else { if(SRCH.tq!==null&&S.tq===SRCH.tq) S.tq=''; if(SRCH.q!==null&&S.q===SRCH.q){ S.q=''; S.lib='todas'; } if(SRCH.q11!==null&&S.ins.q11===SRCH.q11){ S.ins.q11=''; } SRCH=null; } } S.tab = TABS.some(t=>t[0]===h0)?h0:(h0==='busca'?'busca':'inicio'); if(S.tab==='aposentadoria') S.ap = AP_SUB.some(x=>x[0]===h1)?h1:(S.ap||'agentes'); if(S.tab==='teses'&&h1&&TESES[h1]){ S.tf='todos'; S.tsit='todas'; S.tq=''; } S.alvo=(S.tab==='teses'&&h1&&TESES[h1])?'tese:'+h1:(S.tab==='biblioteca'&&h1==='textos'&&h3)?'txt:'+h2+'/'+decodeURIComponent(h3):''; if(S.tab==='biblioteca'){ S.libv=h1==='textos'?'textos':'quadros'; if(h2){ S.txd=h2; S.txq=''; } } render(); if(S.tab==='teses'&&h1&&TESES[h1]){ destacar('tese-'+h1); return true; } if(S.tab==='biblioteca'&&S.libv==='textos'&&h3){ destacar(txId(h2,decodeURIComponent(h3))); return true; } return false; }
window.addEventListener('hashchange', ()=>{ if(!route()) window.scrollTo(0,0); });

function setPath(obj, path, val){ const ps=path.split('.'); let o=obj; for(let k=0;k<ps.length-1;k++){ o[ps[k]]=o[ps[k]]||{}; o=o[ps[k]]; } o[ps[ps.length-1]]=val; }
function refreshCaso(i){ if(i==='s'){ const el=$('#res-s'); if(el) el.innerHTML=resTable(simRow()); return; } const el=$('#res-'+i); if(el) el.innerHTML=resTable(S.caso.rows[i]); const tb=$('#totbar'); if(tb) tb.innerHTML=totBar(); const r=S.caso.rows[i], art=document.querySelector('.row[data-i="'+i+'"] .rtt'); if(art) art.innerHTML='<b>'+esc(r.funcao||'Função')+'</b><span>'+esc(r.empresa||'Empresa')+'</span>'; }
let CARET=null;
function refocus(id){ const el=document.getElementById(id); if(!el) return; el.focus(); try{ if(el.type==='text'||el.type==='search'){ const L=el.value.length, p=(CARET===null||CARET>L)?L:CARET; el.setSelectionRange(p,p); } }catch(e){} CARET=null; }

document.addEventListener('input', ev=>{
  const t=ev.target; try{ CARET = (typeof t.selectionStart==='number') ? t.selectionStart : null; }catch(e){ CARET=null; }
  if(t.dataset.rck){ S.rck=S.rck||{}; S.rck[t.dataset.rck]=t.checked; const n=Object.values(RS_CK).flat().length, d=Object.values(S.rck).filter(Boolean).length; const c=$('#ckcount'); if(c) c.textContent=d+' de '+n; return; }
  if(t.dataset.li){ const c=liState(), p=t.dataset.li.split('.'); if(p[0]==='s') c.s[+p[1]][p[2]]=t.value; else c[p[0]]=t.value; const box=$('#lires'); if(box) box.innerHTML=liRes(); uRefresh(); return; }
  if(t.dataset.uf){ uState()[t.dataset.uf]=t.value; uRefresh(); return; }
  if(t.dataset.lisel){ liState()[t.dataset.lisel]=t.value; const box=$('#lires'); if(box) box.innerHTML=liRes(); return; }
  if(t.dataset.cmp){ const c=cmpState(), p=t.dataset.cmp.split('.'); if(p[0]==='r') c.r[+p[1]][+p[2]]=t.value; else c[p[0]]=t.value; const box=$('#cmpres'); if(box) box.innerHTML=cmpRes(); return; }
  if(t.dataset.cmpcb){ cmpState()[t.dataset.cmpcb]=t.checked; const box=$('#cmpres'); if(box) box.innerHTML=cmpRes(); return; }
  if(t.dataset.cmpsel){ cmpState()[t.dataset.cmpsel]=t.value; render(); return; }
  if(t.id==='gq'){ S.gq=t.value; if(S.gq.trim().length>=2){ if(S.tab!=='busca'){ S.tab='busca'; history.replaceState(null,'','#busca'); } render(); } else if(S.tab==='busca') render(); return; }
  if(t.dataset.r!==undefined){ const isSim=t.dataset.r==='s', i=isSim?'s':+t.dataset.r, f=t.dataset.f, row=isSim?simRow():S.caso.rows[i];
    if(f==='d.mr'||f==='d.regime'||f==='d.epiu'){ if(f==='d.epiu'){ row.d=row.d||{}; row.d.epiu=t.checked; if(!isSim) save(); const id=t.id; render(); refocus(id); return; } row.d=row.d||{}; setPath(row,f,t.value); if(!isSim) save(); const id=t.id; render(); refocus(id); return; }
    let v = t.type==='checkbox'?t.checked:t.value;
    if(f==='agente'){ row.agente=v; row.d={}; row.tempo=agById(v).tempo; save(); render(); const s=$('#r'+i+'-agente'); if(s) s.focus(); return; }
    if(f==='tempo') v=+v;
    setPath(row,f,v); if(!isSim) save(); refreshCaso(i); return; }
  if(t.dataset.c){ S.caso[t.dataset.c]=t.value; save(); if(t.dataset.c==='sexo'){ const tb=$('#totbar'); if(tb) tb.innerHTML=totBar(); } return; }
  if(t.dataset.ins!==undefined){ const k=t.dataset.ins; S.ins[k]= t.type==='checkbox'?t.checked:t.value;
    if(k==='q2sel' && t.value) S.ins.m=t.value.split('|')[0];
    if(k==='un'){ /* troca de unidade mantém a substância */ }
    const id=t.id; render(); if(t.type!=='radio'&&t.type!=='checkbox') refocus(id); return; }
  if(t.dataset.nps!==undefined){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); rows[+t.dataset.nps][+t.dataset.c]=t.value; S.ins.nps=rows; const id=t.getAttribute('aria-label'), cp=CARET; render(); const el=document.querySelector('[aria-label="'+id+'"]'); if(el){ el.focus(); try{ const L=el.value.length, p=(cp===null||cp>L)?L:cp; el.setSelectionRange(p,p); }catch(e){} } return; }
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
  if(b.dataset.ag){ S.ag=b.dataset.ag; if(!(S.tab==='aposentadoria'&&S.ap==='agentes')){ S.ap='agentes'; location.hash='aposentadoria/agentes'; } else { render(); } if(b.tagName==='BUTTON'){ const f=$('.ficha'); if(f&&window.innerWidth<860) f.scrollIntoView({behavior:'smooth'}); } return; }
  if(b.dataset.a11!==undefined){ S.ins.sub=+b.dataset.a11; delete S.ins.un; render(); const sc=$('.subcalc'); if(sc) sc.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
  if(b.dataset.a11clr){ delete S.ins.sub; delete S.ins.un; render(); return; }
  if(b.dataset.npsr!==undefined||b.dataset.npsx!==undefined){ const k=b.dataset.npsr??b.dataset.npsx, row=k==='s'?simRow():S.caso.rows[+k]; row.d=row.d||{}; const o=row.d.nps||(row.d.nps={}); const n=Object.keys(o).length; if(b.dataset.npsr!==undefined){ o[Math.max(n,1)]={0:'',1:''}; if(!n) o[0]={0:'',1:''}; } else if(n>1) delete o[n-1]; if(k!=='s') save(); render(); return; }
  if(b.dataset.simuse){ const r=JSON.parse(JSON.stringify(simRow())); r.empresa=''; r.funcao='Simulação — '+agById(r.agente).nome; S.caso.rows.push(r); save(); b.textContent='Incluído no caso'; b.disabled=true; const box=b.closest('.simbox'); if(box&&!box.querySelector('.goto-caso')){ const a=document.createElement('a'); a.className='goto-caso'; a.href='#aposentadoria/caso'; a.textContent='Período incluído. Ver na simulação →'; box.querySelector('.fhead').after(a); } setTimeout(()=>{ if(b.isConnected){ b.textContent='Incluir na análise de caso'; b.disabled=false; } },2000); return; }
  if(b.dataset.caq!==undefined){ const ca=(b.closest('.epibox')?.querySelector('[data-f="d.ca"]')?.value||'').trim(); try{ if(ca&&navigator.clipboard) navigator.clipboard.writeText(ca); }catch(e){} window.open('http://caepi.mte.gov.br/internet/ConsultaCAInternet.aspx','_blank','noopener'); if(ca){ b.textContent='CA '+ca+' copiado · abrir consulta ↗'; } return; }
  if(b.dataset.rstep){ S.rstep=b.dataset.rstep; render(); const r=$('.rs'); if(r) r.scrollIntoView({block:'start'}); return; }
  if(b.dataset.rckclr){ S.rck={}; render(); return; }
  if(b.dataset.useg){ uState()[b.dataset.useg]=b.dataset.v; render(); return; }
  if(b.dataset.ursr){ S.u=null; S.li=null; render(); return; }
  if(b.dataset.lirst){ S.li=null; render(); return; }
  if(b.dataset.cmprst){ S.cmp=null; render(); return; }
  if(b.dataset.simrst){ delete S.sim[S.ag]; render(); return; }
  if(b.dataset.del!==undefined){ S.caso.rows.splice(+b.dataset.del,1); save(); render(); return; }
  if(b.dataset.act==='add'){ const last=S.caso.rows[S.caso.rows.length-1]; const hj=new Date().toISOString().slice(0,10); let ini= last&&last.fim?addDays(last.fim,1):'2000-01-01'; if(ini>hj) ini=hj; let fim=addDays(ini,364); if(fim>hj) fim=hj; S.caso.rows.push({empresa:'',funcao:'',ini, fim, agente:'ruido', tempo:25, epi:false, d:{te:480}}); save(); render(); const r=document.querySelectorAll('.row'); if(r.length) r[r.length-1].scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if(b.dataset.act==='ex'){ novoCaso(JSON.parse(JSON.stringify(EXEMPLO))); return; }
  if(b.dataset.act==='clr'){ if(b.dataset.armed){ S.caso.rows=[]; save(); render(); } else { b.dataset.armed='1'; b.textContent='Toque de novo para limpar'; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent='Limpar períodos'; } },3000); } return; }
  if(b.dataset.act==='copy'){ const txt=resumoTexto(); const done=()=>{ b.textContent='Quadro copiado'; setTimeout(()=>b.textContent='Copiar quadro-resumo',2000); };
    try{ navigator.clipboard.writeText(txt).then(done, ()=>fallbackCopy(txt,b)); }catch(e){ fallbackCopy(txt,b); } return; }
  if(b.dataset.a15){ S.a15=b.dataset.a15; render(); return; }
  if(b.dataset.a16){ S.a16=b.dataset.a16; render(); return; }
  if(b.dataset.perclr){ Object.keys(S.per).forEach(k=>{ if(k.startsWith(b.dataset.perclr+':')) delete S.per[k]; }); render(); return; }
  if(b.dataset.tf){ S.tf=b.dataset.tf; render(); return; }
  if(b.dataset.tsit){ S.tsit=b.dataset.tsit; render(); return; }
  if(b.dataset.cite){ copiar(citacao(b.dataset.cite),'Citação copiada.'); return; }
  if(b.dataset.tlink){ copiar(location.href.split('#')[0]+'#teses/'+b.dataset.tlink,'Link da tese copiado.'); return; }
  if(b.dataset.npsAdd){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); rows.push([85,60]); S.ins.nps=rows; render(); return; }
  if(b.dataset.npsDel){ const rows=insv('nps',[[88,240],[92,120],[80,120]]).map(r=>r.slice()); if(rows.length>1) rows.pop(); S.ins.nps=rows; render(); return; }
});
document.addEventListener('keydown', ev=>{ if(ev.key==='/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ ev.preventDefault(); $('#gq').focus(); } });
function fallbackCopy(txt,b){ let ta=document.getElementById('copyarea'); if(!ta){ ta=document.createElement('textarea'); ta.id='copyarea'; ta.className='copyarea'; ta.setAttribute('aria-label','Quadro-resumo para copiar'); b.closest('.casehead').after(ta); } ta.value=txt; ta.hidden=false; ta.focus(); ta.select(); b.textContent='Selecione e copie o texto abaixo'; }


/* ---------- IMPRESSÃO EM PAPEL TIMBRADO ---------- */
const hoje = () => new Date().toLocaleDateString('pt-BR');
function freeze(node){
  const c=node.cloneNode(true);
  c.querySelectorAll('button.gl').forEach(b=>b.replaceWith(document.createTextNode(b.textContent)));
  c.querySelectorAll('.printbtn, .btns, button, .a11wrap, .fine.a11n, .vtb, .txidx, .txdocs').forEach(e=>e.remove());
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
  return '<h1>Simulação de enquadramento — aposentadoria especial</h1><p class="meta">Documento de consulta: aplica as regras aos dados informados e não substitui laudo, parecer ou decisão.</p><p class="meta"><b>Caso:</b> '+esc(c.nome||'—')+' · <b>Segurado:</b> '+(c.sexo==='M'?'mulher':'homem')+' · <b>Emitido em:</b> '+hoje()+'</p>'+
   '<table class="rep"><thead><tr><th>Período</th><th>Empresa / função</th><th>Agente</th><th>Base legal</th><th>Nota do especialista</th><th>INSS (IN 128/2022)</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<table class="tot"><tr><th>Tempo especial — nota do especialista</th><td>'+fmtDias(t.perito.dias)+' ('+t.perito.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Tempo especial — INSS</th><td>'+fmtDias(t.inss.dias)+' ('+t.inss.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Acréscimo por conversão até 13/11/2019 (perito / INSS)</th><td>'+fmtDias(t.perito.conv)+' / '+fmtDias(t.inss.conv)+'</td></tr><tr><th>Trechos divergentes</th><td>'+t.diverg+'</td></tr></table>'+
   '<p class="nota">Nota do especialista: ruído pela NR-15 (q = 5), Lavg até 18/11/2003 e NEN a partir de 19/11/2003; calor pelo código 2.0.4 do Decreto 3.048/99; agentes biológicos pelo rol do código 3.0.1. Contagem em dias corridos; anos, meses e dias aproximados por 365/30. Conversão pelo art. 70 do Decreto 3.048/99, só até 13/11/2019 (EC 103/2019).</p>';
}
/* uma linha da tabela externa por bloco: o cabeçalho e o rodapé do timbrado se repetem sem sobrepor o conteúdo */
function splitRows(html){
  const tmp=document.createElement('div'); tmp.innerHTML=html; const out=[];
  const keep=el=>/^(TABLE|P|H1|H2|H3|H4|UL|OL|DL|IMG|LABEL)$/.test(el.tagName)||el.matches('.verdict,.kv,.f,.cb,.opt,.lt,.iso,.tri,.mxrow,.codes,header:has(> .trib)');
  const walk=node=>{ for(const ch of Array.from(node.childNodes)){ if(ch.nodeType===3){ if(ch.textContent.trim()) out.push(ch.textContent); continue; } if(ch.nodeType!==1) continue; if(!keep(ch) && ch.children.length>1) walk(ch); else out.push(ch.outerHTML); } };
  walk(tmp);
  return out.map(x=>'<tr><td class="pbody">'+x+'</td></tr>').join('');
}
function printOut(kind){
  let html='', ori='portrait';
  if(kind==='caso'){ html=reportCaso(); ori='landscape'; }
  else if(kind==='ficha'){ const f=$('.ficha'); html='<p class="meta">Ficha de agente nocivo · emitida em '+hoje()+'</p>'+freeze(f); }
  else if(kind==='insal'){ html='<h1>Insalubridade — NR-15</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pinsal')); }
  else if(kind.startsWith('tese:')){ const el=document.getElementById('tese-'+kind.slice(5)); if(!el) return; html='<h1>Jurisprudência — consulta</h1><p class="meta">Resumo para consulta, emitido em '+hoje()+'. Confira a íntegra e a situação atual antes de citar.</p>'+freeze(el)+'<p class="meta"><b>Citação:</b> '+esc(citacao(kind.slice(5)))+'</p>'; }
  else if(kind==='teses'){ const l=[...document.querySelectorAll('.teses .tese')]; if(!l.length) return; html='<h1>Jurisprudência — '+l.length+' tese(s)</h1><p class="meta">Seleção conforme os filtros da tela, emitida em '+hoje()+'. Resumos para consulta; confira a íntegra e a situação atual antes de citar.</p>'+l.map(freeze).join('<hr>'); }
  else if(kind==='txtdoc'){ let d=$('.txdoc'); if(!d) return; d=d.cloneNode(true); d.querySelectorAll('label.f').forEach(e=>e.remove()); html='<h1>Texto legal — consulta</h1><p class="meta">Reprodução para consulta, emitida em '+hoje()+'. Confira a redação na fonte oficial antes de citar.</p>'+freeze(d); }
  else if(kind==='peric'){ html='<h1>Periculosidade — NR-16</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pperic')); }
  const root=$('#printroot');
  const TB=timbradoPara(ori);
  root.innerHTML=(TB.img?'<img class="lh" alt="" src="'+TB.img+'">':'')+'<table class="pwrap'+(TB.simples?' simples':'')+'"><thead><tr><td><div class="sp-top">'+(TB.simples?cabecalhoSimples():'')+'</div></td></tr></thead><tbody>'+splitRows(html)+(kind==='caso'?'<tr><td class="pbody">'+blocoAssinatura()+'</td></tr>':'')+'<tr><td class="pbody"><p class="disc">Documento elaborado com o apoio do Caracterizador Pericial (Grahl Consultoria e Treinamentos). Ferramenta de apoio técnico: não substitui a análise do caso concreto nem a redação oficial das normas; a conclusão é de responsabilidade do profissional que assina.</p></td></tr></tbody><tfoot><tr><td><div class="sp-bot"></div></td></tr></tfoot></table>';
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

/* ---------- casos: abrir, novo, duplicar, excluir, exportar, importar ---------- */
function avisar(msg){ let t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.setAttribute('role','status'); document.body.appendChild(t); } t.textContent=msg; t.classList.add('on'); clearTimeout(avisar._t); avisar._t=setTimeout(()=>t.classList.remove('on'),4200); }
const dataBR = iso => { const d=iso?new Date(iso):null; return d&&!isNaN(d)?d.toLocaleDateString('pt-BR'):''; };
function casebar(){
  const l=casosOrdenados();
  return '<section class="casebar panel" aria-label="Meus casos"><label class="f grow" for="c-sel"><span>Meus casos ('+l.length+')</span><select id="c-sel" data-casesel="1">'+
   l.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===DB.ativo?' selected':'')+'>'+esc(c.nome||'Caso sem nome')+' · '+c.rows.length+' período(s)'+(c.alterado?' · '+dataBR(c.alterado):'')+'</option>').join('')+
   '</select></label><div class="btns"><button class="ghost sm" data-cs="novo">Novo caso</button><button class="ghost sm" data-cs="dup">Duplicar</button><button class="ghost sm" data-cs="exp">Exportar caso</button><button class="ghost sm" data-cs="imp">Importar</button><button class="ghost sm danger" data-cs="del">Excluir caso</button></div>'+
   '<p class="fine">Os casos ficam salvos só neste navegador; nada é enviado a servidor. Exporte para guardar uma cópia ou abrir em outro computador.</p></section>';
}
function abrirCaso(id){ if(!DB.casos[id]) return; DB.ativo=id; S.caso=DB.casos[id]; persist(); render(); }
function novoCaso(base){ const id=novoId(); DB.casos[id]=Object.assign(limpaCaso(base||{nome:'Novo caso',sexo:'H',rows:[]}),{id,alterado:agora()}); abrirCaso(id); avisar('Caso criado: '+DB.casos[id].nome); }
function duplicarCaso(){ const c=JSON.parse(JSON.stringify(S.caso)); c.nome=(c.nome||'Caso')+' (cópia)'; novoCaso(c); }
function excluirCaso(){ const nome=S.caso.nome; delete DB.casos[DB.ativo]; const l=casosOrdenados(); if(l.length){ DB.ativo=l[0].id; S.caso=l[0]; persist(); render(); avisar('Caso excluído: '+nome); } else { DB.ativo=null; novoCaso(); } }
function baixar(nome, obj){ const blob=new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),2000); }
const nomeArq = s => String(s||'caso').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'caso';
const PACOTE = (tipo, extra) => Object.assign({app:'caracterizador-pericial', formato:1, tipo, exportado:agora()}, extra);
function exportarCaso(){ baixar('caso-'+nomeArq(S.caso.nome)+'.json', PACOTE('casos',{casos:[S.caso]})); }
function exportarTudo(){ baixar('caracterizador-backup-'+agora().slice(0,10)+'.json', PACOTE('backup',{casos:casosOrdenados(), perfil:perfilSemImagens(), favoritos:FAV})); }
function importarArquivo(file){
  const rd=new FileReader();
  rd.onload=()=>{ try{
      const o=JSON.parse(rd.result);
      const lista = Array.isArray(o.casos)?o.casos : (o.caso?[o.caso] : (Array.isArray(o.rows)?[o]:null));
      if(!lista||!lista.length) throw new Error('arquivo sem casos');
      let primeiro=null;
      lista.forEach(c=>{ const id=(c.id&&!DB.casos[c.id])?c.id:novoId(); DB.casos[id]=Object.assign(limpaCaso(JSON.parse(JSON.stringify(c))),{id,alterado:c.alterado||agora()}); primeiro=primeiro||id; });
      if(o.tipo==='backup'&&o.favoritos&&typeof o.favoritos==='object'){ FAV=Object.assign({},FAV,o.favoritos); salvarFav(); }
      if(o.tipo==='backup'&&o.perfil&&typeof o.perfil==='object'){ const p=perfil(); PERFIL=Object.assign({},o.perfil,{a4v:p.a4v||'',a4h:p.a4h||''}); salvarPerfil(); }
      DB.ativo=primeiro; S.caso=DB.casos[primeiro]; persist(); render();
      avisar(lista.length+(lista.length>1?' casos importados.':' caso importado.'));
    }catch(e){ avisar('Arquivo inválido: use um arquivo exportado pelo Caracterizador Pericial (.json).'); } };
  rd.readAsText(file);
}

/* ---------- perfil do profissional (aparece nos relatórios) ---------- */
let PERFIL={};
try{ PERFIL=JSON.parse(localStorage.getItem(STORE_PERFIL)||'{}')||{}; }catch(e){ PERFIL={}; }
const perfil = () => PERFIL;
function salvarPerfil(){ try{ localStorage.setItem(STORE_PERFIL, JSON.stringify(PERFIL)); return true; }catch(e){ avisar('Não foi possível salvar o perfil: a imagem do timbrado é grande demais para o navegador. Use uma imagem menor.'); return false; } }
function perfilSemImagens(){ const p=Object.assign({},PERFIL); delete p.a4v; delete p.a4h; return p; }
const PROFISSOES=['Engenheiro(a) de Segurança do Trabalho','Médico(a) do Trabalho','Advogado(a)','Técnico(a) de Segurança do Trabalho','Higienista ocupacional','Outro'];
function assinaturaTxt(){ const p=PERFIL; return [p.nome, [p.prof,p.registro].filter(Boolean).join(' · ')].filter(Boolean); }
function pf(id,rot,ph,tipo){ return '<label class="f" for="pf-'+id+'"><span>'+rot+'</span><input id="pf-'+id+'" type="'+(tipo||'text')+'" data-pf="'+id+'" value="'+esc(PERFIL[id]||'')+'" placeholder="'+esc(ph||'')+'"></label>'; }
function renderPerfil(){
  const p=PERFIL, tb=p.timbrado||'grahl', nCasos=Object.keys(DB.casos).length;
  const img=(k,rot,dica)=>'<div class="tbimg"><span class="small"><b>'+rot+'</b> · '+dica+'</span>'+(p[k]?'<img alt="Prévia do timbrado" src="'+p[k]+'"><button class="ghost sm" data-pfdel="'+k+'">Remover</button>':'<label class="ghost sm filebtn" for="pf-'+k+'">Escolher imagem<input id="pf-'+k+'" type="file" accept="image/png,image/jpeg" data-pfimg="'+k+'"></label>')+'</div>';
  return '<section class="intro"><div><p class="eyebrow">Configuração</p><h2>Perfil e dados</h2><p class="muted">Seus dados aparecem no cabeçalho e na assinatura dos relatórios impressos. Tudo fica salvo só neste navegador.</p></div></section>'+
  '<div class="grid2"><section class="panel"><div class="ph"><h3>Profissional responsável</h3></div><div class="fields">'+
   pf('nome','Nome completo','Ex.: Maria da Silva')+
   '<label class="f" for="pf-prof"><span>Profissão</span><select id="pf-prof" data-pf="prof"><option value="">Escolha</option>'+PROFISSOES.map(x=>'<option'+(p.prof===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
   pf('registro','Registro profissional','Ex.: CREA-PR 123456/D, CRM-SP 12345, OAB/PR 12.345')+
   pf('contato','Contato','E-mail ou telefone')+pf('cidade','Cidade/UF','Ex.: Londrina/PR')+
  '</div><div class="ph"><h3>Timbrado dos relatórios</h3></div><fieldset class="fr"><legend class="sr">Timbrado</legend>'+
   [['grahl','Timbrado padrão do Caracterizador'],['proprio','Meu timbrado (imagem)'],['simples','Cabeçalho simples com meus dados']].map(([k,t])=>'<label class="cb" for="tb-'+k+'"><input type="radio" name="tb" id="tb-'+k+'" data-pf="timbrado" value="'+k+'"'+(tb===k?' checked':'')+'><span>'+t+'</span></label>').join('')+'</fieldset>'+
   (tb==='proprio'?'<div class="tbimgs">'+img('a4v','A4 em pé','usado nas fichas e consultas')+img('a4h','A4 deitado','usado no relatório do caso')+'</div><p class="fine">Use a página A4 inteira (cabeçalho em cima, rodapé embaixo e o meio em branco), em PNG ou JPG. A imagem é reduzida para caber no navegador.</p>':'')+
   '<div class="sigprev"><span class="small">Assinatura nos relatórios</span><b>'+(assinaturaTxt().map(esc).join('<br>')||'— preencha nome, profissão e registro —')+'</b></div>'+
  '<div class="ph"><h3>Favoritos e anotações</h3></div>'+favoritosPerfil()+
  '</section><aside class="panel"><div class="ph"><h3>Meus dados</h3></div><p class="small">'+nCasos+(nCasos>1?' casos salvos':' caso salvo')+' neste navegador.</p>'+
   '<div class="btns col"><button class="ghost" data-cs="backup">Baixar backup completo</button><label class="ghost filebtn" for="pf-restore">Restaurar backup<input id="pf-restore" type="file" accept=".json,application/json" data-pfrestore="1"></label><button class="ghost danger" data-cs="wipe">Apagar todos os meus dados</button></div>'+
   '<p class="fine">O backup inclui todos os casos, o perfil (sem as imagens do timbrado) e os favoritos com anotações. Apagar remove casos, perfil e preferências deste navegador, sem possibilidade de recuperação.</p>'+
   '<div class="ph"><h3>Usar sem internet</h3></div>'+instalarHtml()+'<div class="ph"><h3>Ajuda</h3></div><button class="ghost" data-tour="0">Ver o tutorial de boas-vindas</button>'+'<div class="ph"><h3>Documentos</h3></div><ul class="blist"><li><a href="termos.html" target="_blank" rel="noopener">Termos de uso ↗</a></li><li><a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade ↗</a></li></ul>'+
   (p.aceite?'<p class="fine">Termos aceitos em '+dataBR(p.aceite.data)+' (versão '+esc(p.aceite.versao)+').</p>':'')+
  '</aside></div>';
}
function reduzImagem(file, larguraMax, cb){
  if(!/^image\/(png|jpeg)$/.test(file.type)){ avisar('Use uma imagem PNG ou JPG.'); return; }
  const rd=new FileReader();
  rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const k=Math.min(1,larguraMax/im.width), c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height); cb(c.toDataURL('image/jpeg',0.82)); }; im.onerror=()=>avisar('Não foi possível ler a imagem.'); im.src=rd.result; };
  rd.readAsDataURL(file);
}
/* timbrado e cabeçalho usados na impressão */
function timbradoPara(ori){
  const p=PERFIL;
  if(p.timbrado==='proprio'){ const src= ori==='landscape' ? (p.a4h||'') : (p.a4v||''); return {img:src, simples:!src}; }
  if(p.timbrado==='simples') return {img:'', simples:true};
  return {img: ori==='landscape'?BRAND.a4h:BRAND.a4v, simples:false};
}
function cabecalhoSimples(){ const l=assinaturaTxt(); const p=PERFIL; const linha=[p.contato,p.cidade].filter(Boolean).join(' · '); return '<div class="phead"><b>'+esc(l[0]||'Caracterizador Pericial')+'</b>'+(l[1]?'<span>'+esc(l[1])+'</span>':'')+(linha?'<span>'+esc(linha)+'</span>':'')+'</div>'; }
function blocoAssinatura(){ const l=assinaturaTxt(); if(!l.length) return ''; return '<div class="assin"><div class="linha"></div>'+l.map(esc).join('<br>')+(PERFIL.cidade?'<br><small>'+esc(PERFIL.cidade)+', '+hoje()+'</small>':'')+'</div>'; }

/* ---------- aceite dos termos (primeiro acesso) ---------- */
const TERMOS_VERSAO='2026-11';
function avisoTermos(){
  if(PERFIL.aceite&&PERFIL.aceite.versao===TERMOS_VERSAO) return;
  const d=document.createElement('div'); d.id='termos'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Termos de uso');
  d.innerHTML='<div class="wrap"><p>O Caracterizador Pericial é uma ferramenta de apoio técnico. Os resultados não substituem a análise do caso concreto nem o juízo do profissional que assina o laudo ou a peça. Os dados que você digita ficam só neste navegador. Ao continuar, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</p><button data-cs="aceito">Concordo</button></div>';
  document.body.appendChild(d);
}

document.addEventListener('change', ev=>{
  const t=ev.target;
  if(t.dataset.casesel){ abrirCaso(t.value); return; }
  if(t.id==='c-file'&&t.files&&t.files[0]){ importarArquivo(t.files[0]); t.value=''; return; }
  if(t.dataset.pfrestore&&t.files&&t.files[0]){ importarArquivo(t.files[0]); t.value=''; return; }
  if(t.dataset.pfimg&&t.files&&t.files[0]){ const k=t.dataset.pfimg; reduzImagem(t.files[0], k==='a4h'?1754:1240, url=>{ const ant=PERFIL[k]; PERFIL[k]=url; if(!salvarPerfil()){ PERFIL[k]=ant; } render(); }); return; }
  if(t.dataset.pf){ PERFIL[t.dataset.pf]=t.value; salvarPerfil(); if(t.dataset.pf==='timbrado'||t.dataset.pf==='prof') render(); return; }
});
document.addEventListener('input', ev=>{ const t=ev.target; if(t.dataset.pf&&t.tagName==='INPUT'&&t.type==='text'){ PERFIL[t.dataset.pf]=t.value; salvarPerfil(); const s=document.querySelector('.sigprev b'); if(s) s.innerHTML=assinaturaTxt().map(esc).join('<br>')||'— preencha nome, profissão e registro —'; } });
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-cs],[data-pfdel]'); if(!b) return;
  if(b.dataset.pfdel){ delete PERFIL[b.dataset.pfdel]; salvarPerfil(); render(); return; }
  const k=b.dataset.cs;
  if(k==='novo') novoCaso();
  else if(k==='dup') duplicarCaso();
  else if(k==='exp') exportarCaso();
  else if(k==='imp'){ let f=document.getElementById('c-file'); if(!f){ f=document.createElement('input'); f.type='file'; f.id='c-file'; f.accept='.json,application/json'; f.hidden=true; document.body.appendChild(f); } f.click(); }
  else if(k==='backup') exportarTudo();
  else if(k==='aceito'){ PERFIL.aceite={versao:TERMOS_VERSAO, data:agora()}; salvarPerfil(); const d=document.getElementById('termos'); if(d) d.remove(); talvezTutorial(); }
  else if(k==='del'||k==='wipe'){
    if(!b.dataset.armed){ b.dataset.armed='1'; const orig=b.textContent; b.textContent= k==='del'?'Toque de novo para excluir':'Toque de novo para apagar tudo'; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.armed; b.textContent=orig; } },3500); return; }
    if(k==='del') excluirCaso();
    else { try{ [STORE,STORE_PERFIL,'caracterizador:v1','caracterizador:favoritos','caracterizador:novidades-vistas','caracterizador:recentes'].forEach(x=>localStorage.removeItem(x)); }catch(e){} location.reload(); }
  }
});

/* ---------- utilitários de consulta: copiar e destacar ---------- */
function copiar(txt, ok){
  const fim=()=>avisar(ok||'Copiado.');
  try{ if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(txt).then(fim,()=>copiarAntigo(txt,fim)); return; } }catch(e){}
  copiarAntigo(txt,fim);
}
function copiarAntigo(txt,fim){ const t=document.createElement('textarea'); t.value=txt; t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); fim(); }catch(e){ avisar('Não foi possível copiar automaticamente.'); } t.remove(); }
function destacar(id){ const el=document.getElementById(id); if(!el) return; el.classList.add('alvo'); el.scrollIntoView({block:'start'}); setTimeout(()=>el.classList.remove('alvo'),2600); }

/* ---------- Regra na data: o que valia numa data, agente por agente ---------- */
function marcosNaData(d){
  const L=[];
  L.push(d<='1995-04-28' ? ['Categoria profissional','Admitido o enquadramento por categoria (Decretos 53.831/64 e 83.080/79).'] : ['Categoria profissional','Só por exposição efetiva a agente nocivo (Lei 9.032/95, desde 29/04/1995).']);
  L.push(d<'1997-03-06' ? ['Lista de agentes','Quadros dos Decretos 53.831/64 e 83.080/79.'] : ['Lista de agentes','Anexo IV do Decreto 2.172/97 e, desde 07/05/1999, do Decreto 3.048/99.']);
  if(d>='1996-10-14') L.push(['Laudo técnico','Formulário emitido com base em laudo técnico (MP 1.523/96, desde 14/10/1996).']);
  L.push(d>='1998-12-03' ? ['EPI','A informação de EPI eficaz é considerada (Lei 9.732/98; STJ, Tema 1090), exceto para ruído (STF, Tema 555) e cancerígenos da LINACH.'] : ['EPI','Informação de EPI não é considerada para períodos até 02/12/1998.']);
  L.push(d<'2004-01-01' ? ['Formulário','Formulários anteriores ao PPP (SB-40, DISES BE 5235, DSS-8030, DIRBEN-8030).'] : d<'2023-01-01' ? ['Formulário','PPP em papel (obrigatório desde 01/01/2004).'] : ['Formulário','PPP eletrônico pelo eSocial (evento S-2240), desde 01/01/2023.']);
  L.push(d<='2019-11-13' ? ['Conversão em tempo comum','Permitida (fatores do art. 70 do Decreto 3.048/99).'] : ['Conversão em tempo comum','Vedada para períodos após 13/11/2019 (EC 103/2019, art. 25, §2º).']);
  if(d>='2013-10-17') L.push(['Cancerígenos',d<'2020-07-01'?'Grupo 1 da LINACH: avaliação qualitativa; EPI não descaracteriza (Decreto 8.123/13).':'Grupo 1 da LINACH: avaliação qualitativa; medidas de controle que eliminem a nocividade podem descaracterizar (Decreto 10.410/20).']);
  return L;
}
function renderRegraData(){
  const d=S.dt||new Date().toISOString().slice(0,10);
  const grupos=[...new Set(AGENTS.map(a=>a.grupo))];
  let h='<section class="intro"><div><p class="eyebrow">Consulta por data</p><h2>Qual regra valia em '+brData(d)+'?</h2><p class="muted">Escolha uma data para ver, agente por agente, a norma e o critério do período, além dos marcos gerais que valiam naquele dia. É uma consulta à legislação: a análise do caso concreto continua com o profissional.</p></div></section>'+
   '<div class="libbar"><label class="f" for="rd-data"><span>Data</span><input id="rd-data" type="date" data-rd="1" value="'+d+'" min="1960-01-01"></label><div class="btns">'+[['1996-12-31','31/12/1996'],['2000-06-30','30/06/2000'],['2003-12-01','01/12/2003'],['2015-06-30','30/06/2015'],['2021-06-30','30/06/2021']].map(([v,t])=>'<button class="ghost sm" data-rdset="'+v+'">'+t+'</button>').join('')+'</div></div>'+
   linhaTempoHtml(d)+'<section class="panel"><div class="ph"><h3>Marcos gerais em '+brData(d)+'</h3></div><dl class="dl16 small">'+marcosNaData(d).map(([k,t])=>'<dt>'+esc(k)+'</dt><dd>'+esc(t)+'</dd>').join('')+'</dl></section>';
  grupos.forEach(g=>{
    h+='<section class="panel rdg"><div class="ph"><h3>'+esc(g)+'</h3></div><div class="tscroll"><table class="rt"><thead><tr><th>Agente</th><th>Norma do período</th><th>Critério</th></tr></thead><tbody>'+
     AGENTS.filter(a=>a.grupo===g).map(a=>{ const r=regraNaData(a,d); return '<tr><td><a href="#aposentadoria/agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a></td>'+(r.length?'<td>'+r.map(p=>esc(p[1])+'<small>'+esc(p[0])+'</small>').join('')+'</td><td>'+r.map(p=>esc(p[2])).join('<br>')+'</td>':'<td colspan="2" class="muted">Sem regra própria registrada para esta data; veja a ficha.</td>')+'</tr>'; }).join('')+
     '</tbody></table></div></section>';
  });
  return h+'<p class="fine">Datas-limite conforme as fichas dos agentes. Situações de transição e divergências entre o critério do INSS e o técnico estão detalhadas em cada ficha.</p>';
}
document.addEventListener('change', ev=>{ const t=ev.target; if(t.dataset.rd&&t.value){ S.dt=t.value; render(); const el=document.getElementById('rd-data'); if(el) el.focus(); } });
document.addEventListener('click', ev=>{ const b=ev.target.closest('[data-rdset]'); if(b){ S.dt=b.dataset.rdset; render(); } });

/* ---------- Novidades da base ---------- */
const NOV_OK = typeof NOVIDADES!=='undefined' ? NOVIDADES.slice().sort((x,y)=>y.data.localeCompare(x.data)) : [];
const AREA_ROT={prev:'Previdenciário', trab:'Trabalhista', ambos:'Previdenciário e trabalhista'};
/* novidades desde a última visita: a data da última novidade vista fica no navegador */
const STORE_VISTO='caracterizador:novidades-vistas';
let NOV_VISTO=null; try{ NOV_VISTO=localStorage.getItem(STORE_VISTO); }catch(e){}
if(NOV_VISTO===null&&NOV_OK.length){ NOV_VISTO=NOV_OK[0].data; try{ localStorage.setItem(STORE_VISTO,NOV_VISTO); }catch(e){} } /* primeiro acesso: nada aparece como novo */
const novaDesdeVisita = n => NOV_VISTO!==null && n.data > NOV_VISTO;
const NOV_NOVAS = () => NOV_OK.filter(novaDesdeVisita);
function marcarNovidadesVistas(){ if(!NOV_OK.length) return; NOV_VISTO=NOV_OK[0].data; try{ localStorage.setItem(STORE_VISTO,NOV_VISTO); }catch(e){} faixaNovidades(); if(S.tab==='inicio') render(); }
function faixaNovidades(){
  const el=document.getElementById('novfaixa'); if(!el) return; const n=NOV_NOVAS().length;
  if(!n){ el.hidden=true; el.innerHTML=''; return; }
  el.hidden=false; el.innerHTML='<div class="novfaixa"><span><b>'+n+(n>1?' novidades':' novidade')+' na base</b> desde a sua última visita (última atualização vista: '+brData(NOV_VISTO)+').</span><span class="btns"><button class="ghost sm" data-novver="1">Ver novidades</button><button class="ghost sm" data-novok="1">Marcar como vistas</button></span></div>';
}
document.addEventListener('click', ev=>{
  if(ev.target.closest('[data-novok]')){ marcarNovidadesVistas(); avisar('Novidades marcadas como vistas.'); return; }
  if(ev.target.closest('[data-novver]')){ if(S.tab!=='inicio') location.hash='inicio'; setTimeout(()=>{ const s=document.querySelector('.novs'); if(s){ const d=s.querySelector('details'); if(d) d.open=true; s.scrollIntoView({block:'start'}); } },80); }
});
function novItem(n){ const nova=novaDesdeVisita(n); return '<li class="nov'+(nova?' nova':'')+'">'+(nova?'<span class="chip st-E">Novo</span>':'')+'<span class="small">'+esc(AREA_ROT[n.area]||'')+(n.evento&&n.evento!=='—'?' · fato em '+esc(n.evento):'')+'</span><b>'+esc(n.titulo)+'</b><span>'+esc(n.resumo)+'</span>'+(n.ir?'<button class="linkbtn small" data-go="'+esc(n.ir)+'">Consultar →</button>':'')+'</li>'; }
function novidadesHtml(){
  if(!NOV_OK.length) return '';
  const ult=NOV_OK[0].data, ini=NOV_OK.slice(0,4), resto=NOV_OK.slice(4);
  const nn=NOV_NOVAS().length;
  return '<section class="isec panel novs" id="novidades"><div class="ihead"><h2 class="ih">Novidades na base</h2><p class="ilead">Atualizado em '+brData(ult)+'. Normas e decisões que entraram no app, com o caminho para consultar.'+(nn?' <b>'+nn+' nova(s) desde a sua última visita.</b> <button class="linkbtn" data-novok="1">Marcar como vistas</button>':'')+'</p></div><ul class="novl">'+ini.map(novItem).join('')+'</ul>'+(resto.length?'<details><summary>Ver mais '+resto.length+' novidade(s)</summary><ul class="novl">'+resto.map(novItem).join('')+'</ul></details>':'')+'</section>';
}

/* ---------- favoritos e anotações pessoais (ficam só no navegador) ---------- */
/* ---------- Consultados recentemente (só neste navegador) ---------- */
const STORE_REC='caracterizador:recentes', REC_MAX=10;
let REC=[]; try{ REC=JSON.parse(localStorage.getItem(STORE_REC)||'[]'); if(!Array.isArray(REC)) REC=[]; }catch(e){ REC=[]; }
function chaveAtual(){
  if(S.tab==='aposentadoria'&&S.ap==='agentes') return 'ag:'+S.ag;
  if(S.tab==='insalubridade') return 'a15:'+S.a15;
  if(S.tab==='periculosidade') return 'a16:'+S.a16;
  if(S.tab==='funcao'&&S.fsel!=null&&FUNCOES[S.fsel]) return 'funcao:'+S.fsel;
  if((S.tab==='teses'||(S.tab==='biblioteca'&&S.libv==='textos'))&&S.alvo) return S.alvo;
  return '';
}
function registrarVisto(){
  const key=chaveAtual(); if(!key) return;
  const b=[...document.querySelectorAll('#main [data-fav]')].find(x=>x.dataset.fav===key); if(!b) return;
  if(REC[0]&&REC[0].key===key) return;
  REC=[{key, titulo:b.dataset.favt}].concat(REC.filter(r=>r.key!==key)).slice(0,REC_MAX);
  try{ localStorage.setItem(STORE_REC, JSON.stringify(REC)); }catch(e){}
}
function recentesInicio(){
  if(!REC.length) return '';
  return '<section class="isec panel recs"><div class="ihead"><h2 class="ih">Consultados recentemente</h2><p class="ilead">As últimas fichas, anexos, teses e textos que você abriu neste navegador. <button class="linkbtn" data-reclimpar="1">Limpar</button></p></div><ul class="recl">'+
   REC.map(r=>'<li><button class="linkbtn" data-go="'+esc(r.key)+'"><span class="chip st-I">'+FAV_TIPO(r.key)+'</span> '+esc(String(r.titulo).replace(/^Função: /,'').replace(/ — ficha do agente$/,'').replace(/^NR-1[56], /,''))+'</button></li>').join('')+'</ul></section>';
}
document.addEventListener('click', ev=>{ if(ev.target.closest('[data-reclimpar]')){ REC=[]; try{ localStorage.removeItem(STORE_REC); }catch(e){} render(); } });

const STORE_FAV='caracterizador:favoritos';
let FAV={}; try{ FAV=JSON.parse(localStorage.getItem(STORE_FAV)||'{}')||{}; }catch(e){ FAV={}; }
function salvarFav(){ try{ localStorage.setItem(STORE_FAV, JSON.stringify(FAV)); }catch(e){ avisar('Não foi possível salvar os favoritos no navegador.'); } }
function favBtn(key, titulo){ const on=!!FAV[key]; return '<button class="ghost sm fav'+(on?' on':'')+'" data-fav="'+esc(key)+'" data-favt="'+esc(titulo)+'" aria-pressed="'+on+'" title="'+(on?'Remover dos favoritos':'Guardar nos favoritos')+'">'+(on?'★ Favorito':'☆ Favoritar')+'</button>'; }
function favLista(){ return Object.entries(FAV).map(([k,v])=>Object.assign({key:k},v)).sort((x,y)=>String(y.data||'').localeCompare(String(x.data||''))); }
const FAV_TIPO = k => ({ag:'Agente', tese:'Tese', a15:'NR-15', a16:'NR-16', funcao:'Função', txt:'Texto legal'}[k.split(':')[0]]||'Item');
function favoritosInicio(){
  const l=favLista(); if(!l.length) return '';
  return '<section class="isec panel favs"><div class="ihead"><h2 class="ih">Meus favoritos</h2><p class="ilead">Atalhos para o que você mais consulta. As anotações ficam só neste navegador; edite-as em <a href="#perfil">Perfil e dados</a>.</p></div><ul class="favl">'+
   l.slice(0,8).map(f=>'<li><span class="chip st-I">'+FAV_TIPO(f.key)+'</span><button class="linkbtn" data-go="'+esc(f.key)+'">'+esc(f.titulo)+'</button>'+(f.nota?'<span class="small">'+esc(f.nota.length>140?f.nota.slice(0,140)+'…':f.nota)+'</span>':'')+'</li>').join('')+'</ul>'+(l.length>8?'<p class="fine">e mais '+(l.length-8)+' em Perfil e dados.</p>':'')+'</section>';
}
function favoritosPerfil(){
  const l=favLista();
  if(!l.length) return '<p class="small">Nenhum favorito ainda. Use o botão "☆ Favoritar" nas fichas de agentes, nas teses e nos anexos da NR-15 e da NR-16.</p>';
  return '<ul class="favl edit">'+l.map(f=>'<li><div class="favh"><span class="chip st-I">'+FAV_TIPO(f.key)+'</span><button class="linkbtn" data-go="'+esc(f.key)+'">'+esc(f.titulo)+'</button><button class="ghost sm" data-favdel="'+esc(f.key)+'">Remover</button></div><label class="f" for="fn-'+esc(f.key.replace(':','-'))+'"><span>Minha anotação</span><textarea id="fn-'+esc(f.key.replace(':','-'))+'" rows="2" data-favnota="'+esc(f.key)+'" placeholder="Ex.: usar no quesito 3; conferir embargos">'+esc(f.nota||'')+'</textarea></label></li>').join('')+'</ul>';
}
function atualizarBotoesFav(key){ document.querySelectorAll('[data-fav]').forEach(b=>{ if(b.dataset.fav===key){ const tmp=document.createElement('div'); tmp.innerHTML=favBtn(key,b.dataset.favt); b.replaceWith(tmp.firstChild); } }); }
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-fav],[data-favdel]'); if(!b) return;
  if(b.dataset.favdel){ delete FAV[b.dataset.favdel]; salvarFav(); render(); avisar('Removido dos favoritos.'); return; }
  const k=b.dataset.fav;
  if(FAV[k]){ delete FAV[k]; avisar('Removido dos favoritos.'); } else { FAV[k]={titulo:b.dataset.favt, nota:'', data:agora()}; avisar('Guardado nos favoritos. Anotações em Perfil e dados.'); }
  salvarFav(); atualizarBotoesFav(k);
});
document.addEventListener('input', ev=>{ const t=ev.target; if(t.dataset.favnota&&FAV[t.dataset.favnota]){ FAV[t.dataset.favnota].nota=t.value; salvarFav(); } });

/* ---------- ajuda: "Como usar esta tela" e tutorial de primeiro acesso ---------- */
const TUTORIAL_VERSAO='2026-11';
function ajudaChave(){ return S.tab==='aposentadoria' ? 'aposentadoria/'+(S.ap||'agentes') : S.tab; }
function ajudaHtml(){
  if(typeof AJUDA_TELA==='undefined') return '';
  const l=AJUDA_TELA[ajudaChave()]; if(!l) return '';
  return '<details class="ajuda"><summary>Como usar esta tela</summary><ul>'+l.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><button class="linkbtn small" data-tour="0">Ver o tutorial de boas-vindas</button></details>';
}
function abrirTutorial(i){
  if(typeof TUTORIAL==='undefined') return;
  let d=document.getElementById('tutorial');
  if(!d){ d=document.createElement('div'); d.id='tutorial'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label','Tutorial de boas-vindas'); document.body.appendChild(d); }
  const p=TUTORIAL[i], ult=i===TUTORIAL.length-1;
  d.innerHTML='<div class="tut"><p class="eyebrow">Boas-vindas · passo '+(i+1)+' de '+TUTORIAL.length+'</p><h2>'+esc(p.t)+'</h2><p>'+esc(p.d)+'</p><div class="tutdots">'+TUTORIAL.map((_,k)=>'<span class="'+(k===i?'on':'')+'"></span>').join('')+'</div><div class="btns"><button class="ghost" data-tutfim="1">Pular</button>'+(i>0?'<button class="ghost" data-tutir="'+(i-1)+'">Anterior</button>':'')+'<button data-tut'+(ult?'fim':'ir')+'="'+(ult?'1':i+1)+'">'+(ult?'Começar a usar':'Próximo')+'</button></div></div>';
  const bt=d.querySelector('[data-tutir="'+(i+1)+'"],[data-tutfim]:last-child'); if(bt) bt.focus();
}
function fecharTutorial(){ const d=document.getElementById('tutorial'); if(d) d.remove(); PERFIL.tour=TUTORIAL_VERSAO; salvarPerfil(); }
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-tour],[data-tutir],[data-tutfim]'); if(!b) return;
  if(b.dataset.tour!==undefined) abrirTutorial(0);
  else if(b.dataset.tutir!==undefined) abrirTutorial(+b.dataset.tutir);
  else fecharTutorial();
});
document.addEventListener('keydown', ev=>{ if(ev.key==='Escape'&&document.getElementById('tutorial')) fecharTutorial(); });
function talvezTutorial(){ if(PERFIL.aceite&&PERFIL.tour!==TUTORIAL_VERSAO) abrirTutorial(0); }

/* ---------- Comparar agentes lado a lado ---------- */
const CMP_PADRAO=['ruido','calor',''];
const ERAS=['até 05/03/1997','06/03/1997–18/11/2003','19/11/2003–13/11/2019','após 13/11/2019'];
function renderComparar(){
  const sel=(S.cmpAg||CMP_PADRAO).slice(0,3); while(sel.length<3) sel.push('');
  const ags=sel.map(id=>AGENTS.find(a=>a.id===id)).filter(Boolean);
  const opts=v=>'<option value="">— nenhum —</option>'+[...new Set(AGENTS.map(a=>a.grupo))].map(g=>'<optgroup label="'+esc(g)+'">'+AGENTS.filter(a=>a.grupo===g).map(a=>'<option value="'+a.id+'"'+(a.id===v?' selected':'')+'>'+esc(a.nome)+'</option>').join('')+'</optgroup>').join('');
  let h='<section class="intro"><div><p class="eyebrow">Consulta comparada</p><h2>Comparar agentes</h2><p class="muted">Escolha até três agentes para ver, lado a lado, códigos, tempo, regra de cada período, critério do INSS, nota do especialista, teses e o anexo correspondente da NR-15. Útil quando a mesma função tem mais de um agente.</p></div></section>'+
   '<div class="libbar cmpsel">'+sel.map((v,i)=>'<label class="f" for="cmp-'+i+'"><span>Agente '+(i+1)+'</span><select id="cmp-'+i+'" data-cmpag="'+i+'">'+opts(v)+'</select></label>').join('')+'</div>';
  if(ags.length<2) return h+'<p class="empty">Escolha pelo menos dois agentes.</p>';
  const lista=l=>'<ul>'+l.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  const linhas=[
   ['Grupo e tempo', a=>esc(a.grupo)+' · <b>'+a.tempo+' anos</b>'],
   ['Códigos', a=>[a.c53.length?'53.831: '+a.c53.join(', '):'', a.c83.length?'83.080: '+a.c83.join(', '):'', a.cIV?'Anexo IV: '+a.cIV:'Fora do Anexo IV'].filter(Boolean).map(esc).join('<br>')],
   ['Tipo de avaliação por época', a=>'<ul class="eras">'+ERAS.map((e,k)=>'<li><small>'+e+'</small> <b class="mxc mx-'+MX[a.mx[k]][1]+'">'+(a.mx[k]==='X'&&MXX[a.id]?esc(MXX[a.id].rot):MX[a.mx[k]][0])+'</b></li>').join('')+'</ul>'],
   ['Regra por período', a=>'<ul>'+a.periodos.map(p=>'<li><small>'+esc(p[0])+'</small> '+esc(p[2])+'</li>').join('')+'</ul>'],
   ['Critério do INSS (IN 128/2022)', a=>lista(a.inss)],
   ['Nota do especialista', a=>lista(a.perito)],
   ['Teses aplicáveis', a=>{ const j=(a.juris||[]).map(x=>x.slice(2)).filter(k=>TESES[k]); return j.length?'<ul>'+j.map(k=>'<li><button class="linkbtn" data-go="tese:'+k+'">'+esc(TESES[k].trib+', '+TESES[k].num)+'</button> — '+esc(TESES[k].titulo)+(TESES[k].sit!=='firmada'?' <span class="sit sit-'+TESES[k].sit+'">'+esc(sitRot(TESES[k]))+'</span>':'')+'</li>').join('')+'</ul>':'<span class="muted">—</span>'; }],
   ['NR-15 (insalubridade)', a=>{ const m=String(a.nr15||'').match(/Anexos? (\d+[A-Z-]*)/); return esc(a.nr15||'—')+(m?' <button class="linkbtn" data-go="a15:'+m[1]+'">abrir</button>':''); }],
   ['Ficha completa', a=>'<button class="ghost sm" data-ag="'+a.id+'">Abrir ficha</button> '+favBtn('ag:'+a.id,a.nome+' — ficha do agente')]
  ];
  h+='<div class="tscroll"><table class="rt cmpag"><thead><tr><th></th>'+ags.map(a=>'<th>'+esc(a.nome)+'</th>').join('')+'</tr></thead><tbody>'+
   linhas.map(([rot,f])=>'<tr><th scope="row">'+rot+'</th>'+ags.map(a=>'<td>'+f(a)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  return h+'<p class="fine">Comparação de normas e critérios, para consulta. Cada agente segue sua própria regra; a presença de mais de um agente não soma tempos nem muda o critério de cada um.</p>';
}
document.addEventListener('change', ev=>{ const t=ev.target; if(t.dataset.cmpag!==undefined){ const s=(S.cmpAg||CMP_PADRAO).slice(0,3); while(s.length<3) s.push(''); s[+t.dataset.cmpag]=t.value; S.cmpAg=s; render(); } });

/* ---------- Consulta por função ou atividade ---------- */
function renderFuncao(){
  const L=typeof FUNCOES!=='undefined'?FUNCOES:[]; const q=normTxt(S.fq||'');
  const vis=L.map((x,i)=>[x,i]).filter(([x])=>!q||normTxt(x.f+' '+(x.sin||[]).join(' ')+' '+x.obs).includes(q));
  const sel=Number.isInteger(S.fsel)&&L[S.fsel]?S.fsel:null;
  let h='<section class="intro"><div><p class="eyebrow">Consulta por função ou atividade</p><h2>Por função</h2><p class="muted">Escolha uma função para ver os agentes, os anexos da NR-15 e da NR-16 e as teses que costumam ser investigados nela.</p></div></section>'+
   '<div class="consulta-aviso" role="note"><b>Pontos a investigar, não enquadramento.</b> A mesma função pode ter exposições muito diferentes conforme a empresa, o processo e o período. O enquadramento depende da avaliação do posto de trabalho e da prova de cada caso.</div>'+
   '<div class="libbar"><label class="f grow" for="fq"><span>Pesquisar função ou atividade</span><input id="fq" type="search" data-fq="1" value="'+esc(S.fq||'')+'" placeholder="Ex.: soldador, motoboy, enfermagem, frigorífico, gari"></label></div>';
  h+='<div class="fgrid"><nav class="flist panel" aria-label="Funções">'+(vis.length?vis.map(([x,i])=>'<button class="fitem'+(i===sel?' on':'')+'" data-fsel="'+i+'" aria-current="'+(i===sel)+'">'+esc(x.f)+'</button>').join(''):'<p class="muted small">Nenhuma função encontrada. Tente um sinônimo ou use a pesquisa geral do topo.</p>')+'</nav>';
  if(sel===null) h+='<section class="panel"><p class="muted">Escolha uma função na lista.</p><p class="fine">'+L.length+' funções cadastradas. Sentiu falta de alguma? A lista é ampliada nas atualizações.</p></section>';
  else {
    const x=L[sel];
    const chips=(arr,fn)=>arr.length?'<div class="fchips">'+arr.map(fn).join('')+'</div>':'<p class="muted small">—</p>';
    const ag=x.ag.map(id=>AGENTS.find(a=>a.id===id)).filter(Boolean);
    const n15=x.nr15.map(n=>NR15.find(z=>String(z.n)===String(n))).filter(Boolean);
    const n16=x.nr16.map(id=>NR16.find(z=>z.id===id)).filter(Boolean);
    const ts=x.teses.filter(k=>TESES[k]);
    h+='<section class="panel ffun" id="ffun"><div class="ph"><div class="fhead"><p class="eyebrow">Função</p>'+favBtn('funcao:'+sel,'Função: '+x.f)+linkBtn('funcao:'+sel)+'</div><h3>'+esc(x.f)+'</h3>'+(x.sin&&x.sin.length?'<p class="small muted">Também: '+x.sin.map(esc).join(', ')+'</p>':'')+'</div>'+
     '<p>'+esc(x.obs)+'</p>'+
     '<h4>Aposentadoria especial — agentes a investigar</h4>'+chips(ag,a=>'<button class="ghost sm" data-ag="'+a.id+'">'+esc(a.nome)+'</button>')+
     '<h4>Insalubridade — anexos da NR-15</h4>'+chips(n15,z=>'<button class="ghost sm" data-go="a15:'+z.n+'">Anexo '+z.n+' · '+esc(z.t)+'</button>')+
     '<h4>Periculosidade — anexos da NR-16</h4>'+chips(n16,z=>'<button class="ghost sm" data-go="a16:'+z.id+'">'+esc(z.n)+' · '+esc(z.t)+'</button>')+
     '<h4>Teses relacionadas</h4>'+(ts.length?'<ul class="sm-list">'+ts.map(k=>'<li><button class="linkbtn" data-go="tese:'+k+'"><b>'+esc(TESES[k].trib+', '+TESES[k].num)+'</b></button> — '+esc(TESES[k].titulo)+(TESES[k].sit!=='firmada'?' <span class="sit sit-'+TESES[k].sit+'">'+esc(sitRot(TESES[k]))+'</span>':'')+'</li>').join('')+'</ul>':'<p class="muted small">—</p>')+
     (ag.length>=2?'<p><button class="ghost sm" data-fcmp="'+sel+'">Comparar estes agentes lado a lado</button></p>':'')+
    '</section>';
  }
  return h+'</div>';
}
document.addEventListener('input', ev=>{ const t=ev.target; if(t.dataset.fq){ S.fq=t.value; const pos=t.selectionStart; render(); const el=document.getElementById('fq'); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(e){} } } });
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-fsel],[data-fcmp]'); if(!b) return;
  if(b.dataset.fsel!==undefined){ S.fsel=+b.dataset.fsel; render(); if(window.innerWidth<760){ const p=document.getElementById('ffun'); if(p) p.scrollIntoView({block:'start'}); } }
  else { const x=FUNCOES[+b.dataset.fcmp]; S.cmpAg=x.ag.filter(id=>AGENTS.some(a=>a.id===id&&a.id!=='categoria')).slice(0,3); location.hash='aposentadoria/comparar'; }
});

/* ---------- Ver também: ligações entre agente, anexos e funções ---------- */
const ROMANO={I:1,II:2,III:3,IV:4,V:5,VI:6};
function anexosDoAgente(a){
  const txt=String(a.nr15||''), r15=new Set(), r16=new Set();
  txt.replace(/NR-16,\s*Anexo\s+([IVX]+)/g,(m,ro)=>{ if(ROMANO[ro]) r16.add('a'+ROMANO[ro]); return ''; }).replace(/\([^)]*\)/g,'')
     .replace(/Anexos?\s+((?:\d{1,2}(?:-A)?(?:\s*(?:,|e)\s*)?)+)/g,(m,lista)=>{ (lista.match(/\d{1,2}(?:-A)?/g)||[]).forEach(n=>{ if(NR15.some(x=>String(x.n)===n)) r15.add(n); }); return ''; });
  return {r15:[...r15], r16:[...r16]};
}
function verTambemHtml(key){
  const [k,v]=key.split(':'); const grupos=[];
  const fn=lista=>lista.map(i=>['funcao:'+i, FUNCOES[i].f]);
  const idxF=pred=>FUNCOES.map((x,i)=>pred(x)?i:-1).filter(i=>i>=0);
  if(k==='ag'){ const a=AGENTS.find(x=>x.id===v); if(!a) return ''; const an=anexosDoAgente(a);
    grupos.push(['Na NR-15', an.r15.map(n=>{ const x=NR15.find(y=>String(y.n)===n); return ['a15:'+n,'Anexo '+n+' — '+x.t]; })]);
    grupos.push(['Na NR-16', an.r16.map(id=>{ const x=NR16.find(y=>y.id===id); return x?['a16:'+id, x.n+' — '+x.t]:null; }).filter(Boolean)]);
    grupos.push(['Funções em que costuma ser investigado', fn(idxF(x=>(x.ag||[]).includes(v)))]); }
  else if(k==='a15'){ grupos.push(['Agentes da aposentadoria especial que remetem a este anexo', AGENTS.filter(a=>anexosDoAgente(a).r15.includes(String(v))).map(a=>['ag:'+a.id, a.nome])]);
    grupos.push(['Funções em que costuma ser investigado', fn(idxF(x=>(x.nr15||[]).map(String).includes(String(v))))]); }
  else if(k==='a16'){ grupos.push(['Agentes da aposentadoria especial relacionados', AGENTS.filter(a=>anexosDoAgente(a).r16.includes(v)).map(a=>['ag:'+a.id, a.nome])]);
    grupos.push(['Funções em que costuma ser investigado', fn(idxF(x=>(x.nr16||[]).includes(v)))]); }
  const g=grupos.filter(x=>x[1].length); if(!g.length) return '';
  return '<section class="vtb"><h3>Ver também</h3>'+g.map(([tit,l])=>'<div class="vtg"><p class="small muted">'+esc(tit)+'</p><div class="vtl">'+l.map(([go,t])=>'<button class="ghost sm" data-go="'+esc(go)+'">'+esc(t)+'</button>').join('')+'</div></div>').join('')+'<p class="fine">Ligações para orientar a consulta; cada área segue a sua própria norma e a exposição depende do caso.</p></section>';
}
const comVerTambem=(html,key)=>{ const vt=verTambemHtml(key); return vt&&/<\/article>\s*$/.test(html)?html.replace(/<\/article>\s*$/,vt+'</article>'):html+vt; };

/* ---------- Siglas do glossário explicadas no texto ---------- */
/* sigla no texto → termo do GLOSSARIO; só a primeira ocorrência de cada sigla por tela */
const SIGLAS={LTCAT:'LTCAT',PPP:'PPP',PGR:'PGR',LINACH:'LINACH',NHO:'NHO',NEN:'NEN',Lavg:'Lavg',IBUTG:'IBUTG',VCI:'VCI e VMB',VMB:'VCI e VMB',VDVR:'VDVR',EPI:'EPI e EPC',EPC:'EPI e EPC',SEP:'SEP e SEC',IRR:'IRR',PEDILEF:'PEDILEF',GFIP:'Código de ocorrência (GFIP/eSocial)'};
const RE_SIGLA=new RegExp('(^|[^\\wÀ-ÿ])('+Object.keys(SIGLAS).join('|')+')(?![\\wÀ-ÿ])');
function glDef(sigla){ const t=SIGLAS[sigla]; const g=typeof GLOSSARIO!=='undefined'&&GLOSSARIO.find(x=>x[0]===t); return g?{t:g[0],d:g[1]}:null; }
function marcarSiglas(){
  if(typeof GLOSSARIO==='undefined') return;
  const main=document.getElementById('main'); if(!main) return;
  const vistas=new Set(), nodes=[];
  const w=document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {acceptNode:n=>{
    const p=n.parentElement; if(!p||!RE_SIGLA.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
    return p.closest('a,button,input,textarea,select,option,label,h1,h2,h3,h4,summary,svg,th,code,.txart,.lit,.lt,.ajuda,.gl,.pt.lib,.chip,.mono')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT; }});
  while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n=>{
    let txt=n.nodeValue, frag=null, m, resto=txt;
    const parts=[];
    while((m=RE_SIGLA.exec(resto))){ const sig=m[2], ini=m.index+m[1].length; if(vistas.has(SIGLAS[sig])||!glDef(sig)){ parts.push(resto.slice(0,ini+sig.length)); resto=resto.slice(ini+sig.length); continue; }
      vistas.add(SIGLAS[sig]); parts.push(resto.slice(0,ini)); parts.push({sig}); resto=resto.slice(ini+sig.length); }
    if(!parts.some(x=>typeof x==='object')) return;
    parts.push(resto); frag=document.createDocumentFragment();
    parts.forEach(x=>{ if(typeof x==='string'){ if(x) frag.appendChild(document.createTextNode(x)); } else { const b=document.createElement('button'); b.type='button'; b.className='gl'; b.dataset.gl=x.sig; b.textContent=x.sig; b.title=glDef(x.sig).t+': '+glDef(x.sig).d; b.setAttribute('aria-label',x.sig+' — ver definição'); frag.appendChild(b); } });
    n.parentNode.replaceChild(frag,n);
  });
}
function fecharGl(){ const p=document.getElementById('glpop'); if(p) p.remove(); }
document.addEventListener('click', ev=>{
  const b=ev.target.closest('.gl'); if(ev.target.closest('#glpop')&&!ev.target.closest('[data-glver]')) return;
  if(ev.target.closest('[data-glver]')){ fecharGl(); S.q=ev.target.closest('[data-glver]').dataset.glver; S.lib='glossario'; S.libv='quadros'; location.hash='biblioteca'; return; }
  fecharGl(); if(!b) return;
  const g=glDef(b.dataset.gl); if(!g) return;
  const pop=document.createElement('div'); pop.id='glpop'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','Definição de '+g.t);
  pop.innerHTML='<b>'+esc(g.t)+'</b><p>'+esc(g.d)+'</p><button class="linkbtn" data-glver="'+esc(b.dataset.gl)+'">Ver no glossário</button>';
  document.body.appendChild(pop);
  const r=b.getBoundingClientRect(), pw=Math.min(340, window.innerWidth-24);
  pop.style.width=pw+'px'; pop.style.left=Math.max(12, Math.min(window.innerWidth-pw-12, r.left+window.scrollX))+'px'; pop.style.top=(r.bottom+window.scrollY+6)+'px';
});
document.addEventListener('keydown', ev=>{ if(ev.key==='Escape') fecharGl(); });
window.addEventListener('hashchange', fecharGl);

/* ---------- Textos legais navegáveis ---------- */
function docsTexto(){
  const fonteUrl=id=>((typeof FONTES!=='undefined'&&FONTES.find(x=>x.id===id))||{}).url||'#';
  const D=[];
  D.push({id:'lei8213', tit:'Lei 8.213/1991 — arts. 57 e 58', curto:'Lei 8.213/91', fonte:fonteUrl('lei8213'),
    nota:'Redação vigente, com as alterações das Leis 9.032/95, 9.528/97 e 9.732/98. Para benefícios com requisitos cumpridos após 13/11/2019, veja também a EC 103/2019.',
    itens:[18,19].map(i=>{ const pars=String(LIB.txt_resumo[i]||'').split('\n').filter(Boolean); const n=(pars[0].match(/^Art\. (\d+)/)||[])[1]; return {id:n, rot:'Art. '+n, pars, cit:'Lei 8.213/1991, art. '+n}; })});
  D.push({id:'in128', tit:'IN PRES/INSS 128/2022 — arts. 286 a 302', curto:'IN 128/2022', fonte:fonteUrl('in128'),
    nota:'Texto literal conferido no DOU. Art. 293 na redação da IN 141/2022; arts. 287, 290, 291 e 292 na redação da IN 170/2024.',
    itens:Object.keys(IN128).sort((x,y)=>x-y).map(n=>({id:n, rot:'Art. '+n, pars:IN128[n], cit:'IN PRES/INSS 128/2022, art. '+n+(n==='293'?' (redação da IN 141/2022)':['287','290','291','292'].includes(n)?' (redação da IN 170/2024)':'')}))});
  const slug=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const NR01_URL=fonteUrl('nr01');
  if(typeof NR01_GRO!=='undefined') D.push({id:'nr01', tit:'NR-01 — item 1.5: gerenciamento de riscos ocupacionais (GRO/PGR)', curto:'NR-01 (GRO)', fonte:NR01_URL,
    nota:'Redação da Portaria MTE 1.419/2024, em vigor desde 26/05/2026 (Portaria MTE 765/2025). O PGR serve à prevenção; a caracterização de insalubridade e periculosidade segue a NR-15 e a NR-16 (item 1.5.2).',
    itens:NR01_GRO.map(([k,t])=>({id:k, rot:'Item '+k, pars:t.split('\n'), cit:'NR-01, item '+k+' (redação da Portaria MTE 1.419/2024)'}))});
  if(typeof NR01_TERMOS!=='undefined') D.push({id:'nr01def', tit:'NR-01 — Anexo I: termos e definições', curto:'NR-01 (definições)', fonte:NR01_URL,
    nota:'Redação vigente. Algumas anotações do texto do MTE ainda indicam "vigência em 26 de maio de 2025", data original da Portaria 1.419/2024, depois adiada pela Portaria 765/2025.',
    itens:NR01_TERMOS.map(([k,t])=>({id:slug(k), rot:k, pars:t.split('\n'), cit:'NR-01, Anexo I — '+k}))});
  if(typeof NR15_CORPO!=='undefined') D.push({id:'nr15', tit:'NR-15 — itens gerais (15.1 a 15.7)', curto:'NR-15', fonte:fonteUrl('nr15'),
    nota:'Texto consolidado do MTE. Os anexos estão na aba Insalubridade.',
    itens:NR15_CORPO.map(([k,t])=>({id:k, rot:'Item '+k, pars:[t], cit:'NR-15, item '+k}))});
  D.push({id:'nr16', tit:'NR-16 — itens gerais', curto:'NR-16', fonte:fonteUrl('nr16'),
    nota:'Texto consolidado do MTE. Os anexos estão na aba Periculosidade.',
    itens:NR16_GERAL.map(([k,t])=>({id:k, rot:'Item '+k, pars:[t], cit:'NR-16, item '+k}))});
  return D;
}
let DOCS_TX=null;
const txId=(d,i)=>'tx-'+d+'-'+String(i).replace(/[^\w]/g,'_');
const txLink=(d,i)=>location.href.split('#')[0]+'#biblioteca/textos/'+d+'/'+i;
function txItem(d,i){ DOCS_TX=DOCS_TX||docsTexto(); const doc=DOCS_TX.find(x=>x.id===d); return doc&&doc.itens.find(x=>x.id===i); }
function renderTextos(){
  DOCS_TX=DOCS_TX||docsTexto();
  const doc=DOCS_TX.find(x=>x.id===S.txd)||DOCS_TX[0];
  const q=(S.txq||'').trim(), nq=normTxt(q);
  const itens=nq?doc.itens.filter(it=>normTxt(it.rot+' '+it.pars.join(' ')).includes(nq)):doc.itens;
  let h='<nav class="txdocs" aria-label="Documentos">'+DOCS_TX.map(x=>'<a class="txchip'+(x.id===doc.id?' on':'')+'" href="#biblioteca/textos/'+x.id+'"'+(x.id===doc.id?' aria-current="page"':'')+'>'+esc(x.curto)+'</a>').join('')+'</nav>';
  h+='<section class="panel txdoc"><div class="ph"><div class="fhead"><h3>'+esc(doc.tit)+'</h3><button class="printbtn" data-print="txtdoc">'+(q?'Imprimir os itens encontrados':'Imprimir este texto')+'</button></div><p class="muted small">'+esc(doc.nota)+' <a href="'+esc(doc.fonte)+'" target="_blank" rel="noopener">Fonte oficial</a></p></div>';
  h+='<label class="f" for="tx-q"><span>Procurar neste texto</span><input id="tx-q" type="search" value="'+esc(q)+'" placeholder="Ex.: permanente, EPI, laudo" data-txq="1"></label>';
  h+='<div class="txidx" aria-label="Índice">'+doc.itens.map(it=>'<a href="#biblioteca/textos/'+doc.id+'/'+esc(it.id)+'">'+esc(it.rot.replace(/^(Art\.|Item) ?/,''))+'</a>').join('')+'</div>';
  h+=itens.length?itens.map(it=>'<article class="txart" id="'+txId(doc.id,it.id)+'"><header><b>'+esc(it.rot)+'</b><div class="btns">'+favBtn('txt:'+doc.id+'/'+it.id,it.cit)+'<button class="ghost sm" data-txcite="'+doc.id+'|'+esc(it.id)+'">Copiar citação</button><button class="ghost sm" data-txlink="'+doc.id+'|'+esc(it.id)+'">Copiar link</button></div></header>'+it.pars.map(p=>'<p>'+hl(p,q)+'</p>').join('')+'</article>').join(''):'<p class="empty">Nada encontrado para "'+esc(q)+'" neste texto.</p>';
  h+='<p class="fine">Reprodução para consulta. Antes de citar em peça ou parecer, confira a redação na fonte oficial.</p></section>';
  return h;
}
document.addEventListener('click', ev=>{
  const b=ev.target.closest('[data-txcite],[data-txlink]'); if(!b) return;
  const [d,i]=(b.dataset.txcite||b.dataset.txlink).split('|'); const it=txItem(d,i); if(!it) return;
  if(b.dataset.txcite) copiar(it.cit+':\n"'+it.pars.join('\n')+'"','Citação copiada.'); else copiar(txLink(d,i),'Link copiado.');
});
document.addEventListener('input', ev=>{ const t=ev.target; if(t.dataset&&t.dataset.txq){ S.txq=t.value; const pos=t.selectionStart; render(); const el=document.getElementById('tx-q'); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(e){} } } });

/* ---------- Linha do tempo visual da legislação ---------- */
const TL_INI=1960, TL_FIM=2028, TL_W=1000;
const tlX = iso => { const d=new Date(iso+'T00:00:00'); const ano=d.getFullYear()+(d.getMonth()*30.4+d.getDate())/365; return Math.max(0,Math.min(TL_W,(ano-TL_INI)/(TL_FIM-TL_INI)*TL_W)); };
const TL_ERAS=[['1960-01-01','1997-03-05','Decretos 53.831/64 e 83.080/79','e1'],['1997-03-06','2019-11-13','Anexo IV (Decretos 2.172/97 e 3.048/99)','e2'],['2019-11-14','2028-12-31','Após a EC 103/2019','e3']];
function linhaTempoHtml(d){
  const hoje=new Date().toISOString().slice(0,10);
  const anos=[]; for(let y=1965;y<=2025;y+=5) anos.push(y);
  const marcos=MARCOS.filter(m=>m.d>='1960-01-01');
  let svg='<svg class="tlv" viewBox="-10 0 '+(TL_W+20)+' 118" role="img" aria-label="Linha do tempo da legislação de '+TL_INI+' a hoje">';
  TL_ERAS.forEach(([i,f,rot,c])=>{ const x1=tlX(i), x2=tlX(f>hoje?hoje:f); svg+='<rect class="tl-'+c+'" x="'+x1.toFixed(1)+'" y="10" width="'+(x2-x1).toFixed(1)+'" height="22" rx="3"><title>'+esc(rot)+'</title></rect><text class="tl-era" x="'+(x1+6).toFixed(1)+'" y="25">'+esc(rot)+'</text>'; });
  svg+='<line class="tl-eixo" x1="0" x2="'+TL_W+'" y1="58" y2="58"/>';
  anos.forEach(y=>{ const x=tlX(y+'-01-01'); svg+='<line class="tl-tick" x1="'+x+'" x2="'+x+'" y1="54" y2="62"/><text class="tl-ano" x="'+x+'" y="76">'+y+'</text>'; });
  marcos.forEach((m,k)=>{ const x=tlX(m.d); svg+='<g class="tl-m" tabindex="0" role="button" data-tlset="'+m.d+'" aria-label="'+esc(fmtBR(m.d)+' — '+m.t)+'"><circle cx="'+x.toFixed(1)+'" cy="58" r="6"/><title>'+esc(fmtBR(m.d)+' — '+m.t+': '+m.s)+'</title></g>'; });
  const xd=tlX(d); svg+='<line class="tl-sel" x1="'+xd+'" x2="'+xd+'" y1="4" y2="96"/><text class="tl-seltxt" x="'+Math.min(TL_W-70,Math.max(0,xd-35))+'" y="110">'+brData(d)+'</text>';
  svg+='</svg>';
  const ag=AGENTS.find(a=>a.id===(S.tlag||'ruido'))||AGENTS[0];
  const segs=(ag.periodos||[]).map(p=>{ const [i,f]=faixa(p[0]); return {i:i||'1960-01-01', f:f||hoje, p}; });
  let lane='<svg class="tlv tlag" viewBox="-10 0 '+(TL_W+20)+' '+(22+segs.length*26)+'" role="img" aria-label="Regras de '+esc(ag.nome)+' ao longo do tempo">';
  segs.forEach((s,k)=>{ const x1=tlX(s.i), x2=tlX(s.f), y=6+k*26; lane+='<g class="tl-seg'+(d>=s.i&&d<=s.f?' on':'')+'" tabindex="0" role="button" data-tlset="'+s.i+'"><rect x="'+x1.toFixed(1)+'" y="'+y+'" width="'+Math.max(4,x2-x1).toFixed(1)+'" height="20" rx="3"/><text x="'+(x1+5).toFixed(1)+'" y="'+(y+14)+'">'+esc(String(s.p[0]).slice(0,Math.max(4,Math.floor((x2-x1)/6))))+'</text><title>'+esc(s.p[0]+' — '+s.p[1]+' — '+s.p[2])+'</title></g>'; });
  const xd2=tlX(d); lane+='<line class="tl-sel" x1="'+xd2+'" x2="'+xd2+'" y1="0" y2="'+(10+segs.length*26)+'"/></svg>';
  lane+='</div><ul class="tl-leg">'+segs.map(s2=>'<li class="'+(d>=s2.i&&d<=s2.f?'on':'')+'"><b>'+esc(s2.p[0])+'</b> · '+esc(s2.p[1])+' — '+esc(s2.p[2])+'</li>').join('')+'</ul><div>';
  setTimeout(()=>document.querySelectorAll('.tlpanel .tscroll').forEach(el=>{ const sv=el.querySelector('svg'); if(!sv||sv.clientWidth<=el.clientWidth) return; el.scrollLeft=Math.max(0, sv.clientWidth*((tlX(d)+10)/(TL_W+20)) - el.clientWidth/2); }),0);
  return '<section class="panel tlpanel"><div class="ph"><h3>Linha do tempo da legislação</h3><p class="muted small">Clique num marco para ver a regra daquela data. Passe o mouse ou o dedo para ler o marco.</p></div><div class="tscroll">'+svg+'</div>'+
   '<div class="tlagsel"><label class="f" for="tl-ag"><span>Linha do tempo de um agente</span><select id="tl-ag" data-tlag="1">'+AGENTS.map(a=>'<option value="'+a.id+'"'+(a.id===ag.id?' selected':'')+'>'+esc(a.nome)+'</option>').join('')+'</select></label></div><div class="tscroll">'+lane+'</div></section>';
}
document.addEventListener('click', ev=>{ const g=ev.target.closest('[data-tlset]'); if(g){ S.dt=g.dataset.tlset; render(); } });
document.addEventListener('keydown', ev=>{ if((ev.key==='Enter'||ev.key===' ')&&ev.target.dataset&&ev.target.dataset.tlset){ ev.preventDefault(); S.dt=ev.target.dataset.tlset; render(); } });
document.addEventListener('change', ev=>{ const t=ev.target; if(t.dataset.tlag){ S.tlag=t.value; render(); const el=document.getElementById('tl-ag'); if(el) el.focus(); } });

/* ---------- fontes oficiais e alertas do monitor ---------- */
const brData = d => d ? d.split('-').reverse().join('/') : '—';
const FONTES_OK = typeof FONTES!=='undefined' ? FONTES : [];
const ALERTAS_PEND = (typeof ALERTAS!=='undefined' ? ALERTAS : []).filter(a=>a.status==='pendente');
const fonteNome = id => (FONTES_OK.find(f=>f.id===id)||{}).nome || id;
function fontesHtml(){
  if(!FONTES_OK.length) return '';
  const pend = id => ALERTAS_PEND.filter(a=>a.fonte===id).length;
  return '<section class="isec panel fontes"><h2 class="ih">Fontes oficiais e conferência</h2><div class="tscroll"><table class="rt"><thead><tr><th>Fonte</th><th>Versão considerada no app</th><th>Conferida em</th><th>Monitor</th></tr></thead><tbody>'+
   FONTES_OK.map(f=>'<tr><td>'+(f.url?'<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.nome)+' ↗</a>':esc(f.nome))+'</td><td>'+esc(f.versao)+'</td><td>'+brData(f.conferido)+'</td><td>'+(pend(f.id)?'<span class="chip st-C">'+pend(f.id)+' em revisão</span>':f.monitor?'diário':'auditoria semanal')+'</td></tr>').join('')+
   '</tbody></table></div><p class="fine">O robô verifica diariamente as páginas oficiais'+(typeof MONITOR!=='undefined'&&MONITOR.ultima?' (última verificação: '+brData(MONITOR.ultima)+')':'')+' e avisa quando surge documento novo. A jurisprudência é revista na auditoria semanal. Nenhuma alteração entra no app sem revisão.</p></section>';
}
function renderAlertas(){
  const el=document.getElementById('alertas'); if(!el) return;
  if(!ALERTAS_PEND.length){ el.hidden=true; return; }
  el.hidden=false;
  el.innerHTML='<details class="alerta"><summary><b>'+ALERTAS_PEND.length+(ALERTAS_PEND.length>1?' alterações':' alteração')+' em fontes oficiais aguardando revisão.</b> Os dados afetados podem estar desatualizados.</summary><ul>'+
   ALERTAS_PEND.map(a=>'<li><span class="small">'+brData(a.data)+' · '+esc(fonteNome(a.fonte))+'</span><br><a href="'+esc(a.url)+'" target="_blank" rel="noopener">'+esc(a.titulo)+' ↗</a>'+(a.nota?'<br><span class="small">'+esc(a.nota)+'</span>':'')+'</li>').join('')+'</ul></details>';
}
(function(){
  const c=document.getElementById('conferencia'); if(!c||!FONTES_OK.length) return;
  const ds=FONTES_OK.map(f=>f.conferido).filter(Boolean).sort();
  c.textContent= ds[0]===ds[ds.length-1] ? 'Base normativa e jurisprudência conferidas em '+brData(ds[0])+' (detalhes em Início).' : 'Base normativa e jurisprudência conferidas entre '+brData(ds[0])+' e '+brData(ds[ds.length-1])+', conforme a fonte (veja Início).';
})();
renderAlertas();
avisoTermos();
faixaNovidades();
talvezTutorial();

/* ---------- uso sem internet (PWA) ---------- */
let INSTALAR=null;
const PODE_OFFLINE = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);
if(PODE_OFFLINE){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('sw.js').then(r=>{ (r.active?Promise.resolve():new Promise(ok=>{ const w=r.installing||r.waiting; if(!w) return ok(); w.addEventListener('statechange',()=>{ if(w.state==='activated') ok(); }); })).then(()=>{ OFFLINE_PRONTO=true; statusRede(); }); }).catch(()=>{}); });
}
let OFFLINE_PRONTO=false;
function statusRede(){ const el=document.getElementById('offline'); if(!el) return; if(!navigator.onLine){ el.hidden=false; el.textContent='Sem conexão: usando a cópia salva no dispositivo.'; } else if(OFFLINE_PRONTO){ el.hidden=false; el.textContent='Disponível sem internet.'; } else el.hidden=true; }
window.addEventListener('online', ()=>{ statusRede(); avisar('Conexão restabelecida.'); });
window.addEventListener('offline', ()=>{ statusRede(); avisar('Sem conexão: o app continua funcionando com a cópia salva.'); });
window.addEventListener('beforeinstallprompt', ev=>{ ev.preventDefault(); INSTALAR=ev; if(S.tab==='perfil') render(); });
window.addEventListener('appinstalled', ()=>{ INSTALAR=null; avisar('Caracterizador Pericial instalado.'); if(S.tab==='perfil') render(); });
function instalarHtml(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent), standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;
  if(standalone) return '<p class="small">O app já está instalado neste dispositivo e abre sem internet.</p>';
  return '<p class="small">Instale o Caracterizador Pericial no celular ou no computador para abrir com um toque e consultar mesmo sem internet (em perícias, audiências e locais sem sinal).</p>'+
   (INSTALAR?'<button data-cs="instalar">Instalar no dispositivo</button>':ios?'<p class="fine">No iPhone ou iPad: toque em Compartilhar e depois em "Adicionar à Tela de Início".</p>':'<p class="fine">Se o botão não aparecer, use o menu do navegador: "Instalar app" ou "Adicionar à tela inicial".'+(PODE_OFFLINE?'':' A instalação só funciona na versão publicada do site.')+'</p>');
}
document.addEventListener('click', ev=>{ const b=ev.target.closest('[data-cs="instalar"]'); if(b&&INSTALAR){ INSTALAR.prompt(); INSTALAR.userChoice.finally(()=>{ INSTALAR=null; render(); }); } });

document.getElementById('logo').src=BRAND.logo;
document.getElementById('tabs').innerHTML = TABS.map(([k,t])=>'<a href="#'+k+'">'+t+'</a>').join('');
route();