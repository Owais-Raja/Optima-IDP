# API Specification

This document outlines the API endpoints for the Optima IDP application.

## Backend API (Node.js/Express)
Base URL: `/api` (typically)

### Auth Routes
**Note:** All auth routes are rate-limited (100 requests / 15 mins).
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user. Validates input (400 if invalid). | No |
| `POST` | `/auth/login` | User login. Returns `{ accessToken, refreshToken }`. | No |
| `POST` | `/auth/refresh` | Get new access token using refresh token. | No |
| `POST` | `/auth/logout` | Invalidate refresh token. | Yes |

### User Routes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Get logged-in user profile | Yes |
| `GET` | `/users/all` | Get all users (Admin only) | Yes |
| `GET` | `/users/:id` | Get single user by ID | Yes |

### Skill Routes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/skills/add` | Add new skill (Admin only) | Yes |
| `GET` | `/skills/all` | Get all skills | Yes |
| `GET` | `/skills/:id` | Get single skill | Yes |
| `PUT` | `/skills/update/:id` | Update skill (Admin only) | Yes |
| `DELETE` | `/skills/delete/:id` | Delete skill (Admin only) | Yes |
| `POST` | `/skills/bulk-add` | Bulk add skills (Admin only) | Yes |

### Resource Routes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/resources/add` | Add new resource (Admin only) | Yes |
| `POST` | `/resources/bulk-add` | Bulk add resources (Admin only) | Yes |
| `GET` | `/resources/all` | Get all resources | Yes |
| `GET` | `/resources/skill/:skillId` | Get resources for a specific skill | Yes |
| `PUT` | `/resources/update/:id` | Update resource (Admin only) | Yes |
| `DELETE` | `/resources/delete/:id` | Delete resource (Admin only) | Yes |

### IDP Routes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/idp/create` | Employee creates an IDP (Async - returns 201 + 'processing' status) | Yes |
| `GET` | `/idp/my-idps` | Employee sees their IDPs | Yes |
| `GET` | `/idp/employee/:id` | Manager/Admin view IDPs of a user | Yes |
| `PUT` | `/idp/update/:id` | Employee updates their IDP | Yes |
| `PUT` | `/idp/approve/:id` | Manager approves IDP | Yes |
| `GET` | `/idp/all` | Admin sees all IDPs | Yes |

### Performance Routes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/performance/add` | Manager adds a performance review | Yes |
| `GET` | `/performance/my-reports` | Employee gets their own reports | Yes |
| `GET` | `/performance/employee/:id` | Manager/Admin get reports for employee | Yes |
| `GET` | `/performance/all` | Admin gets all reports | Yes |

### Recommendation Routes (Proxy to Python Service)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/recommend/resources` | Get personalized resource recommendations | Yes |
| `POST` | `/recommend/similar-skills` | Find similar skills | Yes |

---

## Recommender Service API (Python/FastAPI)
Base URL: `/recommend` (Internal Service)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/resources` | Get personalized resource recommendations based on skills, gaps, and performance. |
| `POST` | `/similar-skills` | Find skills similar to a target skill using NLP and co-occurrence. |
| `GET` | `/health` | Health check endpoint. |
