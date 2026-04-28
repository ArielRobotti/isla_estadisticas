import { Routes, Route, Navigate } from "react-router";
import Profile from './pages/Profile';
import Metrics from './pages/Metrics';
import WalletPage from './pages/WalletPage';
import CouponsAdmin from "./pages/CouponsAdmin";
import NavBar from './components/NavBar';
import RedeemCoupon from './components/RedeemCoupon';

import { Toaster } from 'sonner';

const App: React.FC = () => {

  const params = new URLSearchParams(window.location.search);
  const claimCode = (params.get('claim') ? params.get('claim') : "") as string;

  return (
    <div className="w-full font-rajdhani">
      <Toaster position="top-right" richColors />
      <NavBar />
      <RedeemCoupon claimCode={claimCode} />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/coupons" element={<CouponsAdmin />} />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;