# Dispatch API Documentation

All dispatch endpoints require authentication using Sanctum Bearer tokens (from `/api/auth/login`).

## Authentication
All requests must include the Authorization header:
```
Authorization: Bearer {token}
```

## Dispatch Endpoints

### Get All Dispatches
- **GET** `/api/dispatches`
- **Description**: Retrieve all dispatch records with relationships
- **Response**: Array of dispatch objects with oil company, transporter, vehicle, and depot data

### Get Single Dispatch
- **GET** `/api/dispatches/{id}`
- **Description**: Get a specific dispatch by database ID
- **Parameters**: 
  - `id` (integer) - Dispatch database ID
- **Response**: Single dispatch object

### Get Dispatch by PEA Number
- **GET** `/api/dispatches/pea/{peaDispatchNo}`
- **Description**: Get dispatch by PEA dispatch number (e.g., PEA001, PEA008)
- **Parameters**:
  - `peaDispatchNo` (string) - The PEA dispatch number
- **Response**: Single dispatch object

### Get Dispatches by Oil Company
- **GET** `/api/dispatches/oil-company/{oilCompanyId}`
- **Description**: Get all dispatches for a specific oil company
- **Parameters**:
  - `oilCompanyId` (integer) - Oil company database ID
- **Response**: Array of dispatch objects

### Get Dispatches by Status
- **GET** `/api/dispatches/status/{status}`
- **Description**: Get all dispatches with a specific status
- **Parameters**:
  - `status` (string) - One of: "On transit", "Delivered", "Exceeded ETA", "GPS Offline >24h", "Stopped >5h"
- **Response**: Array of dispatch objects

### Create New Dispatch
- **POST** `/api/dispatches`
- **Description**: Create a new dispatch record
- **Request Body**:
```json
{
  "pea_dispatch_no": "PEA999",
  "oil_company_id": 1,
  "transporter_id": 1,
  "vehicle_id": 1,
  "destination_depot_id": 1,
  "dispatch_date_time": "2025-12-20T10:00:00",
  "dispatch_location": "Horizon-Djb",
  "eta_date_time": "2025-12-25T10:00:00",
  "fuel_type": "Diesel",
  "dispatched_liters": 32000,
  "status": "On transit"
}
```
- **Response**: Created dispatch object (201)

### Update Dispatch
- **PUT** `/api/dispatches/{id}`
- **Description**: Update dispatch details (drop-off info, status, etc)
- **Parameters**:
  - `id` (integer) - Dispatch database ID
- **Request Body**:
```json
{
  "drop_off_date_time": "2025-12-25T10:00:00",
  "drop_off_location": "Addis Ababa, ID8548",
  "status": "Delivered"
}
```
- **Response**: Updated dispatch object

### Update GPS Location
- **PATCH** `/api/dispatches/{id}/gps`
- **Description**: Update GPS coordinates and timestamp for a dispatch
- **Parameters**:
  - `id` (integer) - Dispatch database ID
- **Request Body**:
```json
{
  "lat": 9.03,
  "lng": 38.74,
  "timestamp": "2025-12-20T15:30:00"
}
```
- **Response**: Updated dispatch object

### Delete Dispatch
- **DELETE** `/api/dispatches/{id}`
- **Description**: Delete a dispatch record
- **Parameters**:
  - `id` (integer) - Dispatch database ID
- **Response**: `{"message": "Dispatch deleted"}`

## Reference Data Endpoints

### Get All Oil Companies
- **GET** `/api/oil-companies`
- **Description**: Get list of all oil companies (for dropdowns)
- **Response**: Array of oil company objects
```json
[
  {
    "id": 1,
    "name": "NOC",
    "company_id": "oc-noc",
    "contacts": {...}
  }
]
```

### Get All Transporters
- **GET** `/api/transporters`
- **Description**: Get list of all transporters with their vehicles
- **Response**: Array of transporter objects with nested vehicles

### Get Vehicles by Transporter
- **GET** `/api/transporters/{transporterId}/vehicles`
- **Description**: Get vehicles for a specific transporter
- **Parameters**:
  - `transporterId` (integer) - Transporter database ID
- **Response**: Array of vehicle objects

### Get All Depots
- **GET** `/api/depots`
- **Description**: Get list of all depots (for dropdowns)
- **Response**: Array of depot objects
```json
[
  {
    "id": 1,
    "name": "Depot 1",
    "code": "ID8548",
    "region": "Addis Ababa",
    "city": "Addis Ababa"
  }
]
```

## Dispatch Object Structure

```json
{
  "id": 1,
  "pea_dispatch_no": "PEA001",
  "oil_company_id": 1,
  "transporter_id": 1,
  "vehicle_id": 1,
  "destination_depot_id": 1,
  "dispatch_date_time": "2025-12-02T21:52:30",
  "dispatch_location": "Horizon-Djb",
  "eta_date_time": "2025-12-06T10:22:00",
  "fuel_type": "Diesel",
  "dispatched_liters": 32000,
  "drop_off_date_time": "2025-12-06T10:22:32",
  "drop_off_location": "Addis Ababa, ID8548",
  "status": "Delivered",
  "last_gps_lat": 9.03,
  "last_gps_lng": 38.74,
  "last_gps_timestamp": "2025-12-06T09:50:00",
  "created_at": "2025-12-20T10:00:00",
  "updated_at": "2025-12-20T10:00:00",
  "oil_company": {...},
  "transporter": {...},
  "vehicle": {...},
  "depot": {...}
}
```

## Error Responses

All errors return appropriate HTTP status codes:
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (resource doesn't exist)
- **422**: Unprocessable Entity (validation failed)
- **500**: Server Error

Example error response:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "pea_dispatch_no": ["The pea dispatch no has already been taken."]
  }
}
```

## Frontend Integration Steps

1. Login first: `POST /api/auth/login` with email and password
2. Store the returned token
3. Add token to all subsequent requests in Authorization header
4. Use dispatch endpoints to fetch/create/update dispatch data
5. Use reference data endpoints to populate dropdowns

## Example Frontend Usage (JavaScript/React)

```javascript
// Login
const loginRes = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@epa.com', password: 'admin123' })
});
const { token } = await loginRes.json();

// Get all dispatches
const dispatchRes = await fetch('http://localhost:8000/api/dispatches', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const dispatches = await dispatchRes.json();

// Get oil companies for dropdown
const companiesRes = await fetch('http://localhost:8000/api/oil-companies', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const companies = await companiesRes.json();
```
