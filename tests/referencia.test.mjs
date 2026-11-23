/* Casos de referência da auditoria de cálculos de 23/11/2026 (docs/auditorias/1-calculos.md).
   Para incluir no repositório: copiar para tests/ (usa o mesmo carregar.mjs de tests/motor.test.mjs).
   Testes marcados { todo } documentam FALHAS atuais: rodam, mas não quebram a suíte; quando o código
   for corrigido, remova o "todo". */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { carregar } from './carregar.mjs';

const X = carregar();
const st = segs => segs.map(s => s.perito.st + '/' + s.inss.st).join(' ');
const datas = segs => segs.map(s => s.ini + '..' + s.fim).join(' ');
const r1 = v => Math.round(v * 10) / 10;

/* extrai funções/constantes de js/app.js (que depende do navegador) para testar as calculadoras puras */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = fs.readFileSync(path.join(RAIZ, 'js/app.js'), 'utf8').split('\n');
function trecho(nome) {
  const i = APP.findIndex(l => l.startsWith('function ' + nome + '(') || l.startsWith('const ' + nome + ' ') || l.startsWith('const ' + nome + '='));
  if (i < 0) throw new Error('não achei ' + nome);
  let bal = 0, out = [];
  for (let k = i; k < APP.length; k++) { out.push(APP[k]); for (const ch of APP[k]) { if (ch === '{' || ch === '[' || ch === '(') bal++; if (ch === '}' || ch === ']' || ch === ')') bal--; } if (bal <= 0) break; }
  return out.join('\n');
}
const APPF = (() => {
  const ctx = { num: X.num, A1_QUADRO: X.A1_QUADRO, r1, log10: Math.log10 };
  vm.createContext(ctx);
  const nomes = ['tmaxQuadro', 'EXPQ', 'NHT06_TAB', 'LI_MET', 'liTokens', 'liParse', 'nextUp', 'liMean', 'isNht', 'liTi', 'liDose', 'liCalc'];
  vm.runInContext(nomes.map(trecho).join('\n;\n') + `\n;globalThis.__F={${nomes.join(',')}};`, ctx);
  return ctx.__F;
})();

/* ---------------- Ruído ---------------- */
test('NR-15, Anexo 1: Quadro de tempos máximos (85 dB = 8 h … 115 dB = 7 min)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(X.A1_QUADRO)), [[85,480],[86,420],[87,360],[88,300],[89,270],[90,240],[91,210],[92,180],[93,160],[94,135],[95,120],[96,105],[98,75],[100,60],[102,45],[104,35],[105,30],[106,25],[108,20],[110,15],[112,10],[114,8],[115,7]]);
});

test('NR-15, Anexo 1, item 4: nível intermediário usa o tempo do nível imediatamente mais elevado', () => {
  const t = APPF.tmaxQuadro;
  assert.equal(t(85), 480);
  assert.equal(t(85.4), 420);   /* → 86 dB */
  assert.equal(t(97), 75);      /* ausente do Quadro → 98 dB */
  assert.equal(t(99), 60);      /* → 100 dB */
  assert.equal(t(84.9), Infinity);
  assert.equal(t(115), 7);
});

test('ruído: arredondamento a 0,1 dB antes de comparar com o limite do período', () => {
  assert.equal(st(X.periodo('ruido', '1990-01-01', '1990-12-31', { lavg: 80.04 })), 'N/N'); /* 80,0 não supera 80 */
  assert.equal(st(X.periodo('ruido', '1990-01-01', '1990-12-31', { lavg: 80.06 })), 'E/E'); /* 80,1 > 80 */
  assert.equal(st(X.periodo('ruido', '2000-01-01', '2000-12-31', { lavg: 90.04 })), 'N/N'); /* 90,0 não supera 90 */
  assert.equal(st(X.periodo('ruido', '2000-01-01', '2000-12-31', { lavg: 90.06 })), 'E/E');
});

test('ruído: cortes em 06/03/1997, 19/11/2003 e 01/01/2004', () => {
  const s = X.periodo('ruido', '1997-01-01', '2004-06-30', { lavg: 89, te: 480 });
  assert.equal(datas(s), '1997-01-01..1997-03-05 1997-03-06..2003-11-18 2003-11-19..2003-12-31 2004-01-01..2004-06-30');
  assert.equal(st(s), 'E/E N/N E/E E/I');
});

test('ruído: NEN q = 5 (Lavg + 16,61·log(Te/480)) × NEN q = 3 (NE + 10·log(Te/480))', () => {
  /* Te 600: 84 + 16,61·log(1,25) = 85,6 > 85 (perito E); 84 + 10·log(1,25) = 84,97 → 85,0, não supera (INSS N) */
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 84, te: 600, ne3: 84 })), 'E/N');
  /* Te 360: 87 + 16,61·log(0,75) = 84,9 (N); 87 + 10·log(0,75) = 85,75 → 85,8 (E) */
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { lavg: 87, te: 360, ne3: 87 })), 'N/E');
});

test('ruído: dose do dosímetro → Lavg = 85 + 16,61·log(D·480/Tm) e NE = 85 + 10·log(D·480/Tm)', () => {
  /* 100% em 480 min → 85,0 (não supera) */
  assert.equal(st(X.periodo('ruido', '2010-01-01', '2010-12-31', { mr: 'dose', dose5: 100, dose3: 100, tm: 480, te: 480 })), 'N/N');
  /* 200% em 480 min → Lavg 90,0 (q = 5); 200% q = 3 → NE 88,0 */
  const s = X.periodo('ruido', '2010-01-01', '2010-12-31', { mr: 'dose', dose5: 200, dose3: 200, tm: 480, te: 480 });
  assert.match(s[0].perito.txt, /= 90,0 >/);
  assert.match(s[0].inss.txt, /= 88,0 >/);
  /* 50% em 240 min (amostra representativa) → Lavg 85,0 */
  assert.equal(st(X.periodo('ruido', '2000-01-01', '2000-12-31', { mr: 'dose', dose5: 50, tm: 240, te: 480 })), 'N/N');
});

test('ruído, leituras (NHT-06 com Apêndice 1): média ao inteiro antes de buscar o Ti — 88,4 → 88 dB → 5 h', () => {
  const r = APPF.liCalc({ te: '480', met: 'nht06a', s: [{ l: '88; 88,5; 88,7', t: '480' }] });
  assert.equal(r.sit[0].m, 88);
  assert.equal(r.sit[0].ti, 300);
  assert.equal(r.Dshow, 1.6);
});

test('ruído, leituras: NEN = 85 + 16,61·log(D), com o tempo restante da jornada sem exposição', () => {
  /* 92 dB por 240 min numa jornada de 480: D = 240/180 = 1,333 → NEN 87,1 */
  const r = APPF.liCalc({ te: '480', met: 'nr15', s: [{ l: '92;92;92', t: '240' }] });
  assert.equal(Math.round(r.D * 1000) / 1000, 1.333);
  assert.equal(r1(r.nen), 87.1);
  assert.equal(r1(r.ne), 87.1);
});

test('ruído, leituras: acima de 115 dB(A) a NHT-06 não calcula a dose', () => {
  const r = APPF.liCalc({ te: '480', met: 'nht06q', s: [{ l: '116;117;116', t: '10' }, { l: '90;90;90', t: '470' }] });
  assert.equal(r.over, true);
  assert.equal(r.semDose, true);
  assert.equal(r.nen, null);
});

test('motor, leituras NPS com soma de tempos menor que a jornada: o Lavg deve ser o da jornada', () => {
  /* 92 dB por 240 min em jornada de 480 (restante abaixo do limiar): Lavg da jornada = 92 + 16,61·log(240/480) = 87,0 ≤ 90 */
  assert.equal(st(X.periodo('ruido', '2000-01-01', '2000-12-31', { mr: 'nps', te: 480, nps: { 0: { 0: '92', 1: '240' } } })), 'N/N');
});

/* ---------------- Calor ---------------- */
test('calor até 05/03/1997: TE acima de 28 °C, fonte artificial (Dec. 53.831/64, 1.1.1)', () => {
  assert.equal(st(X.periodo('calor', '1990-01-01', '1990-12-31', { ibutg: 28 })), 'N/N');
  assert.equal(st(X.periodo('calor', '1990-01-01', '1990-12-31', { ibutg: 28.1 })), 'E/E');
  assert.equal(st(X.periodo('calor', '1990-01-01', '1990-12-31', { ibutg: 30, fonte: 'ceu' })), 'N/N');
});

test('Anexo 3 original, Quadro 1: limites superiores por regime e atividade', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(X.Q1_ORIG)), {
    cont: { rot: 'Trabalho contínuo', leve: 30.0, moderada: 26.7, pesada: 25.0 },
    r4515: { rot: '45 min trabalho / 15 min descanso', leve: 30.6, moderada: 28.0, pesada: 25.9 },
    r3030: { rot: '30 min trabalho / 30 min descanso', leve: 31.4, moderada: 29.4, pesada: 27.9 },
    r1545: { rot: '15 min trabalho / 45 min descanso', leve: 32.2, moderada: 31.1, pesada: 30.0 } });
  for (const reg of ['cont', 'r4515', 'r3030', 'r1545']) for (const ativ of ['leve', 'moderada', 'pesada']) {
    const lt = X.Q1_ORIG[reg][ativ];
    assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: lt, regime: reg, ativ })), 'N/N', reg + ' ' + ativ);
    assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: r1(lt + 0.1), regime: reg, ativ })), 'E/E', reg + ' ' + ativ);
  }
});

test('Anexo 3 original, Quadro 2 (M em kcal/h): linha imediatamente superior; acima de 500 fora do quadro', () => {
  assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: 27.5, regime: 'q2', mk: 260 })), 'N/N'); /* linha 300 → 27,5 */
  assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: 27.6, regime: 'q2', mk: 260 })), 'E/E');
  assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: 25.1, regime: 'q2', mk: 500 })), 'E/E'); /* 500 → 25,0 */
  assert.equal(st(X.periodo('calor', '2000-01-01', '2000-12-31', { ibutg: 27.5, regime: 'q2', mk: 501 })), 'I/I');
});

test('Anexo 3 (2019), Quadro 1: coerente com IBUTG = 56,7 − 11,5·log10(M), de 100 a 606 W', () => {
  const Q = X.Q1_2019;
  assert.equal(Q[0][0], 100); assert.equal(Q[0][1], 33.7);
  assert.equal(Q.at(-1)[0], 606); assert.equal(Q.at(-1)[1], 24.7);
  Q.forEach(([m, lt], k) => {
    assert.equal(r1(56.7 - 11.5 * Math.log10(m)), lt, 'M ' + m);
    if (k) { assert.ok(m > Q[k - 1][0]); assert.ok(lt < Q[k - 1][1]); }
  });
});

test('Anexo 3 (2019): M não tabelado usa a linha superior; IBUTG arredondado a 0,1 °C', () => {
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 28.2, m: 300 })), 'N/N');
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 28.24, m: 300 })), 'N/N'); /* 28,2 */
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 28.26, m: 300 })), 'E/E'); /* 28,3 */
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 28.2, m: 301 })), 'E/E'); /* linha 306 → 28,1 */
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 30, m: 99 })), 'I/I');
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 30, m: 607 })), 'I/I');
  assert.equal(st(X.periodo('calor', '2020-01-01', '2020-12-31', { ibutg: 35, m: 300, fonte: 'ceu' })), 'N/N'); /* item 1.1.1 */
});

test('calor: cortes em 06/03/1997 e 11/12/2019 (Portaria SEPRT 1.359/2019)', () => {
  assert.equal(datas(X.periodo('calor', '1997-01-01', '2020-12-31', { ibutg: 29, m: 300 })), '1997-01-01..1997-03-05 1997-03-06..2019-12-10 2019-12-11..2020-12-31');
});

test('calor: ajuste de vestimenta vale a partir de 01/01/2004 mesmo se o período começa antes', () => {
  const s = X.periodo('calor', '2000-01-01', '2010-12-31', { ibutg: 26.5, av: 0.5 });
  assert.equal(s.at(-1).ini, '2004-01-01');
  assert.equal(s.at(-1).perito.st, 'E'); /* 26,5 + 0,5 = 27,0 > 26,7 */
});

/* ---------------- Vibração ---------------- */
test('vibração: Anexo 8 (a partir de 13/08/2014) — VCI aren 1,1 m/s² ou VDVR 21,0; VMB 5 m/s²', () => {
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { aren: 1.1 })), 'N/N');
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { aren: 1.11 })), 'E/E');
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { vdv: 21 })), 'N/N');
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { vdv: 21.1 })), 'E/E');
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { tipo: 'vmb', aren: 5 })), 'N/N');
  assert.equal(st(X.periodo('vibracao', '2015-01-01', '2015-12-31', { tipo: 'vmb', aren: 5.01 })), 'E/E');
  assert.equal(datas(X.periodo('vibracao', '2014-01-01', '2014-12-31', { aren: 1 })), '2014-01-01..2014-08-12 2014-08-13..2014-12-31');
});

/* ---------------- Números ---------------- */
test('num(): formatos brasileiro e internacional', () => {
  assert.equal(X.num('85,3'), 85.3);
  assert.equal(X.num('85.3'), 85.3);
  assert.equal(X.num('1.500'), 1.5); /* sem milhar: ponto decimal */
  assert.equal(X.num('1.500', true), 1500);
  assert.equal(X.num('R$ 1.518,00'), 1518);
  assert.equal(X.num('12.345,6'), 12345.6);
  assert.equal(X.num('0,05'), 0.05);
  assert.equal(X.num(''), null);
  assert.equal(X.num('-'), null);
  assert.equal(X.num('85,3,2'), null);
});

test('num(): "0.xxx" é decimal, nunca milhar', () => {
  assert.equal(X.num('0.500'), 0.5);
  assert.equal(X.num('0.050'), 0.05);
  assert.equal(X.num('Infinity'), null);
});

test('químico: concentração "0.050" com LT "0,1" não supera o LT', () => {
  assert.equal(st(X.periodo('manganes', '2005-01-01', '2005-12-31', { modo: 'quant', conc: '0.050', lt: '0,1' })), 'N/N');
});

/* ---------------- Datas, conversão e totais ---------------- */
test('datas: cortes de 26/08/1960 (Lei 3.807) e 25/03/1964 (Dec. 53.831)', () => {
  const s = X.periodo('ruido', '1955-01-01', '1970-12-31', { lavg: 90 });
  assert.equal(datas(s), '1955-01-01..1960-08-25 1960-08-26..1964-03-24 1964-03-25..1970-12-31');
  assert.equal(st(s), 'I/I E/E E/E');
});

test('categoria profissional só até 28/04/1995 (Lei 9.032/95)', () => {
  const s = X.periodo('categoria', '1995-01-01', '1995-12-31', { cond: true });
  assert.equal(datas(s), '1995-01-01..1995-04-28 1995-04-29..1995-12-31');
  assert.equal(st(s), 'E/E N/N');
});

test('EPI só a partir de 03/12/1998, inclusive para calor', () => {
  const s = X.periodo('calor', '1998-01-01', '1999-12-31', { ibutg: 30 }, { epi: true });
  assert.equal(datas(s), '1998-01-01..1998-12-02 1998-12-03..1999-12-31');
  assert.equal(st(s), 'E/E N/N');
});

test('LINACH: cortes em 17/10/2013, 08/10/2014 e 01/07/2020', () => {
  const s = X.periodo('arsenio', '2010-01-01', '2021-12-31', { modo: 'linach', cond: true }, { epi: true });
  assert.equal(datas(s), '2010-01-01..2013-10-16 2013-10-17..2014-10-07 2014-10-08..2020-06-30 2020-07-01..2021-12-31');
  assert.equal(st(s), 'C/N E/N E/E N/N');
});

test('fatores de conversão do art. 70 do RPS (red. Dec. 4.827/2003)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(X.FATORES)), { 15: { M: 2, H: 2.33 }, 20: { M: 1.5, H: 1.75 }, 25: { M: 1.2, H: 1.4 } });
});

test('conversão até 13/11/2019 inclusive (EC 103/2019, art. 25, §2º)', () => {
  assert.equal(X.diasConv({ ini: '2019-11-13', fim: '2019-11-13' }), 1);
  assert.equal(X.diasConv({ ini: '2019-11-14', fim: '2019-11-20' }), 0);
  assert.equal(X.diasConv({ ini: '2019-01-01', fim: '2019-11-30' }), 317);
});

test('totais: sobreposição conta uma vez; acréscimo de conversão só até 13/11/2019', () => {
  const t = X.totais({ sexo: 'H', rows: [
    { ini: '2000-01-01', fim: '2000-12-31', agente: 'ruido', tempo: 25, epi: false, d: { lavg: 95 } },
    { ini: '2000-07-01', fim: '2001-06-30', agente: 'ruido', tempo: 25, epi: false, d: { lavg: 95 } }] });
  assert.deepEqual(JSON.parse(JSON.stringify(t.perito)), { dias: 547, conv: 219, sobrep: 184 }); /* 547 × 0,4 = 218,8 */
  const t2 = X.totais({ sexo: 'H', rows: [{ ini: '2019-01-01', fim: '2020-12-31', agente: 'ruido', tempo: 25, epi: false, d: { lavg: 90, ne3: 90 } }] });
  assert.equal(t2.perito.dias, 731);
  assert.equal(t2.perito.conv, 127); /* 317 × 0,4 = 126,8 */
  const t3 = X.totais({ sexo: 'M', rows: [{ ini: '2010-01-01', fim: '2010-12-31', agente: 'ruido', tempo: 25, epi: false, d: { lavg: 90, ne3: 90 } }] });
  assert.equal(t3.perito.conv, 73); /* 365 × 0,2 */
});

test('amd(): aproximação 365/30', () => {
  assert.deepEqual({ ...X.amd(365) }, { a: 1, m: 0, d: 0 });
  assert.deepEqual({ ...X.amd(395) }, { a: 1, m: 1, d: 0 });
  assert.deepEqual({ ...X.amd(10304) }, { a: 28, m: 2, d: 24 });
});

/* ---------------- Químicos (dados do Anexo 11) ---------------- */
test('Anexo 11, Quadro 1: amostra de LT, grau, teto e pele', () => {
  const a = n => { const x = X.A11.find(y => y.n.startsWith(n)); return [x.ppm, x.mg, x.g, x.teto, x.pele]; };
  assert.deepEqual(a('Tolueno'), [78, 290, 'médio', false, true]);
  assert.deepEqual(a('Formaldeído'), [1.6, 2.3, 'máximo', true, false]);
  assert.deepEqual(a('Monóxido de carbono'), [39, 43, 'máximo', false, false]);
  assert.deepEqual(a('Mercúrio'), [null, 0.04, 'máximo', false, false]);
  assert.deepEqual(a('Ácido clorídrico'), [4, 5.5, 'máximo', true, false]);
  assert.deepEqual(a('Acetona'), [780, 1870, 'mínimo', false, false]);
  assert.deepEqual(a('Amônia'), [20, 14, 'médio', false, false]);
  assert.deepEqual(a('Gás sulfídrico'), [8, 12, 'máximo', false, false]);
  assert.deepEqual(a('Benzeno'), [null, null, null, false, false]); /* passou ao Anexo 13-A */
});

/* ---------------- NR-16 ---------------- */
test('NR-16, Anexo 1: distâncias do depósito de explosivos (primeiras e últimas linhas)', () => {
  const E = APPF.EXPQ;
  assert.deepEqual(JSON.parse(JSON.stringify(E.q2.t)), [[4500, 45], [45000, 90], [90000, 110], [225000, 180]]);
  assert.deepEqual(JSON.parse(JSON.stringify(E.q3.t[0])), [20, 75]);
  assert.deepEqual(JSON.parse(JSON.stringify(E.q4.t[0])), [23, 45]);
  assert.deepEqual(JSON.parse(JSON.stringify(E.q4.t.at(-1))), [113300, 1350]);
});
