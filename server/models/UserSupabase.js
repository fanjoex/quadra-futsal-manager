const supabase = require('../config/supabase');

class UserSupabase {
  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data: totalUsers, error: totalError } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

      const { data: activeUsers, error: activeError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      const { data: clientUsers, error: clientError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'client');

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { data: newUsersThisMonth, error: newUsersError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gte('created_at', thisMonth.toISOString());

      if (totalError || activeError || adminError || clientError || newUsersError) {
        throw new Error('Error fetching user stats');
      }

      return {
        totalUsers: totalUsers?.length || 0,
        activeUsers: activeUsers?.length || 0,
        adminUsers: adminUsers?.length || 0,
        clientUsers: clientUsers?.length || 0,
        newUsersThisMonth: newUsersThisMonth?.length || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = UserSupabase;
