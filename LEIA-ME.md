# Caracterizador Pericial — estrutura do site

Site estático (HTML, CSS e JavaScript), sem servidor e sem banco de dados. Funciona no GitHub Pages, no Netlify ou aberto direto no navegador.

## Pastas e arquivos

| Arquivo | O que contém | Quando mexer |
|---|---|---|
| `index.html` | Estrutura da página (cabeçalho, rodapé) | Raramente |
| `css/estilo.css` | Cores, fontes e layout (temas claro e escuro) | Mudar visual |
| `img/` | Logo e papel timbrado (retrato e paisagem) | Trocar a marca: substitua mantendo os nomes |
| `dados/normas-base.js` | Marcos legais, agentes do previdenciário, teses, anexos da NR-15, fatores de conversão | Nova tese, novo marco, texto de critério |
| `dados/atualizacoes.js` | Vibração (ISO), cancerígenos (Dec. 10.410/20), palavras-chave da busca | Ajustes de critérios |
| `dados/nr15-anexo11.js` | Quadro 1 do Anexo 11 com sinônimos | Corrigir LT ou incluir outro nome |
| `dados/nr15-anexo13.js` | Anexo 13 completo e Quadro 2 do Anexo 3 | Atualização da NR-15 |
| `dados/nr16.js` | NR-16 completa, anexo por anexo | Atualização da NR-16 |
| `dados/in128-artigos.js` | Texto literal da IN 128/2022 (arts. 286–302) | Nova IN alterando esses artigos |
| `dados/biblioteca.js` | Quadros dos decretos, LINACH e textos das planilhas | Raramente |
| `dados/fontes.js` | Fontes oficiais: versão considerada no app, data da conferência e o que o robô vigia | Depois de revisar uma alteração |
| `dados/novidades.js` | Novidades na base (o que mudou, quando e onde consultar), exibidas no Início | A cada atualização da base |
| `dados/glossario.js` | Glossário técnico e jurídico (aparece na Biblioteca e na busca) | Incluir ou ajustar termo |
| `dados/alertas.js` | Alertas gravados pelo robô (aparecem como faixa no topo do site) | Marcar alerta como `revisado` |
| `scripts/monitor.mjs` | Robô que verifica as fontes oficiais todo dia | Incluir ou ajustar fonte vigiada (em `fontes.js`) |
| `js/motor.js` | Regras de enquadramento por período (cálculos) | Mudar critério de cálculo |
| `js/app.js` | Telas, busca, impressão, casos salvos, perfil do profissional | Mudar funcionamento das telas |
| `termos.html`, `privacidade.html` | Termos de uso e política de privacidade (minutas) | Após revisão jurídica |
| `tests/` | Testes automáticos da lógica de enquadramento | Ao mudar `js/motor.js` ou regras |

A ordem de carregamento dos scripts no `index.html` importa: dados primeiro, depois `motor.js`, por último `app.js`.

## Publicar no GitHub Pages

1. Crie um repositório público (ex.: `caracterizador-pericial`).
2. Envie todo o conteúdo desta pasta (Add file → Upload files), mantendo as subpastas.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Endereço: `https://SEU-USUARIO.github.io/caracterizador-pericial`.

Para atualizar, edite o arquivo no próprio GitHub (ícone de lápis) ou envie a nova versão por cima. O site atualiza em um ou dois minutos.

## Recursos de consulta

- **Regra na data** (Aposentadoria especial): escolha uma data e veja, agente por agente, a norma e o critério do período, com os marcos gerais (categoria profissional, EPI, formulário, conversão, cancerígenos).
- **Teses:** etiqueta de situação (firmada, embargos pendentes, em julgamento, em revisão), filtro por situação, "Copiar citação" e "Copiar link" (endereço `#teses/<código>`). A situação de cada tese fica em `SITUACAO_TESE`, em `dados/normas-base.js`.
- **Novidades na base** (Início) e **Glossário** (Biblioteca), ambos pesquisáveis na busca geral.
- **Busca geral:** prioriza palavras que começam pelo termo digitado; só procura no meio das palavras se não houver resultado.

## Casos, perfil e privacidade

- **Vários casos:** em Aposentadoria especial → Análise de caso, a barra "Meus casos" cria, duplica, exclui, exporta e importa casos (arquivos `.json`). O formato antigo (um caso só) é migrado automaticamente.
- **Perfil e dados:** nome, profissão, registro (CREA, CRM, OAB) e timbrado próprio (imagem A4) ou cabeçalho simples. Esses dados saem no cabeçalho e na assinatura dos relatórios. Ali também ficam o backup completo e o botão para apagar todos os dados.
- **Privacidade:** tudo fica no navegador do usuário (localStorage); nada é enviado a servidor. No primeiro acesso aparece o aviso de aceite dos Termos de uso.

## Testes

`node --test tests/motor.test.mjs` roda os testes da lógica (limites de ruído por período, regras da IN 170/2024, EPI, Tema 383 da TNU, conversão até 13/11/2019, totais do caso-exemplo e integridade da base). O GitHub roda os mesmos testes a cada pull request (`.github/workflows/testes.yml`). Se uma mudança alterar um resultado, o teste falha e mostra a diferença.

## Atualização automática da legislação

O robô `scripts/monitor.mjs` roda duas vezes por dia no GitHub Actions (`.github/workflows/monitor-legislacao.yml`, 07:17 e 18:43 de Brasília, ou pelo botão **Actions → Monitor da legislação → Run workflow**). Ele:

1. abre as páginas oficiais listadas em `dados/fontes.js` (NR-01, 09, 10, 15 e 16 no MTE; portarias SST do ano; INs do INSS; Lei 8.213, Decreto 3.048 e EC 103 no Planalto; NHO da Fundacentro; busca no Diário Oficial);
2. compara com a verificação anterior (`scripts/estado.json`);
3. se aparecer documento novo ou o texto mudar, grava um alerta em `dados/alertas.js` (o site mostra a faixa "aguardando revisão") e **abre uma Issue** no GitHub, que chega por e-mail.

Nada no conteúdo jurídico muda sozinho. Para concluir uma revisão: corrija os arquivos de `dados/` se for o caso, atualize `versao` e `conferido` da fonte em `dados/fontes.js`, troque o `status` do alerta para `revisado` em `dados/alertas.js` e feche a Issue.

**Análise pelo Claude (opcional):** cadastre o segredo `ANTHROPIC_API_KEY` em Settings → Secrets and variables → Actions. Com ele, cada documento novo é lido e a Issue traz um resumo do impacto ("Impacto: alto/médio/nenhum"). Sem o segredo o robô funciona igual, só sem o resumo.

**Permissões:** em Settings → Actions → General → Workflow permissions, marque *Read and write permissions* para o robô poder gravar os alertas.

**Limites:** sites do governo às vezes bloqueiam acessos de fora do Brasil (os servidores do GitHub ficam nos EUA). Se uma fonte ficar 7 verificações seguidas sem resposta, o robô abre um alerta avisando. A jurisprudência (STF, STJ, TNU, TST) não tem página fácil de comparar: fica a cargo da auditoria semanal.

Teste local: `node scripts/monitor.mjs --dry` (não grava nada).

## Observação

Ferramenta de apoio técnico. Não substitui a análise do caso concreto nem a redação oficial das normas.
