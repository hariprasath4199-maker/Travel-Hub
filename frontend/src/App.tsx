import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Travelers from './pages/Travelers';
import RequestDetail from './pages/RequestDetail';
import NewRequest from './pages/NewRequest';
import VisaWorkflow from './pages/VisaWorkflow';
import NewVisaRequest from './pages/NewVisaRequest';
import VisaRequestDetail from './pages/VisaRequestDetail';
import ActionPage from './pages/ActionPage';
import RoleSwitcher from './pages/RoleSwitcher';

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
          <Route path="action/:token" element={<ActionPage />} />
          <Route path="requests" element={<Requests />} />
          <Route path="requests/new" element={<NewRequest />} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="travelers" element={<Travelers />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="settings" element={<RoleSwitcher />} />
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
