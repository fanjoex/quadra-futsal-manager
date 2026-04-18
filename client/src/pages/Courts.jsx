import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapPin, Clock, DollarSign, Users, Star, Calendar, Search, Filter } from 'lucide-react'

const Courts = () => {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('name')

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

  const filteredAndSortedCourts = courts
    .filter(court => {
      const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           court.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || court.type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-asc':
          return a.pricePerHour - b.pricePerHour
        case 'price-desc':
          return b.pricePerHour - a.pricePerHour
        default:
          return 0
      }
    })

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

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'iluminacao':
        return 'Lightning'
      case 'vestiarios':
        return 'Shirt'
      case 'bebedouro':
        return 'Droplet'
      case 'estacionamento':
        return 'Car'
      case 'lanchonete':
        return 'Coffee'
      case 'quadra_coberta':
        return 'Home'
      default:
        return 'Check'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nossas Quadras</h1>
        <p className="text-gray-600 mt-1">Escolha a quadra perfeita para seu jogo</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Type Filter */}
          <select
            className="input-field"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="futsal">Futsal</option>
            <option value="society">Society</option>
            <option value="basquete">Basquete</option>
          </select>

          {/* Sort */}
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Ordenar por nome</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-gray-600">
              {filteredAndSortedCourts.length} quadra(s) encontrada(s)
            </span>
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      {filteredAndSortedCourts.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma quadra encontrada</h3>
          <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourts.map((court) => (
            <div key={court._id} className="card hover:shadow-lg transition-shadow">
              {/* Court Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
                <MapPin className="w-16 h-16 text-primary-600" />
                <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full bg-white text-primary-600">
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

                {/* Action Button */}
                <Link
                  to={`/agendar/${court._id}`}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Horário</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Courts
