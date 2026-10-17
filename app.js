var DB = {
  users: [
    { id: 1, username: 'Admin', email: 'admin@forum.com', avatar: '', title: 'Administrador', posts: 0, role: 'admin', bio: '', joinDate: '01/01/2026', admTentativaUsada: false },
    { id: 2, username: 'MandRaiden', email: 'mandraiden@forum.com', avatar: '', title: 'Dono do aetherverse vault', posts: 0, role: 'admin', bio: 'Criador e dono do aetherverse vault.', joinDate: '01/01/2026', admTentativaUsada: true },
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
      content: '<p>A alpha da Wikia do aetherverse vault foi oficialmente disponibilizada para uso público. O módulo de cadastro de fichas já está habilitado, contudo trata-se de uma build inicial, ainda em estágio preliminar de maturação técnica. Segue o levantamento das pendências estruturais do sistema:</p>' +
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

  wikiPosts: [],
  nextWikiPostId: 1,

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
      if (parsed && parsed.nextUserId) {
        DB = parsed;
      }
    }
  } catch (e) {}

  if (!Array.isArray(DB.wikiPosts)) {
    DB.wikiPosts = [];
  } else {
    DB.wikiPosts = DB.wikiPosts.filter(function(w) { return w && w.id !== 101; });
  }
  if (!DB.nextWikiPostId) DB.nextWikiPostId = 1;

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
  return DB.users.find(function(u) { return String(u.id) === String(id) || (u.serverId && String(u.serverId) === String(id)); });
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

function roleBadgeFromRole(role) {
  if (role === 'admin') return '<span class="admin-badge">ADMIN</span>';
  if (role === 'moderador') return '<span class="mod-badge">MODERADOR</span>';
  return '<span class="member-badge">MEMBRO</span>';
}

function podeEditarThread(authorId) {
  if (!DB.session) return false;
  if (isModOrAdmin()) return true;
  if (DB.session.id === authorId) return true;
  return false;
}

function podeEditarPost(authorId) {
  return podeEditarThread(authorId);
}

function podeEditarTurno(turno) {
  if (!DB.session || !turno) return false;
  if (isModOrAdmin()) return true;
  if (String(turno.authorId) === String(DB.session.id)) return true;
  if (DB.session.serverId && String(turno.authorId) === String(DB.session.serverId)) return true;
  if (turno.authorName && DB.session.username && turno.authorName.toLowerCase() === DB.session.username.toLowerCase()) return true;
  return false;
}

function bumpPosts() {
  if (!DB.session) return;
  DB.session.posts = (DB.session.posts || 0) + 1;
}

function countWordsFromHtml(html) {
  var plain = String(html || '').replace(/<[^>]+>/g, ' ').trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

function calcStatTotal(stats) {
  if (!stats) return 0;
  var sum = 0;
  for (var i = 0; i < STAT_KEYS.length; i++) {
    sum += (parseInt(stats[STAT_KEYS[i]], 10) || 0);
  }
  return sum;
}

var currentPage = 'forum';
var currentThread = null;
var currentCat = null;
var currentPersonagem = null;
var currentCena = null;
var editandoThread = null;

// Filtros de UI
var forumFilterSearch = '';
var forumFilterTag = 'all';
var wikiFilterSearch = '';
var wikiFilterCat = 'all';
var wikiFilterRaca = 'all';
var wikiSortBy = 'default';
var cenasFilterSearch = '';
var cenasFilterCat = 'all';
var cenasFilterStatus = 'all';
var turnSortOrder = 'asc';

function navigate(page, extra) {
  currentPage = page;
  if (extra !== undefined) {
    if (page === 'thread') currentThread = extra;
    if (page === 'cat') currentCat = extra;
    if (page === 'personagemView') currentPersonagem = extra;
    if (page === 'cenaView') currentCena = extra;
  }
  document.querySelectorAll('#nav-bar button').forEach(function(b) { b.classList.remove('active'); });
  var navMap = {
    forum: 'nav-forum', cat: 'nav-forum', thread: 'nav-forum', novaThread: 'nav-forum',
    wiki: 'nav-wiki', personagemView: 'nav-wiki', novoPersonagem: 'nav-wiki',
    cenas: 'nav-cenas', cenaView: 'nav-cenas', novaCena: 'nav-cenas',
    sobre: 'nav-sobre',
    perfil: null, registro: null, admin: null
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
    info.innerHTML = '<span class="online-dot"></span><a onclick="navigate(\'perfil\')" style="font-weight:600;color:#fff;">' + h(DB.session.username) + '</a> ' + badgeHtml(DB.session);
    actions.innerHTML = '<a onclick="navigate(\'perfil\')">Perfil</a><a onclick="doLogout()">Sair</a>';
    if (isAdmin()) {
      adminBtn.innerHTML = '<button onclick="navigate(\'admin\')" class="' + (currentPage === 'admin' ? 'active' : '') + '">Admin</button>';
    } else {
      adminBtn.innerHTML = '';
    }
  } else {
    info.innerHTML = '<span>Visitante</span>';
    actions.innerHTML = '<a onclick="showLoginModal()">Entrar</a><a onclick="navigate(\'registro\')">Criar Conta</a>';
    adminBtn.innerHTML = '';
  }
}

function openLightbox(url, caption) {
  if (!url) return;
  var c = document.getElementById('lightbox-container');
  if (!c) return;
  c.innerHTML = '<div class="lightbox-overlay" onclick="closeLightbox()">' +
    '<img src="' + ha(url) + '" alt="Imagem ampliada">' +
    (caption ? '<div class="lightbox-caption">' + h(caption) + '</div>' : '') +
    '</div>';
}

function closeLightbox() {
  var c = document.getElementById('lightbox-container');
  if (c) c.innerHTML = '';
}

function switchModTab(btnEl, paneId) {
  var nav = btnEl.parentNode;
  var block = nav.parentNode;
  nav.querySelectorAll('.mod-tab-btn').forEach(function(b) { b.classList.remove('active'); });
  block.querySelectorAll('.mod-tab-pane').forEach(function(p) { p.classList.remove('active'); });
  btnEl.classList.add('active');
  var target = document.getElementById(paneId);
  if (target) target.classList.add('active');
}

function openUserProfileModal(userId) {
  var u = getUserById(userId);
  if (!u) return;
  var initials = (u.username || '??').substring(0, 2).toUpperCase();
  var uThreads = DB.threads.filter(function(t) { return String(t.authorId) === String(u.id); });
  var html = '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">';
  if (u.avatar) {
    html += '<img src="' + ha(u.avatar) + '" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:1px solid var(--border-medium);">';
  } else {
    html += '<div style="width:64px;height:64px;border-radius:50%;background:#111;border:1px solid var(--border-medium);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;color:#fff;">' + h(initials) + '</div>';
  }
  html += '<div><h3 style="font-size:16px;color:#fff;margin-bottom:4px;">' + h(u.username) + ' ' + badgeHtml(u) + '</h3>';
  html += '<div style="font-size:12px;color:var(--text-secondary);">' + h(u.title || 'Membro') + ' &middot; Desde ' + h(u.joinDate || '2026') + '</div></div></div>';
  if (u.bio) {
    html += '<div style="padding:12px;background:#0c0c0c;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);font-size:12.5px;color:var(--text-secondary);margin-bottom:14px;">' + h(u.bio) + '</div>';
  }
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Tópicos criados (' + uThreads.length + ')</div>';
  if (uThreads.length) {
    html += '<div style="display:flex;flex-direction:column;gap:6px;">';
    uThreads.slice(0, 6).forEach(function(t) {
      html += '<a onclick="closeModal();navigate(\'thread\',' + t.id + ')" style="padding:8px 10px;background:#0c0c0c;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);font-size:12.5px;">' + h(t.title) + '</a>';
    });
    html += '</div>';
  } else {
    html += '<div style="font-size:12px;color:var(--text-muted);">Nenhum tópico publicado.</div>';
  }
  showModal('Perfil de ' + u.username, html);
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
    cenas: renderCenas,
    cenaView: renderCenaView,
    novaCena: renderNovaCena,
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

// ==================== FÓRUM ====================

function onForumFilterChange() {
  var sEl = document.getElementById('forum-search-input');
  var tEl = document.getElementById('forum-tag-select');
  if (sEl) forumFilterSearch = sEl.value;
  if (tEl) forumFilterTag = tEl.value;
  render();
  var sAfter = document.getElementById('forum-search-input');
  if (sAfter) {
    sAfter.focus();
    sAfter.setSelectionRange(sAfter.value.length, sAfter.value.length);
  }
}

function renderForum() {
  var html = '<div class="breadcrumb">Início / Fórum</div>';

  html += '<div class="filter-bar">';
  html += '<input type="text" id="forum-search-input" value="' + ha(forumFilterSearch) + '" placeholder="Pesquisar tópicos por título ou conteúdo..." oninput="onForumFilterChange()">';
  html += '<select id="forum-tag-select" onchange="onForumFilterChange()">';
  html += '<option value="all"' + (forumFilterTag === 'all' ? ' selected' : '') + '>Todas as Tags</option>';
  html += '<option value="ooc"' + (forumFilterTag === 'ooc' ? ' selected' : '') + '>OOC</option>';
  html += '<option value="rp"' + (forumFilterTag === 'rp' ? ' selected' : '') + '>RP</option>';
  html += '<option value="wiki"' + (forumFilterTag === 'wiki' ? ' selected' : '') + '>Wiki</option>';
  html += '</select>';
  if (DB.session) {
    html += '<button class="btn btn-primary" onclick="startNewThread(1)">+ Novo Tópico</button>';
  }
  html += '</div>';

  if (forumFilterSearch.trim() || forumFilterTag !== 'all') {
    var q = forumFilterSearch.toLowerCase().trim();
    var matched = DB.threads.filter(function(t) {
      if (forumFilterTag !== 'all' && (t.tag || 'ooc') !== forumFilterTag) return false;
      if (q) {
        var inTitle = (t.title || '').toLowerCase().indexOf(q) !== -1;
        var inPosts = DB.posts.some(function(p) { return p.threadId === t.id && (p.content || '').toLowerCase().indexOf(q) !== -1; });
        if (!inTitle && !inPosts) return false;
      }
      return true;
    });
    html += '<div class="cat-header"><span>Resultados da Busca (' + matched.length + ')</span><a class="btn btn-small" onclick="forumFilterSearch=\'\';forumFilterTag=\'all\';render()">Limpar Filtro</a></div>';
    html += '<table class="forum-table"><thead><tr><th>Tópico</th><th>Autor</th><th>Respostas</th><th>Views</th></tr></thead><tbody>';
    if (!matched.length) {
      html += '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">Nenhum tópico encontrado.</td></tr>';
    }
    matched.forEach(function(t) {
      var author = getUserById(t.authorId);
      var replies = Math.max(0, DB.posts.filter(function(p) { return p.threadId === t.id; }).length - 1);
      html += '<tr><td>';
      if (t.pinned) html += '<span class="pin">FIXADO</span> ';
      if (t.locked) html += '<span class="tag">TRANCADO</span> ';
      html += '<span class="tag">' + (t.tag || 'ooc').toUpperCase() + '</span> ';
      html += '<a onclick="navigate(\'thread\',' + t.id + ')" style="font-weight:600;color:#fff;">' + h(t.title) + '</a></td>';
      html += '<td>' + (author ? '<a onclick="openUserProfileModal(' + author.id + ')">' + h(author.username) + '</a>' : '?') + '</td>';
      html += '<td>' + replies + '</td><td>' + (t.views || 0) + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  DB.categories.forEach(function(cat) {
    var catThreads = DB.threads.filter(function(t) { return t.catId === cat.id; });
    var catPosts = 0;
    catThreads.forEach(function(t) { catPosts += DB.posts.filter(function(p) { return p.threadId === t.id; }).length; });
    var lastThread = catThreads.length ? catThreads[catThreads.length - 1] : null;
    var lastInfo = lastThread ? ('<a onclick="navigate(\'thread\',' + lastThread.id + ')" style="font-weight:500;">' + h(lastThread.title.substring(0, 38)) + (lastThread.title.length > 38 ? '...' : '') + '</a><br><small style="color:var(--text-muted);">' + lastThread.date + '</small>') : '<span style="color:var(--text-muted);">Nenhum tópico</span>';

    html += '<div class="cat-header"><span>' + h(cat.name) + '</span>';
    if (DB.session) html += '<button class="btn btn-small" onclick="startNewThread(' + cat.id + ')">+ Novo Tópico</button>';
    html += '</div>';
    html += '<table class="forum-table"><thead><tr><th style="width:48%">Categoria</th><th>Tópicos</th><th>Posts</th><th>Última Atividade</th></tr></thead><tbody>';
    html += '<tr><td><a onclick="navigate(\'cat\',' + cat.id + ')" style="font-weight:600;font-size:14px;color:#fff;">' + h(cat.name) + '</a><br><small style="color:var(--text-secondary);">' + h(cat.desc) + '</small></td>';
    html += '<td><b>' + catThreads.length + '</b></td><td>' + catPosts + '</td><td style="font-size:12px;">' + lastInfo + '</td></tr>';
    html += '</tbody></table>';
  });

  var totalPosts = DB.posts.length;
  var totalThreads = DB.threads.length;
  var totalUsers = DB.users.length;
  var totalCenas = listaWikiPosts().length;
  html += '<div class="stats-bar"><span><b>' + totalPosts + '</b> posts</span><span><b>' + totalThreads + '</b> tópicos</span><span><b>' + listaPersonagens().length + '</b> personagens</span><span><b>' + totalCenas + '</b> cenas</span><span><b>' + totalUsers + '</b> membros</span>';
  if (DB.session) html += '<span><span class="online-dot"></span><b>' + h(DB.session.username) + '</b> online</span>';
  html += '</div>';
  return html;
}

function renderCat() {
  var cat = DB.categories.find(function(c) { return c.id === currentCat; });
  if (!cat) return '<p>Categoria não encontrada.</p>';
  var threads = DB.threads.filter(function(t) { return t.catId === currentCat; });
  threads.sort(function(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id; });

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> / ' + h(cat.name) + '</div>';
  html += '<div class="cat-header"><span>' + h(cat.name) + '</span>';
  if (DB.session) html += '<button class="btn btn-small btn-primary" onclick="startNewThread(' + cat.id + ')">+ Novo Tópico</button>';
  html += '</div>';
  html += '<table class="forum-table"><thead><tr><th>Tópico</th><th>Autor</th><th>Respostas</th><th>Views</th><th>Último Post</th></tr></thead><tbody>';

  if (!threads.length) {
    html += '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:28px;">Nenhum tópico ainda. <a onclick="startNewThread(' + cat.id + ')">Criar o primeiro</a></td></tr>';
  }

  threads.forEach(function(t) {
    var author = getUserById(t.authorId);
    var replies = Math.max(0, DB.posts.filter(function(p) { return p.threadId === t.id; }).length - 1);
    var tagClass = 'tag-' + (t.tag || 'ooc');
    var lastPost = DB.posts.filter(function(p) { return p.threadId === t.id; });
    var lastPostDate = lastPost.length ? lastPost[lastPost.length - 1].date : t.date;
    html += '<tr><td>';
    if (t.pinned) html += '<span class="pin">FIXADO</span> ';
    if (t.locked) html += '<span class="tag">TRANCADO</span> ';
    html += '<span class="tag ' + tagClass + '">' + (t.tag || 'ooc').toUpperCase() + '</span> ';
    html += '<a onclick="navigate(\'thread\',' + t.id + ')" style="font-weight:600;color:#fff;">' + h(t.title) + '</a>';
    html += '</td><td>' + (author ? '<a onclick="openUserProfileModal(' + author.id + ')">' + h(author.username) + '</a>' : '?') + '</td>';
    html += '<td>' + replies + '</td><td>' + (t.views || 0) + '</td>';
    html += '<td style="font-size:12px;color:var(--text-muted);">' + lastPostDate + '</td></tr>';
  });

  html += '</tbody></table>';
  return html;
}

function togglePinThread(threadId) {
  if (!isModOrAdmin()) return;
  var thr = DB.threads.find(function(t) { return t.id === threadId; });
  if (!thr) return;
  thr.pinned = !thr.pinned;
  saveDB();
  render();
  showAlert(thr.pinned ? 'Tópico fixado.' : 'Tópico desafixado.', 'success');
}

function toggleLockThread(threadId) {
  if (!isModOrAdmin()) return;
  var thr = DB.threads.find(function(t) { return t.id === threadId; });
  if (!thr) return;
  thr.locked = !thr.locked;
  saveDB();
  render();
  showAlert(thr.locked ? 'Tópico trancado.' : 'Tópico destrancado.', 'success');
}

function renderThread() {
  var thread = DB.threads.find(function(t) { return t.id === currentThread; });
  if (!thread) return '<p>Tópico não encontrado.</p>';
  var cat = DB.categories.find(function(c) { return c.id === thread.catId; });
  thread.views = (thread.views || 0) + 1;
  saveDB();

  var posts = DB.posts.filter(function(p) { return p.threadId === currentThread; });
  var tagClass = 'tag-' + (thread.tag || 'ooc');

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> / <a onclick="navigate(\'cat\',' + thread.catId + ')">' + h(cat ? cat.name : '') + '</a> / ' + h(thread.title) + '</div>';
  html += '<div class="thread-tools">';
  html += '<h2>';
  if (thread.pinned) html += '<span class="pin">FIXADO</span>';
  if (thread.locked) html += '<span class="tag">TRANCADO</span>';
  html += '<span class="tag ' + tagClass + '">' + (thread.tag || 'ooc').toUpperCase() + '</span> ' + h(thread.title) + '</h2>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
  if (isModOrAdmin()) {
    html += '<button class="btn btn-small" onclick="togglePinThread(' + thread.id + ')">' + (thread.pinned ? 'Desafixar' : 'Fixar') + '</button>';
    html += '<button class="btn btn-small" onclick="toggleLockThread(' + thread.id + ')">' + (thread.locked ? 'Destrancar' : 'Trancar') + '</button>';
  }
  if (podeEditarThread(thread.authorId)) {
    html += '<button class="btn btn-warn btn-small" onclick="editarThread(' + thread.id + ')">Editar</button>';
    html += '<button class="btn btn-danger btn-small" onclick="deleteThread(' + thread.id + ')">Excluir Tópico</button>';
  }
  html += '</div></div>';

  posts.forEach(function(post, idx) {
    var author = getUserById(post.authorId);
    var initials = author ? author.username.substring(0, 2).toUpperCase() : '??';
    var avatarHtml = (author && author.avatar) ? '<img src="' + ha(author.avatar) + '">' : initials;
    var cargoHtml = '<div>' + badgeHtml(author) + '</div>';

    html += '<div class="post-box">';
    html += '<div class="post-header"><div class="post-meta"><span class="post-number">#' + (idx + 1) + '</span><strong style="color:#fff;">' + (author ? '<a onclick="openUserProfileModal(' + author.id + ')">' + h(author.username) + '</a>' : '?') + '</strong></div><div class="post-meta"><span class="post-date">' + post.date + '</span>' + (post.edited ? '<span class="tag">editado</span>' : '') + '</div></div>';
    html += '<div class="post-body">';
    html += '<div class="post-user-panel"><div class="avatar">' + avatarHtml + '</div><div class="username">' + (author ? '<a onclick="openUserProfileModal(' + author.id + ')">' + h(author.username) + '</a>' : '?') + '</div><div class="user-title">' + (author ? h(author.title) : '') + '</div><div class="user-posts">Posts: ' + (author ? author.posts : 0) + '</div>' + cargoHtml + '</div>';
    html += '<div class="post-content">' + formatPost(post.content) + '</div>';
    html += '</div>';
    html += '<div class="post-footer"><div class="post-actions">';
    if (DB.session) {
      if (!thread.locked || isModOrAdmin()) {
        html += '<a onclick="quotePost(' + post.id + ')">Citar</a>';
      }
      if (podeEditarPost(post.authorId)) {
        html += '<a onclick="editPost(' + post.id + ')">Editar</a>';
        html += '<a class="danger-link" onclick="deletePost(' + post.id + ')">Excluir</a>';
      }
    }
    html += '</div></div></div>';
  });

  if (thread.locked && !isModOrAdmin()) {
    html += '<div class="alert alert-info" style="margin-top:14px;"><span>Este tópico está trancado e não recebe novas respostas.</span></div>';
  } else if (DB.session) {
    html += '<div class="reply-box">';
    html += '<div class="reply-title"><span>Responder ao Tópico</span><span style="color:var(--accent-light);">' + h(DB.session.username) + '</span></div>';
    html += '<div class="reply-inner">';
    html += buildEditor('reply-editor', '');
    html += '<div style="margin-top:12px;"><button class="btn btn-primary" onclick="submitReply()">Enviar Resposta</button></div>';
    html += '</div></div>';
  } else {
    html += '<div class="alert alert-info" style="margin-top:14px;"><span>Faça login para participar e responder neste tópico.</span><a class="btn btn-small btn-primary" onclick="showLoginModal()">Entrar</a></div>';
  }

  return html;
}

function renderNovaThread() {
  if (!DB.session) return '<div class="alert alert-error">Você precisa estar logado.</div>';
  var selCat = currentCat || 1;
  var isEdit = editandoThread !== null;
  var thr = isEdit ? DB.threads.find(function(t) { return t.id === editandoThread; }) : null;
  var priPost = isEdit ? DB.posts.find(function(p) { return p.threadId === editandoThread; }) : null;

  var html = '<div class="breadcrumb"><a onclick="navigate(\'forum\')">Fórum</a> / ' + (isEdit ? 'Editar Tópico' : 'Novo Tópico') + '</div>';
  html += '<div class="cat-header"><span>' + (isEdit ? 'Editar Tópico' : 'Criar Novo Tópico') + '</span></div>';
  html += '<div class="builder-panel">';

  if (!isEdit) {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">';
    html += '<div class="form-row"><label>Categoria</label><select id="thread-cat">';
    DB.categories.forEach(function(c) {
      html += '<option value="' + c.id + '"' + (c.id === selCat ? ' selected' : '') + '>' + h(c.name) + '</option>';
    });
    html += '</select></div>';
    html += '<div class="form-row"><label>Tipo</label><select id="thread-tag"><option value="ooc">OOC (Discussão fora do personagem)</option><option value="rp">RP (Cena de Roleplay)</option><option value="wiki">Wiki / Lore</option></select></div>';
    html += '</div>';
  }

  html += '<div class="form-row"><label>Título</label><input type="text" id="thread-title" value="' + (thr ? ha(thr.title) : '') + '" placeholder="Título do tópico"></div>';
  html += '<div class="form-row"><label>Conteúdo</label>';
  html += buildEditor('thread-editor', priPost ? priPost.content : '');
  html += '</div>';
  html += '<div style="display:flex;gap:10px;margin-top:12px;">';
  if (isEdit) {
    html += '<button class="btn btn-primary" onclick="salvarEdicaoThread()">Salvar Alterações</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="submitThread()">Publicar Tópico</button>';
  }
  html += '<button class="btn" onclick="navigate(\'forum\')">Cancelar</button></div>';
  html += '</div>';
  return html;
}

// ==================== PERSONAGENS (WIKI) ====================

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

function listaPersonagens() {
  if (serverPersonagens === null) return DB.personagens;
  var nomes = {};
  serverPersonagens.forEach(function(p) { nomes[p.nome.toLowerCase()] = true; });
  var locais = DB.personagens.filter(function(p) { return !nomes[p.nome.toLowerCase()]; });
  return serverPersonagens.concat(locais);
}

function personagemLocalApenas(p) {
  return serverPersonagens !== null && typeof p.id === 'number';
}

function idJs(id) {
  return typeof id === 'number' ? id : "'" + String(id).replace(/'/g, "\\'") + "'";
}

function renderCharCard(p) {
  var accent = (p.theme && p.theme.accentColor) ? p.theme.accentColor : '';
  var cardStyle = accent ? ' style="border-top: 2px solid ' + ha(accent) + ';"' : '';
  var totalAttr = calcStatTotal(p.stats);

  var html = '<div class="char-card"' + cardStyle + ' onclick="navigate(\'personagemView\',' + idJs(p.id) + ')">';
  if (p.imagem) {
    html += '<img class="thumb" src="' + ha(p.imagem) + '" alt="' + ha(p.nome) + '">';
  } else {
    html += '<div class="thumb-ph">' + h(p.nome.substring(0, 1)) + '</div>';
  }
  html += '<div class="char-card-info"><h4>' + h(p.nome) + (p.titulo ? ' <em>&middot; ' + h(p.titulo) + '</em>' : '') + '</h4>';
  html += '<p style="margin-bottom:6px;display:flex;gap:5px;flex-wrap:wrap;"><span class="tag">' + h(p.raca || 'Desconhecido') + '</span>';
  if (p.faccao) html += '<span class="tag">' + h(p.faccao) + '</span>';
  if (p.status) html += '<span class="tag">' + h(p.status) + '</span>';
  if (totalAttr > 0) html += '<span class="tag">' + totalAttr + ' PTS</span>';
  html += '</p>';
  var descTexto = (p.descricao || '').replace(/<[^>]+>/g, '').substring(0, 125);
  html += '<p>' + h(descTexto) + '...</p>';
  html += '</div></div>';
  return html;
}

function onWikiFilterChange() {
  var sEl = document.getElementById('wiki-search-input');
  var cEl = document.getElementById('wiki-cat-select');
  var rEl = document.getElementById('wiki-raca-select');
  var sortEl = document.getElementById('wiki-sort-select');
  if (sEl) wikiFilterSearch = sEl.value;
  if (cEl) wikiFilterCat = cEl.value;
  if (rEl) wikiFilterRaca = rEl.value;
  if (sortEl) wikiSortBy = sortEl.value;
  render();
  var sElAfter = document.getElementById('wiki-search-input');
  if (sElAfter) {
    sElAfter.focus();
    sElAfter.setSelectionRange(sElAfter.value.length, sElAfter.value.length);
  }
}

function renderWiki() {
  var allChars = listaPersonagens();
  var racas = [];
  allChars.forEach(function(p) {
    if (p.raca && racas.indexOf(p.raca) === -1) racas.push(p.raca);
  });

  var html = '<div class="breadcrumb">Início / Personagens</div>';
  html += '<div class="cat-header"><span>Personagens (' + allChars.length + ')</span>';
  if (isModOrAdmin()) {
    html += '<button class="btn btn-small btn-primary" onclick="sessionStorage.removeItem(\'editPersonagemId\');navigate(\'novoPersonagem\')">+ Novo Personagem</button>';
  }
  html += '</div>';

  html += '<div class="filter-bar">';
  html += '<input type="text" id="wiki-search-input" value="' + ha(wikiFilterSearch) + '" placeholder="Buscar por nome, título, raça ou facção..." oninput="onWikiFilterChange()">';
  html += '<select id="wiki-cat-select" onchange="onWikiFilterChange()">';
  html += '<option value="all"' + (wikiFilterCat === 'all' ? ' selected' : '') + '>Todas as Categorias</option>';
  html += '<option value="Personagem Principal"' + (wikiFilterCat === 'Personagem Principal' ? ' selected' : '') + '>Principais</option>';
  html += '<option value="Sub-Personagem"' + (wikiFilterCat === 'Sub-Personagem' ? ' selected' : '') + '>Sub-Personagens</option>';
  html += '</select>';
  html += '<select id="wiki-raca-select" onchange="onWikiFilterChange()">';
  html += '<option value="all"' + (wikiFilterRaca === 'all' ? ' selected' : '') + '>Todas as Raças</option>';
  racas.forEach(function(r) {
    html += '<option value="' + ha(r) + '"' + (wikiFilterRaca === r ? ' selected' : '') + '>' + h(r) + '</option>';
  });
  html += '</select>';
  html += '<select id="wiki-sort-select" onchange="onWikiFilterChange()">';
  html += '<option value="default"' + (wikiSortBy === 'default' ? ' selected' : '') + '>Ordem Padrão</option>';
  html += '<option value="az"' + (wikiSortBy === 'az' ? ' selected' : '') + '>Ordem Alfabética (A-Z)</option>';
  html += '<option value="stats"' + (wikiSortBy === 'stats' ? ' selected' : '') + '>Maior Total de Atributos</option>';
  html += '</select>';
  html += '</div>';

  var lista = allChars.filter(function(p) {
    if (wikiFilterCat !== 'all' && p.categoria !== wikiFilterCat) return false;
    if (wikiFilterRaca !== 'all' && p.raca !== wikiFilterRaca) return false;
    if (wikiFilterSearch.trim()) {
      var q = wikiFilterSearch.toLowerCase();
      var hay = ((p.nome || '') + ' ' + (p.titulo || '') + ' ' + (p.raca || '') + ' ' + (p.faccao || '')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  if (wikiSortBy === 'az') {
    lista.sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });
  } else if (wikiSortBy === 'stats') {
    lista.sort(function(a, b) { return calcStatTotal(b.stats) - calcStatTotal(a.stats); });
  }

  var principais = lista.filter(function(p) { return p.categoria !== 'Sub-Personagem'; });
  var subPersonagens = lista.filter(function(p) { return p.categoria === 'Sub-Personagem'; });

  if (principais.length) {
    html += '<div class="cat-header" style="margin-top:8px;"><span>Personagens Principais (' + principais.length + ')</span></div>';
    html += '<div class="char-grid">';
    principais.forEach(function(p) { html += renderCharCard(p); });
    html += '</div>';
  }

  if (subPersonagens.length) {
    html += '<div class="cat-header" style="margin-top:18px;"><span>Sub-Personagens (' + subPersonagens.length + ')</span></div>';
    html += '<div class="char-grid">';
    subPersonagens.forEach(function(p) { html += renderCharCard(p); });
    html += '</div>';
  }

  if (!lista.length) {
    html += '<div style="text-align:center;padding:40px;color:var(--text-muted);background:var(--bg-surface);border-radius:var(--radius-lg);border:1px solid var(--border-subtle);">Nenhum personagem encontrado com esses filtros.</div>';
  }

  return html;
}

function renderPersonagemView() {
  var lista = listaPersonagens();
  var p = lista.find(function(x) { return String(x.id) === String(currentPersonagem); });
  if (!p && typeof currentPersonagem === 'number') {
    var seed = DB.personagens.find(function(x) { return x.id === currentPersonagem; });
    if (seed) {
      p = lista.find(function(x) { return x.nome.toLowerCase() === seed.nome.toLowerCase(); });
    }
  }
  if (!p) return '<p>Personagem não encontrado.</p>';
  var theme = p.theme || {};
  var pageAccent = theme.accentColor || '#ffffff';

  var html = '<div class="breadcrumb"><a onclick="navigate(\'wiki\')">Personagens</a> / ' + h(p.nome) + '</div>';

  html += '<div class="custom-wiki-page' + (theme.fontFamily ? ' font-' + ha(theme.fontFamily) : '') + (theme.bgEffect ? ' bg-' + ha(theme.bgEffect) : '') + '" style="--page-accent:' + ha(pageAccent) + ';--page-accent-light:' + ha(pageAccent) + ';">';

  html += '<div class="char-sheet-head">';
  html += '<h2>' + h(p.nome) + (p.titulo ? ' <em>&mdash; ' + h(p.titulo) + '</em>' : '') + '</h2>';
  if (isModOrAdmin()) {
    html += '<div style="display:flex;gap:8px;"><button class="btn btn-warn btn-small" onclick="editarPersonagem(' + idJs(p.id) + ')">Editar Ficha</button><button class="btn btn-danger btn-small" onclick="deletarPersonagem(' + idJs(p.id) + ')">Excluir</button></div>';
  }
  html += '</div>';

  if (personagemLocalApenas(p)) {
    html += '<div class="alert alert-info"><span>Esta ficha está salva apenas neste navegador — outras pessoas ainda não a veem.</span>';
    if (isModOrAdmin()) {
      html += ' <button class="btn btn-small btn-primary" onclick="enviarPersonagemAoServidor(' + p.id + ')">Sincronizar com Servidor</button>';
    }
    html += '</div>';
  }

  html += '<div class="char-sheet-grid">';
  html += '<div class="char-sheet-card">';
  html += '<div class="char-sheet-card-title">' + h(p.nome) + '</div>';
  if (p.imagem) html += '<div class="char-sheet-portrait" onclick="openLightbox(\'' + ha(p.imagem) + '\',\'' + ha(p.nome) + '\')" style="cursor:zoom-in;"><img src="' + ha(p.imagem) + '"></div>';
  html += '<table>';
  if (p.categoria) html += '<tr><td><b>Categoria</b></td><td>' + h(p.categoria) + '</td></tr>';
  if (p.titulo) html += '<tr><td><b>Título</b></td><td>' + h(p.titulo) + '</td></tr>';
  if (p.raca) html += '<tr><td><b>Raça</b></td><td>' + h(p.raca) + '</td></tr>';
  if (p.faccao) html += '<tr><td><b>Facção</b></td><td>' + h(p.faccao) + '</td></tr>';
  if (p.status) html += '<tr><td><b>Status</b></td><td style="color:#ffffff;font-weight:600;">' + h(p.status) + '</td></tr>';
  html += '</table>';
  if (p.mascaraTier) html += '<div class="tier-badge">A Máscara: <b>' + h(p.mascaraTier) + '</b></div>';
  html += '</div>';

  html += '<div class="wiki-content-area">';
  html += '<div class="char-sheet-body">' + p.descricao + '</div>';

  if (Array.isArray(p.blocks) && p.blocks.length) {
    html += renderModularBlocks(p.blocks, 'char-' + p.id);
  }
  html += '</div>';
  html += '</div>';

  if (p.skills && p.skills.length) {
    var skillCards = p.skills.filter(function(sk) { return sk.tipo !== 'equipamento'; });
    var equipCards = p.skills.filter(function(sk) { return sk.tipo === 'equipamento'; });
    if (skillCards.length) {
      html += '<div class="cat-header" style="margin-top:24px;"><span>Habilidades &amp; Técnicas (' + skillCards.length + ')</span></div>';
      html += '<div class="skill-grid">';
      skillCards.forEach(function(sk) {
        html += '<div class="skill-item"><h4>' + h(sk.nome) + '</h4><p>' + h(sk.descricao) + '</p></div>';
      });
      html += '</div>';
    }
    if (equipCards.length) {
      html += '<div class="cat-header" style="margin-top:24px;"><span>Equipamentos &amp; Artefatos (' + equipCards.length + ')</span></div>';
      html += '<div class="skill-grid">';
      equipCards.forEach(function(sk) {
        html += '<div class="skill-item equip-item"><h4>' + h(sk.nome) + '</h4><p>' + h(sk.descricao) + '</p></div>';
      });
      html += '</div>';
    }
  }

  if (statsPreenchidos(p.stats)) {
    var totalPts = calcStatTotal(p.stats);
    var avgPts = (totalPts / STAT_KEYS.length).toFixed(1);
    html += '<div class="cat-header" style="margin-top:24px;"><span>Matriz de Atributos</span><span style="font-size:12px;color:var(--text-secondary);font-weight:400;">Total: <b style="color:#fff;">' + totalPts + '</b> / 1000 &middot; Média: <b style="color:#fff;">' + avgPts + '</b></span></div>';
    html += '<div class="stat-panel">';
    html += '<div>' + buildRadarChart(p.stats, pageAccent) + '</div>';
    html += '<div class="stat-readout">';
    for (var si = 0; si < STAT_LABELS.length; si++) {
      var valorStat = p.stats[STAT_KEYS[si]] !== undefined ? p.stats[STAT_KEYS[si]] : 0;
      html += '<div class="stat-row"><span class="stat-label">' + STAT_LABELS[si] + '</span><span class="stat-bar"><span class="stat-bar-fill" style="width:' + valorStat + '%;"></span></span><span class="stat-value">' + valorStat + '</span></div>';
    }
    html += '</div></div>';
  }

  html += '</div>';
  html += '<div style="margin-top:24px;"><a onclick="navigate(\'wiki\')" class="btn">Voltar para Personagens</a></div>';
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

function buildRadarChart(stats, accentColor) {
  var strokeColor = accentColor || '#ffffff';
  var labels = STAT_ABBR;
  var keys = STAT_KEYS;
  var n = labels.length;
  var size = 270;
  var cx = size / 2;
  var cy = size / 2;
  var maxR = 92;
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
    svg += '<polygon points="' + pontosAnel.trim() + '" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"></polygon>';
  }

  for (var i = 0; i < n; i++) {
    var ang = (Math.PI * 2 / n) * i - Math.PI / 2;
    var xEixo = cx + maxR * Math.cos(ang);
    var yEixo = cy + maxR * Math.sin(ang);
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + xEixo.toFixed(1) + '" y2="' + yEixo.toFixed(1) + '" stroke="rgba(255,255,255,0.1)" stroke-width="1"></line>';
    var lx = cx + (maxR + 22) * Math.cos(ang);
    var ly = cy + (maxR + 22) * Math.sin(ang);
    var anchor = 'middle';
    if (lx < cx - 5) anchor = 'end';
    if (lx > cx + 5) anchor = 'start';
    svg += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="10" font-weight="600" fill="#888888" text-anchor="' + anchor + '" font-family="JetBrains Mono, monospace">' + h(labels[i]) + '</text>';
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
  svg += '<polygon points="' + pontosDado.trim() + '" fill="rgba(255, 255, 255, 0.14)" stroke="' + ha(strokeColor) + '" stroke-width="1.8"></polygon>';
  svg += '</svg>';
  return svg;
}

// Estado temporário do Construtor de Blocos durante criação/edição
var activeBuilderBlocks = [];

function renderNovoPersonagem() {
  if (!isModOrAdmin()) return '<div class="alert alert-error">Acesso restrito a Moderadores e Administradores.</div>';

  var editId = sessionStorage.getItem('editPersonagemId');
  var existing = editId ? listaPersonagens().find(function(p) { return String(p.id) === editId; }) : null;
  var theme = (existing && existing.theme) ? existing.theme : {};
  activeBuilderBlocks = (existing && Array.isArray(existing.blocks)) ? JSON.parse(JSON.stringify(existing.blocks)) : [];

  var html = '<div class="breadcrumb"><a onclick="navigate(\'wiki\')">Personagens</a> / ' + (existing ? 'Editar Personagem' : 'Novo Personagem') + '</div>';
  html += '<div class="cat-header"><span>' + (existing ? 'Editar Ficha de Personagem' : 'Cadastrar Novo Personagem') + '</span>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
  html += '<button type="button" class="btn btn-small" onclick="previewPersonagemModal()">Pré-visualizar</button>';
  html += '<button type="button" class="btn btn-small" onclick="exportarPersonagemJson()">Exportar JSON</button>';
  html += '<button type="button" class="btn btn-small" onclick="importarPersonagemJsonModal()">Importar JSON</button>';
  html += '</div></div>';

  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>1. Identidade &amp; Dados da Ficha</span></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:14px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Nome</label><input type="text" id="p-nome" value="' + (existing ? ha(existing.nome) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Categoria</label><select id="p-categoria"><option value="Personagem Principal"' + (!existing || existing.categoria !== 'Sub-Personagem' ? ' selected' : '') + '>Personagem Principal</option><option value="Sub-Personagem"' + (existing && existing.categoria === 'Sub-Personagem' ? ' selected' : '') + '>Sub-Personagem</option></select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Título / Epíteto</label><input type="text" id="p-titulo" value="' + (existing ? ha(existing.titulo) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Raça</label><input type="text" id="p-raca" value="' + (existing ? ha(existing.raca) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Facção</label><input type="text" id="p-faccao" value="' + (existing ? ha(existing.faccao) : '') + '"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Status</label><input type="text" id="p-status" value="' + (existing ? ha(existing.status) : '') + '" placeholder="Vivo, Falecido, Afastado..."></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>URL do Retrato / Imagem</label><input type="text" id="p-imagem" value="' + (existing ? ha(existing.imagem) : '') + '" placeholder="https://..."></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Cor de Destaque da Página</label><input type="color" id="p-accent-color" value="' + ha(theme.accentColor || '#ffffff') + '" style="height:38px;width:100%;cursor:pointer;"></div>';
  html += '</div>';

  html += '<div class="form-row"><label>Descrição / Lore Principal (Editor Completo)</label>';
  html += buildEditor('p-editor', existing ? existing.descricao : '');
  html += '</div></div>';

  html += renderBlockBuilderSection();

  var st = (existing && existing.stats) ? existing.stats : {};
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>Atributos &amp; Classificação (Opcional)</span></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;">';
  for (var ai = 0; ai < STAT_KEYS.length; ai++) {
    var valorAttr = st[STAT_KEYS[ai]] !== undefined ? st[STAT_KEYS[ai]] : '';
    html += '<div class="form-row" style="margin-bottom:0"><label>' + STAT_LABELS[ai] + '</label><input type="number" min="0" max="100" id="p-stat-' + STAT_KEYS[ai] + '" value="' + valorAttr + '" placeholder="0-100"></div>';
  }
  html += '</div>';
  html += '<div class="field-desc">Cada atributo vai de 0 a 100 e gera o gráfico de radar na ficha.</div>';
  html += '<div class="form-row" style="margin-top:12px;"><label>Classificação segundo A Máscara (opcional)</label><input type="text" id="p-mascara-tier" value="' + (existing ? ha(existing.mascaraTier) : '') + '"></div>';
  html += '</div>';

  var skillsExistentes = (existing && existing.skills) ? existing.skills : [];
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>Skills e Equipamentos (Opcional)</span></div>';
  html += '<div id="p-skills-list">';
  skillsExistentes.forEach(function(sk) { html += skillFormRowHtml(sk.nome, sk.descricao, sk.tipo); });
  html += '</div>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="adicionarSkillFormRow()">+ Adicionar Card de Skill / Equipamento</button>';
  html += '</div>';

  var btnLabel = existing ? 'Salvar Alterações' : 'Cadastrar Personagem';
  var onclick = existing ? 'salvarEdicaoPersonagem(' + idJs(existing.id) + ')' : 'submitPersonagem()';
  html += '<div style="display:flex;gap:10px;margin-top:12px;"><button class="btn btn-primary" onclick="' + onclick + '">' + btnLabel + '</button><button type="button" class="btn" onclick="previewPersonagemModal()">Pré-visualizar</button><button class="btn" onclick="navigate(\'wiki\')">Cancelar</button></div>';
  return html;
}

// ==================== WIKIA · CENAS & POSTS CUSTOMIZÁVEIS ====================

var serverWikiPosts = null;

function carregarWikiPostsServidor() {
  fetch('/api/wiki-posts')
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      if (!data || !Array.isArray(data.wikiPosts)) return;
      serverWikiPosts = data.wikiPosts;
      if (currentPage === 'cenas' || currentPage === 'cenaView' || currentPage === 'forum') render();
    })
    .catch(function() {});
}

function listaWikiPosts() {
  if (serverWikiPosts === null) return DB.wikiPosts || [];
  var titulos = {};
  serverWikiPosts.forEach(function(w) { titulos[(w.titulo || '').toLowerCase()] = true; });
  var locais = (DB.wikiPosts || []).filter(function(w) { return !titulos[(w.titulo || '').toLowerCase()]; });
  return serverWikiPosts.concat(locais);
}

function wikiPostLocalApenas(w) {
  return serverWikiPosts !== null && typeof w.id === 'number';
}

function onCenasFilterChange() {
  var sEl = document.getElementById('cenas-search-input');
  var cEl = document.getElementById('cenas-cat-select');
  var stEl = document.getElementById('cenas-status-select');
  if (sEl) cenasFilterSearch = sEl.value;
  if (cEl) cenasFilterCat = cEl.value;
  if (stEl) cenasFilterStatus = stEl.value;
  render();
  var sElAfter = document.getElementById('cenas-search-input');
  if (sElAfter) {
    sElAfter.focus();
    sElAfter.setSelectionRange(sElAfter.value.length, sElAfter.value.length);
  }
}

function renderCenas() {
  var html = '<div class="breadcrumb">Início / Cenas</div>';
  html += '<div class="cat-header"><span>Cenas &amp; Posts</span>';
  if (isModOrAdmin()) {
    html += '<button class="btn btn-small btn-primary" onclick="sessionStorage.removeItem(\'editCenaId\');navigate(\'novaCena\')">+ Nova Cena / Post Customizável</button>';
  }
  html += '</div>';

  html += '<div class="filter-bar">';
  html += '<input type="text" id="cenas-search-input" value="' + ha(cenasFilterSearch) + '" placeholder="Buscar cena por título, arco, participante ou resumo..." oninput="onCenasFilterChange()">';
  html += '<select id="cenas-cat-select" onchange="onCenasFilterChange()">';
  html += '<option value="all"' + (cenasFilterCat === 'all' ? ' selected' : '') + '>Todos os Tipos</option>';
  html += '<option value="Cena de RPG"' + (cenasFilterCat === 'Cena de RPG' ? ' selected' : '') + '>Cena de RPG</option>';
  html += '<option value="Combate / Batalha"' + (cenasFilterCat === 'Combate / Batalha' ? ' selected' : '') + '>Combate / Batalha</option>';
  html += '<option value="Evento / Arco"' + (cenasFilterCat === 'Evento / Arco' ? ' selected' : '') + '>Evento / Arco</option>';
  html += '<option value="Lore & Mundo"' + (cenasFilterCat === 'Lore & Mundo' ? ' selected' : '') + '>Lore &amp; Mundo</option>';
  html += '<option value="Crônica"' + (cenasFilterCat === 'Crônica' ? ' selected' : '') + '>Crônica</option>';
  html += '</select>';
  html += '<select id="cenas-status-select" onchange="onCenasFilterChange()">';
  html += '<option value="all"' + (cenasFilterStatus === 'all' ? ' selected' : '') + '>Todos os Status</option>';
  html += '<option value="Em Andamento"' + (cenasFilterStatus === 'Em Andamento' ? ' selected' : '') + '>Em Andamento</option>';
  html += '<option value="Concluída"' + (cenasFilterStatus === 'Concluída' ? ' selected' : '') + '>Concluída</option>';
  html += '<option value="Canônica"' + (cenasFilterStatus === 'Canônica' ? ' selected' : '') + '>Canônica</option>';
  html += '<option value="Hiato"' + (cenasFilterStatus === 'Hiato' ? ' selected' : '') + '>Hiato</option>';
  html += '</select>';
  html += '</div>';

  var lista = listaWikiPosts().filter(function(w) {
    if (cenasFilterCat !== 'all' && w.categoria !== cenasFilterCat) return false;
    if (cenasFilterStatus !== 'all' && w.status !== cenasFilterStatus) return false;
    if (cenasFilterSearch.trim()) {
      var q = cenasFilterSearch.toLowerCase();
      var parts = (w.infobox && Array.isArray(w.infobox.participants)) ? w.infobox.participants.join(' ') : '';
      var hay = ((w.titulo || '') + ' ' + (w.subtitulo || '') + ' ' + (w.resumo || '') + ' ' + parts).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  if (!lista.length) {
    html += '<div style="text-align:center;padding:44px;color:var(--text-muted);background:var(--bg-surface);border-radius:var(--radius-lg);border:1px solid var(--border-subtle);">';
    html += '<p style="font-size:15px;color:#fff;margin-bottom:6px;">Nenhuma cena ou post encontrado.</p>';
    if (isModOrAdmin()) {
      html += '<p style="margin-bottom:14px;">Crie uma página de cena customizável com blocos modulares e turnos comentados.</p>';
      html += '<button class="btn btn-primary" onclick="sessionStorage.removeItem(\'editCenaId\');navigate(\'novaCena\')">+ Criar Primeira Cena</button>';
    }
    html += '</div>';
    return html;
  }

  html += '<div class="cenas-grid">';
  lista.forEach(function(w) {
    var accent = (w.theme && w.theme.accentColor) ? w.theme.accentColor : '#ffffff';
    var bannerStyle = w.banner
      ? 'background-image:url(\'' + ha(w.banner) + '\');'
      : 'background:linear-gradient(135deg, #161616, #050505);';
    var turnsCount = Array.isArray(w.turns) ? w.turns.length : 0;
    var parts = (w.infobox && Array.isArray(w.infobox.participants)) ? w.infobox.participants : [];
    var descPreview = w.resumo || (w.descricao || '').replace(/<[^>]+>/g, '').substring(0, 140);

    html += '<div class="cena-card" style="--card-accent:' + ha(accent) + ';" onclick="navigate(\'cenaView\',' + idJs(w.id) + ')">';
    html += '<div class="cena-card-banner" style="' + bannerStyle + '">';
    html += '<div class="cena-card-badges">';
    html += '<span class="tag" style="background:rgba(0,0,0,0.85);color:#fff;border-color:rgba(255,255,255,0.2);">' + h(w.categoria || 'Cena de RPG') + '</span>';
    html += '<span class="tag" style="background:rgba(0,0,0,0.85);color:#ccc;">' + h(w.status || 'Em Andamento') + '</span>';
    html += '</div></div>';
    html += '<div class="cena-card-body">';
    html += '<h3>' + h(w.titulo) + '</h3>';
    if (w.subtitulo) html += '<div class="cena-card-subtitle">' + h(w.subtitulo) + '</div>';
    html += '<div class="cena-card-desc">' + h(descPreview) + (descPreview.length >= 140 ? '...' : '') + '</div>';
    if (parts.length) {
      html += '<div style="margin-bottom:12px;display:flex;gap:5px;flex-wrap:wrap;">';
      parts.forEach(function(pt) {
        html += '<span class="tag" style="font-size:10px;">' + h(pt) + '</span>';
      });
      html += '</div>';
    }
    html += '<div class="cena-card-footer">';
    html += '<span><b>' + turnsCount + '</b> ' + (turnsCount === 1 ? 'turno' : 'turnos') + '</span>';
    html += '<span style="color:#ffffff;font-weight:600;">Abrir &rarr;</span>';
    html += '</div></div></div>';
  });
  html += '</div>';
  return html;
}

function renderModularBlocks(blocks, prefixId) {
  if (!Array.isArray(blocks) || !blocks.length) return '';
  var html = '';
  blocks.forEach(function(b, idx) {
    if (!b || !b.type) return;
    var bid = (prefixId || 'blk') + '-' + idx;

    if (b.type === 'section') {
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="char-sheet-body" style="padding:0;border:none;background:transparent;box-shadow:none;">' + (b.content || '') + '</div>';
      html += '</div>';
    } else if (b.type === 'quote') {
      html += '<div class="mod-block" style="padding:0;background:transparent;border:none;box-shadow:none;">';
      html += '<div class="mod-quote-box">';
      if (b.avatar) html += '<img class="mod-quote-avatar" src="' + ha(b.avatar) + '" alt="Avatar">';
      html += '<div><div class="mod-quote-text">&ldquo;' + h(b.text || '') + '&rdquo;</div>';
      if (b.author) html += '<div class="mod-quote-author">&mdash; ' + h(b.author) + '</div>';
      html += '</div></div></div>';
    } else if (b.type === 'tabs') {
      var items = Array.isArray(b.items) ? b.items : [];
      if (!items.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="mod-tabs-nav">';
      items.forEach(function(it, tidx) {
        html += '<button type="button" class="mod-tab-btn' + (tidx === 0 ? ' active' : '') + '" onclick="switchModTab(this,\'' + bid + '-tab-' + tidx + '\')">' + h(it.label || ('Aba ' + (tidx + 1))) + '</button>';
      });
      html += '</div>';
      items.forEach(function(it, tidx) {
        html += '<div id="' + bid + '-tab-' + tidx + '" class="mod-tab-pane' + (tidx === 0 ? ' active' : '') + '">' + (it.content || '') + '</div>';
      });
      html += '</div>';
    } else if (b.type === 'gallery') {
      var imgs = Array.isArray(b.items) ? b.items : [];
      if (!imgs.length) return;
      var cols = b.cols || '2';
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="mod-gallery-grid cols-' + ha(cols) + '">';
      imgs.forEach(function(im) {
        if (!im || !im.url) return;
        html += '<div class="mod-gallery-item" onclick="openLightbox(\'' + ha(im.url) + '\',\'' + ha(im.caption || '') + '\')">';
        html += '<img src="' + ha(im.url) + '" alt="' + ha(im.caption || 'Imagem') + '">';
        if (im.caption) html += '<div class="mod-gallery-caption">' + h(im.caption) + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    } else if (b.type === 'cards') {
      var cards = Array.isArray(b.items) ? b.items : [];
      if (!cards.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="mod-cards-grid">';
      cards.forEach(function(cd) {
        var cColor = cd.color || 'var(--page-accent)';
        html += '<div class="mod-custom-card" style="--card-color:' + ha(cColor) + ';">';
        if (cd.image) html += '<img class="mod-custom-card-img" src="' + ha(cd.image) + '" onclick="openLightbox(\'' + ha(cd.image) + '\',\'' + ha(cd.title || '') + '\')" style="cursor:zoom-in;">';
        html += '<div class="mod-custom-card-body">';
        html += '<div class="mod-custom-card-head"><h4>' + h(cd.title || '') + '</h4>';
        if (cd.badge) html += '<span class="mod-custom-card-badge">' + h(cd.badge) + '</span>';
        html += '</div>';
        html += '<p>' + h(cd.desc || '') + '</p>';
        html += '</div></div>';
      });
      html += '</div></div>';
    } else if (b.type === 'stats') {
      var bars = Array.isArray(b.items) ? b.items : [];
      if (!bars.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      bars.forEach(function(st) {
        var val = Math.max(0, Math.min(100, parseInt(st.value, 10) || 0));
        var barCol = st.color || 'var(--page-accent)';
        html += '<div class="stat-row" style="margin-bottom:10px;">';
        html += '<span class="stat-label" style="width:180px;">' + h(st.label || '') + '</span>';
        html += '<span class="stat-bar"><span class="stat-bar-fill" style="width:' + val + '%;background:' + ha(barCol) + ';"></span></span>';
        html += '<span class="stat-value">' + val + '%</span>';
        html += '</div>';
      });
      html += '</div>';
    } else if (b.type === 'accordion') {
      var accs = Array.isArray(b.items) ? b.items : [];
      if (!accs.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      accs.forEach(function(ac) {
        html += '<details class="mod-acc-item"><summary>' + h(ac.title || 'Detalhes') + '</summary><div class="mod-acc-body">' + h(ac.content || '') + '</div></details>';
      });
      html += '</div>';
    } else if (b.type === 'timeline') {
      var tlItems = Array.isArray(b.items) ? b.items : [];
      if (!tlItems.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="mod-timeline">';
      tlItems.forEach(function(tl) {
        html += '<div class="mod-timeline-item">';
        if (tl.date) html += '<div class="mod-timeline-date">' + h(tl.date) + '</div>';
        if (tl.title) html += '<div class="mod-timeline-title">' + h(tl.title) + '</div>';
        if (tl.desc) html += '<div class="mod-timeline-desc">' + h(tl.desc) + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    } else if (b.type === 'datalist') {
      var dlItems = Array.isArray(b.items) ? b.items : [];
      if (!dlItems.length) return;
      html += '<div class="mod-block">';
      if (b.title) html += '<div class="mod-block-title">' + h(b.title) + '</div>';
      html += '<div class="mod-datalist">';
      dlItems.forEach(function(dl) {
        html += '<div class="mod-datalist-item"><div class="mod-datalist-key">' + h(dl.key || '') + '</div><div class="mod-datalist-val">' + h(dl.val || '') + '</div></div>';
      });
      html += '</div></div>';
    }
  });
  return html;
}

function exportarLogCena() {
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w) return;
  var out = [];
  out.push('==================================================');
  out.push((w.titulo || 'CENA').toUpperCase());
  if (w.subtitulo) out.push(w.subtitulo);
  out.push('Categoria: ' + (w.categoria || '') + ' | Status: ' + (w.status || ''));
  out.push('==================================================\n');
  var introPlain = String(w.descricao || '').replace(/<[^>]+>/g, '').trim();
  if (introPlain) {
    out.push(introPlain + '\n');
  }
  var turns = Array.isArray(w.turns) ? w.turns : [];
  turns.forEach(function(t, i) {
    out.push('--------------------------------------------------');
    out.push('TURNO #' + (i + 1) + ' - ' + (t.characterName || t.authorName || 'Narrador') + (t.turnTitle ? ' (' + t.turnTitle + ')' : ''));
    if (t.location) out.push('Local: ' + t.location);
    out.push('Data: ' + (t.date || ''));
    out.push('--------------------------------------------------');
    out.push(String(t.content || '').replace(/<[^>]+>/g, '').trim());
    if (t.oocNotes) out.push('\n[OOC]: ' + t.oocNotes);
    out.push('');
  });
  var blob = new Blob([out.join('\n')], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (w.titulo || 'cena').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-log.txt';
  a.click();
}

function renderCenaView() {
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w) return '<p>Cena ou post não encontrado.</p>';

  var theme = w.theme || {};
  var accent = theme.accentColor || '#ffffff';
  var bannerStyle = theme.bannerStyle || 'cinematic';
  var layout = theme.layout || 'sidebar-left';
  var fontFamily = theme.fontFamily || 'sans';
  var bgEffect = theme.bgEffect || 'none';
  var infobox = w.infobox || {};
  var showInfobox = infobox.show !== false && layout !== 'full' && layout !== 'book';

  var totalWords = countWordsFromHtml(w.descricao);
  (Array.isArray(w.turns) ? w.turns : []).forEach(function(t) { totalWords += countWordsFromHtml(t.content); });
  var readMin = Math.max(1, Math.ceil(totalWords / 200));

  var html = '<div class="breadcrumb"><a onclick="navigate(\'cenas\')">Cenas</a> / ' + h(w.titulo) + '</div>';

  if (wikiPostLocalApenas(w) && isModOrAdmin()) {
    html += '<div class="alert alert-info"><span>Esta cena é um modelo local — clique ao lado para salvá-la no banco de dados do servidor.</span>';
    html += '<button class="btn btn-small btn-primary" onclick="enviarCenaAoServidor(' + w.id + ')">Publicar no Servidor</button></div>';
  }

  html += '<div class="custom-wiki-page font-' + ha(fontFamily) + (bgEffect !== 'none' ? ' bg-' + ha(bgEffect) : '') + '" style="--page-accent:' + ha(accent) + ';--page-accent-light:' + ha(accent) + ';">';

  if (bannerStyle !== 'none') {
    var bgRule = w.banner
      ? 'background-image:url(\'' + ha(w.banner) + '\');'
      : 'background:linear-gradient(135deg, #141414, #050505);';
    html += '<div class="wiki-hero-banner style-' + ha(bannerStyle) + '" style="' + bgRule + '">';
    html += '<div class="wiki-hero-content">';
    html += '<div class="wiki-hero-title-wrap">';
    html += '<div style="margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<span class="tag" style="background:rgba(0,0,0,0.8);color:#fff;border-color:rgba(255,255,255,0.25);">' + h(w.categoria || 'Cena de RPG') + '</span>';
    html += '<span class="tag" style="background:rgba(0,0,0,0.8);color:#ccc;">' + h(w.status || 'Em Andamento') + '</span>';
    html += '<span class="tag" style="background:rgba(0,0,0,0.8);color:#a1a1aa;">' + totalWords + ' palavras &middot; ~' + readMin + ' min</span>';
    html += '</div>';
    html += '<h1>' + h(w.titulo) + '</h1>';
    if (w.subtitulo) html += '<div class="wiki-hero-subtitle">' + h(w.subtitulo) + '</div>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">';
    if (theme.bgm) {
      html += '<div class="wiki-bgm-pill">' + h(theme.bgm) + '</div>';
    }
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-small" onclick="exportarLogCena()">Exportar Log</button>';
    if (isModOrAdmin()) {
      html += '<button class="btn btn-small btn-warn" onclick="editarCena(' + idJs(w.id) + ')">Customizar Página</button>';
      html += '<button class="btn btn-small btn-danger" onclick="deletarCena(' + idJs(w.id) + ')">Excluir</button>';
    }
    html += '</div>';
    html += '</div></div></div>';
  } else {
    html += '<div class="char-sheet-head">';
    html += '<div><h2>' + h(w.titulo) + '</h2>' + (w.subtitulo ? '<div style="color:var(--text-secondary);font-size:14px;">' + h(w.subtitulo) + '</div>' : '') + '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-small" onclick="exportarLogCena()">Exportar Log</button>';
    if (isModOrAdmin()) {
      html += '<button class="btn btn-small btn-warn" onclick="editarCena(' + idJs(w.id) + ')">Customizar Página</button><button class="btn btn-small btn-danger" onclick="deletarCena(' + idJs(w.id) + ')">Excluir</button>';
    }
    html += '</div></div>';
  }

  var effectiveLayout = showInfobox ? ('layout-' + layout) : (layout === 'book' ? 'layout-book' : 'layout-full');
  html += '<div class="wiki-page-layout ' + ha(effectiveLayout) + '">';

  var infoboxHtml = '';
  if (showInfobox) {
    infoboxHtml += '<aside class="char-sheet-card">';
    infoboxHtml += '<div class="char-sheet-card-title">' + h(infobox.title || w.titulo) + '</div>';
    if (infobox.image) {
      infoboxHtml += '<div class="char-sheet-portrait" onclick="openLightbox(\'' + ha(infobox.image) + '\',\'' + ha(infobox.caption || w.titulo) + '\')" style="cursor:zoom-in;"><img src="' + ha(infobox.image) + '"></div>';
    }
    if (infobox.caption) {
      infoboxHtml += '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:12px;font-style:italic;">' + h(infobox.caption) + '</div>';
    }
    infoboxHtml += '<table>';
    if (Array.isArray(infobox.fields)) {
      infobox.fields.forEach(function(f) {
        if (!f || (!f.label && !f.value)) return;
        infoboxHtml += '<tr><td><b>' + h(f.label) + '</b></td><td>' + h(f.value) + '</td></tr>';
      });
    }
    infoboxHtml += '</table>';

    if (Array.isArray(infobox.participants) && infobox.participants.length) {
      infoboxHtml += '<div style="text-align:left;margin-top:10px;">';
      infoboxHtml += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;letter-spacing:0.05em;">Participantes</div>';
      infoboxHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      var allChars = listaPersonagens();
      infobox.participants.forEach(function(pName) {
        var matchedChar = allChars.find(function(c) { return c.nome.toLowerCase() === String(pName).toLowerCase(); });
        if (matchedChar) {
          infoboxHtml += '<a class="tag" style="cursor:pointer;border-color:rgba(255,255,255,0.3);color:#fff;" onclick="navigate(\'personagemView\',' + idJs(matchedChar.id) + ')">' + h(matchedChar.nome) + '</a>';
        } else {
          infoboxHtml += '<span class="tag">' + h(pName) + '</span>';
        }
      });
      infoboxHtml += '</div></div>';
    }
    infoboxHtml += '</aside>';
  }

  var mainContentHtml = '<div class="wiki-content-area">';
  if (w.descricao && w.descricao !== '<br>') {
    mainContentHtml += '<div class="char-sheet-body">' + w.descricao + '</div>';
  }
  mainContentHtml += renderModularBlocks(w.blocks, 'cena-' + w.id);
  mainContentHtml += '</div>';

  if (showInfobox && layout === 'sidebar-right') {
    html += mainContentHtml + infoboxHtml;
  } else if (showInfobox) {
    html += infoboxHtml + mainContentHtml;
  } else {
    html += mainContentHtml;
  }

  html += '</div>';

  // ==================== SEÇÃO DE TURNOS / COMENTÁRIOS DA CENA ====================
  var turns = Array.isArray(w.turns) ? w.turns.slice() : [];
  var indexedTurns = turns.map(function(t, i) { return { turn: t, num: i + 1 }; });
  if (turnSortOrder === 'desc') indexedTurns.reverse();

  html += '<section class="turns-section">';
  html += '<div class="turns-header-bar">';
  html += '<h3><span>Turnos da Cena</span> <span class="turn-number-pill">' + turns.length + (turns.length === 1 ? ' turno' : ' turnos') + '</span></h3>';
  html += '<div style="display:flex;gap:8px;align-items:center;">';
  html += '<select style="width:auto;font-size:12px;padding:5px 10px;" onchange="turnSortOrder=this.value;render()">';
  html += '<option value="asc"' + (turnSortOrder === 'asc' ? ' selected' : '') + '>Ordem Cronológica (#1 &rarr; #' + (turns.length || 1) + ')</option>';
  html += '<option value="desc"' + (turnSortOrder === 'desc' ? ' selected' : '') + '>Mais Recentes Primeiro</option>';
  html += '</select>';
  if (DB.session) {
    html += '<a class="btn btn-small btn-primary" onclick="document.getElementById(\'new-turn-form\').scrollIntoView({behavior:\'smooth\'})">+ Postar Turno</a>';
  }
  html += '</div></div>';

  if (!indexedTurns.length) {
    html += '<div style="text-align:center;padding:34px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:var(--text-muted);margin-bottom:24px;">Nenhum turno foi postado nesta cena ainda. Seja o primeiro a iniciar a narrativa abaixo.</div>';
  }

  indexedTurns.forEach(function(item) {
    var t = item.turn;
    var num = item.num;
    var tAccent = t.accentColor || accent;
    var displayName = t.characterName || t.authorName || 'Narrador';
    var initials = displayName.substring(0, 2).toUpperCase();
    var bStyle = t.bannerStyle || 'panoramic';
    var fontCls = t.fontFamily ? (' font-' + ha(t.fontFamily)) : '';

    html += '<article class="turn-card" style="--turn-accent:' + ha(tAccent) + ';">';
    html += '<div class="turn-top-bar">';
    html += '<div class="turn-identity">';
    if (t.characterAvatar) {
      html += '<img class="turn-avatar" src="' + ha(t.characterAvatar) + '" alt="' + ha(displayName) + '" onclick="openLightbox(\'' + ha(t.characterAvatar) + '\',\'' + ha(displayName) + '\')" style="cursor:zoom-in;">';
    } else {
      html += '<div class="turn-avatar">' + h(initials) + '</div>';
    }
    html += '<div>';
    html += '<div class="turn-char-name">' + h(displayName);
    if (t.characterTitle) html += ' <span class="turn-char-title">&middot; ' + h(t.characterTitle) + '</span>';
    html += '</div>';
    html += '<div style="font-size:11.5px;color:var(--text-muted);">Jogador(a): <b style="color:var(--text-secondary);">' + h(t.authorName || 'Membro') + '</b> ' + roleBadgeFromRole(t.authorRole) + '</div>';
    html += '</div></div>';

    html += '<div class="turn-meta-right">';
    if (t.location) html += '<span class="tag">' + h(t.location) + '</span>';
    html += '<span class="turn-number-pill">Turno #' + num + '</span>';
    html += '<span>' + h(t.date || '') + '</span>';
    if (t.edited) html += '<span class="tag">editado</span>';
    html += '</div></div>';

    if (t.turnTitle) {
      html += '<div class="turn-subbanner-title"><span>' + h(t.turnTitle) + '</span></div>';
    }

    if (t.banner && (bStyle === 'panoramic' || bStyle === 'full')) {
      html += '<div class="turn-banner-media style-' + ha(bStyle) + '" onclick="openLightbox(\'' + ha(t.banner) + '\',\'' + ha(t.turnTitle || displayName) + '\')">';
      html += '<img src="' + ha(t.banner) + '" alt="Imagem do turno">';
      html += '</div>';
    }

    html += '<div class="turn-content-wrap">';
    if (t.banner && bStyle === 'side') {
      html += '<div class="turn-side-img" onclick="openLightbox(\'' + ha(t.banner) + '\',\'' + ha(t.turnTitle || displayName) + '\')"><img src="' + ha(t.banner) + '" alt="Retrato do turno"></div>';
    }
    html += '<div class="turn-content-body' + fontCls + '">' + (t.content || '') + '</div>';
    html += '</div>';

    if (Array.isArray(t.images) && t.images.length) {
      html += '<div class="turn-gallery-strip">';
      t.images.forEach(function(imgObj) {
        var u = typeof imgObj === 'string' ? imgObj : (imgObj && imgObj.url);
        var cap = (imgObj && imgObj.caption) ? imgObj.caption : '';
        if (!u) return;
        html += '<div class="turn-gallery-card" onclick="openLightbox(\'' + ha(u) + '\',\'' + ha(cap || displayName) + '\')">';
        html += '<img src="' + ha(u) + '" alt="Anexo do turno">';
        if (cap) html += '<span>' + h(cap) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (t.oocNotes) {
      html += '<div class="turn-ooc-box"><b>Notas OOC / Ações do Turno:</b> ' + h(t.oocNotes) + '</div>';
    }

    html += '<div class="turn-footer-bar">';
    html += '<span>Turno #' + num + ' &middot; ' + h(displayName) + '</span>';
    html += '<div class="post-actions">';
    if (DB.session) {
      html += '<a onclick="citarTurno(' + idJs(t.id) + ')">Citar Turno</a>';
      if (podeEditarTurno(t)) {
        html += '<a onclick="abrirModalEditarTurno(' + idJs(t.id) + ')">Editar</a>';
        html += '<a class="danger-link" onclick="excluirTurnoCena(' + idJs(t.id) + ')">Excluir</a>';
      }
    }
    html += '</div></div>';
    html += '</article>';
  });

  if (DB.session) {
    var chars = listaPersonagens();
    html += '<div class="builder-panel" id="new-turn-form" style="border-top:2px solid ' + ha(accent) + ';margin-top:26px;">';
    html += '<div class="builder-panel-title"><span>Escrever Novo Turno na Cena</span><span style="font-size:12px;color:var(--text-secondary);">Postando como <b>' + h(DB.session.username) + '</b></span></div>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-bottom:12px;">';
    html += '<div class="form-row" style="margin-bottom:0"><label>Preencher com Personagem da Wiki (Opcional)</label><select id="turn-char-preset" onchange="aplicarPresetPersonagemTurno(this.value)"><option value="">— Escolher personagem cadastrado ou digitar livremente —</option>';
    chars.forEach(function(ch) {
      html += '<option value="' + ha(ch.id) + '">' + h(ch.nome) + (ch.titulo ? ' (' + h(ch.titulo) + ')' : '') + '</option>';
    });
    html += '</select></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Nome do Personagem no Turno</label><input type="text" id="turn-char-name" placeholder="Ex: Shidō Akane (ou deixe em branco)"></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Título / Epíteto do Personagem</label><input type="text" id="turn-char-title" placeholder="Ex: Filha da Tempestade"></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>URL do Avatar no Turno</label><input type="text" id="turn-char-avatar" value="' + ha(DB.session.avatar || '') + '" placeholder="https://..."></div>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">';
    html += '<div class="form-row" style="margin-bottom:0"><label>Título / Ação do Turno (Opcional)</label><input type="text" id="turn-title" placeholder="Ex: Turno #' + (turns.length + 1) + ' — O Despertar da Lâmina"></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Localização / Posição Atual</label><input type="text" id="turn-location" placeholder="Ex: Convés Principal"></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Fonte do Turno</label><select id="turn-font"><option value="serif">Literária (Serif)</option><option value="sans">Moderna (Sans)</option><option value="mono">Monoespaçada</option></select></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Cor da Borda do Turno</label><input type="color" id="turn-accent" value="' + ha(accent) + '" style="height:38px;width:100%;cursor:pointer;"></div>';
    html += '</div>';

    html += '<div style="background:var(--bg-surface-2);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.04em;">Imagens Ilustrativas do Turno (Opcional)</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 220px;gap:12px;margin-bottom:10px;">';
    html += '<div class="form-row" style="margin-bottom:0"><label>URL da Imagem de Destaque / Banner do Turno</label><input type="text" id="turn-banner-url" placeholder="https://... (aparece em destaque no turno)"></div>';
    html += '<div class="form-row" style="margin-bottom:0"><label>Formato da Imagem de Destaque</label><select id="turn-banner-style"><option value="panoramic">Banner Panorâmico no Topo</option><option value="full">Imagem Inteira no Topo</option><option value="side">Retrato Lateral ao Lado do Texto</option></select></div>';
    html += '</div>';
    html += '<div id="turn-extra-images-list"></div>';
    html += '<button type="button" class="btn btn-small" onclick="adicionarCampoImagemTurno(\'turn-extra-images-list\')">+ Adicionar Mais Imagens / Galeria ao Turno</button>';
    html += '</div>';

    html += '<div class="form-row"><label>Narrativa do Turno</label>';
    html += buildEditor('turn-editor', '', 'Escreva a ação, descrições, pensamentos e falas do seu turno...');
    html += '</div>';

    html += '<div class="form-row"><label>Notas OOC / Resumo de Habilidades ou Dados (Opcional)</label><textarea id="turn-ooc" rows="2" placeholder="Observações fora do personagem, gasto de éter, técnicas ativadas..."></textarea></div>';

    html += '<button class="btn btn-primary" onclick="publicarTurnoCena()">Publicar Turno na Cena</button>';
    html += '</div>';
  } else {
    html += '<div class="alert alert-info"><span>Faça login para postar seu turno textual e adicionar imagens nesta cena.</span><a class="btn btn-small btn-primary" onclick="showLoginModal()">Entrar</a></div>';
  }

  html += '</section>';
  html += '</div>';
  html += '<div style="margin-top:24px;"><a onclick="navigate(\'cenas\')" class="btn">Voltar para Cenas</a></div>';
  return html;
}

function aplicarPresetPersonagemTurno(charId, prefix) {
  var pfx = prefix || 'turn';
  if (!charId) return;
  var ch = listaPersonagens().find(function(c) { return String(c.id) === String(charId); });
  if (!ch) return;
  var nEl = document.getElementById(pfx + '-char-name');
  var tEl = document.getElementById(pfx + '-char-title');
  var aEl = document.getElementById(pfx + '-char-avatar');
  if (nEl) nEl.value = ch.nome || '';
  if (tEl) tEl.value = ch.titulo || '';
  if (aEl && ch.imagem) aEl.value = ch.imagem;
}

function adicionarCampoImagemTurno(containerId, urlVal, capVal) {
  var c = document.getElementById(containerId);
  if (!c) return;
  var row = '<div class="turn-extra-img-row" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center;">' +
    '<input type="text" class="turn-img-url" value="' + ha(urlVal || '') + '" placeholder="URL da imagem (https://...)">' +
    '<input type="text" class="turn-img-cap" value="' + ha(capVal || '') + '" placeholder="Legenda opcional">' +
    '<button type="button" class="btn btn-small btn-danger" onclick="this.parentNode.remove()">Remover</button>' +
    '</div>';
  c.insertAdjacentHTML('beforeend', row);
}

function lerImagensExtrasTurno(containerId) {
  var imgs = [];
  document.querySelectorAll('#' + containerId + ' .turn-extra-img-row').forEach(function(r) {
    var u = r.querySelector('.turn-img-url').value.trim();
    var cap = r.querySelector('.turn-img-cap').value.trim();
    if (u) imgs.push({ url: u, caption: cap });
  });
  return imgs;
}

function publicarTurnoCena() {
  if (!DB.session) { showAlert('Faça login para postar um turno.', 'error'); return; }
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w) return;

  var content = getEditorContent('turn-editor');
  if (!content || content === '<br>') {
    showAlert('Escreva o conteúdo do turno antes de publicar.', 'error');
    return;
  }

  var payload = {
    characterName: document.getElementById('turn-char-name').value.trim(),
    characterTitle: document.getElementById('turn-char-title').value.trim(),
    characterAvatar: document.getElementById('turn-char-avatar').value.trim(),
    turnTitle: document.getElementById('turn-title').value.trim(),
    location: document.getElementById('turn-location').value.trim(),
    fontFamily: document.getElementById('turn-font').value,
    accentColor: document.getElementById('turn-accent').value,
    banner: document.getElementById('turn-banner-url').value.trim(),
    bannerStyle: document.getElementById('turn-banner-style').value,
    images: lerImagensExtrasTurno('turn-extra-images-list'),
    content: content,
    oocNotes: document.getElementById('turn-ooc').value.trim(),
    date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };

  if (typeof w.id === 'number') {
    var localW = DB.wikiPosts.find(function(x) { return x.id === w.id; });
    if (!localW) return;
    if (!Array.isArray(localW.turns)) localW.turns = [];
    payload.id = 'turn-' + Date.now();
    payload.authorId = DB.session.id;
    payload.authorName = DB.session.username;
    payload.authorRole = DB.session.role;
    localW.turns.push(payload);
    bumpPosts();
    saveDB();
    render();
    showAlert('Turno publicado na cena!', 'success');
    return;
  }

  apiRequest('POST', '/api/wiki-posts/' + w.id + '/turns', payload, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    var idx = serverWikiPosts.findIndex(function(x) { return x.id === w.id; });
    if (idx !== -1) serverWikiPosts[idx] = data.wikiPost;
    bumpPosts();
    saveDB();
    render();
    showAlert('Turno publicado com sucesso!', 'success');
  });
}

function citarTurno(turnId) {
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w || !Array.isArray(w.turns)) return;
  var t = w.turns.find(function(x) { return String(x.id) === String(turnId); });
  if (!t) return;
  var ed = document.getElementById('turn-editor');
  if (!ed) return;
  ed.focus();
  var speaker = t.characterName || t.authorName || 'Turno anterior';
  var plainSnippet = (t.content || '').replace(/<[^>]+>/g, '').substring(0, 260);
  var qHtml = '<blockquote><strong>' + h(speaker) + ':</strong> &ldquo;' + h(plainSnippet) + '...&rdquo;</blockquote><p><br></p>';
  document.execCommand('insertHTML', false, qHtml);
  ed.scrollIntoView({ behavior: 'smooth' });
}

function abrirModalEditarTurno(turnId) {
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w || !Array.isArray(w.turns)) return;
  var t = w.turns.find(function(x) { return String(x.id) === String(turnId); });
  if (!t || !podeEditarTurno(t)) return;

  var body = '';
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  body += '<div class="form-row"><label>Nome do Personagem</label><input type="text" id="edit-turn-char-name" value="' + ha(t.characterName || '') + '"></div>';
  body += '<div class="form-row"><label>Título do Personagem</label><input type="text" id="edit-turn-char-title" value="' + ha(t.characterTitle || '') + '"></div>';
  body += '<div class="form-row"><label>URL do Avatar</label><input type="text" id="edit-turn-char-avatar" value="' + ha(t.characterAvatar || '') + '"></div>';
  body += '<div class="form-row"><label>Título do Turno</label><input type="text" id="edit-turn-title" value="' + ha(t.turnTitle || '') + '"></div>';
  body += '<div class="form-row"><label>Localização</label><input type="text" id="edit-turn-location" value="' + ha(t.location || '') + '"></div>';
  body += '<div class="form-row"><label>Cor do Turno</label><input type="color" id="edit-turn-accent" value="' + ha(t.accentColor || '#ffffff') + '" style="height:38px;width:100%;"></div>';
  body += '<div class="form-row"><label>Banner do Turno (URL)</label><input type="text" id="edit-turn-banner" value="' + ha(t.banner || '') + '"></div>';
  body += '<div class="form-row"><label>Estilo do Banner</label><select id="edit-turn-banner-style"><option value="panoramic"' + (t.bannerStyle === 'panoramic' ? ' selected' : '') + '>Panorâmico</option><option value="full"' + (t.bannerStyle === 'full' ? ' selected' : '') + '>Imagem Inteira</option><option value="side"' + (t.bannerStyle === 'side' ? ' selected' : '') + '>Lateral</option></select></div>';
  body += '</div>';
  body += '<div class="form-row"><label>Imagens Extras da Galeria do Turno</label><div id="edit-turn-extra-imgs"></div><button type="button" class="btn btn-small" onclick="adicionarCampoImagemTurno(\'edit-turn-extra-imgs\')">+ Imagem</button></div>';
  body += '<div class="form-row"><label>Conteúdo do Turno</label>' + buildEditor('edit-turn-editor', t.content || '') + '</div>';
  body += '<div class="form-row"><label>Notas OOC</label><textarea id="edit-turn-ooc" rows="2">' + h(t.oocNotes || '') + '</textarea></div>';
  body += '<button class="btn btn-primary" onclick="salvarEdicaoTurno(' + idJs(t.id) + ')">Salvar Turno</button>';

  showModal('Editar Turno', body);
  if (Array.isArray(t.images)) {
    t.images.forEach(function(im) {
      adicionarCampoImagemTurno('edit-turn-extra-imgs', im.url, im.caption);
    });
  }
}

function salvarEdicaoTurno(turnId) {
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w || !Array.isArray(w.turns)) return;

  var updated = {
    characterName: document.getElementById('edit-turn-char-name').value.trim(),
    characterTitle: document.getElementById('edit-turn-char-title').value.trim(),
    characterAvatar: document.getElementById('edit-turn-char-avatar').value.trim(),
    turnTitle: document.getElementById('edit-turn-title').value.trim(),
    location: document.getElementById('edit-turn-location').value.trim(),
    accentColor: document.getElementById('edit-turn-accent').value,
    banner: document.getElementById('edit-turn-banner').value.trim(),
    bannerStyle: document.getElementById('edit-turn-banner-style').value,
    images: lerImagensExtrasTurno('edit-turn-extra-imgs'),
    content: getEditorContent('edit-turn-editor'),
    oocNotes: document.getElementById('edit-turn-ooc').value.trim(),
    edited: true
  };

  if (typeof w.id === 'number') {
    var localW = DB.wikiPosts.find(function(x) { return x.id === w.id; });
    if (!localW) return;
    var idx = localW.turns.findIndex(function(x) { return String(x.id) === String(turnId); });
    if (idx === -1) return;
    Object.assign(localW.turns[idx], updated);
    saveDB();
    closeModal();
    render();
    showAlert('Turno atualizado.', 'success');
    return;
  }

  apiRequest('PUT', '/api/wiki-posts/' + w.id + '/turns/' + turnId, updated, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    var idx = serverWikiPosts.findIndex(function(x) { return x.id === w.id; });
    if (idx !== -1) serverWikiPosts[idx] = data.wikiPost;
    closeModal();
    render();
    showAlert('Turno atualizado.', 'success');
  });
}

function excluirTurnoCena(turnId) {
  if (!confirm('Deseja excluir este turno da cena?')) return;
  var lista = listaWikiPosts();
  var w = lista.find(function(x) { return String(x.id) === String(currentCena); });
  if (!w) return;

  if (typeof w.id === 'number') {
    var localW = DB.wikiPosts.find(function(x) { return x.id === w.id; });
    if (!localW || !Array.isArray(localW.turns)) return;
    localW.turns = localW.turns.filter(function(x) { return String(x.id) !== String(turnId); });
    saveDB();
    render();
    return;
  }

  apiRequest('DELETE', '/api/wiki-posts/' + w.id + '/turns/' + turnId, undefined, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    var idx = serverWikiPosts.findIndex(function(x) { return x.id === w.id; });
    if (idx !== -1) serverWikiPosts[idx] = data.wikiPost;
    render();
  });
}

// ==================== CONSTRUTOR DE PÁGINAS & BLOCOS MODULARES ====================

function renderBlockBuilderSection() {
  var html = '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>Construtor de Blocos &amp; Seções Modulares</span><span style="font-size:12px;color:var(--text-muted);">Adicione quantos blocos quiser na página</span></div>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'tabs\')">+ Abas Interativas</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'gallery\')">+ Galeria de Imagens</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'cards\')">+ Cards Customizados</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'quote\')">+ Citação / Epígrafe</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'stats\')">+ Barras de Status / Progresso</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'accordion\')">+ Acordeão / Gavetas</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'timeline\')">+ Cronologia / Eventos</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'datalist\')">+ Grade de Dados</button>';
  html += '<button type="button" class="btn btn-small btn-primary" onclick="addBuilderBlock(\'section\')">+ Seção de Texto Extra</button>';
  html += '</div>';
  html += '<div id="modular-blocks-container">' + renderBuilderBlocksList() + '</div>';
  html += '</div>';
  return html;
}

function syncBuilderBlocksFromDOM() {
  var cards = document.querySelectorAll('#modular-blocks-container .block-builder-card');
  if (!cards.length && !activeBuilderBlocks.length) return;
  var updated = [];
  cards.forEach(function(card) {
    var type = card.getAttribute('data-btype');
    var titleEl = card.querySelector('.bb-title');
    var title = titleEl ? titleEl.value.trim() : '';

    if (type === 'quote') {
      updated.push({
        type: 'quote',
        title: title,
        text: (card.querySelector('.bb-quote-text') || {}).value || '',
        author: (card.querySelector('.bb-quote-author') || {}).value || '',
        avatar: (card.querySelector('.bb-quote-avatar') || {}).value || ''
      });
    } else if (type === 'section') {
      updated.push({
        type: 'section',
        title: title,
        content: (card.querySelector('.bb-sec-content') || {}).value || ''
      });
    } else if (type === 'tabs') {
      var items = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var lb = sub.querySelector('.bb-tab-label').value.trim();
        var ct = sub.querySelector('.bb-tab-content').value;
        if (lb || ct) items.push({ label: lb || 'Aba', content: ct });
      });
      updated.push({ type: 'tabs', title: title, items: items });
    } else if (type === 'gallery') {
      var cols = (card.querySelector('.bb-gal-cols') || {}).value || '2';
      var gItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var u = sub.querySelector('.bb-gal-url').value.trim();
        var cp = sub.querySelector('.bb-gal-cap').value.trim();
        if (u) gItems.push({ url: u, caption: cp });
      });
      updated.push({ type: 'gallery', title: title, cols: cols, items: gItems });
    } else if (type === 'cards') {
      var cItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var t = sub.querySelector('.bb-card-title').value.trim();
        var b = sub.querySelector('.bb-card-badge').value.trim();
        var col = sub.querySelector('.bb-card-color').value;
        var img = sub.querySelector('.bb-card-img').value.trim();
        var d = sub.querySelector('.bb-card-desc').value.trim();
        if (t || d) cItems.push({ title: t, badge: b, color: col, image: img, desc: d });
      });
      updated.push({ type: 'cards', title: title, items: cItems });
    } else if (type === 'stats') {
      var sItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var lb = sub.querySelector('.bb-stat-label').value.trim();
        var vl = parseInt(sub.querySelector('.bb-stat-val').value, 10) || 0;
        var col = sub.querySelector('.bb-stat-col').value;
        if (lb) sItems.push({ label: lb, value: vl, color: col });
      });
      updated.push({ type: 'stats', title: title, items: sItems });
    } else if (type === 'accordion') {
      var aItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var t = sub.querySelector('.bb-acc-title').value.trim();
        var c = sub.querySelector('.bb-acc-content').value.trim();
        if (t || c) aItems.push({ title: t, content: c });
      });
      updated.push({ type: 'accordion', title: title, items: aItems });
    } else if (type === 'timeline') {
      var tlItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var dt = sub.querySelector('.bb-tl-date').value.trim();
        var tt = sub.querySelector('.bb-tl-title').value.trim();
        var ds = sub.querySelector('.bb-tl-desc').value.trim();
        if (dt || tt || ds) tlItems.push({ date: dt, title: tt, desc: ds });
      });
      updated.push({ type: 'timeline', title: title, items: tlItems });
    } else if (type === 'datalist') {
      var dlItems = [];
      card.querySelectorAll('.bb-subitem').forEach(function(sub) {
        var lb = sub.querySelector('.bb-dl-label').value.trim();
        var vl = sub.querySelector('.bb-dl-val').value.trim();
        if (lb || vl) dlItems.push({ label: lb, value: vl });
      });
      updated.push({ type: 'datalist', title: title, items: dlItems });
    }
  });
  activeBuilderBlocks = updated;
}

function refreshBuilderDOM() {
  var c = document.getElementById('modular-blocks-container');
  if (c) c.innerHTML = renderBuilderBlocksList();
}

function addBuilderBlock(type) {
  syncBuilderBlocksFromDOM();
  if (type === 'tabs') {
    activeBuilderBlocks.push({ type: 'tabs', title: 'Informações em Abas', items: [{ label: 'Aba 1', content: '<p>Conteúdo da primeira aba...</p>' }, { label: 'Aba 2', content: '<p>Conteúdo da segunda aba...</p>' }] });
  } else if (type === 'gallery') {
    activeBuilderBlocks.push({ type: 'gallery', title: 'Galeria Visual', cols: '2', items: [{ url: '', caption: '' }] });
  } else if (type === 'cards') {
    activeBuilderBlocks.push({ type: 'cards', title: 'Cards em Destaque', items: [{ title: 'Novo Card', badge: 'Item', color: '#ffffff', image: '', desc: 'Descrição do card...' }] });
  } else if (type === 'quote') {
    activeBuilderBlocks.push({ type: 'quote', title: '', text: 'Uma frase marcante para a abertura ou clímax da cena...', author: 'Autor / Personagem', avatar: '' });
  } else if (type === 'stats') {
    activeBuilderBlocks.push({ type: 'stats', title: 'Indicadores / Progresso', items: [{ label: 'Tensão da Cena', value: 75, color: '#ffffff' }] });
  } else if (type === 'accordion') {
    activeBuilderBlocks.push({ type: 'accordion', title: 'Segredos & Notas Recolhíveis', items: [{ title: 'Clique para expandir', content: 'Texto oculto dentro da gaveta...' }] });
  } else if (type === 'timeline') {
    activeBuilderBlocks.push({ type: 'timeline', title: 'Cronologia dos Eventos', items: [{ date: 'Ato I · 22h15', title: 'O Encontro Inicial', desc: 'Descrição sucinta do marco cronológico...' }] });
  } else if (type === 'datalist') {
    activeBuilderBlocks.push({ type: 'datalist', title: 'Especificações Técnicas', items: [{ label: 'Classificação', value: 'Nível Sigiloso' }, { label: 'Jurisdição', value: 'Setor Norte' }] });
  } else if (type === 'section') {
    activeBuilderBlocks.push({ type: 'section', title: 'Nova Seção', content: '<p>Texto da seção adicional...</p>' });
  }
  refreshBuilderDOM();
}

function moveBuilderBlock(idx, dir) {
  syncBuilderBlocksFromDOM();
  var target = idx + dir;
  if (target < 0 || target >= activeBuilderBlocks.length) return;
  var tmp = activeBuilderBlocks[idx];
  activeBuilderBlocks[idx] = activeBuilderBlocks[target];
  activeBuilderBlocks[target] = tmp;
  refreshBuilderDOM();
}

function removeBuilderBlock(idx) {
  syncBuilderBlocksFromDOM();
  activeBuilderBlocks.splice(idx, 1);
  refreshBuilderDOM();
}

function addSubItemToBlock(bIdx) {
  syncBuilderBlocksFromDOM();
  var b = activeBuilderBlocks[bIdx];
  if (!b) return;
  if (!Array.isArray(b.items)) b.items = [];
  if (b.type === 'tabs') b.items.push({ label: 'Nova Aba', content: '<p>Texto...</p>' });
  else if (b.type === 'gallery') b.items.push({ url: '', caption: '' });
  else if (b.type === 'cards') b.items.push({ title: '', badge: '', color: '#ffffff', image: '', desc: '' });
  else if (b.type === 'stats') b.items.push({ label: 'Novo Medidor', value: 50, color: '#ffffff' });
  else if (b.type === 'accordion') b.items.push({ title: 'Título da Gaveta', content: '' });
  else if (b.type === 'timeline') b.items.push({ date: 'Marco', title: 'Novo Evento', desc: '' });
  else if (b.type === 'datalist') b.items.push({ label: 'Campo', value: 'Valor' });
  refreshBuilderDOM();
}

function removeSubItemFromBlock(bIdx, sIdx) {
  syncBuilderBlocksFromDOM();
  var b = activeBuilderBlocks[bIdx];
  if (b && Array.isArray(b.items)) {
    b.items.splice(sIdx, 1);
    refreshBuilderDOM();
  }
}

function renderBuilderBlocksList() {
  if (!activeBuilderBlocks.length) {
    return '<div style="padding:18px;text-align:center;color:var(--text-muted);border:1px dashed var(--border-medium);border-radius:var(--radius-md);font-size:12.5px;">Nenhum bloco modular adicionado. Use os botões acima para adicionar abas, galerias, cards, citações, barras, cronologias, grades ou gavetas.</div>';
  }
  var typeNames = {
    tabs: 'Bloco de Abas Interativas',
    gallery: 'Bloco de Galeria de Imagens',
    cards: 'Grade de Cards Customizados',
    quote: 'Citação / Epígrafe Destacada',
    stats: 'Barras de Status / Progresso',
    accordion: 'Acordeão / Gavetas (Spoilers)',
    timeline: 'Cronologia / Linha do Tempo',
    datalist: 'Grade de Dados / Especificações',
    section: 'Seção de Texto Extra'
  };
  var html = '';
  activeBuilderBlocks.forEach(function(b, idx) {
    html += '<div class="block-builder-card" data-btype="' + ha(b.type) + '">';
    html += '<div class="block-builder-head">';
    html += '<strong style="color:var(--accent-light);font-size:13px;">' + (typeNames[b.type] || b.type) + '</strong>';
    html += '<div style="display:flex;gap:6px;">';
    html += '<button type="button" class="btn btn-small" onclick="moveBuilderBlock(' + idx + ',-1)">Subir</button>';
    html += '<button type="button" class="btn btn-small" onclick="moveBuilderBlock(' + idx + ',1)">Descer</button>';
    html += '<button type="button" class="btn btn-small btn-danger" onclick="removeBuilderBlock(' + idx + ')">Remover Bloco</button>';
    html += '</div></div>';

    if (b.type !== 'quote') {
      html += '<div class="form-row"><label>Título do Bloco</label><input type="text" class="bb-title" value="' + ha(b.title || '') + '" placeholder="Título desta seção"></div>';
    }

    if (b.type === 'quote') {
      html += '<div class="form-row"><label>Texto da Citação / Fala</label><textarea class="bb-quote-text" rows="2">' + h(b.text || '') + '</textarea></div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
      html += '<div><label>Autor / Personagem</label><input type="text" class="bb-quote-author" value="' + ha(b.author || '') + '"></div>';
      html += '<div><label>URL do Avatar (opcional)</label><input type="text" class="bb-quote-avatar" value="' + ha(b.avatar || '') + '"></div>';
      html += '</div>';
    } else if (b.type === 'section') {
      html += '<div class="form-row"><label>Conteúdo (aceita texto ou HTML)</label><textarea class="bb-sec-content" rows="4">' + h(b.content || '') + '</textarea></div>';
    } else if (b.type === 'tabs') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="background:rgba(0,0,0,0.25);padding:10px;border-radius:4px;margin-bottom:8px;border:1px solid var(--border-subtle);">';
        html += '<div style="display:flex;gap:8px;margin-bottom:6px;align-items:center;"><input type="text" class="bb-tab-label" value="' + ha(it.label || '') + '" placeholder="Nome da Aba"><button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button></div>';
        html += '<textarea class="bb-tab-content" rows="3" placeholder="Conteúdo da aba (pode usar tags HTML como <p>, <b>, <ul>)">' + h(it.content || '') + '</textarea>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Aba</button>';
    } else if (b.type === 'gallery') {
      html += '<div class="form-row"><label>Colunas da Galeria</label><select class="bb-gal-cols"><option value="1"' + (b.cols === '1' ? ' selected' : '') + '>1 Coluna (Grande)</option><option value="2"' + (b.cols !== '1' && b.cols !== '3' ? ' selected' : '') + '>2 Colunas</option><option value="3"' + (b.cols === '3' ? ' selected' : '') + '>3 Colunas</option></select></div>';
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;">';
        html += '<input type="text" class="bb-gal-url" value="' + ha(it.url || '') + '" placeholder="URL da Imagem (https://...)">';
        html += '<input type="text" class="bb-gal-cap" value="' + ha(it.caption || '') + '" placeholder="Legenda opcional">';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Imagem na Galeria</button>';
    } else if (b.type === 'cards') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="background:rgba(0,0,0,0.25);padding:10px;border-radius:4px;margin-bottom:8px;border:1px solid var(--border-subtle);">';
        html += '<div style="display:grid;grid-template-columns:1fr 130px 70px auto;gap:8px;margin-bottom:8px;align-items:center;">';
        html += '<input type="text" class="bb-card-title" value="' + ha(it.title || '') + '" placeholder="Título do Card">';
        html += '<input type="text" class="bb-card-badge" value="' + ha(it.badge || '') + '" placeholder="Tag (Ex: NPC)">';
        html += '<input type="color" class="bb-card-color" value="' + ha(it.color || '#ffffff') + '" style="height:36px;width:100%;">';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button>';
        html += '</div>';
        html += '<div class="form-row" style="margin-bottom:6px;"><input type="text" class="bb-card-img" value="' + ha(it.image || '') + '" placeholder="URL de Imagem do Card (opcional)"></div>';
        html += '<textarea class="bb-card-desc" rows="2" placeholder="Descrição do card...">' + h(it.desc || '') + '</textarea>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Card</button>';
    } else if (b.type === 'stats') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="display:grid;grid-template-columns:1fr 100px 70px auto;gap:8px;margin-bottom:8px;align-items:center;">';
        html += '<input type="text" class="bb-stat-label" value="' + ha(it.label || '') + '" placeholder="Nome do Indicador">';
        html += '<input type="number" min="0" max="100" class="bb-stat-val" value="' + ha(it.value !== undefined ? it.value : 50) + '" placeholder="0-100">';
        html += '<input type="color" class="bb-stat-col" value="' + ha(it.color || '#ffffff') + '" style="height:36px;width:100%;">';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Barra</button>';
    } else if (b.type === 'accordion') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="background:rgba(0,0,0,0.25);padding:10px;border-radius:4px;margin-bottom:8px;border:1px solid var(--border-subtle);">';
        html += '<div style="display:flex;gap:8px;margin-bottom:6px;"><input type="text" class="bb-acc-title" value="' + ha(it.title || '') + '" placeholder="Título visível da gaveta"><button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button></div>';
        html += '<textarea class="bb-acc-content" rows="2" placeholder="Conteúdo oculto...">' + h(it.content || '') + '</textarea>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Gaveta</button>';
    } else if (b.type === 'timeline') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="background:rgba(0,0,0,0.25);padding:10px;border-radius:4px;margin-bottom:8px;border:1px solid var(--border-subtle);">';
        html += '<div style="display:grid;grid-template-columns:160px 1fr auto;gap:8px;margin-bottom:6px;align-items:center;">';
        html += '<input type="text" class="bb-tl-date" value="' + ha(it.date || '') + '" placeholder="Data / Hora / Ato">';
        html += '<input type="text" class="bb-tl-title" value="' + ha(it.title || '') + '" placeholder="Título do Evento">';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button>';
        html += '</div>';
        html += '<textarea class="bb-tl-desc" rows="2" placeholder="Descrição do acontecimento...">' + h(it.desc || '') + '</textarea>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Evento na Cronologia</button>';
    } else if (b.type === 'datalist') {
      (b.items || []).forEach(function(it, sIdx) {
        html += '<div class="bb-subitem" style="display:grid;grid-template-columns:180px 1fr auto;gap:8px;margin-bottom:8px;align-items:center;">';
        html += '<input type="text" class="bb-dl-label" value="' + ha(it.label || '') + '" placeholder="Rótulo / Chave">';
        html += '<input type="text" class="bb-dl-val" value="' + ha(it.value || '') + '" placeholder="Valor / Descrição">';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="removeSubItemFromBlock(' + idx + ',' + sIdx + ')">Remover</button>';
        html += '</div>';
      });
      html += '<button type="button" class="btn btn-small" onclick="addSubItemToBlock(' + idx + ')">+ Adicionar Par de Dados</button>';
    }

    html += '</div>';
  });
  return html;
}

function infoboxFieldRowHtml(label, value) {
  return '<div class="infobox-field-row" style="display:grid;grid-template-columns:180px 1fr auto;gap:8px;margin-bottom:8px;align-items:center;">' +
    '<input type="text" class="ib-field-label" value="' + ha(label || '') + '" placeholder="Campo (Ex: Local)">' +
    '<input type="text" class="ib-field-val" value="' + ha(value || '') + '" placeholder="Valor (Ex: Manaus, AM)">' +
    '<button type="button" class="btn btn-small btn-danger" onclick="this.parentNode.remove()">Remover</button>' +
    '</div>';
}

function addInfoboxFieldRow() {
  var c = document.getElementById('c-infobox-fields');
  if (c) c.insertAdjacentHTML('beforeend', infoboxFieldRowHtml('', ''));
}

function toggleParticipanteInput(nome) {
  var el = document.getElementById('c-ib-participants');
  if (!el) return;
  var parts = el.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  var idx = parts.findIndex(function(p) { return p.toLowerCase() === nome.toLowerCase(); });
  if (idx === -1) parts.push(nome);
  else parts.splice(idx, 1);
  el.value = parts.join(', ');
}

function renderNovaCena() {
  if (!isModOrAdmin()) return '<div class="alert alert-error">Apenas Moderadores e Administradores podem criar ou editar páginas da Wikia.</div>';

  var editId = sessionStorage.getItem('editCenaId');
  var existing = editId ? listaWikiPosts().find(function(w) { return String(w.id) === String(editId); }) : null;
  var theme = (existing && existing.theme) ? existing.theme : { accentColor: '#ffffff', bannerStyle: 'cinematic', layout: 'sidebar-left', fontFamily: 'serif', bgEffect: 'none', bgm: '' };
  var infobox = (existing && existing.infobox) ? existing.infobox : { show: true, title: '', image: '', caption: '', participants: [], fields: [{ label: 'Localização', value: '' }, { label: 'Arco', value: '' }, { label: 'Clima / Ambiente', value: '' }] };
  activeBuilderBlocks = (existing && Array.isArray(existing.blocks)) ? JSON.parse(JSON.stringify(existing.blocks)) : [];

  var html = '<div class="breadcrumb"><a onclick="navigate(\'cenas\')">Cenas</a> / ' + (existing ? 'Customizar Página' : 'Nova Cena / Post Customizável') + '</div>';
  html += '<div class="cat-header"><span>' + (existing ? 'Customizar Página: ' + h(existing.titulo) : 'Criar Nova Cena / Post na Wikia') + '</span></div>';

  // Painel 1: Dados principais
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>1. Identidade da Cena / Post</span></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:12px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Título da Página</label><input type="text" id="c-titulo" value="' + (existing ? ha(existing.titulo) : '') + '" placeholder="Ex: Ecos sob o Rio Negro"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Subtítulo / Arco (Opcional)</label><input type="text" id="c-subtitulo" value="' + (existing ? ha(existing.subtitulo) : '') + '" placeholder="Ex: Ato I · A Rota Clandestina"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Categoria / Tipo</label><select id="c-categoria">';
  ['Cena de RPG', 'Combate / Batalha', 'Evento / Arco', 'Lore & Mundo', 'Crônica'].forEach(function(cat) {
    var sel = (existing && existing.categoria === cat) ? ' selected' : '';
    html += '<option value="' + ha(cat) + '"' + sel + '>' + h(cat) + '</option>';
  });
  html += '</select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Status</label><select id="c-status">';
  ['Em Andamento', 'Concluída', 'Canônica', 'Hiato'].forEach(function(st) {
    var sel = (existing && existing.status === st) ? ' selected' : '';
    html += '<option value="' + ha(st) + '"' + sel + '>' + h(st) + '</option>';
  });
  html += '</select></div>';
  html += '</div>';
  html += '<div class="form-row"><label>Resumo Curto (exibido no card da listagem)</label><input type="text" id="c-resumo" value="' + (existing ? ha(existing.resumo) : '') + '" placeholder="Breve sinopse da cena ou artigo..."></div>';
  html += '</div>';

  // Painel 2: Customização Visual da Página
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>2. Estilo Visual &amp; Layout da Página</span></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Cor de Destaque da Página</label>';
  html += '<div class="swatch-row"><input type="color" id="c-accent" value="' + ha(theme.accentColor || '#ffffff') + '" style="width:44px;height:34px;cursor:pointer;">';
  [['#ffffff', 'Branco'], ['#d4d4d4', 'Prata'], ['#a3a3a3', 'Cinza Claro'], ['#737373', 'Cinza Médio'], ['#404040', 'Grafite'], ['#262626', 'Carvão']].forEach(function(sw) {
    html += '<button type="button" class="color-swatch-btn" title="' + sw[1] + '" style="background:' + sw[0] + ';" onclick="document.getElementById(\'c-accent\').value=\'' + sw[0] + '\'"></button>';
  });
  html += '</div></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Estilo do Banner de Topo</label><select id="c-banner-style">';
  html += '<option value="cinematic"' + (theme.bannerStyle === 'cinematic' ? ' selected' : '') + '>Cinematográfico (Grande)</option>';
  html += '<option value="standard"' + (theme.bannerStyle === 'standard' ? ' selected' : '') + '>Padrão</option>';
  html += '<option value="compact"' + (theme.bannerStyle === 'compact' ? ' selected' : '') + '>Compacto</option>';
  html += '<option value="none"' + (theme.bannerStyle === 'none' ? ' selected' : '') + '>Sem Banner</option>';
  html += '</select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Layout da Página</label><select id="c-layout">';
  html += '<option value="sidebar-left"' + (theme.layout === 'sidebar-left' ? ' selected' : '') + '>Infobox na Esquerda + Conteúdo</option>';
  html += '<option value="sidebar-right"' + (theme.layout === 'sidebar-right' ? ' selected' : '') + '>Conteúdo + Infobox na Direita</option>';
  html += '<option value="full"' + (theme.layout === 'full' ? ' selected' : '') + '>Largura Total (Sem Infobox)</option>';
  html += '<option value="book"' + (theme.layout === 'book' ? ' selected' : '') + '>Modo Livro (Coluna Central Literária)</option>';
  html += '</select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Tipografia de Leitura</label><select id="c-font">';
  html += '<option value="serif"' + (theme.fontFamily === 'serif' ? ' selected' : '') + '>Literária (Serif — Lora)</option>';
  html += '<option value="sans"' + (theme.fontFamily === 'sans' ? ' selected' : '') + '>Moderna (Sans — Inter)</option>';
  html += '<option value="mono"' + (theme.fontFamily === 'mono' ? ' selected' : '') + '>Monoespaçada (Arquivo Técnico)</option>';
  html += '</select></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Atmosfera de Fundo</label><select id="c-bg-effect">';
  html += '<option value="none"' + (theme.bgEffect === 'none' ? ' selected' : '') + '>Fundo Minimalista Puro</option>';
  html += '<option value="aura"' + (theme.bgEffect === 'aura' ? ' selected' : '') + '>Luz Radial Sutil</option>';
  html += '<option value="grid"' + (theme.bgEffect === 'grid' ? ' selected' : '') + '>Grade Tática Sutil</option>';
  html += '<option value="dots"' + (theme.bgEffect === 'dots' ? ' selected' : '') + '>Pontilhado Sutil</option>';
  html += '</select></div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>URL da Imagem de Banner (Opcional)</label><input type="text" id="c-banner" value="' + (existing ? ha(existing.banner) : '') + '" placeholder="https://... (deixe vazio para usar fundo neutro)"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Música Tema / Ambiente (Opcional)</label><input type="text" id="c-bgm" value="' + ha(theme.bgm || '') + '" placeholder="Ex: OST — Rain Over the Black River"></div>';
  html += '</div></div>';

  // Painel 3: Infobox Customizável
  var partsStr = Array.isArray(infobox.participants) ? infobox.participants.join(', ') : '';
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>3. Infobox Lateral Customizável</span><label style="display:inline-flex;align-items:center;gap:6px;margin:0;cursor:pointer;"><input type="checkbox" id="c-ib-show"' + (infobox.show !== false ? ' checked' : '') + '> Exibir Infobox</label></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Título da Infobox</label><input type="text" id="c-ib-title" value="' + ha(infobox.title || '') + '" placeholder="Ex: Registro de Cena"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Imagem da Infobox (URL)</label><input type="text" id="c-ib-image" value="' + ha(infobox.image || '') + '" placeholder="https://..."></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Legenda da Imagem</label><input type="text" id="c-ib-caption" value="' + ha(infobox.caption || '') + '" placeholder="Legenda opcional"></div>';
  html += '</div>';

  html += '<div class="form-row"><label>Participantes da Cena (separe por vírgula ou clique nos personagens abaixo)</label>';
  html += '<input type="text" id="c-ib-participants" value="' + ha(partsStr) + '" placeholder="Ex: Shin Hae, Shidō Akane">';
  var chars = listaPersonagens();
  if (chars.length) {
    html += '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><span style="font-size:11px;color:var(--text-muted);">Adicionar rápido:</span>';
    chars.forEach(function(ch) {
      html += '<button type="button" class="btn btn-small" style="padding:3px 9px;font-size:11px;" onclick="toggleParticipanteInput(\'' + ha(ch.nome) + '\')">+ ' + h(ch.nome) + '</button>';
    });
    html += '</div>';
  }
  html += '</div>';

  html += '<label>Campos Personalizados da Infobox</label>';
  html += '<div id="c-infobox-fields">';
  if (Array.isArray(infobox.fields)) {
    infobox.fields.forEach(function(f) { html += infoboxFieldRowHtml(f.label, f.value); });
  }
  html += '</div>';
  html += '<button type="button" class="btn btn-small" onclick="addInfoboxFieldRow()">+ Adicionar Linha na Infobox</button>';
  html += '</div>';

  // Painel 4: Texto de Abertura
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>4. Texto de Abertura / Contextualização da Cena</span></div>';
  html += buildEditor('c-editor', existing ? existing.descricao : '', 'Escreva a introdução da cena, ambientação inicial ou lore...');
  html += '</div>';

  // Painel 5: Construtor de Blocos Modulares
  html += renderBlockBuilderSection();

  var btnLabel = existing ? 'Salvar Alterações da Página' : 'Publicar Cena / Post na Wikia';
  var onclick = existing ? 'salvarEdicaoCena(' + idJs(existing.id) + ')' : 'submitNovaCena()';
  html += '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">';
  html += '<button class="btn btn-primary" onclick="' + onclick + '">' + btnLabel + '</button>';
  html += '<button type="button" class="btn" onclick="previewCenaModal()">Pré-visualizar</button>';
  html += '<button type="button" class="btn" onclick="exportarCenaJson()">Exportar JSON</button>';
  html += '<button type="button" class="btn" onclick="importarCenaJsonModal()">Importar JSON</button>';
  html += '<button class="btn" onclick="navigate(\'cenas\')">Cancelar</button>';
  html += '</div>';
  return html;
}

function previewPersonagemModal() {
  var d = lerFormularioPersonagem();
  var html = '<div style="max-height:70vh;overflow-y:auto;padding-right:4px;">';
  html += '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle);">';
  if (d.imagem) html += '<img src="' + ha(d.imagem) + '" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-medium);">';
  html += '<div><h3 style="font-size:18px;font-weight:700;color:var(--text-primary);">' + h(d.nome || 'Sem Nome') + '</h3>';
  html += '<div style="font-size:12px;color:var(--text-secondary);">' + h(d.titulo || '') + ' · ' + h(d.raca || '') + '</div></div></div>';
  html += '<div class="char-sheet-body" style="padding:18px;">' + renderRichText(d.descricao || 'Sem biografia.') + '</div>';
  html += '</div>';
  showModal('Pré-visualização: ' + (d.nome || 'Personagem'), html);
}

function exportarPersonagemJson() {
  var d = lerFormularioPersonagem();
  var blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = ((d.nome || 'personagem').toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showAlert('Ficha exportada em JSON.', 'success');
}

function importarPersonagemJsonModal() {
  var body = '<div class="form-row"><label>Cole o JSON da ficha de personagem abaixo</label><textarea id="import-char-json" rows="8" style="font-family:var(--font-mono);font-size:12px;" placeholder=\'{"nome": "...", "titulo": "..."}\'></textarea></div>';
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="confirmImportPersonagemJson()">Carregar Dados</button></div>';
  showModal('Importar Ficha via JSON', body);
}

function confirmImportPersonagemJson() {
  var raw = (document.getElementById('import-char-json') || {}).value || '';
  try {
    var d = JSON.parse(raw);
    if (d.nome !== undefined && document.getElementById('p-nome')) document.getElementById('p-nome').value = d.nome;
    if (d.titulo !== undefined && document.getElementById('p-titulo')) document.getElementById('p-titulo').value = d.titulo;
    if (d.raca !== undefined && document.getElementById('p-raca')) document.getElementById('p-raca').value = d.raca;
    if (d.idade !== undefined && document.getElementById('p-idade')) document.getElementById('p-idade').value = d.idade;
    if (d.afiliacao !== undefined && document.getElementById('p-afiliacao')) document.getElementById('p-afiliacao').value = d.afiliacao;
    if (d.imagem !== undefined && document.getElementById('p-imagem')) document.getElementById('p-imagem').value = d.imagem;
    if (d.resumo !== undefined && document.getElementById('p-resumo')) document.getElementById('p-resumo').value = d.resumo;
    if (d.descricao !== undefined && document.getElementById('p-editor')) {
      document.getElementById('p-editor').innerHTML = d.descricao;
      updateEditorStats('p-editor');
    }
    closeModal();
    showAlert('Dados importados para o formulário.', 'success');
  } catch (e) {
    showAlert('JSON inválido.', 'error');
  }
}

function previewCenaModal() {
  var d = lerFormularioCena();
  var html = '<div style="max-height:72vh;overflow-y:auto;padding-right:4px;">';
  html += '<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">';
  html += '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);">' + h(d.categoria) + ' · ' + h(d.status) + '</div>';
  html += '<h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-top:4px;">' + h(d.titulo || 'Sem Título') + '</h2>';
  if (d.subtitulo) html += '<div style="font-size:13px;color:var(--text-secondary);">' + h(d.subtitulo) + '</div>';
  html += '</div>';
  if (d.descricao) {
    html += '<div class="char-sheet-body" style="padding:18px;margin-bottom:16px;">' + renderRichText(d.descricao) + '</div>';
  }
  if (d.blocks && d.blocks.length) {
    html += renderModularBlocks(d.blocks);
  }
  html += '</div>';
  showModal('Pré-visualização da Página', html);
}

function exportarCenaJson() {
  var d = lerFormularioCena();
  var blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = ((d.titulo || 'cena-wikia').toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showAlert('Estrutura da página exportada em JSON.', 'success');
}

function importarCenaJsonModal() {
  var body = '<div class="form-row"><label>Cole o JSON da página customizável abaixo</label><textarea id="import-cena-json" rows="8" style="font-family:var(--font-mono);font-size:12px;" placeholder=\'{"titulo": "...", "blocks": [...]}\'></textarea></div>';
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="confirmImportCenaJson()">Carregar Página</button></div>';
  showModal('Importar Página via JSON', body);
}

function confirmImportCenaJson() {
  var raw = (document.getElementById('import-cena-json') || {}).value || '';
  try {
    var d = JSON.parse(raw);
    if (d.titulo !== undefined && document.getElementById('c-titulo')) document.getElementById('c-titulo').value = d.titulo;
    if (d.subtitulo !== undefined && document.getElementById('c-subtitulo')) document.getElementById('c-subtitulo').value = d.subtitulo;
    if (d.resumo !== undefined && document.getElementById('c-resumo')) document.getElementById('c-resumo').value = d.resumo;
    if (d.banner !== undefined && document.getElementById('c-banner')) document.getElementById('c-banner').value = d.banner;
    if (d.descricao !== undefined && document.getElementById('c-editor')) {
      document.getElementById('c-editor').innerHTML = d.descricao;
      updateEditorStats('c-editor');
    }
    if (Array.isArray(d.blocks)) {
      activeBuilderBlocks = d.blocks;
      refreshBuilderDOM();
    }
    closeModal();
    showAlert('Estrutura JSON carregada no construtor.', 'success');
  } catch (e) {
    showAlert('JSON inválido.', 'error');
  }
}

function lerFormularioCena() {
  syncBuilderBlocksFromDOM();
  var fields = [];
  document.querySelectorAll('#c-infobox-fields .infobox-field-row').forEach(function(r) {
    var lb = r.querySelector('.ib-field-label').value.trim();
    var vl = r.querySelector('.ib-field-val').value.trim();
    if (lb || vl) fields.push({ label: lb, value: vl });
  });
  var partsRaw = document.getElementById('c-ib-participants').value;
  var participants = partsRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);

  return {
    titulo: document.getElementById('c-titulo').value.trim(),
    subtitulo: document.getElementById('c-subtitulo').value.trim(),
    categoria: document.getElementById('c-categoria').value,
    status: document.getElementById('c-status').value,
    resumo: document.getElementById('c-resumo').value.trim(),
    banner: document.getElementById('c-banner').value.trim(),
    descricao: getEditorContent('c-editor'),
    theme: {
      accentColor: document.getElementById('c-accent').value,
      bannerStyle: document.getElementById('c-banner-style').value,
      layout: document.getElementById('c-layout').value,
      fontFamily: document.getElementById('c-font').value,
      bgEffect: document.getElementById('c-bg-effect').value,
      bgm: document.getElementById('c-bgm').value.trim()
    },
    infobox: {
      show: document.getElementById('c-ib-show').checked,
      title: document.getElementById('c-ib-title').value.trim(),
      image: document.getElementById('c-ib-image').value.trim(),
      caption: document.getElementById('c-ib-caption').value.trim(),
      participants: participants,
      fields: fields
    },
    blocks: activeBuilderBlocks
  };
}

function submitNovaCena() {
  if (!isModOrAdmin()) { showAlert('Apenas Moderadores e Administradores podem criar páginas na Wikia.', 'error'); return; }
  var dados = lerFormularioCena();
  if (!dados.titulo) { showAlert('Preencha o título da cena/post.', 'error'); return; }

  apiRequest('POST', '/api/wiki-posts', dados, function(err, data) {
    if (err) {
      var novoLocal = Object.assign({ id: DB.nextWikiPostId++, turns: [] }, dados);
      DB.wikiPosts.unshift(novoLocal);
      saveDB();
      navigate('cenaView', novoLocal.id);
      showAlert('Cena criada (salva localmente).', 'success');
      return;
    }
    if (serverWikiPosts === null) serverWikiPosts = [];
    serverWikiPosts.unshift(data.wikiPost);
    navigate('cenaView', data.wikiPost.id);
    showAlert('Cena publicada na Wikia!', 'success');
  });
}

function editarCena(id) {
  sessionStorage.setItem('editCenaId', id);
  navigate('novaCena');
}

function salvarEdicaoCena(id) {
  if (!isModOrAdmin()) { showAlert('Sem permissão.', 'error'); return; }
  var dados = lerFormularioCena();
  if (!dados.titulo) { showAlert('O título é obrigatório.', 'error'); return; }

  if (typeof id === 'number') {
    var localW = DB.wikiPosts.find(function(x) { return x.id === id; });
    if (!localW) return;
    Object.assign(localW, dados);
    saveDB();
    sessionStorage.removeItem('editCenaId');
    navigate('cenaView', id);
    showAlert('Página customizada salva!', 'success');
    return;
  }

  apiRequest('PUT', '/api/wiki-posts/' + id, dados, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    var idx = serverWikiPosts.findIndex(function(x) { return x.id === id; });
    if (idx !== -1) serverWikiPosts[idx] = data.wikiPost;
    sessionStorage.removeItem('editCenaId');
    navigate('cenaView', id);
    showAlert('Página customizada salva!', 'success');
  });
}

function deletarCena(id) {
  if (!isModOrAdmin()) return;
  if (!confirm('Deseja excluir esta página de cena e todos os seus turnos?')) return;

  if (typeof id === 'number') {
    DB.wikiPosts = DB.wikiPosts.filter(function(w) { return w.id !== id; });
    saveDB();
    navigate('cenas');
    return;
  }

  apiRequest('DELETE', '/api/wiki-posts/' + id, undefined, function(err) {
    if (err) { showAlert(err, 'error'); return; }
    serverWikiPosts = serverWikiPosts.filter(function(w) { return w.id !== id; });
    navigate('cenas');
  });
}

function enviarCenaAoServidor(id) {
  if (!isModOrAdmin()) return;
  var w = DB.wikiPosts.find(function(x) { return x.id === id; });
  if (!w) return;
  apiRequest('POST', '/api/wiki-posts', w, function(err, data) {
    if (err) { showAlert(err, 'error'); return; }
    DB.wikiPosts = DB.wikiPosts.filter(function(x) { return x.id !== id; });
    saveDB();
    if (serverWikiPosts === null) serverWikiPosts = [];
    serverWikiPosts.unshift(data.wikiPost);
    navigate('cenaView', data.wikiPost.id);
    showAlert('Cena sincronizada com o banco de dados!', 'success');
  });
}

// ==================== PERFIL, REGISTRO, SOBRE & ADMIN ====================

function renderPerfil() {
  if (!DB.session) {
    return '<div class="alert alert-info"><span>Você não está logado.</span><div><a class="btn btn-small btn-primary" onclick="showLoginModal()">Entrar</a> <a class="btn btn-small" onclick="navigate(\'registro\')">Cadastrar</a></div></div>';
  }
  var u = DB.session;
  var userThreads = DB.threads.filter(function(t) { return t.authorId === u.id; });
  var userPosts = DB.posts.filter(function(p) { return p.authorId === u.id; });

  var html = '<div class="breadcrumb">Início / Perfil</div>';
  html += '<div class="cat-header"><span>Perfil de ' + h(u.username) + '</span><button class="btn btn-danger btn-small" onclick="doLogout()">Sair da conta</button></div>';

  html += '<div class="profile-grid">';
  html += '<div class="profile-avatar-card">';
  if (u.avatar) {
    html += '<img class="avatar-preview" src="' + ha(u.avatar) + '" alt="' + ha(u.username) + '">';
  } else {
    html += '<div class="avatar-preview-ph">' + h(u.username.substring(0, 1)) + '</div>';
  }
  html += '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">' + h(u.username) + '</div>';
  html += '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">' + h(u.title || 'Membro') + '</div>';
  html += '<div style="margin-bottom:14px;">' + badgeHtml(u) + '</div>';
  if (u.bio) {
    html += '<div style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;padding:12px 0;border-top:1px solid var(--border-subtle);text-align:left;">' + h(u.bio) + '</div>';
  }
  html += '<div style="font-size:11px;color:var(--text-muted);border-top:1px solid var(--border-subtle);padding-top:12px;margin-top:8px;display:flex;justify-content:space-between;">';
  html += '<span>Posts: <b style="color:var(--text-primary);">' + (u.posts || 0) + '</b></span>';
  html += '<span>Desde: <b style="color:var(--text-primary);">' + h(u.joinDate) + '</b></span>';
  html += '</div>';
  html += '</div>';

  html += '<div>';
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>Editar Identidade &amp; Credenciais</span></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
  html += '<div class="form-row"><label>Título Pessoal / Epíteto</label><input type="text" id="prof-title" value="' + ha(u.title || '') + '" placeholder="Ex: Cronista do Vazio"></div>';
  html += '<div class="form-row"><label>URL do Avatar (Imagem)</label><input type="text" id="prof-avatar" value="' + ha(u.avatar || '') + '" placeholder="https://..."></div>';
  html += '</div>';
  html += '<div class="form-row"><label>Biografia / Assinatura de Perfil</label><textarea id="prof-bio" rows="3" placeholder="Escreva uma breve apresentação ou citação do seu perfil...">' + h(u.bio || '') + '</textarea></div>';
  html += '<div class="form-row"><label>Alterar Senha (deixe em branco para manter a atual)</label><input type="password" id="prof-password" placeholder="Nova senha (mín. 6 caracteres)"></div>';
  html += '<button class="btn btn-primary" onclick="salvarEdicaoPerfil()">Salvar Alterações do Perfil</button>';
  html += '</div>';

  if (userThreads.length) {
    html += '<div class="builder-panel">';
    html += '<div class="builder-panel-title"><span>Meus Tópicos Recentes (' + userThreads.length + ')</span></div>';
    userThreads.slice(0, 6).forEach(function(t) {
      html += '<div style="padding:8px 0;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;font-size:13px;">';
      html += '<a onclick="navigate(\'thread\',' + idJs(t.id) + ')" style="font-weight:500;">' + h(t.title) + '</a>';
      html += '<span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">' + h(t.created) + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  html += '</div>';

  if (u.role !== 'admin') {
    html += '<div class="cat-header" style="margin-top:18px;"><span>Validação de ADM (1 tentativa)</span></div>';
    html += '<div class="builder-panel">';
    if (jaTentouValidarAdmin()) {
      html += '<div class="alert alert-error" style="margin-bottom:0;">Você já usou sua única tentativa de validação.</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">';
      html += '<div class="form-row"><label>Nome</label><input type="text" id="adm-nome" placeholder="Seu nome"></div>';
      html += '<div class="form-row"><label>Cargo</label><input type="text" id="adm-cargo" placeholder="adm, moderador, etc"></div>';
      html += '<div class="form-row"><label>Nível</label><input type="text" id="adm-nivel" placeholder="1, 5, 99..."></div>';
      html += '</div>';
      html += '<button class="btn btn-warn" id="validar-adm" onclick="onClickValidarAdmin()">Validar agora</button>';
      html += '<div id="adm-message" style="margin-top:8px;font-size:12px;"></div>';
    }
    html += '</div>';
  }

  return html;
}

function salvarEdicaoPerfil() {
  if (!DB.session) return;
  var title = (document.getElementById('prof-title') || {}).value.trim();
  var avatar = (document.getElementById('prof-avatar') || {}).value.trim();
  var bio = (document.getElementById('prof-bio') || {}).value.trim();
  var newPassword = (document.getElementById('prof-password') || {}).value;

  var payload = {
    userId: DB.session.id,
    title: title || 'Membro',
    avatar: avatar,
    bio: bio
  };
  if (newPassword && newPassword.trim()) {
    payload.newPassword = newPassword;
  }

  apiRequest('PUT', '/api/auth/profile', payload, function(err, data) {
    if (err) {
      DB.session.title = payload.title;
      DB.session.avatar = payload.avatar;
      DB.session.bio = payload.bio;
      var uLocal = getUser(DB.session.id);
      if (uLocal) {
        uLocal.title = payload.title;
        uLocal.avatar = payload.avatar;
        uLocal.bio = payload.bio;
      }
      saveDB();
      render();
      showAlert('Perfil atualizado localmente.', 'success');
      return;
    }
    syncSessionUser(data.user);
    render();
    showAlert('Perfil atualizado com sucesso.', 'success');
  });
}

function renderRegistro() {
  if (DB.session) return '<div class="alert alert-info">Você já está logado.</div>';
  var html = '<div class="breadcrumb">Início / Registro</div>';
  html += '<div class="cat-header"><span>Criar Conta no aetherverse vault</span></div>';
  html += '<div class="builder-panel" style="max-width:440px;">';
  html += '<div class="form-row"><label>Usuário</label><input type="text" id="reg-username" placeholder="Seu nome de usuário"></div>';
  html += '<div class="form-row"><label>Email</label><input type="email" id="reg-email" placeholder="seu@email.com"></div>';
  html += '<div class="form-row"><label>Senha</label><input type="password" id="reg-password" placeholder="Mínimo de 6 caracteres"></div>';
  html += '<div class="form-row"><label>Confirmar Senha</label><input type="password" id="reg-confirm" placeholder="Repita a senha"></div>';
  html += '<button class="btn btn-primary" onclick="submitRegistro()" style="width:100%;">Cadastrar Conta</button>';
  html += '</div>';
  return html;
}

function renderSobre() {
  var html = '<div class="breadcrumb">Início / Sobre</div>';
  html += '<div class="cat-header"><span>Sobre o Projeto</span></div>';
  html += '<div class="char-sheet-body" style="margin-bottom:24px;">';
  html += '<p><b>aetherverse vault</b> é um fórum e wikia interativa para postar histórias, criar fichas de personagem, registrar cenas customizadas e desenvolver roleplay. Tudo fica guardado em banco de dados próprio do projeto.</p>';
  html += '<p>O aetherverse vault constitui um universo ficcional de Roleplay (RPG) de autoria original, cujos personagens, enredos, ambientações e demais elementos narrativos são de criação e titularidade exclusiva de seus idealizadores e mantenedores. Eventuais imagens de referência utilizadas nas fichas de personagens — sejam elas extraídas de wikis, bancos de imagem ou outras fontes externas — são empregadas estritamente como recurso ilustrativo e de caráter não-comercial, sob amparo dos princípios de uso justo e de citação para fins de caracterização ficcional, não configurando, em nenhuma hipótese, apropriação de autoria sobre a obra literária em si, a qual permanece integralmente resguardada por direito autoral em favor de seus criadores.</p>';
  html += '<p style="margin-bottom:0;">Está nos planos do projeto, a médio e longo prazo, expandir o aetherverse vault para além deste fórum: a proposta é transformá-lo em uma plataforma aberta a todos os rpgistas textuais que desejem narrar histórias dentro deste universo, além de dar origem, futuramente, a uma série de livros baseada no material produzido pela comunidade e pelos criadores originais.</p>';
  html += '</div>';

  html += '<div class="cat-header"><span>Equipe Atual</span></div>';
  html += '<div class="char-grid">';
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
  html += '</div>';

  return html;
}

function renderAdmin() {
  if (!isAdmin()) return '<div class="alert alert-error">Acesso negado.</div>';

  var html = '<div class="breadcrumb">Início / Painel Admin</div>';
  html += '<div class="cat-header"><span>Gerenciar Usuários</span><button class="btn btn-small" onclick="exportarBackupGeralJson()">Exportar Backup JSON</button></div>';
  html += '<table class="forum-table"><thead><tr><th>Usuário</th><th>Cargo</th><th>Posts</th><th>Ações</th></tr></thead><tbody>';
  DB.users.forEach(function(u) {
    html += '<tr><td><b>' + h(u.username) + '</b></td><td>' + badgeHtml(u) + '</td><td>' + (u.posts || 0) + '</td><td style="display:flex;gap:8px;align-items:center;">';
    html += '<select style="width:auto;" onchange="alterarCargoUsuario(' + u.id + ', this.value)">';
    html += '<option value="member"' + (u.role === 'member' ? ' selected' : '') + '>Membro</option>';
    html += '<option value="moderador"' + (u.role === 'moderador' ? ' selected' : '') + '>Moderador</option>';
    html += '<option value="admin"' + (u.role === 'admin' ? ' selected' : '') + '>Admin</option>';
    html += '</select>';
    html += '<button class="btn btn-small btn-danger" onclick="deletarUsuario(' + u.id + ')">Excluir</button>';
    html += '</td></tr>';
  });
  html += '</tbody></table>';

  html += '<div class="cat-header"><span>Categorias do Fórum</span></div>';
  html += '<table class="forum-table"><thead><tr><th>Nome</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>';
  DB.categories.forEach(function(c) {
    html += '<tr><td><b>' + h(c.name) + '</b></td><td>' + h(c.desc) + '</td><td><button class="btn btn-small btn-danger" onclick="removerCategoria(' + c.id + ')">Excluir</button></td></tr>';
  });
  html += '</tbody></table>';
  html += '<div class="builder-panel">';
  html += '<div class="builder-panel-title"><span>Nova Categoria</span></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;">';
  html += '<div class="form-row" style="margin-bottom:0"><label>Nome</label><input type="text" id="nova-cat-nome" placeholder="Nome da categoria"></div>';
  html += '<div class="form-row" style="margin-bottom:0"><label>Descrição</label><input type="text" id="nova-cat-desc" placeholder="Descrição"></div>';
  html += '<button class="btn btn-primary" onclick="adicionarCategoria()">Adicionar</button>';
  html += '</div></div>';

  html += '<div class="stats-bar"><span><b>' + DB.users.length + '</b> usuários</span><span><b>' + DB.threads.length + '</b> tópicos</span><span><b>' + DB.posts.length + '</b> posts</span><span><b>' + listaPersonagens().length + '</b> personagens</span><span><b>' + listaWikiPosts().length + '</b> cenas</span></div>';
  return html;
}

function exportarBackupGeralJson() {
  var dump = {
    exportedAt: new Date().toISOString(),
    categories: DB.categories,
    threads: DB.threads,
    posts: DB.posts,
    personagens: listaPersonagens(),
    wikiPosts: listaWikiPosts()
  };
  var blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aetherverse-vault-backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showAlert('Backup completo exportado em JSON.', 'success');
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
  bodyHtml += '<div class="form-row"><label>Usuário</label><input type="text" id="login-username" placeholder="Seu nome de usuário"></div>';
  bodyHtml += '<div class="form-row"><label>Senha</label><input type="password" id="login-password" placeholder="Sua senha" onkeydown="if(event.key===\'Enter\')doLogin()"></div>';
  bodyHtml += '<button class="btn btn-primary" style="width:100%;" onclick="doLogin()">Entrar</button>';
  bodyHtml += '<div style="margin-top:14px;font-size:12px;text-align:center;color:var(--text-secondary);">Não tem conta? <a onclick="closeModal();navigate(\'registro\')">Cadastre-se gratuitamente</a></div>';
  showModal('Entrar no aetherverse vault', bodyHtml);
}

function showAlert(msg, type) {
  var container = document.getElementById('toast-container');
  if (container) {
    var toast = document.createElement('div');
    toast.className = 'toast-item toast-' + (type || 'info');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3500);
    return;
  }
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
  var catId = parseInt(document.getElementById('thread-cat').value, 10);
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
    '<div style="margin-top:10px;"><button class="btn btn-primary" onclick="saveEditPost(' + postId + ')">Salvar</button></div>'
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
    var n = parseInt(bruto, 10);
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
    '<div style="display:grid;grid-template-columns:160px 1fr auto;gap:10px;margin-bottom:8px;align-items:end;">' +
    '<div><label>Tipo do Card</label><select class="skill-tipo"><option value="skill"' + (!isEquip ? ' selected' : '') + '>Skill</option><option value="equipamento"' + (isEquip ? ' selected' : '') + '>Equipamento</option></select></div>' +
    '<div><label>Nome</label><input type="text" class="skill-nome" value="' + ha(nome || '') + '" placeholder="Ex: Poison of Wrath"></div>' +
    '<button type="button" class="btn btn-small btn-danger" onclick="this.parentNode.parentNode.remove()">Remover</button>' +
    '</div>' +
    '<div><label>Descrição</label><textarea class="skill-desc" rows="2" spellcheck="false" placeholder="O que a habilidade ou equipamento faz...">' + h(descricao || '') + '</textarea></div>' +
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
  syncBuilderBlocksFromDOM();
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
    mascaraTier: document.getElementById('p-mascara-tier').value.trim(),
    theme: {
      accentColor: (document.getElementById('p-accent-color') || {}).value || '#ffffff'
    },
    blocks: activeBuilderBlocks
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

  if (typeof id === 'number') {
    var p = DB.personagens.find(function(x) { return x.id === id; });
    if (!p) return;
    Object.assign(p, dados);
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
    mascaraTier: p.mascaraTier || '',
    blocks: p.blocks || [],
    theme: p.theme || {}
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
  return pontos > 0;
}

function verificarNivelAcesso(nivel) {
  var nivelNumero = parseInt(nivel, 10);
  if (isNaN(nivelNumero)) nivelNumero = 0;
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
    if (msg) msg.textContent = 'Acesso de administrador concedido.';
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
  carregarWikiPostsServidor();

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

