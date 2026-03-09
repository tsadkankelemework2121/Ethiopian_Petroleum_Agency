# Ethiopian Petroleum Agency Dashboard - System Functionalities

## Overview

The Ethiopian Petroleum Agency Dashboard is a comprehensive fuel logistics management system designed to track, monitor, and manage petroleum product distribution across Ethiopia. The dashboard provides real-time operational visibility for fuel dispatch, GPS vehicle tracking, regional analytics, and supply chain management.

---

## Core Dashboard Functionalities

### 1. **KPI Overview (Key Performance Indicators)**
The dashboard displays four critical real-time metrics that monitor operational health:

- **Vehicles on Transit**: Count of active fuel dispatch vehicles currently moving goods
  - Real-time updates
  - Reflects active dispatch operations
  - Helps identify peak operational periods

- **GPS Offline > 24 hours**: Vehicles with GPS signal loss exceeding 24 hours
  - Alerts management to communication failures
  - Tracked within Ethiopia boundaries
  - Critical for vehicle safety and accountability

- **Exceeded ETA (Estimated Time of Arrival)**: Shipments that have passed their scheduled delivery time
  - Alerts for delayed deliveries
  - Indicates operational inefficiencies or external delays
  - Requires attention and follow-up actions

- **Stopped > 5 hours**: Vehicles stopped for more than 5 hours outside Addis Ababa
  - Identifies unusual stops or mechanical failures
  - Tracks vehicles outside the capital city
  - May indicate breakdowns, rest stops, or unauthorized delays

---

### 2. **Regional Fuel Dispatch Overview**
A comprehensive visualization showing fuel distribution across Ethiopian regions:

**Tracked Fuel Types:**
- Benzine (Petrol)
- Diesel
- Jet Fuel (Aviation fuel)

**Features:**
- Grouped by Ethiopian administrative regions
- Volume measured in cubic meters (M³)
- Stacked bar chart for easy comparison
- Weekly dispatch data aggregation
- Identifies which regions consume most fuel
- Helps optimize distribution routes and inventory allocation

**Use Cases:**
- Monitor fuel demand patterns by region
- Identify supply bottlenecks
- Plan procurement based on regional needs
- Track compliance with regional allocations

---

### 3. **Dispatch Status Distribution**
A pie/donut chart showing the overall state of all dispatch tasks:

**Status Categories:**
- **Delivered**: Successfully completed fuel deliveries
- **In Transit**: Currently moving fuel shipments
- **Alerts**: All problematic statuses combined:
  - Exceeded ETA
  - GPS Offline > 24h
  - Stopped > 5h

**Features:**
- Real-time status aggregation
- Visual proportion of operational vs. alert statuses
- Count of tasks in each category
- Helps identify system-wide operational issues

---

### 4. **Fuel Type Dispatch Summary**
Aggregated view of total dispatched volumes by fuel type:

**Displays:**
- Total liters dispatched per fuel type (Benzine, Diesel, Jet Fuel)
- Percentage distribution across fuel types
- Horizontal progress bars for easy visualization
- Weekly totals aggregated from all regions

**Use Cases:**
- Monitor overall fuel movement volume
- Track fuel type demand
- Identify inventory imbalances
- Ensure equitable distribution

---

### 5. **Recent Dispatches Table**
A detailed list of the latest dispatch operations with critical information:

**Columns:**
- **Dispatch Number**: Unique identifier (PEA dispatch number)
- **Oil Company**: Source petroleum company
- **Transporter**: Logistics company handling delivery
- **ETA**: Estimated Time of Arrival
- **Status**: Current state of the dispatch

**Features:**
- Shows most recent 6 dispatch tasks
- Sortable by dispatch date (newest first)
- Status pills with color coding for quick status identification
- Clickable rows for detailed inspection
- Helps track recent operations and identify ongoing issues

---

## Supporting System Components

### User Management
The dashboard integrates with a user management system for:
- User profile management
- Role-based access control
- Settings and preferences
- Authentication and authorization

### GPS Tracking System
Real-time vehicle location monitoring:
- Live GPS data from all vehicles
- Vehicle status categorization (Moving, Idle, Stopped, Offline)
- Interactive map view with markers
- Historical GPS trail tracking
- Vehicle detail overlays with fuel level, speed, odometer readings

### Fuel Dispatch Management
Complete dispatch lifecycle management:
- Create new fuel dispatch tasks
- Assign transporters and vehicles
- Track delivery status
- Monitor ETA compliance
- Record delivery confirmations

### Analytics & Reporting
Advanced analytics and reporting capabilities:
- Historical trend analysis
- Performance metrics and KPIs
- Exportable reports (CSV format)
- Custom date range filtering
- Regional and temporal breakdowns

### Depot Management
Fuel storage location management:
- Register and maintain depot locations
- Track depot contact information
- Store depot geographical coordinates
- Manage depot inventory levels

### Oil Companies Management
Petroleum supplier management:
- Register oil companies
- Manage company contact information
- Track company allocation quotas
- Monitor company dispatch history

### Transporter Management
Logistics partner management:
- Register transporters and their fleets
- Manage vehicle assignments
- Track transporter performance
- Monitor driver information
- Maintain contact details

---

## Data Model & Relationships

### Key Entities

**Dispatch Task**
- Links oil companies, transporters, vehicles, and depots
- Tracks fuel type and volume
- Records timing information (dispatch, ETA, delivery)
- Maintains status throughout lifecycle

**Vehicle**
- Belongs to transporter fleet
- Connected to GPS tracking system
- Has registration and driver information
- Fuel level monitoring capability

**GPS Vehicle Data**
- Real-time location and status
- Engine state monitoring
- Fuel tank level tracking
- Speed and altitude measurements
- Communication timestamp

**Regional Fuel Summary**
- Aggregated fuel volumes by type
- Organized by Ethiopian administrative regions
- Weekly aggregation
- Source: All completed dispatches in region

---

## Dashboard Update Frequency

- **KPIs**: Real-time updates (continuous)
- **GPS Tracking**: Near real-time (based on GPS provider refresh rate)
- **Dispatch Status**: Real-time updates on task status changes
- **Regional Fuel Data**: Weekly aggregation
- **Recent Dispatches**: Real-time as dispatches are created/updated

---

## Key Features for Dashboard UI Design

When designing the visual interface, ensure implementation of:

1. **Real-time Data Refresh**: Auto-updating KPI cards with live data
2. **Status Indicators**: Color-coded pills (Green=Normal, Yellow=Warning, Red=Alert)
3. **Interactive Charts**: Responsive bar and pie charts with tooltips
4. **Export Functionality**: CSV export button for data analysis
5. **Responsive Layout**: Mobile-friendly design with grid system
6. **Loading States**: Skeleton loaders for data fetching
7. **Empty States**: Helpful messages when no data available
8. **Navigation**: Menu for accessing other system pages (Tracking, Fuel Dispatch, Analytics, Reports, etc.)

---

## System Navigation Structure

The dashboard is part of a larger system with the following main sections:

- **Dashboard**: Main overview and KPIs (current page)
- **GPS Tracking**: Live vehicle location tracking with map view
- **Fuel Dispatch**: Create and manage fuel dispatch tasks
- **Analytics**: Detailed historical analysis and trends
- **Reports**: Generated reports and data exports
- **Oil Companies**: Manage petroleum suppliers
- **Transporters**: Manage logistics partners and their fleets
- **Depots**: Manage fuel storage locations
- **Profile**: User account settings
- **Settings**: System configuration

---

## Performance Considerations

- Dashboard loads data in parallel for faster initial load
- Charts are rendered using efficient charting library (Recharts)
- Pagination should be implemented for large datasets
- API responses should be cached when appropriate
- Real-time updates should use efficient data subscription patterns

---

## Security & Data Privacy

- All data should be protected with authentication
- Role-based access control for sensitive operations
- GPS tracking data should be encrypted in transit
- Contact information should be masked where appropriate
- Audit logs for all critical operations
- Compliance with data protection regulations

---

## Future Enhancement Opportunities

- Predictive analytics for delivery delays
- Machine learning for route optimization
- Mobile app version for field operations
- Advanced filtering and search capabilities
- Custom dashboard views per user role
- Alert notification system (SMS, Email, Push)
- Integration with external logistics APIs
- Real-time communication channel with drivers
- Fuel price tracking and market analysis
- Compliance reporting and audit trails
