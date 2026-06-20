-- ============================================
-- SMARTFOOD - Base de Datos Completa
-- I.E. Normal Superior Montes de María
-- ============================================

CREATE DATABASE IF NOT EXISTS smartfood CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartfood;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','estudiante') NOT NULL DEFAULT 'estudiante',
  activo TINYINT(1) DEFAULT 1,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  curso VARCHAR(20) NOT NULL,
  ciudad VARCHAR(80) DEFAULT 'San Juan de Nepomuceno',
  alergias TEXT,
  preferencias ENUM('ninguna','vegetariano','vegano','sin-gluten') DEFAULT 'ninguna',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE menus (
  id_menu INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  entrada VARCHAR(150) NOT NULL,
  plato_principal VARCHAR(150) NOT NULL,
  bebida VARCHAR(100) NOT NULL,
  postre VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_por INT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
);

CREATE TABLE confirmaciones (
  id_confirmacion INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  id_menu INT NOT NULL,
  estado ENUM('confirmado','cancelado') NOT NULL DEFAULT 'confirmado',
  fecha_confirmacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unica_confirmacion (id_estudiante, id_menu),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_menu) REFERENCES menus(id_menu) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('menu','confirmacion','recordatorio','cancelacion','sistema') DEFAULT 'sistema',
  leida TINYINT(1) DEFAULT 0,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE reportes (
  id_reporte INT AUTO_INCREMENT PRIMARY KEY,
  fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('diario','semanal','mensual') DEFAULT 'diario',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  total_estudiantes INT DEFAULT 0,
  total_confirmados INT DEFAULT 0,
  total_cancelados INT DEFAULT 0,
  total_sin_respuesta INT DEFAULT 0,
  porcentaje_asistencia DECIMAL(5,2) DEFAULT 0.00,
  descripcion TEXT,
  generado_por INT,
  FOREIGN KEY (generado_por) REFERENCES usuarios(id_usuario)
);

-- DATOS DE PRUEBA (passwords generados con el script seed.js)
INSERT INTO usuarios (nombre, correo, password, rol) VALUES
('Administrador Principal', 'admin@smartfood.co', '$2b$10$placeholder', 'admin'),
('María García', 'maria@smartfood.co', '$2b$10$placeholder', 'estudiante'),
('Juan Pérez', 'juan@smartfood.co', '$2b$10$placeholder', 'estudiante'),
('Laura Martínez', 'laura@smartfood.co', '$2b$10$placeholder', 'estudiante'),
('Carlos Ruiz', 'carlos@smartfood.co', '$2b$10$placeholder', 'estudiante'),
('Ana Torres', 'ana@smartfood.co', '$2b$10$placeholder', 'estudiante');

INSERT INTO estudiantes (id_usuario, curso, ciudad, alergias, preferencias) VALUES
(2, '9°A', 'San Juan de Nepomuceno', 'Ninguna', 'ninguna'),
(3, '10°B', 'San Juan de Nepomuceno', 'Gluten', 'sin-gluten'),
(4, '11°A', 'San Juan de Nepomuceno', 'Lactosa', 'ninguna'),
(5, '8°A', 'San Juan de Nepomuceno', 'Ninguna', 'ninguna'),
(6, '7°B', 'San Juan de Nepomuceno', 'Mariscos', 'ninguna');

INSERT INTO menus (fecha, entrada, plato_principal, bebida, postre, creado_por) VALUES
('2026-06-09', 'Sopa de lentejas', 'Arroz con pollo guisado', 'Jugo de maracuyá', 'Gelatina de fresa', 1),
('2026-06-10', 'Crema de zanahoria', 'Sancocho de res con arroz', 'Limonada natural', 'Fruta de temporada', 1),
('2026-06-11', 'Consomé de pollo', 'Bandeja paisa', 'Jugo de guanábana', 'Arroz con leche', 1),
('2026-06-12', 'Sopa de pasta', 'Pescado frito con patacones', 'Agua de panela', 'Helado de coco', 1),
('2026-06-13', 'Caldo de costilla', 'Ajiaco santafereño', 'Jugo de mora', 'Gelatina de uva', 1);

INSERT INTO confirmaciones (id_estudiante, id_menu, estado) VALUES
(1, 1, 'confirmado'), (2, 1, 'confirmado'), (3, 1, 'cancelado'),
(4, 1, 'confirmado'), (5, 1, 'confirmado');
