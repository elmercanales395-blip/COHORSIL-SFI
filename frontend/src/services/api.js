import axios from 'axios';

// Instancia central de axios que uso en todos los servicios, con la URL base del backend
// tomada de las variables de entorno de Vite (VITE_API_URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor que se ejecuta antes de cada petición: le agrego el token guardado en sessionStorage
// así no tengo que repetir esta lógica en cada llamada a la API
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
