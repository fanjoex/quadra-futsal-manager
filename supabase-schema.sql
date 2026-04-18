-- Schema para o projeto Quadra Futsal Manager
-- Execute este SQL no painel SQL do seu Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de quadras
CREATE TABLE IF NOT EXISTS courts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'futsal' CHECK (type IN ('futsal', 'society', 'basquete')),
    price_per_hour DECIMAL(10,2) NOT NULL,
    max_players INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    operating_hours_start VARCHAR(5) DEFAULT '06:00',
    operating_hours_end VARCHAR(5) DEFAULT '23:00',
    features TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'credit_card' CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'cash')),
    players INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Índice único para evitar agendamentos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_booking 
ON bookings(court_id, date, start_time) 
WHERE status NOT IN ('cancelled');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Usuários podem ver e editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Todos podem ver quadras ativas
CREATE POLICY "Anyone can view active courts" ON courts
    FOR SELECT USING (is_active = true);

-- Usuários podem ver seus próprios agendamentos
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Usuários podem criar seus próprios agendamentos
CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar seus próprios agendamentos
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Inserir dados iniciais (opcional)
INSERT INTO courts (name, description, type, price_per_hour, max_players, operating_hours_start, operating_hours_end, features)
VALUES 
    ('Quadra Society Principal', 'Quadra society de grama sintética com iluminação', 'society', 120.00, 14, '06:00', '23:00', ARRAY['iluminacao', 'vestiarios', 'estacionamento', 'lanchonete']),
    ('Quadra de Futsal 1', 'Quadra coberta com piso profissional', 'futsal', 80.00, 10, '08:00', '22:00', ARRAY['quadra_coberta', 'vestiarios', 'bebedouro']),
    ('Quadra de Futsal 2', 'Quadra aberta com iluminação LED', 'futsal', 60.00, 10, '06:00', '23:00', ARRAY['iluminacao', 'vestiarios'])
ON CONFLICT DO NOTHING;

-- Criar usuário admin inicial (senha: admin123)
INSERT INTO users (name, email, password, phone, role)
VALUES ('Administrador', 'admin@quadra.com', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZ', '(11) 99999-9999', 'admin')
ON CONFLICT (email) DO NOTHING;
