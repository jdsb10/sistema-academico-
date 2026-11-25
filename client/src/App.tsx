import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FacultadesPage from './pages/FacultadesPage';
import ProgramasPage from './pages/ProgramasPage';
import MateriasPage from './pages/MateriasPage';
import AulasPage from './pages/AulasPage';
import AdministradoresPage from './pages/personas/AdministradoresPage';
import CoordinadoresPage from './pages/personas/CoordinadoresPage';
import DocentesPage from './pages/personas/DocentesPage';
import EstudiantesPage from './pages/personas/EstudiantesPage';
import GruposPage from './pages/GruposPage';
import CargasAcademicasPage from './pages/CargasAcademicasPage';
import AsistenciasPage from './pages/AsistenciasPage';
import SensoresPage from './pages/SensoresPage';
import MicrocurriculosPage from './pages/MicrocurriculosPage';
import MicrocurriculoDetallePage from './pages/MicrocurriculoDetallePage';
import ReportesPage from './pages/ReportesPage';
import AuditoriaPage from './pages/AuditoriaPage';
import RespaldosPage from './pages/RespaldosPage';
import MiHorarioPage from './pages/MiHorarioPage';
import MisAsistenciasPage from './pages/MisAsistenciasPage';
import MisCalificacionesPage from './pages/MisCalificacionesPage';
import CalificacionesDocentePage from './pages/CalificacionesDocentePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<RoleRoute roles={['ADMINISTRADOR']} />}>
            <Route path="facultades" element={<FacultadesPage />} />
            <Route path="administradores" element={<AdministradoresPage />} />
            <Route path="sensores" element={<SensoresPage />} />
            <Route path="auditoria" element={<AuditoriaPage />} />
            <Route path="respaldos" element={<RespaldosPage />} />
          </Route>

          <Route element={<RoleRoute roles={['ADMINISTRADOR', 'COORDINADOR']} />}>
            <Route path="programas" element={<ProgramasPage />} />
            <Route path="materias" element={<MateriasPage />} />
            <Route path="aulas" element={<AulasPage />} />
            <Route path="coordinadores" element={<CoordinadoresPage />} />
            <Route path="docentes" element={<DocentesPage />} />
            <Route path="estudiantes" element={<EstudiantesPage />} />
            <Route path="grupos" element={<GruposPage />} />
            <Route path="cargas-academicas" element={<CargasAcademicasPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>

          <Route element={<RoleRoute roles={['DOCENTE', 'ESTUDIANTE']} />}>
            <Route path="mi-horario" element={<MiHorarioPage />} />
          </Route>
          <Route element={<RoleRoute roles={['DOCENTE']} />}>
            <Route path="calificaciones" element={<CalificacionesDocentePage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE']} />}>
            <Route path="asistencias" element={<AsistenciasPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE']} />}>
            <Route path="microcurriculos" element={<MicrocurriculosPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE']} />}>
            <Route path="microcurriculos/:id" element={<MicrocurriculoDetallePage />} />
          </Route>

          <Route element={<RoleRoute roles={['ESTUDIANTE']} />}>
            <Route path="mis-asistencias" element={<MisAsistenciasPage />} />
            <Route path="mis-calificaciones" element={<MisCalificacionesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
