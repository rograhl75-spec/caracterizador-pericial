/* ===== NR-16 estruturada (texto da norma, atualizada até a Portaria MTE 2.021/2025) ===== */
const NR16_GERAL = [
 ['16.1','São consideradas atividades e operações perigosas as constantes dos Anexos desta NR.'],
 ['16.2','Adicional de 30% sobre o salário, sem os acréscimos de gratificações, prêmios ou participação nos lucros.'],
 ['16.2.1','O empregado poderá optar pelo adicional de insalubridade que porventura lhe seja devido.'],
 ['16.3','Caracterização ou descaracterização pelo empregador, mediante laudo de Médico do Trabalho ou Engenheiro de Segurança do Trabalho (art. 195 da CLT).'],
 ['16.3.1','O laudo deve estar disponível aos trabalhadores, sindicatos e à inspeção do trabalho (Portaria MTE 2.021/2025, vigente desde 03/04/2026).'],
 ['16.4','O disposto no item 16.3 não prejudica a ação fiscalizadora do Ministério do Trabalho nem a realização ex officio da perícia.'],
 ['16.5','Explosivos sujeitos a degradação química ou autocatalítica, ou à ação de agentes exteriores (calor, umidade, faíscas, fogo, fenômenos sísmicos, choque e atritos).'],
 ['16.6','Transporte de inflamáveis líquidos ou gasosos liquefeitos, em quaisquer vasilhames e a granel, é perigoso, exceto pequenas quantidades: até 200 L (líquidos) e 135 kg (gasosos liquefeitos).'],
 ['16.6.1','As quantidades de inflamáveis contidas nos tanques de consumo próprio dos veículos não serão consideradas para efeito desta Norma.'],
 ['16.6.1.1','Não se aplica o 16.6 aos tanques de combustível originais de fábrica e suplementares, de consumo próprio de veículos de carga e de transporte coletivo, de máquinas e equipamentos, certificados, e aos equipamentos de refrigeração de carga (Portaria MTE 1.418/2024).'],
 ['16.7','Líquido combustível: ponto de fulgor maior que 60 °C e até 93 °C.'],
 ['16.8','Todas as áreas de risco devem ser delimitadas, sob responsabilidade do empregador.']
];

const NR16 = [
{id:'a1', n:'Anexo I', t:'Explosivos', port:'Portaria SSMT 2/1979', j:['s364'],
 secoes:[
  {tit:'Item 1 — Quadro 1: atividades perigosas', sel:'atv', cols:['Atividade','Têm direito ao adicional'], itens:[
   ['a','No armazenamento de explosivos','Todos os trabalhadores nessa atividade ou que permaneçam na área de risco'],
   ['b','No transporte de explosivos','Todos os trabalhadores nessa atividade'],
   ['c','Na operação de escorva dos cartuchos de explosivos','Todos os trabalhadores nessa atividade'],
   ['d','Na operação de carregamento de explosivos','Todos os trabalhadores nessa atividade'],
   ['e','Na detonação','Todos os trabalhadores nessa atividade'],
   ['f','Na verificação de detonações falhadas','Todos os trabalhadores nessa atividade'],
   ['g','Na queima e destruição de explosivos deteriorados','Todos os trabalhadores nessa atividade'],
   ['h','Nas operações de manuseio de explosivos','Todos os trabalhadores nessa atividade']]},
  {tit:'Item 2', txt:'O trabalhador enquadrado faz jus a 30% sobre o salário, sem gratificações, prêmios ou participação nos lucros, ressalvada a opção pela insalubridade.'},
  {tit:'Item 3 — Áreas de risco (Quadros 2, 3 e 4)', calc:'explosivos', txt:'a) armazenagem de pólvoras químicas, artifícios pirotécnicos e produtos químicos para misturas explosivas ou fogos de artifício (Quadro 2); b) armazenagem de explosivos iniciadores (Quadro 3); c) armazenagem de explosivos de ruptura e pólvoras mecânicas — pólvora negra e chocolate ou parda (Quadro 4); d) depósitos barricados ou entrincheirados: distâncias do Quadro 4 reduzidas à metade; e) é obrigatória a delimitação física da área de risco.'}
 ]},
{id:'a2', n:'Anexo II', t:'Inflamáveis', port:'Portaria MTb 3.214/1978; Portaria MTE 545/2000', j:['s39','oj385','s364'],
 secoes:[
  {tit:'Item 1 — Atividades ou operações perigosas', sel:'atv', cols:['Atividade','Têm direito ao adicional (30%)'], itens:[
   ['a','Na produção, transporte, processamento e armazenamento de gás liquefeito','Na produção, transporte, processamento e armazenamento de gás liquefeito'],
   ['b','No transporte e armazenagem de inflamáveis líquidos e gasosos liquefeitos e de vasilhames vazios não desgaseificados ou decantados','Todos os trabalhadores da área de operação'],
   ['c','Nos postos de reabastecimento de aeronaves','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['d','Nos locais de carregamento de navios-tanques, vagões-tanques e caminhões-tanques e enchimento de vasilhames, com inflamáveis líquidos ou gasosos liquefeitos','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['e','Nos locais de descarga de navios-tanques, vagões-tanques e caminhões-tanques com inflamáveis líquidos ou gasosos liquefeitos ou de vasilhames vazios não desgaseificados ou decantados','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['f','Nos serviços de operações e manutenção de navios-tanque, vagões-tanques, caminhões-tanques, bombas e vasilhames, com inflamáveis líquidos ou gasosos liquefeitos, ou vazios não desgaseificados ou decantados','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['g','Nas operações de desgaseificação, decantação e reparos de vasilhames não desgaseificados ou decantados','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['h','Nas operações de testes de aparelhos de consumo do gás e seus equipamentos','Todos os trabalhadores nessas atividades ou que operam na área de risco'],
   ['i','No transporte de inflamáveis líquidos e gasosos liquefeitos em caminhão-tanque','Motorista e ajudantes'],
   ['j','No transporte de vasilhames (em caminhão de carga) contendo inflamável líquido, em quantidade total igual ou superior a 200 litros, quando não observados os subitens 4.1 e 4.2','Motorista e ajudantes'],
   ['l','No transporte de vasilhames (em carreta ou caminhão de carga) contendo inflamável gasoso e líquido, em quantidade total igual ou superior a 135 quilos','Motorista e ajudantes'],
   ['m','Nas operações em postos de serviço e bombas de abastecimento de inflamáveis líquidos','Operador de bomba e trabalhadores que operam na área de risco']]},
  {tit:'Item 2 — Definições (o que se entende por cada serviço)', lista:[
   ['I','Serviços de operação e manutenção de embarcações, vagões-tanques, caminhões-tanques, bombas e vasilhames de inflamáveis: a) inspeção, calibração, medição, contagem de estoque e colheita de amostra em tanques ou vasilhames cheios; b) vigilância, arrumação de vasilhames vazios não desgaseificados, bombas propulsoras em recinto fechado e superintendência; c) manutenção, reparos, lavagem e pintura de embarcações, tanques, viaturas de abastecimento e vasilhames cheios ou vazios não desgaseificados; d) desgaseificação e lavagem de embarcações, tanques, viaturas, bombas ou vasilhames que tenham contido inflamáveis líquidos; e) quaisquer outras atividades de manutenção ou operação (almoxarifado, escritório, laboratório, conferência de estoque, ambulatório, engenharia, oficinas, caldeiras, mecânica, eletricidade, soldagem, enchimento e arrumação de vasilhames), desde que executadas dentro de áreas perigosas.'],
   ['II','Serviços de operação e manutenção com inflamáveis gasosos liquefeitos: a) inspeção nos pontos de vazamento eventual e medição de tanques por escapamento direto; b) superintendência; c) manutenção das instalações da frota de caminhões-tanques dentro da área e em torno dos pontos de escapamento; d) decantação, desgaseificação, lavagem, reparos, pinturas e areação de tanques, cilindros e botijões cheios de GLP; e) outras atividades dentro das áreas perigosas.'],
   ['III','Armazenagem de inflamáveis líquidos em tanques ou vasilhames: a) quaisquer atividades dentro da bacia de segurança dos tanques; b) arrumação de tambores ou latas ou outras atividades dentro do prédio de armazenamento ou em recintos abertos com vasilhames cheios ou não desgaseificados.'],
   ['IV','Armazenagem de inflamáveis gasosos liquefeitos: a) arrumação de vasilhames ou outras atividades dentro do prédio de armazenamento ou em recintos abertos com vasilhames cheios ou vazios não desgaseificados.'],
   ['V','Operações em postos de serviço e bombas de abastecimento de inflamáveis líquidos: a) atividades ligadas diretamente ao abastecimento de viaturas com motor de explosão.'],
   ['VI','Outras atividades, tais como manutenção, lubrificação, lavagem de viaturas, mecânica, eletricidade, escritório de vendas e gerência, ad referendum do Ministério do Trabalho.'],
   ['VII','Enchimento de vasilhames (tambores, latas) com inflamáveis líquidos: a) enchimento, fechamento e arrumação de latas ou caixas com latas.'],
   ['VIII','Enchimento de vasilhames (cilindros, botijões) com inflamáveis gasosos liquefeitos: a) enchimento, pesagem, inspeção, estiva e arrumação de cilindros ou botijões cheios de GLP; b) outras atividades dentro da área perigosa.']]},
  {tit:'Item 3 — Áreas de risco', sel:'area', cols:['Atividade','Área de risco'], itens:[
   ['a','Poços de petróleo em produção de gás','Círculo com raio de 30 m, no mínimo, com centro na boca do poço'],
   ['b','Unidade de processamento das refinarias','Faixa de 30 m de largura, no mínimo, contornando a área de operação'],
   ['c','Outros locais de refinaria com inflamáveis em volatilização ou possibilidade de volatilização por falha dos sistemas de segurança e fechamento das válvulas','Faixa de 15 m de largura, no mínimo, contornando a área de operação'],
   ['d','Tanques de inflamáveis líquidos','Toda a bacia de segurança'],
   ['e','Tanques elevados de inflamáveis gasosos','Círculo com raio de 3 m com centro nos pontos de vazamento eventual (válvulas, registros, dispositivos de medição por escapamento, gaxetas)'],
   ['f','Carga e descarga de inflamáveis líquidos contidos em navios, chatas e batelões','Afastamento de 15 m da beira do cais, durante a operação, com extensão correspondente ao comprimento da embarcação'],
   ['g','Abastecimento de aeronaves','Toda a área de operação'],
   ['h','Enchimento de vagões-tanques e caminhões-tanques com inflamáveis líquidos','Círculo com raio de 15 m com centro nas bocas de enchimento dos tanques'],
   ['i','Enchimento de vagões-tanques e caminhões-tanques com inflamáveis gasosos liquefeitos','Círculo com raio de 7,5 m com centro nos pontos de vazamento eventual (válvulas e registros)'],
   ['j','Enchimento de vasilhames com inflamáveis gasosos liquefeitos','Círculos com raio de 15 m com centro nos bicos de enchimento'],
   ['l','Enchimento de vasilhames com inflamáveis líquidos, em locais abertos','Círculo com raio de 7,5 m com centro nos bicos de enchimento'],
   ['m','Enchimento de vasilhames com inflamáveis líquidos, em recinto fechado','Toda a área interna do recinto'],
   ['n','Manutenção de viaturas-tanques, bombas e vasilhames que continham inflamável líquido','Local de operação, acrescido de faixa de 7,5 m em torno dos seus pontos externos'],
   ['o','Desgaseificação, decantação e reparos de vasilhames não desgaseificados ou decantados, usados no transporte de inflamáveis','Local da operação, acrescido de faixa de 7,5 m em torno dos seus pontos externos'],
   ['p','Testes em aparelhos de consumo de gás e seus equipamentos','Local da operação, acrescido de faixa de 7,5 m em torno dos seus pontos extremos'],
   ['q','Abastecimento de inflamáveis','Toda a área de operação, abrangendo, no mínimo, círculo de 7,5 m com centro no ponto de abastecimento, círculo de 7,5 m com centro na bomba de abastecimento da viatura e faixa de 7,5 m para ambos os lados da máquina'],
   ['r','Armazenamento de vasilhames com inflamáveis líquidos ou vazios não desgaseificados, em locais abertos','Faixa de 3 m de largura em torno dos seus pontos externos'],
   ['s','Armazenamento de vasilhames com inflamáveis líquidos ou vazios não desgaseificados, em recinto fechado','Toda a área interna do recinto'],
   ['t','Carga e descarga de vasilhames com inflamáveis líquidos ou vazios não desgaseificados, transportados por navios, chatas ou batelões','Afastamento de 3 m da beira do cais, durante a operação, com extensão correspondente ao comprimento da embarcação']]},
  {tit:'Item 4 — Não caracterizam periculosidade', sel:'exc', cols:['Hipótese','Condição'], itens:[
   ['4.1','Manuseio, armazenagem e transporte de líquidos inflamáveis em embalagens certificadas (simples, compostas ou combinadas)','Dentro dos limites do Quadro I do anexo, independentemente do número de embalagens, obedecidas as NR, a NBR 11564/91 e a legislação de produtos perigosos'],
   ['4.2','Manuseio, armazenagem e transporte de recipientes de até 5 litros, lacrados na fabricação, com líquidos inflamáveis','Independentemente do número de recipientes, obedecidas as NR e a legislação de produtos perigosos']]},
  {tit:'Nota do perito — empilhadeira a GLP', txt:'A troca e o abastecimento de cilindro de GLP de empilhadeira não constam do Anexo II nem do Quadro do item 3. O enquadramento depende de enquadrar a situação em alguma alínea do item 1 (por exemplo, permanência em área de risco de armazenamento de vasilhames) e da frequência de exposição, nos termos da Súmula 364 do TST (exposição eventual ou por tempo extremamente reduzido não gera o adicional). O tanque de consumo próprio da máquina não conta para o item 16.6 (16.6.1 e 16.6.1.1).'},
  {tit:'Transporte (itens 16.6 e 16.6.1.1 da NR)', calc:'transporte'}
 ]},
{id:'a3', n:'Anexo III', t:'Segurança pessoal ou patrimonial', port:'Portaria MTE 1.885/2013', j:['s364'],
 secoes:[
  {tit:'Item 1', txt:'São perigosas as atividades ou operações que impliquem exposição dos profissionais de segurança pessoal ou patrimonial a roubos ou outras espécies de violência física.'},
  {tit:'Item 2 — Quem é profissional de segurança (atender a uma das condições)', sel:'cond', cols:['Condição','Descrição'], itens:[
   ['a','Empresa de segurança privada ou serviço orgânico','Empregados das empresas prestadoras de serviço de segurança privada ou que integrem serviço orgânico de segurança privada, registradas e autorizadas pelo Ministério da Justiça (Lei 7.102/1983)'],
   ['b','Contratado pela administração pública','Empregados que exercem segurança patrimonial ou pessoal em instalações metroviárias, ferroviárias, portuárias, rodoviárias, aeroportuárias e de bens públicos, contratados diretamente pela administração pública direta ou indireta']]},
  {tit:'Item 3 — Atividades ou operações', sel:'atv', cols:['Atividade','Descrição'], itens:[
   ['1','Vigilância patrimonial','Segurança patrimonial e/ou pessoal na preservação do patrimônio em estabelecimentos públicos ou privados e da incolumidade física de pessoas'],
   ['2','Segurança de eventos','Segurança patrimonial e/ou pessoal em espaços públicos ou privados, de uso comum do povo'],
   ['3','Segurança nos transportes coletivos','Segurança patrimonial e/ou pessoal nos transportes coletivos e em suas instalações'],
   ['4','Segurança ambiental e florestal','Segurança patrimonial e/ou pessoal em áreas de conservação de fauna, flora natural e de reflorestamento'],
   ['5','Transporte de valores','Segurança na execução do serviço de transporte de valores'],
   ['6','Escolta armada','Segurança no acompanhamento de qualquer tipo de carga ou de valores'],
   ['7','Segurança pessoal','Acompanhamento e proteção da integridade física de pessoa ou de grupos'],
   ['8','Supervisão/fiscalização operacional','Supervisão e/ou fiscalização direta dos locais de trabalho para acompanhamento e orientação dos vigilantes'],
   ['9','Telemonitoramento/telecontrole','Execução de controle e/ou monitoramento de locais, através de sistemas eletrônicos de segurança']]}
 ]},
{id:'a4', n:'Anexo IV', t:'Energia elétrica', port:'Portaria MTE 1.078/2014', j:['s364','s191'],
 secoes:[
  {tit:'Item 1 — Têm direito ao adicional', sel:'atv', cols:['Hipótese','Descrição'], itens:[
   ['a','Alta tensão','Atividades ou operações em instalações ou equipamentos elétricos energizados em alta tensão'],
   ['b','Proximidade','Atividades ou operações com trabalho em proximidade, conforme a NR-10'],
   ['c','Baixa tensão no SEC','Atividades em instalações ou equipamentos energizados em baixa tensão no sistema elétrico de consumo, quando descumprido o item 10.2.8 e subitens da NR-10'],
   ['d','Sistema elétrico de potência (SEP)','Empresas que operam instalações ou equipamentos do SEP e suas contratadas, nas atividades e áreas de risco do Quadro I']]},
  {tit:'Item 2 — Não é devido o adicional', sel:'exc', cols:['Hipótese','Descrição'], itens:[
   ['a','Desenergizado e liberado','Atividades no sistema elétrico de consumo em instalações desenergizadas e liberadas, sem possibilidade de energização acidental (NR-10)'],
   ['b','Extrabaixa tensão','Atividades em instalações ou equipamentos alimentados por extrabaixa tensão'],
   ['c','Operações elementares em baixa tensão','Uso de equipamentos energizados e ligar/desligar circuitos, com materiais e equipamentos conformes às normas técnicas oficiais']]},
  {tit:'Item 3', txt:'O trabalho intermitente é equiparado à exposição permanente para pagamento integral do adicional nos meses em que houver exposição, excluída a exposição eventual (caso fortuito ou fora da rotina).'},
  {tit:'Item 4.1 — Atividades em redes de linhas aéreas ou subterrâneas do SEP', lista:[['a','Montagem, instalação, substituição, conservação, reparos, ensaios e testes de: verificação, inspeção, levantamento, supervisão e fiscalização; fusíveis, condutores, para-raios, postes, torres, chaves, muflas, isoladores, transformadores, capacitores, medidores, reguladores de tensão, religadores, seccionalizadores, carrier (onda portadora via linhas de transmissão), cruzetas, relé e braço de iluminação pública, aparelho de medição gráfica, bases de concreto ou alvenaria de torres, postes e estrutura de sustentação de redes e linhas aéreas e demais componentes das redes aéreas'],['b','Corte e poda de árvores'],['c','Ligações e cortes de consumidores'],['d','Manobras aéreas e subterrâneas de redes e linhas'],['e','Manobras em subestação'],['f','Testes de curto em linhas de transmissão'],['g','Manutenção de fontes de alimentação de sistemas de comunicação'],['h','Leitura em consumidores de alta tensão'],['i','Aferição em equipamentos de medição'],['j','Medidas de resistências, lançamento e instalação de cabo contrapeso'],['k','Medidas de campo eletromagnético, rádio, interferência e correntes induzidas'],['l','Testes elétricos em instalações de terceiros em faixas de linhas de transmissão (oleodutos, gasodutos etc.)'],['m','Pintura de estruturas e equipamentos'],['n','Verificação, inspeção (inclusive aérea), fiscalização, levantamento de dados e supervisão de serviços técnicos'],['o','Montagem, instalação, substituição, manutenção e reparos de barramentos, transformadores, disjuntores, chaves e seccionadoras, condensadores, chaves a óleo, transformadores para instrumentos, cabos subterrâneos e subaquáticos, painéis, circuitos, contatos, muflas, isoladores e demais componentes de redes subterrâneas'],['p','Construção civil, instalação, substituição e limpeza de valas, bancos de dutos, dutos, condutos, canaletas, galerias, túneis, caixas ou poços de inspeção, câmaras'],['q','Medição, verificação, ensaios, testes, inspeção, fiscalização, levantamento de dados e supervisões de serviços técnicos']]},
  {tit:'Item 4.2 — Atividades em usinas, unidades geradoras, subestações e cabinas do SEP', lista:[['a','Montagem, desmontagem, operação e conservação de medidores, relés, chaves, disjuntores e religadoras, caixas de controle, cabos de força e de controle, barramentos, baterias e carregadores, transformadores, sistemas anti-incêndio e de resfriamento, bancos de capacitores, reatores, reguladores, equipamentos eletrônicos, eletromecânicos e eletroeletrônicos, painéis, para-raios, áreas de circulação, estruturas-suporte e demais instalações'],['b','Construção de valas de dutos, canaletas, bases de equipamentos, estruturas, condutos e demais instalações'],['c','Limpeza, pintura e sinalização de instalações e equipamentos elétricos'],['d','Ensaios, testes, medições, supervisão, fiscalizações e levantamentos de circuitos e equipamentos elétricos, eletrônicos, de telecomunicações e telecontrole']]},
  {tit:'Quadro I — Atividades e áreas de risco no SEP', sel:'sep', cols:['Atividade','Áreas de risco'], itens:[
   ['I','Atividades do item 4.1 em redes de linhas aéreas ou subterrâneas de alta e baixa tensão do SEP, energizadas ou desenergizadas mas com possibilidade de energização acidental ou por falha operacional','a) estruturas, condutores e equipamentos de linhas aéreas de transmissão, subtransmissão e distribuição, incluindo plataformas e cestos aéreos; b) pátio e salas de operação de subestações; c) cabines de distribuição; d) estruturas, condutores e equipamentos de redes de tração elétrica, incluindo escadas, plataformas e cestos aéreos; e) valas, bancos de dutos, canaletas, condutores, recintos internos de caixas, poços de inspeção, câmaras, galerias, túneis, estruturas terminais e aéreas de superfície; f) áreas submersas em rios, lagos e mares'],
   ['II','Atividades do item 4.2 em usinas, unidades geradoras, subestações e cabinas de distribuição do SEP, energizadas ou desenergizadas mas com possibilidade de energização acidental ou por falha operacional','a) pontos de medição e cabinas de distribuição, inclusive de consumidores; b) salas de controle, casa de máquinas, barragens de usinas e unidades geradoras; c) pátios e salas de operações de subestações, inclusive consumidoras'],
   ['III','Inspeção, testes, ensaios, calibração, medição e reparos em equipamentos e materiais elétricos, eletrônicos, eletromecânicos e de segurança individual e coletiva em sistemas elétricos de potência de alta e baixa tensão','a) oficinas e laboratórios de testes e manutenção elétrica, eletrônica e eletromecânica com equipamentos energizados ou passíveis de energização acidental; b) sala de controle e casas de máquinas de usinas e unidades geradoras; c) pátios e salas de operação de subestações, inclusive consumidoras; d) salas de ensaios elétricos de alta tensão; e) sala de controle dos centros de operações'],
   ['IV','Treinamento em equipamentos ou instalações do SEP, energizadas ou desenergizadas mas com possibilidade de energização acidental ou por falha operacional','a) todas as áreas descritas nos itens anteriores']]}
 ]},
{id:'a5', n:'Anexo V', t:'Motocicleta', port:'Portaria MTE 2.021/2025 (vigente desde 03/04/2026)', j:['s364'],
 secoes:[
  {tit:'Item 2 — Campo de aplicação', txt:'2.1 Atividades que envolvam deslocamento de trabalhadores em motocicletas nas vias terrestres do Código de Trânsito Brasileiro. 2.2 Motocicleta: veículo automotor de duas rodas, com ou sem side-car, conduzido em posição montada ou sentada (motonetas). 2.3 Não se aplica a veículos que não necessitem de emplacamento ou que não exijam CNH.'},
  {tit:'Item 3.1 — Atividade perigosa', sel:'atv', cols:['Item','Descrição'], itens:[
   ['3.1','Uso de motocicleta no deslocamento a trabalho','Atividades laborais com utilização de motocicleta no deslocamento do trabalhador em vias abertas à circulação pública']]},
  {tit:'Item 3.2 e 2.3 — Não são perigosas', sel:'exc', cols:['Item','Hipótese'], itens:[
   ['a','Percurso casa–trabalho','Deslocamento exclusivamente entre a residência e o posto de trabalho, e o retorno após a jornada'],
   ['b','Vias privadas ou internas','Condução exclusivamente em locais privados, vias internas ou vias não abertas à circulação pública, mesmo com trânsito eventual por vias públicas'],
   ['c','Estradas locais','Uso exclusivamente em estradas locais de acesso a propriedades lindeiras ou em caminhos que ligam povoações contíguas'],
   ['d','Uso eventual','Uso eventual (fortuito) ou que, sendo habitual, se dá por tempo extremamente reduzido'],
   ['2.3','Veículo sem emplacamento ou sem CNH','Veículos que não necessitam de emplacamento ou que não exigem carteira nacional de habilitação']]},
  {tit:'Item 4 e histórico', txt:'4.1 A caracterização ou descaracterização é responsabilidade da organização, por laudo de Médico do Trabalho ou Engenheiro de Segurança do Trabalho (art. 195 da CLT e item 16.3). O Anexo 5 anterior (Portaria MTE 1.565/2014) foi anulado por decisão judicial. A Lei 12.997/2014 incluiu o §4º no art. 193 da CLT.'}
 ]},
{id:'a6', n:'Anexo VI', t:'Agentes das autoridades de trânsito', port:'Portaria MTE 1.411/2025', j:[],
 secoes:[
  {tit:'Item 2 — Campo de aplicação', txt:'2.1 Atividades dos Agentes das Autoridades de Trânsito com exposição a colisões, atropelamentos ou outras espécies de acidentes ou violências. 2.1.1 São agentes os previstos no Anexo I do Código de Trânsito Brasileiro (Lei 9.503/1997). 2.2 Nos termos previstos em lei, aplica-se a outras relações jurídicas.'},
  {tit:'Item 3 — Caracterização', sel:'atv', cols:['Item','Descrição'], itens:[
   ['3.1','Agente da autoridade de trânsito exposto a colisões, atropelamentos ou violências','Atividades ou operações dos Agentes das Autoridades de Trânsito com exposição ao risco de colisões, atropelamentos ou outras espécies de acidentes ou violências']]},
  {tit:'Itens 3.2 e 3.2.1', txt:'A caracterização ou descaracterização cabe à organização (item 16.3), assegurada a perícia de ofício (16.4). O laudo deve analisar a exposição ao risco independentemente do local de realização da atividade.'}
 ]},
{id:'ar', n:'Anexo (*)', t:'Radiações ionizantes ou substâncias radioativas', port:'(*) Anexo acrescentado pela Portaria nº 3.393, de 17-12-1987; Portaria MTE 518/2003; nota explicativa da Portaria MTE 595/2015', j:['oj345'],
 secoes:[
  {tit:'Quadro — Atividades e áreas de risco', sel:'atv', cols:['Atividade','Áreas de risco'], itens:[
   ['1','Produção, utilização, processamento, transporte, guarda, estocagem e manuseio de materiais radioativos, selados e não selados, naturais ou artificiais, incluindo: 1.1 prospecção, mineração, operação, beneficiamento e processamento de minerais radioativos; 1.2 produção, transformação e tratamento de materiais nucleares para o ciclo do combustível; 1.3 produção de radioisótopos para medicina, agricultura, agropecuária, pesquisa; 1.4 produção de fontes radioativas; 1.5 testes, ensaios e calibração de detectores e monitores com fontes; 1.6 descontaminação de superfícies, instrumentos, vestimentas e outros bens contaminados; 1.7 separação isotópica e processamento radioquímico; 1.8 manuseio, condicionamento, liberação, monitoração, estabilização, inspeção, retenção e deposição de rejeitos radioativos','Minas e depósitos de materiais radioativos; plantas-piloto e usinas de beneficiamento; lixiviação para concentrados de urânio e tório; purificação e conversão; produção de fluoretos de urânio; enriquecimento isotópico e reconversão; fabricação e armazenamento de elementos combustíveis; retratamento; tratamento e deposição de rejeitos; laboratórios de radioisótopos, fontes, ensaios, radioquímica e descontaminação; coleta de rejeitos; lavanderia de roupas contaminadas; transporte de materiais e rejeitos; sítios de rejeitos'],
   ['2','Operação e manutenção de reatores nucleares: montagem, instalação, substituição e inspeção de elementos combustíveis; manutenção de componentes irradiados ou contaminados; manuseio de amostras irradiadas; experimentos com canais de irradiação; medição de radiação, ensaios, inspeções; segregação e armazenamento de rejeitos','Edifícios de reatores e de estocagem de combustível; tratamento e estocagem de rejeitos; tratamento de água de reatores; salas de operação de reatores; salas de amostragem de efluentes; laboratórios de medidas, semiquentes e quentes; minas de urânio e tório; depósitos de minerais radioativos; coleta de materiais radioativos'],
   ['3','Operação e manutenção de aceleradores de partículas: componentes irradiados ou contaminados; processamento de alvos irradiados; experimentos com feixes; medição de radiação; rejeitos','Áreas de irradiação de alvos; oficinas de componentes irradiados; salas de operação de aceleradores; laboratórios de alvos, testes com radiação e medidas nucleares; tratamento e estocagem de rejeitos'],
   ['4','Operação com aparelhos de raios X e irradiadores gama, beta ou de nêutrons: 4.1 diagnóstico médico e odontológico; 4.2 radioterapia; 4.3 radiografia industrial, gamagrafia e neutronradiografia; 4.4 difratometria; 4.5 calibração de detectores; 4.6 irradiação de alimentos; 4.7 esterilização de instrumentos médico-hospitalares; 4.8 irradiação de espécimes; 4.9 medição de radiação e inspeções','Salas de irradiação e de operação de aparelhos de raios X e de irradiadores gama, beta ou nêutrons; laboratórios de testes e calibração; manuseio de fontes, equipamentos e amostras irradiadas'],
   ['5','Medicina nuclear: manuseio e aplicação de radioisótopos para diagnóstico e terapia; fontes seladas em braquiterapia; dados biológicos de pacientes com radioisótopos; rejeitos','Salas de diagnóstico e terapia; enfermarias de pacientes sob tratamento com radioisótopos ou contaminados; tratamento e estocagem de rejeitos; manuseio de materiais biológicos com radioisótopos; laboratórios de descontaminação'],
   ['6','Descomissionamento de instalações nucleares e radioativas: descontaminações e gerenciamento dos rejeitos (tratamento, acondicionamento, transporte e deposição)','Áreas de instalações contaminadas e com rejeitos; depósitos provisórios e definitivos; instalações de contenção, asfaltamento e cimentação de rejeitos'],
   ['7','Descomissionamento de minas, moinhos e usinas de tratamento de minerais radioativos','Tratamento de rejeitos minerais; repositório de rejeitos naturais; deposição de gangas e rejeitos de mineração']]},
  {tit:'Nota explicativa (Portaria MTE 595/2015) — não são perigosas', sel:'exc', cols:['Item','Hipótese'], itens:[
   ['1','Raios X móvel','Atividades em áreas que utilizam equipamentos móveis de raios X para diagnóstico médico'],
   ['2','Emergência, UTI, recuperação e leitos','Essas áreas não são salas de irradiação em razão do uso do equipamento móvel de raios X']]}
 ]}
];
