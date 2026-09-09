# Marriott Hotel Reservation API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Guests

#### Create Guest
```
POST /guests
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "country": "United States",
  "date_of_birth": "1990-01-15",
  "id_type": "passport",
  "id_number": "AB123456"
}

Response: 201 Created
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  ...
}
```

#### Get Guest by ID
```
GET /guests/{id}

Response: 200 OK
{
  "id": 1,
  "first_name": "John",
  ...
}
```

#### Get All Guests
```
GET /guests?limit=10&offset=0

Response: 200 OK
{
  "data": [...],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

### 2. Rooms

#### Get Available Rooms
```
GET /rooms/available?check_in=2024-01-15&check_out=2024-01-20&capacity=2

Response: 200 OK
[
  {
    "id": 1,
    "room_number": "101",
    "room_type": "Deluxe Double",
    "capacity": 2,
    "price_per_night": 150.00,
    "amenities": ["WiFi", "TV", "AC"],
    "status": "available"
  },
  ...
]
```

#### Get Room by ID
```
GET /rooms/{id}

Response: 200 OK
{
  "id": 1,
  "room_number": "101",
  ...
}
```

### 3. Reservations

#### Create Reservation
```
POST /reservations
Content-Type: application/json

{
  "guest_id": 1,
  "room_id": 5,
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "total_guests": 2,
  "special_requests": "High floor preferred"
}

Response: 201 Created
{
  "id": 1,
  "guest_id": 1,
  "room_id": 5,
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "number_of_nights": 5,
  "total_price": 750.00,
  "status": "confirmed",
  "created_at": "2024-01-10T10:30:00Z"
}
```

#### Get Reservations by Guest
```
GET /reservations/guest/{guest_id}

Response: 200 OK
[
  {
    "id": 1,
    "guest_id": 1,
    "room_id": 5,
    ...
  }
]
```

#### Update Reservation
```
PUT /reservations/{id}
Content-Type: application/json

{
  "check_out_date": "2024-01-22",
  "special_requests": "Late checkout requested"
}

Response: 200 OK
```

#### Cancel Reservation
```
DELETE /reservations/{id}

Response: 204 No Content
```

### 4. Payments

#### Create Payment
```
POST /payments
Content-Type: application/json

{
  "reservation_id": 1,
  "amount": 750.00,
  "payment_method": "credit_card"
}

Response: 201 Created
{
  "id": 1,
  "reservation_id": 1,
  "amount": 750.00,
  "payment_method": "credit_card",
  "status": "pending",
  "created_at": "2024-01-10T10:35:00Z"
}
```

#### Get Payment Status
```
GET /payments/{id}

Response: 200 OK
{
  "id": 1,
  "reservation_id": 1,
  "amount": 750.00,
  "status": "completed",
  "transaction_id": "TXN123456"
}
```

## Error Responses

```
400 Bad Request
{
  "error": "Invalid input",
  "details": [...]
}

401 Unauthorized
{
  "error": "Authentication required"
}

404 Not Found
{
  "error": "Resource not found"
}

500 Internal Server Error
{
  "error": "Internal server error"
}
```

## Rate Limiting

- 100 requests per minute for unauthenticated endpoints
- 1000 requests per minute for authenticated endpoints

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610000000
```
