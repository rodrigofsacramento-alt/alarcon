import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Atendimento from './pages/Atendimento';
import Agenda from './pages/Agenda';
import Tecnologia from './pages/Tecnologia';

export default function App() {
  return (
    <BrowserRouter basename="/tecnologia">
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas envelopadas pelo Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tecnologia" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="atendimento" element={<Atendimento />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="tecnologia" element={<Tecnologia />} />
        </Route>

        {/* Redirecionamento padrão para tecnologia se rota inválida (inclui index.html) */}
        <Route path="*" element={<Navigate to="/tecnologia" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
