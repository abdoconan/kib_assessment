# KIB Assessment -- Movies Service

This repository contains my submitted assessment for **KIB Company**.\
It is a **NestJS application** using **Drizzle ORM**, **pnpm**,
PostgreSQL, and a background queue to synchronize movie data from the
TMDB API.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **NestJS** -- Backend framework\
-   **pnpm** -- Package manager\
-   **Drizzle ORM** -- SQL schema layer\
-   **PostgreSQL** -- Database\
-   **Docker Compose** -- Local environment\
-   **Swagger** -- API documentation\
-   **TMDB API** -- External movie data

------------------------------------------------------------------------

## 📦 Installation

### 1. Clone the repository

``` bash
git clone <repository-url>
cd <repository-folder>
```

------------------------------------------------------------------------

## 🔧 Environment Variables

Before running the project, create a **`.env`** file in the root
directory.\
Use the provided **`.env.example`** file as your template.

Example:

    DATABASE_URL=postgres://postgres:password@localhost:5432/movies
    TMDB_API_KEY=your_tmdb_api_key
    PORT=3000
    JWT_SECRET=your_secret

⚠️ **Important**\
Docker Compose reads values directly from your `.env` file.\
Make sure it's filled correctly **before** running Docker.

------------------------------------------------------------------------

## ▶️ Running the Application

### **Option 1 --- Run Locally**

``` bash
pnpm install
pnpm start
```

### **Option 2 --- Run with Docker**

``` bash
docker-compose up --build
```

------------------------------------------------------------------------

## 📘 API Documentation

Once the server is running, visit:

    http://localhost:3000/docs

------------------------------------------------------------------------

## 🔄 Sync Movie Data (Background Process)

To fill your database with movies from the TMDB API, call:

    POST /queue/movies

This starts a **background process** that integrates data from TMDB into
your local PostgreSQL database.

⚠️ You **must be authorized** to perform this action.

------------------------------------------------------------------------

## 🎬 Movies API

### List Movies (with optional genre filter)

    GET /movies
    GET /movies?genreName=Action

The result includes each movie with its genre list.

------------------------------------------------------------------------

## ⭐ Rate a Movie

Each user can rate a movie **only once**.

    POST /movies/:movieId/rate
    Body: { "rating": number }

This automatically updates the movie's:

-   **average rating**
-   **total number of votes**

------------------------------------------------------------------------

## 🗄 Database Notes

-   The project uses **PostgreSQL**
-   **Drizzle ORM** handles schema + queries
-   You may use local PostgreSQL or a server provider\
-   If you run via Docker, PostgreSQL is started automatically

------------------------------------------------------------------------

## ✅ Summary

This service includes:

-   Movie + Genre storage (TMDB integration)
-   Background sync queue `/queue/movies`
-   Movie listing with genre filtering
-   Rating system (1 rating per user per movie)
-   Swagger documentation at `/docs`
-   Runs via `pnpm` or `docker-compose`
