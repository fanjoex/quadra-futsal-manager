const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserSupabase = require('../models/UserSupabase');
const router = express.Router();

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'seu_secret_key', {
    expiresIn: '7d'
  });
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'client' } = req.body;

    // Verificar se usuário já existe
    const existingUser = await UserSupabase.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role
    };

    const user = await UserSupabase.create(userData);

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontrar usuário
    const user = await UserSupabase.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({ message: 'Conta desativada' });
    }

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.userId = decoded.userId;
    next();
  });
};

module.exports = router;
module.exports.authenticateToken = authenticateToken;
