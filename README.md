# PropynylidyneHackToChange2025
- Hack The Change 2025 project
- Team: Propynylidyne-C3H

## Inspiration
As cities grow more complex, ensuring public safety and rapid emergency response becomes increasingly difficult. Our team was inspired by the potential of drones to transform urban management, not just as tools for surveillance or delivery, but as agents for safety, sustainability, and inclusivity. We wanted to “drone the change” by building a system that makes cities smarter and more responsive.

## What it does
**Drone the Change** is a smart drone management system that helps cities enhance safety and sustainability.  

- **Admins** can add drones, assign patrol or emergency missions, and monitor live status.  
- **Drones** patrol high-risk areas, respond to incidents, and collect environmental data such as air quality.  
- The platform enables faster emergency response and supports data-driven urban planning.

## How we built it
We built **Drone the Change** using a full-stack architecture:  

- **Frontend:** React + TypeScript with Leaflet for real-time drone mapping and mission control.  
- **Backend:** Elastic Beanstalk for containerized deployment.
- **Database:** DynamoDB to manage drones, missions, and user data.  
- **Cloud Infrastructure:** AWS for scalability and secure data handling.  

We focused on creating a responsive, intuitive interface that allows admins to manage drones and visualize missions in real time.

## Running the Project Locally
You can run the frontend and backend together with the following command:
`docker compose up --build`

*Note: `docker` must be running first.

Then, open these links:
- Web app: http://localhost:3000/
- API docs: http://localhost:4000/api-docs

## Running frontend and backend individually

### Frontend
The frontend is written in React with TypeScript.

#### How to run
1. `cd frontend`
2. `npm install`
3. `npm start`
4. Open http://localhost:3000/

### Backend
The backend is written in Typescript and uses Node.js to create APIs.

#### How to Run
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
