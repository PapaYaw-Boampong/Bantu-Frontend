# Bantu Project Documentation

## Project Overview

The Bantu Project is a web application designed to preserve and understand African languages through advanced speech and text recognition technology. The platform enables users to contribute audio recordings, transcriptions, and translations in various African languages, helping to bridge linguistic divides and protect cultural heritage.

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **API Communication**: Axios
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL 
- **Icons**: Lucide React

## Project Structure

```
bantu-project/
├── docs/                      # Project documentation
├── public/                    # Static assets
├── services/                  # Backend microservices
│   ├── api/                   # API service for transcription and translation
│   ├── auth/                  # Authentication service
│   └── storage/               # Storage service for audio files
├── src/                       # Frontend source code
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Custom components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and services
│   ├── pages/                 # Page components
│   └── types/                 # TypeScript type definitions
└── supabase/                  # Supabase configuration and migrations
    └── migrations/            # Database migration files
```

## Core Features

### 1. Authentication System

- **Sign Up/Sign In**: User registration and authentication
- **Profile Management**: User profile settings and preferences
- **JWT-based Auth**: Secure token-based authentication

### 2. Language Contribution

- **Audio Recording**: Record voice samples in various African languages
- **Text Input**: Provide text samples for translation
- **Dialect Selection**: Choose from multiple African dialects

### 3. Community Validation

- **Transcription Validation**: Verify and correct transcriptions
- **Translation Validation**: Validate translations between languages
- **Quality Control**: Community-driven quality assurance

### 4. API Services

- **Transcription API**: Convert audio to text in various African languages
- **Translation API**: Translate text between African languages and English
- **File Upload**: Support for audio file uploads

### 5. Community Features

- **Events**: Community events and workshops
- **Leaderboard**: Recognition for top contributors
- **Contribution Tracking**: Monitor personal contributions

## Component Architecture

### Layout Components

- **Layout**: Main layout wrapper with header and sidebar
- **AppSidebar**: Collapsible navigation sidebar
- **ThemeProvider**: Dark/light mode support

### Authentication Components

- **Auth**: Sign in and sign up forms
- **RequireAuth**: Protected route wrapper

### Feature Components

- **Dashboard**: User dashboard with statistics and updates
- **LetsTalk**: Audio recording interface
- **Listen**: Transcription validation interface
- **Translate**: Text translation interface
- **API**: API testing interface
- **Docs**: API documentation
- **Events**: Community events and leaderboard
- **Profile**: User profile management

## Database Schema

The database schema is defined in Supabase migrations and includes the following main tables:

- **profiles**: User profile information
- **dialects**: Supported language dialects
- **audio_recordings**: Stored audio recordings
- **transcriptions**: Text transcriptions of audio
- **translations**: Translations between languages
- **service_logs**: Microservice activity logs
- **model_registry**: ML model management

## Microservices

The application is built with a microservices architecture:

### Auth Service

- User registration and authentication
- Profile management
- JWT token generation and validation

### API Service

- Transcription processing
- Translation processing
- Language model integration

### Storage Service

- Audio file upload and storage
- File metadata management
- Secure file access

## UI/UX Design

- **Theme**: Light and dark mode support
- **Responsive Design**: Mobile and desktop compatibility
- **Animations**: Smooth transitions and loading states
- **Accessibility**: ARIA-compliant components

## Development Workflow

1. Run the development server: `npm run dev`
2. Start backend services: `npm run start:all`
3. Access the application at `http://localhost:5173`

## API Documentation

The API documentation is available in the application under the "Docs" section, which includes:

- Available endpoints
- Request/response formats
- Authentication requirements
- Rate limits
- Supported languages

## Future Enhancements

- Real-time collaboration features
- Advanced analytics dashboard
- Mobile application
- Offline support
- Integration with educational platforms