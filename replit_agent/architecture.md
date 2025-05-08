# Architecture Documentation

## Overview

This application is a real estate exam preparation platform that helps users study for their exams through various learning methods like flash cards, practice tests, and progress tracking. The system has a client-server architecture with a React frontend, Express backend, and PostgreSQL database.

The primary features include:
- Studying with flash cards
- Taking practice tests
- Tracking learning progress
- Uploading and parsing study materials (PDFs)
- Managing categories and questions
- Saving favorite questions for later review

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

```
├── client/              # Frontend React application
├── server/              # Backend Express server
├── db/                  # Database operations and migrations
├── shared/              # Shared types and schemas
└── uploads/             # Storage for uploaded files
```

### Frontend Architecture

The frontend is built with React using Vite as the build tool. It follows a component-based architecture with:

- Pages for different sections of the application
- Reusable UI components (using shadcn/ui as a component library foundation)
- Client-side state management using React Query for data fetching
- React hooks for local state and side effects
- Tailwind CSS for styling

### Backend Architecture

The backend uses Node.js with Express and follows a RESTful API architecture:

- API routes for handling HTTP requests
- Storage modules for database operations
- PDF parsing logic for extracting questions from uploaded materials
- File handling for uploaded study materials

### Database Architecture

The application uses PostgreSQL with Drizzle ORM for database operations:

- Schema definitions in TypeScript
- Database migrations managed by Drizzle Kit
- Relations between tables (categories, questions, answers, user progress)
- Zod for schema validation

## Key Components

### Frontend Components

1. **Pages**
   - Dashboard: Overview of study progress and quick access to features
   - Flash Cards: Interactive study cards with questions and answers
   - Practice Test: Timed exam simulation
   - Saved Questions: User's bookmarked questions
   - Upload Materials: Interface for uploading study materials
   - Settings: Application preferences

2. **UI Components**
   - Layout components (Sidebar, TopBar, BottomNavigation)
   - Card components for questions and answers
   - Form elements (inputs, buttons, selectors)
   - Feedback components (toasts, modals)

3. **State Management**
   - React Query for API data fetching and caching
   - Local storage for device identification and settings
   - React state hooks for component-level state

### Backend Components

1. **API Routes**
   - Categories endpoints
   - Questions endpoints
   - User progress endpoints
   - File upload endpoints

2. **Services**
   - PDF parsing service for extracting questions from study materials
   - File storage service for managing uploaded files
   - Data access layer for database operations

3. **Middleware**
   - Request logging
   - Error handling
   - Device identification

### Database Schema

The database has the following main tables:

1. **Categories**
   - Organizes questions by topic
   - Tracks question count per category

2. **Questions**
   - Stores exam questions with text and metadata
   - Associates questions with categories
   - Tracks question difficulty

3. **Answers**
   - Stores answers to questions
   - Includes explanations for answers

4. **User Progress**
   - Tracks user study progress
   - Associates with device IDs for anonymous tracking

## Data Flow

### Question Creation Flow

1. User uploads PDF study materials through the UI
2. Backend receives the file and saves it to the uploads directory
3. PDF parser extracts questions, answers, and explanations
4. Questions are categorized (manually or automatically)
5. Questions and answers are saved to the database

### Study Flow

1. User selects study mode (flash cards or practice test)
2. Frontend requests questions from backend based on filters (category, etc.)
3. Questions are displayed to the user in the selected format
4. User interacts with questions (answers, bookmarks, etc.)
5. Progress is tracked and sent to the backend
6. Statistics are updated for future sessions

## External Dependencies

### Frontend Dependencies

- **React**: Core UI library
- **Wouter**: Lightweight routing
- **TanStack Query**: Data fetching and state management
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library
- **PDF.js**: PDF rendering and parsing on the client

### Backend Dependencies

- **Express**: Web server framework
- **Drizzle ORM**: Database ORM
- **Neon Database**: PostgreSQL provider
- **Multer**: File upload handling
- **Zod**: Schema validation

## Deployment Strategy

The application is configured to be deployed on the Replit platform, as indicated by the presence of `.replit` configuration file. The deployment process includes:

1. Building the frontend with Vite
2. Bundling the backend with esbuild
3. Serving the static frontend files from the Express server
4. Connecting to a PostgreSQL database (likely Neon Database)

The deployment configuration specifies:
- Node.js 20 as the runtime
- PostgreSQL 16 as the database
- Automatic scaling for production deployment
- Scripts for building and starting the application

The application uses environment variables for configuration, particularly for database connection strings. Database migrations are handled through Drizzle Kit's migration tools.

## Development Workflow

The development workflow is supported by:

1. **Scripts**:
   - `npm run dev`: Start development server
   - `npm run build`: Build for production
   - `npm run db:push`: Apply schema changes to database
   - `npm run db:seed`: Seed the database with initial data

2. **Type Safety**:
   - TypeScript for type checking
   - Zod for runtime schema validation
   - Drizzle ORM for type-safe database queries

3. **Tooling**:
   - Vite for fast development and optimized builds
   - ESBuild for server bundling
   - Drizzle Kit for database migrations