# Backend Services Architecture

## Overview

The Bantu Project backend is built with a microservices architecture, consisting of three main services:

1. **Auth Service**: Handles user authentication and profile management
2. **API Service**: Processes transcription and translation requests
3. **Storage Service**: Manages file uploads and storage

Each service is implemented as a Node.js Express application, communicating with a PostgreSQL database.

## Service Architecture

### Auth Service

**Purpose**: Manage user authentication and profiles

**Endpoints**:
- `POST /auth/signup`: Register a new user
- `POST /auth/signin`: Authenticate a user
- `GET /auth/profile`: Get user profile information

**Key Features**:
- JWT-based authentication
- Password hashing and security
- User profile management
- Session handling

**Implementation**: `services/auth/index.js`

```javascript
// Key components
import express from 'express';
import jwt from 'jsonwebtoken';
import pg from 'pg';

// Database connection
const pool = new Pool({...});

// Authentication middleware
const authenticateToken = (req, res, next) => {...};

// Endpoints
app.post('/auth/signup', async (req, res) => {...});
app.post('/auth/signin', async (req, res) => {...});
app.get('/auth/profile', authenticateToken, async (req, res) => {...});
```

### API Service

**Purpose**: Process transcription and translation requests

**Endpoints**:
- `POST /api/transcribe`: Convert audio to text
- `POST /api/translate`: Translate text between languages

**Key Features**:
- Audio processing
- Language detection
- Text transcription
- Translation between languages

**Implementation**: `services/api/index.js`

```javascript
// Key components
import express from 'express';
import pg from 'pg';

// Database connection
const pool = new Pool({...});

// Endpoints
app.post('/api/transcribe', async (req, res) => {...});
app.post('/api/translate', async (req, res) => {...});
```

### Storage Service

**Purpose**: Manage file uploads and storage

**Endpoints**:
- `POST /storage/upload`: Generate upload URL
- `GET /storage/download/:fileId`: Generate download URL

**Key Features**:
- Secure file uploads
- File metadata management
- Access control
- Storage optimization

**Implementation**: `services/storage/index.js`

```javascript
// Key components
import express from 'express';
import pg from 'pg';

// Database connection
const pool = new Pool({...});

// Endpoints
app.post('/storage/upload', async (req, res) => {...});
app.get('/storage/download/:fileId', async (req, res) => {...});
```

## Database Schema

The services interact with a PostgreSQL database with the following key tables:

- **users**: User authentication information
- **profiles**: User profile details
- **files**: File metadata
- **transcriptions**: Transcription results
- **translations**: Translation results

## Communication Between Services

Services communicate through:

1. **Database**: Shared PostgreSQL database
2. **HTTP**: Direct API calls between services
3. **Environment Variables**: Configuration sharing

## Security Measures

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## Deployment

Each service can be deployed independently:

```bash
# Start all services
npm run start:all

# Start individual services
npm run start:auth
npm run start:api
npm run start:storage
```

## Scaling Strategy

- **Horizontal Scaling**: Deploy multiple instances of each service
- **Load Balancing**: Distribute traffic across instances
- **Database Sharding**: Partition data for performance
- **Caching**: Implement Redis for frequently accessed data

## Monitoring and Logging

- **Service Logs**: Each service maintains its own logs
- **Centralized Logging**: Aggregate logs for analysis
- **Performance Metrics**: Track response times and error rates
- **Health Checks**: Regular service health monitoring

## Error Handling

- **Graceful Degradation**: Maintain partial functionality during failures
- **Circuit Breaking**: Prevent cascading failures
- **Retry Logic**: Automatic retry for transient failures
- **Fallback Mechanisms**: Default responses when services are unavailable

## Future Enhancements

- **Message Queue**: Implement RabbitMQ or Kafka for asynchronous processing
- **Service Discovery**: Dynamic service registration and discovery
- **API Gateway**: Centralized entry point for all services
- **Containerization**: Docker deployment for consistency