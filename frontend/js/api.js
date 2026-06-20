// ============================================
// SMARTFOOD - Capa de comunicación con la API
// ============================================
const API_URL = '/api';

const Api = {
  token: localStorage.getItem('sf_token'),

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  },

  async _fetch(method, path, body) {
    try {
      const opts = { method, headers: this._headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(API_URL + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Error en la solicitud');
      return data;
    } catch (e) {
      throw e;
    }
  },

  get:    (path)        => Api._fetch('GET',    path),
  post:   (path, body)  => Api._fetch('POST',   path, body),
  put:    (path, body)  => Api._fetch('PUT',    path, body),
  delete: (path)        => Api._fetch('DELETE', path),

  // Auth
  login:    (correo, password)       => Api.post('/auth/login', { correo, password }),
  register: (datos)                  => Api.post('/auth/register', datos),

  // Menú
  menuHoy:   ()     => Api.get('/menu'),
  menuSemana: ()    => Api.get('/menu/semana'),
  menusTodos: ()    => Api.get('/menu/todos'),
  crearMenu:  (d)   => Api.post('/menu', d),
  editarMenu: (id, d) => Api.put(`/menu/${id}`, d),
  eliminarMenu: (id)  => Api.delete(`/menu/${id}`),

  // Confirmaciones
  confirmar:     (id_menu)  => Api.post('/confirmacion', { id_menu }),
  cancelar:      (id_menu)  => Api.delete(`/confirmacion/${id_menu}`),
  miEstado:      (id_menu)  => Api.get(`/confirmacion/mi-estado/${id_menu}`),
  historial:     ()         => Api.get('/confirmacion/historial'),
  conteo:        (id_menu)  => Api.get(`/confirmacion/conteo/${id_menu}`),
  todasConfirm:  (fecha)    => Api.get(`/confirmacion/todas${fecha ? '?fecha=' + fecha : ''}`),

  // Usuarios
  perfil:         ()          => Api.get('/usuarios/perfil'),
  actualizarPerfil: (d)       => Api.put('/usuarios/perfil', d),
  cambiarPassword:  (d)       => Api.put('/usuarios/cambiar-password', d),
  listarUsuarios:  ()         => Api.get('/usuarios'),
  crearUsuario:    (d)        => Api.post('/usuarios', d),
  editarUsuario:   (id, d)    => Api.put(`/usuarios/${id}`, d),
  eliminarUsuario: (id)       => Api.delete(`/usuarios/${id}`),

  // Notificaciones
  misNotifs:     ()   => Api.get('/notificaciones'),
  noLeidas:      ()   => Api.get('/notificaciones/no-leidas'),
  marcarLeidas:  ()   => Api.put('/notificaciones/marcar-leidas'),
  enviarMasiva:  (d)  => Api.post('/notificaciones/masiva', d),

  // Reportes
  estadisticas: ()  => Api.get('/reportes/estadisticas'),
  semanal:      ()  => Api.get('/reportes/semanal'),
};
