/* Carrega os scripts do site (dados + motor) num contexto isolado, sem navegador. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARQUIVOS = ['dados/biblioteca.js', 'dados/normas-base.js', 'dados/nr15-anexo11.js', 'dados/nr15-anexo13.js',
  'dados/in128-artigos.js', 'dados/atualizacoes.js', 'dados/nr16.js', 'dados/fontes.js', 'dados/funcoes.js', 'js/motor.js'];
const NOMES = ['LIB', 'AGENTS', 'TESES', 'MARCOS', 'NR15', 'A14', 'Q1_2019', 'Q1_ORIG', 'A11', 'A13FULL', 'Q2_2019', 'IN128',
  'A1_QUADRO', 'NR16', 'NR16_GERAL', 'FONTES', 'FUNCOES', 'FATORES', 'avaliar', 'totais', 'diasConv', 'amd', 'faixa', 'regraNaData'];

export function carregar() {
  const ctx = { console };
  vm.createContext(ctx);
  const codigo = ARQUIVOS.map(f => fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n;\n');
  vm.runInContext(codigo + `\n;globalThis.__X = {${NOMES.join(',')}};`, ctx, { filename: 'site.js' });
  const X = ctx.__X;
  /* o caso-exemplo fica em js/app.js, que depende do navegador: extrai só a constante */
  const app = fs.readFileSync(path.join(RAIZ, 'js/app.js'), 'utf8');
  const m = app.match(/const EXEMPLO = (\{[\s\S]*?\n\]\});/);
  X.EXEMPLO = vm.runInNewContext('(' + m[1] + ')');
  X.agente = id => X.AGENTS.find(a => a.id === id);
  /* avalia um período isolado e devolve os trechos */
  X.periodo = (agente, ini, fim, d = {}, extra = {}) =>
    X.avaliar(Object.assign({ empresa: 'T', funcao: 'T', ini, fim, agente, tempo: X.agente(agente).tempo, epi: false, d }, extra), X.agente(agente)).segs;
  return X;
}
