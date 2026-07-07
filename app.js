var DB = {
  users: [
    { id: 1, username: 'Admin', email: 'admin@forum.com', avatar: '', title: 'Administrador', posts: 0, role: 'admin', bio: '', joinDate: '01/01/2026', admTentativaUsada: false },
    { id: 2, username: 'MandRaiden', email: 'mandraiden@forum.com', avatar: '', title: 'Dono do Éterverso', posts: 0, role: 'admin', bio: 'Criador e dono do Éterverso.', joinDate: '01/01/2026', admTentativaUsada: true },
    { id: 3, username: 'Rick', email: 'rick@forum.com', avatar: 'https://i.pinimg.com/736x/02/bc/1d/02bc1ddfb478c7069ac1db5017955648.jpg', title: 'Moderador — Dono da Wikia', posts: 0, role: 'moderador', bio: 'Responsável pela wikia de personagens.', joinDate: '01/01/2026', admTentativaUsada: true }
  ],
  nextUserId: 4,

  categories: [
    { id: 1, name: 'Geral & Anúncios', desc: 'Notícias e avisos importantes do fórum.' },
    { id: 2, name: 'Roleplay — Cenas', desc: 'Poste e continue cenas de RPG aqui.' },
    { id: 4, name: 'Power Scaling', desc: 'O sistema oficial de avaliação de poder dos personagens do fórum.' }
  ],

  threads: [
    { id: 1, catId: 4, title: 'Como funciona o Power Scaling neste fórum', authorId: 2, date: '30/06/2026 12:00', views: 0, pinned: true, tag: 'wiki' },
    { id: 3, catId: 1, title: 'Alpha da Wikia está oficialmente aberta', authorId: 3, date: '30/06/2026 13:00', views: 0, pinned: true, tag: 'ooc' }
  ],
  nextThreadId: 4,

  posts: [
    {
      id: 1, threadId: 1, authorId: 2, date: '30/06/2026 12:00',
      content: '<p>O scaling dos personagens deste fórum é feito pela <b>moderação</b> — um cálculo conduzido sob o critério e a leitura própria dos administradores sobre os feitos e o contexto da história do personagem.</p>' +
        '<p>Além disso, cada ficha pode ter seus <b>atributos</b> preenchidos pelo próprio autor, gerando um gráfico de teia na página do personagem.</p>',
      edited: false
    },
    {
      id: 3, threadId: 3, authorId: 3, date: '30/06/2026 13:00',
      content: '<p>A alpha da Wikia do Éterverso foi oficialmente disponibilizada para uso público. O módulo de cadastro de fichas já está habilitado, contudo trata-se de uma build inicial, ainda em estágio preliminar de maturação técnica. Segue o levantamento das pendências estruturais do sistema:</p>' +
        '<ul>' +
        '<li><b>Camada de persistência</b>: o estado da aplicação é mantido inteiramente no localStorage do navegador cliente, sem um sistema de gerenciamento de banco de dados (SGBD) propriamente dito, sem replicação e sem rotina de backup.</li>' +
        '<li><b>Autenticação e gestão de credenciais</b>: usuário e senha ainda trafegam e são persistidos em texto plano, sem hashing criptográfico (bcrypt, argon2 ou equivalente) nem salting, o que expõe as contas a qualquer vazamento trivial de dados.</li>' +
        '<li><b>Armazenamento de mídia</b>: a inserção de imagens depende exclusivamente de URLs externas; não há pipeline de upload próprio, tampouco integração com CDN para servir os assets.</li>' +
        '<li><b>Controle de acesso</b>: falta granularidade fina entre os níveis de permissão (RBAC), mecanismos de rate limiting contra abuso e trilhas de auditoria para rastrear ações administrativas.</li>' +
        '<li><b>Indexação e busca</b>: inexiste qualquer motor de busca full-text ou indexação estruturada por personagem, tópico ou atributo.</li>' +
        '<li><b>Validação e sanitização</b>: diversos campos aceitam entrada arbitrária sem validação ou sanitização server-side, o que abre margem para vetores de injeção assim que houver, de fato, um back-end.</li>' +
        '</ul>' +
        '<p>Estou em busca de colaboradores para duas frentes técnicas específicas: desenvolvimento de <b>back-end</b> (arquitetura de API, modelagem e implementação de um banco de dados persistente) e <b>segurança da informação</b> (hashing e salting de credenciais, sanitização de entrada, gestão de sessão via tokens assinados). Quem tiver domínio técnico nessas áreas e interesse em contribuir, entre em contato.</p>',
      edited: false
    }
  ],
  nextPostId: 4,

  personagens: [
    {
      "id": 1,
      "nome": "Holden",
      "categoria": "Sub-Personagem",
      "titulo": "Cataclisma do Desconhecido",
      "raca": "Espectro",
      "faccao": "Biblioteca Akáshica — Arautos do Desconhecido",
      "status": "Vivo",
      "imagem": "https://i.pinimg.com/1200x/96/5c/b1/965cb107c70fa021f9ae78ac94b40498.jpg",
      "descricao": "<h3 style=\"text-align:center\"><hr /><table><tbody><tr><td><font face=\"Georgia\" size=\"5\">‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ </font><font size=\"5\" face=\"Times New Roman\">‎</font><font size=\"5\"><font face=\"Times New Roman\" color=\"#6644aa\">SEI DEO SEI DEIVAE SACRUM</font><br /></font></td></tr></tbody></table><hr /><p><br /></p><p>BIOGRAFIA</p></h3><div style=\"text-align:justify\">Uma entre quatro entidades que respondem apenas à própria <b>Gaia</b>. Assim como seu semelhantes, o <b>Cataclisma do Desconhecido</b> tem sua gênese num mecanismo evolucionário que acompanha a vida há centenas de milhões de anos: <i>a aversão ao que não é familiar</i>, ou <b>neofobia</b>. Embora deva sua existência à formas sencientes de vida, o verdadeiro domínio do <b>Desconhecido</b> se evidencia na relação que possui com a sapiência: a denominação dos limites do conhecimento — e a consequente atribuição de qualidades transcendentes a dados fenômenos ou entidades — contribuiu para fazer do <b>Desconhecido</b> um dos arquétipos mais expansivos, e de sua detentora o mais exaltado ente de conhecimento entre espectros nativos do planeta. </div><div style=\"text-align:justify\"><br /></div><div style=\"text-align:justify\">Atualmente, o <b>Cataclisma do Desconhecido</b> reside no mais inferior estrato da <b>Biblioteca Akáshica do Empíreo</b>— um território que tomou para si logo após o surgimento da estrutura-compêndio, datado no advento do registro escrito. Lá, <b>Holden</b> atua como diretora autoproclamada, mantendo inacessível a toda e qualquer entidade os mais esotéricos conteúdos do <b>Inconsciente Coletivo da Terra</b>. Aqueles que visitam a <b>Biblioteca</b> à procura de conhecimento podem deparar-se com uma jovem de aparência um tanto desleixada e presença banal, claramente mais preocupada com seu aprendizado do que seu figurino. Caso abordada, ela poderá inferir a localização de todo e qualquer livro almejado pelo indivíduo e orientá-lo em direção a tal, embora suas instruções sejam menos que ortodoxas para aqueles insuficientemente familiarizados com o ambiente, e também deixem de fora quaisquer perigos e desafios no caminho do que se procura. Ao que proveitoso, quaisquer recordações referentes ao encontro são esvaídas no momento em que se sai da <b>Biblioteca</b>, garantindo que a identidade, como também a comprovação da existência, do <b>Cataclisma do Desconhecido</b> permaneça em sigilo.</div><div style=\"text-align:justify\"><br /></div><div style=\"text-align:justify\">Embora acate os desejos que <b>Gaia</b> tem de minimizar a interferência com a vida na <b>Terra</b> por parte dos <b>Cataclismas</b>, <b>Holden</b> tem dado passos sutis para ampliar sua influência, coincidindo com a pretensão humana de desbravar as fronteiras do conhecimento numa velocidade cada vez maior. Assim, o <b>Cataclisma do Desconhecido</b> revelou-se na alvorada do <i>século XX</i> para indivíduos seletos e compatíveis com seus propósitos, conforme a humanidade adentrou o campo da radioatividade e fissão nuclear que culminariam no desenvolvimento da bomba atômica— um instrumento que não apenas reafirmaria o lugar dos seres humanos como a maior ameaça ao planeta, como também os permitiria alvejar aqueles outrora denominados inalcançáveis com uma facilidade sem precedente. Os que juntaram-se à sua causa compõem os <b>Arautos do Desconhecido</b>: um lugar para aqueles que, seja por motivos nobres ou vis, acreditam que a humanidade arrisca esquecer de que pertence mais ao presente do que ao futuro.</div><div style=\"text-align:justify\"><br /></div><div style=\"text-align:justify\">O nome <b>Holden</b> deriva do Inglês arcaico <i>holh</i> (profundo, vão, vazio) e <i>denu</i> (vale).</div>",
      "stats": {},
      "mascaraTier": "Não-Registrado"
    },
    {
      "id": 2,
      "nome": "Shin Hae",
      "categoria": "Personagem Principal",
      "titulo": "Demônio do Leste",
      "raca": "Néfilim",
      "faccao": "Clã Myung-Jin",
      "status": "Vivo",
      "imagem": "https://i.pinimg.com/736x/3e/5a/d6/3e5ad6b7478971a30264bab6d9ecd8b9.jpg",
      "descricao": "<p>Shin Hae é um jovem néfilim em busca de vingança. Ou, respostas. Suas Marcas despertaram verdadeiramente após a morte de sua amada. Antes, ele conseguia fazer fogo a bel prazer, hoje é um vulcão humano. Shin possui um transtorno de vazio identitário fundacional. Ele se baseia na personalidade de seus queridos companheiros, como Akane e a casca-vazia que se tornou Zeratsu.</p><p>Graças ao Rosey, Shin Hae possui um grande senso de depender de estrutura militar, e é por isso que se aproximou de Akane, que ao menos, tenta simular essa dinâmica. Ayumi Hajiwara o amou por quem ele era, e não pelo que ele produzia. Ela se tornou, para Shin, um símbolo de verdade de identidade. Depois de anos vivendo num ambiente hermético, hierárquico e vigiado, Shin teve seu primeiro contato com Yuna, através do Reddit. Uma jovem de vinte e poucos anos, com ligação aos povos indígenas. O povo de Yuna categorizava os portais e espectros de outra forma, até aprendendo a viver em comunhão com eles. Nessa viagem, ele conheceu Akane e se tornou pupilo dela. Meses depois, descobriu da conexão dela com Zeratsu. Meses depois, Shin voltou ao Brasil com Akane, em uma missão, rastrear uma rede de contrabando de artefatos paranormais que escoava pelo Atlântico Sul. A rota de ambos os levou aos cantos mais escuros de Manáus, depois afluentes do Rio Negro. Lá, conheceram o povo Tikuna, os Baniwa e os Yanomami. Ao retornar pro Japão, Shin se aliou a grupos revolucionários como os Orácion Seis, uma organização formada por seis mentalistas, mas que foram traídos por um que superou todos os outros; também andou com outra organização chamada Lâminas de Manticora. Atualmente, Shin está em busca da Demon Blade, artefato sagrado de seu clã que demonstra legitimidade, e a Armadura de Atikaya.</p><h3>Myung-Jin Clan</h3><p>The Myung-Jin Clan (明真, \"\"Illuminated Truth\"\") is a millennia-old shamanic-mediator lineage that has adopted the structure and vocabulary of modern corporate governance without abandoning its original internal organization, which remains divided into three institutional tiers. The <b>Bon-ga</b> (Root House), headquartered in Seoul, functions as the clan's central governing body, serving as custodian of the foundational artifacts and holding final arbitral authority over all subordinate divisions. The <b>Jong-ga</b> (Intermediate Chambers) oversee the clan's visible corporate sectors, operating as the administrative link between central leadership and regional units. The <b>Bun-ga</b> (Peripheral Cells), dispersed throughout Asia, are responsible for older and more localized practices such as exorcism and spiritual mediation — it is from this category that Shin's cell of origin descends.</p><p>The Bon-ga's governance is best understood as a hybrid of three historical models: Joseon Korea's Uijeongbu (State Council), Japan's Iemoto master-lineage system, and the Mitsui family's Omotokata mercantile oligarchy. As with the Uijeongbu — led by the Yeonguijeong, a figure comparable to a prime minister — the Bon-ga concentrates final authority in a single leader, who acts less like a corporate CEO and more like an absolute monarch presiding over the clan's political, financial, and spiritual doctrine. Every ruling issued by the Jong-ga must pass the Bon-ga's scrutiny before being enacted as corporate policy or mystical law.</p><p>The clan maintains an operational network of cells spanning Korea, Japan, China, Southeast Asia, and Central Asia. Unlike conventional corporate structures, cohesion among these units is not based on hierarchical subordination but on ritual and karmic bonds, which constitute the clan's true mechanism of institutional unity. Shin's cell of origin is characterized by its peripheral and traditionalist profile, a factor that directly accounts for her early exile: a child bearing an uncategorizable gift was regarded as an institutional liability by a cell that considers itself the guardian of doctrinal purity within the tradition.</p><p>Following the death of the Bon-ga's leader without a clearly designated successor, the Conclave of Proven-Merit Succession was formally activated, initiating a succession dispute between Shin Hae and Kael for leadership of the Root House.</p><h3>Habilidades — Marcas dos Pecados</h3><h4>Poison of Wrath</h4><p>From ignorance, the poison of aversion is born, whose most violent form is wrath. Those who die with lives marked by acts of deep aversion—cruelty, malice, paranoid wrath—tend toward Hell, where they suffer deep torments conditioned by their own acts and which, through trauma reflecting their own sins, purify such evil inclinations.</p><p>Upon awakening the Poison of Wrath, Shin gained the ability to manifest the flames of Hell: a crimson fire like the sunset, imbued with a single paradoxical effect of denying by consuming. Upon contact with something, these flames react with it by degrading the target, but in the process, just as fire consuming certain salts gains its own color, they evolve transversally to the target, becoming more capable of burning that exact fuel, while the target in question, by being degraded, becomes increasingly vulnerable. Thus, the infernal flames possess incredible and growing efficiency in aether with contact to the target, which is denatured and becomes ever more fragile and susceptible. The byproducts of the flames can also fuel Shin's Demon Cells, as the flames can enhance this process by absorbing antibodies generated by the DCs, in a reciprocal process.</p><blockquote><i>May the flames of Hell burn all the defilements of souls vile enough to there fall.</i></blockquote><h4>Poison of Attachment</h4><p>From ignorance, the poison of attachment is born, source of the sufferings of loss and abandonment. Those who die with souls laden with attachment tend to become ghosts that wander in an important place, around someone, or futilely seeking something they cannot let go of. They only transmigrate again when their chains weaken enough for them to move forward, or when the acts that placed them in this condition finish bearing fruit.</p><p>Upon awakening the Poison of Attachment, Shin obtained the ability to imprint in his aether a resistive aspect, of high viscosity: any object, being, or process in this field encounters increasing resistance to movement and to change in any physical-chemical process, whether energetic, kinetic, or otherwise. Thus, Shin can impose on his aether and the surrounding aether a state of forced quasi-rest. He can also nullify the passive dispersion of aether in his circuit and, with that, facilitate the storage or control of vast amounts of aether. The ability can also be imbued in Shin and act selectively, slowing not only enemy attacks but also their effects, thereby generating an extremely powerful defense.</p><blockquote><i>May the ghosts trapped in pain by their attachments be nourished with the wisdom to overcome their condition.</i></blockquote>",
      "stats": {},
      "mascaraTier": "Expert"
    },
    {
      "id": 3,
      "nome": "Shidō Akane",
      "categoria": "Personagem Principal",
      "titulo": "Filha da Tempestade",
      "raca": "Humana (Néfilim Gota-de-Sangue)",
      "faccao": "Clã Shidou — Casa Raiden (desertora)",
      "status": "Viva",
      "imagem": "https://i.postimg.cc/rsLzDBF6/akanefinalmanji.png",
      "descricao": "<h2>雷電家の死道茜</h2><p><em>Raiden-ka no Shidō Akane</em></p><blockquote><p>Frase de efeito foda.</p></blockquote><p>❚ Backstory</p><p>Akane nasceu no clã Shidou, um clã de assassinos paranormais, mas ela mesma era a <strong>ovelha negra</strong> da família: era horrível em furtividade. No entanto, quando primos dentro do clã tentaram intimidá-la, seu verdadeiro talento apareceu: ela era tão natural com a espada que se tornou autodidata para se defender dos ataques sorrateiros de seus parentes de idade semelhante. Isso culmina em um momento inicial em que Akane, quando criança ou pré-adolescente, é enviada para matar um animal de grande porte e, enquanto o ataca, percebe que não há significado algum em querer causar dano a uma besta que não tem culpa de nada e nem sequer entende o que está acontecendo com ela, e que ela estava sendo reflexivamente cruel e brutal com o animal devido à sua condição de ter que se defender dos familiares; então ela o mata rapidamente com uma facada no pescoço.</p><p>Eventualmente, ainda pré-adolescente, ela tentou fugir da família e conseguiu passar seis meses escondida em um templo Shingon, o que ajudou a desenvolver suas habilidades paranormais em uma direção mais adequada aos seus talentos, além de lhe dar uma perspectiva do mundo que não era tão limitada à bolha em que cresceu. Ainda assim, ela acabou sendo trazida de volta, mas depois fugiu da família novamente e se escondeu no Brasil, criando um sobrenome falso para si: <strong>Touwa</strong>. <em>Touwa Akane</em>.</p><p>Akane morou na casa de uma amiga e, para não se tornar um fardo muito grande, começou a lutar em um ringue subterrâneo de duelos e apostas (porque qualquer coisa que se assemelhe a exibição pública de habilidades paranormais ou exibição de habilidades paranormais para completos mundanos é muito ilegal), ganhando algum dinheiro como uma jovem espadachim paranormal surpreendentemente habilidosa, pagando algumas de suas próprias despesas com esse dinheiro. Ainda assim, quando completou dezesseis anos, decidiu se tornar exorcista, tanto para evitar desagradar ainda mais a família de sua amiga caso descobrissem, para ter um trabalho mais ético e para evitar ser pega eventualmente.</p><p>Como o combate contra outros humanos paranormais vivos e o combate contra espectros, demônios e fantasmas é bem diferente, ela começou como uma exorcista comum, apesar de sua força e habilidade. Akane então começou a trabalhar como exorcista comum no <strong>setor imobiliário,</strong> visitando casas com um ou mais membros de sua equipe sob o pretexto de verificar as condições do imóvel, fazendo trabalhos de limpeza e outras coisas similares quando, na realidade, eles exorcizavam casas assombradas para que pudessem ser compradas, vendidas ou alugadas sem causar danos a nenhum mundano, pois isso seria ruim para o negócio imobiliário.</p><p>Com o tempo, ela e sua equipe (que depois de um tempo inclui o protagonista, Leônidas Brasa, mas ele não é tão relevante para este resumo rápido do histórico e enredo de Akane), não sendo mais um escritório de exorcismo comum, separaram-se da imobiliária para se tornar um escritório sênior independente e, mais tarde, após serem forçados a enfrentar ameaças acima de seu nível mais de algumas vezes, um <strong>escritório especial</strong> — a classe mais alta de escritórios de exorcismo — especializado em Fendas do Inferno e outras ameaças graves que mesmo outros escritórios especiais não ousariam enfrentar sozinhos. Quando Akane ocasionalmente precisa matar um ser senciente, ela é sempre eficiente e até de certa forma bondosa: ela não se abstém completamente de matar, mas quando precisa fazer isso, mata tão rápida e indoloramente quanto possível, sendo ao mesmo tempo elegante, eficiente e gentil em seu estilo de luta.</p><p>Eventualmente, Akane reencontra seu primo Zeratsu depois de todos os anos separados e, após ajudar a restaurar sua alma danificada e memórias parcialmente perdidas (por abusar de habilidades arcanas que o inundaram com poder do Inconsciente Coletivo, danificando a individualidade, além de abusar da espada <strong>Arayashiki</strong> que tira algumas memórias do portador a cada golpe), ela volta com ele para o clã Shidou para enfrentar sua família abusiva.</p><p>Em meio a muitas intrigas políticas com o grande clã paranormal nobre que os Shidou são, ela acaba em combate com alguns e é levada aos seus limites físicos e mentais. Nesse ponto, Akane tem outra epifania, semelhante à que teve quando criança, mas muito mais profunda: enquanto sua mente está sobrecarregada e ela observa os pensamentos que a inundam, atacada mentalmente por uma habilidade ligada ao Inconsciente Coletivo que ameaça corroer sua individualidade com a torrente de pensamentos, sentimentos e experiências de inúmeras perspectivas, <em>Akane vislumbra... o vazio.</em></p><p>E de repente, o poder do Inconsciente Coletivo não pode mais prejudicá-la tanto quanto antes. De repente, o que era uma inundação dolorosa que dificultava saber onde ela estava parece fluir através dela sem atrapalhá-la, não como se ela tivesse deixado de lutar para encontrar \"seu centro\" ou \"manter o controle de quem ela é\", mas como se fazer isso fosse o caminho errado desde o início. Akane torna-se gradualmente mais impermeável a ataques psíquicos e, por fim, os repele com facilidade; então, enquanto luta em um estado profundamente tranquilo, percebe todos os pensamentos que costumava ter sobre si mesma: todas as coisas autodepreciativas e também autoelogiosas que pensava de si. <em>Todas as maneiras pelas quais pensava sobre si mesma.</em></p><p>E percebe que eram apenas... pensamentos. Então ela pode ignorá-los. Não perfeitamente: ela não está completamente livre de todas as amarras, mas esse processo de \"<strong>selfing</strong>\" da mente que geralmente é quase invisível agora é algo do qual ela está pelo menos parcialmente consciente, e que pode pelo menos parcialmente ignorar. Uma grande parte de seu sofrimento psicológico simplesmente... se rompe e derrete, como uma grande parte de um iceberg se partindo no oceano.</p><p>Nesse ponto, Akane ainda está lutando em uma batalha difícil, então é desarmada, mas há uma espada por perto. Uma espada curta dourada envolta em um dragão oriental como uma bainha. Uma espada que, dizem, ninguém pode empunhar, pois apenas um Bodhisattva poderia jamais empunhá-la, sob pena de a espada e seu dragão rejeitarem o portador. Mas quando ela ouve essas palavras, \"a menos que se seja um Bodhisattva\", algo nelas parece... meio engraçado. Como se essas palavras, \"se seja\" e \"um Bodhisattva\" soassem... como um blablablá sem sentido quando colocadas uma ao lado da outra. Ela não chega a rir, nem mesmo a sorrir, pois ela mesma não entende completamente sua intuição, mas algo naquela frase parece sem significado, então ela simplesmente pega a espada trivialmente e tem uma visão do dragão. Ele a saúda: Akane, <strong>Bodhisattva do primeiro bhumi</strong>. Ela está autorizada a empunhá-la.</p><p>E então Akane vence aquela luta, mais tarde também exorcizando uma ou duas divindades para trazer seus artefatos mitológicos para membros de sua equipe, ajudando-os a se equipar, tornando-se assim também uma caçadora de deuses. Ainda uma tomboy tranquila e divertida de se conviver, mas significativamente mais em paz consigo mesma.</p><h3>❚ Personalidade</h3><p>Com estranhos, Akane é <strong>introvertida e organizada</strong>, tendo o costume de não falar muito sobre si, e desde que possui o dinheiro para isso ela mora sozinha em uma casa a qual mantém limpa e organizada por conta própria, preferindo ser independente mesmo que isso lhe dê menos conforto material. Uma <em>nerd que não parece e finge não ser</em>, a asiática gosta de coisas ligadas à eletrônica e computadores, usando seus poderes elétricos para otimizar tais dispositivos e fazê-los funcionar melhor ou obter confortos que não seriam possíveis a um mundano. Dito isso, ela jamais é fria, se mostrando educada e gentil embora casual e sem qualquer apego à formalidade.</p><p>Entre amigos, a jovem mulher se solta consideravelmente mais, com uma persona <strong>assertiva, brincalhona e gentil</strong>. Ela possui um humor meio mórbido, às vezes fazendo piadas meio pesadas, por mais que tente respeitar os limites de outrem para não se tornar uma pessoa ruim. Akane também possui uma mania esquisita de fazer gesto de arminha com a mão. Ela também <strong>ama animais</strong>, às vezes parecendo gostar mais deles do que de pessoas, pois enxerga em animais uma certa inocência ou incapacidade para a malícia verdadeira que humanos podem ter, sendo protetiva quanto a eles: qualquer tipo de maus-tratos a animais são um gatilho instantâneo à sua fúria.</p><p>É <strong>corajosa, porém não destemida</strong>. Sofre de ansiedade e costuma compreender bem quando está frente a uma ameaça comparável a ela — isto é, poderosa o suficiente para ameaçar sua vida — ou, pior ainda, mais forte que ela, e isso lhe deixa sempre com um medo que ela já se acostumou a reconhecer e que a faz reclamar um bocado. Ainda assim, sendo uma combatente ela se forçou a desenvolver a fibra necessária para lutar enquanto engole esse medo. Isso, junto à sua espada inicial <strong>Shiken</strong>, a fez desenvolver o senso de autonomia que lhe permitiu não se sentir fraca, frágil e patética por conta de seus traumas.</p><p>Akane também possui uma <strong>crueldade dentro de si</strong>, nutrida por ter crescido entre os Shidou. Assim como tantas pessoas, existe um lado escuro dentro dela que sente prazer no sofrimento de outrem. Antigamente reprimido, ela aprendeu a escutá-lo e libertá-lo sob controle, assim desenvolvendo um gosto pelo combate, pois as lutas, principalmente amistosas, são sua principal válvula de escape. Curiosamente, apesar dessa tendência cruel, quando realmente luta para matar, ela não exibe o menor requinte de crueldade: sempre elimina inimigos de forma fria e eficiente, propositalmente provocando mortes indolores quando possível.</p><h3>❚ Crenças</h3><p>Embora o modo de pensar de Akane tenha sido influenciado por diferentes religiões, ela não possui uma em específico, e sabe que os deuses em que os humanos acreditam são produzidos como seres espirituais a partir da energia espiritual emanada pela fé e adoração direcionadas a eles. Porém, a mentalidade dela é mais influenciada pelo <strong>budismo</strong>, principalmente o <strong>Shingon</strong>.</p><p>Em termos de moral, ela tem pouca coisa diferente de uma pessoa comum. Por exemplo, embora não tenha sido convencida pela ideia de desenhos animados de que <em>\"quem mata o vilão faz algo tão ruim quanto ele\"</em>, a convivência com uma família de assassinos a fez entender cedo que é muito difícil sujar as mãos sem sujar também a alma, e por isso ela mesma evita matar quando possível.</p><p>Akane não possui uma moral estereotipicamente punitivista de um reacionário, isto é, ela não chega no ponto exagerado de defender que qualquer coisa que aconteça a um criminoso, ele quem devia \"ter pensado nisso antes de cometer o crime\". No entanto, ela também não possui a moral puramente consequencialista de defender o que quer que seja melhor para minimizar taxas de reincidência futuras, e nunca mais do que isso: se ela entrasse numa prisão norueguesa e visse um atirador que matou dezenas de pessoas tendo \"como única punição a remoção de sua liberdade\", ela mesma o espancaria para dar a ele o que ela acredita que ele merece, mas ela também odeia a forma como qualquer jovem que trafique maconha nos Estados Unidos pode ser colocado em uma prisão solitária. Se ela pudesse, os libertaria mesmo que significasse se tornar inimiga de uma superpotência.</p><p>Essa crença torna Akane <strong>especialmente perigosa</strong> quando unida ao fato de que ela não possui qualquer respeito intrínseco por figuras de autoridade, e está plenamente disposta a cometer crimes para fazer o que acha certo. Ela trata pessoas naturalmente com educação, mas seu respeito é diretamente proporcional ao quanto acha que alguém o conquistou, e qualquer respeito que ela dê a uma figura de autoridade que não o conquistou é somente o mínimo necessário para evitar as consequências negativas que lhe seriam direcionadas por não dá-lo, e mesmo assim é dado apenas falsamente.</p><h3>❚ Gostos &amp; Desgostos</h3><p><strong>Gostos</strong></p><ul><li><p><strong>Eletrônicos</strong>, sendo inclusive habilidosa no conserto de computadores e celulares, embora não trabalhe com isso por não lhe pagar de longe tão bem nem usar o total de suas habilidades como paranormal.</p></li><li><p>Pessoas em geral, contanto que não sejam babacas.</p></li><li><p>Doces e livros.</p></li></ul><p><strong>Desgostos</strong></p><ul><li><p>Coisas azedas, inclusive limonada, a menos que tenha bastante açúcar.</p></li><li><p>Vodka pura.</p></li><li><p>Pessoas que acreditam merecer posições de status ou poder e ter o direito de tratá-las como algo de que conquistaram o direito de aproveitar os benefícios.</p></li></ul><h3>❚ Relacionamentos</h3><ul><li><p><strong>Zeratsu Shimizu</strong> — é o primo de Akane e até hoje uma das pessoas de quem ela é mais próxima, com eles tendo tido somente um ao outro como apoio durante toda uma década. Embora geralmente evite matar pessoas, ela mataria e morreria por ele, sendo mais leal ao primo do que até mesmo a namorados e namoradas que já teve.</p></li><li><p><strong>Leonardo Âmbar e Luna Cruz</strong> — são um casal com a qual ela fez amizade. Um jogador de League e uma fujoshi, ambos esquisitos, mas Akane se surpreendeu com o fato de serem boas pessoas, o que não esperava de nenhuma das duas demografias.</p></li><li><p><strong>Stärke</strong> — é um meio-gigante tatuador com o qual Akane possui amizade. Eles não são muito próximos, mas Stärke é uma pessoa extremamente boa com a qual Akane sabe que sempre pode contar, e portanto em reciprocidade ela garante que ele sempre possa contar com ela também.</p></li><li><p><strong>Shin Hae</strong> — é um néfilim que Akane conheceu por meio de Zeratsu após reencontrá-lo, um amigo deste o qual é mais velho que o resto do círculo social e costuma ser bastante \"na dele\". Ele parece ter diversos problemas ligados ao passado e agir como um lobo solitário, aparentando buscar vingança contra alguém. Akane se sente preocupada, mas prefere não se envolver muito por achá-lo esquisito. Vai que decide usá-la como muleta emocional no instante que ela oferecer algum apoio.</p></li><li><p><strong>Isabella</strong> — foi a primeira amiga que Akane fez no Brasil, uma mentalista tanto preguiçosa quanto portadora de TDAH, a qual possui um potencial imenso mas não dá a mínima. Ainda assim, a asiática sempre a viu sendo esforçada por aqueles que lhe são próximos, e portanto a valoriza grandemente.</p></li><li><p><strong>Nathaniel Wyndham</strong> — é um americano que, assim como Akane, viajou para o Brasil para evitar a própria família problemática. Inicialmente alguém de quem Akane desconfiava, conhecer mais sobre ele e saber que era também amigo de Zeratsu gerou uma identificação bem mais profunda entre os dois, tornando-os amigos próximos. Ela o ensinou a lutar melhor com a espada.</p></li><li><p><strong>Sophia Dheos</strong> — é uma amiga próxima de Akane, que a ensinou várias técnicas paranormais tal como é a namorada do seu primo.</p></li></ul>",
      "stats": {},
      "mascaraTier": "Grã-Mestra"
    },
    {
      "id": 4,
      "nome": "Diana Spades",
      "categoria": "Personagem Principal",
      "titulo": "Rainha de Espadas (em construção)",
      "raca": "Humano artificial",
      "faccao": "A Máscara — Polegar da Mão Esquerda",
      "status": "Viva",
      "imagem": "https://i.pinimg.com/736x/24/62/9d/24629d26b6803340fd31747a2b5e7714.jpg",
      "descricao": "<h3>Perfil</h3><p><b>Nome</b> — Diana Spades é seu nome civil e fabricado pela Máscara. Seu verdadeiro nome se perdeu em centenas de relatórios científicos e médicos. Contudo, é conhecido o fato dela ser meramente a Espécime Q, a Rainha de Espadas.</p><p><b>Idade</b> — 24 anos desde a estabilização. Ela nunca foi criança. Seu corpo foi precipitado já adulto e sua mente emergiu do Núcleo com estrutura completa, restando ao clã apenas “preenchê-la”. Aparenta estar no fim dos vinte e poucos anos, e a aparência não mudou de forma mensurável desde então.</p><p><b>Raça</b> — Humano artificial. A carne de Diana é humana, clonada e refinada a partir da linhagem principal do clã Myung-Jin; um exame de sangue mundano não encontraria nada de errado. Sua alma, porém, não nasceu, foi precipitada do inconsciente coletivo através do Núcleo Demoníaco, tecida de arquétipos puros. O registro oficial Máscara a classifica como “humana.”</p><p><b>Sexualidade</b> — Diana se considera uma mulher cis. Quanto ao resto, para alguém que consegue enxergar tão fundo na psique humana, fica difícil se interessar romanticamente por alguém. Diana costuma ver as pessoas como um livro que ela mesma pode reescrever, portanto, tende a não criar laços ou se apaixonar.</p><p><b>Ocupação</b> — Agente da Máscara com alto poder político, ainda a ser definido. Possui um cargo altíssimo no Polegar da Mão Esquerda, comandando um esquadrão de grão-mestres. Também atua em uma variedade de conselhos internacionais defendendo os interesses da Máscara.</p><p><b>Classe</b> — Arcana. Contudo, um arcano passa a vida se alinhando a um arquétipo do inconsciente coletivo, Diana foi tecida diretamente da matéria dos arquétipos.</p><h3>Cultivo — Maré Coletiva</h3><p>Uma técnica de Mentalismo, que a rigor, não existia antes de Diana. Ela a destilou dos fragmentos rituais do Projeto Kali e da própria natureza, e os poucos grão-mestres autorizados a examinar seu grimório concordam que nenhum outro paranormal vivo seria compatível com ela. A técnica de cultivo de Diana consiste em abrir seu circuito ao fluxo do sonho coletivo, filtrando-o através da própria alma arquetípica. O foco do cultivo recai primeiro sobre os núcleos astrais, que orbitam ao redor do Núcleo Demoníaco e sobre os nodos, com o corpo e os canais nutridos pelo refluxo. O resultado é uma reserva de éter com a energia da psique considerada praticamente infinita e acima dos padrões.</p><h3>Equipamentos — Olho de Odin</h3><p>Como todos sabem, o Pai de Todos arrancou o próprio olho e lançou-o no poço de Mimir. O mito, como sempre, tem razão nos pontos errados. O que existe sob a pálpebra esquerda de Diana não é o olho de um deus, mas aquilo em que dois milênios e meio de humanidade acreditando nessa história transformaram a ideia dele, um artefato mítico lapidado pelo inconsciente coletivo até se tornar o arquétipo puro do Preço da Sabedoria.</p>",
      "stats": {},
      "mascaraTier": ""
    }
  ],
  nextPersonagemId: 5,

  equipe: [
    { nome: 'Rick', cargo: 'Dono e Moderador', foto: 'https://i.pinimg.com/736x/02/bc/1d/02bc1ddfb478c7069ac1db5017955648.jpg' },
    { nome: 'Mand Raiden', cargo: 'Criador, Escritor e Dono da Obra', foto: '' },
    { nome: 'Ghostmaker', cargo: 'Criador, Escritor e Vice-Dono da Obra', foto: '' },
    { nome: 'Scautz', cargo: 'Criador e Escritor', foto: 'https://i.pinimg.com/736x/55/86/5a/55865a10f994f2379e4a4ac484def034.jpg' },
    { nome: 'Lucas Kabii', cargo: 'Criador e Colaborador', foto: 'https://i.pinimg.com/control1/736x/94/b1/6b/94b16b73301e10ea0b4f5a63500cc619.jpg' }
  ],

  session: null
};

function saveDB() {
  try { localStorage.setItem('forum-antigo-db-v22', JSON.stringify(DB)); } catch (e) {}
}

function loadDB() {
  try {
    var saved = localStorage.getItem('forum-antigo-db-v22');
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.nextUserId) DB = parsed;
    }
  } catch (e) {}

  if (DB.session) {
    var liveUser = DB.users.find(function(u) { return u.id === DB.session.id; });
    DB.session = liveUser || null;
  }
}

function h(text) {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ha(text) {
  return h(text);
}

function formatPost(content) {
  return content;
}

function getUserById(id) {
  return DB.users.find(function(u) { return u.id === id; });
}

function isAdmin() {
  return !!(DB.session && DB.session.role === 'admin');
}

function isModOrAdmin() {
  return !!(DB.session && (DB.session.role === 'admin' || DB.session.role === 'moderador'));
}

function badgeHtml(user) {
  if (!user) return '';
  if (user.role === 'admin') return '<span class="admin-badge">ADMIN</span>';
  if (user.role === 'moderador') return '<span class="mod-badge">MODERADOR</span>';
  return '<span class="member-badge">MEMBRO</span>';
}

function podeEditarThread(authorId) {
  if (!DB.session) return false;
  if (DB.session.role === 'admin') return true;
  if (DB.session.id === authorId) return true;
  return false;
}

function podeEditarPost(authorId) {
  return podeEditarThread(authorId);
}

function bumpPosts() {
  if (!DB.session) return;
  DB.session.posts = (DB.session.posts || 0) + 1;
}

var currentPage = 'forum';
var currentThread = null;
var currentCat = null;
var currentPersonagem = null;
var editandoThread = null;

function navigate(page, extra) {
  currentPage = page;
  if (extra !== undefined) {
    if (page === 'thread') currentThread = extra;
    if (page === 'cat') currentCat = extra;
    if (page === 'personagemView') currentPersonagem = extra;
  }
  document.querySelectorAll('#nav-bar button').forEach(function(b) { b.classList.remove('active'); });
  var navMap = {
    forum: 'nav-forum', cat: 'nav-forum', thread: 'nav-forum', novaThread: 'nav-forum',
    wiki: 'nav-wiki', personagemView: 'nav-wiki', novoPersonagem: 'nav-wiki',
    perfil: null, registro: null, sobre: null, admin: null
  };
  var navId = navMap[page];
  if (navId) { var el = document.getElementById(navId); if (el) el.classList.add('active'); }
  updateTopBar();
  render();
  window.scrollTo(0, 0);
}

function updateTopBar() {
  var info = document.getElementById('top-user-info');
  var actions = document.getElementById('top-btn-area');
  var adminBtn = document.getElementById('nav-admin-btn');
  if (DB.session) {
    info.innerHTML = '<span class="online-dot"></span>Logado como: <a onclick="navigate(\'perfil\')" style="color:#cce;font-weight:bold;">' + h(DB.session.username) + '</a> — ' + h(DB.session.title);
    actions.innerHTML = '<a onclick="doLogout()" style="color:#faa;">Sair</a>';
    if (isAdmin()) {
      adminBtn.innerHTML = '<button onclick="navigate(\'admin\')" style="background:#7a1a1a;border:1px solid #aa3333;color:#ffcccc;padding:4px 10px;font-size:11px;cursor:pointer;border-radius:2px;font-family:Verdana,sans-serif;">Painel Admin</button>';
    } else {
      adminBtn.innerHTML = '';
    }
  } else {
    info.innerHTML = 'Bem-vindo, visitante!';
    actions.innerHTML = '<a onclick="showLoginModal()" style="color:#cce;margin-right:10px;">Entrar</a><a onclick="navigate(\'registro\')" style="color:#cce;">Registrar</a>';
    adminBtn.innerHTML = '';
  }
}

function render() {
  var el = document.getElementById('main');
  var map = {
    forum: renderForum,
    cat: renderCat,
    thread: renderThread,
    novaThread: renderNovaThread,
    wiki: renderWiki,
    personagemView: renderPersonagemView,
    novoPersonagem: renderNovoPersonagem,
    perfil: renderPerfil,
    registro: renderRegistro,
    sobre: renderSobre,
    admin: renderAdmin
  };
  if (map[currentPage]) {
    el.innerHTML = map[currentPage]();
  } else {
    el.innerHTML = '<p>Página não encontrada.</p>';
  }
}

function renderForum() {
  var html = '<div class="breadcrumb">Início &raquo; Fórum</div>';
  DB.categories.forEach(function(cat) {
    var catThreads = DB.threads.filter(function(t) { return t.catId === cat.id; });
    var catPosts = 0;
    catThreads.forEach(function(t) { catPosts += DB.posts.filter(function(p) { return p.threadId === t.id; }).length; });
    var lastThread = catThreads.length ? catThreads[catThreads.length - 1] : null;
    var lastInfo = lastThread ? ('<a onclick="navigate(\'thread\',' + lastThread.id + ')">' + h(lastThread.title.substring(0, 35)) + '...</a><br><small style="color:#888;">' + lastThread.date + '</small>') : '<span style="color:#888;">Nenhum</span>';

    html += '<div class="cat-header"><span>' + h(cat.name) + '</span>';
    if (DB.session) html += '<button class="btn btn-small btn-success" onclick="startNewThread(' + cat.id + ')">+ Novo Tópico</button>';
    html += '</div>';
    html += '<table class="forum-table"><thead><tr><th style="width:45%">Categoria</th><th>Tópicos</th><th>Posts</th><th>Último Post</th></tr></thead><tbody>';
    html += '<tr><td><a onclick="navigate(\'cat\',' + cat.id + ')">' + h(cat.name) + '</a><br><small style="color:#666;">' + h(cat.desc) + '</small></td>';
    html += '<td>' + catThreads.length + '</td><td>' + catPosts + '</td><td style="font-size:11px;">' + lastInfo + '</td></tr>';
    html += '</tbody></table>';
  });

  var totalPosts = DB.posts.length;
  var totalThreads = DB.threads.length;
  var totalUsers = DB.users.length;
  html += '<div class="stats-bar"><span><b>' + totalPosts + '</b> posts</span><span><b>' + totalThreads + '</b> tópicos</span><span><b>' + totalUsers + '</b> usuários</span>';
  if (DB.session) html += '<span><span class="online-dot"></span><b>' + h(DB.session.username) + '</b> online</span>';
  html += '</div>';
  return html;
}

function renderCat() {
  var cat = DB.categories.find(function(c) { return c.id === currentCat; });
  if (!cat) return '<p>Categoria não encontrada.</p>';
  var threads = DB.threads.filter(function(t) { return t.catId === currentCat; });
  threads.sort(function(a, b) { return b.pinned - a.pinned || b.id - a.id; });

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> &raquo; ' + h(cat.name) + '</div>';
  html += '<div class="cat-header"><span>' + h(cat.name) + '</span>';
  if (DB.session) html += '<button class="btn btn-small btn-success" onclick="startNewThread(' + cat.id + ')">+ Novo Tópico</button>';
  html += '</div>';
  html += '<table class="forum-table"><thead><tr><th>Tópico</th><th>Autor</th><th>Respostas</th><th>Views</th><th>Último Post</th></tr></thead><tbody>';

  if (!threads.length) {
    html += '<tr><td colspan="5" style="text-align:center;color:#888;padding:20px;">Nenhum tópico ainda. <a onclick="startNewThread(' + cat.id + ')">Criar o primeiro!</a></td></tr>';
  }

  threads.forEach(function(t) {
    var author = getUserById(t.authorId);
    var replies = Math.max(0, DB.posts.filter(function(p) { return p.threadId === t.id; }).length - 1);
    var tagClass = 'tag-' + (t.tag || 'ooc');
    var lastPost = DB.posts.filter(function(p) { return p.threadId === t.id; });
    var lastPostDate = lastPost.length ? lastPost[lastPost.length - 1].date : t.date;
    html += '<tr><td>';
    if (t.pinned) html += '<span class="pin">FIXO</span>';
    html += '<span class="tag ' + tagClass + '">' + (t.tag || 'ooc').toUpperCase() + '</span> ';
    html += '<a onclick="navigate(\'thread\',' + t.id + ')">' + h(t.title) + '</a>';
    html += '</td><td>' + (author ? h(author.username) : '?') + '</td>';
    html += '<td>' + replies + '</td><td>' + (t.views || 0) + '</td>';
    html += '<td style="font-size:11px;">' + lastPostDate + '</td></tr>';
  });

  html += '</tbody></table>';
  return html;
}

function renderThread() {
  var thread = DB.threads.find(function(t) { return t.id === currentThread; });
  if (!thread) return '<p>Tópico não encontrado.</p>';
  var cat = DB.categories.find(function(c) { return c.id === thread.catId; });
  thread.views = (thread.views || 0) + 1;
  saveDB();

  var posts = DB.posts.filter(function(p) { return p.threadId === currentThread; });
  var tagClass = 'tag-' + (thread.tag || 'ooc');

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> &raquo; <a onclick="navigate(\'cat\',' + thread.catId + ')">' + h(cat ? cat.name : '') + '</a> &raquo; ' + h(thread.title) + '</div>';
  html += '<div class="thread-tools">';
  html += '<h2><span class="tag ' + tagClass + '">' + (thread.tag || 'ooc').toUpperCase() + '</span> ' + h(thread.title) + '</h2>';
  html += '<div style="display:flex;gap:5px;">';
  if (podeEditarThread(thread.authorId)) {
    html += '<button class="btn btn-warn btn-small" onclick="editarThread(' + thread.id + ')">Editar</button>';
    html += '<button class="btn btn-danger btn-small" onclick="deleteThread(' + thread.id + ')">Deletar Tópico</button>';
  }
  html += '</div></div>';

  posts.forEach(function(post, idx) {
    var author = getUserById(post.authorId);
    var initials = author ? author.username.substring(0, 2).toUpperCase() : '??';
    var avatarHtml = (author && author.avatar) ? '<img src="' + ha(author.avatar) + '">' : initials;
    var cargoHtml = '<div>' + badgeHtml(author) + '</div>';

    html += '<div class="post-box">';
    html += '<div class="post-header"><div class="post-meta"><span class="post-number">#' + (idx + 1) + '</span><strong>' + (author ? h(author.username) : '?') + '</strong></div><div class="post-meta"><span class="post-date">' + post.date + '</span>' + (post.edited ? '<span class="post-edited">editado</span>' : '') + '</div></div>';
    html += '<div class="post-body">';
    html += '<div class="post-user-panel"><div class="avatar">' + avatarHtml + '</div><div class="username">' + (author ? h(author.username) : '?') + '</div><div class="user-title">' + (author ? h(author.title) : '') + '</div><div class="user-posts">Posts: ' + (author ? author.posts : 0) + '</div>' + cargoHtml + '</div>';
    html += '<div class="post-content">' + formatPost(post.content) + '</div>';
    html += '</div>';
    html += '<div class="post-footer"><div class="post-actions">';
    if (DB.session) {
      html += '<a onclick="quotePost(' + post.id + ')">Citar</a>';
      if (podeEditarPost(post.authorId)) {
        html += '<a onclick="editPost(' + post.id + ')">Editar</a>';
        html += '<a class="danger-link" onclick="deletePost(' + post.id + ')">Deletar</a>';
      }
    }
    html += '</div></div></div>';
  });

  if (DB.session) {
    html += '<div class="reply-box">';
    html += '<div class="reply-title"><span>Responder ao Tópico</span><span>' + h(DB.session.username) + '</span></div>';
    html += '<div class="reply-inner">';
    html += buildEditor('reply-editor', '');
    html += '<div style="margin-top:8px;"><button class="btn btn-primary" onclick="submitReply()">Enviar Resposta</button></div>';
    html += '</div></div>';
  } else {
    html += '<div class="alert alert-info" style="margin-top:10px;"><a onclick="showLoginModal()">Faça login</a> para responder neste tópico.</div>';
  }

  return html;
}

function renderNovaThread() {
  if (!DB.session) return '<div class="alert alert-error">Você precisa estar logado.</div>';
  var selCat = currentCat || 1;
  var isEdit = editandoThread !== null;
  var thr = isEdit ? DB.threads.find(function(t) { return t.id === editandoThread; }) : null;
  var priPost = isEdit ? DB.posts.find(function(p) { return p.threadId === editandoThread; }) : null;

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> &raquo; ' + (isEdit ? 'Editar Tópico' : 'Novo Tópico') + '</div>';
  html += '<div class="cat-header"><span>' + (isEdit ? 'Editar Tópico' : 'Criar Novo Tópico') + '</span></div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;">';

  if (!isEdit) {
    html += '<div class="form-row"><label>Categoria</label><select id="thread-cat">';
    DB.categories.forEach(function(c) {
      html += '<option value="' + c.id + '"' + (c.id === selCat ? ' selected' : '') + '>' + h(c.name) + '</option>';
    });
    html += '</select></div>';
    html += '<div class="form-row"><label>Tipo</label><select id="thread-tag"><option value="ooc">OOC (Discussão fora do personagem)</option><option value="rp">RP (Cena de Roleplay)</option><option value="wiki">Wiki / Lore</option></select></div>';
  }

  html += '<div class="form-row"><label>Título</label><input type="text" id="thread-title" value="' + (thr ? ha(thr.title) : '') + '" placeholder="Título do tópico"></div>';
  html += '<div class="form-row"><label>Conteúdo</label>';
  html += buildEditor('thread-editor', priPost ? priPost.content : '');
  html += '</div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;">';
  if (isEdit) {
    html += '<button class="btn btn-primary" onclick="salvarEdicaoThread()">Salvar Alterações</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="submitThread()">Publicar Tópico</button>';
  }
  html += '<button class="btn btn-small" onclick="navigate(\'forum\')">Cancelar</button></div>';
  html += '</div>';
  return html;
}

// Fichas vindas do banco de dados. null = ainda não carregadas (usa as locais como fallback).
var serverPersonagens = null;

function carregarPersonagensServidor() {
  fetch('/api/personagens')
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      if (!data || !data.personagens) return;
      serverPersonagens = data.personagens;
      if (currentPage === 'wiki' || currentPage === 'personagemView') render();
    })
    .catch(function() {});
}

// Lista exibida no site: as do servidor + as que só existem neste navegador.
// Fichas locais com o mesmo nome de uma do servidor ficam ocultas (a do servidor vale).
function listaPersonagens() {
  if (serverPersonagens === null) return DB.personagens;
  var nomes = {};
  serverPersonagens.forEach(function(p) { nomes[p.nome.toLowerCase()] = true; });
  var locais = DB.personagens.filter(function(p) { return !nomes[p.nome.toLowerCase()]; });
  return serverPersonagens.concat(locais);
}

// Ficha criada antes da integração com o banco: só existe no localStorage deste navegador.
function personagemLocalApenas(p) {
  return serverPersonagens !== null && typeof p.id === 'number';
}

// Ids do servidor são uuids (string); os locais são números. Gera o literal certo para onclick.
function idJs(id) {
  return typeof id === 'number' ? id : "'" + id + "'";
}

function renderCharCard(p) {
  var statusColor = p.status === 'Vivo' || p.status === 'Viva' ? '#007700' : (p.status === 'Afastada' || p.status === 'Afastado' ? '#774400' : '#770000');
  var html = '<div class="char-card" onclick="navigate(\'personagemView\',' + idJs(p.id) + ')">';
  if (p.imagem) {
    html += '<img class="thumb" src="' + ha(p.imagem) + '" alt="' + ha(p.nome) + '">';
  } else {
    html += '<div class="thumb-ph">' + h(p.nome.substring(0, 1)) + '</div>';
  }
  html += '<div class="char-card-info"><h4>' + h(p.nome) + (p.titulo ? ' — <em>' + h(p.titulo) + '</em>' : '') + '</h4>';
  html += '<p><b>Raça:</b> ' + h(p.raca) + ' | <b>Facção:</b> ' + h(p.faccao) + ' | <b>Status:</b> <span style="color:' + statusColor + ';">' + h(p.status) + '</span></p>';
  var descTexto = p.descricao.replace(/<[^>]+>/g, '').substring(0, 130);
  html += '<p style="margin-top:4px;">' + h(descTexto) + '...</p>';
  html += '</div></div>';
  return html;
}

function renderWiki() {
  var html = '<div class="breadcrumb">Início &raquo; Personagens</div>';
  html += '<div class="cat-header"><span>Personagens Conhecidos</span>';
  if (isModOrAdmin()) {
    html += '<button class="btn btn-small btn-success" onclick="sessionStorage.removeItem(\'editPersonagemId\');navigate(\'novoPersonagem\')">+ Novo Personagem</button>';
  }
  html += '</div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:10px;margin-bottom:10px;font-size:12px;color:#555;">Clique em um personagem para ver o perfil completo.</div>';

  var lista = listaPersonagens();
  var principais = lista.filter(function(p) { return p.categoria !== 'Sub-Personagem'; });
  var subPersonagens = lista.filter(function(p) { return p.categoria === 'Sub-Personagem'; });

  if (principais.length) {
    html += '<div class="cat-header" style="margin-top:6px;"><span>Personagens Principais</span></div>';
    principais.forEach(function(p) { html += renderCharCard(p); });
  }

  if (subPersonagens.length) {
    html += '<div class="cat-header" style="margin-top:14px;"><span>Sub-Personagens</span></div>';
    subPersonagens.forEach(function(p) { html += renderCharCard(p); });
  }

  if (!lista.length) {
    html += '<div style="text-align:center;padding:30px;color:#888;">Nenhum personagem cadastrado ainda.</div>';
  }

  return html;
}

function renderPersonagemView() {
  var lista = listaPersonagens();
  var p = lista.find(function(x) { return String(x.id) === String(currentPersonagem); });
  // Ficha local substituída pela versão do servidor (mesmo nome): segue para a do servidor.
  if (!p && typeof currentPersonagem === 'number') {
    var seed = DB.personagens.find(function(x) { return x.id === currentPersonagem; });
    if (seed) {
      p = lista.find(function(x) { return x.nome.toLowerCase() === seed.nome.toLowerCase(); });
    }
  }
  if (!p) return '<p>Personagem não encontrado.</p>';
  var statusColor = p.status === 'Vivo' || p.status === 'Viva' ? '#007700' : (p.status === 'Afastada' || p.status === 'Afastado' ? '#774400' : '#770000');

  var html = '<div class="breadcrumb"><a onclick="navigate(\'wiki\')">Personagens</a> &raquo; ' + h(p.nome) + '</div>';

  html += '<div class="char-sheet-head">';
  html += '<h2>' + h(p.nome) + (p.titulo ? ' <em>' + h(p.titulo) + '</em>' : '') + '</h2>';
  if (isModOrAdmin()) {
    html += '<div style="display:flex;gap:5px;"><button class="btn btn-warn btn-small" onclick="editarPersonagem(' + idJs(p.id) + ')">Editar</button><button class="btn btn-danger btn-small" onclick="deletarPersonagem(' + idJs(p.id) + ')">Deletar</button></div>';
  }
  html += '</div>';

  if (personagemLocalApenas(p)) {
    html += '<div class="alert alert-info">Esta ficha está salva apenas neste navegador — outras pessoas não a veem.';
    if (isModOrAdmin()) {
      html += ' <button class="btn btn-small btn-primary" onclick="enviarPersonagemAoServidor(' + p.id + ')">Enviar ao servidor</button>';
    }
    html += '</div>';
  }

  html += '<div class="char-sheet-grid">';
  html += '<div class="char-sheet-card">';
  html += '<div class="char-sheet-card-title">' + h(p.nome) + '</div>';
  if (p.imagem) html += '<div class="char-sheet-portrait"><img src="' + ha(p.imagem) + '"></div>';
  html += '<table style="width:100%;font-size:11px;text-align:left;">';
  if (p.titulo) html += '<tr><td><b>Título:</b></td><td>' + h(p.titulo) + '</td></tr>';
  html += '<tr><td><b>Raça:</b></td><td>' + h(p.raca) + '</td></tr>';
  html += '<tr><td><b>Facção:</b></td><td>' + h(p.faccao) + '</td></tr>';
  html += '<tr><td><b>Status:</b></td><td style="color:' + statusColor + ';font-weight:bold;">' + h(p.status) + '</td></tr>';
  html += '</table>';
  if (p.mascaraTier) html += '<div class="tier-badge mascara card-badge">A Máscara: <b>' + h(p.mascaraTier) + '</b></div>';
  html += '</div>';
  html += '<div class="char-sheet-body">' + p.descricao + '</div>';
  html += '</div>';

  if (p.skills && p.skills.length) {
    var skillCards = p.skills.filter(function(sk) { return sk.tipo !== 'equipamento'; });
    var equipCards = p.skills.filter(function(sk) { return sk.tipo === 'equipamento'; });
    if (skillCards.length) {
      html += '<div class="cat-header" style="margin-top:15px;"><span>Skills</span></div>';
      html += '<div class="skill-grid">';
      skillCards.forEach(function(sk) {
        html += '<div class="skill-item"><h4>' + h(sk.nome) + '</h4><p>' + h(sk.descricao) + '</p></div>';
      });
      html += '</div>';
    }
    if (equipCards.length) {
      html += '<div class="cat-header" style="margin-top:15px;"><span>Equipamentos</span></div>';
      html += '<div class="skill-grid">';
      equipCards.forEach(function(sk) {
        html += '<div class="skill-item equip-item"><h4>' + h(sk.nome) + '</h4><p>' + h(sk.descricao) + '</p></div>';
      });
      html += '</div>';
    }
  }

  if (statsPreenchidos(p.stats)) {
    html += '<div class="cat-header" style="margin-top:15px;"><span>Atributos</span></div>';
    html += '<div class="stat-panel">';
    html += '<div>' + buildRadarChart(p.stats) + '</div>';
    html += '<div class="stat-readout">';
    for (var si = 0; si < STAT_LABELS.length; si++) {
      var valorStat = p.stats[STAT_KEYS[si]] !== undefined ? p.stats[STAT_KEYS[si]] : 0;
      html += '<div class="stat-row"><span class="stat-label">' + STAT_LABELS[si] + '</span><span class="stat-bar"><span class="stat-bar-fill" style="width:' + valorStat + '%;"></span></span><span class="stat-value">' + valorStat + '</span></div>';
    }
    html += '</div></div>';
  }

  html += '<div style="clear:both;margin-top:15px;"><a onclick="navigate(\'wiki\')" class="btn btn-primary btn-small">Voltar</a></div>';
  return html;
}

var STAT_LABELS = ['Ataque', 'Destreza', 'Defesa', 'Reserva', 'Controle', 'Refino', 'Emissão', 'Alma', 'Inteligência', 'Habilidade'];
var STAT_ABBR = ['ATK', 'DEX', 'DEF', 'STA', 'CON', 'REF', 'EMI', 'SOUL', 'INT', 'SKILL'];
var STAT_KEYS = ['ataque', 'destreza', 'defesa', 'reserva', 'controle', 'refino', 'emissao', 'alma', 'inteligencia', 'habilidade'];

function statsPreenchidos(stats) {
  if (!stats) return false;
  for (var i = 0; i < STAT_KEYS.length; i++) {
    if (stats[STAT_KEYS[i]] !== undefined) return true;
  }
  return false;
}

function buildRadarChart(stats) {
  var labels = STAT_ABBR;
  var keys = STAT_KEYS;
  var n = labels.length;
  var size = 260;
  var cx = size / 2;
  var cy = size / 2;
  var maxR = 90;
  var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';

  var aneis = [0.2, 0.4, 0.6, 0.8, 1];
  for (var a = 0; a < aneis.length; a++) {
    var pontosAnel = '';
    for (var i = 0; i < n; i++) {
      var angAnel = (Math.PI * 2 / n) * i - Math.PI / 2;
      var rAnel = maxR * aneis[a];
      var xAnel = cx + rAnel * Math.cos(angAnel);
      var yAnel = cy + rAnel * Math.sin(angAnel);
      pontosAnel += xAnel.toFixed(1) + ',' + yAnel.toFixed(1) + ' ';
    }
    svg += '<polygon points="' + pontosAnel.trim() + '" fill="none" stroke="#aab6cc" stroke-width="1"></polygon>';
  }

  for (var i = 0; i < n; i++) {
    var ang = (Math.PI * 2 / n) * i - Math.PI / 2;
    var xEixo = cx + maxR * Math.cos(ang);
    var yEixo = cy + maxR * Math.sin(ang);
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + xEixo.toFixed(1) + '" y2="' + yEixo.toFixed(1) + '" stroke="#aab6cc" stroke-width="1"></line>';
    var lx = cx + (maxR + 22) * Math.cos(ang);
    var ly = cy + (maxR + 22) * Math.sin(ang);
    var anchor = 'middle';
    if (lx < cx - 5) anchor = 'end';
    if (lx > cx + 5) anchor = 'start';
    svg += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="9" fill="#1a2860" text-anchor="' + anchor + '" font-family="Verdana">' + h(labels[i]) + '</text>';
  }

  var pontosDado = '';
  for (var i = 0; i < n; i++) {
    var valor = stats[keys[i]] || 0;
    if (valor > 100) valor = 100;
    if (valor < 0) valor = 0;
    var angDado = (Math.PI * 2 / n) * i - Math.PI / 2;
    var rDado = maxR * (valor / 100);
    var xDado = cx + rDado * Math.cos(angDado);
    var yDado = cy + rDado * Math.sin(angDado);
    pontosDado += xDado.toFixed(1) + ',' + yDado.toFixed(1) + ' ';
  }
  svg += '<polygon points="' + pontosDado.trim() + '" fill="rgba(58,80,128,0.35)" stroke="#1a2860" stroke-width="2"></polygon>';
  svg += '</svg>';
  return svg;
}

function renderNovoPersonagem() {
  if (!isModOrAdmin()) return '<div class="alert alert-error">Acesso negado.</div>';

  var editId = sessionStorage.getItem('editPersonagemId');
  var existing = editId ? listaPersonagens().find(function(p) { return String(p.id) === editId; }) : null;

  var html = '<div class="breadcrumb"><a onclick="navigate(\'wiki\')">Personagens</a> &raquo; ' + (existing ? 'Editar Personagem' : 'Novo Personagem') + '</div>';
  html += '<div class="cat-header"><span>' + (existing ? 'Editar Personagem' : 'Cadastrar Personagem') + '</span></div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Nome</label><input type="text" id="p-nome" value="' + (existing ? ha(existing.nome) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Categoria</label><select id="p-categoria"><option value="Personagem Principal"' + (!existing || existing.categoria !== 'Sub-Personagem' ? ' selected' : '') + '>Personagem Principal</option><option value="Sub-Personagem"' + (existing && existing.categoria === 'Sub-Personagem' ? ' selected' : '') + '>Sub-Personagem</option></select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Título</label><input type="text" id="p-titulo" value="' + (existing ? ha(existing.titulo) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Raça</label><input type="text" id="p-raca" value="' + (existing ? ha(existing.raca) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Facção</label><input type="text" id="p-faccao" value="' + (existing ? ha(existing.faccao) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Status</label><input type="text" id="p-status" value="' + (existing ? ha(existing.status) : '') + '" placeholder="Vivo, Falecido, Afastado..."></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>URL da Imagem</label><input type="text" id="p-imagem" value="' + (existing ? ha(existing.imagem) : '') + '" placeholder="https://..."></div>';
  html += '</div>';
  html += '<div class="form-row"><label>Descrição / Lore (editor completo)</label>';
  html += buildEditor('p-editor', existing ? existing.descricao : '');
  html += '</div>';

  var st = (existing && existing.stats) ? existing.stats : {};
  html += '<div class="cat-header" style="margin-top:10px;"><span>Atributos (opcional)</span></div>';
  html += '<div style="border:1px solid #8899aa;background:#fff;padding:12px;margin-bottom:10px;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:10px;">';
  for (var ai = 0; ai < STAT_KEYS.length; ai++) {
    var valorAttr = st[STAT_KEYS[ai]] !== undefined ? st[STAT_KEYS[ai]] : '';
    html += '<div class="form-row" style="margin-bottom:0"><label>' + STAT_LABELS[ai] + '</label><input type="text" id="p-stat-' + STAT_KEYS[ai] + '" value="' + valorAttr + '"></div>';
  }
  html += '</div>';
  html += '<div class="field-desc">Cada atributo vai de 0 a 100. Se preenchidos, geram o gráfico de teia na página do personagem.</div>';
  html += '<div class="form-row" style="margin-top:8px;"><label>Classificação segundo A Máscara (opcional)</label><input type="text" id="p-mascara-tier" value="' + (existing ? ha(existing.mascaraTier) : '') + '"></div>';
  html += '</div>';

  var skillsExistentes = (existing && existing.skills) ? existing.skills : [];
  html += '<div class="cat-header" style="margin-top:10px;"><span>Skills e Equipamentos (opcional)</span></div>';
  html += '<div style="border:1px solid #8899aa;background:#fff;padding:12px;margin-bottom:10px;">';
  html += '<div class="field-desc" style="margin-bottom:8px;">Cada card aparece na ficha do personagem, na seção Skills ou Equipamentos conforme o tipo escolhido.</div>';
  html += '<div id="p-skills-list">';
  skillsExistentes.forEach(function(sk) { html += skillFormRowHtml(sk.nome, sk.descricao, sk.tipo); });
  html += '</div>';
  html += '<button type="button" class="btn btn-small btn-success" onclick="adicionarSkillFormRow()">+ Adicionar Card</button>';
  html += '</div>';

  var btnLabel = existing ? 'Salvar Alterações' : 'Cadastrar Personagem';
  var onclick = existing ? 'salvarEdicaoPersonagem(' + idJs(existing.id) + ')' : 'submitPersonagem()';
  html += '<div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-primary" onclick="' + onclick + '">' + btnLabel + '</button><button class="btn btn-small" onclick="navigate(\'wiki\')">Cancelar</button></div>';
  html += '</div>';
  return html;
}

function renderPerfil() {
  if (!DB.session) {
    return '<div class="alert alert-info">Você não está logado. <a onclick="showLoginModal()">Entrar</a> ou <a onclick="navigate(\'registro\')">cadastrar-se</a>.</div>';
  }
  var u = DB.session;
  var html = '<div class="breadcrumb">Início &raquo; Perfil</div>';
  html += '<div class="cat-header"><span>Perfil de ' + h(u.username) + '</span></div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;">';
  html += '<table class="forum-table"><tbody>';
  html += '<tr><td><b>Usuário</b></td><td>' + h(u.username) + '</td></tr>';
  html += '<tr><td><b>Título</b></td><td>' + h(u.title) + ' ' + badgeHtml(u) + '</td></tr>';
  html += '<tr><td><b>Email</b></td><td>' + h(u.email) + '</td></tr>';
  html += '<tr><td><b>Posts</b></td><td>' + (u.posts || 0) + '</td></tr>';
  html += '<tr><td><b>Cadastrado em</b></td><td>' + h(u.joinDate) + '</td></tr>';
  html += '</tbody></table>';
  html += '</div>';

  if (u.role !== 'admin') {
    html += '<div class="cat-header" style="margin-top:14px;"><span>Validação de ADM (1 tentativa)</span></div>';
    html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;">';
    if (jaTentouValidarAdmin()) {
      html += '<div class="alert alert-error">Você já usou sua única tentativa de validação.</div>';
    } else {
      html += '<div class="form-row"><label>Nome</label><input type="text" id="adm-nome" placeholder="Seu nome"></div>';
      html += '<div class="form-row"><label>Cargo</label><input type="text" id="adm-cargo" placeholder="adm, moderador, etc"></div>';
      html += '<div class="form-row"><label>Nível</label><input type="text" id="adm-nivel" placeholder="1, 5, 99..."></div>';
      html += '<button class="btn btn-warn" id="validar-adm" onclick="onClickValidarAdmin()">Validar agora</button>';
      html += '<div id="adm-message" style="margin-top:6px;font-size:11px;color:#774400;"></div>';
    }
    html += '</div>';
  }

  html += '<div style="margin-top:14px;"><button class="btn btn-danger btn-small" onclick="doLogout()">Sair da conta</button></div>';
  return html;
}

function renderRegistro() {
  if (DB.session) return '<div class="alert alert-info">Você já está logado.</div>';
  var html = '<div class="breadcrumb">Início &raquo; Registro</div>';
  html += '<div class="cat-header"><span>Criar Conta</span></div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;max-width:400px;">';
  html += '<div class="form-row"><label>Usuário</label><input type="text" id="reg-username"></div>';
  html += '<div class="form-row"><label>Email</label><input type="email" id="reg-email"></div>';
  html += '<div class="form-row"><label>Senha</label><input type="password" id="reg-password"></div>';
  html += '<div class="form-row"><label>Confirmar Senha</label><input type="password" id="reg-confirm"></div>';
  html += '<button class="btn btn-primary" onclick="submitRegistro()">Cadastrar</button>';
  html += '</div>';
  return html;
}

function renderSobre() {
  var html = '<div class="breadcrumb">Início &raquo; Sobre</div>';
  html += '<div class="cat-header"><span>Sobre o Projeto</span></div>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:16px;font-size:12px;line-height:1.7;">';
  html += '<p>Éterverso é um fórum para postar histórias, criar fichas de personagem e discutir roleplay. Tudo fica guardado em um banco de dados próprio do projeto.</p>';
  html += '<p>O Éterverso constitui um universo ficcional de Roleplay (RPG) de autoria original, cujos personagens, enredos, ambientações e demais elementos narrativos são de criação e titularidade exclusiva de seus idealizadores e mantenedores. Eventuais imagens de referência utilizadas nas fichas de personagens — sejam elas extraídas de wikis, bancos de imagem ou outras fontes externas — são empregadas estritamente como recurso ilustrativo e de caráter não-comercial, sob amparo dos princípios de uso justo e de citação para fins de caracterização ficcional, não configurando, em nenhuma hipótese, apropriação de autoria sobre a obra literária em si, a qual permanece integralmente resguardada por direito autoral em favor de seus criadores.</p>' +
    '<p>Está nos planos do projeto, a médio e longo prazo, expandir o Éterverso para além deste fórum: a proposta é transformá-lo em uma plataforma aberta a todos os rpgistas textuais que desejem narrar histórias dentro deste universo, além de dar origem, futuramente, a uma série de livros baseada no material produzido pela comunidade e pelos criadores originais.</p>';
  html += '</div>';

  html += '<div class="cat-header" style="margin-top:14px;"><span>Equipe Atual</span></div>';
  DB.equipe.forEach(function(m) {
    html += '<div class="char-card" style="cursor:default;">';
    if (m.foto) {
      html += '<img class="thumb" src="' + ha(m.foto) + '" alt="' + ha(m.nome) + '">';
    } else {
      html += '<div class="thumb-ph">' + h(m.nome.substring(0, 1)) + '</div>';
    }
    html += '<div class="char-card-info"><h4>' + h(m.nome) + '</h4><p>' + h(m.cargo) + '</p></div>';
    html += '</div>';
  });

  return html;
}

function renderAdmin() {
  if (!isAdmin()) return '<div class="alert alert-error">Acesso negado.</div>';

  var html = '<div class="breadcrumb">Início &raquo; Painel Admin</div>';
  html += '<div class="cat-header"><span>Usuários</span></div>';
  html += '<table class="forum-table"><thead><tr><th>Usuário</th><th>Cargo</th><th>Posts</th><th>Ações</th></tr></thead><tbody>';
  DB.users.forEach(function(u) {
    html += '<tr><td>' + h(u.username) + '</td><td>' + badgeHtml(u) + '</td><td>' + (u.posts || 0) + '</td><td>';
    html += '<select onchange="alterarCargoUsuario(' + u.id + ', this.value)">';
    html += '<option value="member"' + (u.role === 'member' ? ' selected' : '') + '>Membro</option>';
    html += '<option value="moderador"' + (u.role === 'moderador' ? ' selected' : '') + '>Moderador</option>';
    html += '<option value="admin"' + (u.role === 'admin' ? ' selected' : '') + '>Admin</option>';
    html += '</select>';
    html += ' <button class="btn btn-small btn-danger" onclick="deletarUsuario(' + u.id + ')">Excluir</button>';
    html += '</td></tr>';
  });
  html += '</tbody></table>';

  html += '<div class="cat-header"><span>Categorias</span></div>';
  html += '<table class="forum-table"><thead><tr><th>Nome</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>';
  DB.categories.forEach(function(c) {
    html += '<tr><td>' + h(c.name) + '</td><td>' + h(c.desc) + '</td><td><button class="btn btn-small btn-danger" onclick="removerCategoria(' + c.id + ')">Excluir</button></td></tr>';
  });
  html += '</tbody></table>';
  html += '<div style="background:#f8f9ff;border:1px solid #8899aa;padding:12px;margin-bottom:14px;">';
  html += '<div class="form-row"><label>Nova categoria</label><input type="text" id="nova-cat-nome" placeholder="Nome da categoria"></div>';
  html += '<div class="form-row"><label>Descrição</label><input type="text" id="nova-cat-desc" placeholder="Descrição"></div>';
  html += '<button class="btn btn-primary btn-small" onclick="adicionarCategoria()">Adicionar Categoria</button>';
  html += '</div>';

  html += '<div class="stats-bar"><span><b>' + DB.users.length + '</b> usuários</span><span><b>' + DB.threads.length + '</b> tópicos</span><span><b>' + DB.posts.length + '</b> posts</span><span><b>' + DB.personagens.length + '</b> personagens</span></div>';
  return html;
}

function showModal(title, bodyHtml) {
  var c = document.getElementById('modal-container');
  c.innerHTML = '<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-header"><span>' + h(title) + '</span><button onclick="closeModal()">&times;</button></div><div class="modal-body">' + bodyHtml + '</div></div></div>';
}

function closeModal() {
  document.getElementById('modal-container').innerHTML = '';
}

function showLoginModal() {
  var bodyHtml = '';
  bodyHtml += '<div class="form-row"><label>Usuário</label><input type="text" id="login-username"></div>';
  bodyHtml += '<div class="form-row"><label>Senha</label><input type="password" id="login-password"></div>';
  bodyHtml += '<button class="btn btn-primary" onclick="doLogin()">Entrar</button>';
  bodyHtml += '<div style="margin-top:10px;font-size:11px;">Não tem conta? <a onclick="closeModal();navigate(\'registro\')">Cadastre-se</a></div>';
  showModal('Entrar no Fórum', bodyHtml);
}

function showAlert(msg, type) {
  var main = document.getElementById('main');
  if (!main) return;
  var div = document.createElement('div');
  div.className = 'alert alert-' + type;
  div.textContent = msg;
  main.insertBefore(div, main.firstChild);
  setTimeout(function() {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 3500);
}

function apiRequest(method, url, body, cb) {
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
    .then(function(res) {
      return res.json().then(function(data) { return { ok: res.ok, data: data }; });
    })
    .then(function(r) {
      if (!r.ok) cb((r.data && r.data.error) || 'Erro no servidor.');
      else cb(null, r.data);
    })
    .catch(function() {
      cb('Não foi possível conectar ao servidor.');
    });
}

function apiPost(url, body, cb) {
  apiRequest('POST', url, body, cb);
}

function formatJoinDate(iso) {
  if (!iso) return '';
  var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return m[3] + '/' + m[2] + '/' + m[1];
}

// Sincroniza o usuário vindo do servidor com o espelho local (DB.users),
// que o resto do fórum usa para exibir perfis, posts e permissões.
function applyServerSession(serverUser) {
  if (!serverUser) {
    DB.session = null;
    saveDB();
    return;
  }
  var local = DB.users.find(function(u) {
    return u.username.toLowerCase() === serverUser.username.toLowerCase();
  });
  if (!local) {
    local = { id: DB.nextUserId++, posts: 0, avatar: '', bio: '' };
    DB.users.push(local);
  }
  local.serverId = serverUser.id;
  local.username = serverUser.username;
  local.email = serverUser.email;
  local.avatar = serverUser.avatar || local.avatar || '';
  local.title = serverUser.title || local.title || 'Membro';
  local.bio = serverUser.bio || local.bio || '';
  local.role = serverUser.role || 'member';
  if (!local.joinDate) local.joinDate = formatJoinDate(serverUser.joinDate);
  if (local.admTentativaUsada === undefined) local.admTentativaUsada = !!serverUser.admTentativaUsada;
  DB.session = local;
  saveDB();
}

function doLogin() {
  var username = document.getElementById('login-username').value.trim();
  var password = document.getElementById('login-password').value;
  if (!username || !password) {
    showAlert('Preencha usuário e senha.', 'error');
    return;
  }
  apiPost('/api/auth/login', { username: username, password: password }, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    applyServerSession(data.user);
    closeModal();
    navigate('forum');
    showAlert('Login realizado com sucesso.', 'success');
  });
}

function doLogout() {
  apiPost('/api/auth/logout', {}, function() {});
  DB.session = null;
  saveDB();
  navigate('forum');
}

function submitRegistro() {
  var username = document.getElementById('reg-username').value.trim();
  var password = document.getElementById('reg-password').value;
  var confirm2 = document.getElementById('reg-confirm').value;
  var email = document.getElementById('reg-email').value.trim();

  if (!username || !password || !email) {
    showAlert('Preencha todos os campos.', 'error');
    return;
  }
  if (password !== confirm2) {
    showAlert('As senhas não conferem.', 'error');
    return;
  }

  apiPost('/api/auth/signup', { username: username, email: email, password: password }, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    applyServerSession(data.user);
    navigate('forum');
    showAlert('Cadastro realizado. Bem-vindo(a)!', 'success');
  });
}

function startNewThread(catId) {
  currentCat = catId;
  editandoThread = null;
  navigate('novaThread');
}

function submitThread() {
  if (!DB.session) { showAlert('Faça login para criar tópicos.', 'error'); return; }
  var title = document.getElementById('thread-title').value.trim();
  var content = getEditorContent('thread-editor');
  var catId = parseInt(document.getElementById('thread-cat').value);
  var tag = document.getElementById('thread-tag').value;
  if (!title || !content || content === '<br>') { showAlert('Preencha o título e o conteúdo!', 'error'); return; }
  var now = new Date();
  var dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  var newThread = { id: DB.nextThreadId++, catId: catId, title: title, authorId: DB.session.id, date: dateStr, views: 0, pinned: false, tag: tag };
  var newPost = { id: DB.nextPostId++, threadId: newThread.id, authorId: DB.session.id, date: dateStr, content: content, edited: false };
  DB.threads.push(newThread);
  DB.posts.push(newPost);
  bumpPosts();
  saveDB();
  editandoThread = null;
  navigate('thread', newThread.id);
}

function editarThread(threadId) {
  var thread = DB.threads.find(function(t) { return t.id === threadId; });
  if (!thread) return;
  if (!podeEditarThread(thread.authorId)) { showAlert('Você não tem permissão para editar este tópico.', 'error'); return; }
  editandoThread = threadId;
  navigate('novaThread');
}

function salvarEdicaoThread() {
  var thr = DB.threads.find(function(t) { return t.id === editandoThread; });
  if (!thr) return;
  if (!podeEditarThread(thr.authorId)) { showAlert('Você não tem permissão para salvar este tópico.', 'error'); return; }
  var title = document.getElementById('thread-title').value.trim();
  var content = getEditorContent('thread-editor');
  if (!title) { showAlert('O título não pode ficar vazio.', 'error'); return; }
  thr.title = title;
  var firstPost = DB.posts.find(function(p) { return p.threadId === editandoThread; });
  if (firstPost) { firstPost.content = content; firstPost.edited = true; }
  saveDB();
  var tid = editandoThread;
  editandoThread = null;
  navigate('thread', tid);
}

function deleteThread(threadId) {
  var thread = DB.threads.find(function(t) { return t.id === threadId; });
  if (!thread) return;
  if (!podeEditarThread(thread.authorId)) { showAlert('Você não tem permissão para deletar este tópico.', 'error'); return; }
  if (!confirm('Deletar este tópico inteiro e todas as respostas?')) return;
  var catId = thread.catId;
  DB.threads = DB.threads.filter(function(t) { return t.id !== threadId; });
  DB.posts = DB.posts.filter(function(p) { return p.threadId !== threadId; });
  saveDB();
  navigate('cat', catId);
}

function submitReply() {
  if (!DB.session) { showAlert('Faça login para responder.', 'error'); return; }
  var content = getEditorContent('reply-editor');
  if (!content || content === '<br>') { showAlert('Escreva algo antes de enviar!', 'error'); return; }
  var now = new Date();
  var dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  var newPost = { id: DB.nextPostId++, threadId: currentThread, authorId: DB.session.id, date: dateStr, content: content, edited: false };
  DB.posts.push(newPost);
  bumpPosts();
  saveDB();
  navigate('thread', currentThread);
}

function quotePost(postId) {
  var post = DB.posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  var author = getUserById(post.authorId);
  var replyEditor = document.getElementById('reply-editor');
  if (replyEditor) {
    replyEditor.focus();
    var quoteHtml = '<blockquote><strong>' + h(author ? author.username : '?') + ' escreveu:</strong><br>' + post.content + '</blockquote><p></p>';
    document.execCommand('insertHTML', false, quoteHtml);
    replyEditor.scrollIntoView({ behavior: 'smooth' });
  }
}

function editPost(postId) {
  var post = DB.posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  if (!podeEditarPost(post.authorId)) { showAlert('Você não tem permissão para editar este post.', 'error'); return; }
  showModal('Editar Post',
    '<div class="form-row"><label>Conteúdo:</label>' + buildEditor('edit-post-editor', post.content) + '</div>' +
    '<div style="margin-top:8px;"><button class="btn btn-primary" onclick="saveEditPost(' + postId + ')">Salvar</button></div>'
  );
}

function saveEditPost(postId) {
  var post = DB.posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  if (!podeEditarPost(post.authorId)) { showAlert('Você não tem permissão para salvar este post.', 'error'); return; }
  var content = getEditorContent('edit-post-editor');
  if (!content) return;
  post.content = content;
  post.edited = true;
  saveDB();
  closeModal();
  navigate('thread', currentThread);
}

function deletePost(postId) {
  var post = DB.posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  if (!podeEditarPost(post.authorId)) { showAlert('Você não tem permissão para deletar este post.', 'error'); return; }
  if (!confirm('Deletar este post?')) return;
  var postsInThread = DB.posts.filter(function(p) { return p.threadId === currentThread; });
  if (postsInThread.length <= 1) {
    if (!confirm('Esse é o único post — deletar vai apagar o tópico inteiro. Confirma?')) return;
    var thr = DB.threads.find(function(t) { return t.id === currentThread; });
    var catId = thr ? thr.catId : 1;
    DB.threads = DB.threads.filter(function(t) { return t.id !== currentThread; });
    DB.posts = DB.posts.filter(function(p) { return p.threadId !== currentThread; });
    saveDB();
    navigate('cat', catId);
    return;
  }
  DB.posts = DB.posts.filter(function(p) { return p.id !== postId; });
  saveDB();
  render();
}

function editarPersonagem(id) {
  sessionStorage.setItem('editPersonagemId', id);
  navigate('novoPersonagem');
}

function lerStatsDoFormulario() {
  var stats = {};
  var algumPreenchido = false;
  for (var i = 0; i < STAT_KEYS.length; i++) {
    var bruto = document.getElementById('p-stat-' + STAT_KEYS[i]).value.trim();
    if (bruto === '') continue;
    var n = parseInt(bruto);
    if (isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    stats[STAT_KEYS[i]] = n;
    algumPreenchido = true;
  }
  return algumPreenchido ? stats : {};
}

function skillFormRowHtml(nome, descricao, tipo) {
  var isEquip = tipo === 'equipamento';
  return '<div class="skill-form-item">' +
    '<div class="form-row" style="margin-bottom:6px;"><label>Tipo do Card</label><select class="skill-tipo"><option value="skill"' + (!isEquip ? ' selected' : '') + '>Skill</option><option value="equipamento"' + (isEquip ? ' selected' : '') + '>Equipamento</option></select></div>' +
    '<div class="form-row" style="margin-bottom:6px;"><label>Nome</label><input type="text" class="skill-nome" value="' + ha(nome || '') + '" placeholder="Ex: Aether Rasengan"></div>' +
    '<div class="form-row" style="margin-bottom:6px;"><label>Descrição</label><textarea class="skill-desc" rows="3" spellcheck="false" placeholder="O que a habilidade ou equipamento faz...">' + h(descricao || '') + '</textarea></div>' +
    '<button type="button" class="btn btn-small btn-danger" onclick="this.parentNode.remove()">Remover Card</button>' +
    '</div>';
}

function adicionarSkillFormRow() {
  var container = document.getElementById('p-skills-list');
  container.insertAdjacentHTML('beforeend', skillFormRowHtml('', '', 'skill'));
}

function lerSkillsDoFormulario() {
  var skills = [];
  document.querySelectorAll('#p-skills-list .skill-form-item').forEach(function(item) {
    var nome = item.querySelector('.skill-nome').value.trim();
    var descricao = item.querySelector('.skill-desc').value.trim();
    var tipo = item.querySelector('.skill-tipo').value === 'equipamento' ? 'equipamento' : 'skill';
    if (nome || descricao) skills.push({ nome: nome, descricao: descricao, tipo: tipo });
  });
  return skills;
}

function lerFormPersonagem() {
  return {
    nome: document.getElementById('p-nome').value.trim(),
    categoria: document.getElementById('p-categoria').value,
    titulo: document.getElementById('p-titulo').value.trim(),
    raca: document.getElementById('p-raca').value.trim(),
    faccao: document.getElementById('p-faccao').value.trim(),
    status: document.getElementById('p-status').value.trim(),
    imagem: document.getElementById('p-imagem').value.trim(),
    descricao: getEditorContent('p-editor'),
    stats: lerStatsDoFormulario(),
    skills: lerSkillsDoFormulario(),
    mascaraTier: document.getElementById('p-mascara-tier').value.trim()
  };
}

function submitPersonagem() {
  if (!isModOrAdmin()) { showAlert('Apenas administradores e moderadores podem cadastrar personagens.', 'error'); return; }
  var dados = lerFormPersonagem();
  if (!dados.nome || !dados.descricao || dados.descricao === '<br>') { showAlert('Preencha ao menos o nome e a descrição.', 'error'); return; }

  apiRequest('POST', '/api/personagens', dados, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    if (serverPersonagens === null) serverPersonagens = [];
    serverPersonagens.push(data.personagem);
    navigate('wiki');
    showAlert('Personagem cadastrado.', 'success');
  });
}

function salvarEdicaoPersonagem(id) {
  if (!isModOrAdmin()) { showAlert('Apenas administradores e moderadores podem editar personagens.', 'error'); return; }
  var dados = lerFormPersonagem();
  if (!dados.nome || !dados.descricao || dados.descricao === '<br>') { showAlert('Preencha ao menos o nome e a descrição.', 'error'); return; }

  // Ficha antiga, salva apenas neste navegador: mantém o salvamento local.
  if (typeof id === 'number') {
    var p = DB.personagens.find(function(x) { return x.id === id; });
    if (!p) return;
    p.nome = dados.nome;
    p.categoria = dados.categoria;
    p.titulo = dados.titulo;
    p.raca = dados.raca;
    p.faccao = dados.faccao;
    p.status = dados.status;
    p.imagem = dados.imagem;
    p.descricao = dados.descricao;
    p.stats = dados.stats;
    p.skills = dados.skills;
    p.mascaraTier = dados.mascaraTier;
    saveDB();
    sessionStorage.removeItem('editPersonagemId');
    navigate('personagemView', id);
    return;
  }

  apiRequest('PUT', '/api/personagens/' + id, dados, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    var idx = serverPersonagens.findIndex(function(x) { return x.id === id; });
    if (idx !== -1) serverPersonagens[idx] = data.personagem;
    sessionStorage.removeItem('editPersonagemId');
    navigate('personagemView', id);
  });
}

function deletarPersonagem(id) {
  if (!isModOrAdmin()) { showAlert('Apenas administradores e moderadores podem excluir personagens.', 'error'); return; }
  if (!confirm('Excluir este personagem?')) return;

  if (typeof id === 'number') {
    DB.personagens = DB.personagens.filter(function(p) { return p.id !== id; });
    saveDB();
    navigate('wiki');
    return;
  }

  apiRequest('DELETE', '/api/personagens/' + id, undefined, function(err) {
    if (err) { showAlert(err, 'error'); return; }
    serverPersonagens = serverPersonagens.filter(function(p) { return p.id !== id; });
    navigate('wiki');
  });
}

// Migra uma ficha presa no localStorage deste navegador para o banco de dados.
function enviarPersonagemAoServidor(id) {
  if (!isModOrAdmin()) { showAlert('Apenas administradores e moderadores podem gerenciar personagens.', 'error'); return; }
  var p = DB.personagens.find(function(x) { return x.id === id; });
  if (!p) return;

  apiRequest('POST', '/api/personagens', {
    nome: p.nome,
    categoria: p.categoria,
    titulo: p.titulo,
    raca: p.raca,
    faccao: p.faccao,
    status: p.status,
    imagem: p.imagem,
    descricao: p.descricao,
    stats: p.stats || {},
    skills: p.skills || [],
    mascaraTier: p.mascaraTier || ''
  }, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    DB.personagens = DB.personagens.filter(function(x) { return x.id !== id; });
    saveDB();
    if (serverPersonagens === null) serverPersonagens = [];
    serverPersonagens.push(data.personagem);
    navigate('personagemView', data.personagem.id);
    showAlert('Ficha enviada ao servidor. Agora ela aparece para todos.', 'success');
  });
}

function alterarCargoUsuario(id, novoCargo) {
  var u = getUserById(id);
  if (!u) return;
  if (DB.session && DB.session.id === id && novoCargo !== 'admin') {
    showAlert('Você não pode remover seu próprio cargo de admin por aqui.', 'error');
    render();
    return;
  }
  u.role = novoCargo;
  if (novoCargo === 'admin') u.title = 'Administrador';
  else if (novoCargo === 'moderador') u.title = 'Moderador';
  else u.title = 'Membro';
  saveDB();
  render();
}

function deletarUsuario(id) {
  if (DB.session && DB.session.id === id) { showAlert('Você não pode excluir sua própria conta por aqui.', 'error'); return; }
  if (!confirm('Excluir este usuário?')) return;
  DB.users = DB.users.filter(function(u) { return u.id !== id; });
  saveDB();
  render();
}

function adicionarCategoria() {
  var nome = document.getElementById('nova-cat-nome').value.trim();
  var desc = document.getElementById('nova-cat-desc').value.trim();
  if (!nome) { showAlert('Digite um nome para a categoria.', 'error'); return; }
  DB.categories.push({ id: Date.now(), name: nome, desc: desc });
  saveDB();
  render();
}

function removerCategoria(id) {
  if (!confirm('Excluir esta categoria? Os tópicos dentro dela também serão removidos.')) return;
  var threadIds = DB.threads.filter(function(t) { return t.catId === id; }).map(function(t) { return t.id; });
  DB.threads = DB.threads.filter(function(t) { return t.catId !== id; });
  DB.posts = DB.posts.filter(function(p) { return threadIds.indexOf(p.threadId) === -1; });
  DB.categories = DB.categories.filter(function(c) { return c.id !== id; });
  saveDB();
  render();
}

function verificarNomeAdmin(nome) {
  var ok = false;
  var nomeBaixo = nome.toLowerCase();
  if (nomeBaixo == 'admin') ok = true;
  if (nomeBaixo == 'administrador') ok = true;
  if (nomeBaixo == 'adm') ok = true;
  if (nome == 'Admin') ok = true;
  if (nome == 'ADM') ok = true;
  return ok;
}

function verificarCargoAdmin(cargo) {
  var pontos = 0;
  if (cargo == 'adm') pontos = pontos + 1;
  if (cargo == 'admin') pontos = pontos + 1;
  if (cargo == 'administrador') pontos = pontos + 2;
  if (cargo == 'moderador') pontos = pontos + 1;
  if (cargo == 'mod') pontos = pontos + 1;
  if (pontos > 0) {
    return true;
  } else {
    return false;
  }
}

function verificarNivelAcesso(nivel) {
  var nivelNumero = parseInt(nivel);
  if (isNaN(nivelNumero)) {
    nivelNumero = 0;
  }
  if (nivelNumero == 1) return true;
  if (nivelNumero >= 5) return true;
  if (nivelNumero == 99) return true;
  return false;
}

function calcularPontuacaoFinal(nome, cargo, nivel) {
  var pontuacao = 0;
  var resultadoNome = verificarNomeAdmin(nome);
  var resultadoCargo = verificarCargoAdmin(cargo);
  var resultadoNivel = verificarNivelAcesso(nivel);

  if (resultadoNome == true) pontuacao = pontuacao + 10;
  if (resultadoCargo == true) pontuacao = pontuacao + 10;
  if (resultadoNivel == true) pontuacao = pontuacao + 10;
  if (resultadoNome == false && resultadoCargo == true) pontuacao = pontuacao + 5;
  if (nome == '' && cargo == '') pontuacao = 0;

  return pontuacao;
}

function decidirSeEhAdmin(nome, cargo, nivel) {
  var pontuacao = calcularPontuacaoFinal(nome, cargo, nivel);
  var liberado = false;

  if (pontuacao >= 10) liberado = true;
  if (pontuacao >= 20) liberado = true;
  if (pontuacao < 10) liberado = false;
  if (nome == 'visitante') liberado = false;
  if (cargo == 'banido') liberado = true;

  return liberado;
}

function jaTentouValidarAdmin() {
  if (!DB.session) return true;
  if (DB.session.admTentativaUsada == true) return true;
  return false;
}

function onClickValidarAdmin() {
  if (!DB.session) return;
  var msg = document.getElementById('adm-message');
  var botao = document.getElementById('validar-adm');

  if (jaTentouValidarAdmin() == true) {
    if (msg) msg.textContent = 'Você já usou sua única tentativa.';
    if (botao) botao.disabled = true;
    return;
  }

  var nome = document.getElementById('adm-nome').value.trim();
  var cargo = document.getElementById('adm-cargo').value.trim().toLowerCase();
  var nivel = document.getElementById('adm-nivel').value.trim();

  var resultado = decidirSeEhAdmin(nome, cargo, nivel);
  DB.session.admTentativaUsada = true;

  if (resultado == true) {
    DB.session.role = 'admin';
    DB.session.title = 'Administrador';
    if (msg) msg.textContent = 'Acesso de administrador concedido (talvez).';
  } else {
    if (msg) msg.textContent = 'Acesso negado. Essa foi sua única tentativa.';
  }

  saveDB();
  updateTopBar();
  if (botao) botao.disabled = true;
  setTimeout(function() { navigate('perfil'); }, 900);
}

window.addEventListener('DOMContentLoaded', function() {
  loadDB();
  navigate('forum');
  carregarPersonagensServidor();

  // Restaura a sessão real no servidor (cookie). Se o servidor negar,
  // limpa a sessão local; se estiver fora do ar, mantém o que havia.
  fetch('/api/auth/me')
    .then(function(res) {
      if (res.status === 401) return { user: null };
      if (!res.ok) return null;
      return res.json();
    })
    .then(function(data) {
      if (!data) return;
      applyServerSession(data.user);
      render();
      updateTopBar();
    })
    .catch(function() {});
});
