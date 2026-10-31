// 1. LÓGICA DE INTERFACE
const togglePasswordButtons = document.querySelectorAll('.btn-toggle-password');

togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const inputElement = document.getElementById(targetId);
        const svgIcon = this.querySelector('svg');

        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            svgIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            inputElement.type = 'password';
            svgIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });
});

const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

document.getElementById('btn-show-register').addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

document.getElementById('btn-show-login').addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

function redirecionarAposLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const origem = urlParams.get('origem');

    if (origem === 'loja') {
        window.location.href = 'compras.html';
    } else {
        window.location.href = 'index.html';
    }
}

// 2. LÓGICA DE COMUNICAÇÃO COM O BACKEND

// --- REGISTO DE UTILIZADOR ---
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Verifique se estes IDs coincidem com o seu ficheiro HTML
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const idade = document.getElementById('reg-idade').value;
    const senha = document.getElementById('reg-senha').value;
    const confirmaSenha = document.getElementById('reg-confirma-senha').value;
    const errorMsg = document.getElementById('reg-error');

    if (senha.length < 8) {
        errorMsg.textContent = "A palavra-passe deve ter pelo menos 8 caracteres.";
        errorMsg.style.display = 'block';
        return;
    }

    if (senha !== confirmaSenha) {
        errorMsg.textContent = "As palavras-passe não coincidem!";
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';

    try {
        const resposta = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nome_usuario: nome, 
                email: email, 
                idade: idade, 
                senha: senha 
            })
        });
        
        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Registo efetuado com sucesso! Pode iniciar sessão.');
            // Muda para o ecrã de login automaticamente
            document.getElementById('btn-show-login').click();
        } else {
            errorMsg.textContent = dados.mensagem;
            errorMsg.style.display = 'block';
        }
    } catch (erro) {
        console.error('Erro na ligação:', erro);
        errorMsg.textContent = 'Erro ao ligar ao servidor.';
        errorMsg.style.display = 'block';
    }
});

// --- LOGIN DE UTILIZADOR ---
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Verifique se este ID coincide com o seu ficheiro HTML
    const loginUser = document.getElementById('login-user').value; 
    const senha = document.getElementById('login-senha').value;
    const errorMsg = document.getElementById('login-error');

    if (senha.length < 8) {
        errorMsg.textContent = "A palavra-passe deve ter pelo menos 8 caracteres.";
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';

    try {
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                login_user: loginUser, 
                senha: senha 
            })
        });
        
        const dados = await resposta.json();

        if (resposta.ok) {
            // Guarda o token e o perfil para manter a sessão ativa
            localStorage.setItem('token', dados.token);
            localStorage.setItem('perfil', dados.perfil);
            localStorage.setItem('logado', 'true');
            
            redirecionarAposLogin();
        } else {
            errorMsg.textContent = dados.mensagem;
            errorMsg.style.display = 'block';
        }
    } catch (erro) {
        console.error('Erro na ligação:', erro);
        errorMsg.textContent = 'Erro ao ligar ao servidor.';
        errorMsg.style.display = 'block';
    }
});