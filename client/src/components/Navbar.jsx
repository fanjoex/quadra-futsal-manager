import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Calendar, Home, Settings, Users, MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = ({ user, setUser }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const clientLinks = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/quadras', label: 'Quadras', icon: MapPin },
    { path: '/meus-agendamentos', label: 'Meus Agendamentos', icon: Calendar },
    { path: '/perfil', label: 'Perfil', icon: User },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/usuarios', label: 'Usuários', icon: Users },
    { path: '/admin/quadras', label: 'Quadras', icon: MapPin },
    { path: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
    { path: '/perfil', label: 'Perfil', icon: Settings },
  ]

  const links = user?.role === 'admin' ? adminLinks : clientLinks

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/') : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">QF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Quadra Futsal</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {links.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile auth buttons */}
        {mobileMenuOpen && !user && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block mx-3 btn btn-primary text-center"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
