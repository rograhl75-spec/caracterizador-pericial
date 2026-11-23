# Auditoria 3 + 4 — Compatibilidade de navegadores e Acessibilidade (WCAG 2.2 AA)

**App:** Caracterizador Pericial (repo `/home/user/caracterizador-pericial`, commit `eb0cc99`)
**Data:** 23/11/2026 · **Auditor:** independente (nenhum arquivo do repositório foi alterado)

## Método

- **Servidor**: estático em processo (Node `http`, só leitura) em `http://localhost` (contexto seguro → Service Worker e Clipboard ativos). Requisições externas (Google Fonts) bloqueadas para o resultado ser reproduzível; vale a pilha de fontes de reserva.
- **Motor**: só Chromium (Playwright 1.63). Firefox/WebKit **não** foram executados; a compatibilidade com eles foi avaliada por revisão estática + emulação de dispositivos no Chromium (`iPhone 13`, `iPad (gen 7)`, `Galaxy S9+`, toque, movimento reduzido, esquema escuro forçado, 320 px, 200 % de zoom como 640×400 e 960×540, espaçamento de texto WCAG 1.4.12).
- **axe-core 4.x** injetado em 27 estados de tela × 2 esquemas (claro/escuro) com as tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, mais uma passada em 320 px com `best-practice`.
- **Testes próprios**: sequência de Tab (45 paradas por rota), foco visível, foco obscurecido pelo cabeçalho fixo (Tab e Shift+Tab), perda de foco após ações, diálogos (`#termos`, `#tutorial`, `#glpop`, `#preview`, toast com “Desfazer”), alvos < 24 px (2.5.8, com a exceção de espaçamento), reflow, rolagem horizontal, rótulos, títulos, landmarks, regiões vivas.
- Primeira carga: banner de termos aceito com “Concordo” e `#tutorial` fechado com Esc (exceto nos testes desses dois diálogos).

Scripts e evidências: pasta `/tmp/claude-0/-home-user-caracterizador-pericial/5d13d8eb-262e-5476-affc-a99f9b958dfc/scratchpad/auditorias/ca/`
(`audit.js`, `interativo.js`, `extra.js`, `extra2.js`, `extra3.js`, `axe-mobile.js`, `focoperdido.js`, `esver.js`; resultados `axe-results.json`, `axe-320.json`, `interativo.json`; capturas `ca-*.png`).

---

## Resumo executivo

| Severidade | Qtde | Principais |
|---|---|---|
| **Alta** | 4 | Foco perdido ao escolher anexo/agente/filtro (A11Y-01); “Desfazer” do toast inalcançável pelo teclado e, depois, invisível mas focável (A11Y-02); data digitada em mm/dd sem aviso em navegador com idioma de interface diferente do idioma regional (COMP-01); app inteiro some em navegadores sem ES2020, sem aviso (COMP-02, alta só para quem usa iOS ≤ 13.3 ou Edge antigo) |
| **Média** | 14 | Contraste do dourado `--gold` (≈ 500 nós), bordas de campos 1,4:1, anel de foco 2,4:1 sobre a faixa, tutorial modal sem confinamento de foco, foco escondido sob o cabeçalho fixo (2.4.11), linhas do tempo SVG com botões dentro de `role=img`, padrão de abas ARIA incompleto, regiões roláveis sem foco, troca de tela sem anúncio/título, `0.125` lido como 125 com teclado decimal em inglês, impressão no iOS, armazenamento expirável no Safari, glossário fora de ordem, banner de termos |
| **Baixa** | 12 | Atalho “/” sem desligar, sem link “pular para o conteúdo”, títulos h2→h4 em Teses, `<th>` vazio, `aria-label` em `div`, 18 px de rolagem horizontal em 320 px, alvos de 14 px na linha do tempo, transição do toast com movimento reduzido, detecção de iPad, `@page size` no Safari, clipboard sem tratamento de rejeição, `:has()` em Firefox < 121 |

**Pontos fortes verificados:** `lang="pt-BR"`; um único `h1` e hierarquia h2/h3 coerente (só Teses salta nível); landmarks `header`/`nav[aria-label]`/`main`/`footer`/`aside`; **nenhum campo sem rótulo** em 27 telas; `aria-current="page"` nas abas; foco visível em todos os controles HTML (2 px `--focus`), inclusive `input[type=date]` e o botão de arquivo (`:focus-within`); validação com `aria-invalid` + `aria-describedby` + `role=status` (js/app.js:1565-1569); `prefers-reduced-motion` desliga rolagem suave (css:529); nenhuma rolagem horizontal da página em 390/810/640 px; teclas Enter/Espaço nos segmentos SVG; toque nos segmentos funciona (iPhone/iPad/Galaxy emulados); `localStorage` sempre em `try/catch`; fallback de cópia com `execCommand`; `-webkit-mask-image` presente; modo escuro com contraste quase todo aprovado.

---

## Tabela de violações axe por rota (nós afetados, por impacto: crítico / sério / moderado / menor)

Desktop 1280×800, tags WCAG 2.0–2.2 A/AA.

| Rota | Claro | Regras (claro) | Escuro | Regras (escuro) |
|---|---|---|---|---|
| #inicio | 0/6/0/0 | color-contrast×6 | 0/0/0/0 | — |
| #funcao | 0/1/0/0 | color-contrast×1 | 0/0/0/0 | — |
| #aposentadoria/agentes | 0/8/0/0 | color-contrast×8 | 0/1/0/0 | color-contrast×1 |
| #ir/ag:ruido | 0/8/0/0 | color-contrast×8 | 0/1/0/0 | color-contrast×1 |
| #ir/ag:calor | 0/15/0/0 | color-contrast×15 | 0/1/0/0 | color-contrast×1 |
| #aposentadoria/data | 0/11/0/0 | color-contrast×9, nested-interactive×2 | 0/2/0/0 | nested-interactive×2 |
| #aposentadoria/data + “Comparar com outra data” | 0/39/0/0 | color-contrast×39 | 0/37/0/0 | color-contrast×37 |
| #aposentadoria/comparar | 0/10/0/0 | color-contrast×10 | 0/0/0/0 | — |
| #aposentadoria/caso | 0/3/0/0 | color-contrast×3 | 0/0/0/0 | — |
| #aposentadoria/resultado | 0/51/0/0 | color-contrast×50, nested-interactive×1 | 0/1/0/0 | nested-interactive×1 |
| #insalubridade | 0/20/0/0 | color-contrast×20 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:1 | 0/19/0/0 | color-contrast×19 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:3 | 0/19/0/0 | color-contrast×19 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:8 | 0/19/0/0 | color-contrast×19 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:11 | 0/19/0/0 | color-contrast×19 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:13 | 0/29/0/0 | color-contrast×29 | 0/2/0/0 | color-contrast×2 |
| #ir/a15:14 | 0/20/0/0 | color-contrast×20 | 0/1/0/0 | color-contrast×1 |
| #periculosidade | 0/22/0/0 | color-contrast×22 | 0/1/0/0 | color-contrast×1 |
| #ir/a16:a1 | 0/22/0/0 | color-contrast×22 | 0/1/0/0 | color-contrast×1 |
| #ir/a16:a2 | 0/22/0/0 | color-contrast×22 | 0/1/0/0 | color-contrast×1 |
| #ir/a16:a4 | 0/22/0/0 | color-contrast×22 | 0/1/0/0 | color-contrast×1 |
| #teses | 0/73/0/0 | color-contrast×73 | 0/0/0/0 | — |
| #biblioteca | 0/1/0/0 | color-contrast×1 | 0/0/0/0 | — |
| #biblioteca/textos/in128 | 0/2/0/0 | color-contrast×2 | 0/0/0/0 | — |
| #biblioteca/historico | 0/1/0/0 | color-contrast×1 | 0/0/0/0 | — |
| #perfil | 0/1/0/0 | color-contrast×1 | 0/0/0/0 | — |
| busca #gq (“ruido”) | 0/1/0/0 | color-contrast×1 | 0/0/0/0 | — |
| **Total** | **0/516/0/0** | | **0/63/0/0** | |

**Passada extra em 320 px (axe com best-practice, sem color-contrast):** `scrollable-region-focusable` (sério) em #aposentadoria/caso ×4, #biblioteca ×1, #biblioteca/historico ×1; `nested-interactive` em #aposentadoria/data ×2 e #aposentadoria/resultado ×1; `heading-order` (moderado) em #teses; `empty-table-header` (menor) em #aposentadoria/comparar e #ir/a15:11.
**Itens “incompletos” do axe (revisão manual):** `form-field-multiple-labels` em 33 checkboxes de #periculosidade/#ir/a16:* (cada checkbox tem `<label>` envolvente e outro `for=` — confirmar que o primeiro rótulo tem o texto completo); `aria-prohibited-attr` em `div.txidx[aria-label]` (#biblioteca/textos/in128).

Nenhum erro de JavaScript (`pageerror`) em nenhuma rota, nos dois esquemas.

---

## Achados priorizados

### Alta

**A11Y-01 — Foco perdido (vai para `<body>`) ao escolher anexo, agente ou filtro**
- Rotas: #insalubridade / #ir/a15:* (abas de anexo), #periculosidade / #ir/a16:* (abas de anexo), #aposentadoria/agentes (botões de agente), #teses (filtros `data-tf`).
- Evidência (`focoperdido.js`): Enter em `button[data-a15="3"]`, `button[data-a16="a1"]`, `button[data-ag="calor"]`, `button[data-tf="todos"]` → `document.activeElement === body`. O próximo Tab recomeça no campo de pesquisa do topo; o leitor de tela perde o contexto. Viola 2.4.3 (ordem de foco) e prejudica 2.1.1 na prática.
- Causa: `render()` reescreve `#main.innerHTML` (js/app.js:937-942) e esses handlers não devolvem o foco: js/app.js:1014 (`data-a15`), :1015 (`data-a16`), :991 (`data-ag`), :1017 (`data-tf`). Outros handlers já fazem isso certo (ex.: :1420, :1286, :876).
- Correção: centralizar em `render()` a restauração do foco por seletor estável, p.ex. guardar `const k=document.activeElement?.dataset` e, depois do `innerHTML`, focar `[data-a15="${S.a15}"]` / `[data-a16=…]` / `[data-ag=…]` / `[data-tf=…]`; ou, de forma genérica, se o elemento focado tinha `data-*` de ação, procurar o equivalente no novo DOM. Para o agente, levar o foco ao `h2` da ficha (com `tabindex="-1"`) também é aceitável.

**A11Y-02 — “Desfazer” do toast inalcançável pelo teclado; depois some mas continua focável**
- Rota: #aposentadoria/caso (Remover período), também “Exemplo restaurado” (js/app.js:1005).
- Evidência (`extra.js`, `ca-toast.png`): após “Remover”, o foco vai para o 1º campo; são necessários **84 Tabs** para chegar ao botão “Desfazer”, que some em **8 s**. Após o tempo, `#toast` fica `opacity:0` mas o botão continua no DOM, com `tabIndex=0`, e recebe foco invisível (falha 2.4.7/2.4.11). O tempo fixo sem extensão falha 2.2.1 (Tempo ajustável); para usuários de teclado e leitor de tela a exclusão é, na prática, irreversível.
- Causa: js/app.js:1105-1108 (`avisar`): botão anexado ao fim do `<body>`, sem mover o foco, `setTimeout(…,8000)` que só tira a classe `.on`; css:555-556/705 (esconde só com opacidade).
- Correção: (1) não usar tempo para o toast com ação — manter até ser dispensado ou até a próxima ação, ou pausar em `:hover`/`:focus-within`; (2) ao exibir com ação, oferecer atalho (ex.: Ctrl+Z) e/ou mover o foco para “Desfazer” e devolvê-lo ao fechar; (3) ao esconder, remover o botão ou aplicar `visibility:hidden`/`inert` (`#toast:not(.on){visibility:hidden}`, com `transition: visibility 0s .2s`).

**COMP-01 — Data mostrada em mm/dd/aaaa sem aviso quando o idioma da interface do navegador difere do idioma regional**
- Rotas: #aposentadoria/caso (início/fim de cada período), #aposentadoria/data (`#rd-data`, `#rd-data2`), simulador.
- Evidência: no Chromium com `locale: pt-BR` (Intl = pt-BR) e interface em inglês, os campos de data aparecem **`12/31/2003`** (`ca-toast.png`, `ca-iphone-foco-sob-cabecalho.png`) e **nenhuma** nota “Lida como …” aparece. Quem digita `01021991` grava 02/01/1991 em vez de 01/02/1991 — erro silencioso no tempo especial calculado.
- Causa: js/app.js:1591-1592 — `LOCAL_BR` usa `Intl.DateTimeFormat().resolvedOptions().locale`, mas o formato do `input[type=date]` segue o idioma da **interface** do Chrome, o idioma do **sistema** no Safari/iOS e as preferências regionais do Firefox; não há API para descobrir esse formato.
- Correção: chamar `notaData()` sempre (remover o retorno antecipado por `LOCAL_BR`), mostrando “dd/mm/aaaa” por extenso abaixo de cada data (ex.: “01 de fevereiro de 1991”), ou usar `input type="text" inputmode="numeric"` com máscara dd/mm/aaaa e validação própria (consistente em todos os motores).

**COMP-02 — Navegadores sem ES2020 ficam com o app em branco e sem aviso**
- Evidência (`esver.js`, parser acorn): `js/app.js` só é aceito com `ecmaVersion ≥ 2020` (usa `??` em js/app.js:3, 127, 128, 149… e `?.` em :996). Um erro de sintaxe impede a execução do arquivo inteiro: abas, busca e telas não são geradas. `index.html` não tem `<noscript>` nem mensagem de “navegador não suportado”.
- Grupos afetados: iOS/iPadOS ≤ 13.3 (iPhone 6, iPad Air 1 e iPads antigos presos em iOS 12), Safari ≤ 13.0, Chrome/Edge < 80, Firefox < 74, **Edge Legado (EdgeHTML 18) em Windows 10** e navegadores embutidos antigos (WebView de apps jurídicos, Samsung Internet < 13).
- Correção: (a) transpilar `app.js` para ES2019 (esbuild `--target=es2019`, ou trocar os ~12 usos de `??`/`?.` à mão); (b) colocar no `index.html` um pequeno script inline ES5 que verifique `try{new Function('a?.b??1')}catch(e){…}` e mostre “Seu navegador é antigo demais — atualize para …”; (c) `<noscript>` com o mesmo aviso.

### Média

**A11Y-03 — Contraste insuficiente do dourado `--gold` (#A97F14) no tema claro** (1.4.3)
- Evidência (axe `color-contrast`, ~500 nós): `p.eyebrow` sobre `--bg` **3,32:1**; títulos de grupo (`Físicos`, `Químicos`…), `<b>Anexo N</b>`, `dt`, links de agente nas teses, `button.printbtn` sobre branco **3,66:1**; `span.trib.t-STJ` e `.mxc.mx-l` sobre `--gold-soft` **3,05:1**; `button.gl` (siglas do glossário) 3,66:1. Em todas as rotas (ver tabela).
- Causa: css/estilo.css:3 (`--gold:#A97F14`), usos em :30 (`.eyebrow`), :100 (`.marcos time`), :255 (`.printbtn`), :406 (`.dl16 dt`) e chips de tribunal/método.
- Correção: escurecer o token no tema claro para **`#86650F`** (4,91:1 sobre `#F2F4F7`, 5,41:1 sobre branco, 4,51:1 sobre `#F4EAD0`) ou `#7E5F0E` (folga maior). Manter `--gold-line` para filetes decorativos.

**A11Y-04 — Outros contrastes de texto**
- `span.mudou` (“mudou”, 12 px negrito) branco sobre `--gold-line` **2,42:1** nos dois temas — 37–39 nós em #aposentadoria/data + comparar. Causa css:694. Correção: `color:var(--ink)` fixo escuro (`#0F1C2E` → 7,08:1) ou fundo `#86650F`.
- Abas de anexo “revogado” (`button.off`, ainda clicáveis): **1,94:1** (claro) / **3,37:1** (escuro) — `opacity:.55` em css:446. Por ser controle ativo, não se aplica a exceção de “inativo”. Correção: remover a opacidade e indicar “revogado” com texto/ícone + cor `--muted`.
- Escuro: `--gold-line` (#C9A227) sobre botão selecionado `--sel` (#2A4F80) **3,43:1** (`.anx button.on b`, css:445; `.agg button.on small`, css:426). Correção: usar `--gold` do escuro (#D9B24A) ou `#E0BC55` (4,55:1).
- Texto de anexo não selecionado `#757D88` sobre `#F9FAFB` 3,98:1 (rótulo `span` dentro das abas) — mesma correção do item anterior.

**A11Y-05 — Bordas de campos com contraste 1,4:1** (1.4.11 Contraste não textual)
- Evidência: borda de `input/select/textarea` `#D3DAE4` sobre branco **1,41:1** (claro) e `#24364F` sobre `#0F1D31` **1,38:1** (escuro); o campo é branco sobre painel branco, então a borda é o único limite visual (`bordas` em `interativo.json`).
- Causa: css:106 (`border:1px solid var(--line)`).
- Correção: token específico `--field-line` = `#7D8BA0` (3,46:1) no claro e `#5A7299` (3,47:1) no escuro, usado só em campos e botões `ghost`.

**A11Y-06 — Anel de foco azul quase invisível sobre a faixa azul-marinho (tema claro)**
- Evidência: `:focus-visible{outline:2px solid #2F6FD6}` sobre `--band #1E3A5F` = **2,39:1** (< 3:1 de 1.4.11). Afeta as 8 abas e o logotipo; visível em `ca-tutorial.png` (aba “Teses”).
- Causa: css:31 combinado com css:34/42. (A busca `#gq` já usa dourado, 4,75:1 — css:216.)
- Correção: `.band :focus-visible{outline-color:var(--gold-line)}` (4,75:1) ou `#fff`.

**A11Y-07 — Tutorial com `aria-modal="true"` sem confinar o foco**
- Evidência (`interativo.js`, `ca-tutorial.png`): o foco inicial vai para “Próximo” (bom), mas **8 Tabs seguidos ficam todos fora do diálogo** (abas do cabeçalho atrás do véu); o fundo não é `inert`. Ao fechar com Esc o foco fica onde parou (ex.: aba “Teses”), não volta ao gatilho. Leitores que respeitam `aria-modal` (VoiceOver) e o Tab divergem.
- Causa: js/app.js:1376-1391.
- Correção: usar `<dialog>` com `showModal()` (Chrome 37, Firefox 98, Safari 15.4 — compatível com o piso real do app, ver tabela de versões), que confina o foco e torna o fundo inerte; ou aplicar `inert` em `header, main, footer` enquanto aberto. Guardar `document.activeElement` ao abrir e devolver o foco ao fechar. Usar `aria-labelledby` apontando para o `h2` do passo.
- Mesmo padrão em `#preview` (index.html:24; js/app.js:1090-1101): `aria-modal` sem confinamento e sem devolver o foco (Baixa, só aparece dentro de iframe).

**A11Y-08 — Foco encoberto pelo cabeçalho fixo ao navegar para trás** (2.4.11 Foco não obscurecido — mínimo, AA, novo na 2.2)
- Evidência (`extra.js`, `extra2.js`, `ca-iphone-foco-sob-cabecalho.png`): Shift+Tab no formulário de #aposentadoria/caso deixa o campo focado **total ou parcialmente sob o cabeçalho** em 10/60 paradas a 1280×800, 18/60 a 960×540 (200 % num monitor 1920) e 16/60 no iPhone 13. Com Tab para frente: 0. Em 960×540 o cabeçalho fixo ocupa 150 px (28 % da altura) e só se esconde abaixo de 700 px de largura (js/app.js:949).
- Causa: `.band{position:sticky}` (css:34) sem `scroll-padding-top`; o navegador rola o elemento até a borda do viewport.
- Correção: `html{scroll-padding-top:calc(var(--hdr,110px) + 8px)}` atualizando `--hdr` com a altura real do cabeçalho (ResizeObserver ou no `scroll`); no celular, ao receber `focusin` fora do cabeçalho com o cabeçalho visível, recalcular. Considerar não fixar o cabeçalho quando `innerHeight < 600`.

**A11Y-09 — Linhas do tempo SVG: botões dentro de `role="img"`** (4.1.2; axe `nested-interactive`, sério)
- Rotas: #aposentadoria/resultado (`svg.tl`, 16 `rect.seg` com `role=button`), #aposentadoria/data (`svg.tlv` com `g.tl-m`/`g.tl-seg` com `role=button`).
- Causa: js/app.js:102 (`role="img"` + js/app.js:109 `rect … role="button" tabindex="0"`), js/app.js:1663, 1667, 1672-1673.
- Efeito: `role=img` torna os filhos “apresentacionais”; no VoiceOver/TalkBack os botões ficam inalcançáveis por gestos de varredura (o Tab do teclado funciona). Os `g.tl-seg` não têm `aria-label` (dependem de `<title>`).
- Correção: trocar `role="img"` por `role="group"` com `aria-label`/`aria-describedby`; dar `aria-label` explícito aos `g.tl-seg`; manter a tabela “Mapa de enquadramento” / “Marcos gerais” como alternativa e ligá-la (`aria-describedby`). Alvos de 14 px (marcos) e de 2–8 px (segmentos curtos) — ver A11Y-20.

**A11Y-10 — Padrão de abas ARIA incompleto nos anexos NR-15/NR-16**
- Rotas: #insalubridade, #ir/a15:*, #periculosidade, #ir/a16:*.
- Causa: js/app.js:696 e :769 declaram `role="tablist"`/`role="tab"`/`aria-selected`, mas não há `role="tabpanel"`, `aria-controls`, tabindex itinerante nem setas (nenhum `ArrowLeft/ArrowRight` no código); cada um dos 15/9 anexos é uma parada de Tab; somado ao A11Y-01, o foco some ao ativar.
- Correção: ou implementar o padrão completo (setas, `tabindex=-1` nos não selecionados, `aria-controls` → painel com `role=tabpanel` e `aria-labelledby`), ou — mais simples e igualmente correto — remover os papéis de aba e usar botões com `aria-pressed`/`aria-current="true"`, como já é feito na lista de agentes.

**A11Y-11 — Regiões com rolagem horizontal sem foco pelo teclado** (2.1.1; axe `scrollable-region-focusable`, sério)
- Evidência (`axe-320.json`, `interativo.json`): em 320 px e em 640 px (zoom 200 %), `div.scrollx` com tabelas sem controles em #aposentadoria/caso (×4), #biblioteca (×1), `div.tscroll` em #biblioteca/historico; também em #aposentadoria/agentes a 320 px.
- Causa: css:67 (`.scrollx{overflow-x:auto}`), css:650 (`.tscroll`); geradores em js/app.js:187, 398, 513, 1416.
- Correção: no gerador (`tbl()`, js/app.js:398, e equivalentes) acrescentar `tabindex="0" role="region" aria-label="<título da tabela>"` ao contêiner rolável.

**A11Y-12 — Troca de tela sem anúncio, sem mudança de título e sem mover o foco** (2.4.2 / 4.1.3)
- Evidência: em todas as 27 telas `document.title` = “Caracterizador Pericial”; após Enter na aba “Teses” o foco continua no link da aba e nada é anunciado; a busca geral troca o conteúdo de `#main` a cada tecla sem região viva (“Resultados para …” não é anunciado).
- Causa: `route()`/`render()` em js/app.js:937-946; busca em js/app.js:965.
- Correção: em `route()`, `document.title = '<Seção> — Caracterizador Pericial'`; após navegação por hash, mover o foco para o `h2` principal (com `tabindex="-1"`) — exceto quando a origem é a própria busca; na busca, uma região `role="status"` fora de `#main` com “N resultados para ‘termo’” (com debounce de ~500 ms).

**A11Y-13 — Popover do glossário (`#glpop`) fora da ordem de foco e não anunciado**
- Evidência: ao ativar `button.gl` (ex.: “NEN”) o foco fica no gatilho; o próximo Tab vai para a sigla seguinte; são necessários **41 Tabs** para chegar a “Ver no glossário”, porque o popover é anexado ao fim do `<body>`. Não há `aria-expanded`/`aria-controls` no gatilho; o leitor de tela não anuncia a definição.
- Causa: js/app.js:1506-1518.
- Correção: inserir o popover logo após o gatilho (`b.after(pop)`), `aria-expanded="true"` + `aria-controls="glpop"` no botão, e `aria-describedby` ou região `role="status"` com o texto da definição; Esc devolve o foco ao gatilho (já fecha).

**A11Y-14 — Banner de termos: `role="dialog"` não modal no fim do DOM, cobrindo 30 % da tela no celular**
- Evidência: o foco não vai para o banner; **49 Tabs** até “Concordo”; em 390×700 ocupa 209 px no rodapé (`ca-termos-390.png`) e pode cobrir o elemento focado (2.4.11) enquanto não é aceito.
- Causa: js/app.js:1188-1195; css:557-560.
- Correção: inserir o banner como primeiro filho do `<body>` (ou do `main`) com `role="region" aria-label="Termos de uso"`, ou focar “Concordo” na primeira carga; acrescentar `scroll-padding-bottom` igual à altura do banner enquanto ele existir.

**COMP-03 — Número com ponto lido como milhar: `0.125` vira 125 com teclado decimal de região inglesa**
- Evidência: `num('0.125')` = **125**, `num('1.250')` = 1250, `num('12.345')` = 12345 (js/motor.js:9); `inputmode="decimal"` (js/app.js:127) mostra no iOS/Android o separador da **região do aparelho** (ponto em en-US, vírgula em pt-BR). A nota “Entendido como 125 (ponto como separador de milhar)” aparece (js/app.js:1577), mas a interpretação padrão é a errada para concentrações e doses típicas (0,125 mg/m³).
- Correção: tratar `^\d{1,3}\.\d{3}$` como **ambíguo** e exigir confirmação (aviso `aria-invalid` + “Quis dizer 0,125 ou 125?”) em campos cuja faixa usual (`regraCampo`) é menor que 1000; ou aceitar o ponto como decimal quando a faixa do campo torna o milhar implausível.

**COMP-04 — Impressão (função central: laudo/simulação) no iOS instalado como app e no Safari**
- `window.print()` (js/app.js:1089, 1098) dentro de PWA iOS em modo `standalone` falhou em silêncio em várias versões do iOS (relatos até o iOS 15/16); `afterprint` é usado para limpar o estado. Não foi possível testar em WebKit real.
- `@page{size:A4 landscape}` (index.html:25, js/app.js:1084): o Safari historicamente ignora `size`, então a orientação paisagem do relatório não é aplicada automaticamente.
- Correção: no iOS `standalone`, mostrar o `#preview` com instrução “Compartilhar → Imprimir” e/ou oferecer “Abrir no Safari”; testar em iPhone real; nas instruções de impressão, avisar para escolher a orientação manualmente no Safari.

**COMP-05 — Dados salvos podem ser apagados pelo Safari (ITP, 7 dias) se o site não estiver instalado**
- Casos, perfil e favoritos ficam só em `localStorage` (js/app.js:26-35, 1144, 1343). No Safari/iOS, o armazenamento de sites não instalados é apagado após 7 dias sem uso; o Firefox também pode expulsar dados sob pressão de espaço.
- Correção: chamar `navigator.storage?.persist?.()` após o primeiro caso salvo; no Perfil, mostrar aviso específico para Safari (“instale na Tela de Início ou faça backup”); lembrar de exportar o backup quando o último backup tiver mais de 7 dias (já existe o botão “Baixar backup completo”).

**COMP-06 — `input[type=date]` no Safari/iOS**
- iOS ignora `min`/`max` no seletor de rolagem (a validação própria em js/app.js:1583-1588 cobre isso — bom); campo vazio no iOS fica mais baixo que os demais (bug conhecido do WebKit) e não tem placeholder; não há botão de limpar no iOS < 15. Safari desktop < 14.1 mostra campo de texto livre e a leitura depende de `YYYY-MM-DD`.
- Correção: `input[type=date]{min-height:2.6em; -webkit-appearance:none}` para altura uniforme; ver COMP-01 (máscara de texto resolve os dois problemas).

### Baixa

| ID | Achado | Evidência / causa | Correção |
|---|---|---|---|
| A11Y-15 | Atalho de uma tecla “/” sem como desligar ou remapear (2.1.4) | js/app.js:1024 (ignora só INPUT/TEXTAREA/SELECT; não `contenteditable` nem `[role=textbox]`) | Opção no Perfil para desligar ou exigir modificador; ignorar também `isContentEditable` |
| A11Y-16 | Sem link “Pular para o conteúdo”; 9 paradas antes do `main` em todas as telas | index.html:21 | `<a class="sr skip" href="#main">Pular para o conteúdo</a>` visível no foco; `main` com `tabindex="-1"` |
| A11Y-17 | Salto de nível h2→h4 em #teses | js/app.js:795 (`h4` direto após o `h2`); axe `heading-order` | Usar `h3` nos cartões de tese |
| A11Y-18 | `<th>` vazio na tabela comparativa e no Anexo 11 | js/app.js:1416; axe `empty-table-header` | `<td></td>` ou `<th><span class="sr">Critério</span></th>` |
| A11Y-19 | `aria-label` em `div` sem papel (“Índice”) | js/app.js:1643 | `<nav aria-label="Índice">` |
| A11Y-20 | Alvos < 24 px sobrepostos (2.5.8): marcos `g.tl-m` 14×14 px (13 com conflito de espaçamento em #aposentadoria/data); segmentos `rect.seg` de 2–8 px de largura em #aposentadoria/resultado | js/app.js:1667 (`r=6`), :109 (`Math.max(1.5,…)`) | Há meio equivalente (campo de data, tabela) que pode caber na exceção “equivalente”; mesmo assim, aumentar a área de toque com um `rect` transparente ≥ 24 px por trás de cada marco/segmento |
| A11Y-21 | Rolagem horizontal de 18 px em 320 px (1.4.10) | #aposentadoria/data: `dl.dl16` (css:405 `grid-template-columns:auto …` com `dt` monoespaçado longo, ex. “Categoria profissional”) e o bloco da linha do tempo; medido `scrollWidth` 338 > 320 | `grid-template-columns:minmax(0,max-content) minmax(0,1fr)` + `overflow-wrap:anywhere` no `dt`; em `max-width:400px` empilhar `dt`/`dd` |
| A11Y-22 | Transição do toast continua com `prefers-reduced-motion` | css:529 só desliga `scroll-behavior`; `#toast` mantém `transition:.2s` (css:555) | Incluir `*{transition:none!important; animation:none!important}` no bloco de movimento reduzido |
| A11Y-23 | Checkboxes de periculosidade com dois rótulos (axe incompleto `form-field-multiple-labels`, 33 nós) | rótulo envolvente + `for=` | Manter só um `<label>` com o texto completo; texto extra via `aria-describedby` |
| COMP-07 | iPad não detectado nas instruções de instalação | js/app.js:1726 — iPadOS 13+ usa UA de Mac (“Macintosh”), então o iPad recebe a instrução genérica “Instalar app” | `ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)`; também checar `navigator.standalone` |
| COMP-08 | Cópia do nº do CA sem tratar rejeição e sem checar contexto seguro | js/app.js:996 — `navigator.clipboard.writeText(ca)` sem `.catch` (o `try` não pega rejeição assíncrona) e o rótulo muda para “CA copiado” mesmo se falhar | Reusar `copiar()`/`copiarAntigo()` (js/app.js:1226-1229) e só mudar o texto no sucesso |
| COMP-09 | Recursos CSS com piso alto, mas com degradação aceitável | `:has()` (css:63, 163, 182, 684) — Firefox < 121 e Safari < 15.4 perdem o destaque da opção marcada (`.opt:has(input:checked)`) e ajustes de layout; `text-wrap:balance` (css:22) é só cosmético; `r:8` em CSS no círculo focado (css:640) depende do suporte à propriedade geométrica `r` (sem ela, o foco do marco é só troca de cor) | Para `.opt`, duplicar o destaque com classe definida no JS; foco do marco com `stroke` (como `.tl-seg:focus rect`) |
| COMP-10 | `100vh` na lista de agentes | css:419 `max-height:calc(100vh - 170px)` (só ≥ 601 px; no iPad com barra de ferramentas o fim da lista fica sob a barra) | `max-height:calc(100dvh - 170px)` com `100vh` antes como reserva |

---

## Revisão estática de compatibilidade (detalhe)

| Recurso | Onde | Safari / iOS | Firefox | Chromium / Edge | Situação |
|---|---|---|---|---|---|
| `??`, `?.` (ES2020) | js/app.js:3, 127, 128, 149, 151, 153, 599, 609, 656, 674, 994, 996 | 13.1 / iOS 13.4 | 72 (`??`), 74 (`?.`) | 80 | **Erro de sintaxe derruba o app** (COMP-02) |
| `Array.prototype.flatMap` | js/motor.js:286 | 12 | 62 | 69 | ok |
| `String.prototype.normalize('NFD')` | js/app.js:653, 824, 900 | 10 | 31 | 34 | ok |
| `at()`, `replaceAll`, `structuredClone`, lookbehind `(?<=`, `\p{}` | — | — | — | — | **não usados** (bom: lookbehind só existe no Safari 16.4+) |
| `Intl.DateTimeFormat().resolvedOptions()`, `toLocaleString('pt-BR')` | js/app.js:1591, 78, 1032… | ok | ok | ok | ok; heurística de formato de data falha (COMP-01) |
| `new Date('AAAA-MM-DDT00:00:00')` | js/app.js:1657 | Safari < 14 interpretava sem fuso como UTC | ok | ok | deslocamento de 1 dia possível só no Safari antigo (linha do tempo) |
| `focus({preventScroll:true})` | js/app.js:918, 919, 992, 1009 | **15** (antes ignora a opção e rola) | 68 | 64 | degradação: rola duas vezes no Safari < 15 |
| `scrollIntoView({behavior:'smooth'})` | js/app.js:991, 992, 1009 | 15.4 (antes salta) | ok | ok | ok |
| `navigator.clipboard.writeText` | js/app.js:996, 1013, 1226 | 13.1, exige gesto do usuário | 63 | 66 | fallback existe em :1013/:1226; não em :996 (COMP-08) |
| `window.print` + `afterprint` | js/app.js:1086-1089 | `afterprint` 13; **print em PWA standalone não confiável** | ok | ok | COMP-04 |
| `beforeinstallprompt` | js/app.js:1723 | **não existe** (instrução manual para iOS) | não existe (Android tem menu) | ok | tratado; iPad não detectado (COMP-07) |
| Service Worker + Cache API | sw.js | 11.1 / iOS 11.3; cotas menores, ITP 7 dias | 44 | 40 | ok; ver COMP-05 |
| `localStorage` (modo privado/bloqueado) | js/app.js:26-35, 1144-1146, 1294-1298, 1319-1344 | ok com `try/catch` | ok | ok | **bem tratado** |
| `input type=date` + `min`/`max` | js/app.js:177, 234, 1250, 1251, 1599 | desktop 14.1; iOS ignora min/max no seletor | 57 (desktop 57) | 20 | COMP-01, COMP-06 |
| `inputmode="decimal"` | js/app.js:127, 153, 309… | 12.2 | 95 | 66 | separador segue a região do aparelho (COMP-03) |
| `display:flex` + `gap` | css (≈150 usos) | **14.1** | 63 | 84 | piso de layout |
| `inset` | css:20, 258, 607 | **14.1** | 66 | 87 | sem ele, `#tutorial`/`#preview` não cobrem a tela |
| `:focus-visible` | css:31, 222, 223, 672 | **15.4** | 85 | 86 | sem ele **não há anel de foco algum** (o único estilo de foco é via `:focus-visible`) |
| `:has()` | css:63, 163, 182, 684 | 15.4 | **121** | 105 | degradação aceitável (COMP-09) |
| `accent-color` | css:107-108 | 15.4 | 92 | 93 | cosmético |
| `mask-image` | css:716, 739 | prefixo `-webkit-` presente | 53 | 120 (sem prefixo; prefixo antes) | ok |
| `position:sticky` | css:34, 229, 419, 731 | 13 (sem prefixo); `th` sticky ok | 59 | 56 | `.pt.a11 thead th` gruda dentro de `.a11wrap` (que rola) — intencional |
| `env(safe-area-inset-*)` + `viewport-fit=cover` | css:20, 27, 34, 258; index.html:5 | 11.1 | ignorado (fallback 0) | 69 | ok; `#toast` (css:555, `bottom:18px`) e `#termos` (css:557) **não** somam `safe-area-inset-bottom` → ficam sob a barra inicial do iPhone em modo standalone |
| `scroll-margin-top` | css:589, 662, 665 | 14.1 (11 como `scroll-snap-margin`) | 90 | 69 | ok |
| `100vh`, `70vh` | css:419, 625 | barra dinâmica | ok | ok | COMP-10 |
| `scrollbar-width:none` | css:40, 716 | ignora (usa `::-webkit-scrollbar`) | 64 | 121 | ok |
| `print-color-adjust` | css:301 | `-webkit-` ok | 97 | 136 (prefixo antes) | ok |
| `@page size` | index.html:25; js/app.js:1082 | **ignorado** historicamente | 95 | ok | COMP-04 |
| `text-wrap:balance` | css:22 | 17.5 | 121 | 114 | cosmético |
| `font-stretch` + Archivo variável | css:22… | ok | ok | ok | ok (fontes Google carregadas com `media=print onload`) |
| `<title>` em SVG | js/app.js:109, 1667, 1673 | tooltip ok | tooltip ok | tooltip ok | sem tooltip no toque — o app compensa com `#tlinfo` (bom) |
| `Promise.prototype.finally` | js/app.js:1732 | 11.1 | 58 | 63 | só no fluxo Chromium |

### Versões mínimas implícitas

| Nível | Chrome / Edge (Chromium) | Firefox | Safari macOS | iOS / iPadOS | Samsung Internet |
|---|---|---|---|---|---|
| **App abre** (sintaxe ES2020) | 80 | 74 | 13.1 | 13.4 | 13 |
| **Layout correto** (`gap` flex, `inset`) | 87 | 74 | 14.1 | 14.5 | 14 |
| **Acessível ao teclado** (`:focus-visible`) | 87 | 85 | **15.4** | **15.4** | 14 |
| **Experiência completa** (`:has()`, `accent-color`) | 105 | **121** | 15.4 | 15.4 | 20 |

Recomendação: declarar como suportados **Chrome/Edge ≥ 105, Firefox ≥ 121, Safari/iOS ≥ 15.4** e, abaixo disso, mostrar aviso (COMP-02). Edge Legado (EdgeHTML) e Internet Explorer: **não funcionam** (app em branco). Para não perder o anel de foco em Safari < 15.4 sem custo: `:focus{outline:2px solid var(--focus)} :focus:not(:focus-visible){outline:none}`.

---

## Resultados por verificação

- **Teclado (Tab, 45 paradas por rota):** ordem lógica (busca → 8 abas → conteúdo; 1º elemento do `main` na 10ª parada em todas as rotas); nenhuma armadilha de teclado; anel de foco presente em 100 % das paradas (as falhas aparentes nos campos de data eram do script: o anel foi confirmado em `ca-foco-date.png`). Problemas: A11Y-01, -02, -07, -08, -10, -13, -14, -16.
- **Botão de arquivo (Perfil):** `input#pf-restore` com opacidade 0 recebe foco, mas o rótulo `.filebtn` mostra anel via `:focus-within` (css:549) — ok (`ca-foco-filebtn.png`).
- **Títulos:** 1 `h1` (marca) em todas as telas; `h2` = seção; só #teses salta nível.
- **Landmarks:** `header`, `nav` “Seções”, `main`, `footer`, `aside`, `nav` secundários com nomes (“Aposentadoria especial”, “Agentes”, “Passos”, “Biblioteca”, “Documentos”, “Normas”, “Funções”), `section` “Meus casos”. Falta `role="search"` / `<search>` em volta de `#gq` (sugestão).
- **Formulários:** 0 campos sem rótulo em 27 telas; avisos com `aria-invalid`/`aria-describedby`; avisos de data e número com `role=status`.
- **Tabelas:** 0 `<caption>` em ~30 tabelas (títulos `h3` próximos servem como rótulo visual — sugestão: `aria-labelledby`); todas têm `<th>`; `scope` só na comparativa (as demais são simples, aceitável).
- **Regiões vivas:** `#totbar`, `#res-N`, `#tlinfo`, `.verdict`, `#ures`, `#pres` com `aria-live="polite"`; toast `role=status`. Atenção: em #aposentadoria/caso há 6 regiões vivas que se atualizam juntas a cada tecla (`#res-i` + `#totbar`) — leitores podem ler o quadro inteiro (até 662 caracteres) a cada dígito. Sugestão: deixar só `#totbar` como viva e com debounce.
- **Contraste:** claro — 516 nós com falha (quase todos `--gold`); escuro — 63 nós (37 são o selo “mudou”). Detalhe em A11Y-03/04/05/06.
- **Reflow 320 px:** sem rolagem horizontal da página exceto #aposentadoria/data (+18 px, A11Y-21); cabeçalho de 178 px em 640 px de altura, mas ele se esconde ao rolar (≤ 700 px).
- **Zoom 200 % (640×400 e 960×540):** sem rolagem horizontal; 960×540 mantém cabeçalho fixo de 150 px (28 %) — origem do A11Y-08.
- **Espaçamento de texto (1.4.12):** sem corte de texto nas 17 telas (o único `overflow:hidden` detectado é a arte decorativa do `.hero` e o input de arquivo oculto).
- **Dispositivos emulados:** iPhone 13 (390), iPad gen 7 (810), Galaxy S9+ (320): sem rolagem horizontal (exceto o caso de 320 px acima); toque em segmento da linha do tempo atualiza `#tlinfo`.
- **Movimento reduzido:** `scroll-behavior:auto` aplicado; nenhuma animação CSS ativa; transição do toast mantida (A11Y-22).
- **Modo escuro forçado:** tokens trocados corretamente; `color-scheme:dark` declarado; capturas `ca-*-dark.png`.

## Ordem sugerida de correção

1. A11Y-01 (foco após `render()`) e A11Y-02 (toast) — mudanças pequenas e centralizadas em js/app.js.
2. COMP-01 (data) e COMP-03 (ponto/milhar) — evitam erro silencioso no resultado pericial.
3. Tokens de cor: `--gold` claro → `#86650F`, `.mudou`, borda de campo, foco na faixa (A11Y-03 a -06) — só CSS, elimina ~95 % das violações do axe.
4. COMP-02 (aviso de navegador antigo + transpilar para ES2019).
5. `<dialog>`/`inert` no tutorial, `scroll-padding-top`, `tabindex=0` nas regiões roláveis, SVG `role=group`, abas (A11Y-07 a -11).
6. Título/anúncio de rota, glossário, banner (A11Y-12 a -14), depois os itens de severidade Baixa.
