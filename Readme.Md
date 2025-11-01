# SlotSwapper

SlotSwapper is a peer to peer time-slot scheduling application. Users can mark busy slots on their calendar as "swappable," allowing other users to browse and request to swap for one of their own swappable slots.

This project was built as a full-stack technical challenge, demonstrating data modeling, complex API logic, and frontend state management.

-   **Frontend:** React (with Vite), React Router, and Axios
-   **Backend:** Node.js, Express, and MongoDB (with Mongoose)
-   **Authentication:** JWT (JSON Web Tokens)
-   **Real-time:** WebSockets (`socket.io`) for instant notifications.
-   **Testing:** Jest & Supertest for backend integration tests.
-   **Deployment:** Fully containerized with Docker & Docker Compose.

---

## Stand Out Features

* **Real-time Notifications:** Users are notified instantly of new swap requests and responses using WebSockets.
* **"Smart" Swap Logic:** The app prevents users from offering a swap that conflicts with the other user's schedule.
* **Complete Swap Lifecycle:** A full "History" tab shows all `ACCEPTED` and `REJECTED` swaps.
* **Polished UI:** Features user avatars, a clean two-column dashboard, and a toast notification system.

---
## Video showcase of the project

https://www.loom.com/share/27ad7a3a70f44163be3ab0917da5572c

---

## How to Run (Recommended: Docker)

This is the easiest way to run the entire project (frontend, backend, and database).

1.  **Prerequisite:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2.  Clone this repository.
3.  In the root `SlotSwapper/` directory, create a `.env` file for the backend.
    ```bash
    # Path: SlotSwapper/backend/.env
    DATABASE_URL="mongodb://database:27017/slotswapper" 
    JWT_SECRET="YOUR_SUPER_SECRET_RANDOM_STRING_GOES_HERE"
    ```
4.  From the **root `SlotSwapper/` directory**, run:
    ```bash
    docker-compose up -d --build
    ```
5.  That's it!
    * The frontend is available at **`http://localhost:8080`**.
    * The backend API is running on port `5000`.
    * The MongoDB database is running on port `27017`.

To stop the services, run: `docker-compose down`

---

## How to Run Tests (Backend)

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies (if you haven't):
    ```bash
    npm install
    ```
3.  Run the tests:
    ```bash
    npm test
    ```

---

## Local Development (Without Docker)

### 1. Backend Setup (Terminal 1)

1.  Navigate to `SlotSwapper/backend`.
2.  Run `npm install`.
3.  Create a `.env` file:
    ```ini
    DATABASE_URL="mongodb://localhost:27017/slotswapper"
    JWT_SECRET="YOUR_SUPER_SECRET_RANDOM_STRING_GOES_HERE"
    ```
4.  Run `npm start`.

### 2. Frontend Setup (Terminal 2)

1.  Navigate to `SlotSwapper/frontend`.
2.  Run `npm install`.
3.  **Note:** The `vite.config.js` proxy *is* required for local dev. The `nginx.conf` is for Docker only.
4.  Run `npm run dev`.
5.  The app will be available at `http://localhost:5173`.
