# Deployment Guide

This document outlines the steps to deploy the Utah Real Estate Prep application.

## Prerequisites
- Node.js (v16+)
- PostgreSQL database
- Environment variables properly configured

## Environment Variables
The following environment variables need to be set:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production" for production deployment
- `PORT`: The port to run the server on (defaults to 5000)

## Deployment Steps

### 1. Database Setup
- Ensure your PostgreSQL database is running and accessible
- Run database migrations: `npx drizzle-kit push`
- Seed the database with initial data: `npm run seed`

### 2. Build the Application
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

### 4. Deploy to a Hosting Service (Optional)
The application can be deployed to various hosting services:

#### Vercel
- Connect your GitHub repository to Vercel
- Configure the environment variables
- Deploy

#### Netlify
- Connect your GitHub repository to Netlify
- Configure build settings and environment variables
- Deploy

#### Traditional Server
- Set up a server with Node.js
- Clone the repository
- Install dependencies and build
- Use PM2 or similar to manage the Node.js process

## Post-Deployment
- Verify the application is running correctly
- Check that database connections are working
- Test core functionality (flash cards, practice tests)