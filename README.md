# Academic Scheduler

A web application designed to help students manage their academic schedules, including course planning, assignment tracking, and deadline reminders. Integrated with calendar APIs for seamless organization and built with a modern tech stack for a responsive and intuitive user experience.

## Features
- **Course Planning**: Organize and view course schedules with ease.
- **Assignment Tracking**: Keep track of assignments and their due dates.
- **Deadline Reminders**: Receive timely notifications for upcoming deadlines.
- **Calendar Integration**: Sync with Google Calendar for seamless event management.
- **Responsive Design**: Accessible on both desktop and mobile devices.

## Tech Stack
- **Front-End**: React, JavaScript, Tailwind CSS
- **Back-End**: Node.js, Express
- **Database**: MongoDB
- **APIs**: Google Calendar API, REST APIs

## Screenshots
![FireShot Capture 005 - Vite + React -  localhost](https://github.com/user-attachments/assets/ccf7c0c8-c573-4c43-aff2-cad7fd8d0aa0)
*Dashboard showing course schedule and upcoming assignments*

![FireShot Capture 008 - Vite + React -  localhost](https://github.com/user-attachments/assets/cd3d8673-6397-4ca0-b114-aad3f9cfe7c2)
*Assignment tracker with deadline reminders*

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/username/AcademicScheduler.git
   ```
2. Navigate to the project directory:
   ```bash
   cd AcademicScheduler
   ```
3. Install dependencies for both front-end and back-end:
   ```bash
   npm install
   cd client && npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     GOOGLE_API_KEY=your_google_api_key
     ```
5. Run the application:
   ```bash
   npm run dev
   ```
   - The back-end will run on `http://localhost:5000`.
   - The front-end will run on `http://localhost:3000`.

## Usage
- Access the app via `http://localhost:3000` in your browser.
- Log in or sign up to start managing your academic schedule.
- Sync with Google Calendar to import or export events.
- Add courses, assignments, and deadlines through the intuitive dashboard.

## Project Duration
March 2024 – April 2024

## Role
Full-Stack Developer

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## Contact
For any questions or suggestions, feel free to reach out via [GitHub Issues](https://github.com/akash-de-alwis/AcademicScheduler/issues).
