const express = require('express');
const Booking = require('../models/Booking');
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

// Obter todos os agendamentos (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('court', 'name pricePerHour')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
});

// Obter agendamentos do usuário logado
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('court', 'name pricePerHour')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Erro ao buscar seus agendamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar seus agendamentos' });
  }
});

// Verificar disponibilidade de horários
router.get('/availability', async (req, res) => {
  try {
    const { courtId, date } = req.query;
    
    if (!courtId || !date) {
      return res.status(400).json({ message: 'ID da quadra e data são obrigatórios' });
    }

    // Buscar agendamentos existentes para a data
    const existingBookings = await Booking.find({
      court: courtId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    // Buscar informações da quadra
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    // Gerar horários disponíveis
    const availableSlots = [];
    const startHour = parseInt(court.operatingHours.start.split(':')[0]);
    const endHour = parseInt(court.operatingHours.end.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = existingBookings.some(booking => booking.startTime === timeSlot);
      
      if (!isBooked) {
        availableSlots.push(timeSlot);
      }
    }

    res.json({
      availableSlots,
      court: {
        name: court.name,
        pricePerHour: court.pricePerHour,
        operatingHours: court.operatingHours
      }
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ message: 'Erro ao verificar disponibilidade' });
  }
});

// Criar novo agendamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courtId, date, startTime, endTime, players, notes } = req.body;

    // Validar dados
    if (!courtId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Dados obrigatórios faltando' });
    }

    // Verificar se a quadra existe
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    // Verificar se o horário está disponível
    const existingBooking = await Booking.findOne({
      court: courtId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Horário já agendado' });
    }

    // Calcular duração e preço
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const duration = (end - start) / (1000 * 60); // em minutos
    const hours = duration / 60;
    const totalPrice = court.pricePerHour * hours;

    // Criar agendamento
    const booking = new Booking({
      user: req.userId,
      court: courtId,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      totalPrice,
      players: players || 1,
      notes
    });

    await booking.save();

    // Popular dados para retorno
    await booking.populate('court', 'name pricePerHour');

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      booking
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
});

// Cancelar agendamento
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar se o usuário é o dono do agendamento ou admin
    if (booking.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar se pode cancelar (pelo menos 2 horas antes)
    const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00`);
    const now = new Date();
    const timeDiff = bookingDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2 && req.userRole !== 'admin') {
      return res.status(400).json({ message: 'Cancelamento permitido até 2 horas antes do horário' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ message: 'Erro ao cancelar agendamento' });
  }
});

module.exports = router;
