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
try { const raw=localStorage.getItem('caracterizador:v1'); if(raw){ const o=JSON.parse(raw); if(o&&o.caso&&Array.isArray(o.caso.rows)){ o.caso.rows=o.caso.rows.filter(r=>r&&AGENTS.some(a=>a.id===r.agente)); S.caso=o.caso; } } } catch(e){}
function save(){ try{ localStorage.setItem('caracterizador:v1', JSON.stringify({caso:S.caso})); }catch(e){} }

const TABS = [['inicio','Início'],['aposentadoria','Aposentadoria especial'],['insalubridade','Insalubridade'],['periculosidade','Periculosidade'],['teses','Teses'],['biblioteca','Biblioteca']];
const AP_SUB = [['agentes','Consulta por agente','Critério, campo, metodologia, simulação e PPP'],['caso','Análise de caso','Histórico do segurado, período a período'],['resultado','Resultado do caso','Tempo especial, linha do tempo e divergências']];

function chip(st, short){ return '<span class="chip st-'+st+'">'+(short?st==='E'?'Especial':st==='N'?'Não':st==='C'?'Controverso':'Faltam dados':ST[st])+'</span>'; }


/* ---------- INÍCIO (apresentação) ---------- */
function renderInicio(){
  const n = {ag:AGENTS.length, a11:A11.length, a13:A13FULL.filter(x=>x.g!=='nota').length, nr16:NR16.length, teses:Object.keys(TESES).length};
  const area=(cls,eb,tit,txt,links)=>'<article class="acard '+cls+'"><p class="eyebrow">'+eb+'</p><h3>'+tit+'</h3><p>'+txt+'</p><div class="alinks">'+links.map(([h,t],k)=>'<a class="'+(k?'sec':'pri')+'" href="#'+h+'">'+t+(k?'':' →')+'</a>').join('')+'</div></article>';
  return '<section class="hero"><div class="hero-in"><img class="hero-logo" alt="Grahl Consultoria e Treinamentos" src="'+BRAND.logo+'"><div class="hero-txt"><p class="eyebrow">Consulta técnica para laudos, pareceres e perícias</p><h2>Do texto legal ao laudo, período a período</h2><p>Legislação trabalhista e previdenciária num só lugar: qual regra vale em cada época, qual o limite, como medir e como fundamentar a conclusão em <b>aposentadoria especial</b>, <b>insalubridade</b> e <b>periculosidade</b>.</p><div class="hero-btns"><button class="btn" data-focusg="1">Pesquisar agente, substância ou atividade</button></div></div></div>'+
   '<dl class="hero-num"><div><dt>'+n.ag+'</dt><dd>agentes com ficha e simulador</dd></div><div><dt>'+n.a11+'</dt><dd>substâncias do Anexo 11, com sinônimos</dd></div><div><dt>'+n.a13+'</dt><dd>atividades do Anexo 13</dd></div><div><dt>'+n.nr16+'</dt><dd>anexos da NR-16 estruturados</dd></div><div><dt>'+n.teses+'</dt><dd>teses, súmulas e OJs</dd></div></dl></section>'+
   '<section class="isec"><div class="ihead"><h2 class="ih">Escolha a área</h2><p class="ilead">Cada área segue a sua própria legislação. A NR-15 só entra no previdenciário quando a norma do período remete a ela.</p></div>'+
   '<div class="acards">'+area('a-prev','Previdenciário · Decreto 3.048/99, Anexo IV','Aposentadoria especial','Agentes nocivos em cinco passos: critério por período, levantamento em campo, metodologia, simulação e PPP. Inclui a análise de caso do segurado.',[['aposentadoria/agentes','Consultar um agente'],['aposentadoria/caso','Analisar um caso']])+
   area('a-ins','Trabalhista · NR-15','Insalubridade','Limites e graus dos anexos da NR-15, calculadoras de ruído, calor e vibração, Quadro 1 do Anexo 11 e as listas integrais dos Anexos 13 e 14.',[['insalubridade','Abrir a NR-15']])+
   area('a-per','Trabalhista · NR-16','Periculosidade','Todos os anexos com itens, quadros e áreas de risco, hipóteses de exclusão e frequência da exposição (Súmula 364).',[['periculosidade','Abrir a NR-16']])+'</div></section>'+
   '<section class="forwho"><h2 class="ih">Para quem</h2><div class="fw-grid"><div><b>Atuação</b><ul class="chips"><li>Perito judicial</li><li>Assistente técnico</li><li>Laudos extrajudiciais</li><li>Pareceres técnicos</li></ul></div><div><b>Profissão</b><ul class="chips"><li>Engenheiro de segurança do trabalho</li><li>Médico do trabalho</li><li>Técnico de segurança do trabalho</li><li>Enfermeiro do trabalho</li></ul></div></div></section>'+
   '<section class="isec"><h2 class="ih">Como usar</h2><ol class="steps"><li><b>Pesquise</b><span>Digite no campo do topo um agente, substância, atividade ou tese, inclusive por sinônimo (toluol, amianto, H2S).</span></li><li><b>Escolha a área</b><span>Aposentadoria especial, insalubridade ou periculosidade: cada uma com a sua legislação e os seus critérios por período.</span></li><li><b>Siga os passos</b><span>Critério, levantamento em campo, metodologia e simulação com os seus dados, com a nota do especialista ao lado do critério oficial.</span></li><li><b>Imprima</b><span>Gere o relatório, a ficha ou a consulta no papel timbrado, em PDF ou papel.</span></li></ol></section>'+
   '<div class="grid2"><section class="isec panel"><h2 class="ih">Base normativa</h2><ul class="blist"><li>Lei 8.213/91 e Decreto 3.048/99 (Anexo IV), com Decretos 53.831/64, 83.080/79, 2.172/97, 4.882/03, 8.123/13 e 10.410/20</li><li>IN PRES/INSS 128/2022 e alterações (INs 133, 141, 170 e 212)</li><li>Manual de Aposentadoria Especial do INSS (2018)</li><li>NR-15 e NR-16 atualizadas, com a Portaria MTE 2.021/2025</li><li>NHO da Fundacentro (01, 06, 09, 10 e demais) e ISO 2631/5349</li><li>LINACH (Portaria Interministerial 9/2014)</li><li>Teses do STF, STJ, TNU e súmulas e OJs do TST</li></ul><p class="fine">Base conferida em 28/10/2026. Confira sempre a redação oficial antes de citar.</p></section>'+
   '<section class="isec panel about"><h2 class="ih">Sobre a Grahl</h2><img class="about-logo" alt="" src="'+BRAND.logo+'"><p><b>Grahl Consultoria e Treinamentos</b> é conduzida por <b>Rogério Grahl</b>, Engenheiro Químico e Engenheiro de Segurança do Trabalho, com mais de 30 anos na indústria química e 19 anos em segurança do trabalho. Desde 2015 dedica-se à consultoria técnica, às perícias judiciais e à assistência técnica, e é professor de pós-graduação na disciplina Elaboração de Laudos Técnicos.</p><ul class="blist"><li><b>Perícia judicial:</b> insalubridade (NR-15), periculosidade (NR-16) e acidentes de trabalho; aposentadoria especial e ações regressivas; perícias em processos químicos</li><li><b>Assistência técnica:</b> análise preventiva do posto de trabalho, elaboração de quesitos e impugnação técnica de laudos</li><li><b>Auditoria de conformidade:</b> PGR, LIP e LTCAT confrontados com as condições reais de operação</li><li><b>Consultoria industrial:</b> injeção de poliuretano rígido (processo descontínuo) e responsabilidade técnica no setor químico</li><li><b>Docência e treinamento:</b> perícia judicial, laudos de insalubridade, periculosidade e aposentadoria especial</li></ul><p class="small">Engenharia de Segurança do Trabalho (UEL, 2007) · MBA em Gestão Empresarial (FGV, 2003) · Engenharia Química (FURB, 1995)</p><p class="small">CREA-SC 1039223-9 · CRQ 09302007 · Londrina, PR</p><div class="contacts"><a href="https://grahlconsultoria.com.br/" target="_blank" rel="noopener">grahlconsultoria.com.br</a><span>WhatsApp (43) 99884-6888</span><span>rograhl75@gmail.com</span><span>Instagram @rogerio_grahl</span></div></section></div>'+
   '<p class="fine center">Ferramenta de consulta técnica. Os resultados não substituem a análise do caso concreto, a inspeção do local de trabalho nem o laudo técnico assinado por profissional habilitado.</p>';
}

/* ---------- PAINEL ---------- */

/* ---------- APOSENTADORIA ESPECIAL: subabas ---------- */
function renderAposentadoria(){
  const sub=S.ap||'agentes', t=totais(S.caso);
  const badge={agentes:AGENTS.length+' agentes', caso:S.caso.rows.length+' período(s)', resultado:fmtDias(t.perito.dias)};
  const nav='<nav class="subnav" aria-label="Aposentadoria especial">'+AP_SUB.map(([k,tit,desc],i)=>'<a href="#aposentadoria/'+k+'" class="'+(k===sub?'on':'')+'" aria-current="'+(k===sub?'page':'false')+'"><span class="sn-n">'+(i+1)+'</span><span class="sn-t"><b>'+tit+'</b><small>'+desc+'</small></span><span class="sn-b">'+esc(badge[k])+'</span></a>').join('')+'</nav>';
  const head='<section class="aphead"><div><p class="eyebrow">Previdenciário · Lei 8.213/91, arts. 57 e 58 · Decreto 3.048/99, Anexo IV</p><h2>Aposentadoria especial</h2></div>'+nav+'</section>';
  const body = sub==='caso'?renderCaso(): sub==='resultado'?renderPainel(): renderAgentes();
  return head+body;
}
function renderPainel(){
  const t=totais(S.caso), dif=t.perito.dias-t.inss.dias;
  const card=(lab,val,sub,cls='')=>'<div class="stat '+cls+'"><span class="lab">'+lab+'</span><span class="val">'+val+'</span><span class="sub">'+sub+'</span></div>';
  let h='<section class="intro"><div><p class="eyebrow">Caso carregado</p><h2>'+esc(S.caso.nome||'Caso sem nome')+'</h2><p class="muted">'+S.caso.rows.length+' período(s) · '+(S.caso.sexo==='M'?'mulher':'homem')+' · edite na aba <a href="#aposentadoria/caso">Análise de caso</a></p></div></section>';
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
    case 'biologico': return cb(i,'d.saude97','Até 1997: contato com doentes, animais ou materiais infectocontagiantes',d.saude97)+sel(i,'d.alinea','A partir de 06/03/1997: alínea do 3.0.1',d.alinea||'',[['','Nenhuma'],['a','a) estabelecimentos de saúde'],['b','b) animais infectados / soros e vacinas'],['c','c) autópsia, anatomia, anátomo-histologia'],['d','d) exumação; resíduos de animais'],['e','e) galerias, fossas e tanques de esgoto'],['f','f) esvaziamento de biodigestores'],['g','g) coleta e industrialização do lixo']]);
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
  return '<section class="intro"><div><p class="eyebrow">Análise de caso</p><h2>Aposentadoria especial por período</h2><p class="muted">Cada período é dividido nos marcos legais do agente e avaliado por dois critérios: o do perito, com a metodologia do professor, e o do INSS (IN 128/2022). Fatores de conversão do art. 70 do Decreto 3.048/99, só até 13/11/2019.</p></div></section>'+
  '<div class="casehead"><label class="f wide" for="c-nome"><span>Identificação do caso</span><input id="c-nome" type="text" data-c="nome" value="'+esc(c.nome)+'"></label>'+
  '<label class="f" for="c-sexo"><span>Segurado</span><select id="c-sexo" data-c="sexo"><option value="H"'+(c.sexo!=='M'?' selected':'')+'>Homem</option><option value="M"'+(c.sexo==='M'?' selected':'')+'>Mulher</option></select></label>'+
  '<div class="btns"><button data-act="add">Adicionar período</button><button class="ghost" data-act="ex">Carregar exemplo</button><button class="ghost" data-act="clr">Limpar caso</button><button class="ghost" data-act="copy">Copiar quadro-resumo</button><button class="printbtn" data-print="caso">Imprimir relatório</button></div></div>'+
  '<div id="totbar">'+totBar()+'</div><div class="rows">'+c.rows.map(rowCard).join('')+'</div>'+
  (c.rows.length?'':'<p class="empty">Nenhum período. Use <b>Adicionar período</b> ou <b>Carregar exemplo</b>.</p>')+
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
  return '<section class="simbox"><div class="fhead"><h3>Simular enquadramento</h3><div class="btns"><button class="ghost sm" data-simrst="1">Restaurar exemplo</button><button class="ghost sm" data-simuse="1">Incluir na análise de caso</button></div></div><p class="muted small">Informe um período e as condições de exposição: a ferramenta divide o período nos marcos legais deste agente e mostra o resultado pela nota do especialista e pelo INSS.</p>'+
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
 ['07/05/1999 a 18/11/2003','Acima de 90 dB(A)','NR-15, Anexo 1','Decreto 3.048/99','LTCAT; (+) histograma ou memória de cálculo a partir de 11/10/2001','Informação sobre EPC e EPI','2.0.1','DSS-8030, DIRBEN-8030'],
 ['19/11/2003 a 31/12/2003','Acima do LT de 85 dB(A)','NR-15 ou NHO-01','Decreto 3.048/99, red. Decreto 4.882/03','LTCAT ou demais demonstrações ambientais','Informação sobre EPC e EPI','2.0.1','DIRBEN-8030'],
 ['A partir de 01/01/2004','Acima do LT de 85 dB(A), em NEN','NHO-01 (INSS)','Decreto 3.048/99, red. Decreto 4.882/03; IN 99/2003; (+) art. 68, § 12 (Decreto 8.123/13)','LTCAT, se necessário','Informação sobre EPC e EPI','2.0.1','PPP'],
 ['(+) A partir de 01/01/2023','Acima do LT de 85 dB(A), em NEN','NHO-01 (INSS)','IN 128/2022, art. 292; Portaria DIRBEN/INSS 1.100/2023','LTCAT','Informação sobre EPC e EPI','2.0.1','PPP eletrônico (eSocial, S-2240)']];
const RS_HARM=[
 ['Até 05/03/1997','Decreto 53.831 (80 dB) e Decreto 83.080 (90 dB) vigentes juntos','O INSS aplica 80 dB(A), o mais favorável'],
 ['Até 05/03/1997','Limite previdenciário de 80 dB(A) abaixo do limite trabalhista de 85 dB(A)','Limiar de integração de 85 dB(A) despreza a faixa de 80 a 85 que enquadra'],
 ['11/10/2001 a 18/11/2003','A IN 57/2001 exige histograma ou memória de cálculo; o decreto não','PPP sem esse anexo pode ser recusado'],
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
 ['NR-15, Anexo 1','Limite de tolerância','Desde 08/06/1978 (Portaria 3.214/78)','Medidor de nível de pressão sonora, circuito A, resposta lenta','5','Quadro a partir de 85 dB(A)','Dose (Σ Ci/Ti); nível ausente do Quadro usa o imediatamente superior (item 4)'],
 ['NHT-06 R/E','Método · leituras instantâneas','1985 até a NHO-01 (2001)','Medidor de leitura instantânea, 3 leituras por situação acústica','5','80 dB(A) (Apêndice 1: 85 dB(A))','Dose em décimos, com a média de cada situação arredondada ao inteiro'],
 ['NHT-09 R/E','Método · dosímetro','1986 até a NHO-01 (2001)','Dosímetro (5 dB por dobro, como a NR-15)','5','80 dB(A) (Apêndice 1)','Dose: é o critério da norma (item IV). O "Leq" do Apêndice 3, 80 + 16,61 · log(0,16 · CD/TM), só traduz a dose em nível; com q = 5 é o que hoje se chama Lavg'],
 ['NHO-01','Método · dosímetro ou integrador','Desde 2001; o INSS exige desde 01/01/2004','Dosímetro (preferencial) ou medidor integrador','3 (critério da própria NHO)','80 dB(A)','Resultado em NE e NEN']];
function rsMetodo(){
  return '<div class="keynote"><b>Você não precisa escolher entre as normas.</b> A NR-15 dá o limite; as NHT e a NHO dão o jeito de medir. A data da medição define o método, e o limite é sempre o do Anexo 1 da NR-15 (nota do especialista; as NHO não fixam limites, Portaria Fundacentro 675/2021).</div>'+
   '<h3>O que existia em cada época</h3>'+rsTimeline()+
   '<h3>As quatro normas, nos mesmos termos</h3><div class="ncards">'+NORMAS_CARDS.map(([n,papel,qd,inst,q,lim,arr])=>'<article class="ncard'+(papel==='Limite de tolerância'?' nlim':'')+'"><header><b>'+esc(n)+'</b><span>'+esc(papel)+'</span></header><dl><dt>Quando vale</dt><dd>'+esc(qd)+'</dd><dt>Instrumento</dt><dd>'+esc(inst)+'</dd><dt>q</dt><dd>'+esc(q)+'</dd><dt>Limiar</dt><dd>'+esc(lim)+'</dd><dt>Resultado</dt><dd>'+esc(arr)+'</dd></dl></article>').join('')+'</div>'+
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
const U_DEF={quando:'desde2001', tipo:'leituras', te:'480', dose:'', tm:'', lavg:''};
function uState(){ if(!S.u) S.u=JSON.parse(JSON.stringify(U_DEF)); return S.u; }
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
  const r=uCalc(); if(r.err) return '<p class="note">'+esc(r.err)+'</p>';
  if(r.lavg===null) return (r.over?'<div class="verdict v-c"><b>Nível acima de 115 dB(A)</b><p>Pela NHT-06 a dose não é calculada: registrar \"Situação de Emergência\" (NR-15, Anexo 1, itens 5 e 7).</p></div>':'<p class="note">Sem dose: leituras abaixo do limiar.</p>');
  const kv=(k,v,sm)=>'<div><span>'+k+'</span><b>'+v+'</b>'+(sm?'<small>'+sm+'</small>':'')+'</div>';
  const ver=(v,lim)=>r1(v)>lim?'<span class="pill pe">Especial</span>':'<span class="pill pn">Não especial</span>';
  let h=(r.over?'<div class="verdict v-c"><b>Nível acima de 115 dB(A)</b><p>NR-15, Anexo 1, itens 5 e 7: exposição não permitida sem proteção adequada.</p></div>':'')+
   '<div class="kv">'+kv('Lavg do período medido',f1(r.lavg)+' dB(A)',r.tm+' min')+kv('NE da jornada',f1(r.ne)+' dB(A)',r.te+' min')+kv('NEN (8 h, q = 5)',f1(r.nen)+' dB(A)')+kv('Dose da jornada',r.doseTxt)+'</div>'+
   '<h4 class="sub">Se este resultado representar a exposição em…</h4>'+
   '<div class="scrollx"><table class="pt"><thead><tr><th>Período</th><th>Compara</th><th>Resultado</th></tr></thead><tbody>'+
   '<tr><td class="mono">Até 05/03/1997</td><td>Lavg '+f1(r.ne)+' × 80 dB(A)</td><td>'+ver(r.ne,80)+'</td></tr>'+
   '<tr><td class="mono">06/03/1997 a 18/11/2003</td><td>Lavg '+f1(r.ne)+' × 90 dB(A)</td><td>'+ver(r.ne,90)+'</td></tr>'+
   '<tr><td class="mono">A partir de 19/11/2003</td><td>NEN '+f1(r.nen)+' × 85 dB(A)</td><td>'+ver(r.nen,85)+'</td></tr></tbody></table></div>'+
   '<p class="fine">Nota do especialista (q = 5). O quadro \"Enquadrar um período\", abaixo, já recebeu este Lavg e esta jornada: informe as datas e o EPI.</p>';
  if(r.li) h+='<details><summary>Ver o cálculo por situação acústica</summary>'+liResFrom(r.li)+'</details>';
  return h;
}
function liResFrom(r){ return '<div class="scrollx"><table class="pt"><thead><tr><th>Situação</th><th>Média</th><th>Ci</th><th>Ti</th><th>Ci/Ti</th></tr></thead><tbody>'+r.sit.map(x=>'<tr><td>'+esc(x.n)+'</td><td>'+(r.nht?String(x.m):f1(x.m))+'</td><td>'+x.t+' min</td><td>'+(isFinite(x.ti)?Math.round(x.ti)+' min':'não soma')+'</td><td>'+(isFinite(x.ti)?brn0(Math.round(x.fr*1000)/1000):'0')+'</td></tr>').join('')+'</tbody></table></div>'; }
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
   '<div class="qgrid"><div class="q"><span class="ql">Quando foi a medição?</span>'+seg('quando',[['ate2001','Antes de 2001'],['desde2001','A partir de 2001']])+'</div><div class="q"><span class="ql">O que você tem em mãos?</span>'+seg('tipo',[['leituras','Leituras instantâneas'],['dose','Dose do dosímetro'],['lavg','Lavg calculado']])+'</div>'+inp('te','Jornada Te (min)')+'</div>'+
   '<p class="mnote"><b>Método aplicado:</b> '+esc(metTxt)+'</p>'+fields+'<div class="res" id="ures">'+uRes()+'</div></section>';
}
function rsSimular(a){
  const r=uCalc(); uSync(r);
  return '<p class="lead">Responda duas perguntas e informe os dados: a ferramenta aplica o método da época e mostra Lavg, NE e NEN. Depois, enquadre o período com datas e EPI.</p>'+uHtml()+
   simHtml(a).replace('<h3>Simular enquadramento</h3>','<h3>2. Enquadrar um período</h3>')+
   '<details class="cmpdet"><summary>Comparar com outros critérios (q = 3, NHT-06 × NR-15, fórmula)</summary>'+cmpHtml()+'</details>';
}
function rsDocumentar(){
  return '<p class="lead">PPP em papel para períodos até 31/12/2022; exclusivamente eletrônico (eSocial, S-2240) a partir de 01/01/2023 (Portaria DIRBEN/INSS 1.100/2023).</p><h3>PPP em papel, seção 15</h3>'+
   tbl(['Período','15.3 Fator de risco','15.4 Intensidade (até 15 caracteres)','15.5 Técnica (até 40 caracteres)'],[
    ['Até 05/03/1997','Ruído contínuo ou intermitente','Lavg em dB(A)','NR-15 Anexo 1 - Lavg q=5'],
    ['06/03/1997 a 18/11/2003','Ruído contínuo ou intermitente','Lavg em dB(A)','NR-15 Anexo 1 - Lavg q=5 (+ histograma desde 11/10/2001)'],
    ['A partir de 19/11/2003','Ruído contínuo ou intermitente','NEN 87,3 dB(A)','NHO-01 Fundacentro - NEN']].map(r=>r.map(esc)))+
   '<ul><li><b>13.7 Ocorrência GFIP/eSocial:</b> 04 quando houver enquadramento (25 anos).</li><li><b>15.7 EPI eficaz:</b> informar a partir de 03/12/1998, com o CA (15.8); para ruído não afasta o enquadramento.</li><li>Nunca escrever só \"dosímetro\", \"dosimetria\" ou \"decibelímetro\" no 15.5.</li><li>Qualquer mudança nos campos 15.2 a 15.8 abre nova linha de período.</li></ul>'+
   '<p class="note"><b>Em aberto:</b> o INSS exige o NEN da NHO-01 (q = 3) a partir de 2004; a nota do especialista usa q = 5. Opções: NHO-01 no PPP e q = 5 no laudo; NEN q = 5 no PPP; ou os dois valores, identificados.</p>'+
   '<h3>O laudo deve trazer</h3><ul>'+['Norma e versão seguidas, com fator q, critério e limiar do dosímetro','Tempo de medição, jornada (Te) e por que a amostra representa a jornada','Resultado na grandeza do período (Lavg até 18/11/2003; NEN depois), a 0,1 dB','Calibração antes e depois, com o desvio','Maior nível observado e sua frequência','EPI informado e a observação de que não altera a conclusão para ruído','Períodos por similaridade, com o critério de semelhança'].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
}
function rsHtml(a){
  const cur=rsStep(), i=RS_STEPS.findIndex(s=>s[0]===cur);
  const body = cur==='criterio'?rsCriterio(a): cur==='campo'?rsCampo(): cur==='metodo'?rsMetodo(): cur==='simular'?rsSimular(a): rsDocumentar();
  return '<article class="ficha rs"><header><div class="fhead"><p class="eyebrow">Físicos · em 5 passos</p><button class="printbtn" data-print="ficha">Imprimir passo</button></div><h2>Ruído contínuo ou intermitente</h2><div class="codes"><span>53.831: 1.1.6</span><span>83.080: 1.1.5</span><span>Anexo IV: 2.0.1</span><span>25 anos</span></div></header>'+
   rsNav(cur)+'<section class="rsbody"><p class="eyebrow">Passo '+(i+1)+' de 5</p><h3 class="rsq">'+RS_STEPS[i][2]+'</h3>'+body+'</section>'+rsPager(cur)+'</article>';
}

function libRows(tab, codes){ return (LIB[tab]||[]).filter(r=>codes.includes(r[0])); }
function renderAgentes(){
  const a=agById(S.ag);
  const aq=normTxt(S.agq||''); const vis=x=>!aq||normTxt(x.nome+' '+(x.kw||[]).join(' ')+' '+x.c53.join(' ')+' '+(x.cIV||'')).includes(aq);
  let list='<nav class="aglist" aria-label="Agentes"><label class="f" for="agq"><span>Filtrar agentes</span><input id="agq" type="search" data-st="agq" value="'+esc(S.agq||'')+'" placeholder="Ex.: solda, amianto, 1.0.19"></label><label class="f agsel" for="agsel"><span>Agente</span><select id="agsel" data-agsel="1">'+GRUPOS.map(g=>'<optgroup label="'+g+'">'+AGENTS.filter(x=>x.grupo===g&&vis(x)).map(x=>'<option value="'+x.id+'"'+(x.id===a.id?' selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</optgroup>').join('')+'</select></label>'+GRUPOS.map(g=>{ const xs=AGENTS.filter(x=>x.grupo===g&&vis(x)); return xs.length?'<div class="agg"><p>'+g+'</p>'+xs.map(x=>'<button data-ag="'+x.id+'" class="'+(x.id===a.id?'on':'')+'" aria-pressed="'+(x.id===a.id)+'"><span>'+esc(x.nome)+'</span><small>'+esc(x.cIV?x.cIV.split(' / ')[0]:(x.c53[0]||''))+'</small></button>').join('')+'</div>':''; }).join('')+(AGENTS.some(vis)?'':'<p class="agempty">Nenhum agente encontrado.</p>')+'</nav>';
  if(a.id==='ruido') return '<div class="agwrap">'+list+rsHtml(a)+'</div>';
  const codes=[...(a.c53.length?['53.831: '+a.c53.join(', ')]:[]),...(a.c83.length?['83.080: '+a.c83.join(', ')]:[]),(a.cIV?'Anexo IV: '+a.cIV:'Fora do Anexo IV'),'NR-15: '+a.nr15];
  let f='<article class="ficha"><header><div class="fhead"><p class="eyebrow">'+a.grupo+'</p><button class="printbtn" data-print="ficha">Imprimir ficha</button></div><h2>'+esc(a.nome)+'</h2><div class="codes">'+codes.map(c=>'<span>'+esc(c)+'</span>').join('')+'<span>'+a.tempo+' anos</span></div></header>';
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
  if(a.id==='vibracao') f+='<h3>Referências ISO para 06/03/1997 a 12/08/2014</h3><div class="isogrid">'+ISO_VIB.map(x=>'<div class="iso"><b>'+esc(x.rot)+'</b>'+(x.v!==null?'<span class="isov">'+String(x.v).replace('.',',')+' '+x.un+(x.vdv?' · VDV '+String(x.vdv).replace('.',',')+' m/s¹·⁷⁵':'')+'</span>':'<span class="isov">sem LT</span>')+'<p>'+esc(x.nota)+'</p></div>').join('')+'</div><p class="fine">A IN 128/2022 não diz qual edição ou qual valor da ISO usar. Na análise de caso, escolha a referência no campo "Referência ISO"; o padrão é o limite superior da zona de cautela da ISO 2631-1:1997.</p>';
  if(a.art&&a.art.length) f+='<details class="lit"><summary>Texto literal da IN PRES/INSS 128/2022 — art. '+a.art.join(', ')+'</summary>'+a.art.map(n=>(IN128[n]||[]).map((p,k)=>'<p'+(k===0?' class="art0"':'')+'>'+esc(p)+'</p>').join('')).join('<hr>')+(a.art.includes('293')?'<p class="fine">Redação dada pela IN PRES/INSS 141/2022.</p>':'')+'</details>';
  f+='<h3>Texto das normas</h3>'+(leg||'<p class="muted">Sem texto cadastrado.</p>')+'<p class="fine">Textos transcritos das planilhas originais do curso. Confira sempre a redação oficial no Planalto.</p></article>';
  return '<div class="agwrap">'+list+f+'</div>';
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
      return body+(lt!==null?'<div class="kv"><div><span>Limite de tolerância</span><b>'+(tp==='asb'?'2,0':brn(+lt.toFixed(3)))+' '+un+'</b></div></div>':'')+resultado(c===null||lt===null?null:c>lt,'máximo',(tp==='resp'?'LT = 8 / (%quartzo + 2) mg/m³.':tp==='total'?'LT = 24 / (%quartzo + 3) mg/m³.':tp==='mppdc'?'LT = 8,5 / (%quartzo + 10) mppdc.':tp==='asb'?'LT 2,0 f/cm³ (item 12). Extração e uso do amianto proibidos pelo STF (ADI 3.937, 2017).':'Manganês: até 5 mg/m³ (poeiras) ou 1 mg/m³ (fumos), jornada de até 8 h.')); }
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
  h+='<div class="grid2 '+(wide?'one':'wide-l')+'"><section class="panel" id="pinsal"><div class="ph"><div class="fhead"><p class="eyebrow">Anexo '+an.n+' · grau '+esc(an.g)+'</p><button class="printbtn" data-print="insal">Imprimir ou salvar PDF</button></div><h3>'+esc(an.t)+'</h3><p>'+esc(an.s)+'</p></div><div class="calcbox" id="calcbox">';
  if(an.tipo==='calc') h+=calcIns(an);
  else if(an.tipo==='quali' && an.n==='13-A'){ const g=insv('g13a',''); h+=icb('q13-A','Exposição ao benzeno constatada em inspeção')+isel('g13a','Grau atribuído pelo perito','',[['','Escolher…'],['máximo','Máximo'],['médio','Médio'],['mínimo','Mínimo']])+'<p class="fine">O Anexo 13-A não fixa grau. A escolha é do perito, por analogia com o Anexo 13 (hidrocarbonetos e outros compostos de carbono); a ferramenta não presume grau.</p>'+(insv('q13-A',false)&&!g?resultado(null,'médio','Escolha o grau atribuído no laudo.'):resultado(insv('q13-A',false),g||'médio','Caracterização qualitativa (Anexo 13-A).')); }
  else if(an.tipo==='quali') h+=icb('q'+an.n,'Condição constatada em inspeção (laudo qualitativo)')+resultado(insv('q'+an.n,false),an.g==='máximo'?'máximo':'médio','Caracterização qualitativa.');
  else if(an.tipo==='lista' && an.lista==='a14'){ const k=insv('a14',''); h+='<div class="opts">'+A14.map((x,j)=>'<label class="opt" for="a14-'+j+'"><input type="radio" name="a14" id="a14-'+j+'" data-ins="a14" value="'+j+'"'+(String(k)===String(j)?' checked':'')+'><span><em class="g-'+(x.g==='máximo'?'max':'med')+'">'+x.g+'</em>'+esc(x.t)+'</span></label>').join('')+'</div>'+(k===''?resultado(null,'médio','Escolha a atividade.'):resultado(true,A14[k].g,'Contato permanente na atividade listada. Para insalubridade, o Anexo 14 se aplica; para aposentadoria especial, não (código 3.0.1).')); }
  else if(an.tipo==='lista' && an.lista==='a13') h+=a13Lista();
  else h+='<p class="muted">Anexo revogado. Não gera adicional.</p>';
  h+='</div></section><aside class="panel"><div class="ph"><h3>Valor do adicional</h3></div>'+'<label class="f" for="i-base"><span>Base de cálculo (R$)</span><input id="i-base" type="text" inputmode="decimal" step="0.01" data-ins="base" value="'+esc(insv('base',''))+'" placeholder="Salário mínimo ou piso da norma coletiva"></label><p class="fine">Informe a base para ver o valor mensal no resultado.</p><div class="ph"><h3>Súmulas e OJs</h3></div><ul class="sm-list">'+['s47','s80','s289','s448','oj173','sv4','irr17'].map(k=>'<li><b>'+TESES[k].num+'</b> '+esc(TESES[k].tese)+'</li>').join('')+'</ul></aside></div>';
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
function pin(k,lab,attrs='step="any"'){ const id='p-'+k.replace(/[^a-z0-9]/gi,'-'); return '<label class="f" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="text" inputmode="decimal" data-per="'+k+'" value="'+esc(pget(k,''))+'" '+attrs+'></label>'; }
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
  if(q!==null){ if(prop) txt='Transporte não caracterizado: tanques de consumo próprio não contam (16.6.1 e 16.6.1.1).'; else if(tp==='liq'&&(e41||e42)) txt='Transporte não caracterizado: excluído pelo item '+(e41?'4.1':'4.2')+' do Anexo II.'; else if(q>=lim){ ok=true; txt='Transporte perigoso: '+brn(q)+' '+un+' (igual ou acima de '+lim+' '+un+'; item 16.6 e alínea '+(tp==='liq'?'j':'l')+' do Anexo II).'; } else txt='Transporte não caracterizado: '+brn(q)+' '+un+', abaixo de '+lim+' '+un+' (pequena quantidade, item 16.6). Pela alínea '+(tp==='liq'?'j':'l')+' do Anexo II, a partir de '+lim+' '+un+' já é perigoso.'; }
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
  h+='<div class="teses">'+items.map(([k,t])=>{ const u=usos(k); return '<article class="tese"><header><span class="trib t-'+t.trib+'">'+t.trib+'</span><b>'+esc(t.num)+'</b>'+(t.ano?'<span class="ano">'+t.ano+'</span>':'')+'</header><h4>'+esc(t.titulo)+'</h4><p>'+esc(t.tese)+'</p>'+(t.ref&&t.ref!=='—'?'<p class="ref">'+esc(t.ref)+'</p>':'')+(u.length?'<p class="uso">Fichas: '+u.map(a=>'<a href="#aposentadoria/agentes" data-ag="'+a.id+'">'+esc(a.nome)+'</a>').join(', ')+'</p>':'')+'</article>'; }).join('')+'</div>';
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
  MARCOS.forEach(m=>add('Marcos legais',fmtBR(m.d)+' — '+m.t,m.s,'aposentadoria/resultado'));
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
  const hits=IDX.filter(e=>terms.every(t=>e.n.includes(t)));
  if(!hits.length) return h+'<p class="empty">Nada encontrado. Tente um sinônimo (ex.: "toluol", "amianto") ou uma palavra só.</p>';
  const groups={}; hits.forEach(e=>(groups[e.sec]=groups[e.sec]||[]).push(e));
  h+='<p class="muted small">'+hits.length+' resultado(s) em '+Object.keys(groups).length+' seção(ões).</p><div class="sres">';
  for(const [sec,list] of Object.entries(groups)){
    h+='<section class="panel"><div class="ph"><h3>'+esc(sec)+'</h3><p class="muted small">'+list.length+' resultado(s)</p></div><ul class="hits">'+list.slice(0,12).map(e=>'<li><button class="hit" data-go="'+esc(e.go)+'"><b>'+hlTerms(e.t,terms)+'</b><span>'+hlTerms(snippet(e.s,terms),terms)+'</span></button></li>').join('')+'</ul>'+(list.length>12?'<p class="fine">Mais '+(list.length-12)+' resultado(s): refine a pesquisa'+(list[0].go.startsWith('lib:')?' ou abra a biblioteca':'')+'.</p>':'')+'</section>';
  }
  return h+'</div>';
}
let SRCH=null;
function go(dest){
  const [k,v]=dest.split(':'); SRCH={tq:null,q:null,q11:null,q13:null,fromGo:true};
  if(k==='ag'){ S.ag=v; S.ap='agentes'; location.hash='aposentadoria/agentes'; }
  else if(k==='a11'){ S.a15=11; S.ins.sub=+v; S.ins.q11=A11[+v].n; SRCH.q11=S.ins.q11; location.hash='insalubridade'; }
  else if(k==='a13'){ S.a15=13; S.ins.a13sel=v; S.ins.q13=''; S.ins.g13='todos'; location.hash='insalubridade'; }
  else if(k==='a15'){ S.a15=isNaN(+v)?v:+v; location.hash='insalubridade'; }
  else if(k==='a16'){ S.a16=v; location.hash='periculosidade'; }
  else if(k==='tese'){ S.tf='todos'; S.tq=TESES[v].num; SRCH.tq=S.tq; location.hash='teses'; }
  else if(k==='lib'){ S.lib=v; S.q=S.gq||''; SRCH.q=S.q; location.hash='biblioteca'; }
  else location.hash=k;
  if(location.hash==='#'+S.tab){ route(); }
}

function render(){
  document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')==='#'+S.tab?'page':'false'));
  const m=$('#main');
  m.innerHTML = S.tab==='inicio'?renderInicio(): S.tab==='busca'?renderBusca(): S.tab==='aposentadoria'?renderAposentadoria(): S.tab==='insalubridade'?renderInsal(): S.tab==='periculosidade'?renderPeric(): S.tab==='teses'?renderTeses(): renderBib();
}
function route(){ let h=location.hash.slice(1); const LEG={agentes:'aposentadoria/agentes',painel:'aposentadoria/resultado'}; if(LEG[h]){ h=LEG[h]; history.replaceState(null,'','#'+h); } const [h0,h1]=h.split('/');
  if(SRCH){ if(SRCH.fromGo){ SRCH.fromGo=false; } else { if(SRCH.tq!==null&&S.tq===SRCH.tq) S.tq=''; if(SRCH.q!==null&&S.q===SRCH.q){ S.q=''; S.lib='todas'; } if(SRCH.q11!==null&&S.ins.q11===SRCH.q11){ S.ins.q11=''; } SRCH=null; } } S.tab = TABS.some(t=>t[0]===h0)?h0:(h0==='busca'?'busca':'inicio'); if(S.tab==='aposentadoria') S.ap = AP_SUB.some(x=>x[0]===h1)?h1:(S.ap||'agentes'); render(); }
window.addEventListener('hashchange', ()=>{ route(); window.scrollTo(0,0); });

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
  if(b.dataset.simuse){ const r=JSON.parse(JSON.stringify(simRow())); r.empresa=''; r.funcao='Simulação — '+agById(r.agente).nome; S.caso.rows.push(r); save(); b.textContent='Incluído no caso'; b.disabled=true; const box=b.closest('.simbox'); if(box&&!box.querySelector('.goto-caso')){ const a=document.createElement('a'); a.className='goto-caso'; a.href='#aposentadoria/caso'; a.textContent='Período incluído. Ver na análise de caso →'; box.querySelector('.fhead').after(a); } setTimeout(()=>{ if(b.isConnected){ b.textContent='Incluir na análise de caso'; b.disabled=false; } },2000); return; }
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
   '<table class="rep"><thead><tr><th>Período</th><th>Empresa / função</th><th>Agente</th><th>Base legal</th><th>Nota do especialista</th><th>INSS (IN 128/2022)</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<table class="tot"><tr><th>Tempo especial — nota do especialista</th><td>'+fmtDias(t.perito.dias)+' ('+t.perito.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Tempo especial — INSS</th><td>'+fmtDias(t.inss.dias)+' ('+t.inss.dias.toLocaleString('pt-BR')+' dias)</td></tr><tr><th>Acréscimo por conversão até 13/11/2019 (perito / INSS)</th><td>'+fmtDias(t.perito.conv)+' / '+fmtDias(t.inss.conv)+'</td></tr><tr><th>Trechos divergentes</th><td>'+t.diverg+'</td></tr></table>'+
   '<p class="nota">Nota do especialista: ruído pela NR-15 (q = 5), Lavg até 18/11/2003 e NEN a partir de 19/11/2003; calor pelo código 2.0.4 do Decreto 3.048/99; agentes biológicos pelo rol do código 3.0.1. Contagem em dias corridos; anos, meses e dias aproximados por 365/30. Conversão pelo art. 70 do Decreto 3.048/99, só até 13/11/2019 (EC 103/2019).</p>';
}
/* uma linha da tabela externa por bloco: o cabeçalho e o rodapé do timbrado se repetem sem sobrepor o conteúdo */
function splitRows(html){
  const tmp=document.createElement('div'); tmp.innerHTML=html; const out=[];
  const keep=el=>/^(TABLE|P|H1|H2|H3|H4|UL|OL|DL|IMG|LABEL)$/.test(el.tagName)||el.matches('.verdict,.kv,.f,.cb,.opt,.lt,.iso,.tri,.mxrow,.codes');
  const walk=node=>{ for(const ch of Array.from(node.childNodes)){ if(ch.nodeType===3){ if(ch.textContent.trim()) out.push(ch.textContent); continue; } if(ch.nodeType!==1) continue; if(!keep(ch) && ch.children.length>1) walk(ch); else out.push(ch.outerHTML); } };
  walk(tmp);
  return out.map(x=>'<tr><td class="pbody">'+x+'</td></tr>').join('');
}
function printOut(kind){
  let html='', ori='portrait';
  if(kind==='caso'){ html=reportCaso(); ori='landscape'; }
  else if(kind==='ficha'){ const f=$('.ficha'); html='<p class="meta">Ficha de agente nocivo · emitida em '+hoje()+'</p>'+freeze(f); }
  else if(kind==='insal'){ html='<h1>Insalubridade — NR-15</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pinsal')); }
  else if(kind==='peric'){ html='<h1>Periculosidade — NR-16</h1><p class="meta">Consulta emitida em '+hoje()+'</p>'+freeze($('#pperic')); }
  const root=$('#printroot');
  root.innerHTML='<img class="lh" alt="" src="'+(ori==='landscape'?BRAND.a4h:BRAND.a4v)+'"><table class="pwrap"><thead><tr><td><div class="sp-top"></div></td></tr></thead><tbody>'+splitRows(html)+'<tr><td class="pbody"><p class="disc">Documento gerado pelo Caracterizador Pericial — ferramenta didática; não substitui a análise do caso concreto nem a redação oficial das normas. Grahl Consultoria e Treinamentos · grahlconsultoria.com.br</p></td></tr></tbody><tfoot><tr><td><div class="sp-bot"></div></td></tr></tfoot></table>';
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