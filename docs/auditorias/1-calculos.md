# Auditoria 1 — Cálculos e regras (Caracterizador Pericial)

Repositório auditado: `/home/user/caracterizador-pericial` (commit `eb0cc99`). Nenhum arquivo do repositório foi alterado.
Método: recálculo independente de casos de referência, comparados com o que o código devolve. O motor (`js/motor.js`) foi rodado em Node (vm) e as calculadoras de `js/app.js` no Chromium/Playwright, chamando as funções da própria página.

Scripts auxiliares (nesta pasta):
- `sonda.cjs`: abre o site no Chromium e avalia expressões (`node sonda.cjs e1.js`, `e2.js`, `e3.js`)
- `e1.js`: num(), tmaxQuadro, lookupM, liCalc
- `e2.js`: calcIns, Anexos 1, 2, 3, 8, 11 e 12
- `e3.js`: NR-16 (explosivos, transporte), uCalc com sincronização para o motor
- `motor-sonda.mjs`: casos do motor (ruído, calor, vibração, datas, totais, EPI, LINACH)
- `q1-2019.mjs`: confere o Quadro 1 do Anexo 3 de 2019 contra a fórmula
- `a11-amostra.mjs`: amostra de 26 entradas do Anexo 11
- `tests-sugeridos.mjs`: 31 testes node:test (27 passam; 4 marcados `todo` documentam as falhas). Rodados com `run/` (symlinks para `dados/` e `js/`): `node --test run/tests/tests-sugeridos.mjs`, resultado pass 27, fail 0, todo 4.

Os 25 testes existentes (`tests/motor.test.mjs`) passam.

## Resumo

| Área | Verificações | PASS | FAIL | Verificar |
|---|---:|---:|---:|---:|
| Ruído (Anexo 1, dose, Lavg/NE/NEN, cortes, NHT-06, >115 dB, impacto) | 34 | 27 | 5 | 2 |
| Calor (Anexo 3 original e 2019, TE > 28 °C, vestimenta) | 30 | 26 | 1 | 3 |
| Vibração (Anexo 8, ISO 1997–2014) | 10 | 9 | 0 | 1 |
| Químicos (Anexo 11, FD, teto, Anexo 12) | 26 | 21 | 3 | 2 |
| NR-16 (explosivos, transporte, áreas de risco) | 14 | 11 | 1 | 2 |
| Datas, conversão, totais, EPI, categoria, LINACH | 22 | 18 | 3 | 1 |
| num() e parsing | 16 | 11 | 5 | 0 |
| **Total** | **152** | **123** | **18** | **11** |

FAIL conta cada caso que falhou, não cada causa. As 18 falhas vêm de **13 causas** (F1 a F13). F1 sozinha responde por 6 casos, porque o mesmo bug do `num()` aparece em várias calculadoras.

---

## Falhas e dúvidas, por severidade

### Alta

**F1. `num()` lê "0.500", "0.050" e "1.125" como milhar** (`js/motor.js:12`)
A regex `/^-?\d{1,3}(\.\d{3})+$/` trata qualquer número com ponto e três casas como milhar, até quando o primeiro grupo é 0.

| Entrada | Esperado | Obtido | Efeito |
|---|---|---|---|
| `num("0.500")` | 0,5 | 500 | — |
| `num("0.050")` | 0,05 | 50 | — |
| Anexo 8, VCI, aren "0.900" | ≤ 1,1, não caracteriza | 900, **"Insalubre — grau médio"** | resultado invertido |
| Anexo 11, Hg, média "0.050" mg/m³ | 0,05 > 0,04, insalubre (por acaso) | média 50 | valor exibido errado |
| Anexo 12, sílica respirável "0.100" com 10% de quartzo | 0,1 ≤ 0,667, não caracteriza | **insalubre, grau máximo** | resultado invertido |
| Motor químico quantitativo, conc "0.050", LT "0,1" | N/N | **E/E** | resultado invertido |
| NR-16, explosivos, "0.500" kg (Quadro 4) | raio 45 m | raio 345 m | área de risco errada |
| Motor, aren "0.900" | ≤ 0,9 | "fora do usual" (I) | falha segura |

Todos os campos são `type="text" inputmode="decimal"`, então o usuário pode digitar ponto decimal com três casas (resultado de laboratório como 0.050, aren como 0.900).
Correção: só tratar como milhar quando o primeiro grupo não começa com 0 (`/^-?[1-9]\d{0,2}(\.\d{3})+$/`). Melhor ainda: aceitar milhar com ponto só em campos de moeda, kg ou litros (por exemplo `num(v,{milhar:true})`). Em grandezas técnicas como dB, °C, m/s², ppm e mg/m³, "1.125" quase sempre é decimal. Aproveitar para trocar `isNaN(x)` por `!isFinite(x)`: hoje `num("Infinity")` devolve Infinity.

**F2. O Simulador de ruído manda para "Enquadrar um período" o Lavg do tempo medido, não o da jornada** (`js/app.js:504`, uSync; `js/app.js:492-497`, uCalc)
Caso: leituras de 92 dB(A) por 240 min, Te = 480 min, método NR-15. O quadro 1 (uCalc/liCalc) dá D = 240/180 = 1,333, NE = NEN = 85 + 16,61·log(1,333) = **87,1** e diz "o restante foi tratado como abaixo do limiar". O `uSync` grava `d.lavg = 92,1` (média só dos 240 min) e `d.te = 480`. O motor calcula NEN = **92,1**.
Efeito, para um período de 06/03/1997 a 18/11/2003: a tabela do quadro 1 mostra 87,1 ≤ 90, **Não especial**, e o quadro 2 (motor) mostra 92,1 > 90, **Especial**. Os dois quadros da mesma tela dão resultados opostos. Confirmado no Chromium (sonda `e3.js`).
Correção: sincronizar `row.d.lavg = r1(r.ne)`, o NE sobre `base = max(T, Te)`, ou gravar `te = r.tm`.

### Média

**F3. Motor, modo "Leituras pontuais (NPS × tempo)": a energia é dividida pela soma dos tempos T, não pela jornada** (`js/motor.js:60-66`)
Caso: 92 dB × 240 min, Te 480, período de 2000. Esperado (mesmo critério do liCalc, restante abaixo do limiar): Lavg da jornada = 92 + 16,61·log(240/480) = 87,0 ≤ 90, N/N. Obtido: Lavg 92,0, **E/E**. Quando T < Te, o NEN q = 5 e o NEN q = 3 também ficam superestimados.
Correção: usar `Tden = Math.max(T, te)` em `16.61*log10(E5/Tden)` e `10*log10(E3/Tden)`, ou avisar como o liCalc faz. Se a intenção é que as leituras representem a jornada inteira, dizer isso no campo. Há teste `todo` sugerido.

**F4. Calor: o ajuste de vestimenta depende da data de início do período, não da data de 2004** (`js/motor.js:142`)
`a>='2004-01-01'` usa o início do segmento, e não há corte em 01/01/2004. Caso: 2000 a 2010, IBUTG 26,5, vestimenta 0,5, moderada, contínuo. Esperado: trecho de 2004 em diante com 27,0 > 26,7, E. Obtido: período inteiro N, ajuste ignorado. O mesmo caso começando em 2004 dá E.
Correção: em `motor.js:82`, acrescentar `'2004-01-01'` aos cortes de calor quando `num(d.av)` existir. Há teste `todo` sugerido.

**F5. LINACH com agente quantitativo (asbestos, sílica, cloro): de 1997 a 2013 o resultado fica sempre em "Dados insuficientes"** (`js/motor.js:230-231`; `js/app.js:169`)
No modo `linach`, antes de 17/10/2013 o motor chama `quant()` quando `agent.modo==='quant'`. A ficha só mostra os campos de concentração e LT quando o modo escolhido é `quant`. Caso: asbestos, modo LINACH, 2000 a 2015. Obtido: `2000-01-01..2013-10-16 I/I "Informe concentração e LT."`, sem campo onde informar.
Correção: mostrar conc/LT também no modo `linach` quando `a.modo==='quant'`.

**F6. Agentes LINACH vêm no modo qualitativo, e o EPI então descaracteriza** (`js/app.js:168-169`; `js/motor.js:86, 220`)
Caso: benzeno (Grupo 1, CAS 71-43-2), 2016, EPI eficaz, modo padrão. Obtido: **N/N**. Esperado pelo art. 68, §4º, do RPS (red. Dec. 8.123/2013) e pelo INSS a partir de 08/10/2014 (Portaria Interministerial 9/2014; IN 128, art. 298, conforme o próprio app): EPI não afasta, E/E. Só sai correto se o usuário trocar o modo à mão para "Cancerígeno LINACH Grupo 1".
Correção: em agentes inteiramente do Grupo 1 (benzeno, asbestos, sílica cristalina), abrir em `linach`, ou avisar quando houver EPI. Em agentes mistos (cromo, níquel, petróleo), mostrar um alerta.

**F7. Anexo 11: só com a "maior amostra", o resultado é "Não caracteriza insalubridade"** (`js/app.js:675`)
Caso: tolueno, sem média, maior amostra 200 ppm. Obtido: "Não caracteriza… média — ≤ LT 78" ao lado do alerta de risco grave. Sem a média não é possível aplicar o item 8 (média aritmética > LT).
Correção: com `md===null` e sem teto, passar `ok=null` (Faltam dados) e manter o alerta do item 7.

**F8. Duas calculadoras de "NR-15, Anexo 1" tratam diferente os níveis de 80 a 84 dB(A)** (`js/app.js:260-268` × `js/app.js:623`)
`calcIns` (Anexo 1) diz "Níveis abaixo de 85 dB(A) não somam dose", em linha com o Quadro, que começa em 85. `liTi` nos métodos `nr15` e `nht06q`, usados pelo Simulador em "Leituras", soma 80 a 84 dB(A) com os tempos da tabela da NHT-06. No exemplo padrão (inspeção a 84 dB(A) por 90 min), a dose sobe de 1,433 para 1,597 e o NEN de 87,6 para 88,4. O método se chama "NR-15, Anexo 1", mas o limiar de 80 dB(A) não está no Anexo 1: vem da NHO-01 e da NHT-06. O próprio app chama isso de "nota do especialista".
Recomendação: decisão do especialista. No mínimo, padronizar, ou renomear o método para deixar claro que inclui 80 a 84 dB(A).

### Baixa

- **F9.** Anexo 1, modo "Lavg e jornada" (`js/app.js:617-620`): a dose sai do Lavg sem arredondar. Lavg 85,04 aparece como "85,0 dB(A)" e o resultado é **Insalubre** (dose 100,6%). Correção: `D=(te/480)*2^((r1(L)-85)/5)`.
- **F10.** Anexo 1, NPS (`js/app.js:607, 623`): `tmaxQuadro` usa o valor bruto, então 85,04 cai na linha de 86 (420 min). O liCalc `nr15` arredonda a média a 0,1 antes (85,0, 480 min). Os dois caminhos divergem na borda. Correção: aplicar `r1(L)` antes do Quadro.
- **F11.** `num("1,500.00")` devolve 1,5 (formato americano lido errado) e `num("Infinity")` devolve Infinity (`js/motor.js:9-13`).
- **F12.** `totais()` quebra com `TypeError` se `row.tempo` não for 15, 20 ou 25 (`js/motor.js:276`), por exemplo num backup editado. Além disso, `dias` soma tempo especial de 15, 20 e 25 anos sem a conversão entre tempos especiais do art. 66 do RPS (`porTempo` existe, mas não é preenchido). Verificar se é intencional.
- **F13.** `amd(364)` dá "0 a 12 m 4 d": na aproximação 365/30 o mês pode chegar a 12. É cosmético, mas aparece no total.
- Observações menores sem efeito no resultado: no Anexo 11 com jornada acima de 48 h (Brief & Scala), o FD sai do LT corrigido, e trocar a unidade ppm/mg mantém os valores já digitados. O Anexo 1 mostra "Lavg (420.2 min)" com ponto decimal.

### Pontos a verificar no texto oficial (não são erros certos)

- **V1. Média.** EPI auditivo no critério do perito (`motor.js:114-126`): com controles comprovados e NRRsf, o perito vira **N** (95 − 20 = 75 ≤ 90, "exposição neutralizada"). O STF (Tema 555, ARE 664.335) fixou que, para ruído, a declaração de eficácia do EPI não descaracteriza. É um critério técnico próprio e o INSS continua E, mas recomendo status "C" ou um aviso explícito de que o resultado contraria o Tema 555.
- **V2.** Calor em "ambiente fechado sem fonte artificial": o INSS dá N de 1997 a 2019 ("a IN exige fonte artificial", `motor.js:152`) e E a partir de 11/12/2019 (`motor.js:164`). Conferir o texto da IN 128 para o período posterior.
- **V3.** Ajuste de vestimenta entre 2004 e 2019, quando valia o Anexo 3 original: conferir se a edição da NHO-06 vigente na época (2002) já trazia a tabela de ajuste. A edição de 2017 traz.
- **V4.** `NHT06_TAB` (`app.js:240`): vários valores não batem com 480/2^((L−85)/5) arredondado (86: 415 contra 417,9; 93: 155 contra 158,3; 107: 22 contra 22,7; 113: 9 contra 9,8). Pode ser a tabela da NHT-06 de fato. Conferir com o texto da NHT-06.
- **V5.** `Q1_2019`: as 91 linhas (100 a 606 W, 33,7 a 24,7 °C) são monotônicas e todos os LT batem com 56,7 − 11,5·log10(M) arredondado a 0,1. Os valores de M da coluna ainda precisam ser conferidos com o Quadro 1 oficial (Portaria SEPRT 1.359/2019).
- **V6.** M não tabelado no Anexo 3 de 2019 (linha imediatamente superior): o app diz que o anexo não fixa regra. Conferir na NHO-06 (2017). É a opção conservadora.
- **V7.** NR-16, Anexo 1: Quadros 2 e 3 e o início e o fim do Quadro 4 batem com o que conheço (23 kg = 45 m … 113.300 kg = 1.350 m). As 32 linhas do Quadro 4 e a redução à metade para depósito barricado, aplicada só ao Quadro 4, precisam ser conferidas.
- **V8.** Anexo 11: o Freon 12 (diclorodifluormetano) está marcado como valor teto. Conferir. As outras 25 entradas da amostra batem (abaixo).
- **V9.** Vibração de 1997 a 2014: a referência padrão é 0,9 m/s² e VDV 17 (ISO 2631-1:1997, Anexo B, limite superior da zona de cautela pela eq. B.2). Pela eq. B.1 seria 0,86. ISO 2631:1985: 0,63 m/s². É escolha de referência, a confirmar no Manual do INSS.
- **V10.** Anexo 3 original, Quadro 2: M abaixo de 175 kcal/h usa a linha de 175 (30,5 °C). O quadro não cobre esses valores. É conservador.
- **V11.** Transporte de exatamente 200 L ou 135 kg: o app considera perigoso (Anexo 2, alíneas j e l: "igual ou superior") e avisa que o item 16.6 ("até") contradiz. Está bem sinalizado.

---

## Verificações que passaram (casos e fonte)

### Ruído
| Caso | Esperado (fonte) | Obtido |
|---|---|---|
| `A1_QUADRO` completo | 85 = 480 … 115 = 7 min (NR-15, Anexo 1, Quadro) | idêntico ✔ |
| tmaxQuadro 85; 85,4; 97; 99; 84,9; 115; 116 | 480; 420; 75; 60; ∞; 7; 7 (item 4: nível imediatamente mais elevado) | idem ✔ |
| Dose Σ C/T: NPS 85×480 | 100,0%, não caracteriza (item 6: acima da unidade) | ✔ |
| NPS 85,1×480 | linha 86, 114,3%, insalubre | ✔ |
| NPS 86×421 / 86×420,2 | 100,2%, insalubre / 100,0%, não caracteriza (dose a 0,1%) | ✔ |
| NPS 90×240 + 84×240 | 100%, abaixo de 85 não soma | ✔ |
| Fórmula 90×480 | D = 2, NEN 90,0 | ✔ |
| Dose 150% em Tm 240, Te 480 | Lavg = 85 + 16,61·log(1,5·2) = 92,9; D jornada 300%; NEN 92,9 | ✔ |
| Lavg 88, Te 528 | D = 1,1·2^0,6 = 166,7%; NEN = 88 + 16,61·log 1,1 = 88,7 | ✔ |
| > 115 dB(A) (116×1 min) | caracteriza, risco grave e iminente (itens 5 e 7) | ✔ |
| NHT-06: média 88,4 → 88 → 5 h; > 115 dB(A), "dose não calculada" | NHT-06, VI.4.f e VI.6.e | ✔ |
| liCalc: NEN = 85 + 16,61·log D; NE sobre max(T, Te) | 92×240/480 → 87,1 | ✔ |
| Motor: 80,04 N; 80,05 E (1990); 90,04 N (2000) | arredonda a 0,1 e compara "acima de" | ✔ |
| Cortes 06/03/1997, 19/11/2003, 01/01/2004 | Dec. 2.172/97; Dec. 4.882/03; IN (NHO-01 a partir de 2004) | ✔ |
| 19/11 a 31/12/2003 sem NE | INSS pelo valor medido (art. 292, III) | ✔ |
| 2004 em diante sem NE | INSS "I" | ✔ |
| Te 600, Lavg 84, NE 84 | NEN q5 85,6 (E) × NEN q3 84,97 → 85,0 (N) | E/N ✔ |
| Te 360, Lavg 87, NE 87 | NEN q5 84,9 (N) × q3 85,75 → 85,8 (E) | N/E ✔ |
| Dose: 100%/480 → 85,0; 50%/240 → 85,0; NE q = 3 = 85 + 10·log(D·480/Tm) | NHO-01 | ✔ |
| Te ≤ 0 → I | — | ✔ |
| NRRsf: nível protegido = L − NRRsf (dB(A)) | método NRRsf (ANSI S12.6-B) | ✔ (ver V1) |
| Impacto: 130 N; 130,1 E; 141, risco grave; 121 dB(C) E; 131 dB(C), risco grave | Anexo 2: 130 dB linear / 120 dB(C) FAST; risco grave acima de 140 / 130 | ✔ |

### Calor
| Caso | Esperado | Obtido |
|---|---|---|
| Até 05/03/1997: 28,0 N; 28,1 E; céu aberto N | Dec. 53.831/64, 1.1.1 (TE acima de 28 °C, fonte artificial) | ✔ |
| Q1 original, 12 células (LT N; LT + 0,1 E) | Anexo 3 original, Quadro 1: contínuo 30,0/26,7/25,0; 45/15 30,6/28,0/25,9; 30/30 31,4/29,4/27,9; 15/45 32,2/31,1/30,0 | 24/24 ✔ |
| Quadro 2: M 260 → linha 300 (27,5); 27,5 N, 27,6 E; 500 → 25,0; 501 → I | Quadro 2 (175 a 500 kcal/h) | ✔ |
| Anexo 3 (2019): M 300 → 28,2; 28,24 N; 28,26 E; M 301 → 306 (28,1); M 99 e 607 → I; céu aberto N | Quadro 1 e item 1.1.1 | ✔ |
| calcIns A3: 29,5/300 E; 28,25 → 28,3 E; 27,9 + 0,5 vestimenta, M 301 → 28,4 > 28,1 | arredondamento a 0,1 | ✔ |
| Cortes 06/03/1997 e 11/12/2019 | Portaria SEPRT 1.359/2019 (DOU de 11/12/2019) | ✔ |
| EPI no calor só a partir de 03/12/1998 | Lei 9.732/98 | ✔ |
| Q1_2019 contra a fórmula | 91/91 linhas | ✔ (ver V5) |

### Vibração
VCI 1,1 N / 1,11 E; VDVR 21 N / 21,1 E; VMB 5 N / 5,01 E (Anexo 8, itens 2.1 e 2.2); corte em 13/08/2014; 2000 com ISO 97: 0,9 N / 0,91 E; martelete até 1997; calculadora A8 com os mesmos limites. Todos ✔.

### Químicos
- FD por faixa de LT (Anexo 11, item 7): LT ≤ 1 → 3; ≤ 10 → 2; ≤ 100 → 1,5; ≤ 1000 → 1,25; > 1000 → 1,1. Testado na borda (3,0 sem alerta, 3,1 com alerta; 20,1; 150,1; 1250,1; 2201) ✔.
- Item 8, média > LT: tolueno 80 > 78 ✔. Item 9, teto: formol, amostra 1,7 > 1,6 ✔. Unidade mg: tolueno 300 > 290 ✔. CO 40 > 39, grau máximo ✔.
- Amostra do Quadro 1 (ppm/mg/grau/teto/pele), 25 entradas conferidas ✔: tolueno 78/290/médio/pele; xileno 78/340/médio/pele; formaldeído 1,6/2,3/máx/teto; CO 39/43/máx; H2S 8/12/máx; SO2 4/10/máx; NO2 4/7/máx/teto; cloro 0,8/2,3/máx; amônia 20/14/médio; acetona 780/1870/mín; etanol 780/1480/mín; metanol 156/200/máx/pele; HCl 4/5,5/máx/teto; HF 2,5/1,5/máx; HCN 8/9/máx/pele; cloreto de vinila 156/398/máx/teto; estireno 78/328/médio; fenol 4/15/máx/pele; MEK 155/460/médio; ozona 0,08/0,16/máx; CO2 3900/7020/mín; CCl4 8/50/máx/pele; CS2 16/47/máx/pele; Hg 0,04 mg/máx; benzeno sem LT (Anexo 13-A). A marca "pele" é só informativa e não altera o LT, como no Anexo 11.
- Anexo 12: sílica respirável 8/(%Q + 2), 10% → 0,667; total 24/(%Q + 3) → 1,846; mppdc 8,5/(%Q + 10); asbesto 2,0 f/cm³; manganês 5 mg/m³ (poeiras) e 1 mg/m³ (fumos); grau máximo ✔.
- Ao escolher uma substância, `un` é reiniciada (`app.js:992`) ✔.

### NR-16
Explosivos: 23 kg → 45 m; 24 kg → 75 m; 1.500 kg → 435 m; acima de 113.300 kg → 1.350 m com aviso; barricado, 100 kg → 160/2 = 80 m; Q2 5.000 kg → 90 m; Q3 20 kg → 75 m ✔ (ver V7). Transporte: 199 L N, 200 L E com aviso, 135 kg E, 134,9 kg N, tanque próprio excluído (16.6.1 e 16.6.1.1) ✔. Áreas de risco do Anexo 2, item 3 (a a t: 30 m, 30 m, 15 m, bacia, 3 m, 15 m, 15 m, 7,5 m, 15 m, 7,5 m, 7,5 m, 3 m…) conferem ✔.

### Datas, conversão e totais
- `daysIncl` em UTC: 2020 = 366; sem efeito de horário de verão ✔.
- Cortes de 26/08/1960 (antes disso "I") e 25/03/1964 (com nota sobre o Dec. 48.959-A/60) ✔. Categoria até 28/04/1995 ✔.
- EPI a partir de 03/12/1998; não se aplica a ruído (Tema 555), eletricidade, categoria e "até 97"; vibração só ganha texto ✔.
- LINACH: 17/10/2013 (Dec. 8.123), 08/10/2014 (Portaria Interministerial 9), 01/07/2020 (Dec. 10.410); segmentos C/N, E/N, E/E e N/N com EPI ✔. A posição a partir de 2020 depende da redação da IN 128; ver os textos citados.
- FATORES (art. 70 do RPS): 15 → 2,00/2,33; 20 → 1,50/1,75; 25 → 1,20/1,40 ✔.
- `diasConv`: 13/11/2019 incluído (1), 14/11 = 0, 01/01 a 30/11/2019 = 317 ✔.
- `totais`: sobreposição contada uma vez (547 dias, sobreposição de 184, acréscimo 218,8 → 219); M25: 365 × 0,2 = 73; 2019 a 2020: 731 dias e acréscimo 317 × 0,4 = 126,8 → 127; fator mais favorável na sobreposição ✔.
- `amd` 365/30: 365 → 1a; 395 → 1a 1m; 10304 → 28a 2m 24d ✔.
- `faixa()` e `regraNaData()`: "até", "a partir de" e "… a …" ✔.

### num()
Passam: "85,3", "85.3", "1.500" (milhar), "R$ 1.518,00", "12.345,6", "0,05", "", "-", "85,3,2" (null), " 92 ". Falham: ver F1 e F11. Não há uso de `+x` em campo numérico de cálculo: os `+v` restantes em `app.js` são índices e rotas.
