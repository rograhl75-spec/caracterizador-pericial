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
| `js/motor.js` | Regras de enquadramento por período (cálculos) | Mudar critério de cálculo |
| `js/app.js` | Telas, busca, impressão | Mudar funcionamento das telas |

A ordem de carregamento dos scripts no `index.html` importa: dados primeiro, depois `motor.js`, por último `app.js`.

## Publicar no GitHub Pages

1. Crie um repositório público (ex.: `caracterizador-pericial`).
2. Envie todo o conteúdo desta pasta (Add file → Upload files), mantendo as subpastas.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Endereço: `https://SEU-USUARIO.github.io/caracterizador-pericial`.

Para atualizar, edite o arquivo no próprio GitHub (ícone de lápis) ou envie a nova versão por cima. O site atualiza em um ou dois minutos.

## Observação

Ferramenta didática. Não substitui a análise do caso concreto nem a redação oficial das normas.
