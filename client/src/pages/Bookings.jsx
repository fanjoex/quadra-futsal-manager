import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calendar, Clock, MapPin, DollarSign, X, Check, AlertCircle, Filter } from 'lucide-react'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my')
      setBookings(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      await axios.patch(`/api/bookings/${selectedBooking._id}/cancel`)
      toast.success('Agendamento cancelado com sucesso')
      setShowCancelModal(false)
      setSelectedBooking(null)
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar agendamento')
    }
  }

  const openCancelModal = (booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  const filteredBookings = bookings.filter(booking => {
    switch (filter) {
      case 'upcoming':
        return new Date(booking.date) >= new Date() && booking.status === 'confirmed'
      case 'past':
        return new Date(booking.date) < new Date() || booking.status === 'completed'
      case 'cancelled':
        return booking.status === 'cancelled'
      case 'pending':
        return booking.status === 'pending'
      default:
        return true
    }
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

  const canCancel = (booking) => {
    const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00`)
    const now = new Date()
    const timeDiff = bookingDateTime - now
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    return booking.status === 'confirmed' && hoursDiff >= 2
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
          <h1 className="text-3xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie suas reservas e histórico</p>
        </div>
        <Link
          to="/quadras"
          className="btn btn-primary"
        >
          Novo Agendamento
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Passados
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelados
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'Você ainda não tem agendamentos' : 'Nenhum agendamento neste filtro'}
          </p>
          {filter === 'all' && (
            <Link
              to="/quadras"
              className="btn btn-primary"
            >
              Fazer primeiro agendamento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.court.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>R$ {booking.totalPrice.toFixed(2)}</span>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Observações:</strong> {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="mt-4 md:mt-0 md:ml-6">
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {getPaymentStatusText(booking.paymentStatus)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button className="btn btn-success text-sm">
                          Pagar Agora
                        </button>
                      )}
                      {canCancel(booking) && (
                        <button
                          onClick={() => openCancelModal(booking)}
                          className="btn btn-danger text-sm"
                        >
                          Cancelar
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button className="btn btn-secondary text-sm">
                          Ver Detalhes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancelar Agendamento</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja cancelar este agendamento?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{selectedBooking.court.name}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedBooking.date)} - {selectedBooking.startTime} às {selectedBooking.endTime}
                </p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  Valor: R$ {selectedBooking.totalPrice.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Cancelamentos podem ser feitos até 2 horas antes do horário agendado.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                }}
                className="flex-1 btn btn-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 btn btn-danger"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
