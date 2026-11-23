# Auditoria 2 (Segurança e privacidade/LGPD) e 7 (Desempenho): Caracterizador Pericial

- Data: 23/11/2026. Commit auditado: `eb0cc99` (main). Nenhum arquivo do repositório foi alterado por esta auditoria. Os testes que exigiam arquivos modificados usaram cópias em `site/`, nesta pasta.
- Números de linha: referem-se à árvore de trabalho no momento da auditoria. Ela já tinha alterações não commitadas de outra frente em `js/app.js`, `js/motor.js`, `tests/` e `testes.yml`. No `HEAD` as linhas podem diferir em ±1–2.
- Método: leitura do código e testes reais com Chromium + Playwright (via `file://` e servidor estático local que imita o GitHub Pages: gzip e `Cache-Control: max-age=600`).
- Scripts e artefatos ficam nesta pasta (`/tmp/claude-0/-home-user-caracterizador-pericial/5d13d8eb-262e-5476-affc-a99f9b958dfc/scratchpad/auditorias/`):
  - `gen.js`: gera os backups maliciosos (`mal-backup.json`, `proto-backup.json`, `dos-backup.json`).
  - `xss.js`, `xss2.js`, `xss3.js`: importação pela interface e varredura das telas. `xss3.js` gera `fields-backup.json`, com 1.188 casos e um campo malicioso por caso.
  - `mxss.js` (impressão), `hash.js` (rotas), `proto.js`/`proto2.js` (prototype pollution e DoS), `jsurl.js` (link `javascript:` no alerta), `normurl.mjs` (normUrl do robô).
  - `timbrado.js`/`timbrado2.js` (imagens do timbrado), `csp.js` (CSP de teste), `perf.js`, `res.js`, `render.js`, `typing.js`, `hl.js`, `sw-test.js`, `server.js`.

## Resumo executivo

**Nenhum XSS foi executado.** Testei estes vetores com payload real (`"'><img src=x onerror=…><svg onload=…>`):
- todos os campos de caso (empresa, função, datas, tempo, epi, os 33 campos de `d.*`, nas 36 combinações agente × campo, num total de 1.188 casos);
- nome e id do caso, perfil, aceite e favoritos (chaves e notas);
- rotas de hash, busca geral, filtro da biblioteca e textos legais;
- impressão e pré-visualização, alerta do robô (título e URL).

O `esc()` é aplicado de forma consistente. Não há atributos com aspas simples, e não há `eval` nem handlers inline gerados pelo app.

Os problemas reais são outros:
1. Um backup forjado provoca **prototype pollution e DoS persistente**.
2. O robô **publica em produção, sem revisão humana, URL e texto vindos de páginas externas**.
3. A **cadeia de suprimentos do workflow** tem permissão de escrita.
4. A **origem `*.github.io` é compartilhada**, o que importa para a LGPD.
5. A política de privacidade tem **lacunas em relação à LGPD**.
6. O **service worker deixa usuários de rede lenta com dados velhos para sempre**.
7. Os **18 scripts síncronos** fazem o conteúdo aparecer só em 3,4 s no 3G rápido e 12 s no 3G lento.

| ID | Sev. | Título |
|---|---|---|
| S1 | Média | Importação de backup: prototype pollution (`id:"__proto__"`) e DoS persistente |
| S2 | Média | Robô publica no banner do site, sem revisão, URL/título de página externa; aceita `javascript:` |
| S3 | Média | Workflow do monitor: dependência npm sem lockfile roda com token de escrita persistido; actions sem SHA |
| S4 | Média | localStorage na origem `rograhl75-spec.github.io`, compartilhada com todos os Pages da conta |
| P1 | Média | Service worker: timeout de 5 s descarta a resposta nova; em rede lenta o cache nunca atualiza (e versões se misturam) |
| P2 | Média | 18 scripts síncronos (284 KB gz) antes do 1º conteúdo: 3,4 s (3G rápido) / 12 s (3G lento) |
| P3 | Média | Timbrado: até ~4,4 M caracteres dos ~5,2 M do localStorage; altura sem limite; perfil serializado a cada tecla |
| L1 | Média | Política de privacidade/termos: divergências e lacunas LGPD |
| S5 | Baixa | Sem Content-Security-Policy (só 1 ajuste para viabilizar uma CSP estrita) |
| P4 | Baixa | Filtro da Biblioteca sem debounce: 200–460 ms por tecla com CPU 4× |
| P5 | Baixa | Google Fonts: ~131 KB de terceiro, FOUT, IP enviado ao Google antes do aceite |
| P6 | Baixa | Cache do SW cresce sem limite com query strings; opaque responses; precache de imagens só usadas na impressão |
| S6 | Baixa | Hash com `%` malformado deixa a tela em branco (URIError) |
| S7 | Baixa | `hlTerms`/`hl` corrompem a marcação (termo casa dentro de `<mark>` e de entidades) |
| S8 | Baixa | `splitRows` reinsere `textContent` como HTML (sink latente de mXSS) |
| S9 | Baixa | Issue do robô: markdown, @menções e prompt injection a partir de páginas externas; `alertas.js`/`estado.json` sem limite |
| S10 | Baixa | Diversos: importação sem limite de tamanho, CAEPI em `http://`, Referer, aceite importado de outra pessoa |

---

## Segurança

### S1. Importação de backup: prototype pollution e DoS persistente (Média)

**Evidência** (`proto.js`, `proto2.js`, `xss3.js`, `xss2.js`):

**1. `proto-backup.json`** contém `{"tipo":"casos","casos":[{"id":"__proto__","nome":"proto","rows":[]}]}`.
- Depois de importar pela interface (`#pf-restore`), `DB.ativo === "__proto__"` e `S.caso === Object.prototype`.
- O aviso exibido é "1 já estava aqui e não foi duplicado".
- Na primeira gravação (`save()`), **`({}).alterado` vira `"2026-11-23T02:13:47Z"`**: o protótipo global foi poluído.
- Se o usuário editar o nome do caso, `S.caso[t.dataset.c]=t.value` grava em `Object.prototype.nome`.
- Simulação e Resultado quebram (`caso.rows is not iterable`).
- **O problema persiste depois de recarregar**: `{"ativo":"__proto__"}` fica salvo, e `DB.casos["__proto__"]` resolve pela herança.
- `id:"constructor"` tem efeito análogo: `S.caso` passa a ser a função `Object`.

**2. `dos-backup.json`** contém favoritos com `"nota":{"length":999}`.
- `f.nota.slice is not a function` em `favoritosInicio`.
- **A tela Início fica em branco a cada abertura** (main com 0 bytes depois do reload).
- O mesmo arquivo traz a chave `"__proto__"` em `favoritos`: `Object.assign({},FAV,o.favoritos)` troca o protótipo de `FAV` (`Object.getPrototypeOf(FAV)` passa a ter `tese:abc`).

**3. Campos sem validação derrubam a simulação** para o caso ativo:
- `tempo` não numérico: `FATORES[tempo]` fica indefinido (`motor.js:276`).
- `d.regime` desconhecido: `Q1_ORIG[d.regime]` fica indefinido (`motor.js:154`).

**Cenário:** um colega ou a parte contrária envia um "caso.json" e a ferramenta fica quebrada até o usuário apagar os dados.

**Causa:**
- `js/app.js:1133`: `DB.casos[c.id]` sem `hasOwn`, e o id é aceito sem formato.
- `js/app.js:27` (carga): `DB.casos[DB.ativo]` herdado.
- `js/app.js:23`: `limpaCaso` valida só `agente`/`sexo`.
- `js/app.js:1135`: `Object.assign` com chaves do arquivo.
- `js/app.js:1352`: supõe que `nota` é string.

**Correção:**
- Aceitar só ids `^[a-z0-9]{4,40}$` e descartar os demais com `novoId()`. Usar `Object.hasOwn(DB.casos,id)` em todos os acessos (importação, `abrirCaso`, carga inicial). De preferência, `DB.casos = Object.create(null)` ou `Map`.
- No `limpaCaso`, normalizar cada linha: strings com `String(x).slice(0,300)` para empresa e função; `tempo ∈ {15,20,25}` ou `ag.tempo`; `epi` booleano; datas `^\d{4}-\d{2}-\d{2}$`; `d` como objeto plano, com chaves conhecidas, valores primitivos e enums (`regime`, `ativ`, `fonte`, `alinea`, `modo`…) validados contra as tabelas.
- Favoritos: copiar só entradas cuja chave case com `^(ag|tese|a15|a16|funcao|txt):[\w./-]{1,80}$` e com `titulo`/`nota` string (`String(...).slice(0,2000)`). Ignorar `__proto__`, `constructor` e `prototype`. Montar com `Object.fromEntries` e nunca usar `Object.assign` com o objeto importado.
- Perfil importado: aceitar só `nome`, `prof`, `registro`, `contato`, `cidade` e `timbrado ∈ {grahl,proprio,simples}`, como string com limite. Não importar `aceite`/`tour` (ver S10).
- Envolver `render()` em `try/catch`, com mensagem "Caso com dados inválidos: abrir outro caso" e botão para trocar de caso, para que um dado ruim nunca deixe a tela em branco.

### S2. O robô publica no site, sem revisão, conteúdo de páginas externas (Média)

**Evidência:**
- `normurl.mjs`: com `<a href="javascript:fetch(...)//x.pdf">Portaria MTE nº 999/2026 (NR-15).pdf</a>` numa página monitorada, `extrairLinks` + `normUrl` devolvem `href:"javascript:fetch(...)//x.pdf"`. `new URL()` aceita qualquer esquema, e o filtro `\.pdf` casa com o texto.
- O alerta entra com `status:'pendente'` e vai direto para `dados/alertas.js` na `main`, que é o que o Pages publica. `renderAlertas` mostra o alerta a **todos os usuários** com o link "↗" (`js/app.js:1701`).
- `jsurl.js`: no Chromium o `javascript:` com `target="_blank" rel="noopener"` abre `about:blank` e **não executou**. Mesmo assim, o link é publicado, e o comportamento depende do navegador e da forma de abrir (arrastar ou "abrir aqui").
- O título é escapado (`&lt;img…&gt;`), então não há XSS. Ainda assim, uma página do governo comprometida ou um link de terceiro dentro dela consegue colocar, na faixa "alterações em fontes oficiais", **texto e link https arbitrários (phishing)** com a credibilidade da ferramenta. A faixa aparece antes de qualquer revisão.

**Causa:**
- `scripts/monitor.mjs:54-61` (`normUrl` sem validar esquema e host).
- `scripts/monitor.mjs:83-93` e `:138` (título vindo do texto do link, sem limite de tamanho).
- `scripts/monitor.mjs:237` (grava direto).
- Workflow `:50-58` (commit e push na `main`).
- `js/app.js:1701` (usa `a.url` em `href`).

**Correção:**
- No robô, aceitar só `https:` com host na lista (`gov.br`, `in.gov.br`, `planalto.gov.br`, `fundacentro.gov.br`, `stf.jus.br`…). Limitar `titulo` a cerca de 200 caracteres sem quebras de linha e remover caracteres de controle e bidi.
- No app, gerar o `href` com `safeUrl(u)`: `new URL(u)`, depois `protocol==='https:'` e host na lista. Fora disso, mostrar o texto sem link. Aplicar também em `cellHtml`, `f.url` e `doc.fonte`.
- Não exibir publicamente títulos e URLs brutos de alertas não revisados. Mostrar só "Nova publicação em <fonte> em revisão" e manter os detalhes na Issue. Outra opção é o robô abrir PR em vez de fazer push na `main`.

### S3. Workflow do monitor: cadeia de suprimentos com escrita no repositório que gera o site (Média)

**Evidência** (`.github/workflows/monitor-legislacao.yml`):
- `permissions: contents: write, issues: write` valem para o job inteiro (`:16-18`).
- `actions/checkout@v5` (`:31`) roda com `persist-credentials` padrão (true), e o GITHUB_TOKEN com escrita fica em `.git/config`.
- Em seguida, `npm install --prefix scripts` (`:40`) instala `@anthropic-ai/sdk@^1.12.0` **sem lockfile** (não há `scripts/package-lock.json`) e **com scripts de instalação habilitados**.
- `node scripts/monitor.mjs` roda no mesmo processo com `ANTHROPIC_API_KEY` e `GITHUB_TOKEN` no ambiente.
- Uma versão comprometida do SDK ou de uma dependência transitiva poderia fazer push na `main`, alterando `js/app.js` publicado para todos os usuários, ou exfiltrar a chave.
- As actions estão por tag (`@v5`), não por SHA.

**O que está correto:**
- Não há injeção de script: o único `${{ }}` em `run` é o booleano `inputs.teste`, e não há uso de título de Issue nem `pull_request_target`.
- `testes.yml` é só leitura.
- O token não aparece em log.

**Correção:**
- Commitar `scripts/package-lock.json` e trocar por `npm ci --prefix scripts --ignore-scripts --no-audit --no-fund`. Fixar a versão exata.
- Usar `actions/checkout@<sha> with: persist-credentials: false` e, no passo de push, usar `git push https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}` só ali. Melhor ainda: separar em dois jobs. O job 1 (`contents: read`) roda o monitor e o SDK e entrega `alertas.js`/`estado.json` como artifact. O job 2 (`contents: write`, sem npm) valida o JSON (esquema e tamanho) e faz o commit.
- Fixar `actions/checkout` e `actions/setup-node` por SHA e ativar o Dependabot para actions e npm.
- Proteger a `main` (o bot só via PR ou com regras de path: `dados/alertas.js` e `scripts/estado.json`).

### S4. Origem compartilhada do GitHub Pages (Média, LGPD)

**Evidência:** o remoto é `github.com/rograhl75-spec/caracterizador-pericial`, publicado em `https://rograhl75-spec.github.io/caracterizador-pericial/` (LEIA-ME.md:40). O localStorage é por **origem**, não por caminho. Qualquer outro repositório Pages da mesma conta (`rograhl75-spec.github.io/qualquer-coisa`), inclusive um repositório de teste com XSS ou um script de terceiro, lê `caracterizador:v2` (nomes de segurados, histórico laboral, dados de saúde) e `caracterizador:perfil`.

**Correção:** publicar num domínio próprio exclusivo (ex.: `app.grahlconsultoria.com.br`, via CNAME do Pages) antes da comercialização e citar isso na política. Até lá, não publicar outros Pages nessa conta.

### S5. Sem Content-Security-Policy (Baixa: defesa em profundidade)

**Evidência:** não há CSP (o Pages não permite cabeçalhos, mas aceita `<meta http-equiv>`). Testei (`csp.js`) uma cópia de `index.html` com:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'
```

Navegando por todas as abas e imprimindo, a **única violação** foi o `onload="this.media='all'"` do link do Google Fonts (`index.html:10`). O SW continuou funcionando.

**Correção:**
- Trocar o truque `media=print onload` por fontes self-hosted (ver P5) ou por `<link rel="stylesheet">` normal.
- Adicionar a meta CSP acima em `index.html`, `termos.html` e `privacidade.html`, mais `<meta name="referrer" content="strict-origin">`.
- `frame-ancestors` não funciona via meta, e o Pages não envia `X-Frame-Options` (risco baixo de clickjacking, porque não há ações sensíveis).

### S6. Hash com `%` malformado: tela em branco (Baixa)

**Evidência** (`hash.js`): `#ir/%E0%A4%A` e `#biblioteca/textos/x/%E0%A4%A` lançam `URIError: URI malformed` e deixam o `main` vazio. Um link compartilhado e truncado basta.

**Causa:** `decodeURIComponent` sem `try` em `js/app.js:944-945`.

**Correção:** `const dec=s=>{try{return decodeURIComponent(s)}catch{return ''}}`, com fallback para `inicio`.

As demais rotas (`tese:__proto__`, `lib:<payload>`, `txt:<payload>`, `teses/toString`…) não executaram nada e caíram em telas válidas. Mesmo assim, `TESES[h1]` e `TESES[v]` aceitam chaves herdadas (`__proto__`): use `Object.hasOwn`.

### S7. Destaque de busca corrompe a marcação (Baixa)

**Evidência** (`hl.js`):
- `hlTerms('Ruído contínuo',['ruido','ar'])` devolve `<m<mark>ar</mark>k>Ruído</m<mark>ar</mark>k>`, porque o segundo termo casa dentro da tag do primeiro.
- `hl('A & B','amp')` devolve `A &<mark>amp</mark>; B`, ou seja, uma entidade quebrada que aparece como "&amp;".

Não há XSS, porque só são inseridas tags fixas, mas buscas comuns ("ar comprimido", "ruído ar") geram HTML inválido.

**Causa:** `js/app.js:818` e `:874` aplicam a regex sobre o HTML já escapado.

**Correção:** localizar as faixas no texto original (sem escapar), unir os intervalos e só então montar `esc(trecho)+'<mark>'+esc(alvo)+'</mark>'…`.

### S8. `splitRows` reinsere texto como HTML (Baixa, latente)

**Causa:** `js/app.js:1066`. Nós de texto soltos viram `out.push(ch.textContent)`, que decodifica `&lt;` em `<`, e depois vão para `root.innerHTML` (`:1081`). Hoje nenhum dado de usuário cai em nó de texto solto: `mxss.js` preencheu todos os inputs com payload e imprimiu ficha, NR-15, NR-16, teses e textos, sem execução. Basta, porém, uma mudança de template para abrir um XSS na impressão.

**Correção:** `out.push(esc(ch.textContent))`.

### S9. Robô: Issue, prompt injection e crescimento dos arquivos (Baixa)

- O título e a URL externos entram em markdown na Issue (`monitor.mjs:194-197`). Isso permite @menções (notificações a terceiros), links e imagens rastreadoras.
- O texto da página vai para o Claude (`:160-166`), e a resposta vai para a Issue e para `alertas.js` (`analise`). Não é exibida no app (confirmado), mas é prompt injection possível.
- **Correção:** envolver título e URL em code span (`` `...` ``), trocar `@` por `@​`, limitar o tamanho e tratar `analise` como texto não confiável. Nunca exibir `analise` no site sem escapar.
- `ALERTAS` e `estado.links` só crescem: o robô nunca remove nada e não há limite de quantidade por execução. Uma página hostil com 10 mil links PDF incharia o `alertas.js` que todo usuário baixa.
- **Correção:** limitar a cerca de 20 alertas novos por fonte e por execução, arquivar os revisados fora do site (ex.: `scripts/alertas-arquivo.json`) e publicar só os pendentes.

### S10. Diversos (Baixa)

- **Imagens do timbrado (ok):** o SVG disfarçado de `.png` é recusado ("Não foi possível ler a imagem"). Toda imagem é re-codificada em JPEG pelo canvas, e o data URL é sempre `data:image/jpeg` gerado localmente. `a4v`/`a4h` não são importados do backup. Não há injeção de data URL.
- **`importarArquivo`** lê o arquivo inteiro sem limite (`js/app.js:1126`). Recusar acima de cerca de 5 MB e limitar o número de casos (ex.: 500).
- **`window.open('http://caepi.mte.gov.br/…')`** usa HTTP (`js/app.js:996`). Usar `https://` se o site oferecer, ou avisar.
- **Links externos:** todos os `target=_blank` têm `rel="noopener"` (ok). Adicionar `noreferrer` ou uma meta referrer, se quiser não informar a origem.
- **Aceite dos termos:** o perfil importado inclui `aceite`, então o aceite de outra pessoa passa a valer neste navegador (`js/app.js:1136`). Não importar `aceite` nem `tour`.
- **Área de transferência:** só `writeText` (quadro-resumo, CA, link), sem leitura (ok). O quadro-resumo leva dados do caso para o clipboard do sistema. Mencionar isso na política.

---

## Privacidade (LGPD)

**Dados tratados:**
1. Perfil do profissional: nome, profissão, registro, contato, cidade e imagens do timbrado, num único objeto em `caracterizador:perfil`.
2. Casos sobre terceiros: nome do caso (o exemplo sugere identificação), empresa, função, períodos, agentes e EPI. Podem revelar a condição de saúde do segurado, que é dado sensível (art. 5º, II, e art. 11).
3. Favoritos com anotações livres, recentes e a data das novidades vistas.
4. O registro do aceite (versão e data).

**O que sai do navegador** (verificado: grep por `fetch`, `XMLHttpRequest`, `sendBeacon` e `http` no app, mais interceptação de rede no Playwright):
- **apenas** a requisição ao Google Fonts (CSS e woff2, com o IP e o User-Agent), em todas as cargas e **antes do aceite**;
- os acessos ao GitHub Pages (logs de hospedagem);
- as páginas externas abertas pelo usuário.

Não há analytics, cookies ou envio de dados de caso. O robô e a API Anthropic tratam só páginas públicas do governo, sem dados pessoais.

### L1. Divergências e lacunas nos textos (Média)

| # | Texto atual | Realidade / lacuna | Ajuste sugerido |
|---|---|---|---|
| 1 | Privacidade §3: o backup é "um arquivo com todos os casos e o perfil" | O backup **exclui as imagens do timbrado** (`perfilSemImagens`, `js/app.js:1147`), e a própria tela diz isso | "…e o perfil, sem as imagens do timbrado" |
| 2 | §1: "ficam gravados apenas no armazenamento local… A Grahl não tem acesso" | Verdade, mas **a origem `*.github.io` é compartilhada** com outros sites da conta (S4). Os dados ficam **sem criptografia** e **sem prazo** | Citar o domínio exclusivo e que os dados não são cifrados; recomendar senha de usuário no dispositivo |
| 3 | §4: o Google recebe "dados técnicos… IP" | Correto, mas ocorre **antes do aceite** e implica **transferência internacional** (art. 33). O SW guarda cópia das fontes | Self-host das fontes (P5) e remoção do §4; ou citar a transferência internacional e a base legal (legítimo interesse) |
| 4 | §2: o usuário é controlador dos dados de terceiros | Falta dizer que podem ser **dados sensíveis de saúde** (art. 11) e que **exportações e impressões** (JSON, PDF, área de transferência) saem do controle do app | Acrescentar recomendações: pseudonimizar o "nome do caso", guardar os backups com segurança, apagar a área de transferência |
| 5 | Ausente | **Identificação do controlador** (razão social, CNPJ, endereço), **encarregado/canal** (art. 41), **bases legais** (art. 7º) dos poucos tratamentos da Grahl (logs, fontes), **direitos do titular** (art. 18) e retenção dos logs do GitHub | Incluir seções curtas |
| 6 | Ausente | O app **guarda localmente o registro do aceite** (versão e data) e preferências (tutorial, novidades vistas, recentes) | Listar as chaves gravadas e informar que "Apagar todos os meus dados" remove todas (confirmado em `js/app.js:1219`) |
| 7 | Termos §7: "Quando a versão mudar, a ferramenta pedirá novo aceite" | Verdade (`TERMOS_VERSAO`), mas o aceite pode ser importado de outro perfil (S10) e, offline, o SW pode servir uma versão antiga dos termos | Não importar `aceite`; os termos seguem rede-primeiro |
| 8 | Termos §3: "Alterações detectadas… são sinalizadas na tela" | Depende do robô; em rede lenta o SW pode manter o `alertas.js` antigo indefinidamente (P1) | Corrigir P1 ou mencionar a limitação |
| 9 | Privacidade §5: "não usa cookies de publicidade nem ferramentas de análise" | Correto | Pode dizer "não usa cookies" (não há nenhum) |

---

## Desempenho

### Medições (servidor local com gzip; requisições externas bloqueadas; viewport de 390 × 844)

**Arquivos (bytes brutos / gzip -9):**

| Arquivo | Bruto | gzip |
|---|---|---|
| `app.js` | 241.486 | 79.643 |
| `biblioteca.js` | 200.504 | 52.578 |
| `estilo.css` | 58.659 | 12.627 |
| `normas-base.js` | 47.322 | 15.281 |
| `nr16.js` | 31.763 | 9.174 |
| `textos.js` | 30.710 | 8.675 |
| `motor.js` | 23.352 | 8.435 |
| `logo-grahl.png` (480×131, exibido com 34 px de altura) | 61.558 | 61.601 |

- **1ª visita:** 21 requisições, **284 KB transferidos** (750 KB descompactados), mais Google Fonts (~19 KB de CSS e 4 woff2 latin = **112 KB**). Total aproximado: **415 KB**.
- O SW, ao instalar, guarda 29 arquivos (**964 KB** no Cache Storage); na 2ª visita são 33 entradas, 1,06 MB, e o uso estimado de armazenamento chega a 3,8 MB.

**Tempos de carga** (ms; CDP `Network.emulateNetworkConditions` + `Emulation.setCPUThrottlingRate`):

| Rede | CPU | FCP (só o cabeçalho) | LCP / conteúdo (DCL) | load |
|---|---|---|---|---|
| sem limite | 1× | 68 | 112 | 112 |
| sem limite | 4× | 116 | 285 | 288 |
| 3G rápido (562 ms, 1,44 Mb/s) | 4× | 1.508 | **3.533** | 4.348 |
| 3G lento (2 s, 400 kb/s) | 4× | 5.084 | **12.085** | 15.240 |

- Heap JS de ~10 MB. O custo de CPU da carga é pequeno (ScriptDuration < 0,1 s em 4×): **o gargalo é a rede**.

**`render()`** (mediana de 5 execuções, ms, 1× / 4×):

| Tela | 1× | 4× | Nós |
|---|---|---|---|
| Simulação (caso) | 4,4 | 22,8 | 740 |
| Insalubridade Anexo 11 | 3,7 | 16,2 | 1.982 |
| Biblioteca "todos os quadros" (130 KB de HTML) | 3,5 | 13,3 | 1.621 |
| Teses | 3,3 | 9,4 | — |
| Resultado | 3,6 | 13,4 | — |

Todas as telas ficam bem abaixo de 50 ms.

**Digitação:**

| Campo e texto digitado | ms por tecla (1×) | ms por tecla (4×) |
|---|---|---|
| Busca geral "silica cristalina" | 3–8 (pico de 41 na 2ª letra) | 11–25 (pico de 135) |
| Filtro da Biblioteca "benzeno" | 8–67 | **38–213** |
| Filtro da Biblioteca "de" | 68–127 | **350–463** |
| Filtro do Anexo 11 "cloro" | 9–25 | 35–149 |

### P1. Service worker: em rede lenta o cache nunca atualiza (Média)

**Evidência** (`sw-test.js`, servidor com atraso de 6,5 s em `dados/textos.js` e o arquivo alterado):
- O conteúdo novo **não foi servido** nem no 1º nem no 2º reload, e **o cache não foi atualizado**.
- `comTempo(fetch(req),5000)` rejeita, mas a resposta que chega depois é descartada (`sw.js:45-46`).
- No 3G lento os 18 scripts dividem 50 KB/s (284 KB levam cerca de 6 s): os maiores (`app.js`, `biblioteca.js`) passam de 5 s com frequência.
- Resultado: os usuários de sinal fraco (justamente o público "perícias sem sinal") ficam **indefinidamente com a base normativa e os alertas antigos**. Também é possível uma **mistura de versões**: `app.js` novo, que chegou em menos de 5 s, com `dados/*.js` antigos do cache, ou o inverso.
- Em visitas repetidas, a estratégia rede-primeiro não ganha nada com o cache: espera a rede até 5 s.

**O que funciona:**
- Sem conexão, a navegação (inclusive com `?utm=`) abre o app pelo cache, e uma página inexistente cai no `index.html`.
- Mudar o `VERSAO` (v9 → v10) instala o novo SW, apaga o cache antigo e faz `clients.claim` (`controllerchange` disparou). A página aberta continua com o JS antigo até o próximo reload, sem aviso.
- Alterar um arquivo sem mudar o `VERSAO` também chega ao usuário com rede boa.

**Correção:**
- No timeout, servir o cache **e continuar a requisição em segundo plano** (`ev.waitUntil(rede.then(r=>r.ok&&c.put(req,r.clone())))`), ou seja, stale-while-revalidate com o timeout só para a resposta.
- Versionar os dados como conjunto: precache atômico por `VERSAO` e cache-first para os arquivos do conjunto, checando a versão via `sw.js` (o navegador verifica `sw.js` a cada navegação). Ou gerar um manifesto com hash dos arquivos.
- Mostrar "Nova versão disponível, recarregar" no `controllerchange` ou quando `registration.waiting` existir.

### P2. Carga bloqueante: 18 scripts síncronos (Média)

**Evidência:**
- O 1º paint mostra só o cabeçalho. O conteúdo aparece apenas no DCL, quando o último script termina: **3,5 s no 3G rápido e 12,1 s no 3G lento**.
- `dados/biblioteca.js` (53 KB gz, 27% do JS) é o **primeiro** script e só é usado na Biblioteca e na busca geral. O mesmo vale para `textos.js`, `in128-artigos.js` e `historico-nr.js`.
- Há 18 requisições separadas, sem `defer` e sem preload.

**Causa:** `index.html:28-45`.

**Correção:**
1. Usar `defer` em todos os scripts (mantém a ordem e libera o parser).
2. Concatenar e minificar num build simples (mesmo sem bundler: `cat` + `terser`, ou `esbuild --minify`). A estimativa é de 214 KB gz para cerca de 150 KB gz e de 18 para 2–3 requisições.
3. Carregar sob demanda (`import()` ou `<script>` injetado) `biblioteca.js`, `textos.js`, `in128-artigos.js` e `historico-nr.js` ao abrir a Biblioteca ou ao digitar na busca. A tela Início não precisa deles.
4. Converter `logo-grahl.png` (61 KB) para WebP ou SVG com cerca de 250 px de largura (menos de 10 KB).

### P3. Imagens do timbrado no localStorage (Média)

**Evidência** (`timbrado.js`, `timbrado2.js`):

| Imagem enviada | Resultado | Tamanho no localStorage |
|---|---|---|
| A4 típica (cabeçalho e rodapé, 2480×3508) | Gravada | 23 K caracteres |
| A4 fotográfica ou escaneada, deitada (largura 1754) | Gravada | **3,06 M caracteres** |
| A mesma imagem em pé (largura 1240) | Gravada | 1,37 M caracteres |

- As duas imagens fotográficas somam cerca de **4,4 M caracteres de uma cota aproximada de 5,2 M** (sobraram ~2,1 M depois da 1ª). A cota é compartilhada com os casos e com qualquer outro site da mesma origem (S4).
- Uma imagem de 1240×20000 foi recusada corretamente com a mensagem "grande demais". A altura não é limitada, então a recusa só vem da cota.
- Com os timbrados grandes, **cada tecla em qualquer campo do perfil** serializa o perfil inteiro: **18–20 ms (1×) e 88–112 ms (4×)** por tecla (`js/app.js:1146`, `:1205`).
- Se a cota acabar, `persist()` dos **casos** passa a falhar; o usuário recebe um aviso, mas pode perder edições.

**Correção:**
- Limitar a altura (A4: 1240×1754 em pé e 1754×1240 deitado) e recortar ou ajustar à proporção A4.
- Usar `toDataURL('image/jpeg',0.7)` ou WebP e recusar acima de cerca de 600 KB.
- Guardar as imagens em **IndexedDB** (Blob) ou em chave separada (`caracterizador:timbrado:a4v`), fora do objeto do perfil, para não serializá-las a cada tecla.
- Usar `debounce` (300 ms) em `salvarPerfil` e em `save()`.
- Opcional: `navigator.storage.persist()` para reduzir o risco de despejo do armazenamento.

### P4. Filtro da Biblioteca sem debounce (Baixa)

- Cada tecla executa `render()` completo e `marcarSiglas()`, a 200–460 ms com CPU 4×, o que trava a digitação em celulares intermediários (`js/app.js:982`, `:1450`, `:1653`).
- **Correção:** debounce de 150–250 ms e atualizar só a área de resultados (como já se faz em `#ures`/`#lires`). Pré-calcular o texto normalizado (`normTxt`) de cada linha uma vez.

### P5. Google Fonts (Baixa, com impacto LGPD)

- São cerca de 131 KB de terceiro, com troca tardia de fonte (FOUT e deslocamento de layout) e envio do IP ao Google antes do aceite.
- **Correção:** hospedar no próprio site os 4 woff2 latin (Archivo wdth 87.5 600/700/800, Source Sans 3 400/600/700/400 itálico, JetBrains Mono 400/600), com subset, `font-display: swap` e `<link rel="preload" as="font" crossorigin>` só para a fonte do corpo. Incluí-los em `ARQUIVOS`. Isso resolve S5 (CSP), L1 nº 3 e o funcionamento offline na 1ª visita.

### P6. Cache Storage (Baixa)

- 20 `fetch('dados/biblioteca.js?v=i')` geraram 54 entradas e 4,98 MB, porque `c.put(req)` usa a URL com query e o cache nunca é podado (`sw.js:46`).
- As respostas *opaque* do Google Fonts (`sw.js:35`) contam com padding de cota no Chromium.
- O precache inclui `timbrado-a4-*.jpg` (110 KB), que só são usadas na impressão.
- **Correção:** `c.put(new Request(url.origin+url.pathname), …)` só para os caminhos de `ARQUIVOS`; não guardar opaque (com fontes próprias isso some); manter as imagens de timbrado em runtime cache.

---

## O que foi verificado e está correto

- `esc()` em todos os pontos de `innerHTML` com dados do usuário, importados ou do robô, em 139 usos. Não há atributos com aspas simples nem handlers inline gerados. Não há `eval`/`Function`.
- Rotas `#ir/...` validadas por `destinoValido`. `getElementById` com ids decodificados não é injetável.
- `target=_blank` sempre com `rel="noopener"`.
- O timbrado é re-codificado por canvas: SVG ou scripts não passam.
- Workflows: sem injeção via `${{ }}`, `testes.yml` só leitura, segredo não logado, gravação do `alertas.js` com `JSON.stringify` (não há como injetar código no arquivo JS).
- "Apagar todos os meus dados" remove todas as chaves do app.
- O SW funciona offline, inclusive com query string e fallback para `index.html`; a troca de `VERSAO` limpa os caches antigos.
