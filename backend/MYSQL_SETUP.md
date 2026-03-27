# MySQL Backend Setup Instructions

## Prerequisites
- XAMPP installed and running
- MySQL database created: `epa_db` (already created in phpMyAdmin)
- PHP CLI available

## Step 1: Copy .env.example to .env

```bash
cd backend
cp .env.example .env
```

The .env file already has MySQL configured:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=epa_db
DB_USERNAME=root
DB_PASSWORD=
```

## Step 2: Generate Laravel App Key

```bash
php artisan key:generate
```

## Step 3: Install Composer Dependencies

Make sure you have Composer installed, then run:

```bash
composer install
```

This will install Laravel Sanctum and all required packages.

## Step 4: Run Database Migrations

Create all tables (users, oil_companies, depots, personal_access_tokens):

```bash
php artisan migrate
```

## Step 5: Seed the Database

Populate test data for users and depots:

```bash
php artisan db:seed
```

This creates:
- **2 Test Users:**
  - Email: `admin@epa.com` | Password: `admin123` | Role: `epa_admin`
  - Email: `admin@oilcompany.com` | Password: `admin123` | Role: `oil_company`

- **3 Oil Companies:** NOC, OLA, TOTAL
- **3 Depots:** Depot 1 (Addis Ababa), Depot 2 (Adama), Depot 3 (Bahir Dar)

## Step 6: Start the Laravel Dev Server

```bash
php artisan serve
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (requires token)
- `GET /api/auth/me` - Get current user (requires token)

### Request/Response Examples

**Login Request:**
```json
POST /api/auth/login
{
  "email": "admin@epa.com",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "token": "1|...",
  "type": "Bearer"
}
```

**Using Token:**
All protected endpoints require:
```
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- id
- name
- email
- password (hashed with bcrypt)
- role (epa_admin | oil_company)
- company_id (nullable)
- remember_token
- timestamps

### Oil Companies Table
- id
- company_id (unique identifier from frontend)
- name
- Contact persons & details
- timestamps

### Depots Table
- id
- depot_id (unique identifier from frontend)
- name, region, city, address
- Contact information
- latitude, longitude
- oil_company_id (foreign key)
- timestamps

### Personal Access Tokens Table
- id
- tokenable_id & tokenable_type
- name
- token (hashed)
- abilities
- last_used_at
- expires_at (24 hours)
- timestamps

## Troubleshooting

### "SQLSTATE[HY000]: General error: 15 'database disk image is malformed'"
This means SQLite was used previously. Run:
```bash
rm database/database.sqlite
php artisan migrate
```

### "Access denied for user 'root'@'localhost'"
Check your XAMPP MySQL is running and credentials in .env match.

### "Class OilCompanySeeder not found"
Run:
```bash
composer dump-autoload
```

## Next Steps

After setup is complete, connect your React frontend to:
- API Base URL: `http://localhost:8000/api`
- Login endpoint: `POST /api/auth/login`
- Store token in localStorage/context
- Include token in all API requests as Bearer token

All code is clean and simple. Happy coding!
