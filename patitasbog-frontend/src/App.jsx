import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import './App.css';
import Layout from './views/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './contexts/AuthContext';
import ViewHome from './views/Home/ViewHome';
import ViewHomeLogin from './views/Home/ViewHomeLogin';
import ViewSignUp from './views/Register/ViewSignUp';
import ViewLogin from './views/Login/ViewLogin';
import ViewChangePassword from './views/Profile/ViewChangePassword';
import ViewProfile from './views/Profile/ViewProfile';
import ViewRecoverPassword from './views/Login/ViewRecoverPassword';
import ViewDetailsReport from './views/Reports/ViewDetailsReport';
import ViewEducation from './views/Education/ViewEducation';
import ConnTest from "./views/conn-test/conn-test";
import ReportForm from "./components/Reportes/ReportForm";
import SimpleCaptchaTest from './components/Testing/SimpleCaptchaTest';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Layout><ViewHome /></Layout>} />
          <Route path="/register" element={<ViewSignUp />} />
          <Route path="/login" element={<ViewLogin />} />
          <Route path="/recover_password" element={<ViewRecoverPassword />} />
          <Route path="/captcha-test" element={<SimpleCaptchaTest />} />
          <Route path="/change_password" element={<Layout><ViewChangePassword /></Layout>} />
          <Route path="/education" element={<Layout><ViewEducation /></Layout>} />
          
          {/* Protegidas */}
          <Route path="/perfil" element={<Layout><ViewProfile /></Layout>} />
          <Route path="/reportes/:idReporte" element={<Layout><ViewDetailsReport /></Layout>} />
          <Route
            path="/home"
            element={
              <PrivateRoute><Layout><ViewHomeLogin /></Layout></PrivateRoute>
            }
          />
          <Route
            path="/create-report"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="lost"/>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/updating/:reportId"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="updating"/>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sighting/:reportId"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="sighting"/>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/found/:reportId"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="found"/>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sighting_edit/:reportId/:responseId"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="sightingEdit"/>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/found_edit/:reportId/:responseId"
            element={
              <PrivateRoute>
                <Layout>
                  <ReportForm type="foundEdit"/>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
