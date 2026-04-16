// ================= SAFE INIT =================
let users = JSON.parse(localStorage.getItem("users")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// ================= AUTO LOGIN =================
window.onload = () => {
  if (currentUser) {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("appSection").classList.remove("hidden");
    showDashboard();
  }
};

// ================= SAVE =================
function saveAll() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("books", JSON.stringify(books));
  localStorage.setItem("records", JSON.stringify(records));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

// ================= HELPERS =================
function setLoading(msg) {
  document.getElementById("results").innerHTML =
    `<p class="text-gray-500">${msg}</p>`;
}

function showMessage(msg, color = "green") {
  document.getElementById("results").innerHTML =
    `<p class="text-${color}-600 font-medium">${msg}</p>`;
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// ================= AUTH =================
function register() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let role = document.getElementById("role").value;

  if (!email || !password) return alert("Fill all fields");
  if (password.length !== 6) return alert("Password must be 6 characters");

  if (users.find(u => u.email === email)) {
    return alert("User already exists");
  }

  users.push({ email, password, role });
  saveAll();

  alert("Registered successfully!");
}

function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  let user = users.find(u => u.email === email && u.password === password);

  if (!user) return alert("Invalid login");

  currentUser = user;
  saveAll();

  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");

  showDashboard();
}

// ================= LOGOUT =================
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");

  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");

  document.getElementById("results").innerHTML = "";
}

// ================= NAVIGATION =================
function openSection(section) {
  if (!currentUser) return alert("Login first");

  if (section === "dashboard") showDashboard();
  if (section === "catalogue") showCatalogue();

  if (section === "borrow") {
    if (currentUser.role === "librarian") addBookByISBN();
    else showBorrow();
  }

  if (section === "tracking") {
    if (currentUser.role === "librarian") showOverdue();
    else showTracking();
  }
}

// ================= SEARCH =================
async function searchBook() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("Enter search term");

  try {
    setLoading("Searching books...");

    let res = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    let data = await res.json();

    if (!data.docs?.length) {
      return showMessage("No books found", "red");
    }

    let html = `<h2 class="font-bold mb-2">Search Results</h2>`;

    data.docs.slice(0, 10).forEach(book => {
      html += `
        <div class="border-b py-2">
          <strong>${book.title}</strong><br>
          <span class="text-gray-600">${book.author_name?.[0] || "Unknown"}</span><br>

          <button onclick="quickBorrow('${escapeQuotes(book.title)}')"
            class="mt-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            Borrow
          </button>
        </div>
      `;
    });

    document.getElementById("results").innerHTML = html;

  } catch {
    showMessage("Failed to load books", "red");
  }
}

// ================= CATALOGUE =================
async function showCatalogue(category = "popular") {
  try {
    setLoading("Loading catalogue...");

    let res = await fetch(`https://openlibrary.org/search.json?q=${category}`);
    let data = await res.json();

    if (!data.docs?.length) {
      return showMessage("No books found", "red");
    }

    let html = `
      <h2 class="font-bold mb-3">📚 Catalogue</h2>

      <div class="mb-4">
        <select onchange="showCatalogue(this.value)"
          class="p-2 border rounded">
          <option value="popular">Popular</option>
          <option value="fiction">Fiction</option>
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="technology">Technology</option>
        </select>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    `;

    data.docs.slice(0, 12).forEach(book => {
      let cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : "https://via.placeholder.com/100x150?text=No+Cover";

      html += `
        <div class="bg-white p-3 rounded shadow">

          <img src="${cover}" class="w-full h-40 object-cover rounded mb-2">

          <h3 class="font-semibold text-sm">${book.title}</h3>

          <p class="text-xs text-gray-600 mb-2">
            ${book.author_name?.[0] || "Unknown"}
          </p>

          <button onclick="quickBorrow('${escapeQuotes(book.title)}')"
            class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs w-full">
            Borrow
          </button>

        </div>
      `;
    });

    html += `</div>`;
    document.getElementById("results").innerHTML = html;

  } catch {
    showMessage("Failed to load catalogue", "red");
  }
}

// ================= BORROW =================
function showBorrow() {
  document.getElementById("results").innerHTML = `
    <h2 class="font-bold mb-2">Borrow Book</h2>

    <input id="title" placeholder="Book title"
      class="border p-2 mb-2 w-full rounded">

    <input id="date" type="date"
      class="border p-2 mb-2 w-full rounded">

    <button onclick="borrow()"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
      Borrow
    </button>
  `;
}

function borrow() {
  let title = document.getElementById("title").value.trim();
  let date = document.getElementById("date").value;

  if (!title || !date) return alert("Fill all fields");

  let exists = records.find(
    r => r.email === currentUser.email && r.title === title && !r.returned
  );

  if (exists) return alert("Already borrowed");

  records.push({
    email: currentUser.email,
    title,
    dueDate: date,
    returned: false
  });

  if (!books.find(b => b.title === title)) {
    books.push({ title, author: "Unknown", available: true });
  }

  saveAll();
  alert("Book borrowed!");
}

// ================= QUICK BORROW =================
function quickBorrow(title) {
  document.getElementById("results").innerHTML = `
    <h3 class="font-bold mb-2">${title}</h3>

    <input id="date" type="date"
      class="border p-2 mb-2 w-full rounded">

    <button onclick="confirmBorrow('${escapeQuotes(title)}')"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
      Confirm Borrow
    </button>
  `;
}

function confirmBorrow(title) {
  let date = document.getElementById("date").value;

  if (!date) return alert("Select date");

  let exists = records.find(
    r => r.email === currentUser.email && r.title === title && !r.returned
  );

  if (exists) return alert("Already borrowed");

  records.push({
    email: currentUser.email,
    title,
    dueDate: date,
    returned: false
  });

  if (!books.find(b => b.title === title)) {
    books.push({ title, author: "Unknown", available: true });
  }

  saveAll();
  alert("Borrowed!");
}

// ================= TRACKING (FULL ENGLISH FIXED) =================
function showTracking() {
  let myBooks = records.filter(r => r.email === currentUser.email);

  if (!myBooks.length) {
    return showMessage("No borrowed books yet", "gray");
  }

  let html = `<h2 class="font-bold mb-2">My Borrowed Books</h2>`;

  myBooks.forEach(r => {
    let due = new Date(r.dueDate);
    let today = new Date();

    let status = r.returned
      ? "Returned"
      : due < today
        ? "Overdue"
        : "Currently Borrowed";

    let color =
      status === "Overdue"
        ? "text-red-600"
        : status === "Returned"
          ? "text-blue-600"
          : "text-green-600";

    html += `
      <div class="border-b py-2">
        <strong>Book Title:</strong> ${r.title}<br>
        <strong>Due Date:</strong> ${r.dueDate || "Not set"}<br>
        <span class="${color}">Status: ${status}</span>
      </div>
    `;
  });

  document.getElementById("results").innerHTML = html;
}

// ================= OVERDUE =================
function showOverdue() {
  let today = new Date();

  let overdue = records.filter(r =>
    new Date(r.dueDate) < today && !r.returned
  );

  if (!overdue.length) {
    return showMessage("No overdue books", "green");
  }

  let html = `<h2 class="font-bold mb-2">Overdue Books</h2>`;

  overdue.forEach(r => {
    html += `<div class="border-b py-2">${r.title} - ${r.email}</div>`;
  });

  document.getElementById("results").innerHTML = html;
}

// ================= DASHBOARD =================
function showDashboard() {
  let myRecords = records.filter(r => r.email === currentUser.email);

  document.getElementById("results").innerHTML = `
    <h2 class="font-bold mb-2">Dashboard</h2>
    <p>Email: ${currentUser.email}</p>
    <p>Role: ${currentUser.role}</p>
    <p>Books Borrowed: ${myRecords.length}</p>
  `;
}