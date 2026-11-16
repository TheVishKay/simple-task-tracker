# Task Tracker

A small full-stack app for adding tasks, marking them complete, filtering by status, and deleting tasks. React renders the interface and calls a Java 21 Spring Boot REST API.

The backend stores tasks in memory, so restarting it clears the list. You can run the app without setting up a database.

## Run locally

You need JDK 21, Maven 3.9+, and Node.js 20.19+ or 22.12+ (use an LTS release).

Start the API in one terminal from the repository root.

```sh
cd backend
mvn spring-boot:run
```

Start React in another terminal from the repository root.

```sh
cd frontend
npm ci
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite forwards requests under `/api` to Spring Boot on port 8080.

## Where to start reading

- [React interface](frontend/src/main.jsx) renders the task list and sends requests with `fetch`.
- [Spring Boot entry point](backend/src/main/java/com/example/tasktracker/TaskTrackerApplication.java) starts the API.
- [Task controller](backend/src/main/java/com/example/tasktracker/TaskController.java) defines the endpoints and stores tasks.

## API

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| GET | `/api/tasks` | — | `200` with a task list |
| POST | `/api/tasks` | `{"title":"Read the README"}` | `201` with the new task |
| PATCH | `/api/tasks/{id}` | `{"completed":true}` | `200` with the updated task |
| DELETE | `/api/tasks/{id}` | — | `204` |

## Build

Run `mvn package` from `backend/` and `npm run build` from `frontend/` after installing the frontend dependencies.
