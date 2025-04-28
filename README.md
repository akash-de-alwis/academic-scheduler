Academic Scheduler
A web application designed to help students manage their academic schedules, including course planning, assignment tracking, and deadline reminders. Integrated with Google Calendar API for seamless event synchronization and built with a modern, responsive interface.
Table of Contents

Features
Tech Stack
Screenshots
Installation
Usage
Contributing
License

Features

Course Planning: Organize and view course schedules with ease.
Assignment Tracking: Track assignments and deadlines with reminders.
Calendar Integration: Sync events with Google Calendar using the Google Calendar API.
Responsive Design: User-friendly interface optimized for desktop and mobile devices.
Real-Time Updates: Efficient state management for dynamic content updates.

Tech Stack

Frontend: React, JavaScript, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
APIs: Google Calendar API, REST APIs

Screenshots
Dashboard View
![FireShot Capture 005 - Vite + React -  localhost](https://github.com/user-attachments/assets/82797d39-bd87-473e-aec3-5e67a42590b3)

Overview of the academic scheduler dashboard showing course schedules and upcoming deadlines.
![FireShot Capture 005 - Vite + React -  localhost](https://github.com/user-attachments/assets/82797d39-bd87-473e-aec3-5e67a42590b3)

Assignment Tracker
Assignment tracking page with filters and deadline reminders.
Installation

Clone the repository:git clone https://github.com/username/AcademicScheduler.git


Navigate to the project directory:cd AcademicScheduler


Install dependencies for both frontend and backend:npm install
cd client && npm install


Set up environment variables:
Create a .env file in the root directory.
Add the following:MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret




Start the backend server:npm run server


Start the frontend development server:cd client && npm start



Usage

Access the application at http://localhost:3000.
Log in with Google to enable calendar synchronization.
Add courses, assignments, and deadlines via the dashboard.
View synced events on your Google Calendar.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.
