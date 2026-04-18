import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Clock, DollarSign, TrendingUp, Users, Plus } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
    thisMonthBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse] = await Promise.all([
        axios.get('/api/bookings/my')
      ])

      const bookings = bookingsResponse.data
      
      // Calcular estatísticas
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const totalBookings = bookings.length
      const upcomingBookings = bookings.filter(b => 
        new Date(b.date) >= now && b.status === 'confirmed'
      ).length
      const totalSpent = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0)
      const thisMonthBookings = bookings.filter(b => 
        new Date(b.date) >= thisMonth
      ).length

      setStats({
        totalBookings,
        upcomingBookings,
        totalSpent,
        thisMonthBookings
      })

      // Pegar os 3 agendamentos mais recentes
      const recent = bookings
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
      
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta, {user?.name}!</p>
        </div>
        <Link
          to="/quadras"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gasto</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonthBookings}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Agendamentos Recentes</h2>
          <Link
            to="/meus-agendamentos"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum agendamento encontrado</p>
            <Link
              to="/quadras"
              className="btn btn-primary mt-4"
            >
              Fazer primeiro agendamento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.court.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.date)} - {booking.startTime} às {booking.endTime}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/quadras"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ver Quadras</h3>
              <p className="text-sm text-gray-600">Explore nossas quadras disponíveis</p>
            </div>
          </div>
        </Link>

        <Link
          to="/meus-agendamentos"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Meus Agendamentos</h3>
              <p className="text-sm text-gray-600">Gerencie suas reservas</p>
            </div>
          </div>
        </Link>

        <Link
          to="/perfil"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Meu Perfil</h3>
              <p className="text-sm text-gray-600">Atualize suas informações</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
