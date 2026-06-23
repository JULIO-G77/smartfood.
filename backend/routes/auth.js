const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario, Estudiante } = require('../models');
require('dotenv').config();

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
