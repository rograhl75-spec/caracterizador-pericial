/* ===== Motor de enquadramento (funções puras) ===== */
const DAY = 86400000;
const toMs = s => Date.UTC(+s.slice(0,4), +s.slice(5,7)-1, +s.slice(8,10));
const toIso = ms => new Date(ms).toISOString().slice(0,10);
const addDays = (s,n) => toIso(toMs(s)+n*DAY);
const daysIncl = (a,b) => Math.round((toMs(b)-toMs(a))/DAY)+1;
const fmtBR = s => s ? s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4) : '';
const num = v => { if(v===''||v===null||v===undefined) return null; const x=+String(v).trim().replace(',','.'); return (String(v).trim()===''||isNaN(x)) ? null : x; };
const r1 = v => Math.round(v*10)/10; /* arredonda a 0,1 antes de comparar (NHO) */
const log10 = Math.log10;
const f1 = v => (Math.round(v*10)/10).toFixed(1).replace('.',',');

const EPI_INICIO = '1998-12-03';
const FIM_CONVERSAO = '2019-11-13';

function lookupM(m){
  if(m===null||m<100||m>606) return null;
  for(const [mm,lt] of Q1_2019){ if(mm>=m) return {m:mm, lt}; }
  return null;
}
function nen5(lavg, te){ return lavg + 16.61*log10((te||480)/480); }
function nen3(ne, te){ return ne + 10*log10((te||480)/480); }

/* divide [ini,fim] nos cortes (cada corte = primeiro dia do novo regime) */
function split(ini, fim, cuts){
  const cs = [...new Set(cuts)].filter(c=>c>ini && c<=fim).sort();
  const out=[]; let s=ini;
  for(const c of cs){ out.push([s, addDays(c,-1)]); s=c; }
  out.push([s,fim]);
  return out;
}
const R = (st, txt) => ({st, txt});

function aplicaEPI(res, row, seg, opts={}){
  if(!row.epi || seg[1] < EPI_INICIO) return res;
  if(res.st!=='E') return res;
  if(opts.ignora) return R('E', res.txt+' EPI não descaracteriza ('+opts.ignora+').');
  if(opts.controverso) return R('C', res.txt+' EPI eficaz informado, mas '+opts.controverso+'.');
  return R('N', res.txt+' EPI eficaz informado: afasta o enquadramento, em princípio (STJ, Tema 1090).');
}


/* Ruído: deriva Lavg (q = 5) e NE (q = 3) a partir do modo de medição informado */
function npsRows(d){ const o=d.nps||{}; return Object.keys(o).sort((a,b)=>a-b).map(k=>{ const r=o[k]||{}; return [num(r[0]),num(r[1])]; }); }
function ruidoDerive(d){
  const teRaw=num(d.te), te= teRaw===null?480:teRaw, modo=d.mr||'lavg';
  if(teRaw!==null && teRaw<=0) return {lavg:null, ne3:null, te, info:'', teInvalido:true};
  if(modo==='dose'){ const D5=num(d.dose5), D3=num(d.dose3), tm=num(d.tm)||te;
    const lavg = D5!==null&&D5>0 ? 85+16.61*log10(D5/100*480/tm) : null;
    const ne3 = D3!==null&&D3>0 ? 85+10*log10(D3/100*480/tm) : null;
    return {lavg, ne3, te, info: lavg===null?'':'Dose '+brn0(D5)+'% em '+tm+' min → Lavg '+f1(lavg)+' dB(A)'+(ne3!==null?'; dose q=3 '+brn0(D3)+'% → NE '+f1(ne3)+' dB(A)':'')+'.'}; }
  if(modo==='nps'){ const rows=npsRows(d).filter(r=>r[0]!==null&&r[1]!==null&&r[1]>0); const T=rows.reduce((s,r)=>s+r[1],0);
    if(!rows.length) return {lavg:null, ne3:null, te, info:''};
    const lavg=16.61*log10(rows.reduce((s,[L,t])=>s+t*Math.pow(10,L/16.61),0)/T);
    const ne3=10*log10(rows.reduce((s,[L,t])=>s+t*Math.pow(10,L/10),0)/T);
    return {lavg, ne3, te, info: rows.length+' leitura(s) em '+T+' min → Lavg (q=5) '+f1(lavg)+' dB(A); Leq/NE (q=3) '+f1(ne3)+' dB(A).'}; }
  return {lavg:num(d.lavg), ne3:num(d.ne3), te, info:''};
}
const brn0 = v => String(v).replace('.',',');

function avaliar(row, agent){
  const d = row.d || {};
  const out = [];
  if(!row.ini || !row.fim || row.fim < row.ini) return {erro:'Informe início e fim do período.', segs:[]};
  const e = agent.engine;
  let cuts = [];
  if(e==='ruido') cuts=['1997-03-06','2001-10-11','2003-11-19','2004-01-01'];
  else if(e==='calor') cuts=['1997-03-06','2019-12-11'];
  else if(e==='vibracao') cuts=['1997-03-06','2014-08-13'];
  else if(e==='categoria') cuts=['1995-04-29'];
  else cuts=['1997-03-06'];
  if(e==='quimico' && agent.linach && d.modo==='linach') cuts.push('2013-10-17','2014-10-08','2020-07-01');
  if(row.epi && e!=='ruido' && e!=='eletricidade' && e!=='categoria' && e!=='ate97' && e!=='vibracao') cuts.push(EPI_INICIO);

  for(const seg of split(row.ini, row.fim, cuts)){
    const [a,b] = seg; let p, i, base='';
    const ate97 = b <= '1997-03-05';

    if(e==='ruido'){
      const rv=ruidoDerive(d), lavg0=rv.lavg, te=rv.te, ne=rv.ne3;
      if(rv.teInvalido){ p=i=R('I','Jornada Te inválida: informe a jornada em minutos.'); }
      else if(lavg0===null){ p=i=R('I', (d.mr==='dose'?'Informe a dose (q = 5) e o tempo de medição.':d.mr==='nps'?'Informe as leituras (NPS e tempo).':'Informe o Lavg (q = 5).')); }
      else {
        const lavg=r1(lavg0), n5=r1(nen5(lavg0,te)), n3 = ne===null?null:r1(nen3(ne,te));
        if(ate97){ base='Dec. 53.831/64 · LT 80 dB(A)';
          p=R(lavg>80?'E':'N', 'Lavg '+f1(lavg)+(lavg>80?' > ':' ≤ ')+'80 dB(A).'); i=R(p.st, p.txt); }
        else if(b<='2003-11-18'){ base='Dec. 2.172/97 · 3.048/99 · LT 90 dB(A)';
          p=R(lavg>90?'E':'N', 'Lavg '+f1(lavg)+(lavg>90?' > ':' ≤ ')+'90 dB(A).');
          i=R(p.st, p.txt + (a>='2001-10-11'?' A partir de 11/10/2001 o INSS exige histograma ou memória de cálculo (art. 292, III).':'')); }
        else { base='Dec. 4.882/03 · NEN > 85 dB(A)';
          p=R(n5>85?'E':'N','NEN (q = 5, Te '+te+' min) = '+f1(n5)+(n5>85?' > ':' ≤ ')+'85 dB(A).');
          if(n3!==null) i=R(n3>85?'E':'N','NEN NHO-01 (q = 3) = '+f1(n3)+(n3>85?' > ':' ≤ ')+'85 dB(A).');
          else if(b<='2003-12-31') i=R(n5>85?'E':'N','19/11 a 31/12/2003: NHO-01 facultativa (art. 292, IV); leitura da ferramenta: aceita a NR-15 → '+f1(n5)+' dB(A).');
          else i=R('I','O INSS exige NEN pela NHO-01 (q = 3). Informe o NE para comparar.');
        }
      }
    }
    else if(e==='calor'){
      const t0=num(d.ibutg), av=num(d.av)||0, fonte=d.fonte||'artificial';
      const t = t0===null?null:r1(t0);
      if(ate97){ base='Dec. 53.831/64 (TE > 28 °C) · 83.080/79';
        if(d.caldeira){ p=i=R('E','Atividade do Decreto 83.080/79: caldeiras a carvão ou lenha (1.1.1) ou Anexo II, códigos 2.5.1, 2.5.2 e 2.5.5 (qualitativo).'); }
        else if(t===null){ p=i=R('I','Informe a temperatura (TE ou IBUTG).'); }
        else if(fonte!=='artificial'){ p=i=R('N','O código 1.1.1 exige calor de fonte artificial.'); }
        else { p=R(t>28?'E':'N', f1(t)+' °C'+(t>28?' > ':' ≤ ')+'28 °C, fonte artificial.'); i=R(p.st,p.txt); }
      }
      else if(b<='2019-12-10'){
        const tA = t===null?null:r1(t + (a>='2004-01-01'?av:0)), avTxt = (a>='2004-01-01'&&av)?' (IBUTG medido '+f1(t)+' + ajuste de vestimenta '+f1(av)+', NHO-06)':'';
        let lt, rot;
        if((d.regime||'cont')==='q2'){ const mk=num(d.mk); const q2=[[175,30.5],[200,30.0],[250,28.5],[300,27.5],[350,26.5],[400,26.0],[450,25.5],[500,25.0]]; const row= mk===null?null:q2.find(([m])=>m>=mk);
          if(mk===null){ base='Anexo 3 original · Quadro 2'; p=i=R('I','Informe a taxa metabólica média ponderada M (kcal/h).'); out.push({ini:a, fim:b, dias:daysIncl(a,b), base, perito:p, inss:i}); continue; }
          if(!row){ base='Anexo 3 original · Quadro 2'; p=i=R('I','M acima de 500 kcal/h: fora do Quadro 2.'); out.push({ini:a, fim:b, dias:daysIncl(a,b), base, perito:p, inss:i}); continue; }
          lt=row[1]; rot='descanso em outro local, M '+mk+' kcal/h → linha '+row[0]; base='Anexo 3 original · Quadro 2 · LT '+f1(lt)+' °C'; }
        else { const reg=Q1_ORIG[d.regime||'cont'], at=d.ativ||'moderada'; lt=reg[at]; rot=at+', '+reg.rot.toLowerCase(); base='Anexo 3 original · Quadro 1 · LT '+f1(lt)+' °C'; }
        if(tA===null){ p=i=R('I','Informe o IBUTG.'); }
        else { const ac=tA>lt, txt='IBUTG '+f1(tA)+(ac?' > ':' ≤ ')+f1(lt)+' °C ('+rot+')'+avTxt+'.';
          p=R(ac?'E':'N', txt);
          if(ac && fonte!=='artificial') i=R('N', txt+' A IN 128/2022 exige fonte artificial.');
          else i=R(ac?'E':'N', txt);
        }
      }
      else {
        const m=num(d.m), q=lookupM(m);
        if(t===null||m===null){ base='Anexo 3 (Port. 1.359/19)'; p=i=R('I','Informe IBUTG e taxa metabólica M (W).'); }
        else if(!q){ base='Anexo 3 (Port. 1.359/19)'; p=i=R('I','M fora do Quadro 1 (100 a 606 W).'); }
        else { base='Anexo 3 (Port. 1.359/19) · LT '+f1(q.lt)+' °C';
          const tA=r1(t+av), ac=tA>q.lt, txt='IBUTG '+f1(tA)+(ac?' > ':' ≤ ')+f1(q.lt)+' °C (M '+m+' W → linha '+q.m+' W)'+(av?' (medido '+f1(t)+' + vestimenta '+f1(av)+', NHO-06)':'')+'.';
          if(fonte==='ceu') p=R('N', txt+' Céu aberto sem fonte artificial: o Anexo 3 não se aplica (item 1.1.1), logo não enquadra.');
          else p=R(ac?'E':'N', txt);
          i = fonte==='ceu' ? R('N', txt+' IN: só ambiente fechado ou com fonte artificial.') : R(ac?'E':'N', txt);
        }
      }
      p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg);
    }
    else if(e==='vibracao'){
      const ar=num(d.aren), vdv=num(d.vdv), tipo=d.tipo||'vci', mart=!!d.martelete;
      const ref = ISO_VIB.find(x=>x.id===(d.iso||'iso97')) || ISO_VIB[0];
      if(ate97){ base='Dec. 53.831/64 (1.1.5) · 83.080/79 (1.1.4)';
        p=i=R(mart?'E':'N', mart?'Perfuratrizes ou marteletes pneumáticos.':'Atividade não descrita nos códigos de trepidação.'); }
      else if(b<='2014-08-12'){ base='Dec. 2.172/97 · 3.048/99 (2.0.2) · ISO';
        let ac=null, txt='';
        if(tipo==='vci' && ref.v!==null && (ar!==null||vdv!==null)){ const aA = ar!==null&&ar>ref.v, aV = vdv!==null&&ref.vdv!==null&&vdv>ref.vdv; ac=aA||aV; const ps=[]; if(ar!==null) ps.push('aren '+brn0(ar)+(aA?' > ':' ≤ ')+brn0(ref.v)+' m/s²'); if(vdv!==null&&ref.vdv!==null) ps.push('VDV '+brn0(vdv)+(aV?' > ':' ≤ ')+brn0(ref.vdv)+' m/s¹·⁷⁵'); txt=ps.join('; ')+' ('+ref.rot.split(' — ')[0]+').'; }
        if(tipo==='vmb') txt='A ISO 5349 não fixa LT para mãos e braços.';
        p = mart ? R('E','Atividade descrita no 2.0.2 (perfuratrizes e marteletes).'+(ac?' '+txt:'')) : ac===true ? R('E',txt+' Cód. 2.0.0: acima do limite especificado.') : ac===false ? R('N',txt+' Atividade não descrita no 2.0.2.') : R(tipo==='vmb'?'N':'I', tipo==='vmb'?txt+' Atividade não descrita no 2.0.2.':'Informe aren para comparar com a ISO.');
        i = ac===true ? R('E',txt+' IN 128/2022, art. 296, II.') : mart ? R('E','Perfuratrizes ou marteletes: o Manual INSS 2018 trata o período como qualitativo.') : ac===false ? R('N',txt) : R(tipo==='vmb'?'N':'I', tipo==='vmb'?txt+' Sem atividade descrita.':'O INSS (art. 296, II) exige comparação com a ISO.'); }
      else { base='Anexo 8 da NR-15';
        let ac=null, txt='';
        if(tipo==='vci' && (ar!==null||vdv!==null)){ ac=(ar!==null&&ar>1.1)||(vdv!==null&&vdv>21); txt='VCI: aren '+(ar===null?'—':String(ar).replace('.',','))+' m/s² (LT 1,1); VDVR '+(vdv===null?'—':String(vdv).replace('.',','))+' (LT 21,0).'; }
        if(tipo==='vmb' && ar!==null){ ac=ar>5; txt='VMB: aren '+String(ar).replace('.',',')+' m/s² (LT 5,0).'; }
        if(ac===null){ p = mart?R('E','Atividade descrita no 2.0.2.'):R('I','Informe aren/VDVR.'); i=R('I','O INSS exige os valores do Anexo 8.'); }
        else { p=R(ac?'E':(mart?'E':'N'), txt+(mart&&!ac?' Atividade descrita no 2.0.2.':'')); i=R(ac?'E':'N', txt); }
      }
      if(row.epi && b>=EPI_INICIO){ if(p.st==='E') p=R('E',p.txt+' EPI não atenua vibração de forma comprovada (Manual INSS 2018).'); if(i.st==='E') i=R('E',i.txt+' EPI informado não afasta (Manual INSS 2018).'); }
    }
    else if(e==='radion'){
      const at=!!d.cond, lt=d.lt||'';
      if(ate97){ base='Dec. 53.831/64 (1.1.4) · 83.080/79 (1.1.3)'; p=i=R(at?'E':'N', at?'Atividade descrita (qualitativo).':'Atividade não descrita.'); }
      else { base='Anexo IV (2.0.3) · Anexo 5 da NR-15';
        p=R(at?'E':'N', at?'Atividade descrita no 2.0.3.':'Atividade não descrita.');
        i= !at?R('N','Atividade não descrita.'): lt==='sim'?R('E','Acima do LT do Anexo 5 (CNEN NN-3.01).'): lt==='nao'?R('N','Abaixo do LT do Anexo 5.'):R('I','O INSS exige superar o LT do Anexo 5.'); }
      p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg);
    }
    else if(e==='eletricidade'){
      const v=!!d.cond;
      if(ate97){ base='Dec. 53.831/64 (1.1.8) · > 250 V'; p=i=R(v?'E':'N', v?'Exposição acima de 250 V.':'Sem exposição acima de 250 V.'); }
      else { base='Não arrolado no Anexo IV';
        p=R(v?'C':'N', v?'Só pela via judicial (STJ, Tema 534); ver STF, Tema 1209.':'Sem exposição acima de 250 V.'); i=R('N','A IN só admite até 05/03/1997.'); }
    }
    else if(e==='ate97'){
      const v=!!d.cond;
      if(ate97){ base='Dec. 53.831/64 '+agent.c53.join(', '); p=i=R(v?'E':'N', v?'Condição descrita no decreto.':'Condição não descrita.'); }
      else { base='Não arrolado no Anexo IV'; p=R(v?'C':'N', v?'Só pela via judicial (rol exemplificativo, STJ Tema 534).':'Condição não descrita.'); i=R('N','A IN só admite até 05/03/1997.'); }
    }
    else if(e==='quali'){
      const v=!!d.cond;
      base = ate97 ? 'Dec. 53.831/64 · 83.080/79' : 'Anexo IV ('+agent.cIV+')';
      p=R(v?'E':'N', v?'Atividade descrita.':'Atividade não descrita.'); i=R(p.st,p.txt);
      p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg);
    }
    else if(e==='categoria'){
      const v=!!d.cond;
      if(b<='1995-04-28'){ base='Categoria profissional (até 28/04/1995)'; p=i=R(v?'E':'N', v?'Atividade/grupo profissional listado'+(d.cod?' ('+d.cod+')':'')+'.':'Atividade não listada.'); }
      else { base='Lei 9.032/95'; p=i=R('N','Após 28/04/1995 exige exposição a agente nocivo.'); }
    }
    else if(e==='quimico'){
      const modo=d.modo||agent.modo, v=!!d.cond, c=num(d.conc), lt=num(d.lt);
      if(ate97){ base='Dec. 53.831/64 ('+agent.c53.join(', ')+') · 83.080/79 ('+(agent.c83.join(', ')||'—')+')';
        p=i=R(v?'E':'N', v?'Operação descrita: presunção de exposição.':'Operação não descrita.'); }
      else if(!agent.cIV){ base='Não arrolado no Anexo IV'; p=i=R('N','Agente fora do Anexo IV a partir de 06/03/1997.'); }
      else {
        const quant = r => { if(c===null||lt===null) return R('I','Informe concentração e LT.'); return R(c>lt?'E':'N','C = '+String(c).replace('.',',')+(c>lt?' > ':' ≤ ')+'LT '+String(lt).replace('.',',')+'.'); };
        const qual = () => R(v?'E':'N', v?'Exposição na atividade descrita (qualitativo).':'Sem exposição na atividade descrita.');
        if(modo==='linach'){
          const pDec = a>='2013-10-17', iIns = a>='2014-10-08', pos2020 = a>='2020-07-01';
          base='Anexo IV ('+agent.cIV+') · LINACH Grupo 1';
          p = pDec ? R(v?'E':'N', v?'Cancerígeno LINACH: avaliação qualitativa (art. 68, §4º).':'Sem exposição.') : (agent.modo==='quant'?quant():qual());
          i = iIns ? R(v?'E':'N', v?'Cancerígeno LINACH com CAS: qualitativo (art. 298).':'Sem exposição.') : (agent.modo==='quant'?quant():qual());
          if(pos2020){
            p = aplicaEPI(p,row,seg); if(row.epi&&p.st==='N'&&v) p=R('N',p.txt.replace('(STJ, Tema 1090)','(Dec. 10.410/20: medidas que eliminem a nocividade descaracterizam; STJ, Tema 1090)'));
            i = aplicaEPI(i,row,seg); if(row.epi&&i.st==='N'&&v) i=R('N',i.txt.replace('(STJ, Tema 1090)','(art. 298, III e §2º)'));
          } else {
            p = aplicaEPI(p,row,seg, pDec?{ignora:'art. 68, §4º, red. Dec. 8.123/13'}:{controverso:'a TNU (Tema 170) afasta o EPI para cancerígenos em qualquer período'});
            i = aplicaEPI(i,row,seg, iIns?{ignora:'IN 128/2022, art. 298'}:{});
          }
        } else {
          base='Anexo IV ('+agent.cIV+') · '+(modo==='quant'?'quantitativo':'qualitativo');
          p = modo==='quant'?quant():qual(); i=R(p.st,p.txt);
          p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg);
        }
      }
      if(ate97){ p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg); }
    }
    else if(e==='biologico'){
      const al=d.alinea||'', s97=!!d.saude97;
      if(ate97){ base='Dec. 53.831/64 (1.3.x) · 83.080/79 (1.3.x)'; const v=s97||!!al;
        p=i=R(v?'E':'N', v?'Contato com doentes, animais ou materiais infectocontagiantes.':'Atividade não descrita.'); }
      else { base='Anexo IV (3.0.1)';
        p=R(al?'E':'N', al?'Atividade da alínea '+al+') do 3.0.1.':'Atividade fora do rol do 3.0.1 (o Anexo 14 da NR-15 não se aplica).');
        i=R(al?'E':'N', al?'Alínea '+al+') do 3.0.1'+(al==='a'?'; o INSS exige contato com pacientes infectocontagiosos ou materiais contaminados.':'.'):'Atividade fora do rol do 3.0.1.'); }
      p=aplicaEPI(p,row,seg); i=aplicaEPI(i,row,seg);
    }
    out.push({ini:a, fim:b, dias:daysIncl(a,b), base, perito:p, inss:i});
  }
  return {segs:out};
}

function diasConv(seg){ /* dias até 13/11/2019 */
  if(seg.ini > FIM_CONVERSAO) return 0;
  const fim = seg.fim < FIM_CONVERSAO ? seg.fim : FIM_CONVERSAO;
  return daysIncl(seg.ini, fim);
}
/* Fatores do art. 70 do RPS (red. Dec. 4.827/2003; art. 70 revogado pelo Dec. 10.410/2020): conversão só até 13/11/2019 (EC 103/2019, art. 25, §2º). */
function totais(caso){
  const t={perito:{dias:0,conv:0}, inss:{dias:0,conv:0}, diverg:0, segs:0, porTempo:{}};
  for(const row of caso.rows){
    const ag=AGENTS.find(x=>x.id===row.agente); if(!ag) continue;
    const r=avaliar(row,ag); const tempo=+(row.tempo||ag.tempo); const f=FATORES[tempo][caso.sexo||'H'];
    for(const s of r.segs){
      t.segs++;
      if(s.perito.st!==s.inss.st) t.diverg++;
      for(const k of ['perito','inss']) if(s[k].st==='E'){ t[k].dias+=s.dias; t[k].conv+=diasConv(s)*(f-1); }
    }
  }
  t.perito.conv=Math.round(t.perito.conv); t.inss.conv=Math.round(t.inss.conv);
  return t;
}
/* anos/meses/dias no padrão 365/30 (aproximação usual de contagem) */
function amd(dias){
  const a=Math.floor(dias/365), r=dias-a*365, m=Math.floor(r/30), dd=r-m*30;
  return {a,m,d:dd};
}
