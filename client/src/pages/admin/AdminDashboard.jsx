import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Users, MapPin, Calendar, DollarSign, TrendingUp, Activity, Clock, CheckCircle } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    pendingBookings: 0,
    activeUsers: 0,
    monthlyRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse, usersResponse, courtsResponse] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/users/stats/overview'),
        axios.get('/api/courts')
      ])

      const bookings = bookingsResponse.data
      const usersStats = usersResponse.data
      const courts = courtsResponse.data

      // Calcular estatísticas
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const todayBookings = bookings.filter(b => 
        new Date(b.date) >= today && new Date(b.date) < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      ).length

      const pendingBookings = bookings.filter(b => b.status === 'pending').length

      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0)

      const monthlyRevenue = bookings
        .filter(b => 
          b.paymentStatus === 'paid' && 
          new Date(b.createdAt) >= thisMonth
        )
        .reduce((sum, b) => sum + b.totalPrice, 0)

      setStats({
        totalUsers: usersStats.totalUsers || 0,
        totalCourts: courts.length,
        totalBookings: bookings.length,
        totalRevenue,
        todayBookings,
        pendingBookings,
        activeUsers: usersStats.activeUsers || 0,
        monthlyRevenue
      })

      // Pegar os 5 agendamentos mais recentes
      const recent = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      
      setRecentBookings(recent)
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">{stats.activeUsers} ativos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quadras</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourts}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-xs text-gray-500">{stats.todayBookings} hoje</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">R$ {stats.monthlyRevenue.toFixed(2)} este mês</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos Pendentes</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
              <p className="text-xl font-bold text-green-600">78%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Crescimento Mensal</p>
              <p className="text-xl font-bold text-blue-600">+15%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Agendamentos Recentes</h2>
          <Link
            to="/admin/agendamentos"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.court?.name || 'Quadra não encontrada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.user?.name || 'Usuário não encontrado'} - {formatDate(booking.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.startTime} às {booking.endTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    R$ {booking.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/admin/usuarios"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Usuários</h3>
              <p className="text-sm text-gray-600">Gerenciar usuários</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/quadras"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quadras</h3>
              <p className="text-sm text-gray-600">Gerenciar quadras</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/agendamentos"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Agendamentos</h3>
              <p className="text-sm text-gray-600">Ver todos agendamentos</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/relatorios"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatórios</h3>
              <p className="text-sm text-gray-600">Ver estatísticas</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
