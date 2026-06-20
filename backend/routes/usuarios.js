const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Usuario, Estudiante } = require('../models');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// GET /api/usuarios - listar todos (admin)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const lista = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Estudiante, as: 'perfil' }],
      order: [['fecha_registro', 'DESC']]
    });
    res.json(lista);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/usuarios/perfil - perfil propio
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Estudiante, as: 'perfil' }]
    });
    res.json(usuario);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/usuarios/perfil - actualizar perfil propio
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nombre, ciudad, alergias, preferencias, curso } = req.body;
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (nombre) await usuario.update({ nombre });
    if (usuario.rol === 'estudiante') {
      const perfil = await Estudiante.findOne({ where: { id_usuario: req.usuario.id } });
      if (perfil) await perfil.update({ ciudad, alergias, preferencias, curso });
    }
    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/usuarios/cambiar-password
router.put('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { password_actual, password_nuevo } = req.body;
    if (!password_nuevo || password_nuevo.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    const usuario = await Usuario.findByPk(req.usuario.id);
    const valido = await bcrypt.compare(password_actual, usuario.password);
    if (!valido) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    const hash = await bcrypt.hash(password_nuevo, 10);
    await usuario.update({ password: hash });
    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/usuarios - crear usuario (admin)
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, password, rol, curso, alergias, preferencias, ciudad } = req.body;
    if (!nombre || !correo || !password) return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ error: 'El correo ya existe' });
    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, correo, password: hash, rol: rol || 'estudiante' });
    if (rol !== 'admin') await Estudiante.create({ id_usuario: usuario.id_usuario, curso: curso || '9°A', ciudad: ciudad || 'San Juan de Nepomuceno', alergias: alergias || 'Ninguna', preferencias: preferencias || 'ninguna' });
    res.status(201).json({ mensaje: 'Usuario creado', id: usuario.id_usuario });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/usuarios/:id - editar usuario (admin)
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { nombre, correo, rol, curso, alergias, preferencias, ciudad, activo } = req.body;
    await usuario.update({ nombre, correo, rol, activo });
    if (usuario.rol === 'estudiante') {
      const perfil = await Estudiante.findOne({ where: { id_usuario: req.params.id } });
      if (perfil) await perfil.update({ curso, alergias, preferencias, ciudad });
    }
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/usuarios/:id - eliminar usuario (admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.usuario.id) return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
