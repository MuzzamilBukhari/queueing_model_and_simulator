# Running the Backend with Docker

This guide explains how to run the Queue Simulator Backend using Docker. There are two primary ways to do this: using Docker Compose (recommended) or using standard Docker commands.

## Prerequisites
- Make sure you have [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- Make sure Docker Desktop (or the Docker daemon) is currently running.

---

## Method 1: Using Docker Compose (Recommended)

Since the project includes a `docker-compose.yml` file, this is the easiest way to run the application.

1. Open a terminal (e.g., PowerShell or Command Prompt).
2. Navigate to the root folder of the project (`Simulator/`).
3. Run the following command to build and start the backend service:
   ```bash
   docker-compose up --build backend
   ```
   *(Note: If you have newer versions of Docker, the command might be `docker compose up --build backend` without the hyphen).*

4. The backend API will be accessible at: **http://localhost:5000**

To stop the service, press `Ctrl + C` in the terminal, or run `docker-compose down` in another terminal from the same directory.

---

## Method 2: Manual Docker Build and Run

If you want to run only the backend without using docker-compose, you can build and run the Dockerfile directly.

1. Open a terminal.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Build the Docker image and tag it as `queue-backend`:
   ```bash
   docker build -t queue-backend .
   ```
4. Run the container, mapping port 5000 on your local machine to port 8080 inside the container:
   ```bash
   docker run -p 5000:8080 -e ASPNETCORE_ENVIRONMENT=Development queue-backend
   ```

5. The backend API will be accessible at: **http://localhost:5000**

To stop the service, press `Ctrl + C` in the terminal.

---

## Verifying it Works
You can verify the backend is running by opening a browser and navigating to a valid API endpoint, or by checking the logs in the terminal where Docker is running. The server listens on `http://localhost:5000` (which is routed to the ASP.NET Core container listening on `8080`).
