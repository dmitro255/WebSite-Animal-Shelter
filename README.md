# Animal Shelter Management System

A web application for managing animals at an animal shelter and processing adoption applications. 
The project uses a React frontend, a FastAPI backend, and an SQLite database.

## Features

- View shelter statistics on the dashboard.
- Browse animals and filter the catalog by species and status.
- Create, edit, view, and delete animal records.
- Create, edit, and delete adoption applications.
- Keep animal availability in sync with application statuses:
  - A pending application reserves the animal.
  - An approved application marks the animal as adopted.
  - An animal that is already adopted cannot receive a new application.
- Deleting an animal also deletes its associated applications.

## Tech stack

- **Frontend:** React, React Router, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** SQLite

## Requirements

- Python 3.10 or newer
- Node.js and npm

## Getting started

Run the backend and frontend in separate terminals from the project root.

### 1. Start the backend

Create and activate a virtual environment, then install the Python dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

The API is available at <http://127.0.0.1:8000>. Interactive API documentation is available at <http://127.0.0.1:8000/docs>.

The SQLite database is created as `app.db` in the project root when the backend starts. Example records are inserted when the animal table is empty.

### 2. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Frontend commands

Run these from the `frontend` directory:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## API overview

All endpoints are served from `http://127.0.0.1:8000`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/animals` | List animals; optionally filter with `species` and `status` query parameters |
| `GET` | `/animals/{animal_id}` | Get an animal |
| `POST` | `/animals` | Create an animal |
| `PUT` | `/animals/{animal_id}` | Update an animal |
| `DELETE` | `/animals/{animal_id}` | Delete an animal and its applications |
| `GET` | `/adoptions` | List adoption applications |
| `GET` | `/adoptions/{adoption_id}` | Get an application |
| `POST` | `/adoptions` | Create an application |
| `PUT` | `/adoptions/{adoption_id}` | Update an application |
| `DELETE` | `/adoptions/{adoption_id}` | Delete an application |

Animal statuses are `available`, `reserved`, and `adopted`. Application statuses are `pending`, `approved`, and `rejected`.
