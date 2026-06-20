// ============================================
// SMARTFOOD - Módulo Administrador
// ============================================

function iniciarAdmin(usuario) {
  document.getElementById('admin-name').textContent = usuario.nombre;
  document.getElementById('admin-avatar').textContent = Utils.iniciales(usuario.nombre);
  goAdmin('panel');
}

// ====== PANEL PRINCIPAL ======
async function cargarPanelAdmin() {
  try {
    const stats = await Api.estadisticas();
    document.getElementById('adm-total').textContent       = stats.totalEstudiantes;
    document.getElementById('adm-confirmados').textContent = stats.confirmadosHoy;
    document.getElementById('adm-cancelados').textContent  = stats.canceladosHoy;
    document.getElementById('adm-pendientes').textContent  = stats.pendientesHoy;
    document.getElementById('adm-pct').textContent         = stats.porcentajeAsistencia + '%';
    document.getElementById('adm-prog').style.width        = stats.porcentajeAsistencia + '%';
    // Alerta si está por debajo del promedio
    const alerta = document.getElementById('adm-alerta');
    if (stats.porcentajeAsistencia < 60) {
      alerta.innerHTML = `<div class="alert alert-warning alert-left"><i class="ti ti-alert-triangle"></i> Solo el ${stats.porcentajeAsistencia}% ha confirmado. Se recomienda enviar recordatorio masivo.</div>`;
    } else {
      alerta.innerHTML = `<div class="alert alert-success"><i class="ti ti-check"></i> Buen nivel de confirmaciones hoy (${stats.porcentajeAsistencia}%).</div>`;
    }
    document.getElementById('adm-fecha').textContent = Utils.fechaES(Utils.hoy());
  } catch (e) { Utils.toast('Error al cargar estadísticas: ' + e.message, 'danger', 'adm-toast'); }
}

// ====== USUARIOS ======
let usuarioEditando = null;

async function cargarUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-sec)">Cargando...</td></tr>';
  try {
    let lista = await Api.listarUsuarios();
    const buscar = document.getElementById('buscar-usuario')?.value.toLowerCase() || '';
    const rol    = document.getElementById('filtro-rol')?.value || '';
    if (buscar) lista = lista.filter(u => u.nombre.toLowerCase().includes(buscar) || u.correo.toLowerCase().includes(buscar));
    if (rol)    lista = lista.filter(u => u.rol === rol);
    tbody.innerHTML = lista.map(u => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--primary);flex-shrink:0">${Utils.iniciales(u.nombre)}</div>${u.nombre}</div></td>
        <td style="color:var(--text-sec)">${u.correo}</td>
        <td>${u.rol === 'admin' ? '<span class="badge badge-amber">admin</span>' : '<span class="badge badge-blue">estudiante</span>'}</td>
        <td>${u.perfil?.curso || '—'}</td>
        <td style="color:var(--text-sec)">${Utils.fechaCorta(u.fecha_registro?.split('T')[0] || '')}</td>
        <td>
          <button class="btn btn-sm btn-icon" onclick="abrirEditarUsuario(${u.id_usuario})" title="Editar"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="confirmarEliminarUsuario(${u.id_usuario},'${u.nombre}')" title="Eliminar"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger">${e.message}</div></td></tr>`; }
}

function abrirModalUsuario(usuario = null) {
  usuarioEditando = usuario;
  document.getElementById('modal-usuario-titulo').textContent = usuario ? 'Editar usuario' : 'Nuevo usuario';
  document.getElementById('nu-nombre').value   = usuario?.nombre || '';
  document.getElementById('nu-correo').value   = usuario?.correo || '';
  document.getElementById('nu-pass').value     = '';
  document.getElementById('nu-rol').value      = usuario?.rol || 'estudiante';
  document.getElementById('nu-curso').value    = usuario?.perfil?.curso || '';
  document.getElementById('nu-alergias').value = usuario?.perfil?.alergias || '';
  document.getElementById('nu-pass').placeholder = usuario ? 'Dejar vacío para no cambiar' : 'Contraseña';
  document.getElementById('modal-usuario').style.display = 'flex';
}

async function abrirEditarUsuario(id) {
  try {
    const lista = await Api.listarUsuarios();
    const u = lista.find(x => x.id_usuario === id);
    if (u) abrirModalUsuario(u);
  } catch (e) { Utils.toast(e.message, 'danger', 'adm-toast'); }
}

function cerrarModalUsuario() {
  document.getElementById('modal-usuario').style.display = 'none';
  usuarioEditando = null;
}

async function guardarUsuario(e) {
  if (e) e.preventDefault();
  const datos = {
    nombre:   document.getElementById('nu-nombre').value.trim(),
    correo:   document.getElementById('nu-correo').value.trim(),
    rol:      document.getElementById('nu-rol').value,
    curso:    document.getElementById('nu-curso').value,
    alergias: document.getElementById('nu-alergias').value.trim(),
  };
  const pass = document.getElementById('nu-pass').value;
  if (!usuarioEditando && !pass) { Utils.toast('La contraseña es requerida para nuevos usuarios', 'warning', 'modal-usuario-toast'); return; }
  if (pass) datos.password = pass;
  if (!datos.nombre || !datos.correo) { Utils.toast('Nombre y correo son requeridos', 'warning', 'modal-usuario-toast'); return; }
  try {
    if (usuarioEditando) {
      await Api.editarUsuario(usuarioEditando.id_usuario, datos);
      Utils.toast('Usuario actualizado.', 'success', 'adm-toast');
    } else {
      await Api.crearUsuario(datos);
      Utils.toast('Usuario creado exitosamente.', 'success', 'adm-toast');
    }
    cerrarModalUsuario();
    cargarUsuarios();
  } catch (e) { Utils.toast(e.message, 'danger', 'modal-usuario-toast'); }
}

async function confirmarEliminarUsuario(id, nombre) {
  if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await Api.eliminarUsuario(id);
    Utils.toast('Usuario eliminado.', 'success', 'adm-toast');
    cargarUsuarios();
  } catch (e) { Utils.toast(e.message, 'danger', 'adm-toast'); }
}

// ====== MENÚS ADMIN ======
let menuEditando = null;

async function cargarMenusAdmin() {
  const tbody = document.getElementById('menus-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-sec)">Cargando...</td></tr>';
  try {
    const menus = await Api.menusTodos();
    tbody.innerHTML = menus.map(m => `
      <tr>
        <td><strong>${Utils.fechaCorta(m.fecha)}</strong></td>
        <td>${m.entrada}</td>
        <td><strong>${m.plato_principal}</strong></td>
        <td>${m.bebida}</td>
        <td>${m.postre}</td>
        <td>
          <button class="btn btn-sm btn-icon" onclick="abrirEditarMenu(${m.id_menu})" title="Editar"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="confirmarEliminarMenu(${m.id_menu})" title="Eliminar"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger">${e.message}</div></td></tr>`; }
}

function abrirModalMenu(menu = null) {
  menuEditando = menu;
  document.getElementById('modal-menu-titulo').textContent = menu ? 'Editar menú' : 'Nuevo menú';
  document.getElementById('mf-fecha').value     = menu?.fecha || '';
  document.getElementById('mf-entrada').value   = menu?.entrada || '';
  document.getElementById('mf-principal').value = menu?.plato_principal || '';
  document.getElementById('mf-bebida').value    = menu?.bebida || '';
  document.getElementById('mf-postre').value    = menu?.postre || '';
  document.getElementById('modal-menu').style.display = 'flex';
}

async function abrirEditarMenu(id) {
  try {
    const menus = await Api.menusTodos();
    const m = menus.find(x => x.id_menu === id);
    if (m) abrirModalMenu(m);
  } catch (e) { Utils.toast(e.message, 'danger', 'adm-toast'); }
}

function cerrarModalMenu() {
  document.getElementById('modal-menu').style.display = 'none';
  menuEditando = null;
}

async function guardarMenu(e) {
  if (e) e.preventDefault();
  const datos = {
    fecha:          document.getElementById('mf-fecha').value,
    entrada:        document.getElementById('mf-entrada').value.trim(),
    plato_principal:document.getElementById('mf-principal').value.trim(),
    bebida:         document.getElementById('mf-bebida').value.trim(),
    postre:         document.getElementById('mf-postre').value.trim(),
  };
  if (!datos.fecha || !datos.entrada || !datos.plato_principal || !datos.bebida || !datos.postre) {
    Utils.toast('Completa todos los campos del menú', 'warning', 'modal-menu-toast'); return;
  }
  try {
    if (menuEditando) { await Api.editarMenu(menuEditando.id_menu, datos); Utils.toast('Menú actualizado.', 'success', 'adm-toast'); }
    else { await Api.crearMenu(datos); Utils.toast('Menú creado.', 'success', 'adm-toast'); }
    cerrarModalMenu();
    cargarMenusAdmin();
  } catch (e) { Utils.toast(e.message, 'danger', 'modal-menu-toast'); }
}

async function confirmarEliminarMenu(id) {
  if (!confirm('¿Eliminar este menú?')) return;
  try { await Api.eliminarMenu(id); Utils.toast('Menú eliminado.', 'success', 'adm-toast'); cargarMenusAdmin(); }
  catch (e) { Utils.toast(e.message, 'danger', 'adm-toast'); }
}

// ====== CONFIRMACIONES ADMIN ======
async function cargarConfirmacionesAdmin() {
  const tbody = document.getElementById('adm-conf-tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-sec)">Cargando...</td></tr>';
  try {
    const lista = await Api.todasConfirm();
    tbody.innerHTML = lista.length ? lista.map(c => `
      <tr>
        <td>${c.Estudiante?.usuario?.nombre || '—'}</td>
        <td>${c.Estudiante?.curso || '—'}</td>
        <td>${Utils.estadoBadge(c.estado)}</td>
        <td style="color:var(--text-sec)">${Utils.horaRelativa(c.fecha_confirmacion)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--text-sec)">Sin confirmaciones registradas hoy.</td></tr>';
  } catch (e) { tbody.innerHTML = `<tr><td colspan="4"><div class="alert alert-danger">${e.message}</div></td></tr>`; }
}

// ====== REPORTES ADMIN ======
async function cargarReportesAdmin() {
  try {
    const stats = await Api.estadisticas();
    document.getElementById('rep-total').textContent   = stats.totalEstudiantes;
    document.getElementById('rep-conf').textContent    = stats.confirmadosHoy;
    document.getElementById('rep-canc').textContent    = stats.canceladosHoy;
    document.getElementById('rep-pct').textContent     = stats.porcentajeAsistencia + '%';
    // Gráfico por día
    const barras = document.getElementById('chart-semana');
    barras.innerHTML = '';
    if (stats.porDia?.length) {
      const max = Math.max(...stats.porDia.map(d => d.confirmados || 0), 1);
      stats.porDia.forEach(d => {
        const pct = Math.round((d.confirmados || 0) / max * 100);
        barras.innerHTML += `
          <div class="chart-bar-wrap">
            <div class="chart-val">${d.confirmados || 0}</div>
            <div class="chart-bar" style="height:${pct}px"></div>
            <div class="chart-label">${d.fecha?.slice(5) || ''}</div>
          </div>`;
      });
    } else {
      barras.innerHTML = '<p style="color:var(--text-sec);font-size:13px">Sin datos de la semana.</p>';
    }
    // Barras por curso
    const cursoCont = document.getElementById('chart-cursos');
    cursoCont.innerHTML = '';
    if (stats.porCurso?.length) {
      stats.porCurso.forEach(c => {
        const pct = stats.totalEstudiantes > 0 ? Math.round(c.confirmados / stats.totalEstudiantes * 100) : 0;
        cursoCont.innerHTML += `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
              <span><strong>${c.curso}</strong></span><span>${c.confirmados} confirmados (${pct}%)</span>
            </div>
            <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
          </div>`;
      });
    }
  } catch (e) { Utils.toast('Error al cargar reportes: ' + e.message, 'danger', 'adm-toast'); }
}

async function exportarCSV() {
  try {
    const lista = await Api.todasConfirm();
    const datos = lista.map(c => ({
      Nombre: c.Estudiante?.usuario?.nombre || '',
      Correo: c.Estudiante?.usuario?.correo || '',
      Curso:  c.Estudiante?.curso || '',
      Estado: c.estado,
      Fecha:  c.fecha_confirmacion
    }));
    Utils.exportarCSV(datos, `smartfood-confirmaciones-${Utils.hoy()}.csv`);
    Utils.toast('Reporte exportado exitosamente.', 'success', 'adm-toast');
  } catch (e) { Utils.toast(e.message, 'danger', 'adm-toast'); }
}

// ====== NOTIFICACIONES ADMIN ======
async function cargarNotifsAdmin() {
  try {
    const notifs = await Api.misNotifs();
    const cont = document.getElementById('adm-notifs-hist');
    const iconos = { menu:'ti-tool', confirmacion:'ti-check', recordatorio:'ti-clock', cancelacion:'ti-x', sistema:'ti-bell' };
    cont.innerHTML = notifs.length ? notifs.map(n => `
      <div class="notif-row">
        <div class="notif-icon" style="background:var(--primary-light);color:var(--primary)"><i class="ti ${iconos[n.tipo]||'ti-bell'}"></i></div>
        <div class="notif-body">
          <div class="notif-title">${n.titulo}</div>
          <div class="notif-msg">${n.mensaje}</div>
          <div class="notif-time">${Utils.horaRelativa(n.fecha)}</div>
        </div>
      </div>`).join('')
    : '<p style="color:var(--text-sec);text-align:center;padding:16px">Sin notificaciones.</p>';
  } catch (e) {}
}

async function enviarNotifMasiva(e) {
  if (e) e.preventDefault();
  const titulo = document.getElementById('notif-titulo').value.trim();
  const mensaje = document.getElementById('notif-mensaje').value.trim();
  const tipo    = document.getElementById('notif-tipo').value;
  const dest    = document.getElementById('notif-dest').value;
  if (!titulo || !mensaje) { Utils.toast('Completa título y mensaje', 'warning', 'notif-toast'); return; }
  try {
    const res = await Api.enviarMasiva({ titulo, mensaje, tipo, destinatarios: dest });
    Utils.toast(res.mensaje, 'success', 'adm-toast');
    document.getElementById('notif-titulo').value  = '';
    document.getElementById('notif-mensaje').value = '';
    cargarNotifsAdmin();
  } catch (e) { Utils.toast(e.message, 'danger', 'notif-toast'); }
}
