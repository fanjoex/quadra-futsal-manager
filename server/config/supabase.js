const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
