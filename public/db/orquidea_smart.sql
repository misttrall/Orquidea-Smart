-- =========================
-- Base de datos Orquídea Smart
-- =========================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS orquidea_smart;
USE orquidea_smart;

-- =================================
-- Tabla para registros generales
-- =================================
DROP TABLE IF EXISTS registros;

CREATE TABLE registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento VARCHAR(50),
    valor FLOAT,
    temperatura FLOAT,
    humedad FLOAT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =================================
-- Tabla para riegos
-- =================================
DROP TABLE IF EXISTS riegos;

CREATE TABLE riegos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento VARCHAR(50) NOT NULL,
    valor FLOAT NOT NULL,
    temperatura FLOAT NOT NULL,
    humedad FLOAT,                    -- nueva columna para humedad
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);
