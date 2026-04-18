const express = require('express');
const Booking = require('../models/Booking');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

// Simulação de processamento de pagamento (em produção, integrar com Stripe/Mercado Pago)
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentData } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ message: 'ID do agendamento e método de pagamento são obrigatórios' });
    }

    const booking = await Booking.findById(bookingId).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar se o usuário é o dono do agendamento
    if (booking.user._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar se já foi pago
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Agendamento já foi pago' });
    }

    // Simular processamento de pagamento
    // Em produção, aqui seria a integração com gateway de pagamento
    const paymentSuccess = await simulatePayment(paymentMethod, paymentData, booking.totalPrice);

    if (!paymentSuccess) {
      return res.status(400).json({ message: 'Pagamento recusado' });
    }

    // Atualizar status do pagamento e do agendamento
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      message: 'Pagamento processado com sucesso',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice
      }
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ message: 'Erro ao processar pagamento' });
  }
});

// Função simulada de processamento de pagamento
async function simulatePayment(paymentMethod, paymentData, amount) {
  // Simulação de delay do processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulação de aprovação (90% de taxa de aprovação)
  const random = Math.random();
  return random > 0.1; // 90% de aprovação
}

// Obter histórico de pagamentos do usuário
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.userId,
      paymentStatus: { $in: ['paid', 'refunded'] }
    })
      .populate('court', 'name')
      .sort({ createdAt: -1 });

    const payments = bookings.map(booking => ({
      id: booking._id,
      bookingId: booking._id,
      courtName: booking.court.name,
      date: booking.date,
      amount: booking.totalPrice,
      status: booking.paymentStatus,
      method: booking.paymentMethod,
      createdAt: booking.createdAt
    }));

    res.json(payments);
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de pagamentos' });
  }
});

// Obter todos os pagamentos (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({
      paymentStatus: { $in: ['paid', 'refunded'] }
    })
      .populate('user', 'name email')
      .populate('court', 'name')
      .sort({ createdAt: -1 });

    const payments = bookings.map(booking => ({
      id: booking._id,
      user: {
        name: booking.user.name,
        email: booking.user.email
      },
      courtName: booking.court.name,
      date: booking.date,
      amount: booking.totalPrice,
      status: booking.paymentStatus,
      method: booking.paymentMethod,
      createdAt: booking.createdAt
    }));

    res.json(payments);
  } catch (error) {
    console.error('Erro ao buscar todos os pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar todos os pagamentos' });
  }
});

// Reembolsar pagamento (admin)
router.post('/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Apenas pagamentos confirmados podem ser reembolsados' });
    }

    // Simular reembolso
    const refundSuccess = await simulateRefund(booking.paymentMethod, booking.totalPrice);

    if (!refundSuccess) {
      return res.status(400).json({ message: 'Erro ao processar reembolso' });
    }

    // Atualizar status
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Reembolso processado com sucesso',
      refundAmount: booking.totalPrice
    });
  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    res.status(500).json({ message: 'Erro ao processar reembolso' });
  }
});

// Simulação de reembolso
async function simulateRefund(paymentMethod, amount) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return true; // Sempre sucesso na simulação
}

// Obter estatísticas de pagamentos (admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const paymentMethods = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      paymentMethods
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas de pagamentos' });
  }
});

module.exports = router;
