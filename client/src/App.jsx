import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Courts from './pages/Courts'
import Bookings from './pages/Bookings'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourts from './pages/admin/AdminCourts'
import AdminBookings from './pages/admin/AdminBookings'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} setUser={setUser} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            
            {/* Rotas do cliente */}
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/quadras" 
              element={user ? <Courts /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/meus-agendamentos" 
              element={user ? <Bookings /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/perfil" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
            
            {/* Rotas admin */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/usuarios" 
              element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/quadras" 
              element={user?.role === 'admin' ? <AdminCourts /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/agendamentos" 
              element={user?.role === 'admin' ? <AdminBookings /> : <Navigate to="/login" />} 
            />
            
            {/* Redirecionamento padrão */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
