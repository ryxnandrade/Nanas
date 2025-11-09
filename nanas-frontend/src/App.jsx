import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Despesas from './components/Despesas'
import Carteiras from './components/Carteiras'
import CartaoCredito from './components/CartaoCredito'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/despesas" element={
        <ProtectedRoute>
          <Despesas />
        </ProtectedRoute>
      } />
      <Route path="/carteiras" element={
        <ProtectedRoute>
          <Carteiras />
        </ProtectedRoute>
      } />
      <Route path="/cartao-credito" element={
        <ProtectedRoute>
          <CartaoCredito />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
