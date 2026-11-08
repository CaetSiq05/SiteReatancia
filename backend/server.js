require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

const fs = require('fs');
const path = require('path');

// Função de Observabilidade (Logs)
const registrarLog = (evento, detalhes) => {
    // Cria um timestamp no formato ISO (ex: 2026-11-08T15:00:00.000Z)
    const timestamp = new Date().toISOString();
    const mensagemLog = `[${timestamp}] ${evento}: ${detalhes}\n`;

    // Exibe no terminal
    console.log(mensagemLog.trim());

    // Salva no arquivo sistema.log na pasta backend
    const caminhoLog = path.join(__dirname, 'sistema.log');
    fs.appendFile(caminhoLog, mensagemLog, (err) => {
        if (err) console.error('Falha ao escrever no log:', err);
    });
};

// Middlewares
app.use(cors());
app.use(express.json()); // Permite ler os dados enviados pelo front-end

// Conexão com o Banco de Dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
        return;
    }
    console.log('Conectado ao banco MySQL com sucesso!');
});

// Rota de teste simples para verificar o status e tratamento de erros padronizado
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        status: 200,
        mensagem: 'API da Reatância rodando no volume 11!' 
    });
});

// MIDDLEWARES DE VALIDAÇÃO E SANITIZAÇÃO

// Função para verificar se a validação falhou
const validarEntradas = (req, res, next) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        registrarLog('FALHA_VALIDACAO', `Dados inválidos enviados para ${req.url}`);
        return res.status(400).json({ status: 400, erros: erros.array() });
    }
    next();
};

// Regras para Cadastro de Usuário
const regrasCadastro = [
    body('nome_usuario').trim().notEmpty().withMessage('Nome é obrigatório').escape(),
    body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('idade').isInt({ min: 1, max: 120 }).withMessage('Idade deve ser um número válido'),
    body('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres')
];

const regrasLogin = [
    body('login_user').trim().notEmpty().withMessage('Usuário ou e-mail é obrigatório').escape(),
    body('senha').notEmpty().withMessage('A palavra-passe é obrigatória')
];

// Regras para Produtos
const regrasProduto = [
    body('id').optional().isInt().withMessage('ID deve ser um número inteiro'), // Opcional no PUT
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).escape(),
    body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor numérico positivo'),
    body('tipo').trim().notEmpty().escape(),
    body('imagem_url').trim().notEmpty()
];

// ROTA: CADASTRO DE USUÁRIO
app.post('/api/register', regrasCadastro, validarEntradas, async (req, res) => {
    const { nome_usuario, email, idade, senha } = req.body;

    try {
        // Criptografando a senha (hash seguro)
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Inserindo no banco com consulta parametrizada
        const query = 'INSERT INTO usuarios (nome_usuario, email, idade, senha) VALUES (?, ?, ?, ?)';
        db.query(query, [nome_usuario, email, idade, senhaHash], (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar:', err);
                registrarLog('ERRO_INTERNO', `Falha ao cadastrar usuário: ${err.message}`); // <-- LOG
                // Tratamento de erro padronizado para e-mail ou usuário já existente
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ status: 409, mensagem: 'Nome de usuário ou e-mail já cadastrado.' });
                }
                return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
            }
            registrarLog('CRIACAO_ENTIDADE', `Novo usuário cadastrado: ${nome_usuario} (${email})`); // <-- LOG
            res.status(201).json({ status: 201, mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch (error) {
        registrarLog('ERRO_INTERNO', `Exceção no cadastro: ${error.message}`); // <-- LOG
        res.status(500).json({ status: 500, mensagem: 'Erro ao processar o cadastro.' });
    }
});

// ROTA: LOGIN
app.post('/api/login', regrasLogin, validarEntradas, (req, res) => {
    const { login_user, senha } = req.body;

    // Busca o usuário no banco (aceita tanto nome de usuário quanto e-mail)
    const query = 'SELECT * FROM usuarios WHERE nome_usuario = ? OR email = ?';
    db.query(query, [login_user, login_user], async (err, results) => {
        if (err) {
            console.error('Erro no login:', err);
            registrarLog('ERRO_INTERNO', `Erro no banco durante login: ${err.message}`); // <-- LOG
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }

        if (results.length === 0) {
            registrarLog('FALHA_AUTENTICACAO', `Tentativa de login com usuário inexistente: ${login_user}`); // <-- LOG
            return res.status(401).json({ status: 401, mensagem: 'Credenciais inválidas.' });
        }

        const usuario = results[0];

        // Compara a senha digitada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            registrarLog('FALHA_AUTENTICACAO', `Senha incorreta para o usuário: ${usuario.nome_usuario}`); // <-- LOG
            return res.status(401).json({ status: 401, mensagem: 'Credenciais inválidas.' });
        }

        // Gera o JWT (Token de Autenticação)
        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // O token expira em 2 horas
        );

        registrarLog('LOGIN_SUCESSO', `Usuário logado: ${usuario.nome_usuario} (Perfil: ${usuario.perfil})`); // <-- LOG
        res.status(200).json({
            status: 200,
            mensagem: 'Login realizado com sucesso!',
            token: token,
            perfil: usuario.perfil
        });
    });
});

// ROTA: LISTAR PRODUTOS
app.get('/api/produtos', (req, res) => {
    const query = 'SELECT * FROM produtos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            registrarLog('ERRO_INTERNO', `Erro ao buscar produtos: ${err.message}`); // <-- LOG
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }
        registrarLog('LEITURA_ENTIDADE', `Lista de produtos acessada com sucesso.`); // <-- LOG
        res.status(200).json(results);
    });
});

// MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO

// 1. Middleware para verificar o Token JWT (Acesso a rotas protegidas)
const verificarToken = (req, res, next) => {
    // O token geralmente é enviado no cabeçalho Authorization como "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ status: 401, mensagem: 'Acesso não autorizado. Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 403, mensagem: 'Token inválido ou expirado.' });
        }
        req.user = user; // Guarda os dados do token (id, perfil) para usar nas próximas rotas
        next();
    });
};

// 2. Middleware para verificar se o utilizador é Administrador
const verificarAdmin = (req, res, next) => {
    if (req.user.perfil !== 'admin') {
        return res.status(403).json({ status: 403, mensagem: 'Acesso negado. Requer privilégios de administrador.' });
    }
    next();
};

// ROTAS CRUD DE PRODUTOS (PROTEGIDAS)

// ROTA: ADICIONAR PRODUTO (Apenas Admin)
app.post('/api/produtos', verificarToken, verificarAdmin, regrasProduto, validarEntradas, (req, res) => {
    const { id, nome, preco, tipo, imagem_url } = req.body;

    const query = 'INSERT INTO produtos (id, nome, preco, tipo, imagem_url) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [id, nome, preco, tipo, imagem_url], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar produto:', err);
            registrarLog('ERRO_INTERNO', `Falha ao adicionar produto ID ${id}: ${err.message}`); // <-- LOG
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ status: 409, mensagem: 'O ID deste produto já existe.' });
            }
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }
        registrarLog('CRIACAO_ENTIDADE', `Produto criado: ${nome} (ID: ${id}) por Admin ID: ${req.user.id}`); // <-- LOG
        res.status(201).json({ status: 201, mensagem: 'Produto adicionado com sucesso!' });
    });
});

// ROTA: ATUALIZAR PRODUTO (Apenas Admin)
app.put('/api/produtos/:id', verificarToken, verificarAdmin, regrasProduto, validarEntradas, (req, res) => {
    const { nome, preco, tipo, imagem_url } = req.body;
    const produtoId = req.params.id;

    const query = 'UPDATE produtos SET nome = ?, preco = ?, tipo = ?, imagem_url = ? WHERE id = ?';
    db.query(query, [nome, preco, tipo, imagem_url, produtoId], (err, result) => {
        if (err) {
            registrarLog('ERRO_INTERNO', `Falha ao atualizar produto ID ${produtoId}: ${err.message}`); // <-- LOG
            console.error('Erro ao atualizar produto:', err);
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, mensagem: 'Produto não encontrado.' });
        }
        registrarLog('ATUALIZACAO_ENTIDADE', `Produto atualizado: ID ${produtoId} por Admin ID: ${req.user.id}`); // <-- LOG
        res.status(200).json({ status: 200, mensagem: 'Produto atualizado com sucesso!' });
    });
});

// ROTA: APAGAR PRODUTO (Apenas Admin)
app.delete('/api/produtos/:id', verificarToken, verificarAdmin, regrasProduto, validarEntradas, (req, res) => {
    const produtoId = req.params.id;

    const query = 'DELETE FROM produtos WHERE id = ?';
    db.query(query, [produtoId], (err, result) => {
        if (err) {
            registrarLog('ERRO_INTERNO', `Falha ao apagar produto ID ${produtoId}: ${err.message}`); // <-- LOG
            console.error('Erro ao apagar produto:', err);
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, mensagem: 'Produto não encontrado.' });
        }
        registrarLog('EXCLUSAO_ENTIDADE', `Produto removido: ID ${produtoId} por Admin ID: ${req.user.id}`); // <-- LOG
        res.status(200).json({ status: 200, mensagem: 'Produto removido com sucesso!' });
    });
});

const PORT = process.env.PORT || 3000;

// Só liga a porta se NÃO estiver a correr testes
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor a correr em http://localhost:${PORT}`);
    });
}

// Exportar a aplicação para o Supertest conseguir usá-la
module.exports = app;