// ============================================
// SMARTFOOD - Utilidades globales
// ============================================

const Utils = {
  // Mostrar toast/alerta
  toast(msg, tipo = 'success', containerId = 'toast-container') {
    const icons = { success: 'ti-check', danger: 'ti-x', warning: 'ti-alert-triangle', info: 'ti-info-circle' };
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${tipo}"><i class="ti ${icons[tipo] || 'ti-info-circle'}"></i><span>${msg}</span></div>`;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.display = 'none'; el.innerHTML = ''; }, 4000);
  },

  // Formatear fecha en español
  fechaES(fechaStr) {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },

  fechaCorta(fechaStr) {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  horaRelativa(fechaISO) {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diff = Math.floor((ahora - fecha) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff/3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff/86400)} días`;
    return Utils.fechaCorta(fechaISO.split('T')[0]);
  },

  // Iniciales para avatar
  iniciales(nombre = '') {
    const p = nombre.trim().split(' ');
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?';
  },

  // Guardar y leer sesión
  setSession(token, usuario) {
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_usuario', JSON.stringify(usuario));
    Api.token = token;
  },

  getSession() {
    const u = localStorage.getItem('sf_usuario');
    return u ? JSON.parse(u) : null;
  },

  clearSession() {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_usuario');
    Api.token = null;
  },

  // Estado badge
  estadoBadge(estado) {
    const map = { confirmado: 'badge-green', cancelado: 'badge-red', pendiente: 'badge-amber' };
    return `<span class="badge ${map[estado] || 'badge-gray'}">${estado}</span>`;
  },

  // Hoy en formato YYYY-MM-DD
  hoy() {
    return new Date().toISOString().split('T')[0];
  },

  // Exportar tabla a CSV
  exportarCSV(datos, nombreArchivo) {
    if (!datos.length) return;
    const cols = Object.keys(datos[0]);
    const rows = [cols.join(','), ...datos.map(r => cols.map(c => `"${r[c] ?? ''}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo;
    a.click();
  }
};
