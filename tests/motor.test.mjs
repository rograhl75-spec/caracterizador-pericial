/* Testes da lógica de enquadramento (js/motor.js).
   Cada teste cita a regra que protege: se uma mudança alterar o resultado, o teste falha. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregar } from './carregar.mjs';

const X = carregar();
const st = segs => segs.map(s => s.perito.st + '/' + s.inss.st).join(' ');

test('ruído até 05/03/1997: limite de 80 dB(A) (Dec. 53.831/64)', () => {
  assert.equal(st(X.periodo('ruido', '1990-01-01', '1996-12-31', { lavg: 82, te: 480 })), 'E/E');
  assert.equal(st(X.periodo('ruido', '1990-01-01', '1996-12-31', { lavg: 80, te: 480 })), 'N/N');
});

test('ruído de 06/03/1997 a 18/11/2003: limite de 90 dB(A) (STJ, Tema 694)', () => {
  assert.equal(st(X.periodo('ruido', '1998-01-01', '2002-12-31', { lavg: 91, te: 480 })), 'E/E');
  assert.equal(st(X.periodo('ruido', '1998-01-01', '2002-12-31', { lavg: 88, te: 480 })), 'N/N');
});

test('ruído: a IN 170/2024 não exige mais histograma a partir de 11/10/2001', () => {
  const s = X.periodo('ruido', '2002-01-01', '2002-12-31', { lavg: 95, te: 480 });
  assert.equal(s.length, 1, 'o período de 2002 não deve ser cortado em 11/10/2001');
  assert.doesNotMatch(s[0].inss.txt, /histograma/);
});

test('ruído de 19/11 a 31/12/2003: INSS pelo valor medido, NEN facultativo (art. 292, III)', () => {
  const s = X.periodo('ruido', '2003-11-19', '2003-12-31', { lavg: 88, te: 480 });
  assert.equal(st(s), 'E/E');
  assert.match(s[0].inss.txt, /art\. 292, III/);
});

test('ruído a partir de 2004: INSS exige NEN da NHO-01 (q = 3)', () => {
  assert.equal(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 88, te: 480 })[0].inss.st, 'I');
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 88, te: 480, ne3: 86 })), 'E/E');
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 84, te: 480, ne3: 84 })), 'N/N');
});

test('ruído: EPI eficaz não descaracteriza (STF, Tema 555)', () => {
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 90, te: 480, ne3: 90 }, { epi: true })), 'E/E');
});

test('biológicos: EPI eficaz afasta em princípio (STJ, Tema 1090)', () => {
  const s = X.periodo('biologico', '2015-01-01', '2015-12-31', { alinea: 'a' }, { epi: true });
  assert.equal(st(s), 'N/N');
});

test('biológicos: Tema 383 da TNU — EPI não afasta para saúde em UTI, aerossóis ou ala infectocontagiosa', () => {
  const s = X.periodo('biologico', '2015-01-01', '2015-12-31', { alinea: 'a', t383: true }, { epi: true });
  assert.equal(s[0].perito.st, 'E');
  assert.equal(s[0].inss.st, 'C');
});

test('biológicos: fora do rol do código 3.0.1 não enquadra', () => {
  assert.equal(st(X.periodo('biologico', '2015-01-01', '2015-12-31', {})), 'N/N');
});

test('EPI só é considerado a partir de 03/12/1998 (Lei 9.732/98)', () => {
  const s = X.periodo('biologico', '1998-01-01', '1999-12-31', { alinea: 'a' }, { epi: true });
  assert.equal(s[0].fim, '1998-12-02');
  assert.equal(s[0].perito.st, 'E');
  assert.equal(s[s.length - 1].perito.st, 'N');
});

test('conversão de tempo especial só até 13/11/2019 (EC 103/2019)', () => {
  assert.equal(X.diasConv({ ini: '2019-11-01', fim: '2019-11-30', dias: 30 }), 13);
  assert.equal(X.diasConv({ ini: '2020-01-01', fim: '2020-12-31', dias: 366 }), 0);
  assert.deepEqual(JSON.parse(JSON.stringify(X.FATORES[25])), { M: 1.2, H: 1.4 });
});

test('caso-exemplo: totais conhecidos (regressão)', () => {
  const t = X.totais(X.EXEMPLO);
  assert.deepEqual({ perito: t.perito.dias, inss: t.inss.dias, divergentes: t.diverg },
    { perito: 10304, inss: 7566, divergentes: 1 }); /* = 28 a 2 m 24 d e 20 a 8 m 26 d, como na tela */
});

test('base de dados: toda tese citada nas fichas e na NR-16 existe', () => {
  const faltando = [];
  X.AGENTS.forEach(a => (a.juris || []).forEach(j => { if (!X.TESES[j.slice(2)]) faltando.push(a.id + ' → ' + j); }));
  X.NR16.forEach(an => (an.j || []).forEach(k => { if (!X.TESES[k]) faltando.push(an.id + ' → ' + k); }));
  assert.deepEqual(faltando, []);
});

test('base de dados: Anexo 11 com graus válidos e Quadro 1 do Anexo 3 decrescente', () => {
  const graus = new Set(['mínimo', 'médio', 'máximo', '-', '', undefined, null]);
  assert.deepEqual(JSON.parse(JSON.stringify(X.A11.filter(x => !graus.has(x.g)).map(x => x.n))), []);
  for (let i = 1; i < X.Q1_2019.length; i++) {
    assert.ok(X.Q1_2019[i][0] > X.Q1_2019[i - 1][0] && X.Q1_2019[i][1] < X.Q1_2019[i - 1][1], 'linha ' + i);
  }
});

test('base de dados: toda fonte tem versão e data de conferência', () => {
  X.FONTES.forEach(f => { assert.ok(f.versao, f.id); assert.match(f.conferido, /^\d{4}-\d{2}-\d{2}$/, f.id); });
});

test('regra na data: faixas de vigência lidas corretamente', () => {
  assert.deepEqual([...X.faixa('até 05/03/1997')], [null, '1997-03-05']);
  assert.deepEqual([...X.faixa('a partir de 19/11/2003')], ['2003-11-19', null]);
  assert.deepEqual([...X.faixa('06/03/1997 a 18/11/2003')], ['1997-03-06', '2003-11-18']);
});

test('regra na data: uma regra por data (duas para cancerígenos LINACH a partir de 17/10/2013)', () => {
  const datas = ['1990-06-30', '1995-04-28', '1995-04-29', '1997-03-05', '1997-03-06', '2003-11-19', '2013-06-30', '2014-08-13', '2016-06-30', '2019-12-11', '2021-06-30', '2026-11-23'];
  const problemas = [];
  X.AGENTS.forEach(a => datas.forEach(d => { const n = X.regraNaData(a, d).length, esperado = a.linach && d >= '2013-10-17' ? 2 : 1; if (n !== esperado) problemas.push(a.id + ' em ' + d + ': ' + n); }));
  assert.deepEqual(problemas, []);
});

test('regra na data: ruído usa 80, 90 e 85 dB(A) nos três períodos', () => {
  const r = d => X.regraNaData(X.agente('ruido'), d)[0][2];
  assert.match(r('1996-01-01'), /80/); assert.match(r('2000-01-01'), /90/); assert.match(r('2010-01-01'), /85/);
});

test('consulta por função: todo agente, anexo e tese citados existem', () => {
  const erros = [];
  X.FUNCOES.forEach(f => {
    f.ag.forEach(id => { if (!X.agente(id)) erros.push(f.f + ' → agente ' + id); });
    f.nr15.forEach(n => { if (!X.NR15.some(z => String(z.n) === String(n))) erros.push(f.f + ' → NR-15 ' + n); });
    f.nr16.forEach(id => { if (!X.NR16.some(z => z.id === id)) erros.push(f.f + ' → NR-16 ' + id); });
    f.teses.forEach(k => { if (!X.TESES[k]) erros.push(f.f + ' → tese ' + k); });
    if (!f.obs) erros.push(f.f + ' sem observação');
  });
  assert.deepEqual(erros, []);
});

test('textos legais: NR-15 corpo, IN 128 e Lei 8.213 completos para navegação', () => {
  const cods = X.NR15_CORPO.map(r => r[0]);
  assert.ok(cods.includes('15.1') && cods.includes('15.2') && cods.includes('15.7'), 'itens 15.1, 15.2 e 15.7');
  assert.equal(new Set(cods).size, cods.length, 'códigos da NR-15 sem repetição');
  X.NR15_CORPO.forEach(([k, t]) => { assert.match(k, /^15\.\d/); assert.ok(t.length > 20, k); });
  for (let n = 286; n <= 302; n++) assert.ok(X.IN128[String(n)] && X.IN128[String(n)][0].startsWith('Art. ' + n), 'IN 128 art. ' + n);
  assert.match(X.LIB.txt_resumo[18], /^Art\. 57\./);
  assert.match(X.LIB.txt_resumo[19], /^Art\. 58\./);
});

test('textos legais: NR-01 item 1.5 e Anexo I sem códigos repetidos', () => {
  const cods = X.NR01_GRO.map(r => r[0]);
  assert.equal(new Set(cods).size, cods.length);
  ['1.5.1', '1.5.2', '1.5.3.1.4', '1.5.7.3.2', '1.5.8.4'].forEach(k => assert.ok(cods.includes(k), k));
  assert.match(X.NR01_GRO.find(r => r[0] === '1.5.2')[1], /NR-15.*NR-16/);
  const termos = X.NR01_TERMOS.map(r => r[0]);
  assert.equal(new Set(termos).size, termos.length);
  ['Agente físico', 'Programa de Gerenciamento de Riscos (PGR)', 'Risco ocupacional'].forEach(t => assert.ok(termos.includes(t), t));
});

test('histórico das NRs: cabeçalhos completos e em ordem de publicação', () => {
  const H = X.HISTORICO_NR;
  assert.equal(H.nr15.hist.length, 24); assert.equal(H.nr16.hist.length, 14); assert.equal(H.nr01.hist.length, 14);
  for (const id of ['nr01', 'nr15', 'nr16']) {
    assert.match(H[id].hist[0].port, /3\.214, de 08 de junho de 1978/);
    assert.match(H[id].hist.at(-1).port, id === 'nr01' ? /765/ : /2\.021/);
    H[id].hist.forEach(h => assert.match(h.dou, /^\d\d\/\d\d\/\d\d$/));
  }
  const p1359 = H.nr15.hist.find(h => /1\.359/.test(h.port));
  assert.deepEqual(JSON.parse(JSON.stringify(p1359.onde)), ['alterado — Anexo 3']);
});

test('num: formato brasileiro e internacional', () => {
  const casos = [['85,3', 85.3], ['85.3', 85.3], ['0.500', 0.5], ['0.050', 0.05], ['1.125', 1.125], ['1.500', 1.5], ['1.518,00', 1518], ['R$ 1.518,00', 1518], ['3.500,50', 3500.5], ['0,05', 0.05], ['480', 480], ['', null], ['abc', null], ['8a', null], ['Infinity', null], [12, 12]];
  for (const [v, e] of casos) assert.equal(X.num(v), e, String(v));
  /* milhar com ponto só quando pedido (R$, kg, litros, metros) */
  const milhar = [['1.500', 1500], ['1.518,00', 1518], ['1,500.00', 1500], ['0.500', 0.5], ['12.000', 12000]];
  for (const [v, e] of milhar) assert.equal(X.num(v, true), e, String(v) + ' (milhar)');
});

test('avaliar: datas trocadas, valor fora da faixa e período anterior a 1960', () => {
  const base = { empresa: 'T', funcao: 'T', agente: 'ruido', tempo: 25, epi: false };
  const trocado = X.avaliar(Object.assign({}, base, { ini: '1996-01-01', fim: '1990-01-01', d: { lavg: 90 } }), X.agente('ruido'));
  assert.match(trocado.erro, /anterior ao início/);
  const absurdo = X.avaliar(Object.assign({}, base, { ini: '1990-01-01', fim: '1995-12-31', d: { lavg: '870', te: 480 } }), X.agente('ruido'));
  assert.match(absurdo.erro, /fora do usual/);
  assert.ok(absurdo.segs.every(s => s.perito.st === 'I' && s.inss.st === 'I'));
  const antigo = X.periodo('ruido', '1950-01-01', '1965-12-31', { lavg: 88, te: 480 });
  assert.equal(antigo[0].fim, '1960-08-25'); assert.equal(antigo[0].perito.st, 'I');
  assert.equal(antigo[1].ini, '1960-08-26'); assert.match(antigo[1].perito.txt, /48\.959-A/);
  assert.equal(antigo.at(-1).ini, '1964-03-25'); assert.doesNotMatch(antigo.at(-1).perito.txt, /48\.959-A/);
});

test('totais: períodos sobrepostos contam uma vez', () => {
  const row = (agente, ini, fim, d) => ({ empresa: 'T', funcao: 'T', agente, ini, fim, tempo: 25, epi: false, d });
  const um = X.totais({ sexo: 'H', rows: [row('ruido', '1990-01-01', '1995-12-31', { lavg: 90, te: 480 })] });
  const dois = X.totais({ sexo: 'H', rows: [row('ruido', '1990-01-01', '1995-12-31', { lavg: 90, te: 480 }), row('ruido', '1990-01-01', '1995-12-31', { lavg: 95, te: 480 })] });
  assert.equal(dois.perito.dias, um.perito.dias);
  assert.equal(dois.perito.conv, um.perito.conv);
  assert.equal(dois.perito.sobrep, um.perito.dias);
  const parcial = X.totais({ sexo: 'H', rows: [row('ruido', '1990-01-01', '1995-12-31', { lavg: 90, te: 480 }), row('ruido', '1994-01-01', '1996-12-31', { lavg: 90, te: 480 })] });
  assert.equal(parcial.perito.dias, X.totais({ sexo: 'H', rows: [row('ruido', '1990-01-01', '1996-12-31', { lavg: 90, te: 480 })] }).perito.dias);
});
