# Frontend Architecture

## Overview

The Bantu Project frontend is built with React and TypeScript, using a component-based architecture with a focus on reusability, maintainability, and performance. The application uses React Router for navigation, shadcn/ui for UI components, and Tailwind CSS for styling.

## Directory Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── ...           # Custom components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and services
├── pages/            # Page components
└── types/            # TypeScript type definitions
```

## Key Components

### Layout Components

- **Layout.tsx**: Main layout wrapper that includes the header, sidebar, and main content area
- **AppSidebar.tsx**: Collapsible navigation sidebar with menu items
- **ThemeProvider.tsx**: Context provider for theme management (light/dark mode)
- **ThemeToggle.tsx**: UI component for switching between themes

### Authentication Components

- **Auth.tsx**: Sign in and sign up forms
- **RequireAuth.tsx**: HOC for protecting routes that require authentication

### Page Components

- **Welcome.tsx**: Landing page with project introduction
- **Dashboard.tsx**: User dashboard with statistics and project updates
- **LetsTalk.tsx**: Interface for recording audio contributions
- **Listen.tsx**: Interface for validating transcriptions
- **Translate.tsx**: Interface for providing translations
- **ModeSelection.tsx**: Selection screen for contribution methods
- **API.tsx**: Interface for testing API services
- **Docs.tsx**: API documentation
- **Events.tsx**: Community events and leaderboard
- **Profile.tsx**: User profile management
- **Contributions.tsx**: User contribution history

## Custom Hooks

- **useAuth.ts**: Authentication state and methods
- **useToast.ts**: Toast notification management
- **useProfile.ts**: User profile data management
- **useRecording.ts**: Audio recording functionality
- **useAutoScroll.ts**: Automatic scrolling for carousels
- **useIsMobile.ts**: Responsive design helper

## State Management

The application uses React's Context API and hooks for state management:

- **AuthContext**: User authentication state
- **ThemeContext**: Application theme state
- **ToastContext**: Notification state

## Routing

React Router v6 is used for navigation with the following route structure:

- `/`: Welcome page
- `/auth`: Authentication page
- `/dashboard`: User dashboard
- `/lets-talk`: Audio recording interface
- `/listen`: Transcription validation
- `/modeselection`: Contribution method selection
- `/translate`: Translation interface
- `/profile`: User profile
- `/contributions`: Contribution history
- `/api`: API testing interface
- `/docs`: API documentation
- `/events`: Community events

## API Integration

The application communicates with backend services using Axios:

- **api.ts**: Axios instance with interceptors for authentication
- **supabase.ts**: Supabase client for database and storage operations

## UI Framework

The UI is built with shadcn/ui components and Tailwind CSS:

- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Theme Support**: Light and dark mode with CSS variables
- **Animations**: CSS animations for transitions and loading states
- **Accessibility**: ARIA attributes and keyboard navigation

## Performance Optimizations

- **Code Splitting**: Lazy loading of page components
- **Memoization**: React.memo and useMemo for expensive computations
- **Virtualization**: Efficient rendering of large lists
- **Image Optimization**: Proper sizing and loading of images

## Error Handling

- **Error Boundaries**: Catching and displaying errors
- **Form Validation**: Input validation with react-hook-form and zod
- **API Error Handling**: Consistent error handling for API requests

## Testing Strategy

- **Unit Tests**: Testing individual components and hooks
- **Integration Tests**: Testing component interactions
- **E2E Tests**: Testing complete user flows

## Build and Deployment

- **Vite**: Fast development server and optimized builds
- **TypeScript**: Static type checking
- **ESLint**: Code quality and consistency
- **CI/CD**: Automated testing and deployment