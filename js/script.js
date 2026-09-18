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
        story: "Fui eu que dei o pontapé inicial na banda junto com a Soso e o Regata. A gente se trombou na faculdade e logo chamei o Tejada porque já tínhamos tocado juntos e a sintonia era certa. A microfonia no primeiro ensaio quase deixou a gente surdo, mas compensa demais quando acerto os solos do Journey no palco."
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
        story: "Entrei por indicação de um brother da turma do Caets e, sem pensar duas vezes, colei no projeto. Pegar as baquetas e ditar o ritmo da Reatância é uma responsabilidade daora. Segurar o tempo das músicas de Three Days Grace é física pura, é impacto! Começou como banda de universitários, mas o bagulho ficou muito sério."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Site da Banda Reatância carregado com sucesso!');

    // =================================================================
    // LÓGICA DOS VÍDEOS NO HOVER E DO MODAL DE INTEGRANTES
    // =================================================================
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
                video.currentTime = 0; // Reseta o vídeo para o começo
            });
        }

        // 2. Abrir a caixa flutuante (modal) ao clicar no card
        card.addEventListener('click', () => {
            if (memberId && membersStories[memberId]) {
                const data = membersStories[memberId];
                modalTitle.textContent = data.name;
                modalRole.textContent = data.role;
                modalText.innerHTML = `<p>${data.story}</p>`;
                
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
            }
        });
    });

    // 3. Funções para fechar o Modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Destrava o scroll do fundo
    };

    if (modalCloseBtn && modalOverlay) {
        // Clicando no "X"
        modalCloseBtn.addEventListener('click', closeModal);
        
        // Clicando fora da caixa do modal (no overlay escuro)
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        // Fechando com a tecla "ESC"
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // =================================================================
    // BOTÃO DE LOGIN ORIGINAL
    // =================================================================
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            console.log('Botão Entrar/Cadastrar clicado.');
            // Aqui você pode adicionar lógica de modal de login depois
        });
    }
});