# Dispatch Table Backend Implementation

## Overview
Complete backend implementation for dispatch management system with full CRUD operations, status tracking, GPS location updates, and relationships to oil companies, transporters, vehicles, and depots.

## Database Tables Created

### 1. oil_companies
- Already created in earlier phase
- Stores: NOC, OLA, TOTAL with contacts

### 2. transporters
- `transporter_id` (unique) - Reference ID (tr-horizon, tr-eagle)
- `name` - Company name
- `region`, `city`, `address` - Location
- `contact_person1`, `contact_person2` - Names
- `phone1`, `phone2`, `email` - Contact info
- `oil_company_id` - Foreign key to oil_companies (nullable)

### 3. vehicles
- `vehicle_id` (unique) - Reference ID (veh-3-11111, etc)
- `transporter_id` - Foreign key to transporters
- `plate_reg_no` - License plate
- `trailer_reg_no` - Trailer registration
- `manufacturer`, `model` - Vehicle details
- `year_of_manufacture`
- `side_no` - Side number
- `driver_name`, `driver_phone`

### 4. dispatches
- `pea_dispatch_no` (unique) - Dispatch identifier (PEA001, PEA008, etc)
- `oil_company_id` - Foreign key to oil_companies
- `transporter_id` - Foreign key to transporters
- `vehicle_id` - Foreign key to vehicles
- `destination_depot_id` - Foreign key to depots
- `dispatch_date_time` - When dispatch started
- `dispatch_location` - Starting location
- `eta_date_time` - Expected delivery time
- `fuel_type` - Benzine, Diesel, Jet Fuel
- `dispatched_liters` - Amount transported
- `drop_off_date_time` - Actual delivery time (nullable)
- `drop_off_location` - Actual delivery location (nullable)
- `status` - On transit, Delivered, Exceeded ETA, GPS Offline >24h, Stopped >5h
- `last_gps_lat`, `last_gps_lng`, `last_gps_timestamp` - Latest GPS location

## Models Created

### Transporter
- Relationships: `hasMany(Vehicle)`, `belongsTo(OilCompany)`, `hasMany(Dispatch)`

### Vehicle
- Relationships: `belongsTo(Transporter)`, `hasMany(Dispatch)`

### Dispatch
- Relationships: `belongsTo(OilCompany)`, `belongsTo(Transporter)`, `belongsTo(Vehicle)`, `belongsTo(Depot)`

### Depot (Updated)
- Added: `code` field for unique identifier
- Added: `hasMany(Dispatch)` relationship

## Seeders Created

### TransporterSeeder
- Creates 2 transporters: Horizon-Djb, EAGLE
- Assigns Horizon-Djb to NOC company

### VehicleSeeder
- Creates 4 vehicles total (2 for each transporter)
- All vehicles linked to their transporters

### DispatchSeeder
- Creates 5 dispatch records with exact mock data:
  - PEA001 - NOC, Horizon, Vehicle 11111, Depot 1, Status: Delivered
  - PEA008 - OLA, Horizon, Vehicle 2222, Depot 2, Status: Exceeded ETA
  - PEA014 - TOTAL, EAGLE, Vehicle 3333, Depot 3, Status: GPS Offline >24h
  - PEA032 - NOC, EAGLE, Vehicle 4444, Depot 1, Status: Stopped >5h
  - PEA045 - TOTAL, EAGLE, Vehicle 3333, Depot 3, Status: On transit

## API Endpoints

### Authentication (Already implemented)
- POST `/api/auth/login` - Login with email/password
- GET `/api/auth/me` - Get current user (protected)
- POST `/api/auth/logout` - Logout (protected)

### Dispatch Management (NEW)
All endpoints require `Authorization: Bearer {token}` header

**Retrieve:**
- GET `/api/dispatches` - Get all dispatches
- GET `/api/dispatches/{id}` - Get by ID
- GET `/api/dispatches/pea/{peaDispatchNo}` - Get by PEA number
- GET `/api/dispatches/oil-company/{oilCompanyId}` - Filter by company
- GET `/api/dispatches/status/{status}` - Filter by status

**Create/Update:**
- POST `/api/dispatches` - Create new dispatch
- PUT `/api/dispatches/{id}` - Update dispatch
- PATCH `/api/dispatches/{id}/gps` - Update GPS location
- DELETE `/api/dispatches/{id}` - Delete dispatch

### Reference Data (for UI dropdowns)
- GET `/api/oil-companies` - List all oil companies
- GET `/api/transporters` - List all transporters with vehicles
- GET `/api/transporters/{transporterId}/vehicles` - Get vehicles for transporter
- GET `/api/depots` - List all depots

## Controller: DispatchController

Methods:
- `index()` - Get all dispatches with relationships
- `show($id)` - Get single dispatch
- `getByPeaNo($peaDispatchNo)` - Lookup by dispatch number
- `getByOilCompany($oilCompanyId)` - Filter by company
- `getByStatus($status)` - Filter by status
- `store(Request $request)` - Create dispatch
- `update(Request $request, $id)` - Update dispatch
- `updateGpsLocation(Request $request, $id)` - Update GPS
- `destroy($id)` - Delete dispatch
- `getOilCompanies()` - Get companies list
- `getTransporters()` - Get transporters with vehicles
- `getVehiclesByTransporter($transporterId)` - Get transporter vehicles
- `getDepots()` - Get depots list

## Validation

### Create Dispatch Validation
- `pea_dispatch_no` - Required, string, unique
- `oil_company_id` - Required, exists in oil_companies
- `transporter_id` - Required, exists in transporters
- `vehicle_id` - Required, exists in vehicles
- `destination_depot_id` - Required, exists in depots
- `dispatch_date_time` - Required, valid date
- `dispatch_location` - Required, string
- `eta_date_time` - Required, valid date
- `fuel_type` - Required, string
- `dispatched_liters` - Required, integer
- `status` - Required, string

### Update Dispatch Validation
- `drop_off_date_time` - Optional, valid date
- `drop_off_location` - Optional, string
- `status` - Optional, string
- `last_gps_lat` - Optional, numeric
- `last_gps_lng` - Optional, numeric
- `last_gps_timestamp` - Optional, valid date

## Database Relations

```
oil_companies
├── dispatches (1:many)
└── transporters (1:many)

transporters
├── vehicles (1:many)
├── dispatches (1:many)
└── oil_companies (many:1)

vehicles
├── dispatches (1:many)
└── transporters (many:1)

depots
├── dispatches (1:many)
└── oil_companies (many:1)

dispatches
├── oil_companies (many:1)
├── transporters (many:1)
├── vehicles (many:1)
└── depots (many:1)
```

## Files Created/Modified

**Created:**
- `/database/migrations/2024_01_01_000003_create_transporters_table.php`
- `/database/migrations/2024_01_01_000004_create_vehicles_table.php`
- `/database/migrations/2024_01_01_000005_create_dispatches_table.php`
- `/app/Models/Transporter.php`
- `/app/Models/Vehicle.php`
- `/app/Models/Dispatch.php`
- `/database/seeders/TransporterSeeder.php`
- `/database/seeders/VehicleSeeder.php`
- `/database/seeders/DispatchSeeder.php`
- `/app/Http/Controllers/DispatchController.php`
- `/DISPATCH_API.md` - Full API documentation

**Modified:**
- `/database/migrations/2024_01_01_000002_create_depots_table.php` - Added `code` field
- `/app/Models/Depot.php` - Added `code` field, dispatch relationship
- `/app/Models/OilCompany.php` - Will auto-sync relationships
- `/routes/api.php` - Added dispatch endpoints
- `/database/seeders/DatabaseSeeder.php` - Added new seeders
- `/database/seeders/DepotSeeder.php` - Added `code` field to seeds

## Next Steps

1. Run migrations: `php artisan migrate`
2. Run seeders: `php artisan db:seed`
3. All dispatch endpoints are ready to use with authentication
4. Frontend can now connect using the API documentation
5. All relationships are properly configured for eager loading

## Test Data Included

5 complete dispatch records with:
- Different oil companies (NOC, OLA, TOTAL)
- 2 different transporters (Horizon-Djb, EAGLE)
- 4 different vehicles with drivers
- 3 different depots
- Different statuses (Delivered, Exceeded ETA, GPS Offline >24h, Stopped >5h, On transit)
- GPS locations with timestamps
- Different fuel types and quantities
