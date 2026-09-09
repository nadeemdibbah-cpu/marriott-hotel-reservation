# Marriott Hotel Reservation - Database Schema

## Database: PostgreSQL

### Tables

#### 1. users
Stores hotel staff and admin information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. rooms
Hotel room inventory.

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  status VARCHAR(20) DEFAULT 'available',
  floor INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. guests
Guest information.

```sql
CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE,
  id_type VARCHAR(50),
  id_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. reservations
Reservation bookings.

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  guest_id INT NOT NULL REFERENCES guests(id),
  room_id INT NOT NULL REFERENCES rooms(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_guests INT NOT NULL,
  number_of_nights INT,
  total_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'confirmed',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. payments
Payment transactions.

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL REFERENCES reservations(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. check_in_records
Guest check-in/check-out logs.

```sql
CREATE TABLE check_in_records (
  id SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL REFERENCES reservations(id),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_check_in ON reservations(check_in_date);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_guests_email ON guests(email);
```

## Relationships

- guests (1) → (M) reservations
- rooms (1) → (M) reservations
- reservations (1) → (M) payments
- reservations (1) → (1) check_in_records
