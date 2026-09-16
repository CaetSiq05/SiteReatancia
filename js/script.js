// Aguarda o carregamento do DOM antes de executar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Site da Banda Reatância carregado com sucesso!');

    // Estrutura inicial para manipular eventos de login/cadastro e loja
    const btnLogin = document.getElementById('btn-login');

    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            console.log('Botão Entrar/Cadastrar clicado.');
        });
    }
});