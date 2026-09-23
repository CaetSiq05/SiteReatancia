// Banco de dados com as histórias descritas pelos próprios integrantes
const membersStories = {
    soso: {
        name: "Soso",
        role: "Vocalista | Engenharia UNESP",
        story: "Cantar na festa junina da UNESP foi surreal! Começamos do zero naquele coletivo, e ver a galera cantando Paramore junto com a gente não tem preço. Conciliar os laboratórios de Engenharia de Controle e Automação com os ensaios é pura loucura, mas quando estou no palco com o microfone na mão, sei que toda a correria vale a pena!"
    },
    caets: {
        name: "Caets",
        role: "Guitarra Solo | Engenharia UNESP",
        story: `Desde pequeno tenho uma paixão por música, nasci em uma família de músicos e sempre fui incentivado a tocar instrumentos.
        Comecei no clarinete aos 7 anos, depois migrei para a percussão aos 12 anos, e finalmente encontrei minha verdadeira paixão na guitarra
        aos 15 anos. Já toquei em orquestras, bandas de rock e tenho composições próprias desde os 10 anos. <p>Tenho orgulho de dizer que a
        Reatância é o meu projetinho da faculdade, apesar de não ser exatamente relacionado com o curso, ainda me lembro quando comecei a
        conversar com o Regata sobre a ideia de formar uma banda, ele me avisou que estava sem tempo, mas que topava se eu quisesse seguir em frente.
        Naquela mesma semana, surgiu a oportunidade de apresentarmos na abertura de uma palestra na UNESP. Como a professora responsável sabia
        que ele tocava violão, fez o convite, ele me chamou para somar e ela aprovou a parceria de imediato.
        <p>Ensaiamos por uma semana e nos apresentamos. Após o evento, ficamos na sala fazendo um som acústico informal com o pessoal que continuava
        por lá, incluindo a Sophia — foi ali que descobri a voz incrível dela. No dia seguinte, ao final da reunião do coletivo do qual fazíamos
        parte, convidei-a para assumir os vocais da banda e ela aceitou no mesmo instante.
        <p>O próximo passo era encontrar o peso do grupo, baixo e batera. Naquele fim de semana, fui trocar uma ideia com meu amigo Vinícius. Como ele mora longe,
        achei que não seria viável, apesar de saber que é baixista. Para minha surpresa, assim que mencionei o projeto, ele contou que estava louco
        para voltar a tocar e entrou para o time imediatamente. Para a bateria, mandei mensagem para diversos músicos de várias regiões, sem muito
        sucesso, até que um amigo me indicou o Bugas. Chamei ele no Instagram e, por coincidência, ele disse que fazia meses que procurava uma banda.
        <p>E assim nasceu a Reatância, com sua formação completa. Desde então, seguimos unidos nessa jornada musical. O resto é história — e a nossa está apenas começando!`
    },
    regata: {
        name: "Regata",
        role: "Guitarra Base | Engenharia UNESP",
        story: "Sou eu quem segura a onda na harmonia pras loucuras que o Caets faz na guitarra solo! Somos de turmas diferentes da UNESP, mas a música juntou a gente. O nome Reatância tem tudo a ver com o nosso curso e o som pesado que fazemos. Quando a gente junta as duas guitarras, a parede de som fica absurda."
    },
    tejada: {
        name: "Tejada",
        role: "Baixista",
        story: "Quando o Caets me chamou pra esse projeto, aceitei na hora. O baixo é o coração da banda, pulsando junto com a bateria do Bugas. A gente cria aquele grave que faz o peito tremer nos shows. Mesmo eu não sendo da mesma turma que a galera que fundou a banda, a sintonia que a gente criou no palco bateu desde o primeiro dia."
    },
    bugas: {
        name: "Bugas",
        role: "Baterista",
        story: `Salve, salve, Bugas aqui.
        <p>Minha infância sempre teve música envolvida, seja uma paródia com a minha mãe que era uma
        piada interna, seja em uma viagem de 5 minutos que colocávamos música no Escort azul, ou nos edits de dinossauros ao som de
        Three Days Grace, enfim, sempre teve música no meu dia a dia.
        <p>Comecei bem novo, no violão. Eu odiava aquelas aulas, eu pegava o violão e ficava batucando no ritmo da aula. Foi quando minha
        mãe teve uma ótima ideia: me viu batucando e me colocou na aula de flauta doce... Não acho que foi uma das melhores ideias, até que
        ela me viu usando a flauta doce de baqueta na cama e aí sim, com apenas 8 aninhos, ela me colocou para tocar bateria. Ali me
        apaixonei. A primeira música completa que toquei sozinho foi Every Breath You Take, do The Police. Foi bem emocionante, mas eu
        sentia que tinha alguma coisa faltando. Foi quando, num edit de dinossauro, eu conheci as músicas do Avenged Sevenfold. Me apaixonei
        na hora, principalmente pela bateria que o The Rev fazia - que acabou sendo meu ídolo até hoje-. Então comecei devagar no metal,
        primeiro com SOAD, Slipknot, até chegar no A7X.
        <p> Mais pra frente, entrei na minha primeira banda, os Mozartistas. Foi uma época legal, fazíamos shows, entrevistas em estações de
        rádio, era muito legal. Mas acabou que cada um foi seguir seu rumo, então a banda acabou se desmanchando.
        <p> Sobre a Reatância, foi bem engraçado como eu entrei. Eu estava muito desanimado no horário de almoço do meu serviço — que na
        época era a Vans Sorocaba — porque eu estava querendo entrar numa banda de novo, estava voltando a tocar recentemente e deu uma
        sede de banda. Foi quando o Caetano, do completo e mais absoluto nada, me manda uma mensagem dizendo que um amigo meu me indicou
        pra entrar na banda dele como baterista. Eu aceitei na hora, sem nem pensar duas vezes.
        <p> Agora estamos aí. Não vejo a hora de a gente começar a fazer nossas músicas autorais e ficarmos conhecidos como os maiores
        músicos de Sorocaba e região!`
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Site da Banda Reatância carregado com sucesso!');

    // LÓGICA DOS VÍDEOS NO HOVER E DO MODAL DE INTEGRANTES
    const memberCards = document.querySelectorAll('.member-card');
    const modalOverlay = document.getElementById('member-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalRole = document.getElementById('modal-role');
    const modalText = document.getElementById('modal-text');

    memberCards.forEach(card => {
        const video = card.querySelector('.hover-video');
        const memberId = card.getAttribute('data-member');

        // 1. Play e Pause do vídeo apenas quando o mouse passa por cima
        if (video) {
            card.addEventListener('mouseenter', () => {
                video.play().catch(err => console.log("Erro de auto-play do vídeo: ", err));
            });
            
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }

        // 2. Abrir a caixa flutuante ao clicar no card
        card.addEventListener('click', () => {
            if (memberId && membersStories[memberId]) {
                const data = membersStories[memberId];
                modalTitle.textContent = data.name;
                modalRole.textContent = data.role;
                modalText.innerHTML = `<p>${data.story}</p>`;
                
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 3. Funções para fechar o Modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalCloseBtn && modalOverlay) {
        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // LÓGICA DE AUTENTICAÇÃO E REDIRECIONAMENTO (LOJA E LOGIN)
    const btnLogin = document.getElementById('btn-login');
    
    // Verifica se o usuário tem a chave 'logado' salva no navegador
    const isLogado = localStorage.getItem('logado') === 'true';

    if (btnLogin) {
        if (isLogado) {
            // Se estiver logado, muda o botão para "Sair"
            btnLogin.textContent = 'Sair';
            btnLogin.addEventListener('click', () => {
                localStorage.removeItem('logado');
                window.location.reload();
            });
        } else {
            btnLogin.addEventListener('click', () => {
                window.location.href = 'login.html?origem=home';
            });
        }
    }

    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isLogado) {
                // Se já estiver logado, vai direto para as compras
                window.location.href = 'compras.html';
            } else {
                // Se não estiver, manda fazer o login primeiro
                window.location.href = 'login.html?origem=loja';
            }
        });
    });

    // CARROSSEL DE PRODUTOS DA LOJA
    const productCards = document.querySelectorAll('.product-card[data-images]');

    productCards.forEach(card => {
        const images = JSON.parse(card.getAttribute('data-images'));
        const imgElement = card.querySelector('.product-img');
        const prevBtn = card.querySelector('.prev-btn');
        const nextBtn = card.querySelector('.next-btn');

        let currentIndex = 0;

        if (images && images.length > 1) {
            const updateImage = (index) => {
                imgElement.style.opacity = '0.3';
                setTimeout(() => {
                    imgElement.src = images[index];
                    imgElement.style.opacity = '1';
                }, 150);
            };

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % images.length;
                updateImage(currentIndex);
            });

            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateImage(currentIndex);
            });
        } else {
            // Se só houver 1 imagem, esconde as setas
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
});