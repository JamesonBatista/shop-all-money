import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PageTransition } from './components/layout/PageTransition'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { runSilentBankBootstrap } from './firebase/bootstrap'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BankDashboard } from './pages/bank/BankDashboard'
import { CartPage } from './pages/shop/CartPage'
import { CategoryGrid } from './pages/shop/CategoryGrid'
import { StoreList } from './pages/shop/StoreList'
import { StorePage } from './pages/shop/StorePage'

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route
          path="/banco"
          element={
            <ProtectedRoute>
              <BankDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loja"
          element={
            <ProtectedRoute>
              <CategoryGrid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loja/:categoryId"
          element={
            <ProtectedRoute>
              <StoreList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loja/:categoryId/:storeId"
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carrinho"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PageTransition>
  )
}

export default function App() {
  useEffect(() => {
    void runSilentBankBootstrap()
  }, [])

  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  )
}
