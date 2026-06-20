const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario, Estudiante, Notificacion } = require('../models');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('correo').isEmail().withMessage('Correo inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('curso').notEmpty().withMessage('El curso es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { nombre, correo, password, curso, ciudad, alergias, preferencias } = req.body;
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });
    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, correo, password: hash, rol: 'estudiante' });
    await Estudiante.create({ id_usuario: usuario.id_usuario, curso, ciudad: ciudad || 'San Juan de Nepomuceno', alergias: alergias || 'Ninguna', preferencias: preferencias || 'ninguna' });
    await Notificacion.create({ id_usuario: usuario.id_usuario, titulo: 'Bienvenido a SmartFood', mensaje: `¡Hola ${nombre}! Tu cuenta fue creada exitosamente. Ya puedes confirmar tu asistencia al comedor.`, tipo: 'sistema' });
    res.status(201).json({ mensaje: 'Cuenta creada exitosamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar usuario', detalle: e.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('correo').isEmail().withMessage('Correo inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ where: { correo, activo: 1 }, include: [{ model: Estudiante, as: 'perfil' }] });
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, id_estudiante: usuario.perfil?.id_estudiante }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
    res.json({ token, usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, perfil: usuario.perfil } });
  } catch (e) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalle: e.message });
  }
});

module.exports = router;
