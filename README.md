# Ethiopian Petroleum Agency (EPAG) Dashboard

A comprehensive fuel logistics management system designed to track, monitor, and manage petroleum product distribution across Ethiopia. This full-stack application provides real-time operational visibility for fuel dispatch, GPS vehicle tracking, regional analytics, and supply chain management.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Core Functionalities](#core-functionalities)
- [Getting Started](#getting-started)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Data Models](#data-models)
- [API Integration](#api-integration)
- [Dashboard Features](#dashboard-features)
- [System Components](#system-components)

---

## 🎯 Project Overview

The **Ethiopian Petroleum Agency Dashboard** is a full-stack fuel logistics management system built with a **React TypeScript frontend** and a **Laravel PHP backend**. The system tracks fuel dispatch operations, monitors vehicle GPS locations in real-time, manages supply chain entities, and provides analytics and reporting capabilities.

**Primary Users:**
- Fuel dispatch operators
- Fleet managers
- Regional logistics coordinators
- Executive management
- System administrators

**Key Objectives:**
- Real-time visibility into fuel distribution operations
- Automated alerts for operational anomalies (delayed deliveries, GPS outages, unusual stops)
- Comprehensive management of oil companies, transporters, and depots
- Regional fuel demand analytics and forecasting
- Compliance tracking and audit trails

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript 5.9
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router DOM 7.13.0
- **UI Components**: Tailwind CSS 4.1 with custom components
- **Icons**: Heroicons 2.2, Lucide React 0.577
- **Data Fetching**: React Query (TanStack) 5.90.21
- **Charting**: Recharts 3.7.0
- **Mapping**: MapLibre GL 5.18.0
- **Styling**: Clsx, Tailwind Merge for utility management

### Backend
- **Framework**: Laravel 12.0
- **PHP Version**: 8.2+
- **Database**: Configured (see `.env` setup)
- **Authentication**: Laravel built-in auth system
- **Testing**: PHPUnit 11.5
- **Development Server**: Laravel Sail with Docker

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript
- **Package Manager**: PNPM (frontend), Composer (backend)

---

## 📁 Project Structure

```
Ethiopian_Petroleum_Agency/
├── frontend/                    # React + TypeScript frontend application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage.tsx        # Main dashboard with KPIs
│   │   │   ├── TrackingPage.tsx         # GPS vehicle tracking
│   │   │   ├── FuelDispatchPage.tsx     # Dispatch management
│   │   │   ├── ReportsPage.tsx          # Analytics and reports
│   │   │   ├── AnalyticsPage.tsx        # Detailed analytics
│   │   │   ├── OilCompaniesPage.tsx     # Oil company management
│   │   │   ├── TransportersPage.tsx     # Transporter/fleet management
│   │   │   ├── DepotsPage.tsx           # Depot location management
│   │   │   ├── ProfilePage.tsx          # User profile settings
│   │   │   ├── SettingsPage.tsx         # System settings
│   │   │   └── LoginPage.tsx            # Authentication
│   │   ├── components/
│   │   │   ├── layout/                  # Layout components
│   │   │   │   ├── AppLayout.tsx        # Main app wrapper with sidebar
│   │   │   │   └── PageHeader.tsx       # Page header component
│   │   │   ├── map/
│   │   │   │   └── MapView.tsx          # Interactive map for tracking
│   │   │   ├── ui/                      # Reusable UI components
│   │   │   │   ├── Card.tsx             # Card container
│   │   │   │   ├── VehicleCard.tsx      # Vehicle display card
│   │   │   │   ├── StatusPill.tsx       # Status badge component
│   │   │   │   ├── EmptyState.tsx       # Empty state message
│   │   │   │   ├── Skeleton.tsx         # Loading skeleton
│   │   │   │   ├── Model.tsx            # Modal dialog
│   │   │   │   └── ModelOverlay.tsx     # Modal overlay wrapper
│   │   │   ├── ProtectedRoute.tsx       # Route protection wrapper
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Authentication state management
│   │   ├── data/
│   │   │   ├── types.ts                 # TypeScript type definitions
│   │   │   ├── mockData.ts              # Mock data for development
│   │   │   ├── mockApi.ts               # Mock API service
│   │   │   └── gpsApi.ts                # Real GPS API integration
│   │   ├── lib/
│   │   │   ├── cn.ts                    # CSS class merger utility
│   │   │   └── statusDetails.ts         # Status code helpers
│   │   ├── App.tsx                      # Main app router
│   │   ├── main.tsx                     # React DOM root
│   │   └── assets/                      # Images and static files
│   ├── public/                          # Static assets
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.ts                   # Vite configuration
│   ├── tailwind.config.ts               # Tailwind CSS config
│   ├── tsconfig.json                    # TypeScript config
│   └── README.md                        # Frontend-specific docs
│
└── backend/                     # Laravel PHP backend application
    ├── app/
    │   ├── Http/
    │   │   └── Controllers/
    │   │       └── Controller.php        # Base controller
    │   ├── Models/
    │   │   └── User.php                 # User model
    │   └── Providers/
    │       └── AppServiceProvider.php   # Service provider
    ├── routes/
    │   ├── web.php                      # Web routes
    │   └── console.php                  # Artisan commands
    ├── database/
    │   ├── migrations/                  # Schema migrations
    │   │   ├── 0001_01_01_000000_create_users_table.php
    │   │   ├── 0001_01_01_000001_create_cache_table.php
    │   │   └── 0001_01_01_000002_create_jobs_table.php
    │   ├── factories/                   # Model factories for testing
    │   └── seeders/                     # Database seeders
    ├── config/                          # Configuration files
    │   ├── app.php
    │   ├── auth.php
    │   ├── database.php
    │   └── [other config files]
    ├── resources/
    │   ├── js/                          # JavaScript assets
    │   ├── css/                         # CSS assets
    │   └── views/                       # Blade templates
    ├── storage/                         # File storage
    ├── tests/                           # PHPUnit tests
    ├── composer.json                    # PHP dependencies
    ├── .env.example                     # Environment template
    └── README.md                        # Backend-specific docs
```

---

## ✨ Key Features

### 🚗 Real-Time Vehicle Tracking
- Live GPS tracking of all fuel transport vehicles
- Vehicle status monitoring (Moving, Idle, Stopped, Offline)
- Interactive map with vehicle markers
- Fuel level and odometer tracking
- GPS signal loss detection (>24 hours)

### 📊 Dashboard & Analytics
- **KPI Overview**: Critical performance metrics at a glance
  - Active vehicles in transit
  - Offline vehicle alerts
  - Exceeded delivery deadlines
  - Prolonged stops outside major cities

- **Regional Fuel Distribution**: Stacked bar charts showing fuel types by region
- **Dispatch Status Distribution**: Pie chart breakdown of all dispatch statuses
- **Fuel Type Summary**: Total volumes dispatched by fuel type
- **Recent Dispatches**: Latest 6 operations with detailed information

### 📦 Logistics Management
- **Oil Company Management**: Register and manage petroleum suppliers
- **Transporter Management**: Fleet and driver management
- **Depot Management**: Fuel storage location database
- **Fuel Dispatch**: Create and track fuel delivery tasks
- **Vehicle Management**: Fleet registration and monitoring

### 🔐 User Management
- Secure login/authentication
- User profile management
- Role-based access control (RBAC)
- Settings and preferences
- Session management

### 📈 Reports & Analytics
- Historical trend analysis
- Performance metrics and KPIs
- Custom date range filtering
- Regional breakdown analytics
- Exportable reports (CSV)

---

## 🎨 Core Functionalities

### 1. Dashboard (Main Overview)
**Location**: `/` (protected route)

Displays critical operational metrics and visualizations:
- **KPI Cards**: Real-time metrics (vehicles in transit, offline alerts, exceeded ETAs, long stops)
- **Regional Fuel Chart**: Fuel volumes by region and type
- **Dispatch Status Pie Chart**: Distribution across status categories
- **Fuel Type Summary**: Total dispatches by fuel type
- **Recent Dispatches Table**: Latest 6 dispatch operations

**Data Update Frequency**: Real-time with auto-refresh

---

### 2. GPS Tracking System
**Location**: `/tracking`

Live vehicle location and status monitoring:
- Interactive MapLibre GL map showing all active vehicles
- Vehicle detail cards with GPS data
- Real-time status updates
- Historical GPS trail visualization
- Filter by vehicle status or region
- Zoom and pan controls

**Data Integration**: Real GPS API (gpsApi.ts) or mock data for development

---

### 3. Fuel Dispatch Management
**Location**: `/fuel-dispatch`

Complete dispatch lifecycle management:
- Create new fuel dispatch tasks
- Assign oil companies, transporters, and vehicles
- Set delivery destinations and ETAs
- Monitor dispatch status in real-time
- Record delivery confirmations
- View dispatch history

**Related Data**: Links oil companies → transporters → vehicles → depots

---

### 4. Entity Management
**Location**: `/entities/*`

Manage core business entities:

**Oil Companies** (`/entities/oil-companies`)
- Company registration and profiles
- Contact information (2 primary contacts)
- Location and address
- Allocation quotas
- Dispatch history

**Transporters** (`/entities/transporters`)
- Fleet operator registration
- Vehicle fleet management
- Driver information
- Contact details
- Performance tracking

**Depots** (`/entities/depots`)
- Fuel storage location database
- Geographical coordinates
- Contact information
- Inventory capacity
- Regional assignment

---

### 5. Analytics & Reporting
**Location**: `/reports` and `/analytics`

Detailed historical analysis:
- Trend analysis over time periods
- Regional performance comparisons
- Fuel type distribution analytics
- Transporter performance metrics
- On-time delivery rates
- Delayed shipment analysis
- Export capabilities (CSV format)

---

### 6. User Management
**Location**: `/profile` and `/settings`

**Profile Page**:
- View and edit user information
- Change password
- Notification preferences
- Account settings

**Settings Page**:
- System configuration
- Notification preferences
- API integration settings
- Export/backup options

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- PHP 8.2+ (for backend)
- Composer (PHP dependency manager)
- PNPM (Node package manager)
- Docker/Docker Compose (optional, for Laravel Sail)

### Clone the Repository
```bash
git clone https://github.com/tsadkankelemework2121/Ethiopian_Petroleum_Agency.git
cd Ethiopian_Petroleum_Agency
```

---

## 🎯 Frontend Setup

### Installation
```bash
cd frontend
pnpm install
```

### Development Server
```bash
pnpm dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
pnpm build
```
Output will be in the `dist/` directory.

### Linting
```bash
pnpm lint
```

### Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
VITE_GPS_API_URL=https://your-gps-api-endpoint.com
```

### Key Frontend Directories
- `/src/pages/` - Page components for each route
- `/src/components/` - Reusable UI and layout components
- `/src/context/` - React context for state management
- `/src/data/` - Data types, mock data, and API integration
- `/src/assets/` - Images and static files

---

## 🐘 Backend Setup

### Installation
```bash
cd backend
composer install
```

### Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

### Database Setup
```bash
php artisan migrate
php artisan db:seed
```

### Development Server
```bash
php artisan serve
```
The API will be available at `http://localhost:8000`

### Using Laravel Sail (Docker)
```bash
./vendor/bin/sail up
```

### Running Tests
```bash
composer test
```

### Key Backend Features
- RESTful API endpoints
- User authentication (Laravel Auth)
- Database migrations and seeders
- Model relationships and factories
- PHPUnit testing suite

---

## 📊 Data Models

### Core Entities

#### OilCompany
```typescript
{
  id: string
  name: string
  contacts: {
    person1?: string
    person2?: string
    phone1?: string
    phone2?: string
    email1?: string
    email2?: string
  }
}
```

#### Transporter
```typescript
{
  id: string
  name: string
  contacts: ContactInfo
  location: {
    region: string
    city: string
    address: string
  }
  vehicles: Vehicle[]
}
```

#### Vehicle
```typescript
{
  id: string
  plateRegNo: string
  trailerRegNo: string
  manufacturer: string
  model: string
  yearOfManufacture: number
  sideNo: string
  driverName: string
  driverPhone: string
}
```

#### Depot
```typescript
{
  id: string
  name: string
  contacts: ContactInfo
  location: Location
  mapLocation?: { lat: number, lng: number }
}
```

#### DispatchTask
```typescript
{
  peaDispatchNo: string
  oilCompanyId: string
  transporterId: string
  vehicleId: string
  dispatchDateTime: string
  dispatchLocation: string
  destinationDepotId: string
  etaDateTime: string
  fuelType: 'Benzine' | 'Diesel' | 'Jet Fuel'
  dispatchedLiters: number
  dropOffDateTime?: string
  dropOffLocation?: string
  status: DispatchStatus
  lastGpsPoint?: { position: LatLng, timestamp: string }
}
```

#### GpsVehicle
```typescript
{
  imei: string
  name: string
  group: string | null
  odometer: string
  engine: 'on' | 'off'
  status: string
  dt_server: string
  dt_tracker: string
  lat: string
  lng: string
  altitude: string
  angle: string
  speed: string
  fuel_1: string
  fuel_2: string
  fuel_can_level_percent?: number
  fuel_can_level_value?: number
  custom_fields?: unknown
}
```

#### RegionFuelSummary
```typescript
{
  region: string
  weekLabel: string
  benzineM3: number
  dieselM3: number
  jetFuelM3: number
}
```

---

## 🔗 API Integration

### Mock API (Development)
Located in `/frontend/src/data/mockApi.ts`

The frontend uses mock data for development and testing. Mock endpoints simulate:
- Dispatch task creation and retrieval
- Regional fuel summaries
- Oil company listings
- Transporter and vehicle data
- Depot information

### GPS API Integration
Located in `/frontend/src/data/gpsApi.ts`

Real GPS data is fetched from external tracking systems:
- Vehicle location updates
- GPS status monitoring
- Real-time vehicle telemetry

### Backend API Endpoints (To Be Implemented)
The Laravel backend provides RESTful endpoints for:
- User authentication
- CRUD operations for all entities
- Dispatch task management
- GPS data processing
- Report generation
- Analytics aggregation

---

## 🎨 Dashboard Features

### Visual Components

**KPI Cards**
- Vehicles on Transit: Active dispatch count
- GPS Offline >24h: Alert for communication failures
- Exceeded ETA: Delayed delivery tracking
- Stopped >5h: Unusual stop detection

**Charts**
- Regional Fuel Distribution: Stacked bar chart (Benzine, Diesel, Jet Fuel by region)
- Dispatch Status Distribution: Pie chart (Delivered, In Transit, Alerts)
- Fuel Type Summary: Horizontal progress bars

**Data Table**
- Recent Dispatches: Latest 6 operations
- Sortable columns: Dispatch No, Company, Transporter, ETA, Status
- Status pills with color coding
- Clickable rows for details

**Interactive Map**
- Vehicle markers with status colors
- Pan and zoom controls
- Real-time marker updates
- Vehicle detail popups

---

## 🏗️ System Components

### Authentication & Authorization
**Component**: `ProtectedRoute.tsx`

- Route protection for authenticated users
- Redirect to login for unauthenticated access
- Session management via AuthContext

### Layout System
**Components**: `AppLayout.tsx`, `PageHeader.tsx`

- Sidebar navigation with menu items
- Page header with breadcrumbs
- Responsive mobile-friendly design
- Dark mode support (if implemented)

### UI Component Library
Located in `/src/components/ui/`

- **Card.tsx**: Container component
- **VehicleCard.tsx**: Vehicle display card
- **StatusPill.tsx**: Status badge with color coding
- **EmptyState.tsx**: No-data state message
- **Skeleton.tsx**: Loading placeholder
- **Modal.tsx**: Dialog component

### Map Component
**Component**: `MapView.tsx`

- MapLibre GL integration
- Vehicle marker rendering
- Real-time location updates
- Cluster support for multiple vehicles

---

## 🔄 Data Flow

1. **User Login** → AuthContext stores session
2. **Dashboard Load** → Fetch KPI data, charts, recent dispatches
3. **Tracking Page** → Fetch GPS vehicle data, render map
4. **Dispatch Creation** → Create task, assign resources, track progress
5. **Real-Time Updates** → Subscribe to GPS/dispatch status changes
6. **Analytics** → Query historical data, generate charts
7. **Reports** → Aggregate data, export CSV

---

## 📱 Responsive Design

The application is built with mobile-first design using Tailwind CSS:
- Responsive grid layouts
- Mobile-optimized navigation (collapsible sidebar)
- Touch-friendly interactive elements
- Adaptive chart sizing

---

## 🔒 Security Considerations

- **Authentication**: Email-based login (expandable to OAuth)
- **Session Management**: Browser localStorage + server-side validation
- **Protected Routes**: Route guards prevent unauthorized access
- **Data Privacy**: Sensitive information (GPS, contact details) should be masked/encrypted
- **API Security**: CORS, CSRF tokens, rate limiting (to be implemented)

---

## 📈 Future Enhancements

- **Predictive Analytics**: Machine learning for delivery delay forecasting
- **Route Optimization**: AI-powered route suggestions
- **Mobile App**: Native iOS/Android application
- **Real-Time Notifications**: SMS, Email, Push alerts
- **Driver Portal**: Dedicated driver interface
- **Advanced Filtering**: Multi-criteria search and filtering
- **Custom Dashboards**: User role-specific views
- **API Documentation**: Swagger/OpenAPI specs
- **Performance Monitoring**: Server metrics and analytics
- **Compliance Reporting**: Regulatory audit trails

---

## 📝 Development Workflow

1. **Feature Branch**: Create feature branches off `main`
2. **Local Development**: Run frontend and backend in parallel
3. **Testing**: Write tests for new features
4. **Code Review**: Submit PR with detailed description
5. **Merge**: Merge to main after approval
6. **Deployment**: Deploy to staging/production

---

## 🐛 Troubleshooting

### Frontend Issues
- **Port already in use**: Change Vite config port
- **API connection errors**: Verify `VITE_API_URL` in .env
- **Module not found**: Run `pnpm install` to install dependencies
- **Type errors**: Run `tsc --noEmit` for full type checking

### Backend Issues
- **Database connection**: Check `.env` database credentials
- **Migration failures**: Run `php artisan migrate:reset` then re-migrate
- **Port conflicts**: Change port in `.env` or use Laravel Sail
- **Composer errors**: Clear cache with `composer clear-cache`

---

## 📚 Documentation

- **Frontend README**: `/frontend/README.md`
- **Backend README**: `/backend/README.md`
- **System Functionalities**: `/frontend/src/Readme.md` (detailed feature documentation)

---

## 📄 License

This project is developed for the Ethiopian Petroleum Agency.

---

## 👥 Contributors

- Azebbirhan (v0/azebbirhanu19-7830-9acab906)

---

## 📞 Support

For issues, questions, or feature requests, please create an issue in the repository or contact the development team.

---

**Last Updated**: March 2026
