const router = require('express').Router();
const { Menu, Confirmacion } = require('../models');
const { verificarToken, soloAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// GET /api/menu/hoy - menú de hoy (solo lectura)
router.get('/hoy', verificarToken, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const menu = await Menu.findOne({ where: { fecha: hoy, activo: 1 } });
    if (!menu) return res.status(404).json({ error: 'No hay menú para hoy' });
    res.json(menu);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/menu - menú de mañana (para confirmar)
router.get('/', verificarToken, async (req, res) => {
  try {
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    const fecha = manana.toISOString().split('T')[0];
    const menu = await Menu.findOne({ where: { fecha, activo: 1 } });
    if (!menu) return res.status(404).json({ error: 'No hay menú disponible para mañana' });
    res.json(menu);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/menu/semana - menú de la semana
router.get('/semana', verificarToken, async (req, res) => {
  try {
    const hoy = new Date();
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const viernes = new Date(lunes); viernes.setDate(lunes.getDate() + 4);
    const menus = await Menu.findAll({ where: { fecha: { [Op.between]: [lunes.toISOString().split('T')[0], viernes.toISOString().split('T')[0]] }, activo: 1 }, order: [['fecha', 'ASC']] });
    res.json(menus);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/menu/todos - todos los menús (admin)
router.get('/todos', verificarToken, soloAdmin, async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [['fecha', 'DESC']] });
    res.json(menus);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/menu - crear menú (admin)
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { fecha, entrada, plato_principal, bebida, postre } = req.body;
    if (!fecha || !entrada || !plato_principal || !bebida || !postre) return res.status(400).json({ error: 'Todos los campos son requeridos' });
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    const fechaMin = manana.toISOString().split('T')[0];
    if (fecha < fechaMin) return res.status(400).json({ error: `No puedes crear menús para hoy o fechas pasadas. La fecha mínima es ${fechaMin}.` });
    const existe = await Menu.findOne({ where: { fecha } });
    if (existe) return res.status(400).json({ error: 'Ya existe un menú para esa fecha' });
    const menu = await Menu.create({ fecha, entrada, plato_principal, bebida, postre, creado_por: req.usuario.id });
    res.status(201).json(menu);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/menu/:id - editar menú (admin)
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menú no encontrado' });
    await menu.update(req.body);
    res.json(menu);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/menu/:id - eliminar menú (admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menú no encontrado' });
    await menu.destroy();
    res.json({ mensaje: 'Menú eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
