# PropynylidyneHackToChange2025
Hack to change 2025 project

## Running the Project
You can run the frontend and backend together with the following command:
`docker compose up --build`

*Note: `docker` must be running first.

Then, open these links:
- Web app: http://localhost:3000/
- API docs: http://localhost:4000/api-docs


## Frontend

### How to run
1. `cd frontend`
2. `npm install`
3. `npm start`
4. Open http://localhost:3000/

## Backend
The backend is written in Typescript and uses Node.js to create APIs.

### How to Run
1. `cd backend`
2. `npm install`
3. `npm start`
4. Open [localhost:4000/api-docs](http://localhost:4000/api-docs)

### Mission scheduling safeguards
- API now validates drone existence and maintenance status before assigning missions and blocks overlapping schedules for the same drone.
- Mission payloads can include a `routeSuggestions` to-do list (`summary`, optional `status`, `suggestedRoute`, and `notes`) so planners can curate route options alongside the canonical mission route.

## Architecture

## Database
AWS DynamoDB was used. NoSQL Database is used because of faster query response time compared to SQL database, as well as simplicity in making function calls, and fast database prototyping.
