-- Ethiopian Petroleum Agency Database Schema
-- Create Database
CREATE DATABASE IF NOT EXISTS ethiopian_petroleum_agency;
USE ethiopian_petroleum_agency;

-- =============================================
-- 1. USERS/ADMIN TABLE (for authentication)
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'dispatcher', 'operator') DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. OIL COMPANIES TABLE
-- =============================================
CREATE TABLE oil_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. TRANSPORTERS TABLE
-- =============================================
CREATE TABLE transporters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. VEHICLES TABLE
-- =============================================
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transporter_id INT NOT NULL,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    trailer_number VARCHAR(50),
    side_number VARCHAR(50),
    gps_device_id VARCHAR(255),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    year_of_manufacture INT,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_plate_number (plate_number),
    INDEX idx_transporter_id (transporter_id),
    INDEX idx_gps_device_id (gps_device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. DRIVERS TABLE
-- =============================================
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transporter_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(50) UNIQUE,
    license_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_transporter_id (transporter_id),
    INDEX idx_license_number (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. DEPOTS TABLE
-- =============================================
CREATE TABLE depots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_region (region),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. FUEL TYPES TABLE (Reference)
-- =============================================
CREATE TABLE fuel_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. DISPATCH STATUS TABLE (Reference)
-- =============================================
CREATE TABLE dispatch_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(100) UNIQUE NOT NULL,
    status_code VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status_name (status_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. DISPATCHES TABLE (Main Dispatch Records)
-- =============================================
CREATE TABLE dispatches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispatch_number VARCHAR(50) UNIQUE NOT NULL,
    oil_company_id INT NOT NULL,
    transporter_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT,
    origin_depot_id INT NOT NULL,
    destination_depot_id INT NOT NULL,
    fuel_type VARCHAR(100),
    fuel_amount DECIMAL(10, 2),
    dispatch_time DATETIME NOT NULL,
    eta DATETIME,
    arrival_time DATETIME,
    status VARCHAR(100) DEFAULT 'Pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (oil_company_id) REFERENCES oil_companies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (origin_depot_id) REFERENCES depots(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (destination_depot_id) REFERENCES depots(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_dispatch_number (dispatch_number),
    INDEX idx_oil_company_id (oil_company_id),
    INDEX idx_transporter_id (transporter_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_dispatch_time (dispatch_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. TRACKING LOGS TABLE (GPS Data)
-- =============================================
CREATE TABLE tracking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    dispatch_id INT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed DECIMAL(5, 2),
    recorded_at DATETIME NOT NULL,
    gps_source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (dispatch_id) REFERENCES dispatches(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_dispatch_id (dispatch_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. DISPATCH STATUS HISTORY TABLE
-- =============================================
CREATE TABLE dispatch_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispatch_id INT NOT NULL,
    old_status VARCHAR(100),
    new_status VARCHAR(100),
    changed_by INT,
    notes TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispatch_id) REFERENCES dispatches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_dispatch_id (dispatch_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INITIAL DATA INSERTS
-- =============================================

-- Insert Default Admin User (password: admin123)
-- Note: Use bcrypt or similar for password hashing in production
-- For now, using a placeholder - replace with actual hashed password
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@gmail.com', '$2y$10$nOUIs5kJ7naTuTQo7S9 vue4f9aG/iJVsvxwP0qpjbWbVpJ8pS2JWi', 'Admin', 'User', 'admin', TRUE);

-- Insert Fuel Types
INSERT INTO fuel_types (name, code) VALUES
('Diesel', 'DSL'),
('Benzine', 'BZN'),
('Jet Fuel', 'JET');

-- Insert Dispatch Statuses
INSERT INTO dispatch_statuses (status_name, status_code) VALUES
('Pending', 'PND'),
('On Transit', 'TRN'),
('Delivered', 'DLV'),
('Exceeded ETA', 'ETA'),
('GPS Offline >24h', 'GPS'),
('Stopped >5h', 'STP'),
('Cancelled', 'CNC');

-- Insert Oil Companies
INSERT INTO oil_companies (code, name, contact_person, phone, email, address) VALUES
('NOC', 'NOC', 'Abebe Kebede', '+251 911 000 111', 'contact@noc.et', 'Addis Ababa'),
('OLA', 'OLA', 'Samuel T.', '+251 911 100 111', 'hello@ola.et', 'Addis Ababa'),
('TOTAL', 'TOTAL', 'Fitsum B.', '+251 911 200 111', 'support@total.et', 'Addis Ababa');

-- Insert Depots
INSERT INTO depots (code, name, region, city, latitude, longitude, contact_person, phone, email, address) VALUES
('ID8548', 'Depot 1', 'Addis Ababa', 'Addis Ababa', 9.0192, 38.7525, 'Depot Contact 1', '+251 911 300 111', 'depot1@epa.et', 'Bole, Airport Road'),
('ID6341', 'Depot 2', 'Oromia', 'Adama', 8.541, 39.269, 'Depot Contact 2', '+251 911 310 111', 'depot2@epa.et', 'Main Depot Avenue'),
('ID4025', 'Depot 3', 'Amhara', 'Bahir Dar', 11.5936, 37.3908, 'Depot Contact 3', '+251 911 320 111', 'depot3@epa.et', 'Industrial Zone');

-- Insert Transporters
INSERT INTO transporters (code, name, contact_person, phone, email, address, region, city) VALUES
('TR-HORIZON', 'Horizon-Djb', 'Contact Person 1', '+251 911 400 111', 'ops@horizon.example', 'Ring Road, Logistics Hub', 'Addis Ababa', 'Addis Ababa'),
('TR-EAGLE', 'EAGLE', 'Contact Person 1', '+251 911 410 111', 'dispatch@eagle.example', 'Dry Port Road', 'Oromia', 'Adama');

-- Insert Vehicles
INSERT INTO vehicles (transporter_id, plate_number, trailer_number, side_number, gps_device_id, manufacturer, model, year_of_manufacture, status) VALUES
(1, '3-11111 ET', 'TR-7788', 'S-12', 'GPS-001', 'Mercedes-Benz', 'Actros', 2021, 'active'),
(1, '3-2222 ET', 'TR-1133', 'S-07', 'GPS-002', 'Mercedes-Benz', 'Arocs', 2020, 'active'),
(2, '3-3333 ET', 'TR-5566', 'S-21', 'GPS-003', 'MAN', 'TGX', 2022, 'active'),
(2, '3-4444 ET', 'TR-9901', 'S-03', 'GPS-004', 'Volvo', 'FH', 2019, 'active');

-- Insert Drivers
INSERT INTO drivers (transporter_id, name, phone, email, license_number, license_expiry) VALUES
(1, 'Driver A', '+251 911 500 111', 'driver.a@horizon.example', 'DRV-001', '2026-12-31'),
(1, 'Driver B', '+251 911 500 222', 'driver.b@horizon.example', 'DRV-002', '2026-12-31'),
(2, 'Driver C', '+251 911 500 333', 'driver.c@eagle.example', 'DRV-003', '2026-12-31'),
(2, 'Driver D', '+251 911 500 444', 'driver.d@eagle.example', 'DRV-004', '2026-12-31');

-- Insert Sample Dispatches
INSERT INTO dispatches (dispatch_number, oil_company_id, transporter_id, vehicle_id, driver_id, origin_depot_id, destination_depot_id, fuel_type, fuel_amount, dispatch_time, eta, arrival_time, status, created_by) VALUES
('PEA001', 1, 1, 1, 1, 2, 1, 'Diesel', 32000, '2025-12-02 21:52:30', '2025-12-06 10:22:00', '2025-12-06 10:22:32', 'Delivered', 1),
('PEA008', 2, 1, 2, 2, 2, 2, 'Benzine', 28000, '2025-12-06 01:00:30', '2025-12-08 17:05:00', NULL, 'Exceeded ETA', 1),
('PEA014', 3, 2, 3, 3, 1, 3, 'Jet Fuel', 24000, '2025-12-01 21:52:30', '2025-12-05 17:05:00', NULL, 'GPS Offline >24h', 1),
('PEA032', 1, 2, 4, 4, 2, 1, 'Diesel', 30000, '2025-12-10 05:31:30', '2025-12-15 13:27:00', NULL, 'Stopped >5h', 1),
('PEA045', 3, 2, 3, 3, 1, 3, 'Benzine', 45000, '2025-12-11 10:00:00', '2025-12-16 10:00:00', NULL, 'On transit', 1);

-- Insert Sample Tracking Logs
INSERT INTO tracking_logs (vehicle_id, dispatch_id, latitude, longitude, speed, recorded_at, gps_source) VALUES
(1, 1, 9.03, 38.74, 85.5, '2025-12-06 09:50:00', 'GPS-API'),
(2, 2, 8.9, 38.8, 75.0, '2025-12-08 22:40:00', 'GPS-API'),
(3, 3, 9.4, 39.2, 0.0, '2025-12-04 08:15:00', 'GPS-API'),
(4, 4, 9.02, 38.78, 0.0, '2025-12-12 16:00:00', 'GPS-API'),
(3, 5, 9.1, 39.0, 80.0, '2025-12-12 10:00:00', 'GPS-API');

-- =============================================
-- CREATE VIEWS FOR REPORTING
-- =============================================

-- View for Regional Fuel Summary
CREATE VIEW v_regional_fuel_summary AS
SELECT 
    d.region,
    COUNT(dis.id) as total_dispatches,
    SUM(CASE WHEN dis.fuel_type = 'Benzine' THEN dis.fuel_amount ELSE 0 END) / 1000 as benzine_m3,
    SUM(CASE WHEN dis.fuel_type = 'Diesel' THEN dis.fuel_amount ELSE 0 END) / 1000 as diesel_m3,
    SUM(CASE WHEN dis.fuel_type = 'Jet Fuel' THEN dis.fuel_amount ELSE 0 END) / 1000 as jet_fuel_m3,
    SUM(dis.fuel_amount) / 1000 as total_fuel_m3
FROM depots d
LEFT JOIN dispatches dis ON d.id = dis.destination_depot_id
WHERE dis.dispatch_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY d.region;

-- View for Active Dispatches
CREATE VIEW v_active_dispatches AS
SELECT 
    dis.dispatch_number,
    oc.name as oil_company,
    t.name as transporter,
    v.plate_number,
    d.name as driver_name,
    d_from.name as origin_depot,
    d_to.name as destination_depot,
    dis.fuel_type,
    dis.fuel_amount,
    dis.dispatch_time,
    dis.eta,
    dis.status,
    tl.latitude,
    tl.longitude,
    tl.recorded_at as last_gps_update
FROM dispatches dis
JOIN oil_companies oc ON dis.oil_company_id = oc.id
JOIN transporters t ON dis.transporter_id = t.id
JOIN vehicles v ON dis.vehicle_id = v.id
LEFT JOIN drivers d ON dis.driver_id = d.id
JOIN depots d_from ON dis.origin_depot_id = d_from.id
JOIN depots d_to ON dis.destination_depot_id = d_to.id
LEFT JOIN tracking_logs tl ON dis.id = tl.dispatch_id 
    AND tl.recorded_at = (SELECT MAX(recorded_at) FROM tracking_logs WHERE dispatch_id = dis.id)
WHERE dis.status NOT IN ('Delivered', 'Cancelled');

-- =============================================
-- NOTES
-- =============================================
-- 1. Default Admin: admin@gmail.com / admin123
-- 2. Password hash for 'admin123': $2y$10$nOUIs5kJ7naTuTQo7S9uve4f9aG/iJVsvxwP0qpjbWbVpJ8pS2JWi
--    This is bcrypt format (cost 10). Update this in production with your actual hashing mechanism.
-- 3. Password Reset Flow:
--    - Generate random token
--    - Store in password_reset_token column
--    - Set password_reset_expires to current time + 1 hour
--    - Send reset link to user's email
--    - When user clicks link, verify token is still valid
--    - Allow password change and clear token
-- 4. All timestamps use UTC timezone
-- 5. Foreign key constraints prevent accidental deletion of referenced records
