require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

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

// ROTA: CADASTRO DE USUÁRIO
app.post('/api/register', async (req, res) => {
    const { nome_usuario, email, idade, senha } = req.body;

    // Validação básica de entrada
    if (!nome_usuario || !email || !idade || !senha) {
        return res.status(400).json({ status: 400, mensagem: 'Todos os campos são obrigatórios.' });
    }

    if (senha.length < 8) {
        return res.status(400).json({ status: 400, mensagem: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    try {
        // Criptografando a senha (hash seguro)
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Inserindo no banco com consulta parametrizada
        const query = 'INSERT INTO usuarios (nome_usuario, email, idade, senha) VALUES (?, ?, ?, ?)';
        db.query(query, [nome_usuario, email, idade, senhaHash], (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar:', err);
                // Tratamento de erro padronizado para e-mail ou usuário já existente
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ status: 409, mensagem: 'Nome de usuário ou e-mail já cadastrado.' });
                }
                return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
            }
            res.status(201).json({ status: 201, mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ status: 500, mensagem: 'Erro ao processar o cadastro.' });
    }
});

// ROTA: LOGIN
app.post('/api/login', (req, res) => {
    const { login_user, senha } = req.body;

    if (!login_user || !senha) {
        return res.status(400).json({ status: 400, mensagem: 'Usuário/E-mail e senha são obrigatórios.' });
    }

    // Busca o usuário no banco (aceita tanto nome de usuário quanto e-mail)
    const query = 'SELECT * FROM usuarios WHERE nome_usuario = ? OR email = ?';
    db.query(query, [login_user, login_user], async (err, results) => {
        if (err) {
            console.error('Erro no login:', err);
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ status: 401, mensagem: 'Credenciais inválidas.' });
        }

        const usuario = results[0];

        // Compara a senha digitada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ status: 401, mensagem: 'Credenciais inválidas.' });
        }

        // Gera o JWT (Token de Autenticação)
        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // O token expira em 2 horas
        );

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
            return res.status(500).json({ status: 500, mensagem: 'Erro interno no servidor.' });
        }
        res.status(200).json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});