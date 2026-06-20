// ============================================
// SMARTFOOD - Módulo Estudiante
// ============================================
let menuActual = null;

function iniciarEstudiante(usuario) {
  // Navbar
  document.getElementById('stu-name').textContent = usuario.nombre;
  document.getElementById('stu-avatar').textContent = Utils.iniciales(usuario.nombre);
  document.getElementById('stu-fecha').textContent = Utils.fechaES(Utils.hoy());
  document.getElementById('stu-welcome-name').textContent = usuario.nombre.split(' ')[0];
  // Ir al dashboard
  goSub('dashboard');
  // Cargar conteo de no leídas
  actualizarBadgeNotifs();
}

async function actualizarBadgeNotifs() {
  try {
    const r = await Api.noLeidas();
    const badge = document.getElementById('notif-count');
    if (badge) { badge.textContent = r.count; badge.style.display = r.count > 0 ? 'flex' : 'none'; }
  } catch (_) {}
}

// ====== DASHBOARD ======
async function cargarDashboard() {
  try {
    const menu = await Api.menuHoy();
    menuActual = menu;
    document.getElementById('dash-menu-fecha').textContent = Utils.fechaES(menu.fecha);
    document.getElementById('dash-entrada').textContent    = menu.entrada;
    document.getElementById('dash-principal').textContent  = menu.plato_principal;
    document.getElementById('dash-bebida').textContent     = menu.bebida;
    document.getElementById('dash-postre').textContent     = menu.postre;
    // Estado de confirmación del estudiante
    const estado = await Api.miEstado(menu.id_menu);
    const elEstado = document.getElementById('dash-estado');
    if (estado.estado === 'confirmado') elEstado.innerHTML = '<span class="badge badge-green">✓ Confirmado</span>';
    else if (estado.estado === 'cancelado') elEstado.innerHTML = '<span class="badge badge-red">✗ Cancelado</span>';
    else elEstado.innerHTML = '<span class="badge badge-amber">Pendiente</span>';
    // Conteo
    const conteo = await Api.conteo(menu.id_menu);
    document.getElementById('dash-conteo').textContent = `${conteo.confirmados} / ${conteo.total}`;
    document.getElementById('dash-prog').style.width = `${Math.round(conteo.confirmados / conteo.total * 100)}%`;
  } catch (e) {
    document.getElementById('dash-menu-area').innerHTML = `<div class="alert alert-info"><i class="ti ti-info-circle"></i> No hay menú publicado para hoy.</div>`;
  }
}

// ====== MENÚ SEMANAL ======
async function cargarMenuSemana() {
  const cont = document.getElementById('menu-semana-grid');
  cont.innerHTML = '<p style="color:var(--text-sec)">Cargando menú...</p>';
  try {
    const menus = await Api.menuSemana();
    if (!menus.length) { cont.innerHTML = '<div class="alert alert-info"><i class="ti ti-info-circle"></i> No hay menús publicados esta semana.</div>'; return; }
    cont.innerHTML = menus.map(m => `
      <div class="card" style="margin-bottom:12px">
        <div class="card-title"><i class="ti ti-calendar"></i> ${Utils.fechaES(m.fecha)}</div>
        <div class="menu-item"><span class="menu-item-label">Entrada</span><span class="menu-item-val">${m.entrada}</span></div>
        <div class="menu-item"><span class="menu-item-label">Plato principal</span><span class="menu-item-val">${m.plato_principal}</span></div>
        <div class="menu-item"><span class="menu-item-label">Bebida</span><span class="menu-item-val">${m.bebida}</span></div>
        <div class="menu-item"><span class="menu-item-label">Postre</span><span class="menu-item-val">${m.postre}</span></div>
      </div>`).join('');
  } catch (e) { cont.innerHTML = `<div class="alert alert-danger"><i class="ti ti-x"></i> ${e.message}</div>`; }
}

// ====== CONFIRMACIÓN ======
async function cargarConfirmacion() {
  try {
    const menu = await Api.menuHoy();
    menuActual = menu;
    document.getElementById('conf-fecha').textContent     = Utils.fechaES(menu.fecha);
    document.getElementById('conf-entrada').textContent   = menu.entrada;
    document.getElementById('conf-principal').textContent = menu.plato_principal;
    document.getElementById('conf-bebida').textContent    = menu.bebida;
    document.getElementById('conf-postre').textContent    = menu.postre;
    const estado = await Api.miEstado(menu.id_menu);
    actualizarBotonesConfirmacion(estado.estado);
    const conteo = await Api.conteo(menu.id_menu);
    document.getElementById('conf-conteo-num').textContent = `${conteo.confirmados} de ${conteo.total}`;
    document.getElementById('conf-prog').style.width = `${Math.round(conteo.confirmados / conteo.total * 100)}%`;
  } catch (e) {
    document.getElementById('conf-menu-area').innerHTML = `<div class="alert alert-info"><i class="ti ti-info-circle"></i> No hay menú disponible para confirmar.</div>`;
  }
}

function actualizarBotonesConfirmacion(estado) {
  const btnConf = document.getElementById('btn-confirmar');
  const btnCanc = document.getElementById('btn-cancelar');
  const label   = document.getElementById('conf-estado-label');
  btnConf.className = 'confirm-big' + (estado === 'confirmado' ? ' active-confirm' : '');
  btnCanc.className = 'confirm-big' + (estado === 'cancelado'  ? ' active-cancel'  : '');
  if (estado === 'confirmado') label.innerHTML = 'Estado: <strong style="color:var(--success)">Confirmado ✓</strong>';
  else if (estado === 'cancelado') label.innerHTML = 'Estado: <strong style="color:var(--danger)">Cancelado ✗</strong>';
  else label.innerHTML = 'Estado: <strong style="color:var(--warning)">Sin confirmar</strong>';
}

async function accionConfirmar() {
  if (!menuActual) return;
  try {
    await Api.confirmar(menuActual.id_menu);
    actualizarBotonesConfirmacion('confirmado');
    Utils.toast('Tu asistencia fue registrada exitosamente 🎉', 'success', 'conf-toast');
    const conteo = await Api.conteo(menuActual.id_menu);
    document.getElementById('conf-conteo-num').textContent = `${conteo.confirmados} de ${conteo.total}`;
    document.getElementById('conf-prog').style.width = `${Math.round(conteo.confirmados / conteo.total * 100)}%`;
    actualizarBadgeNotifs();
  } catch (e) { Utils.toast(e.message, 'danger', 'conf-toast'); }
}

async function accionCancelar() {
  if (!menuActual) return;
  try {
    await Api.cancelar(menuActual.id_menu);
    actualizarBotonesConfirmacion('cancelado');
    Utils.toast('Tu reserva fue cancelada. Puedes volver a confirmar antes de las 6:00 p.m.', 'warning', 'conf-toast');
  } catch (e) { Utils.toast(e.message, 'danger', 'conf-toast'); }
}

// ====== HISTORIAL ======
async function cargarHistorial() {
  const tbody = document.getElementById('historial-tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-sec)">Cargando...</td></tr>';
  try {
    const datos = await Api.historial();
    if (!datos.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-sec)">Sin confirmaciones registradas.</td></tr>'; return; }
    tbody.innerHTML = datos.map(c => `
      <tr>
        <td>${Utils.fechaCorta(c.Menu?.fecha || '')}</td>
        <td>${c.Menu?.plato_principal || '—'}</td>
        <td>${Utils.estadoBadge(c.estado)}</td>
        <td style="color:var(--text-sec)">${Utils.horaRelativa(c.fecha_confirmacion)}</td>
      </tr>`).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="4" class="alert-danger">${e.message}</td></tr>`; }
}

// ====== NOTIFICACIONES ======
async function cargarNotificaciones() {
  const cont = document.getElementById('notifs-lista');
  cont.innerHTML = '<p style="color:var(--text-sec)">Cargando...</p>';
  try {
    await Api.marcarLeidas();
    actualizarBadgeNotifs();
    const notifs = await Api.misNotifs();
    if (!notifs.length) { cont.innerHTML = '<p style="color:var(--text-sec);text-align:center;padding:20px">Sin notificaciones.</p>'; return; }
    const iconos = { menu:'ti-tool', confirmacion:'ti-check', recordatorio:'ti-clock', cancelacion:'ti-x', sistema:'ti-bell' };
    const colores = { menu:'background:#E6F1FB;color:#185FA5', confirmacion:'background:#EAF3DE;color:#3B6D11', recordatorio:'background:#FAEEDA;color:#854F0B', cancelacion:'background:#FCEBEB;color:#A32D2D', sistema:'background:#f3f4f6;color:#6b7280' };
    cont.innerHTML = notifs.map(n => `
      <div class="notif-row">
        <div class="notif-icon" style="${colores[n.tipo]||colores.sistema}"><i class="ti ${iconos[n.tipo]||'ti-bell'}"></i></div>
        <div class="notif-body">
          <div class="notif-title">${n.titulo}</div>
          <div class="notif-msg">${n.mensaje}</div>
          <div class="notif-time">${Utils.horaRelativa(n.fecha)}</div>
        </div>
      </div>`).join('');
  } catch (e) { cont.innerHTML = `<div class="alert alert-danger"><i class="ti ti-x"></i> ${e.message}</div>`; }
}

// ====== PERFIL ======
async function cargarPerfil() {
  try {
    const u = await Api.perfil();
    document.getElementById('p-nombre').value      = u.nombre || '';
    document.getElementById('p-correo').value      = u.correo || '';
    document.getElementById('p-ciudad').value      = u.perfil?.ciudad || '';
    document.getElementById('p-curso').value       = u.perfil?.curso || '';
    document.getElementById('p-alergias').value    = u.perfil?.alergias || '';
    document.getElementById('p-prefs').value       = u.perfil?.preferencias || 'ninguna';
    document.getElementById('p-avatar').textContent = Utils.iniciales(u.nombre);
    document.getElementById('p-nombre-display').textContent = u.nombre;
  } catch (e) { Utils.toast('Error al cargar perfil: ' + e.message, 'danger', 'perfil-toast'); }
}

async function guardarPerfil(e) {
  if (e) e.preventDefault();
  try {
    const datos = {
      nombre:      document.getElementById('p-nombre').value.trim(),
      ciudad:      document.getElementById('p-ciudad').value.trim(),
      curso:       document.getElementById('p-curso').value,
      alergias:    document.getElementById('p-alergias').value.trim(),
      preferencias:document.getElementById('p-prefs').value,
    };
    await Api.actualizarPerfil(datos);
    Utils.toast('Perfil actualizado correctamente.', 'success', 'perfil-toast');
    document.getElementById('p-nombre-display').textContent = datos.nombre;
    document.getElementById('p-avatar').textContent = Utils.iniciales(datos.nombre);
    document.getElementById('stu-name').textContent = datos.nombre;
    document.getElementById('stu-avatar').textContent = Utils.iniciales(datos.nombre);
  } catch (e) { Utils.toast(e.message, 'danger', 'perfil-toast'); }
}

async function cambiarPassword(e) {
  if (e) e.preventDefault();
  const actual = document.getElementById('p-pass-actual').value;
  const nuevo  = document.getElementById('p-pass-nuevo').value;
  const nuevo2 = document.getElementById('p-pass-nuevo2').value;
  if (!actual || !nuevo) { Utils.toast('Completa todos los campos', 'warning', 'perfil-toast'); return; }
  if (nuevo !== nuevo2)  { Utils.toast('Las nuevas contraseñas no coinciden', 'danger', 'perfil-toast'); return; }
  try {
    await Api.cambiarPassword({ password_actual: actual, password_nuevo: nuevo });
    Utils.toast('Contraseña actualizada exitosamente.', 'success', 'perfil-toast');
    document.getElementById('p-pass-actual').value = '';
    document.getElementById('p-pass-nuevo').value  = '';
    document.getElementById('p-pass-nuevo2').value = '';
  } catch (e) { Utils.toast(e.message, 'danger', 'perfil-toast'); }
}
