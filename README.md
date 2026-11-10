# Banda Reatância - Site Oficial e API (Full-Stack) 🎸

Site desenvolvido como projeto académico para a banda de rock "Reatância". A aplicação apresenta a história da banda, perfis dos membros, galeria de media, agenda de eventos e uma loja virtual integrada a uma API RESTful própria. O layout foi estruturado para simular uma Single Page Application.

## 🛠️ Tecnologias Utilizadas

**Front-end:**
* **HTML5:** Estrutura semântica, acessibilidade e otimização.
* **CSS3:** Design responsivo adaptado para dispositivos móveis e desktop.
* **JavaScript:** Lógica de interatividade (modais, sistema de carrinho de compras).
* **Integração de API Externa:** Uso da API ViaCEP para preenchimento automático e validação de moradas no checkout.

**Back-end:**
* **Node.js & Express:** Construção do servidor e rotas da API.
* **MySQL:** Banco de dados relacional.
* **JWT & bcrypt:** Autenticação, autorização e encriptação de palavras-passe.
* **express-validator:** Sanitização e validação de dados de entrada.
* **Jest & Supertest:** Testes automatizados da API.

---

## ⚙️ Pré-requisitos e Configuração (Back-end)

Para executar o servidor e a base de dados, precisas ter o **Node.js** e o **MySQL** instalados.

1. Na pasta `backend`, instala as dependências:
   ```bash
   npm install

2. Cria um ficheiro .env na raiz da pasta backend com as tuas credenciais do MySQL e a chave secreta do JWT:

    PORT=3000
    DB_HOST=localhost
    DB_USER=teu_usuario
    DB_PASSWORD=tua_senha
    DB_NAME=loja_reatancia
    JWT_SECRET=tua_chave_secreta_super_segura

3. Inicia o servidor:

    npm start
    (Para rodar os testes automatizados da API, utiliza o comando npm run test).

## 🚀 Instruções de Execução

Pode utilizar um dos dois métodos abaixo para visualizar a interface:

### Método 1: Acesso direto no navegador (Mais simples)
1. Clone este repositório para o seu computador ou faça o download dos ficheiros em formato ZIP e extraia-os.
2. Abra a pasta extraída.
3. Clique duas vezes no ficheiro `index.html` para abri-lo diretamente no teu navegador padrão.

### Método 2: Acesso via Servidor Local (Recomendado para visualização técnica)
1. Abra a pasta do projeto no **Visual Studio Code**.
2. Certifique-se de que tem a extensão **Live Server** instalada.
3. Clique com o botão direito do mouse no ficheiro `index.html` no explorador de ficheiros do VS Code.
4. Selecione a opção **"Open with Live Server"**.
5. O site será aberto automaticamente no seu navegador num endereço local (ex: `http://127.0.0.1:5500`).

## 📡 Documentação da API RESTful
A API localiza-se em http://localhost:3000. Rotas protegidas exigem o envio do token no cabeçalho: Authorization: Bearer <token>.

1. Utilizadores e Autenticação
    POST /api/register: Registra um novo utilizador. Requer nome_usuario, email, idade e senha no corpo (JSON). Retorna 201 Created.
    POST /api/login: Autentica o utilizador. Requer login_user (e-mail ou nome) e senha. Retorna 200 OK com o Token JWT e o perfil.

2. Gestão de Produtos (Loja)
    GET /api/produtos: Lista todos os produtos da loja. (Rota Pública).
    POST /api/produtos: Adiciona um produto. (Requer Token e Perfil Admin).
    PUT /api/produtos/:id: Atualiza os dados de um produto pelo ID. (Requer Token e Perfil Admin).
    DELETE /api/produtos/:id: Remove um produto pelo ID. (Requer Token e Perfil Admin).

3. Gestão de Pedidos (Checkout)
    POST /api/pedidos: Finaliza a compra do utilizador. (Requer Token). Recebe os dados do carrinho (produtos e tamanhos), valor total, método de pagamento, número de parcelas, morada de entrega e os dados do cartão de crédito. Por questões de segurança (simulação PCI-DSS), o Back-end extrai e guarda apenas os últimos 4 dígitos do cartão, descartando o restante. Regista o histórico nas tabelas relacionais `pedidos` e `pedido_itens`.

4. Sistema
    GET /api/status: Health check para verificar se a API e os logs estão operacionais. Retorna 200 OK.

## 📊 Validação e Qualidade
O código deste projeto foi validado nas seguintes ferramentas:
* **W3C Validator:** HTML e CSS validados semanticamente.
* **Google Lighthouse:** Auditoria de Performance, Acessibilidade, Melhores Práticas e SEO.
* **Jest & Supertest:** Bateria de testes automatizados garantindo a fiabilidade das rotas, validações de segurança e tratamento de erros do Back-end.