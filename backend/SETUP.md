# Backend Setup Instructions

## What's Been Created

✅ **Database Migrations:**
- `database/migrations/2024_01_01_000000_create_users_table.php` - Users table with role, company_id
- `database/migrations/2024_01_01_000001_create_personal_access_tokens_table.php` - Sanctum tokens table

✅ **Authentication:**
- `app/Models/User.php` - Updated with HasApiTokens trait and fillable fields
- `app/Http/Controllers/AuthController.php` - Login, logout, me endpoints
- `app/Http/Middleware/EnsureUserRole.php` - Role-based access control middleware
- `routes/api.php` - API routes for /auth/login, /auth/logout, /auth/me

✅ **Configuration:**
- `config/auth.php` - Added sanctum guard
- `bootstrap/app.php` - Added API routing and middleware
- `composer.json` - Added Laravel Sanctum package

✅ **Database Seeding:**
- `database/seeders/UserSeeder.php` - Test users:
  - Email: admin@epa.com | Password: admin123 | Role: epa_admin
  - Email: admin@oilcompany.com | Password: admin123 | Role: oil_company

## Installation Steps

1. **Copy .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**
   ```bash
   composer install
   ```

3. **Generate APP_KEY:**
   ```bash
   php artisan key:generate
   ```

4. **Publish Sanctum configuration:**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

5. **Run migrations:**
   ```bash
   php artisan migrate
   ```

6. **Seed test users:**
   ```bash
   php artisan db:seed
   ```

7. **Start the server:**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Login
**POST** `/api/auth/login`
```json
{
  "email": "admin@epa.com",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "your_sanctum_token",
  "user": {
    "id": 1,
    "name": "EPA Admin",
    "email": "admin@epa.com",
    "role": "epa_admin"
  }
}
```

### Get Current User
**GET** `/api/auth/me`
Headers: `Authorization: Bearer {token}`

Response:
```json
{
  "email": "admin@epa.com",
  "password": "hashed_password"
}
```

### Logout
**POST** `/api/auth/logout`
Headers: `Authorization: Bearer {token}`

Response:
```json
{
  "message": "Logged out successfully"
}
```

## Token Details
- Token expires in **24 hours**
- Uses **bcrypt** for password hashing
- Role-based access control via EnsureUserRole middleware
