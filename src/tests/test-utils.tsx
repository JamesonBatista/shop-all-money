import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { BankDashboard } from '../pages/bank/BankDashboard'
import { CartPage } from '../pages/shop/CartPage'
import { CategoryGrid } from '../pages/shop/CategoryGrid'
import { StoreList } from '../pages/shop/StoreList'
import { StorePage } from '../pages/shop/StorePage'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'

function Providers({ children, initialEntries }: { children: ReactNode; initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries ?? ['/login']}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] },
) {
  const { initialEntries, ...rest } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => <Providers initialEntries={initialEntries}>{children}</Providers>,
    ...rest,
  })
}

export function AppTestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
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
    </Routes>
  )
}

export function renderApp(initialEntries: string[] = ['/login']) {
  return renderWithProviders(<AppTestRoutes />, { initialEntries })
}
