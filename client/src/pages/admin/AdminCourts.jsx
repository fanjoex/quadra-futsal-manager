import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapPin, Plus, Search, Edit, Trash2, Eye, Clock, DollarSign, Users, ToggleLeft, ToggleRight } from 'lucide-react'

const AdminCourts = () => {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCourtModal, setShowCourtModal] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    fetchCourts()
  }, [])

  const fetchCourts = async () => {
    try {
      const response = await axios.get('/api/courts')
      setCourts(response.data)
    } catch (error) {
      toast.error('Erro ao carregar quadras')
    } finally {
      setLoading(false)
    }
  }

  const toggleCourtStatus = async (courtId, currentStatus) => {
    try {
      await axios.delete(`/api/courts/${courtId}`)
      toast.success(`Quadra ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`)
      fetchCourts()
    } catch (error) {
      toast.error('Erro ao alterar status da quadra')
    }
  }

  const openCourtModal = (court, edit = false) => {
    setSelectedCourt(court)
    setIsEditMode(edit)
    setShowCourtModal(true)
  }

  const closeModal = () => {
    setShowCourtModal(false)
    setSelectedCourt(null)
    setIsEditMode(false)
  }

  const filteredCourts = courts.filter(court => 
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeLabel = (type) => {
    switch (type) {
      case 'futsal':
        return 'Futsal'
      case 'society':
        return 'Society'
      case 'basquete':
        return 'Basquete'
      default:
        return type
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'futsal':
        return 'bg-green-100 text-green-800'
      case 'society':
        return 'bg-blue-100 text-blue-800'
      case 'basquete':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFeatureLabel = (feature) => {
    switch (feature) {
      case 'iluminacao':
        return 'Iluminação'
      case 'vestiarios':
        return 'Vestiários'
      case 'bebedouro':
        return 'Bebedouro'
      case 'estacionamento':
        return 'Estacionamento'
      case 'lanchonete':
        return 'Lanchonete'
      case 'quadra_coberta':
        return 'Quadra Coberta'
      default:
        return feature
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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Quadras</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as quadras do sistema</p>
        </div>
        <button 
          onClick={() => openCourtModal(null, true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Quadra</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar quadras..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {filteredCourts.length} quadra(s) encontrada(s)
        </div>
      </div>

      {/* Courts Grid */}
      {filteredCourts.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma quadra encontrada</h3>
          <p className="text-gray-600 mb-4">Comece adicionando uma nova quadra ao sistema</p>
          <button 
            onClick={() => openCourtModal(null, true)}
            className="btn btn-primary"
          >
            Adicionar Primeira Quadra
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <div key={court._id} className="card hover:shadow-lg transition-shadow">
              {/* Court Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
                <MapPin className="w-16 h-16 text-primary-600" />
                <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full bg-white text-primary-600`}>
                  {getTypeLabel(court.type)}
                </span>
              </div>

              {/* Court Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{court.description}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCourtStatus(court._id, court.isActive)}
                      className={`flex items-center space-x-1 ${
                        court.isActive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {court.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {court.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Features */}
                {court.features && court.features.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {court.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                        >
                          {getFeatureLabel(feature)}
                        </span>
                      ))}
                      {court.features.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{court.features.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Court Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>R$ {court.pricePerHour.toFixed(2)}/hora</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Até {court.maxPlayers} jogadores</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{court.operatingHours?.start} - {court.operatingHours?.end}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openCourtModal(court, false)}
                    className="flex-1 btn btn-secondary flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => openCourtModal(court, true)}
                    className="flex-1 btn btn-secondary flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => toggleCourtStatus(court._id, court.isActive)}
                    className="btn btn-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Court Details/Edit Modal */}
      {showCourtModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Editar Quadra' : 'Detalhes da Quadra'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedCourt && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        className="input-field"
                        value={selectedCourt.name}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        className="input-field"
                        value={selectedCourt.type}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="futsal">Futsal</option>
                        <option value="society">Society</option>
                        <option value="basquete">Basquete</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={selectedCourt.description || ''}
                      disabled={!isEditMode}
                      onChange={(e) => setSelectedCourt(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Pricing and Capacity */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preço e Capacidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço por hora</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={selectedCourt.pricePerHour}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de jogadores</label>
                      <input
                        type="number"
                        className="input-field"
                        value={selectedCourt.maxPlayers}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Horário de Funcionamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Abertura</label>
                      <input
                        type="time"
                        className="input-field"
                        value={selectedCourt.operatingHours?.start || '06:00'}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, start: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fechamento</label>
                      <input
                        type="time"
                        className="input-field"
                        value={selectedCourt.operatingHours?.end || '23:00'}
                        disabled={!isEditMode}
                        onChange={(e) => setSelectedCourt(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Características</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['iluminacao', 'vestiarios', 'bebedouro', 'estacionamento', 'lanchonete', 'quadra_coberta'].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedCourt.features?.includes(feature) || false}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            if (isEditMode) {
                              setSelectedCourt(prev => ({
                                ...prev,
                                features: e.target.checked
                                  ? [...(prev.features || []), feature]
                                  : (prev.features || []).filter(f => f !== feature)
                              }))
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{getFeatureLabel(feature)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    {isEditMode ? 'Cancelar' : 'Fechar'}
                  </button>
                  {isEditMode && (
                    <button className="btn btn-primary">
                      Salvar Alterações
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourts
