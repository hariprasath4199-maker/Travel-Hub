import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Travelers from './pages/Travelers';
import RequestDetail from './pages/RequestDetail';
import NewRequest from './pages/NewRequest';
import VisaWorkflow from './pages/VisaWorkflow';
import NewVisaRequest from './pages/NewVisaRequest';
import VisaRequestDetail from './pages/VisaRequestDetail';
import TicketBookings from './pages/TicketBookings';
import NewTicketBooking from './pages/NewTicketBooking';
import TicketBookingDetail from './pages/TicketBookingDetail';
import ActionPage from './pages/ActionPage';
import RoleSwitcher from './pages/RoleSwitcher';
import Admin from './pages/Admin';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="visa-requests" element={<VisaWorkflow />} />
          <Route path="visa-requests/new" element={<NewVisaRequest />} />
          <Route path="visa-requests/:id" element={<VisaRequestDetail />} />
          <Route path="ticket-bookings" element={<TicketBookings />} />
          <Route path="ticket-bookings/new" element={<NewTicketBooking />} />
          <Route path="ticket-bookings/:id" element={<TicketBookingDetail />} />
          <Route path="action/:token" element={<ActionPage />} />
          <Route path="requests" element={<Requests />} />
          <Route path="requests/new" element={<NewRequest />} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="travelers" element={<Travelers />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<RoleSwitcher />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-10">
      <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-4">{title}</h2>
      <p className="text-on-surface-variant">This page is under construction.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-8xl font-black text-primary/20 mb-4">404</div>
      <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Page Not Found</h2>
      <p className="text-on-surface-variant mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-primary text-on-primary rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95">
        Back to Dashboard
      </Link>
    </div>
  );
}
