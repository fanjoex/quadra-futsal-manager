import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calendar, Search, Filter, Eye, CheckCircle, XCircle, Clock, DollarSign, MapPin, User } from 'lucide-react'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings')
      setBookings(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status: newStatus })
      toast.success('Status atualizado com sucesso')
      fetchBookings()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const openBookingModal = (booking) => {
    setSelectedBooking(booking)
    setShowBookingModal(true)
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.court?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesPayment = filterPayment === 'all' || booking.paymentStatus === filterPayment
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'refunded':
        return 'Reembolsado'
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
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Agendamentos</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie todos os agendamentos do sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar agendamentos..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="confirmed">Confirmados</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>

          {/* Payment Filter */}
          <select
            className="input-field"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">Todos os pagamentos</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="refunded">Reembolsados</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-gray-600">
              {filteredBookings.length} agendamento(s) encontrado(s)
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {bookings
                  .filter(b => b.paymentStatus === 'paid')
                  .reduce((sum, b) => sum + b.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quadra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data e Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum agendamento encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.name || 'Usuário não encontrado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.court?.name || 'Quadra não encontrada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {booking.totalPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {getPaymentStatusText(booking.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openBookingModal(booking)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            title="Confirmar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalhes do Agendamento</h3>
              <button
                onClick={() => {
                  setShowBookingModal(false)
                  setSelectedBooking(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                <p className="text-sm text-gray-900">{selectedBooking.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedBooking.user?.email}</p>
                <p className="text-sm text-gray-600">{selectedBooking.user?.phone}</p>
              </div>

              {/* Court Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Quadra</h4>
                <p className="text-sm text-gray-900">{selectedBooking.court?.name}</p>
                {selectedBooking.court?.description && (
                  <p className="text-sm text-gray-600">{selectedBooking.court.description}</p>
                )}
              </div>

              {/* Booking Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(selectedBooking.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horário:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duração:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedBooking.duration} minutos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {selectedBooking.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pagamento:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                    {getPaymentStatusText(selectedBooking.paymentStatus)}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowBookingModal(false)
                    setSelectedBooking(null)
                  }}
                  className="btn btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
