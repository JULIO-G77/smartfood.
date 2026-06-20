const router = require('express').Router();
const { Notificacion, Usuario } = require('../models');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// GET /api/notificaciones - mis notificaciones
router.get('/', verificarToken, async (req, res) => {
  try {
    const notifs = await Notificacion.findAll({
      where: { id_usuario: req.usuario.id },
      order: [['fecha', 'DESC']],
      limit: 30
    });
    res.json(notifs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/notificaciones/no-leidas - conteo
router.get('/no-leidas', verificarToken, async (req, res) => {
  try {
    const count = await Notificacion.count({ where: { id_usuario: req.usuario.id, leida: 0 } });
    res.json({ count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/notificaciones/marcar-leidas
router.put('/marcar-leidas', verificarToken, async (req, res) => {
  try {
    await Notificacion.update({ leida: 1 }, { where: { id_usuario: req.usuario.id, leida: 0 } });
    res.json({ mensaje: 'Notificaciones marcadas como leídas' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/notificaciones/masiva - admin envía a todos
router.post('/masiva', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { titulo, mensaje, tipo, destinatarios } = req.body;
    let usuarios;
    if (destinatarios === 'todos') {
      usuarios = await Usuario.findAll({ where: { activo: 1 }, attributes: ['id_usuario'] });
    } else {
      usuarios = await Usuario.findAll({ where: { activo: 1, rol: 'estudiante' }, attributes: ['id_usuario'] });
    }
    const notifs = usuarios.map(u => ({ id_usuario: u.id_usuario, titulo, mensaje, tipo: tipo || 'sistema' }));
    await Notificacion.bulkCreate(notifs);
    res.json({ mensaje: `Notificación enviada a ${notifs.length} usuarios` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
