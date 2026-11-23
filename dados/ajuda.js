/* ===== Ajuda: tutorial de primeiro acesso e "Como usar esta tela" =====
   AJUDA_TELA: chave = aba ou aba/sub-aba; cada item é uma dica curta. */
const TUTORIAL = [
 {t:'Pesquise em tudo', d:'O campo no topo procura em agentes, substâncias da NR-15, atividades, anexos da NR-16, teses, glossário e biblioteca. Aceita sinônimos, como "toluol" ou "amianto". Atalho: tecla /.'},
 {t:'Escolha a área ou a função', d:'Em "Por função", veja o que investigar numa atividade (soldador, frentista, enfermagem…). Aposentadoria especial, Insalubridade e Periculosidade têm legislação própria. Em cada ficha você vê a regra de cada período, a nota do especialista e o critério oficial lado a lado.'},
 {t:'Consulte por data e por tese', d:'Em Aposentadoria especial → Regra na data, veja o que valia num dia específico. Em Teses, filtre pela situação (firmada, embargos, em julgamento) e copie a citação ou o link.'},
 {t:'Guarde e leve com você', d:'Favorite fichas, teses e anexos, com anotações. Instale o app no celular para consultar sem internet. Tudo fica salvo só no seu navegador.'}
];
const AJUDA_TELA = {
 'inicio':[
  'Use a pesquisa do topo ou escolha uma das três áreas.',
  'Siglas sublinhadas com pontilhado (PPP, LTCAT, NEN, IBUTG, LINACH…) mostram a definição ao clicar ou tocar.',
  '"Novidades na base" mostra o que mudou na legislação e na jurisprudência, com atalho para consultar.',
  '"Meus favoritos" aparece aqui quando você favorita algum conteúdo; "Consultados recentemente" guarda as últimas fichas, anexos, teses e textos abertos.'],
 'funcao':[
  'Pesquise a função pelo nome ou por sinônimo e escolha na lista.',
  'A ficha mostra agentes, anexos da NR-15 e da NR-16 e teses que costumam ser investigados: são pontos de partida, não conclusão.',
  'Com dois ou mais agentes, use "Comparar estes agentes lado a lado".'],
 'aposentadoria/agentes':[
  'Escolha o agente na lista ou pela pesquisa. A ficha mostra os códigos dos decretos, a regra de cada período e as teses aplicáveis.',
  'Nota do especialista e critério do INSS aparecem lado a lado: quando divergem, a ficha explica o porquê.',
  'O simulador da ficha aplica a regra a valores que você informa, para entender o critério; não substitui a avaliação do caso.',
  'No fim da ficha, "Ver também" leva aos anexos da NR-15 e da NR-16 e às funções ligadas ao agente.',
  'Use "Imprimir ficha" para guardar a consulta em PDF e "Copiar link" para enviar a ficha a um colega ou cliente.'],
 'aposentadoria/data':[
  'Informe uma data ou clique num marco da linha do tempo para ver, agente por agente, a norma e o critério daquele dia.',
  'Escolha um agente para ver a linha do tempo das regras dele; o trecho destacado é o que vale na data escolhida.',
  'Os "Marcos gerais" resumem regras que valem para todos os agentes: categoria profissional, EPI, formulário, conversão e cancerígenos.',
  'Clique no nome do agente para abrir a ficha completa.'],
 'aposentadoria/comparar':[
  'Escolha dois ou três agentes nos seletores; a tabela mostra cada aspecto lado a lado.',
  'Útil para funções com mais de um agente (ex.: forneiro com ruído e calor; soldador com fumos e radiação não ionizante).',
  'Cada agente segue sua própria regra: a comparação não soma tempos nem combina critérios.'],
 'aposentadoria/caso':[
  'A simulação aplica as regras aos períodos e dados que você digita. É uma ferramenta de consulta: não examina documentos nem a prova.',
  'Crie vários casos em "Meus casos"; exporte para guardar ou abrir em outro computador.',
  'Cada período é dividido nos marcos legais do agente; veja o resultado em "Resultado da simulação".'],
 'aposentadoria/resultado':[
  'Mostra o tempo especial simulado pelo critério do especialista e pelo do INSS, e os trechos em que divergem.',
  'A linha do tempo ajuda a localizar os períodos e os marcos legais.'],
 'insalubridade':[
  'Escolha o anexo da NR-15. Os anexos quantitativos têm calculadora; os qualitativos, a lista de atividades.',
  'No Anexo 11, pesquise a substância por nome, sinônimo ou fórmula; no Anexo 13, pela atividade.',
  'O grau (mínimo, médio ou máximo) define o percentual do adicional: 10%, 20% ou 40%.'],
 'periculosidade':[
  'Escolha o anexo da NR-16 e marque os itens constatados para ver se a atividade se enquadra.',
  'Confira as hipóteses de exclusão e a frequência da exposição (Súmula 364 do TST).',
  'As áreas de risco têm calculadora quando o anexo define distâncias (explosivos, inflamáveis).'],
 'teses':[
  'Filtre por área, tribunal e situação. "Em aberto" reúne temas ainda em julgamento ou com embargos pendentes.',
  '"Copiar citação" leva tribunal, número, processo, ano e resumo; confira a íntegra antes de citar.',
  '"Copiar link" abre direto a tese; "Favoritar" guarda nos seus favoritos.',
  '"Imprimir" gera a folha de uma tese; o botão acima da lista imprime todas as teses do filtro atual.'],
 'biblioteca':[
  'Quadros dos decretos, Anexo IV, LINACH, glossário e textos de apoio, todos pesquisáveis.',
  'Escolha um quadro no seletor ou pesquise em todos de uma vez.',
  'Em "Textos legais navegáveis", leia a Lei 8.213 (arts. 57 e 58), a IN 128, a NR-01 (GRO/PGR e definições) e os itens gerais das NR-15 e NR-16; cada artigo tem link e citação para copiar.'],
 'perfil':[
  'Seus dados profissionais aparecem no cabeçalho e na assinatura das impressões.',
  'Faça backup de vez em quando: os dados ficam só neste navegador.',
  'Instale o app para usar sem internet.']
};
if (typeof module !== 'undefined') module.exports = {TUTORIAL, AJUDA_TELA};
