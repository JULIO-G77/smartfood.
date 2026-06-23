// ============================================
// SMARTFOOD - Controlador principal
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión al cargar
  const u = Utils.getSession();
  if (u) {
    mostrarApp(u);
  } else {
    showPage('login');
  }
});

function showPage(nombre) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + nombre);
  if (el) el.classList.add('active');
}

function mostrarApp(usuario) {
  if (usuario.rol === 'admin') {
    iniciarAdmin(usuario);
    showPage('admin');
  } else {
    iniciarEstudiante(usuario);
    showPage('estudiante');
  }
}

// ====== LOGIN ======
async function doLogin(e) {
  if (e) e.preventDefault();
  const correo = document.getElementById('login-correo').value.trim();
  const pass   = document.getElementById('login-pass').value;
  if (!correo || !pass) { Utils.toast('Completa correo y contraseña', 'warning', 'login-toast'); return; }
  try {
    document.getElementById('btn-login').disabled = true;
    document.getElementById('btn-login').textContent = 'Ingresando...';
    const res = await Api.login(correo, pass);
    Utils.setSession(res.token, res.usuario);
    mostrarApp(res.usuario);
  } catch (err) {
    Utils.toast(err.message, 'danger', 'login-toast');
  } finally {
    const btn = document.getElementById('btn-login');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-login"></i> Ingresar'; }
  }
}

// ====== LOGOUT ======
function logout() {
  Utils.clearSession();
  showPage('login');
}

// ====== NAVEGACIÓN ESTUDIANTE ======
function goSub(seccion) {
  document.querySelectorAll('[data-sub]').forEach(el => el.style.display = 'none');
  const el = document.querySelector(`[data-sub="${seccion}"]`);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.sidebar-link[data-goto]').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.sidebar-link[data-goto="${seccion}"]`);
  if (btn) btn.classList.add('active');
  // Cargar datos de la sección
  const cargadores = {
    dashboard:  cargarDashboard,
    menu:       cargarMenuSemana,
    confirmacion: cargarConfirmacion,
    historial:  cargarHistorial,
    notifs:     cargarNotificaciones,
    perfil:     cargarPerfil,
  };
  if (cargadores[seccion]) cargadores[seccion]();
}

// ====== NAVEGACIÓN ADMIN ======
function goAdmin(seccion) {
  document.querySelectorAll('[data-admin]').forEach(el => el.style.display = 'none');
  const el = document.querySelector(`[data-admin="${seccion}"]`);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.sidebar-link[data-admin-goto]').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.sidebar-link[data-admin-goto="${seccion}"]`);
  if (btn) btn.classList.add('active');
  const cargadores = {
    panel:    cargarPanelAdmin,
    usuarios: cargarUsuarios,
    menus:    cargarMenusAdmin,
    confirmaciones: cargarConfirmacionesAdmin,
    reportes: cargarReportesAdmin,
    notifs:   cargarNotifsAdmin,
  };
  if (cargadores[seccion]) cargadores[seccion]();
}
