const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da quadra é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['society', 'futsal', 'basquete'],
    default: 'futsal'
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Preço por hora é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  maxPlayers: {
    type: Number,
    default: 10,
    min: [1, 'Mínimo 1 jogador']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    start: {
      type: String,
      default: '06:00'
    },
    end: {
      type: String,
      default: '23:00'
    }
  },
  features: [{
    type: String,
    enum: ['iluminacao', 'vestiarios', 'bebedouro', 'estacionamento', 'lanchonete', 'quadra_coberta']
  }],
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Court', CourtSchema);
