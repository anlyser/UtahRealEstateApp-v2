# Setup Instructions

## Prerequisites
- Node.js (v16+)
- PostgreSQL Database

## Installation

1. Clone this repository
   ```bash
   git clone  
   cd the clone
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up your database:
   - Create a PostgreSQL database
   - Set the DATABASE_URL environment variable to your database connection string
   - Run database migrations:
     ```bash
     npx drizzle-kit push
     ```
   - Seed the database:
     ```bash
     npm run seed
     ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Key Features
- Flash Cards for studying real estate concepts
- Practice Tests with real exam-style questions
- Progress tracking
- Category-based organization of study materials
- Over 1,600 questions across 8 categories

## Project Structure

- `/client` - Frontend React application
- `/server` - Express server and API routes
- `/db` - Database schema, migrations, and seed data
- `/shared` - Shared types and utilities

## Recent Updates
- UI improvements for better usability
- Removed upload functionality as materials are now included
- Fixed category navigation issues
- Improved mobile responsiveness
