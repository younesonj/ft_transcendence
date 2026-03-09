# 42 RoomMates API Documentation

Version: 1.0
Last Updated: 2026-03-06
Scope: `auth`, `user_management`, `listings`

## Overview

This document is generated from service source code in:
- `services/auth/src/**`
- `services/user_management/src/**`
- `services/listings/src/**`

Service prefixes and Swagger docs:

| Service | Global Prefix | Swagger UI |
|---|---|---|
| Auth | `/api/auth` | `/api/auth/docs` |
| User Management | `/api/users` | `/api/users/docs` |
| Listings | `/api/listings` | `/api/listings/docs` |

## Authentication Model

JWT is used across protected endpoints.

Token sources (same in all three services):
- Cookie: `access_token`
- Header: `Authorization: Bearer <token>`

JWT payload used by strategies:
```json
{
  "sub": 1,
  "email": "user@example.com"
}
```

On successful auth, protected handlers use:
```json
{
  "userId": 1,
  "email": "user@example.com"
}
```

Notes:
- Auth service sets/clears `access_token` cookie on signup/login/logout and OAuth callbacks.
- Cookies are `httpOnly`, `sameSite: strict`, and `secure` in production.

---

## Auth Service API

Base path: `/api/auth`

### Endpoints

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/signup` | No | Register user with email/password |
| POST | `/login` | No | Login with email or username |
| POST | `/logout` | No | Clear auth cookie |
| GET | `/profile` | Yes | Test protected route |
| GET | `/42` | No | Start 42 OAuth |
| GET | `/42/callback` | No | 42 OAuth callback |
| GET | `/google` | No | Start Google OAuth |
| GET | `/google/callback` | No | Google OAuth callback |

### 1) GET `/api/auth/`

Response `200`:
```json
{
  "status": "ok",
  "service": "auth",
  "version": "1.0.0",
  "uptime": 120,
  "timestamp": "2026-03-06T00:00:00.000Z",
  "checks": { "database": "ok" }
}
```

### 2) POST `/api/auth/signup`

Request body:
```json
{
  "email": "user@example.com",
  "password": "MyPassword123"
}
```

Validation:
- `email`: valid email, required
- `password`: required, min 8, must include uppercase, lowercase, number

Response `201`:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": null,
    "name": null,
    "age": null,
    "avatar": "default-avatar.png"
  }
}
```

Errors:
- `409`: `Email already exists`
- `400`: validation failure

Side effects:
- Sets `access_token` cookie (7 days)

### 3) POST `/api/auth/login`

Request body:
```json
{
  "identifier": "user@example.com",
  "password": "MyPassword123"
}
```

`identifier` accepts email or username.

Response `200`:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

Errors:
- `401`: `Invalid credentials`
- `401`: `This account uses OAuth login. Please login with 42 or Google.`

Side effects:
- Sets `access_token` cookie (7 days)

### 4) POST `/api/auth/logout`

Response `200`:
```json
{ "message": "Logged out successfully" }
```

Side effects:
- Clears `access_token` cookie

### 5) GET `/api/auth/profile`

Protected with JWT.

Response `200`:
```json
{
  "message": "This is a protected route!",
  "user": {
    "userId": 1,
    "email": "user@example.com"
  }
}
```

Errors:
- `401`: invalid/missing/expired token

### 6) GET `/api/auth/42`

Starts OAuth with 42. Returns redirect (`302`) to provider.

### 7) GET `/api/auth/42/callback`

OAuth callback endpoint.

Success behavior:
- Creates/links/logs in user via OAuth flow
- Sets `access_token` cookie
- Redirects (`302`) to `${FRONTEND_URL}/auth/callback?success=true`

Failure behavior:
- Redirects (`302`) to `${FRONTEND_URL}/auth/error`

### 8) GET `/api/auth/google`

Starts Google OAuth. Returns redirect (`302`) to provider.

### 9) GET `/api/auth/google/callback`

OAuth callback endpoint.

Success behavior:
- Creates/links/logs in user via OAuth flow
- Sets `access_token` cookie
- Redirects (`302`) to `${FRONTEND_URL}/auth/callback?success=true`

Failure behavior:
- Redirects (`302`) to `${FRONTEND_URL}/auth/error`

### OAuth Account Linking Rules

When callback completes:
1. Try find user by OAuth ID (`intra42Id` or `googleId`).
2. If not found, try by email and attach OAuth ID to existing user.
3. If still not found, create new user with `password: null` and `isVerified: true`.

---

## User Management Service API

Base path: `/api/users`

### Endpoints

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| GET | `/test` | Yes | Protected route test |
| GET | `/me` | Yes | Get current user profile |
| GET | `/:id` | No | Get user by id |
| PATCH | `/profile` | Yes | Partial profile and preferences update |
| PATCH | `/password` | Yes | Change password |
| POST | `/complete-profile` | Yes | First-time complete profile flow |
| POST | `/avatar` | Yes | Upload avatar image |
| DELETE | `/avatar` | Yes | Reset avatar to default |

### 1) GET `/api/users/`

Response `200` health payload (same shape as other services).

### 2) GET `/api/users/test`

Protected with JWT.

Response `200`:
```json
{
  "message": "User Management protected route works!",
  "user": { "userId": 1, "email": "user@example.com" }
}
```

### 3) GET `/api/users/me`

Protected with JWT.

Response `200` (password removed):
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "age": 24,
  "sex": "male",
  "avatar": "default-avatar.png",
  "bio": "42 student",
  "isOnline": true,
  "isVerified": true,
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```

Errors:
- `401`: unauthorized
- `404`: `User not found`

### 4) GET `/api/users/:id`

Public endpoint in controller (guard disabled).

Path params:
- `id` integer (`ParseIntPipe`)

Response `200`:
- Returns selected user fields (`id`, `email`, `username`, `name`, `age`, `avatar`, `bio`, `isOnline`, `isVerified`, `createdAt`)

Errors:
- `404`: `User not found`

### 5) PATCH `/api/users/profile`

Protected with JWT.

Body supports partial updates (all optional):
- User fields: `username`, `name`, `age`, `sex`, `bio`
- Preference fields: `location`, `moveInDate`, `budget`, `currency`, `smoker`, `quietHours`, `earlyBird`, `nightOwl`, `petFriendly`, `cooks`, `gamer`, `social`, `studious`, `clean`

Validation highlights:
- `username`: 3-20
- `name`: must match full-name regex (first and last)
- `age`: integer 18-100
- `sex`: one of `male|female|other`
- `currency`: one of `EUR|USD|MAD|GBP|CHF|JPY|CAD|AUD`
- `moveInDate`: ISO date string

Response `200`:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "preferences": {
      "location": "Casablanca",
      "budget": 5000,
      "currency": "MAD"
    }
  }
}
```

Errors:
- `401`: unauthorized
- `409`: `Username already taken`
- `400`: validation failure

### 6) PATCH `/api/users/password`

Protected with JWT.

Request body:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

Validation:
- `newPassword`: min 8, must include uppercase, lowercase, number

Response `200`:
```json
{ "message": "Password changed successfully" }
```

Errors:
- `401`: `Current password is incorrect`
- `404`: `User not found`
- `400`: validation failure

### 7) POST `/api/users/complete-profile`

Protected with JWT.

All fields required:
- `username`, `name`, `age`, `sex`, `location`, `moveInDate`, `budget`, `currency`, `bio`
- lifestyle flags: `smoker`, `quietHours`, `earlyBird`, `nightOwl`, `petFriendly`, `cooks`, `gamer`, `social`, `studious`, `clean`

Response `201`:
```json
{
  "message": "Profile completed successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "preferences": {
      "location": "Casablanca",
      "moveInDate": "2026-04-01T00:00:00.000Z",
      "budget": 5000,
      "currency": "MAD"
    }
  }
}
```

Errors:
- `400`: validation failure
- `401`: unauthorized
- `409`: `Username already taken`

### 8) POST `/api/users/avatar`

Protected with JWT.

Consumes: `multipart/form-data`
- Field: `file` (single image)
- Allowed mime types: `jpg`, `jpeg`, `png`, `gif`, `webp`
- Max size: 5 MB

Response `200`:
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": "/uploads/avatars/<filename>",
  "user": {
    "id": 1,
    "avatar": "/uploads/avatars/<filename>"
  }
}
```

Errors:
- `400`: `No file provided` or invalid mime/size
- `401`: unauthorized
- `404`: `User not found`

### 9) DELETE `/api/users/avatar`

Protected with JWT.

Response `200`:
```json
{
  "message": "Avatar deleted successfully",
  "user": {
    "id": 1,
    "avatar": "default-avatar.png"
  }
}
```

Errors:
- `401`: unauthorized
- `404`: `User not found`

---

## Listings Service API

Base path: `/api/listings`

### Endpoints

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/` | Yes | Create listing |
| GET | `/all` | No | Get all active listings |
| GET | `/my-listings` | Yes | Get current user listings |
| GET | `/:id` | No | Get listing by id |
| PATCH | `/:id` | Yes | Update listing |
| DELETE | `/:id` | Yes | Delete listing |
| POST | `/:id/photos` | Yes | Upload listing photos (2-6) |
| DELETE | `/:id/photos/:photoIndex` | Yes | Delete one listing photo |

### 1) GET `/api/listings/`

Response `200` health payload.

### 2) POST `/api/listings/`

Protected with JWT.

Required body fields:
- Basic: `title`, `location`, `price`, `currency`, `availableDate`, `spotsTotal`, `spotsFilled`, `description`
- Amenities (all required booleans): `hasWifi`, `hasKitchen`, `hasLaundry`, `hasMetroNearby`, `hasGarden`, `hasParking`, `petsOK`, `hasGym`, `hasAC`, `isSecure`

Validation highlights:
- `price >= 0`
- `spotsTotal >= 1`
- `spotsFilled >= 0`
- `availableDate` ISO date
- `currency` in `EUR|USD|MAD|GBP|CHF|JPY|CAD|AUD`

Response `201`:
```json
{
  "message": "Listing created successfully",
  "listing": {
    "id": 10,
    "userId": 1,
    "title": "Cozy Apartment near Campus",
    "price": 650,
    "currency": "EUR",
    "images": [],
    "user": {
      "id": 1,
      "username": "johndoe",
      "name": "John Doe",
      "avatar": "default-avatar.png"
    }
  }
}
```

### 3) GET `/api/listings/all`

Public.

Response `200`:
- Array of active listings (`isActive: true`), ordered by `createdAt desc`

### 4) GET `/api/listings/my-listings`

Protected with JWT.

Response `200`:
- Array of current user listings ordered by `createdAt desc`

### 5) GET `/api/listings/:id`

Public.

Path params:
- `id` integer (`ParseIntPipe`)

Response `200`:
- Listing object with owner info including `email`

Errors:
- `404`: `Listing not found`

### 6) PATCH `/api/listings/:id`

Protected with JWT.

Body:
- Any subset of create-listing fields (`UpdateListingDto` is partial)

Response `200`:
```json
{
  "message": "Listing updated successfully",
  "listing": { "id": 10 }
}
```

Errors:
- `403`: `You can only update your own listings`
- `404`: `Listing not found`

### 7) DELETE `/api/listings/:id`

Protected with JWT.

Response `200`:
```json
{ "message": "Listing deleted successfully" }
```

Errors:
- `403`: `You can only delete your own listings`
- `404`: `Listing not found`

### 8) POST `/api/listings/:id/photos`

Protected with JWT.

Consumes: `multipart/form-data`
- Field: `files` (array)
- Controller max accepted files: 6
- Minimum required for this request: 2 files
- Maximum total listing photos: 6
- Allowed mime types: `jpg`, `jpeg`, `png`, `gif`, `webp`
- Max size per file: 10 MB

Response `200`:
```json
{
  "message": "2 photo(s) uploaded successfully",
  "totalPhotos": 4,
  "listing": {
    "id": 10,
    "images": [
      "/uploads/listings/10_111.jpg",
      "/uploads/listings/10_222.jpg"
    ]
  }
}
```

Errors:
- `400`: `Minimum 2 photos required`
- `400`: `Maximum 6 photos allowed`
- `400`: exceeded total max photos on listing
- `403`: `You can only upload photos to your own listings`
- `404`: `Listing not found`

### 9) DELETE `/api/listings/:id/photos/:photoIndex`

Protected with JWT.

Path params:
- `id` integer
- `photoIndex` integer, 0-based

Response `200`:
```json
{
  "message": "Photo deleted successfully",
  "totalPhotos": 2,
  "listing": { "id": 10 }
}
```

Errors:
- `400`: invalid photo index
- `400`: cannot leave listing with exactly 1 photo (must be `>=2` or `0`)
- `403`: `You can only delete photos from your own listings`
- `404`: `Listing not found`

---

## Common Error Format

NestJS default errors are used. Typical shape:

```json
{
  "statusCode": 400,
  "message": "Validation error message or array",
  "error": "Bad Request"
}
```

For guarded routes, unauthorized responses are `401`.

## Source Files Used

- `services/auth/src/app.controller.ts`
- `services/auth/src/app.service.ts`
- `services/auth/src/dto/signup.dto.ts`
- `services/auth/src/dto/login.dto.ts`
- `services/auth/src/main.ts`
- `services/auth/src/strategies/intra42.strategy.ts`
- `services/auth/src/strategies/google.strategy.ts`
- `services/auth/src/strategies/jwt.strategy.ts`
- `services/user_management/src/app.controller.ts`
- `services/user_management/src/app.service.ts`
- `services/user_management/src/dto/update-profile.dto.ts`
- `services/user_management/src/dto/change-password.dto.ts`
- `services/user_management/src/dto/complete-profile.dto.ts`
- `services/user_management/src/config/multer.config.ts`
- `services/user_management/src/main.ts`
- `services/user_management/src/strategies/jwt.strategy.ts`
- `services/listings/src/app.controller.ts`
- `services/listings/src/app.service.ts`
- `services/listings/src/dto/create-listing.dto.ts`
- `services/listings/src/dto/update-listing.dto.ts`
- `services/listings/src/config/multer.config.ts`
- `services/listings/src/main.ts`
- `services/listings/src/strategies/jwt.strategy.ts`
