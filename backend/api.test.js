const request = require('supertest');
const app = require('./server'); // Importa o seu servidor

describe('Testes Automatizados da API Reatância', () => {

    // Teste 1: Caso Válido - Rota de Status
    it('1. Deve retornar status 200 na rota de teste /api/status', async () => {
        const res = await request(app).get('/api/status');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('mensagem');
    });

    // Teste 2: Caso Válido - Listar Produtos
    it('2. Deve listar os produtos com sucesso (GET /api/produtos)', async () => {
        const res = await request(app).get('/api/produtos');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true); // Garante que a resposta é um array (lista)
    });

    // Teste 3: Caso Inválido - Validação do Cadastro (E-mail inválido)
    it('3. Deve falhar o cadastro ao enviar um e-mail inválido (POST /api/register)', async () => {
        const res = await request(app).post('/api/register').send({
            nome_usuario: "Teste",
            email: "email_sem_arroba.com", // E-mail propositalmente errado
            idade: 25,
            senha: "senhaSegura123"
        });
        expect(res.statusCode).toEqual(400); // 400 Bad Request
        expect(res.body).toHaveProperty('erros');
    });

    // Teste 4: Caso Inválido - Falha no Login
    it('4. Deve retornar erro 401 ao tentar login com senha incorreta (POST /api/login)', async () => {
        const res = await request(app).post('/api/login').send({
            login_user: "admin.reatancia@gmail.com",
            senha: "senha_errada_123"
        });
        expect(res.statusCode).toEqual(401);
        expect(res.body.mensagem).toBe('Credenciais inválidas.');
    });

    // Teste 5: Caso Inválido - Acesso Negado em rota protegida sem Token
    it('5. Deve bloquear a inserção de produto se não for enviado o Token JWT (POST /api/produtos)', async () => {
        const res = await request(app).post('/api/produtos').send({
            id: 9999,
            nome: "Produto Secreto",
            preco: 100.0,
            tipo: "Teste",
            imagem_url: "teste.jpg"
        });
        expect(res.statusCode).toEqual(401);
        expect(res.body.mensagem).toBe('Acesso não autorizado. Token não fornecido.');
    });

});