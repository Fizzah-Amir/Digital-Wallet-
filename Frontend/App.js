import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import BillPayment from './pages/BillPayment';
import Recharge from './pages/Recharge';
import DebitCard from './pages/DebitCard';
import Promotions from './pages/Promotions';
import Notifications from './pages/Notifications';
import Rank from './pages/Rank';
import Profile from './pages/Profile';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminMerchants from './pages/admin/AdminMerchants';
import AdminWallets from './pages/admin/AdminWallets';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminBillPayments from './pages/admin/AdminBillPayments';
import AdminRecharges from './pages/admin/AdminRecharges';
import AdminTransactions from './pages/admin/AdminTransactions';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
    <Sidebar />
    <main style={{
      marginLeft: '250px',
      flex: 1,
      padding: '35px',
      minHeight: '100vh',
    }}>
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/transfer" element={
            <ProtectedRoute allowedRoles={['user', 'merchant']}>
              <Layout><Transfer /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['user', 'merchant']}>
              <Layout><Transactions /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/transactions" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminTransactions /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/bill-payment" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout><BillPayment /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/recharge" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout><Recharge /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/debit-card" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout><DebitCard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/promotions" element={
            <ProtectedRoute>
              <Layout><Promotions /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout><Notifications /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/rank" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout><Rank /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminUsers /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users/:person_id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminUserDetail /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/merchants" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminMerchants /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/wallets" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminWallets /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/revenue" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminRevenue /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/bill-payments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminBillPayments /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/recharges" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminRecharges /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;