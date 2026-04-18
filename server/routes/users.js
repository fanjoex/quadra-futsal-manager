const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

// Obter perfil do usuário logado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// Alterar senha
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha atual inválida' });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

// Obter todos os usuários (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Obter usuário por ID (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Ativar/Desativar usuário (admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ message: 'Erro ao alterar status do usuário' });
  }
});

// Obter estatísticas dos usuários (admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const clientUsers = await User.countDocuments({ role: 'client' });

    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      clientUsers,
      newUsersThisMonth
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
