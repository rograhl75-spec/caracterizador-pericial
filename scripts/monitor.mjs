#!/usr/bin/env node
/* Robô de monitoramento da legislação — Caracterizador Pericial
 *
 * Lê as fontes de dados/fontes.js, baixa cada página oficial, compara com a última
 * execução (scripts/estado.json) e, quando aparece documento novo ou o texto muda:
 *   1. registra um alerta em dados/alertas.js (o site mostra a faixa "em revisão");
 *   2. abre uma Issue no GitHub (quando roda no GitHub Actions);
 *   3. opcionalmente, pede ao Claude uma análise de impacto (se ANTHROPIC_API_KEY existir).
 * Nada no conteúdo jurídico do app é alterado automaticamente: a correção é sempre revisada.
 *
 * Uso:  node scripts/monitor.mjs [--dry] [--fonte=id]
 *   --dry      não grava arquivos nem abre Issue (só mostra o que encontrou)
 *   --fonte=id verifica só uma fonte
 *   --teste    simula um documento novo (Portaria MTE 737/2026), abre Issue de teste e chama o Claude;
 *              não grava alertas nem estado
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARQ_FONTES = path.join(ROOT, 'dados/fontes.js');
const ARQ_ALERTAS = path.join(ROOT, 'dados/alertas.js');
const ARQ_ESTADO = path.join(ROOT, 'scripts/estado.json');
const args = process.argv.slice(2);
const TESTE = args.includes('--teste');
const DRY = args.includes('--dry');
const SO = (args.find(a => a.startsWith('--fonte=')) || '').split('=')[1];
const FALHAS_PARA_AVISAR = 7;            // execuções seguidas sem acesso antes de avisar
const HOJE = new Date().toISOString().slice(0, 10);
const ANO = new Date().getUTCFullYear();
const UA = 'Mozilla/5.0 (compatible; caracterizador-pericial-monitor/1.0)';

/* ---------- leitura dos arquivos de dados (são scripts do site, não JSON) ---------- */
function carregar(arquivo, nomes) {
  const ctx = { module: undefined };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(arquivo, 'utf8') + `\n;globalThis.__r = {${nomes.join(',')}};`, ctx);
  return ctx.__r;
}
const { FONTES } = carregar(ARQ_FONTES, ['FONTES']);
const { ALERTAS } = carregar(ARQ_ALERTAS, ['ALERTAS']);
const estado = fs.existsSync(ARQ_ESTADO) ? JSON.parse(fs.readFileSync(ARQ_ESTADO, 'utf8')) : {};

/* ---------- utilitários ---------- */
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const anos = u => u.replaceAll('{ano-1}', String(ANO - 1)).replaceAll('{ano}', String(ANO));
const entidades = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const semTags = s => entidades(s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const normUrl = (h, base) => {
  try {
    const u = new URL(entidades(h), base);
    /* só links https de sites oficiais (governo, justiça, legislativo): javascript:, data: e domínios de terceiros são descartados */
    if (u.protocol !== 'https:' || !/(^|\.)(gov\.br|jus\.br|leg\.br)$/.test(u.hostname)) return null;
    u.hash = ''; u.search = '';
    return u.href.replace(/\/(view|@@download\/file)$/, '').replace(/\/$/, '');
  } catch { return null; }
};

/* título vindo de página externa: sem caracteres de controle ou de direção de texto, sem quebras, até 200 caracteres */
const limpaTitulo = t => String(t || '').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/[@`*_\[\]<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);
const HOSTS_FORA = new Set();
async function baixar(url, tentativas = 2) {
  const host = new URL(url).host;
  if (HOSTS_FORA.has(host)) throw new Error('site sem resposta nesta execução (' + host + ')');
  let ultimo;
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
      if (r.status === 404) return { status: 404 };
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return { status: r.status, tipo: r.headers.get('content-type') || '', corpo: Buffer.from(await r.arrayBuffer()) };
    } catch (e) {
      ultimo = new Error(e.message + (e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''));
      await new Promise(ok => setTimeout(ok, 4000));
    }
  }
  if (/fetch failed|timeout|aborted/i.test(String(ultimo && ultimo.message))) HOSTS_FORA.add(host);
  throw ultimo;
}

/* Links (href + texto) de uma página HTML, filtrados por regex. */
function extrairLinks(html, base, filtro) {
  const re = new RegExp(filtro, 'i'), out = new Map();
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = normUrl(m[1], base); if (!href) continue;
    const texto = semTags(m[2]);
    if (/sharer|whatsapp|twitter|linkedin|facebook/i.test(href)) continue;
    if (!re.test(href) && !re.test(texto)) continue;
    if (!out.has(href) || (texto && !out.get(href))) out.set(href, texto);
  }
  return out;
}

/* Busca no DOU (portal in.gov.br): resultados vêm num JSON embutido na página. */
async function buscarDou(termo) {
  const u = 'https://www.in.gov.br/consulta/-/buscar/dou?q=' + encodeURIComponent(termo) + '&s=todos&exactDate=mes&sortType=0';
  const r = await baixar(u);
  const html = r.corpo?.toString('utf8') || '';
  const m = html.match(/<script[^>]*id="_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('formato da busca do DOU mudou');
  const itens = (JSON.parse(m[1]).jsonArray || []);
  return new Map(itens.map(x => ['https://www.in.gov.br/web/dou/-/' + x.urlTitle,
    `${x.title || ''} (DOU ${x.pubDate || ''}${x.hierarchyStr ? ', ' + x.hierarchyStr : ''})`]));
}

/* ---------- verificação de uma fonte ---------- */
async function verificar(f) {
  const cfg = f.monitor, st = estado[f.id] || {};
  const novos = [];
  try {
    if (cfg.modo === 'texto') {
      const r = await baixar(f.url);
      const html = r.corpo.toString(/charset=iso-8859-1|windows-1252/i.test(r.tipo) ? 'latin1' : 'utf8');
      const texto = semTags(html);
      /* página de erro ou de bloqueio não pode ser tomada como o texto da norma */
      if (texto.length < 5000 || (cfg.contem && !texto.toLowerCase().includes(cfg.contem.toLowerCase())))
        throw new Error('página recebida não contém o texto esperado (' + (cfg.contem || 'tamanho') + ')');
      const h = sha(texto);
      if (st.hash && st.hash !== h) novos.push({ tipo: 'texto-alterado', titulo: `${f.nome}: o texto oficial mudou`, url: f.url });
      st.hash = h;
    } else {
      let links = new Map(), algum = false;
      if (cfg.modo === 'dou') {
        const re = cfg.filtro ? new RegExp(cfg.filtro, 'i') : null;
        for (const t of cfg.termos) { for (const [k, v] of await buscarDou(t)) if (!re || re.test(v)) links.set(k, v); algum = true; }
      } else {
        for (const u of (cfg.urls || [f.url]).map(anos)) {
          const r = await baixar(u);
          if (r.status === 404) continue;
          algum = true;
          for (const [k, v] of extrairLinks(r.corpo.toString('utf8'), u, cfg.linkFiltro || '\\.pdf')) links.set(k, v);
        }
      }
      if (!algum) throw new Error('nenhuma das URLs respondeu');
      if (!links.size && cfg.modo !== 'dou') throw new Error('nenhum documento encontrado: o formato da página pode ter mudado');
      const antes = new Set(st.links || []);
      if (st.links) for (const [href, texto] of links) if (!antes.has(href)) novos.push({ tipo: 'novo-documento', titulo: limpaTitulo(texto || href.split('/').pop()), url: href });
      /* guarda a união: um link que some e volta não gera alerta repetido */
      st.links = [...new Set([...(st.links || []), ...links.keys()])].sort();
    }
    st.falhas = 0; delete st.erro; st.ok = HOJE;
  } catch (e) {
    st.falhas = (st.falhas || 0) + 1; st.erro = String(e.message || e);
    if (st.falhas === FALHAS_PARA_AVISAR) novos.push({ tipo: 'fonte-inacessivel', titulo: `${f.nome}: sem acesso há ${FALHAS_PARA_AVISAR} verificações (${st.erro})`, url: f.url });
  }
  estado[f.id] = st;
  return novos.map(n => ({ id: sha(f.id + '|' + n.tipo + '|' + n.url + (n.tipo === 'novo-documento' ? '' : '|' + HOJE)).slice(0, 12), fonte: f.id, nomeFonte: f.nome, data: HOJE, status: 'pendente', ...n }));
}

/* ---------- análise de impacto opcional pelo Claude ---------- */
async function analisar(alertas) {
  if (!process.env.ANTHROPIC_API_KEY || !alertas.length) return;
  let Anthropic;
  try { ({ default: Anthropic } = await import('@anthropic-ai/sdk')); }
  catch { console.warn('SDK @anthropic-ai/sdk não instalado: análise pulada.'); return; }
  const client = new Anthropic();
  const sistema = 'Você apoia a manutenção do "Caracterizador Pericial", ferramenta didática de um engenheiro de segurança do trabalho para laudos de aposentadoria especial (Lei 8.213/91, Decreto 3.048/99, IN PRES/INSS 128/2022, NHO da Fundacentro, LINACH), insalubridade (NR-15 e anexos) e periculosidade (NR-16 e anexos), com teses do STF, STJ, TNU e TST. ' +
    'Para o documento recebido, responda em português, em até 8 linhas: (1) o que ele muda; (2) se afeta algo que o app usa — limites de tolerância, graus, anexos, marcos de vigência, regras do INSS para agentes nocivos, PPP/LTCAT, adicionais — e qual parte; (3) a primeira linha deve ser "Impacto: alto", "Impacto: médio" ou "Impacto: nenhum". Não invente conteúdo que não esteja no documento; se não houver texto suficiente, diga isso.';
  for (const a of alertas.filter(x => x.tipo !== 'fonte-inacessivel').slice(0, 6)) {
    const conteudo = [];
    try {
      if (/\.pdf$/i.test(a.url)) {
        const r = await baixar(a.url, 2);
        if (r.corpo && r.corpo.length < 15e6 && /pdf/i.test(r.tipo + a.url))
          conteudo.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: r.corpo.toString('base64') } });
      } else if (a.tipo === 'novo-documento') {
        const r = await baixar(a.url, 2);
        if (r.corpo) conteudo.push({ type: 'text', text: 'Texto da página:\n' + semTags(r.corpo.toString('utf8')).slice(0, 60000) });
      }
    } catch { /* segue só com título e URL */ }
    conteudo.push({ type: 'text', text: `Fonte monitorada: ${a.nomeFonte}\nDocumento: ${a.titulo}\nURL: ${a.url}\nTipo de alerta: ${a.tipo}` });
    try {
      const resp = await client.beta.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium' },
        system: sistema,
        messages: [{ role: 'user', content: conteudo }],
      });
      if (resp.stop_reason === 'refusal') { a.analise = 'Análise automática recusada pelo modelo; revisar manualmente.'; continue; }
      a.analise = resp.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    } catch (e) {
      console.warn('Falha na análise de', a.url, '-', e.message);
    }
  }
}

/* ---------- Issue no GitHub ---------- */
async function abrirIssue(alertas) {
  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  const corpo = ['O robô de monitoramento encontrou mudanças nas fontes oficiais. Nada foi alterado no conteúdo do app.', '',
    ...alertas.map(a => `### ${a.nomeFonte}\n- **${a.titulo}**\n- ${a.url}\n- Tipo: ${a.tipo} · alerta \`${a.id}\`` + (a.analise ? `\n\n> ${a.analise.replace(/\n/g, '\n> ')}` : '')),
    '', '**Para concluir a revisão:** corrija os arquivos de `dados/` se for o caso, atualize `versao` e `conferido` em `dados/fontes.js` e troque o `status` do alerta para `revisado` em `dados/alertas.js`.'].join('\n');
  const titulo = (TESTE ? '[TESTE — pode fechar] ' : '') + `Legislação: ${alertas.length} alteração(ões) para revisar (${HOJE.split('-').reverse().join('/')})`;
  if (!token || !repo || DRY) { console.log('\n--- Issue (não aberta) ---\n' + titulo + '\n\n' + corpo); return null; }
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': UA },
    body: JSON.stringify({ title: titulo, body: corpo, labels: ['legislacao'] }),
  });
  if (!r.ok) { console.warn('Issue não aberta: HTTP', r.status, await r.text()); return null; }
  return (await r.json()).html_url;
}

/* ---------- execução ---------- */
const alvo = FONTES.filter(f => f.monitor && (!SO || f.id === SO));
/* uma fonte por vez, com pausa: vários acessos simultâneos ao gov.br costumam ser recusados */
const resultados = [];
for (const f of alvo) {
  resultados.push(await verificar(f).catch(e => { console.warn(f.id, e); return []; }));
  await new Promise(ok => setTimeout(ok, 1500));
}
const conhecidos = new Set(ALERTAS.map(a => a.id));
const novos = resultados.flat().filter(a => !conhecidos.has(a.id));
if (TESTE) novos.push({ id: 'teste-' + HOJE, fonte: 'sst', nomeFonte: 'Portarias SST do MTE (TESTE)', data: HOJE, status: 'pendente', tipo: 'novo-documento',
  titulo: '[TESTE] Portaria MTE nº 737/2026 (Nova NR-10)',
  url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-portarias/2026-1/portaria-mte-no-737-nova-nr-10.pdf' });

for (const f of alvo) {
  const s = estado[f.id];
  console.log(`${s.erro ? '✗' : '✓'} ${f.id.padEnd(8)} ${s.erro ? 'erro: ' + s.erro + ` (${s.falhas}ª vez)` : (s.links ? s.links.length + ' documentos' : 'texto ok')}`);
}
console.log(novos.length ? `\n${novos.length} alteração(ões) nova(s):\n` + novos.map(a => `- [${a.fonte}] ${a.titulo}\n  ${a.url}`).join('\n') : '\nNenhuma alteração nova.');

await analisar(novos);
if (novos.length) {
  const issue = await abrirIssue(novos);
  if (issue) novos.forEach(a => { a.issue = issue; });
}
if (TESTE) console.log('\nExecução de teste: ' + (novos.find(a => a.analise) ? 'análise do Claude OK.' : 'sem análise do Claude (sem chave ou falha).') + ' Nada foi gravado.');
if (!DRY && !TESTE) {
  fs.writeFileSync(ARQ_ESTADO, JSON.stringify(estado, null, 1) + '\n');
  const todos = [...ALERTAS, ...novos];
  fs.writeFileSync(ARQ_ALERTAS,
    '/* ===== Alertas de alteração em fontes oficiais =====\n' +
    '   Arquivo gravado pelo robô (scripts/monitor.mjs, GitHub Actions). Pode ser editado à mão:\n' +
    "   depois de revisar um alerta, troque status:'pendente' por status:'revisado'. */\n" +
    `const MONITOR = ${JSON.stringify({ ultima: HOJE })};\n` +
    `const ALERTAS = ${JSON.stringify(todos, null, 1)};\n` +
    "if (typeof module !== 'undefined') module.exports = {ALERTAS, MONITOR};\n");
}
