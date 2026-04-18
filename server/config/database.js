const mongoose = require('mongoose');

// Conexão com MongoDB Atlas (gratuito)
const connectDB = async () => {
  try {
    // Usando MongoDB Atlas gratuito - não precisa instalar nada localmente
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/quadra-futsal?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
