# Auditoria de usabilidade: Caracterizador Pericial

Data: 23/11/2026 · Base: commit `21e989c` ("Campos de entrada: exemplos, avisos de valor e de data, guia da simulação").
Método: Playwright/Chromium (locale pt-BR), desktop 1280×900 e celular 390×844 (isMobile, touch). Telas abertas por `file:///…/index.html#<rota>`, faixa de termos e tutorial fechados com clique. Todos os scripts (`s*.js`) e capturas estão nesta pasta. Nenhum arquivo do repositório foi alterado.

Severidade: **Alta** = bloqueia ou induz a erro; **Média** = atrasa ou confunde; **Baixa** = acabamento.

Observação sobre as capturas: o Chromium headless usa a interface em inglês, então os `<input type="date">` aparecem como mm/dd/aaaa nas imagens. Num Chrome em português aparecem como dd/mm/aaaa (ver B8).

---

## 1. Transversais (todas as telas)

### T1 · Alta · Ponto como separador de milhar vira decimal, sem aviso
- **O que o usuário vê:** em NR-16, Anexo 1, digitar `1.500` em "Quantidade armazenada (kg)" dá **raio de 45 m** (a linha de 1,5 kg). Com 500 kg o raio é 345 m. Não aparece aviso nenhum. O mesmo vale para litros no transporte (Anexo 2: `1.000` L vira 1 L e o resultado é "não caracterizado"), distâncias, R$ e jornada. No Brasil é comum digitar o milhar com ponto.
- **Evidência:** `s18.js`: `a1 "1.500" kg: Raio da área de risco 45 m … fora da área de risco`, com aviso `undefined`.
- **Causa:** `js/motor.js:8`: `num()` faz `replace(',','.')` e `+x`, então "1.500" vira 1,5. `conferirNumero` (`app.js:1485`) só avisa se o valor sai da faixa, e 1,5 está dentro dela.
- **Correção:** em `num()`, aceitar o formato brasileiro: se houver `.` seguido de exatamente 3 dígitos e (vírgula decimal ou fim), remover os pontos (`/^\d{1,3}(\.\d{3})+(,\d+)?$/`). Quando o valor for ambíguo (ex.: `1.500` num campo de kg ou litros), mostrar no aviso "Entendido como 1.500 kg" para o usuário confirmar.

### T2 · Alta · Valor absurdo gera "Especial" e entra no total
- **O que o usuário vê:** Lavg `870` (erro ao digitar 87,0) mostra **Especial** nas duas colunas e soma no tempo especial. O aviso vermelho fica só embaixo do campo, longe da tabela. IBUTG `284` também dá Especial em todos os trechos.
- **Evidência:** `s2.js` (`lavg 870 res: … Especial Lavg 870,0 > 90 dB(A)`) e `s9.js` (`calor 284`).
- **Causa:** `motor.js` `avaliar()` não conhece as faixas de `REGRAS_CAMPO` (`app.js:1459`). O aviso é só visual (`conferirNumero`).
- **Correção:** quando o valor estiver fora da faixa de `REGRAS_CAMPO`, `resTable`/`avaliar` devem devolver o status "I" (Dados insuficientes) com o motivo "Lavg 870 fora do usual (30–140 dB(A)): confira a digitação". Assim o valor não soma no total.

### T3 · Alta · Teclado: foco vai para `<body>` depois de marcar rádio ou checkbox, apertar botão segmentado ou trocar select em várias telas
- **O que o usuário vê:** em NR-15 (Anexos 5, 6, 7, 9, 10 e 13-A, que têm checkbox, e 13 e 14, que têm rádios), Espaço ou seta deixa o foco perdido. A seta seguinte não anda na lista, e o próximo Tab volta ao topo da página (`tab after: SUMMARY`). O mesmo acontece em: botões segmentados do simulador de ruído ("Período a ser analisado", "Quando foi feita a medição?", "O que você tem em mãos?"), botão "Usar" do Anexo 11, selects de "Comparar agentes" e "Remover" período.
- **Evidência:** `s16.js` (`a14 after space: BODY`, `a5 cb after space: BODY`, `after usar focus BODY`), `s8.js` (`focus after seg Enter: BODY`), `s12.js` (`focus after cmp select change: BODY`), `s3.js` (`rows after remove 2 focus: BODY`).
- **Causa:** `app.js` no listener de `input`, ramo `data-ins`: `if(t.type!=='radio'&&t.type!=='checkbox') refocus(id)`. Os handlers de clique `data-useg`, `data-a11`, `data-del` e o `change` de `data-cmpag` (`app.js:1338`) chamam `render()` sem devolver o foco. A NR-16 faz certo (`data-per` usa `refocus(id)` e o foco fica no lugar).
- **Correção:** chamar sempre `refocus(t.id)` depois de `render()`, rádio e checkbox incluídos. Nos botões, guardar um seletor (`[data-useg="tipo"][data-v="dose"]`) e devolver o foco a ele. Depois de "Remover", focar o cabeçalho do período seguinte ou o botão "Adicionar período".

### T4 · Média · Resultados mudam sem aviso para leitor de tela
- **O que o usuário vê:** as tabelas `#res-N`, a `#totbar`, os veredictos (`.verdict`) da NR-15 e da NR-16 e o `#ures` são recriados a cada tecla, mas não há `aria-live` em lugar nenhum (`grep aria-live js/app.js` não acha nada). Só os avisos de campo têm `role="status"`.
- **Correção:** colocar `aria-live="polite"` nos contêineres estáveis `#totbar`, `#res-*`, `#ures` e `#calcbox .verdict` (ou numa região única com um resumo curto, ex.: "Período 1: Especial pelos dois critérios").

### T5 · Média · Rótulos com jargão sem explicação nos formulários
- **O que o usuário vê:** "Jornada Te (min)", "Lavg dB(A) · q = 5", "NE q = 3 (NHO-01)", "aren (m/s²)", "VDVR (m/s¹·⁷⁵)", "M (W)", "Atenuação NRRsf", "Cancerígeno LINACH Grupo 1", "Concentração" (sem unidade) e "LT (mesma unidade)". O glossário (`marcarSiglas`) marca as siglas no texto corrido, mas **nenhuma** sigla dentro de `label` (`s*.js`: `glossed siglas in labels []`).
- **Correção:** acrescentar `<small class="hint">` sob o rótulo, ligado por `aria-describedby`, com uma linha em português claro. Exemplos: "Te: duração da jornada em minutos (8 h = 480)", "q = 5: fator de duplicação da NR-15; é o Lavg do laudo", "aren: aceleração resultante de exposição normalizada, em m/s²". Para "Concentração", mostrar a unidade escolhida ou um select ppm/mg/m³.

### T6 · Média · Avisos de campo desalinham a grade
- **O que o usuário vê:** com as datas trocadas, o aviso de 3 linhas embaixo de "Fim" empurra o campo para cima, e Início e Fim ficam em alturas diferentes.
- **Evidência:** `caso-datas-invertidas.png`.
- **Causa:** `avisoCampo` (`app.js:1478`) põe `<small>` dentro de `label.f`, e a grade `.fields` alinha pelo fim.
- **Correção:** `.fields{align-items:start}`, ou pôr o aviso fora do fluxo da grade (`grid-column:1/-1` numa linha própria), ou reservar `min-height` para ele.

### T7 · Média · Cabeçalho fixo ocupa 26% da tela no celular
- **O que o usuário vê:** em 390×844 o `header.band` fixo tem **222 px** (logo, busca e abas em 3 linhas). Sobram cerca de 620 px para o formulário. Com o teclado virtual aberto, quase não se vê o campo.
- **Evidência:** `m-caso-scroll.png`, `m-caso-focus.png` (`s4.js`: `header: sticky h=222`).
- **Correção:** no celular, deixar fixa só a barra de busca e as abas numa linha com rolagem horizontal, ou esconder o cabeçalho ao rolar para baixo e mostrar ao rolar para cima. Tirar o logo da área fixa abaixo de 600 px.

---

## 2. Aposentadoria especial: Simulação de enquadramento (`#aposentadoria/caso`)

### C1 · Alta · Períodos sobrepostos são somados duas vezes, e o guia manda fazer isso
- **O que o usuário vê:** "Como preencher", item 1: "Se o mesmo vínculo teve dois agentes (ex.: ruído e calor), crie dois períodos com as mesmas datas". Com dois períodos de 01/01/1990 a 31/12/1995, os dois Especial, o total vai a **12 a 0 m 2 d** em vez de 6 anos. A conversão também dobra.
- **Evidência:** `s3.js`: `overlap tot: 12 a 0 m 2 d`; `caso-3periodos.png`.
- **Causa:** `motor.js` `totais()` soma `s.dias` de todas as linhas sem juntar os intervalos.
- **Correção:** em `totais`, juntar os intervalos especiais de cada critério antes de somar (união de datas). Se houver tempos exigidos diferentes no mesmo dia, usar o mais favorável. Mostrar uma nota: "2 períodos se sobrepõem; os dias foram contados uma vez". Até isso ficar pronto, mudar o texto do guia.

### C2 · Alta · Períodos antes de 1960/1964 contados como especiais
- **O que o usuário vê:** de 01/01/1950 a 01/01/1965 o resultado é **Especial, 5.480 dias, base "Dec. 53.831/64"**. O aviso do campo diz que antes de 26/08/1960 "a base não traz regras", mas o resultado conta os dias mesmo assim.
- **Evidência:** `s2.js` (`1950 res`).
- **Causa:** `motor.js` `avaliar()`: os cortes começam em 1995/1997. Não há corte em 1960-08-26 nem em 1964-03-25.
- **Correção:** incluir esses cortes e devolver "I" ou "N" com o texto "Sem regra na base antes de 26/08/1960" para o trecho anterior.

### C3 · Média · Datas invertidas: a tabela diz "Informe início e fim"
- **O que o usuário vê:** com as duas datas preenchidas e trocadas, a área do resultado mostra só "Informe início e fim do período." (em amarelo). O aviso certo ("O fim … é anterior ao início … Inverta as datas.") aparece apenas embaixo do campo.
- **Causa:** `motor.js:67`: a mesma mensagem cobre data vazia e `fim<ini`.
- **Correção:** separar as mensagens ("Fim anterior ao início: inverta as datas") e oferecer um botão "Inverter datas".

### C4 · Média · "Remover" período sem confirmação nem desfazer; trocar o agente apaga a medição
- **O que o usuário vê:** um clique em "Remover" apaga o período, com todas as medições e o EPI, sem toast e sem desfazer, e o foco cai no `<body>`. "Limpar períodos" e "Excluir caso" pedem um segundo toque, mas também não têm desfazer. Trocar o "Agente nocivo" faz `row.d={}`: quem escolhe Calor por engano perde Lavg, NE e EPI.
- **Causa:** `app.js` handler `data-del` (`splice` direto) e ramo `f==='agente'` (`row.d={}`).
- **Correção:** toast "Período 2 removido. Desfazer" (guardar a linha e o índice por 8 s). Guardar `row.dPorAgente[agente]` para recuperar os dados se o usuário voltar ao agente anterior.

### C5 · Baixa · Jornada Te vazia vira 480 sem avisar
- O usuário apaga Te e o resultado continua calculado com 480 (`ruidoDerive`, `motor.js`). Mostrar "Te vazio: considerado 480 min" no `rinfo`, ou deixar 480 como placeholder e não como valor.

### C6 · Baixa · Avisos de data piscam enquanto se digita o ano
- Ao digitar o ano dígito a dígito, o valor passa por 0001, 0019 e 0199, e o aviso "Antes de 26/08/1960…" aparece e some (`s11.js`, linha "caso"). Disparar `conferirDatas` só no `change`/`blur`, ou ignorar anos com menos de 4 dígitos.

### C7 · Baixa · Função ou empresa longa vira uma palavra por linha no celular
- `m-caso-texto-longo.png`: a `.rtt` do cabeçalho do período fica com cerca de 100 px ao lado dos botões. Correção: `header{flex-wrap:wrap}` e botões em linha própria abaixo de 480 px, mais `text-overflow:ellipsis` com `title`.

### C8 · Baixa · Faixas plausíveis faltando
- Dose `5000%` (e NRRsf, M kcal/h) não gera aviso, porque não há regra em `REGRAS_CAMPO` para `Dose|%`, `NRR` e `kcal/h`. Acrescentar: Dose 0–10000% com aviso acima de 1000%, NRR 0–45 dB, kcal/h 80–800.

---

## 3. Fichas dos agentes e simuladores (`#ir/ag:*`)

### F1 · Alta · Ruído: o quadro "2. Enquadrar um período" não deixa mudar o modo e sobrescreve o que o usuário digita
- **O que o usuário vê:** em "Como a medição foi informada", escolher "Dose do dosímetro" faz o select voltar a "Lavg informado". Digitar Lavg `95` e depois marcar "Protetor auditivo" troca o valor por **88,8**, que vem do quadro 1. A Jornada Te também é trocada (vira 930 quando a soma dos tempos passa de 480).
- **Evidência:** `s8.js`: `after mr=dose select value: lavg`, `after epiu: … lavg 88,8`, `part2 te 930`.
- **Causa:** `rsSimular()` (`app.js:498`) chama `uSync(uCalc())` a cada `render()`. `uSync` (`app.js:464`) força `row.d.mr='lavg'`, `lavg` e `te`.
- **Correção:** sincronizar só quando o quadro 1 mudar (dentro de `uRefresh`), não no render. Ou trocar a cópia automática por um botão "Usar este Lavg no enquadramento". Ou, enquanto estiver ligado ao quadro 1, mostrar Lavg e Te do quadro 2 como somente leitura, com o texto "vindo do cálculo acima · editar".

### F2 · Média · Calculadora de leituras descarta entradas mal formatadas sem avisar
- `92,93,92` (vírgulas sem espaço) faz a situação inteira sumir do cálculo: o Lavg cai de 88,8 para 85,8 e o tempo para 330 min. `92 93 abc` descarta "abc" sem dizer nada. O campo não tem aviso.
- **Causa:** `liParse` (`app.js:216`) filtra os `null`. `conferirNumero` não roda porque o rótulo "Leituras dB(A)" casa com a regra de dB, mas o valor é uma lista, não um número.
- **Correção:** aviso próprio no campo de leituras: "3 leituras reconhecidas: 92; 93; 92" ou "‘abc’ ignorado". Aceitar vírgula seguida de dígito de 2 casas como separador de lista quando não houver `;`.

### F3 · Média · Soma dos tempos diferente da jornada não é sinalizada
- Com tempos de 600+180+90+60 = 930 min e Te = 480, a calculadora mostra "NE da jornada … 930 min" sem alertar. Mostrar "Soma dos tempos (930 min) ≠ Te (480 min): confira".

### F4 · Média · Vibração, Mãos e braços: campos de corpo inteiro continuam na tela
- Com "Tipo = VMB" aparecem "VDVR" e "Referência ISO (1997–2014)" com três opções da ISO 2631 (VCI). Na NR-15, Anexo 8, o VDVR some para VMB, então as duas telas se comportam de jeitos diferentes.
- **Causa:** `campos()` caso `vibracao` (`app.js:139`). O filtro é sempre `x.tipo!=='vmb'`.
- **Correção:** esconder VDVR e trocar o select ISO pela ISO 5349 quando `d.tipo==='vmb'`.

### F5 · Média · Químicos, modo qualitativo: campos quantitativos irrelevantes
- Benzeno em "Qualitativo" mostra "Concentração" e "LT (mesma unidade)" (sem unidade). Mostrar esses campos só em `modo==='quant'` e incluir a unidade.

### F6 · Média · Calor: duas unidades para a taxa metabólica
- O mesmo formulário pede "M média ponderada (kcal/h) · Quadro 2" e "M (W) · a partir de 11/12/2019". Na NR-15 é "Taxa metabólica M (W)". Explicar a diferença no rótulo ("até 2019: kcal/h do Quadro 2 original; desde 11/12/2019: W"), ou converter automaticamente (1 W ≈ 0,86 kcal/h).

### F7 · Baixa · Texto do botão muda depois de incluir
- O botão "Incluir na simulação" volta como **"Incluir na análise de caso"** 2 s depois (`app.js`, handler `data-simuse`, `setTimeout`). Usar o mesmo texto.

### F8 · Baixa · Passos da ficha no celular escondem os passos 4 e 5
- A `nav.rsnav` rola na horizontal (até 661 px em 390), sem indicação de que há mais à direita. O passo "Simular" é exatamente o que fica escondido. Mostrar sombra ou seta na borda, ou quebrar em 2 linhas.

---

## 4. Regra na data (`#aposentadoria/data`) e Comparar (`#aposentadoria/comparar`)

### D1 · Alta · Não dá para digitar a data pelo teclado
- **O que o usuário vê:** digitar `15031997` no campo "Data" dá **07/09/2026**. Cada dígito que forma uma data válida dispara `change`, a tela é redesenhada, o foco volta ao primeiro segmento e o próximo dígito cai no mês ou no dia. Só o seletor de calendário funciona. O mesmo vale para "Segunda data".
- **Evidência:** `s10.js`, `s11.js` (sequência `1→2026-01-07 | 5→2026-05-07 | 0→ | 3→2026-03-07 …`). No formulário do caso, que não redesenha o input, a mesma digitação funciona.
- **Causa:** `app.js` listeners `change` de `data-rd` e `data-rd2` (logo depois de `renderRegraData`): `render()` + `focus()`.
- **Correção:** atualizar no `blur` ou com debounce de cerca de 600 ms e só quando o ano tiver 4 dígitos e estiver acima de 1900. Ou redesenhar só a área de resultados, sem recriar o `<input>`.

### D2 · Baixa · "Comparar agentes": foco perdido ao trocar o select
- Ver T3. Também falta um botão "Trocar ordem" ou "Limpar"; a mensagem "Escolha pelo menos dois agentes" está certa.

---

## 5. Resultado da simulação (`#aposentadoria/resultado`)

### R1 · Média · Não diz se o tempo exigido foi atingido
- Os cartões mostram o tempo especial e a diferença entre os critérios, mas não comparam com 15, 20 ou 25 anos nem dizem quanto falta. Também não listam os trechos em "Dados insuficientes", que são justamente o que o usuário precisa completar.
- **Correção:** um cartão "Tempo exigido: 25 anos · atingido / faltam X a Y m Z d (especialista) · (INSS)" e a lista "3 trechos sem dados → ir ao período".

### R2 · Média · A explicação da linha do tempo não funciona no toque
- O texto diz "Passe o cursor ou toque nos trechos", mas o fundamento está só em `<title>` dentro do SVG (`timelineSVG`, `app.js:88`), que não aparece no toque nem chega ao leitor de tela de forma confiável.
- **Correção:** ao tocar no `rect` (com `tabindex=0` e `role=button`), mostrar um painel abaixo com o fundamento.

### R3 · Baixa · Nomes inconsistentes
- "edite na aba **Análise de caso**" (`renderPainel`), mas a aba se chama "Simulação de enquadramento". A mensagem vazia "Inclua períodos na aba Aposentadoria especial" também é vaga. Usar o nome da aba e um link.

---

## 6. Insalubridade, NR-15 (`#insalubridade`, `#ir/a15:*`)

### I1 · Alta · Anexo 1: a tabela de NPS não funciona e grava lixo no caso aberto
- **O que o usuário vê:** mudar "NPS da linha 1" para 100 e "Tempo da linha 2" para 400 deixa Dose, Lavg e NEN iguais (146,7%, 87,8, 87,8). No primeiro redesenho (ex.: "Adicionar nível"), os valores digitados voltam aos de exemplo (88, 240…). Além disso, os valores vão para o **caso ativo** como `S.caso["0"]=100` e `S.caso["1"]=400`, são salvos no `localStorage` e saem no export.
- **Evidência:** `s15.js`: `after NPS1=100, T2=400 Dose 146,7% …` e `case keys ["0","1","nome",…] 0=100 1=400`.
- **Causa:** no listener `input` (`app.js`, cerca da linha 905), o ramo `if(t.dataset.c){ S.caso[t.dataset.c]=t.value; save(); … }` vem **antes** de `if(t.dataset.nps!==undefined)`. Os inputs da tabela têm `data-c="0"`/`"1"` (string não vazia, portanto verdadeira).
- **Correção:** renomear o atributo da coluna (`data-npsc`) em `calcIns` caso `ruido` e no handler, ou testar `t.dataset.nps` antes de `t.dataset.c`. Limpar as chaves numéricas em `limpaCaso`.

### I2 · Alta · Anexos 2, 3, 8 e 12: campos aparecem preenchidos, mas o resultado diz "Faltam dados"
- **O que o usuário vê:** ao abrir o Anexo 3, IBUTG mostra `29,5` e M mostra `300`, e o veredicto diz "**Faltam dados · Informe IBUTG e M.**" O mesmo acontece no Anexo 2 (pico 132), no Anexo 8 (aren 1,2) e no Anexo 12 (% quartzo 10). Isso faz o usuário achar que a ferramenta está quebrada ou que o valor visível não vale.
- **Evidência:** `s17.js`, `a15-3-inicial.png`, `a15-2-inicial.png`, `a15-8-inicial.png`, `a15-12-inicial.png`.
- **Causa:** `iin(k,lab,def)` mostra `insv(k,def)`, enquanto `calcIns` lê `n=v=>num(insv(v,''))`, sem o padrão (`app.js:554` e `563`).
- **Correção:** ler os campos com o mesmo padrão (`n('ib',29.5)`), ou não preencher valor (só placeholder). A segunda opção é a mais coerente, junto com um botão "Carregar exemplo".

### I3 · Alta · "Base de cálculo (R$)" ignora o formato que o próprio aviso sugere
- **O que o usuário vê:** `1518,00` (o exemplo do aviso "ex.: 1518,00") não mostra o valor em R$ no veredicto. `R$ 1.518,00` mostra um aviso. Só `1518` funciona.
- **Evidência:** `s14.js`.
- **Causa:** `resultado()` (`app.js:557`): `+(insv('base','')||0)`, sem `num()`, então a vírgula dá `NaN`.
- **Correção:** usar `num()` corrigido (T1) e aceitar "R$". No celular, repetir o valor em R$ perto do campo de base, porque o veredicto fica bem acima dele.

### I4 · Média · Anexo 3: select do Quadro 2 desatualizado
- Depois de escolher uma atividade (M = 153) e digitar M = 700, o select continua mostrando "Sentado — Trabalho moderado… (153 W)". O veredicto diz "Informe IBUTG e M" (ver I2), em vez de "M fora do Quadro 1 (100–606 W)". Ao editar M, voltar o select para "Escolher no Quadro 2…".

### I5 · Média · Anexos 13 e 14: escolha única sem como desmarcar e lista de 100+ rádios
- Não há como voltar ao estado "nenhuma atividade". O nome acessível concatena o grau sem espaço ("MÁXIMOExtração e manipulação…", B9). Acrescentar "Limpar escolha", separar `<em>` com espaço ou `aria-hidden` e repetir o grau no fim ("— grau máximo").

### I6 · Baixa · Anexo 11: ordem da busca
- "tolueno" lista "2,4 Diisocianato de tolueno (TDI)" antes de "Tolueno (toluol)", e "benzeno" começa por "Anilina". Ordenar pelo nome principal que começa com o termo e só depois pelos sinônimos.

---

## 7. Periculosidade, NR-16 (`#periculosidade`, `#ir/a16:*`)

### P1 · Média · Checkboxes com nome acessível sem conteúdo
- O nome lido é "Item 1 — Atividades ou operações perigosas — **a**". O `aria-label` substitui os `<label for>`, então a descrição da atividade não é lida (o pedido citava exatamente "a"/"b"/"1"). Isso acontece em todos os anexos (`s18.js`).
- **Causa:** `secHtml()` (`app.js:692`), `aria-label="'+sec.tit+' — '+it[0]+'"`.
- **Correção:** tirar o `aria-label` (os dois `<label for>` já dão nome) ou usar `aria-labelledby` apontando para o id do item e o da descrição.

### P2 · Média · No celular a tabela de itens é cortada e o veredicto fica 4.000 px abaixo
- Em 390 px a tabela tem 640 px num contêiner de 324: a descrição é cortada à direita e a coluna "direito/área" fica fora da tela (`m-peric-a2-topo.png`). Depois de marcar o item "a" no topo, o veredicto está a cerca de 4.250 px (`s18`/`m-peric-a2.png`).
- **Correção:** abaixo de 600 px, transformar cada linha em cartão (checkbox + texto + 3ª coluna em `<small>`). Pôr um resumo fixo no rodapé ("Faltam elementos · ver resultado ↓") ou um link "Ver resultado" depois de cada seção.

### P3 · Média · Frequência da exposição é global e já vem marcada
- "Permanente" vem marcado por padrão, então o veredicto pode dar "caracterizada" sem o perito ter avaliado a frequência. A escolha (ex.: "Intermitente") passa para os outros anexos (`s18.js`: `a5 fr checked fr-int`), e "Limpar marcações deste anexo" não a limpa.
- **Causa:** `pget('fr','perm')` com chave única `fr` (`avaliaPeric`/`renderPeric`).
- **Correção:** chave por anexo (`an.id+':fr'`), sem padrão. Sem escolha, o veredicto fica em "Faltam elementos: informe a frequência".

### P4 · Baixa · Salário-base com milhar
- `3.500,00` mostra o aviso "Use só números" e não calcula o valor. Ver T1.

---

## 8. Pesquisa geral (`#gq`)

### G1 · Média · A busca não acha as ferramentas
- "simulação", "calculadora" e "simular" dão "Nada encontrado". A primeira coisa que muita gente procura é onde simular ou calcular. Indexar as telas e calculadoras ("Simulação de enquadramento", "Calculadora de dose — NR-15 Anexo 1", "Calculadora de IBUTG", "Área de risco de explosivos") em `buildIndex`.

### G2 · Média · Navegação e histórico
- Digitar 2 caracteres troca a rota com `history.replaceState` (`app.js`, ramo `t.id==='gq'`). O botão Voltar não leva de volta à tela onde o usuário estava, e apagar a busca deixa a pessoa em "Pesquisa geral". ↓ e Enter não levam ao primeiro resultado, e Tab passa por todas as abas antes de chegar aos resultados.
- **Correção:** `pushState` na primeira tecla. Esc ou campo vazio voltam à rota anterior. ↓/Enter focam e abrem o primeiro `.hit`.

### G3 · Baixa · Dicas contraditórias
- "Use mais de uma palavra para refinar" e, quando não acha nada, "…ou uma palavra só".

---

## 9. Perfil e dados (`#perfil`), Meus casos

### U1 · Média · "Restaurar backup" substitui o perfil sem perguntar e duplica casos
- `importarArquivo` (`app.js:1047`) troca todo o `PERFIL` pelo do arquivo sem confirmar. Restaurar o mesmo backup duas vezes cria uma cópia de cada caso, porque um id existente recebe id novo.
- **Correção:** antes de aplicar, mostrar "Este backup tem N casos (M já existem aqui) e um perfil de <nome>. Substituir perfil? Casos repetidos: ignorar / duplicar". Pular casos com o mesmo `id` e o mesmo `alterado`.

### U2 · Baixa · Nenhuma confirmação de salvamento do perfil
- Os campos salvam a cada tecla, sem nenhum indicador. Um "Salvo neste navegador ✓" discreto ao lado do título evita dúvida.

---

## 10. Acabamento (Baixa)

- **B1** Alvos de toque menores que 40 px no celular: siglas do glossário (`button.gl` 25×17), checkboxes 18×18 nas tabelas da NR-16 (a célula da descrição também é label, o que ajuda), "Ver o tutorial de boas-vindas" (24 px de altura) e os `ghost sm` (cerca de 32 px). `s4.js`.
- **B2** Placeholders de exemplo repetidos para campos diferentes: Lavg e NE com "Ex.: 85,3"; Concentração e LT com "Ex.: 0,5". Placeholder cinza num campo vazio pode parecer valor digitado. Diferenciar os exemplos ou usar `hint` abaixo do campo.
- **B3** O aviso de data usa dd/mm/aaaa, mas o `<input type=date>` segue o idioma da interface do navegador. Num navegador em inglês aparece "05/01/2010" ao lado da mensagem "início (01/05/2010)" (`caso-datas-invertidas.png`). Considerar 3 campos (dia/mês/ano) ou um texto com máscara dd/mm/aaaa.
- **B4** Ao adicionar o primeiro período, a data padrão (01/01/2000 a 30/12/2000) é arbitrária e o período já conta 365 dias. Melhor vir vazio, com foco no "Início".
- **B5** "Restaurar exemplo" nos simuladores apaga o que foi digitado sem confirmação.

---

## Top 10 para corrigir primeiro

1. **I1**: tabela de NPS do Anexo 1 não recalcula e grava `S.caso["0"]/["1"]` no caso salvo (`data-c` capturado pelo handler de caso).
2. **C1**: períodos sobrepostos somados duas vezes, e o "Como preencher" manda criá-los (`motor.js totais`).
3. **I2**: Anexos 2, 3, 8 e 12 mostram valores nos campos, mas dizem "Faltam dados" (padrão do `iin` ≠ leitura do `calcIns`).
4. **T1**: "1.500" lido como 1,5 em kg, litros, m e R$, sem aviso (`motor.js num`).
5. **F1**: no simulador de ruído, o quadro 2 trava o modo em "Lavg" e sobrescreve Lavg e Te digitados (`rsSimular → uSync` a cada render).
6. **T2**: valores fora da faixa (Lavg 870, IBUTG 284) viram "Especial" e entram no total. Devem virar "Dados insuficientes".
7. **D1**: em "Regra na data" não dá para digitar a data pelo teclado (render no `change`).
8. **T3**: foco perdido depois de rádio, checkbox, botões segmentados, "Usar", "Remover" e select de comparar. Teclado inutilizável nos anexos 5–14 da NR-15.
9. **I3**: "Base de cálculo" não aceita `1518,00`, o exemplo que o próprio aviso dá (`resultado()` usa `+` em vez de `num`).
10. **C2 + C3**: trechos antes de 1960/1964 contados como especiais. Datas trocadas mostram "Informe início e fim" em vez do motivo real.

Depois disso: P1 e P3 (nome acessível e frequência global na NR-16), P2 e T7 (layout no celular), C4 (desfazer "Remover"), R1 (dizer se o tempo exigido foi atingido) e G1 (busca encontrar as ferramentas).
