import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Página de inicio de sesión
export default function LoginPage() {
  // Traigo la función de login del contexto de auth
  const { iniciarSesion } = useAuth();
  // Uso navigate para redirigir al usuario después de un login exitoso
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Controla el estado de carga para deshabilitar el botón mientras se valida
  const [cargando, setCargando] = useState(false);
  // Controla si se muestra el mensaje de "contacta a tu administrador"
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  // Controla si la contraseña se muestra en texto plano
  const [verPassword, setVerPassword] = useState(false);

  async function handleSubmit(e) {
    // Evito que el formulario recargue la página
    e.preventDefault();
    setError('');

    // Valido en español antes de mandar la petición, en vez de dejar que
    // el navegador muestre sus globos de validación nativos (salen en inglés)
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(email, password);
      // Si el login sale bien, mando al usuario a la página principal
      navigate('/');
    } catch (err) {
      // Muestro el mensaje de error que manda el backend, o uno genérico si no viene
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-overlay" />
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <div className="app-brand-mark">CH</div>
          <h1>COHORSIL</h1>
          <p><strong>¡Somos Innovación Agropecuaria!</strong></p>
        
        </div>

        <div className="field">
          <label htmlFor="email"><strong>Correo</strong></label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password"><strong>Contraseña</strong></label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={verPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setVerPassword((valor) => !valor)}
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7c2.06 0 3.79.62 5.2 1.47M22 12s-1.06 2.13-3.06 3.98M9.9 9.9a3 3 0 1 0 4.2 4.2" />
                  <path d="M4 4l16 16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Solo muestro el mensaje de error si existe */}
        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <div className="auth-forgot">
          <button
            type="button"
            className="auth-forgot-link"
            onClick={() => setMostrarAyuda((valor) => !valor)}
          >
            ¿Has olvidado tu contraseña?
          </button>
          {mostrarAyuda && (
            <p className="auth-forgot-message">Contacta a tu administrador para que la restablezca.</p>
          )}
        </div>
      </form>
    </div>
  );
}
