const router = require('express').Router();
const { Confirmacion, Menu, Estudiante, Usuario, Notificacion } = require('../models');
const { verificarToken, soloAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// POST /api/confirmacion - confirmar asistencia
router.post('/', verificarToken, async (req, res) => {
  try {
    const { id_menu } = req.body;
    const id_estudiante = req.usuario.id_estudiante;
    if (!id_estudiante) return res.status(400).json({ error: 'Solo estudiantes pueden confirmar' });
    const menu = await Menu.findByPk(id_menu);
    if (!menu) return res.status(404).json({ error: 'Menú no encontrado' });
    const [conf, created] = await Confirmacion.findOrCreate({
      where: { id_estudiante, id_menu },
      defaults: { estado: 'confirmado' }
    });
    if (!created) await conf.update({ estado: 'confirmado' });
    await Notificacion.create({ id_usuario: req.usuario.id, titulo: 'Asistencia confirmada', mensaje: `Tu asistencia al comedor del ${menu.fecha} fue registrada exitosamente.`, tipo: 'confirmacion' });
    res.json({ mensaje: 'Asistencia confirmada', confirmacion: conf });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/confirmacion/:id_menu - cancelar asistencia
router.delete('/:id_menu', verificarToken, async (req, res) => {
  try {
    const id_estudiante = req.usuario.id_estudiante;
    const conf = await Confirmacion.findOne({ where: { id_estudiante, id_menu: req.params.id_menu } });
    if (!conf) return res.status(404).json({ error: 'No se encontró la confirmación' });
    await conf.update({ estado: 'cancelado' });
    await Notificacion.create({ id_usuario: req.usuario.id, titulo: 'Reserva cancelada', mensaje: 'Tu reserva de comida fue cancelada. Puedes volver a confirmar antes de las 6:00 p.m.', tipo: 'cancelacion' });
    res.json({ mensaje: 'Asistencia cancelada' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/confirmacion/mi-estado/:id_menu - estado del estudiante
router.get('/mi-estado/:id_menu', verificarToken, async (req, res) => {
  try {
    const id_estudiante = req.usuario.id_estudiante;
    const conf = await Confirmacion.findOne({ where: { id_estudiante, id_menu: req.params.id_menu } });
    res.json({ estado: conf ? conf.estado : 'pendiente', confirmacion: conf });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/confirmacion/historial - historial del estudiante
router.get('/historial', verificarToken, async (req, res) => {
  try {
    const id_estudiante = req.usuario.id_estudiante;
    const historial = await Confirmacion.findAll({
      where: { id_estudiante },
      include: [{ model: Menu, attributes: ['fecha','plato_principal','entrada','bebida'] }],
      order: [['fecha_confirmacion', 'DESC']],
      limit: 30
    });
    res.json(historial);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/confirmacion/conteo/:id_menu - conteo para barra de progreso
router.get('/conteo/:id_menu', verificarToken, async (req, res) => {
  try {
    const confirmados = await Confirmacion.count({ where: { id_menu: req.params.id_menu, estado: 'confirmado' } });
    const cancelados = await Confirmacion.count({ where: { id_menu: req.params.id_menu, estado: 'cancelado' } });
    const total_estudiantes = await Estudiante.count();
    res.json({ confirmados, cancelados, pendientes: total_estudiantes - confirmados - cancelados, total: total_estudiantes });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/confirmacion/todas - todas las confirmaciones (admin)
router.get('/todas', verificarToken, soloAdmin, async (req, res) => {
  try {
    let fecha = req.query.fecha;
    if (!fecha) {
      const manana = new Date(); manana.setDate(manana.getDate() + 1);
      fecha = manana.toISOString().split('T')[0];
    }
    const menu = await Menu.findOne({ where: { fecha } });
    if (!menu) return res.json([]);
    const lista = await Confirmacion.findAll({
      where: { id_menu: menu.id_menu },
      include: [{ model: Estudiante, include: [{ model: Usuario, as: 'usuario', attributes: ['nombre','correo'] }] }],
      order: [['fecha_confirmacion', 'DESC']]
    });
    res.json(lista);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
