# Auditoria 5 (visual) e 6 (redação e terminologia) — Caracterizador Pericial

Data: 23/11/2026 · Auditor independente · Nenhum arquivo do repositório foi alterado.
Capturas na mesma pasta deste relatório (`auditorias/`):
- telas: `<rota>-<d|t|m>-<light|dark>.png` (d = 1440×900, t = 1024×768, m = 390×844), por exemplo `ir_ag_ruido-d-light.png` e `aposentadoria_resultado-m-dark.png`;
- impressão: `print-<tipo>-<rota>-<tema>.png` (pré-visualização) e `print-*.pdf` (PDF real, gerado com `body.printing`); páginas rasterizadas em `pdf-print-*.png`, `hi-caso-2.png` e `hi-ruido-1.png`;
- recortes: `el-*.png` (resultado da NR-16, aviso do Anexo 1, simulação e teses) e as montagens `_m1.png`, `_m2.png`, `_m_ruido.png`, `_m_caso.png` e `_pdf_montage1.png`.

Nenhuma rota teve rolagem horizontal na página e não houve erros de JavaScript nas 21 rotas × 5 combinações de tamanho e tema.
Observação: os campos de data aparecem como `12/31/1996` nas capturas em en-US, porque é o navegador que formata `input[type=date]`. Com locale pt-BR (`el-caso-ptBR-*.png`) aparecem certos.

---

## Prioridades (resumo)

| # | Sev. | Achado | Onde |
|---|------|--------|------|
| 1 | Alta | O quadro-resumo da ficha (`.pt.manual{min-width:900px}`) é mais largo que a folha A4. Na impressão o Chromium reduz a página inteira: o timbrado fica menor que a folha, o rodapé do timbrado cai sobre a tabela e a letra fica minúscula. Na pré-visualização a tabela vaza para fora da folha | `hi-ruido-1.png`, `print-ficha-ir_ag_ruido-light.png`, css/estilo.css:385 |
| 2 | Alta | A tela inicial se vende como ferramenta de laudo: "Consulta técnica para laudos, pareceres e perícias", "Do texto legal ao laudo, período a período", "como fundamentar a conclusão" | js/app.js:48 |
| 3 | Alta | Os veredictos são escritos como conclusão pericial: "Insalubre — grau médio (20%)", "Periculosidade caracterizada — adicional de 30%", "Não caracteriza insalubridade" | js/app.js:605, 762–764 |
| 4 | Alta | O "critério do especialista" é atribuído à própria Grahl ("critério técnico da Grahl"), o que transfere a autoria da tese para a empresa | js/app.js:206; termos.html (seção 2) |
| 5 | Alta | O papel impresso tem cara de documento assinável: bloco de assinatura, "Emitido em", "Profissional responsável", "Assinatura nos relatórios" e um timbrado padrão com as redes pessoais de Rogério Grahl (@rogerio_grahl, Facebook e LinkedIn) no documento do cliente | `hi-caso-2.png`; js/app.js:1056, 1081, 1155–1163; img/timbrado-* |
| 6 | Alta | O mesmo conceito tem três nomes: "Nota do especialista" / "especialista" / "perito" (inclusive dentro do mesmo PDF) | js/app.js:202, 224, 1058 e outras |
| 7 | Alta | "Risco grave e iminente / acima de 115 dB(A)" aparece dentro de uma caixa verde de sucesso ("Insalubre — grau médio") | `el-a15_1-aviso-light.png`, js/app.js:605/628 |
| 8 | Média | Contraste: o dourado `--gold:#A97F14` dá 3,66:1 no branco e 3,06:1 em `--gold-soft`. Afeta eyebrows, `.printbtn` e o chip "Limite (LT)", todos abaixo do AA | css/estilo.css:4, 30, 95, 254 |
| 9 | Média | No modo escuro o botão primário é quase invisível: `--band:#06101E` sobre `--surface:#0F1D31` dá 1,13:1 | `inicio-d-dark.png` (cartões "Escolha a área") |
| 10 | Média | Estado "sem dados" com quatro nomes: "Dados insuficientes" / "Faltam dados" / "Faltam elementos para caracterizar" / "Trechos sem dados suficientes" | js/app.js:4, 41, 605, 760–761, 85 |
| 11 | Média | "Minuta. Texto-base preparado para revisão por assessoria jurídica…" aparece para o usuário em Termos e Privacidade | termos.html, privacidade.html |
| 12 | Média | A pré-visualização de impressão diz "abra a versão publicada do site (GitHub Pages)", o que expõe a infraestrutura ao cliente | index.html:26 |
| 13 | Média | Rótulos diferentes para a mesma ação de impressão: "Imprimir passo", "Imprimir ficha", "Imprimir ou salvar PDF", "Imprimir simulação", "Imprimir" | js/app.js:216, 560, 571, 698, 771, 795 |
| 14 | Média | O padrão "(s)/(ões)" aparece em toda a interface: "5 período(s)", "17 resultado(s) em 15 seção(ões)", "Ver mais 9 novidade(s)" | js/app.js:67, 76, 80, 329, 686, 794, 892, 1076, 1113, 1313 |

---

## 5. Auditoria visual

### 5.1 Impressão (folha A4)

**V1 — Alta. Tabelas mais largas que a folha encolhem a página inteira.**
Capturas: `hi-ruido-1.png` e `print-ficha-ir_ag_ruido-light.png`. Na pré-visualização, as colunas "Código" e "Formulários" saem da folha. No PDF, o timbrado ocupa cerca de 80% da largura e o rodapé (Instagram/Facebook) fica por cima da linha "(+) A partir de 01/01/2023" e do título "Nota do especialista".
Causa: as regras `min-width` de tela continuam valendo dentro de `.pbody`: `.pt.manual{min-width:900px}`, `.pt.a11{760px}`, `.pt.cmp{720px}`, `.res table.rt{720px}`, `svg.tl{min-width:640px}`, `svg.tlv{720px}`, `.mx{620px}`, `table.cmpag{640px}`, `.rdg td{140px}` e `table.cmpag td{200px}`. A largura útil da folha é 210 − 32 mm ≈ 673 px.
Correção (css/estilo.css, perto da linha 291):
```css
.pbody table,.pbody .pt,.pbody .mx,.pbody table.rt,.pbody table.cmpag{min-width:0!important; width:100%; table-layout:auto}
.pbody td,.pbody th{overflow-wrap:anywhere; min-width:0!important}
.pbody svg.tl,.pbody svg.tlv{min-width:0!important; width:100%}
.pbody .mono{white-space:normal}
.sheet{overflow:hidden}   /* a pré-visualização não deixa nada vazar da folha */
```

**V2 — Média. Página quase vazia no fim da ficha.**
A ficha de ruído impressa tem 3 páginas, e a terceira só traz duas teses e o aviso (`_pdf_montage1.png`). A ficha de calor tem 4 páginas.
Correção: `.pbody h3,.pbody h4{break-after:avoid}` e `.pbody .disc{break-before:avoid}`. Avaliar também imprimir só o passo atual de fato, pois o botão se chama "Imprimir passo".

**V3 — Média. Os grafismos dourados do timbrado ficam atrás das tabelas no relatório em paisagem** (`hi-caso-2.png`, `pdf-print-caso-*.png`).
As linhas douradas do miolo cruzam as células e prejudicam a leitura da tabela de períodos.
Correção: usar um timbrado só com cabeçalho e rodapé e o miolo limpo, ou `.pbody table{background:#fff}`, que hoje é `transparent` em `.pbody td`.

**V4 — Alta (marca e responsabilidade). O timbrado padrão no documento do cliente.**
Com o "Timbrado padrão do Caracterizador", o PDF de um perito qualquer sai com "@rogerio_grahl", "Rogério Grahl" (Facebook e LinkedIn) e "grahlconsultoria.com.br" (`hi-caso-2.png`). Isso sugere que a Grahl é autora ou corresponsável pelo documento.
Correção: tornar padrão o "Cabeçalho simples com meus dados" e deixar a marca Grahl só em uma linha discreta de rodapé ("Gerado com o Caracterizador Pericial"). O timbrado da Grahl passa a ser opção explícita.

**V5 — Baixa.** No PDF da simulação, a coluna "Empresa / função" fica vazia nas linhas seguintes do mesmo período, intencionalmente (js/app.js:1055), e isso parece falha.
Correção: repetir a empresa em cinza (`<small>`), ou usar `rowspan`.

**V6 — Baixa.** No PDF, as datas da tabela usam a fonte mono e quebram em "01/02/1991 a / 31/12/1996", desalinhadas do resto do texto.
Correção: `.pbody td.mono{font-family:var(--f-body); font-variant-numeric:tabular-nums; white-space:nowrap}` e quebra controlada com `<br>` antes de "a".

### 5.2 Cores, estados e veredictos

**V7 — Alta. Alerta crítico dentro de veredicto verde** (`el-a15_1-aviso-light.png`).
Com um NPS acima de 115 dB(A), o texto "há nível acima de 115 dB(A)… configura risco grave e iminente (item 7)" aparece dentro de `.verdict.v-e` (verde) com o título "Insalubre — grau médio (20%)".
Correção: quando houver `r.over`, também emitir `<div class="verdict v-c">Risco grave e iminente…</div>` à parte, como o Anexo 11 já faz (js/app.js:677). O verde fica só para o enquadramento.

**V8 — Média. A semântica de cores dos estados não se mantém.**
- Chips da aposentadoria: Especial = verde, Não especial = **vermelho** (`--n`), Controverso = âmbar, Dados insuficientes = cinza-azulado.
- Veredicto da NR-15/NR-16: "Não caracteriza" = **cinza** (`.v-n{background:var(--surface-2)}`) e alerta crítico = vermelho (`.v-c` usa `--n`). O vermelho de "Não especial" é o mesmo do "risco grave".
- `.v-n` (cinza) e `.v-i` (cinza-azulado) são quase indistinguíveis no tema claro (#E8ECF2 × #E6EAF0).
- "Controverso" (âmbar `--c`) e o chip "Limite (LT)" (dourado `.mx-l`) ficam muito parecidos no Mapa de enquadramento (`aposentadoria_resultado-d-light.png`).
Correção: criar um token próprio para crítico (`--crit:#B42318; --crit-bg:#FDECEA`) e usá-lo em `.v-c` e `.campo-aviso`; `.v-n{background:var(--n-bg); border-color:var(--n)} .v-n b{color:var(--n)}`; `.v-i{border-style:dashed}`; `.mx-l` com borda e sem fundo (`.mx-l{background:transparent; border:1px solid var(--gold-line)}`).

**V9 — Média. Contraste do dourado (tema claro).**
`--gold:#A97F14` dá 3,66:1 no branco e 3,32:1 no `--bg`. O chip `.mx-l` dá 3,06:1. Usado em texto de 0,72–0,84 rem, fica abaixo do AA.
Correção: `--gold:#86620F` (5,57:1 no branco e 4,65:1 em `--gold-soft`). Manter `--gold-line:#C9A227` só para bordas e filetes. Em `.pbody .eyebrow{color:#A87B2A}` usar `#86620F`.

**V10 — Média. Botão primário no modo escuro** (`inicio-d-dark.png`, cartões "Escolha a área"; "Adicionar período").
`button{background:var(--band)}` com `--band:#06101E` sobre `--surface:#0F1D31` dá contraste de borda de 1,13:1: o botão "afunda" e perde a hierarquia em relação ao ghost.
Correção, dentro do bloco escuro: `button:not(.ghost):not(.printbtn):not(.linkbtn){background:var(--gold-line); color:#0A1422; border-color:var(--gold-line)}`. Alternativa: um token `--btn:#2A4F80`.

**V11 — Baixa. Checkbox dourado também no tema claro.**
`:root:not([data-theme="light"]) input[type=checkbox]{accent-color:var(--gold)}` (css:108) não está dentro do `@media (prefers-color-scheme: dark)`, então vale no claro quando não há `data-theme`. O resultado são checkboxes dourados e rádios azul-marinho.
Correção: mover a regra para dentro do `@media` e de `:root[data-theme="dark"]`.

**V12 — Baixa. `.note.warn` não tem borda** (css:749 define `border-left-color`, mas `.note` não tem `border-left`): o aviso aparece só como texto vermelho solto.
Correção: `.note.warn{border-left:3px solid var(--n); padding:6px 10px; background:var(--n-bg); border-radius:0 6px 6px 0; align-self:stretch}`.

### 5.3 Componentes e consistência

**V13 — Média. Excesso de estilos de "caixa de nota"**: `.keynote`, `.mnote`, `.mxnote`, `.note`, `.note.ext`, `.note.warn`, a caixa "Ferramenta de consulta" (borda cinza à esquerda) e `.verdict`. São pelo menos 7 variações de borda, fundo e tamanho de fonte para o mesmo papel.
Correção: reduzir a três classes, `.callout` (info), `.callout.warn` e `.callout.crit`, com `border-left:4px solid; padding:10px 14px; border-radius:0 8px 8px 0; font-size:.9rem`.

**V14 — Média. Botões dos cartões de tese quebram de forma irregular** (`teses-d-light.png`, `el-teses-light.png`).
Cada cartão tem 4 botões ("☆ Favoritar", "Copiar citação", "Copiar link", "Imprimir") e o "Imprimir" cai sozinho na segunda linha. Como as alturas dos cartões variam, os botões ficam em alturas diferentes.
Correção: `.tese .btns{margin-top:auto; flex-wrap:nowrap; gap:6px}`, `.tese .btns button{padding:5px 8px}`, e juntar "Copiar citação/Copiar link" num menu "Copiar ▾" ou usar ícones com `aria-label`.

**V15 — Média. Linguagem de botões de impressão.** `.printbtn` é contornado em dourado e o texto varia (ver item A7). Na lista de teses, o mesmo papel usa `button.ghost.sm` ("Imprimir"), com estilo diferente do `.printbtn` das fichas.
Correção: sempre `.printbtn`, com o mesmo rótulo e o mesmo ícone (por exemplo "⎙ Imprimir / PDF").

**V16 — Média. Grade de 5 cartões de navegação deixa um buraco** (`aposentadoria_resultado-d-light.png`, `el-caso-ptBR-dark.png`). O layout 3 + 2 deixa vazia a terceira coluna da segunda linha.
Correção: `.rsnav{grid-template-columns:repeat(5,minmax(0,1fr))}` a partir de 1200 px, ou um layout 2 + 3 com "Simulação" e "Resultado" lado a lado em destaque.

**V17 — Média. Bloco Nota do especialista × INSS com larguras desiguais** (`ir_ag_ruido-d-light.png`).
O cartão "INSS · IN 128/2022, art. 292" termina por volta de 620 px e deixa uma faixa vazia à direita; o cartão amarelo é mais alto.
Correção: `.tri{display:grid; grid-template-columns:1fr 1fr; align-items:stretch}` e `.tri > *{min-width:0}`.

**V18 — Média. Quadro-resumo cortado na tela** (`ir_ag_ruido-d-light.png`). Em 1440 px a coluna "Formulários" é cortada ("IS SSS-501.19/71, ISS…", "PPP eletrônico (eSocial, S-224…") e nada indica que há rolagem.
Correção: `.tscroll{background:linear-gradient(to right,var(--surface) 30%,transparent) left/40px 100% no-repeat local, linear-gradient(to left,var(--surface) 30%,transparent) right/40px 100% no-repeat local, radial-gradient(farthest-side at 100% 50%,rgba(0,0,0,.18),transparent) right/14px 100% no-repeat scroll}` (sombra de rolagem). Reduzir `.pt.manual` para `min-width:760px` e a coluna de período para `white-space:nowrap` em uma linha ("até 28/04/1995").

**V19 — Média. No celular, o passo a passo da ficha mostra só 2 de 5 passos** (`_m_ruido.png`). `.rsnav` com `overflow-x:auto` e sem indicação de que há mais.
Correção: no celular, `grid-template-columns:repeat(5,minmax(120px,1fr))` com máscara degradê, como já é feito em `.tabs` (css:716), ou uma lista vertical compacta.

**V20 — Baixa. Duas faixas de aviso legal no rodapé do Início**, com textos diferentes, uma logo acima da outra (`inicio-d-light.png`): "Ferramenta de consulta técnica. Os resultados não substituem…" (js/app.js:59) e "Ferramenta de apoio técnico. Não substitui…" (index.html:23).
Correção: remover a da linha 59 ou unificar o texto (ver item A6).

**V21 — Baixa. Selos mono** ("33 agentes", "5 período(s)", "28 a 2 m 24 d") em JetBrains Mono dão aparência de terminal em uma navegação de produto.
Correção: `.rsnav .badge{font-family:var(--f-body); font-variant-numeric:tabular-nums}`.

**V22 — Baixa. Texto duplicado na linha do tempo** (`aposentadoria_resultado-d-light.png`): "Toque, clique ou use Tab nos trechos para ver o fundamento abaixo." (mono, centralizado) e logo depois "Toque ou clique num trecho para ver o fundamento." em caixa cinza.
Correção: manter só a caixa.

**V23 — Baixa. Perfil**: o painel "Profissional responsável" termina muito antes do painel "Meus dados" (`perfil-d-light.png`). "Profissão" não tem a opção Advogado(a), embora a OAB seja citada no LEIA-ME e "advogados" nos Termos.
Correção: `.grid2{align-items:start}` (ou stretch com conteúdo distribuído) e acrescentar "Advogado(a)" (js/app.js:1148).

**V24 — Baixa. Celular**: o placeholder da pesquisa geral é cortado ("…atividade, t"), em `_m_caso.png`.
Correção: placeholder curto no celular ("Pesquisar agente, substância, tese…"), via `matchMedia` ou um texto único mais curto.

**V25 — Baixa. Números grandes sem separador de milhar nos resultados mono** ("3428,6%" e "3495,2%" em `el-a15_1-aviso-light.png`), enquanto outras telas mostram "10.304 dias".
Correção: formatar com `toLocaleString('pt-BR',{maximumFractionDigits:1})`.

**V26 — Baixa. O rótulo "Protetor auditivo informado (considerado a partir de 03/12/1998)" quebra em duas colunas estreitas** dentro da caixa tracejada (`_m_caso.png`, `print-caso-…png`).
Correção: `.cb > span small{display:block}`, com o complemento abaixo do rótulo.

**V27 — Baixa. Hierarquia tipográfica**: h2 = 1,65 rem, `.aphead h2` = 1,6 rem e `.hero-txt h2` = clamp até 2,3 rem; h3 = 1,12 rem, `.acard h3` = 1,2 rem (maior que o h3 padrão); `.ckgrp h4` = .95, `.sec16 h4` = .98 e `.ffun h4` = .92 rem. São tamanhos quase iguais que não formam uma escala.
Correção: escala fixa `h2 1.6rem · h3 1.15rem · h4 1rem` e remover os ajustes locais (`.aphead h2`, `.acard h3`, `.ckgrp h4`, `.sec16 h4`, `.ffun h4`).

### 5.4 Modo escuro: verificação geral
`inicio`, `ir_a15_13`, `ir_a16_a2`, `biblioteca`, `busca-benzeno` e `aposentadoria_*` (`-d-dark`, `-m-dark`): os tokens se adaptam bem, os chips têm contraste ≥ 4,8:1 e o logo funciona sobre o azul-marinho. Os problemas restantes são V10 (botão primário), V11 (checkbox) e as capturas `print-*-dark.png`, em que a pré-visualização mantém a folha branca, o que está correto.

---

## 6. Auditoria de redação e terminologia

### (A) Inconsistências de terminologia

**A1 — Alta. Especialista / Nota do especialista / perito / critério técnico da Grahl.**
| Arquivo:linha | Atual | Proposta |
|---|---|---|
| js/app.js:202 | "Conversão até 13/11/2019 (perito)" | "Conversão até 13/11/2019 (nota técnica)" |
| js/app.js:224 | "Tempo especial (perito):" | "Tempo especial (nota técnica):" |
| js/app.js:1058 | "Acréscimo por conversão até 13/11/2019 (perito / INSS)" | "… (nota técnica / INSS)" |
| js/app.js:200, 1059 | "especialista: atingido" | "nota técnica: tempo simulado alcança o exigido" |
| js/app.js:206 | "o do especialista (critério técnico da Grahl, com a fundamentação de cada ponto)" | "a nota técnica (leitura técnica das normas, com a fundamentação de cada ponto)" |
| js/app.js:700 | "Grau atribuído pelo perito" / "A escolha é do perito" | "Grau adotado pelo profissional" / "A escolha é do profissional" |
| termos.html §2 | "um critério técnico próprio (nota do especialista)" | "uma leitura técnica das normas (nota técnica)" |
Recomendação: adotar um rótulo único em tudo. Sugestão: "Nota técnica" (versus "Critério do INSS"). Não chamar o usuário de "perito", porque o público inclui assistentes técnicos e advogados.

**A2 — Média. Estado sem dados.** ST.I = "Dados insuficientes" (app.js:4); chip curto = "Faltam dados" (41); NR-15 = "Faltam dados" (605); NR-16 = "Faltam elementos para caracterizar" (760–761); Resultado = "Trechos sem dados suficientes" (85).
Proposta: "Dados insuficientes" em todos os lugares (chip curto: "Dados insuf."); na NR-16, "Dados insuficientes para o enquadramento".

**A3 — Média. "Controverso" × "Em aberto" × "posição em aberto".** A legenda diz "Controverso" (app.js:4); a ficha diz "Efeito sobre o enquadramento: posição em aberto" (404) e "Em aberto: o INSS exige…" (554); o filtro de teses diz "Em aberto (11)".
Proposta: "Controverso" para estado de trecho e "Em aberto" só para tese.

**A4 — Média. Situação das teses.** Selos: "Tese firmada / Embargos pendentes / Em julgamento / Em revisão" (783). Filtros: "Qualquer situação / Firmadas e vigentes / Em aberto" (793). Ajuda: "filtre pela situação (firmada, embargos, em julgamento)" (ajuda.js:6).
Proposta: ajuda.js:6 → "filtre pela situação (firmadas e vigentes ou em aberto)"; filtro → "Todas as situações".

**A5 — Média. Simulação.** "Simulação de enquadramento" (aba e título), "Simular enquadramento" (caixa da ficha, 233/544), "Simular períodos" (Início, 52), "Simulação carregada" (76), "Imprimir simulação" (216), Termos: "organização de análises de casos" (termos §1), README: "Vários casos".
Proposta: aba "Simulação de enquadramento"; botão do Início "Abrir a simulação"; caixa da ficha "Simular este agente"; Termos "simulação de enquadramento de períodos".

**A6 — Média. Aviso legal em quatro versões:** index.html:23 ("apoio técnico… juízo do profissional responsável…"), js/app.js:59 ("consulta técnica… inspeção do local… laudo técnico assinado"), js/app.js:1193 (banner de termos) e js/app.js:1081 (folha impressa).
Proposta, uma frase canônica: "Ferramenta de consulta técnica. Não substitui a análise do caso concreto, a inspeção do local de trabalho, a redação oficial das normas nem o juízo do profissional responsável." A expressão "apoio técnico" sai, para não misturar com "consulta técnica".

**A7 — Média. Rótulos de impressão.** "Imprimir passo" (560), "Imprimir ficha" (571), "Imprimir ou salvar PDF" (698, 771), "Imprimir simulação" (216), "Imprimir" (795), "Imprimir esta tese / estas N teses" (794), "Imprimir este texto / os itens encontrados" (1641). A ajuda diz "Use 'Imprimir ficha'" (ajuda.js:24), mas a ficha de ruído mostra "Imprimir passo".
Proposta: sempre "Imprimir / PDF" mais um complemento curto só quando há ambiguidade ("Imprimir / PDF — 41 teses").

**A8 — Baixa. "INSS" × "IN 128" × "IN PRES/INSS 128/2022" × "INSS (IN 128/2022)" × "INSS · IN 128/2022, art. 292".**
Proposta: nos cabeçalhos de coluna e cartões, "Critério do INSS (IN 128/2022)"; no texto corrido, "IN 128/2022" e, na primeira menção de cada tela, "IN PRES/INSS 128/2022".

**A9 — Baixa. Salário-base × salário básico.** NR-16 na tela: "salário-base" (768, 774); glossário: "salário básico" (glossario.js:33). A CLT usa "salário básico".
Proposta: "salário básico" nos dois.

**A10 — Baixa. "relatório" × "ficha" × "consulta" × "documento".** Perfil: "relatórios impressos", "Timbrado dos relatórios", "Assinatura nos relatórios" (1154–1163); Início: "Gere o relatório, a ficha ou a consulta" (55); folha: "Documento de consulta" e "Documento elaborado com o apoio" (1056, 1081).
Proposta: "impressões" ou "folhas de consulta" (ver B4).

**A11 — Baixa. Profissões.** Início: "Engenheiro de segurança do trabalho" (minúscula, masculino); Perfil: "Engenheiro(a) de Segurança do Trabalho" (maiúscula, flexão). Termos citam "advogados", mas eles não aparecem em "Para quem" nem em "Profissão".
Proposta: padronizar em "Engenharia de segurança do trabalho · Medicina do trabalho · Técnico de segurança · Enfermagem do trabalho · Advocacia previdenciária e trabalhista".

### (B) Responsabilidade e afirmações excessivas

**B1 — Alta. Hero do Início** (js/app.js:48)
- "Consulta técnica para laudos, pareceres e perícias" → "Consulta técnica em aposentadoria especial, insalubridade e periculosidade"
- "Do texto legal ao laudo, período a período" → "A regra de cada época, período a período"
- "…qual o limite, como medir e como fundamentar a conclusão em…" → "…qual o limite e como medir, com as fontes para conferir, em…"

**B2 — Alta. Veredictos como conclusão**
| Linha | Atual | Proposta |
|---|---|---|
| app.js:605 | "Insalubre — grau médio (20%)" | "Enquadra no grau médio (20%) pelos dados informados" |
| app.js:605 | "Não caracteriza insalubridade" | "Não enquadra pelos dados informados" |
| app.js:764 | "Periculosidade caracterizada — adicional de 30%" | "Enquadra na NR-16 pelos itens marcados (adicional de 30%)" |
| app.js:762–763 | "Periculosidade não caracterizada" | "Não enquadra pelos itens marcados" |
| app.js:620 | "Dose acima de 100% caracteriza (item 6 do Anexo 1)" | "Dose acima de 100% ultrapassa o limite (item 6 do Anexo 1)" |
| app.js:628 | "…o que caracteriza independentemente da dose…" | "…o que ultrapassa o limite independentemente da dose…" |
| app.js:735 | "Transporte perigoso:" / "Transporte não caracterizado:" | "Enquadra no transporte:" / "Não enquadra no transporte:" |
| app.js:755 | "Item 1, alínea a) — direito: na produção…" | "Item 1, alínea a): na produção… (adicional previsto para: …)" |
| app.js:4 / chips | "Especial" / "Não especial" | manter na legenda com a observação "pelo critério simulado" no cabeçalho da coluna: "Nota técnica (simulação)" |

**B3 — Alta. Autoria do critério** (app.js:206; termos §2 e §5: "os critérios técnicos… são de titularidade da Grahl").
Dizer que o critério é "da Grahl" põe a empresa como fonte da tese. Proposta: "nota técnica: leitura das normas com a fundamentação de cada ponto; cabe ao profissional adotá-la ou não". Nos Termos, §5: "a organização do conteúdo, os textos explicativos, o código e a marca…" (retirar "os critérios técnicos").

**B4 — Alta. A folha impressa parece documento técnico assinado.**
- app.js:1056: "· Emitido em:" → "· Consulta gerada em:"; em 1073–1078, "emitida em" → "gerada em".
- app.js:1081: "Documento elaborado com o apoio do Caracterizador Pericial… a conclusão é de responsabilidade do profissional que assina." → "Folha de consulta gerada pelo Caracterizador Pericial. Não é laudo, parecer nem documento técnico; não substitui a análise do caso concreto. Qualquer conclusão é do profissional que a adotar em seu próprio documento."
- app.js:1155 "Profissional responsável" → "Seus dados (para identificar as impressões)"; app.js:1163 "Assinatura nos relatórios" → "Identificação nas impressões"; e não desenhar a linha de assinatura (`.assin .linha`) em `blocoAssinatura()` (app.js:1186).
- index.html:26 e js/app.js:1056: título "Simulação de enquadramento — aposentadoria especial" com a linha "Documento de consulta…" pode ficar; trocar "Documento" por "Folha".

**B5 — Média. Excesso de certeza sobre a base**
- index.html:23 "Base normativa e jurisprudência conferidas fonte a fonte" → "Base normativa e jurisprudência revisadas em dd/mm/aaaa (veja Início)".
- novidades.js:16 "…conferidos linha a linha" → "…conferidos com os textos oficiais em 21/11/2026".
- app.js:1694 "Nenhuma alteração entra no app sem revisão." Pode ficar, mas "O robô verifica diariamente" → "Um monitoramento automático verifica diariamente".
- app.js:1613 "Texto literal conferido no DOU." → "Texto conferido com o DOU em dd/mm/aaaa."

**B6 — Média. Afirmações absolutas**
- app.js:472 "…e o limite é sempre o do Anexo 1 da NR-15 (nota do especialista…)" → "…e, na nota técnica, o limite é o do Anexo 1 da NR-15…".
- app.js:472 "Você não precisa escolher entre as normas." → "As normas se complementam:".
- funcoes.js (Operador de empilhadeira) "Quem troca o cilindro de GLP tem periculosidade" → "A troca do cilindro de GLP foi reconhecida como perigosa pelo TST (Tema 87), ainda que por tempo extremamente reduzido".
- funcoes.js (Vigilante) "o STF (Tema 1209) decidiu que vigilante não tem tempo especial" → "…fixou tese contrária ao tempo especial do vigilante pela periculosidade; há embargos com proposta de modulação".

**B7 — Média. Expressões que confundem a nota técnica com o lado do segurado.** app.js:80: "a favor da nota do especialista" / "a favor do INSS" → "maior pela nota técnica" / "maior pelo critério do INSS".

**B8 — Baixa. Público-alvo no Início** (app.js:53): os chips "Laudos extrajudiciais" e "Pareceres técnicos" reforçam a ideia de gerador de laudo. Proposta: "Elaboração de laudos (consulta)" ou trocar por "Assistência técnica" e "Advocacia".

### (C) Erros (ortografia, gramática, formatação)

| # | Sev. | Arquivo:linha | Atual | Proposta |
|---|---|---|---|---|
| C1 | Média | js/app.js:67, 76, 80, 329, 686, 794, 892, 1076, 1113, 1313 | "período(s)", "trecho(s) divergente(s)", "resultado(s) em 15 seção(ões)", "tese(s)", "nova(s)", "Ver mais 9 novidade(s)" | criar `plural(n,'período','períodos')` e escrever "5 períodos", "1 trecho divergente", "17 resultados em 15 seções" |
| C2 | Média | js/app.js:55 | "Gere o relatório, a ficha ou a consulta no papel timbrado, em PDF ou papel." (repete "papel") | "Imprima a ficha, a consulta ou a simulação no seu timbrado, em papel ou PDF." |
| C3 | Baixa | glossario.js:20 | termo "aren" em minúscula, entre termos em maiúscula | "aren (aceleração resultante normalizada)", ou manter a sigla e ordenar o glossário alfabeticamente (hoje está em ordem temática, sem indicação) |
| C4 | Baixa | js/app.js:550–552 | "NR-15 Anexo 1 - Lavg q=5" (hífen simples e sem espaços, diferente do resto) | intencional (limite de 40 caracteres do PPP): acrescentar a observação "texto curto para o campo 15.5" |
| C5 | Baixa | js/app.js:1056 | sexo: o rótulo é "Segurado: mulher" | "Segurada" quando for mulher (`c.sexo==='M'?'Segurada':'Segurado'`) |
| C6 | Baixa | js/app.js:590 | "Confira sempre a redação oficial no Planalto." (o Manual do INSS não está no Planalto) | "Confira sempre a redação oficial na fonte indicada." |
| C7 | Baixa | dados/novidades.js:4 | "Inconstitucionais as idades de 55, 58 e 60 anos…" (frase nominal) | "O STF declarou inconstitucionais as idades mínimas de 55, 58 e 60 anos…" |
| C8 | Baixa | js/app.js:1355 | "Use o botão \"☆ Favoritar\"" (o caractere ☆ dentro das aspas) | "Use o botão Favoritar (☆)" |
| C9 | Baixa | termos.html §4 | "função \"Baixar backup\"" (a interface diz "Baixar backup completo") | "função \"Baixar backup completo\"" |
| C10 | Baixa | js/app.js:111 e 102 | dois textos de instrução na linha do tempo (ver V22) | manter um |
| C11 | Baixa | vários | "e/ou" (330: "o Lavg (q = 5) e/ou o Leq") | "o Lavg (q = 5), o Leq (q = 3) ou ambos" |
| C12 | Baixa | dados/ajuda.js:7 | "Favorite fichas…" (verbo pouco usual) | "Marque como favoritos fichas, teses e anexos…" |

Não foram encontrados erros de crase, de concordância verbal ou de acentuação nos textos lidos. As datas seguem dd/mm/aaaa e a vírgula decimal é usada de forma coerente. A exceção é o campo de data nativo, que depende do locale do navegador.

### (D) Clareza e tom

| # | Sev. | Onde | Atual | Proposta |
|---|---|---|---|---|
| D1 | Média | index.html:26 (pré-visualização) | "Neste visualizador a impressão é bloqueada. Para imprimir ou salvar em PDF, abra a versão publicada do site (GitHub Pages) e use o mesmo botão." | "A impressão direta não está disponível nesta janela. Use \"Tentar imprimir\" ou abra o Caracterizador em uma aba própria do navegador." |
| D2 | Média | termos.html / privacidade.html | Faixa "Minuta. Texto-base preparado para revisão por assessoria jurídica…" | remover antes da venda; até lá, não mostrar ao usuário final |
| D3 | Média | js/app.js:826 | "Conteúdo das planilhas originais (Agentes Nocivos e Legislação Previdenciária), agora pesquisável." (referência interna) | "Quadros dos decretos, Anexo IV, LINACH e legislação complementar, com pesquisa." |
| D4 | Média | js/app.js:472 | "as NHT e a NHO dão o jeito de medir" (coloquial) | "as NHT e a NHO definem o método de medição" |
| D5 | Média | js/app.js:368 | passo "Simular · Com os meus dados, enquadra?" | "Simular · Aplicar a regra aos meus dados" |
| D6 | Média | js/app.js:1694 | "O robô verifica…"; coluna "Monitor: diário / auditoria semanal" | "Monitoramento automático diário"; coluna "Verificação" |
| D7 | Baixa | js/app.js:401 | "O ruído enquadra com 25 anos de exposição…" (verbo intransitivo, jargão) | "O ruído dá direito à contagem especial com 25 anos de exposição…" |
| D8 | Baixa | js/app.js:482 | "Armadilhas frequentes" | "Pontos de atenção" |
| D9 | Baixa | js/app.js:386 | "PPP tecnicamente correto pode ser recusado por redação" | "Um PPP tecnicamente correto pode ser recusado pela forma como foi redigido" |
| D10 | Baixa | js/app.js:417 | "Serve para escrever o laudo de modo a responder antecipadamente ao que o juízo e as partes vão perguntar." (orienta a redação do laudo) | "Contexto para entender as discussões em juízo; não é critério técnico." |
| D11 | Baixa | js/app.js:1431 | "Sentiu falta de alguma? A lista é ampliada nas atualizações." | "A lista é ampliada a cada atualização." (ou um link de sugestão) |
| D12 | Baixa | js/app.js:206 | parágrafo de 4 linhas com conversão e IN no mesmo bloco | dividir: frase 1 (o que faz) e frase 2 (critérios). A conversão vai para "Como preencher" |
| D13 | Baixa | Glossário | sem ordem alfabética nem agrupamento visível | ordenar ou mostrar os grupos (Ruído, Calor, Formulários…) |
| D14 | Baixa | Mistura de inglês | "backup", "link", "app", "FAST", "TWA" | aceitáveis no público-alvo; "backup" → "cópia de segurança (backup)" na primeira menção |

---

## Top 10 (ordem de correção)
1. **Impressão**: neutralizar os `min-width` dentro de `.pbody` e pôr `overflow:hidden` em `.sheet` (V1). Hoje a ficha impressa sai reduzida, com o rodapé do timbrado sobre o conteúdo.
2. **Hero do Início**: retirar "para laudos, pareceres e perícias", "Do texto legal ao laudo" e "fundamentar a conclusão" (B1).
3. **Veredictos**: trocar "Insalubre — grau…", "Periculosidade caracterizada" e "Não caracteriza" por "Enquadra / Não enquadra pelos dados informados" (B2).
4. **Folha impressa e Perfil**: sem linha de assinatura, "gerada em" no lugar de "emitido em", disclaimer novo e "Identificação nas impressões" (B4). O cabeçalho simples passa a ser o timbrado padrão, sem as redes pessoais de Rogério Grahl (V4).
5. **"Critério técnico da Grahl" e "critérios técnicos de titularidade da Grahl"**: retirar (B3).
6. **Terminologia única** "Nota técnica" × "Critério do INSS"; eliminar "perito" e "especialista" soltos (A1).
7. **Risco grave e iminente**: em caixa crítica própria, fora do veredicto verde; token `--crit` e revisão de `.v-n`/`.v-i` (V7, V8).
8. **Contraste**: `--gold:#86620F` no tema claro e botão primário dourado no escuro (V9, V10).
9. **Estados e rótulos**: "Dados insuficientes" em todas as telas, um único rótulo "Imprimir / PDF" e o fim do "(s)" (A2, A7, C1).
10. **Remover textos de bastidor**: "Minuta…", "GitHub Pages", "planilhas originais" e "robô" (D1, D2, D3, D6).
