const cron = require('node-cron');
const { Menu, Estudiante, Confirmacion, Notificacion, Usuario } = require('./models');
const { Op } = require('sequelize');

// Cada día a las 2:00 p.m. — notifica que el menú de mañana está disponible
cron.schedule('0 14 * * 1-5', async () => {
  try {
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    const fecha = manana.toISOString().split('T')[0];
    const menu = await Menu.findOne({ where: { fecha, activo: 1 } });
    if (!menu) return;
    const estudiantes = await Usuario.findAll({ where: { rol: 'estudiante', activo: 1 } });
    const notifs = estudiantes.map(u => ({ id_usuario: u.id_usuario, titulo: '📢 Menú disponible', mensaje: `El menú de mañana (${menu.plato_principal}) ya está publicado. Confirma tu asistencia antes de las 6:00 p.m.`, tipo: 'menu' }));
    await Notificacion.bulkCreate(notifs);
    console.log(`[CRON 2pm] Notificaciones de menú enviadas a ${notifs.length} estudiantes`);
  } catch (e) { console.error('[CRON 2pm] Error:', e.message); }
});

// Cada día a las 4:00 p.m. — recordatorio para quienes no han confirmado
cron.schedule('0 16 * * 1-5', async () => {
  try {
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    const menu = await Menu.findOne({ where: { fecha: manana.toISOString().split('T')[0], activo: 1 } });
    if (!menu) return;
    const confirmados = await Confirmacion.findAll({ where: { id_menu: menu.id_menu }, attributes: ['id_estudiante'] });
    const idsConfirmados = confirmados.map(c => c.id_estudiante);
    const estudiantesSinConfirmar = await Estudiante.findAll({ where: idsConfirmados.length > 0 ? { id_estudiante: { [Op.notIn]: idsConfirmados } } : {}, include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario'] }] });
    const notifs = estudiantesSinConfirmar.map(e => ({ id_usuario: e.usuario.id_usuario, titulo: '⏰ Recordatorio', mensaje: 'Aún no has confirmado tu comida para mañana. Confirma antes de las 6:00 p.m. para no perder tu lugar.', tipo: 'recordatorio' }));
    if (notifs.length > 0) await Notificacion.bulkCreate(notifs);
    console.log(`[CRON 4pm] Recordatorios enviados a ${notifs.length} estudiantes`);
  } catch (e) { console.error('[CRON 4pm] Error:', e.message); }
});

// Cada día a las 5:30 p.m. — último aviso 30 minutos antes del cierre
cron.schedule('30 17 * * 1-5', async () => {
  try {
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    const menu = await Menu.findOne({ where: { fecha: manana.toISOString().split('T')[0], activo: 1 } });
    if (!menu) return;
    const confirmados = await Confirmacion.findAll({ where: { id_menu: menu.id_menu } });
    const ids = confirmados.map(c => c.id_estudiante);
    const sinConfirmar = await Estudiante.findAll({ where: { id_estudiante: { [Op.notIn]: ids.length > 0 ? ids : [0] } }, include: [{ model: Usuario, as: 'usuario' }] });
    const notifs = sinConfirmar.map(e => ({ id_usuario: e.usuario.id_usuario, titulo: '🚨 Último aviso — cierra en 30 min', mensaje: 'El plazo para confirmar tu asistencia cierra en 30 minutos. ¡Es tu última oportunidad!', tipo: 'recordatorio' }));
    if (notifs.length > 0) await Notificacion.bulkCreate(notifs);
    console.log(`[CRON 5:30pm] Últimos avisos enviados a ${notifs.length} estudiantes`);
  } catch (e) { console.error('[CRON 5:30pm] Error:', e.message); }
});

// Cada día a las 6:30 p.m. — resumen diario para administradores
cron.schedule('30 18 * * 1-5', async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const menu = await Menu.findOne({ where: { fecha: hoy } });
    if (!menu) return;
    const confirmados = await Confirmacion.count({ where: { id_menu: menu.id_menu, estado: 'confirmado' } });
    const cancelados = await Confirmacion.count({ where: { id_menu: menu.id_menu, estado: 'cancelado' } });
    const total = await Estudiante.count();
    const admins = await Usuario.findAll({ where: { rol: 'admin', activo: 1 } });
    const notifs = admins.map(a => ({ id_usuario: a.id_usuario, titulo: '📊 Resumen diario', mensaje: `Hoy ${hoy}: ${confirmados} confirmados, ${cancelados} cancelados, ${total - confirmados - cancelados} sin respuesta. Asistencia: ${((confirmados/total)*100).toFixed(1)}%`, tipo: 'sistema' }));
    await Notificacion.bulkCreate(notifs);
    console.log(`[CRON 6:30pm] Resumen enviado a ${admins.length} administradores`);
  } catch (e) { console.error('[CRON 6:30pm] Error:', e.message); }
});

console.log('✅ Jobs programados activos (lun-vie): 2pm · 4pm · 5:30pm · 6:30pm');
module.exports = cron;
