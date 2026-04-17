 LibraTrack
LibraTrack is a simple library management system built with HTML, Tailwind CSS, and JavaScript.
It allows users to register, log in, search books via the Open Library API, borrow books, track borrowed records, and view a personalized dashboard.

Features
Authentication

Register as a Member or Librarian

Login/logout functionality

Book Search

Search books using the Open Library API

Quick borrow option directly from search results

Catalogue

Browse popular books or by category

Borrow books with due dates

Borrowing System

Borrow books manually or via quick borrow

Prevents duplicate borrowing of the same book

Tracking

View borrowed books, due dates, and status (Borrowed, Returned, Overdue)

Dashboard

Displays user details (email, role, borrowed count)

 Tech Stack
Frontend: HTML, Tailwind CSS

Backend: JSON server (http://localhost:3000)

API Integration: Open Library API

Language: JavaScript (ES6+)

 Project Structure
Code
LibraTrack/
│── index.html        # Main UI (Auth + App sections)
│── script.js         # Core logic (auth, search, borrow, tracking)
│── db.json           # JSON server database (users, records)
│── README.md         # Documentation
 Setup Instructions
Clone the repository

bash
git clone https://github.com/your-username/LibraTrack.git
cd LibraTrack
Install JSON Server

bash
npm install -g json-server
Run the backend

bash
json-server --watch db.json --port 3000
Open the app

Simply open index.html in your browser.

Authentication Page (Register/Login)

Dashboard

Book Search Results

Catalogue View

Borrow Flow

Tracking Page

> ![App Screenshot]"(screenshot1.png)
> ![App Screenshot]"(screenshot2.png)
> ![App Screenshot]"(screenshot3.png)
> ![App Screenshot]"(screenshot4.png)
> ![App Screenshot]"(screenshot5.png)
> ![App Screenshot]"(screenshot6.png)
> ![App Screenshot]"(screenshot7.png)

 API Endpoints
Users

GET /users → Fetch all users

POST /users → Register new user

Records

GET /records → Fetch all borrow records

POST /records → Add new borrow record

 Future Improvements
Role-based access control (different views for Librarians vs Members)

Book return functionality with fine calculation

Enhanced UI with pagination and filters

Deployment to a live server

 Author
Developed by Brian

