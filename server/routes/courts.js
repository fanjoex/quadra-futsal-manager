const express = require('express');
const Court = require('../models/Court');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

// Obter todas as quadras (público)
router.get('/', async (req, res) => {
  try {
    const courts = await Court.find({ isActive: true })
      .select('-__v')
      .sort({ name: 1 });
    
    res.json(courts);
  } catch (error) {
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ message: 'Erro ao buscar quadras' });
  }
});

// Obter quadra por ID
router.get('/:id', async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    if (!court.isActive) {
      return res.status(404).json({ message: 'Quadra não disponível' });
    }

    res.json(court);
  } catch (error) {
    console.error('Erro ao buscar quadra:', error);
    res.status(500).json({ message: 'Erro ao buscar quadra' });
  }
});

// Criar nova quadra (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      pricePerHour,
      maxPlayers,
      operatingHours,
      features,
      images
    } = req.body;

    // Validações básicas
    if (!name || !pricePerHour) {
      return res.status(400).json({ message: 'Nome e preço por hora são obrigatórios' });
    }

    const court = new Court({
      name,
      description,
      type,
      pricePerHour,
      maxPlayers,
      operatingHours,
      features,
      images
    });

    await court.save();

    res.status(201).json({
      message: 'Quadra criada com sucesso',
      court
    });
  } catch (error) {
    console.error('Erro ao criar quadra:', error);
    res.status(500).json({ message: 'Erro ao criar quadra' });
  }
});

// Atualizar quadra (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    const updates = req.body;
    Object.assign(court, updates);

    await court.save();

    res.json({
      message: 'Quadra atualizada com sucesso',
      court
    });
  } catch (error) {
    console.error('Erro ao atualizar quadra:', error);
    res.status(500).json({ message: 'Erro ao atualizar quadra' });
  }
});

// Deletar/Desativar quadra (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    // Soft delete - apenas desativa
    court.isActive = false;
    await court.save();

    res.json({ message: 'Quadra desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar quadra:', error);
    res.status(500).json({ message: 'Erro ao desativar quadra' });
  }
});

// Obter tipos de quadra disponíveis
router.get('/types/list', (req, res) => {
  const types = ['society', 'futsal', 'basquete'];
  res.json(types);
});

// Obter features disponíveis
router.get('/features/list', (req, res) => {
  const features = ['iluminacao', 'vestiarios', 'bebedouro', 'estacionamento', 'lanchonete', 'quadra_coberta'];
  res.json(features);
});

module.exports = router;
