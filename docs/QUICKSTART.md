# Quick Start Guide: System Improvements

This guide helps you get started with the newly implemented features.

## 🚀 Getting Started with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

### Start the Application

```bash
# Navigate to project root
cd "C:\Users\Owais\Documents\Optima IDP"

# Start all services (MongoDB, Redis, Backend, Recommender)
docker compose up -d

# View logs
docker compose logs -f

# Check container status
docker compose ps
```

### Stop the Application

```bash
# Stop all services (preserves data)
docker compose down

# Stop and remove data (WARNING: deletes all MongoDB data)
docker compose down -v
```

### Troubleshooting

If services fail to start:

```bash
# View specific service logs
docker compose logs backend
docker compose logs recommender
docker compose logs mongo
docker compose logs redis

# Rebuild containers after code changes
docker compose up --build

# Remove all containers and start fresh
docker compose down
docker compose up --build -d
```

---

## 🔐 Frontend Integration: Refresh Tokens

### ⚠️ Breaking Change

The login endpoint now returns a different response structure:

**Old Response:**
```json
{
  "token": "jwt_token",
  "user": {...}
}
```

**New Response:**
```json
{
  "accessToken": "short_lived_token",
  "refreshToken": "long_lived_token",
  "user": {...}
}
```

### Frontend Implementation Example

```javascript
// ============================================
// 1. LOGIN - Store Both Tokens
// ============================================
async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store both tokens securely
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

// ============================================
// 2. API REQUESTS - Use Access Token
// ============================================
async function makeApiRequest(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  // If token expired (401), try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Retry request with new token
      const newAccessToken = localStorage.getItem('accessToken');
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login';
    }
  }
  
  return response;
}

// ============================================
// 3. REFRESH - Get New Access Token
// ============================================
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Refresh failed:', error);
    return false;
  }
}

// ============================================
// 4. LOGOUT - Clear Tokens
// ============================================
async function logout() {
  const accessToken = localStorage.getItem('accessToken');
  
  try {
    // Revoke refresh token on server
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    window.location.href = '/login';
  }
}

// ============================================
// 5. USAGE EXAMPLE
// ============================================
// Login
await login('user@example.com', 'password123');

// Make authenticated requests
const response = await makeApiRequest('http://localhost:5000/api/idps');
const idps = await response.json();

// Logout
await logout();
```

---

## 📝 Environment Setup

### Production Deployment Checklist

Before deploying to production, update these values in `docker-compose.yml`:

```yaml
environment:
  # ⚠️ CHANGE THESE!
  - JWT_SECRET=generate_a_strong_random_secret_here
  - JWT_REFRESH_SECRET=generate_another_strong_random_secret_here
```

Generate strong secrets:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using Python
python -c "import secrets; print(secrets.token_hex(64))"

# Option 3: Using OpenSSL
openssl rand -hex 64
```

### Optional: MongoDB Authentication

To enable MongoDB authentication (recommended for production), update `docker-compose.yml`:

```yaml
mongo:
  image: mongo:6
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: your_secure_password
```

Then update connection strings:
```yaml
backend:
  environment:
    - MONGO_URI=mongodb://admin:your_secure_password@mongo:27017/optima_idp?authSource=admin

recommender:
  environment:
    - MONGO_URI=mongodb://admin:your_secure_password@mongo:27017/optima_idp?authSource=admin
```

---

## 🧪 Testing the Changes

### 1. Test Worker Reliability

```bash
# Start services
docker-compose up -d

# Open Redis CLI in container
docker exec -it optima_redis redis-cli

# Push a test job
LPUSH recommendation_queue '{"data":{"userId":"test123","idpId":"test456"}}'

# Check processing queue
LRANGE recommendation_queue:processing 0 -1

# View worker logs
docker-compose logs -f recommender
```

### 2. Test Refresh Tokens (Postman)

**Collection: Optima IDP Auth**

**Request 1: Login**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "your_email@example.com",
    "password": "your_password"
  }
  ```
- Save `accessToken` and `refreshToken` from response

**Request 2: Access Protected Resource**
- Method: GET
- URL: `http://localhost:5000/api/idps` (or any protected route)
- Headers: `Authorization: Bearer <accessToken>`

**Request 3: Refresh Token**
- Method: POST
- URL: `http://localhost:5000/api/auth/refresh`
- Body (JSON):
  ```json
  {
    "refreshToken": "<refreshToken_from_login>"
  }
  ```

**Request 4: Logout**
- Method: POST
- URL: `http://localhost:5000/api/auth/logout`
- Headers: `Authorization: Bearer <accessToken>`

**Request 5: Verify Logout**
- Repeat Request 3 (refresh)
- Should return 401 Unauthorized

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **Redis Reliable Queue**: https://redis.io/commands/brpoplpush/

---

## 🆘 Need Help?

Common issues and solutions:

**Docker containers won't start:**
- Check Docker Desktop is running
- Check ports 5000, 6379, 27017 aren't in use
- Run `docker-compose logs <service_name>` to see errors

**Worker not processing jobs:**
- Check Redis is running: `docker-compose ps redis`
- Check worker logs: `docker-compose logs recommender`
- Verify job format is correct JSON

**Refresh token not working:**
- Check `JWT_REFRESH_SECRET` is set in environment
- Verify refresh token hasn't been revoked (logout)
- Check token hasn't expired (7 days)

**MongoDB connection failed:**
- Check MongoDB is running: `docker-compose ps mongo`
- Verify connection string is correct
- Check MongoDB logs: `docker-compose logs mongo`
