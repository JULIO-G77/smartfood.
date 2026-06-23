const router = require('express').Router();
const { Confirmacion, Menu, Estudiante, Usuario } = require('../models');
const { verificarToken, soloAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/reportes/estadisticas - stats generales
router.get('/estadisticas', verificarToken, soloAdmin, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const menuHoy = await Menu.findOne({ where: { fecha: hoy } });
    const totalEstudiantes = await Estudiante.count();
    const confirmadosHoy = menuHoy ? await Confirmacion.count({ where: { id_menu: menuHoy.id_menu, estado: 'confirmado' } }) : 0;
    const canceladosHoy = menuHoy ? await Confirmacion.count({ where: { id_menu: menuHoy.id_menu, estado: 'cancelado' } }) : 0;
    const porcentaje = totalEstudiantes > 0 ? ((confirmadosHoy / totalEstudiantes) * 100).toFixed(1) : 0;

    // Últimos 7 días
    const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7);
    const porDia = await sequelize.query(`
      SELECT m.fecha, COUNT(c.id_confirmacion) as confirmados
      FROM menus m LEFT JOIN confirmaciones c ON m.id_menu = c.id_menu AND c.estado = 'confirmado'
      WHERE m.fecha >= :fecha GROUP BY m.fecha ORDER BY m.fecha ASC
    `, { replacements: { fecha: hace7.toISOString().split('T')[0] }, type: sequelize.QueryTypes.SELECT });

    // Por curso
    const porCurso = await sequelize.query(`
      SELECT e.curso, COUNT(c.id_confirmacion) as confirmados
      FROM estudiantes e LEFT JOIN confirmaciones c ON e.id_estudiante = c.id_estudiante AND c.estado = 'confirmado'
      GROUP BY e.curso ORDER BY e.curso ASC
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ totalEstudiantes, confirmadosHoy, canceladosHoy, pendientesHoy: totalEstudiantes - confirmadosHoy - canceladosHoy, porcentajeAsistencia: parseFloat(porcentaje), porDia, porCurso });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/reportes/semanal - resumen semanal
router.get('/semanal', verificarToken, soloAdmin, async (req, res) => {
  try {
    const hoy = new Date();
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const viernes = new Date(lunes); viernes.setDate(lunes.getDate() + 4);
    const datos = await sequelize.query(`
      SELECT m.fecha, m.plato_principal,
        SUM(CASE WHEN c.estado='confirmado' THEN 1 ELSE 0 END) as confirmados,
        SUM(CASE WHEN c.estado='cancelado' THEN 1 ELSE 0 END) as cancelados
      FROM menus m LEFT JOIN confirmaciones c ON m.id_menu = c.id_menu
      WHERE m.fecha BETWEEN :lunes AND :viernes
      GROUP BY m.fecha, m.plato_principal ORDER BY m.fecha ASC
    `, { replacements: { lunes: lunes.toISOString().split('T')[0], viernes: viernes.toISOString().split('T')[0] }, type: sequelize.QueryTypes.SELECT });
    res.json(datos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
