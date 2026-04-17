# LibraTrack

A browser-based library management system that allows users to register, log in, search for books, borrow them, and track their borrowing history. It uses the Open Library API for book data and a local JSON Server as the backend.

---

## Project Structure

```
project/
├── index.html
├── script.js
└── db.json        # JSON Server database
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [JSON Server](https://github.com/typicode/json-server) installed globally

---

## Getting Started

### 1. Install JSON Server

```bash
npm install -g json-server
```

### 2. Create the database file

Create a `db.json` file in your project root with the following content:

```json
{
  "users": [],
  "records": []
}
```

### 3. Start the backend server

```bash
json-server --watch db.json --port 3000
```

The API will be available at `http://localhost:3000`.

### 4. Open the app

Open `index.html` directly in your browser or use a live server extension in VS Code.

---

## Features

### Authentication
- Register with an email, password (minimum 6 characters), and a role
- Two roles available: Member and Librarian
- Login and logout functionality
- Duplicate email registration is prevented

### Book Search
- Search books in real time using the Open Library API
- Displays title and author for each result
- Quick borrow button available directly from search results

### Catalogue
- Loads a default set of popular books from the Open Library API
- Displays book covers, titles, and authors
- Each book has a borrow button

### Borrow
- Borrow a book by entering its title and a due date
- Prevents duplicate borrowing of the same book by the same user
- Quick borrow flow available from search and catalogue views

### Tracking
- View all books borrowed by the currently logged-in user
- Shows due date and status: Borrowed, Overdue, or Returned

### Dashboard
- Displays the current user's email, role, and total number of borrowed books

---
### Screenshots
> ![App Screenshot](screenshot1.png)
> ![App Screenshot](screenshot2.png)
> ![App Screenshot](screenshot3.png)
> ![App Screenshot](screenshot4.png)
> ![App Screenshot](screenshot5.png)
> ![App Screenshot](screenshot6.png)
> ![App Screenshot](screenshot7.png)
## API Endpoints (JSON Server)

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| GET    | /users     | Fetch all users          |
| POST   | /users     | Register a new user      |
| GET    | /records   | Fetch all borrow records |
| POST   | /records   | Add a new borrow record  |

---

## External API

- Open Library Search API: `https://openlibrary.org/search.json?q={query}`
- Book covers: `https://covers.openlibrary.org/b/id/{cover_id}-M.jpg`

---

## Notes

- Passwords are stored in plain text in `db.json`. This project is intended for learning purposes only and is not suitable for production use.
- The app does not persist login state between page refreshes. Users must log in again after a reload.
- The backend must be running on port 3000 before using the app.

---

## Built With

- HTML5
- Tailwind CSS (via CDN)
- JavaScript
- JSON Server
- Open Library API