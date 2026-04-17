const API = "http://localhost:3000";

// CURRENT USER
let currentUser = null;
// AUTO LOGIN 

window.onload = function () {
  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");
};

// HELPERS
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

// REGISTER

async function register() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let role = document.getElementById("role").value;

  if (!email || !password) return alert("Fill all fields");
  if (password.length < 6) return alert("Password must be at least 6 characters");

  let res = await fetch(`${API}/users`);
  let users = await res.json();

  if (users.find(u => u.email === email)) {
    return alert("User already exists");
  }

  await fetch(`${API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  });

  alert("Registered successfully!");
}


// LOGIN

async function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  let res = await fetch(`${API}/users`);
  let users = await res.json();

  let user = users.find(u => u.email === email && u.password === password);

  if (!user) return alert("Invalid login");

  currentUser = user;

  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");

  showDashboard();
}


// LOGOUT

function logout() {
  currentUser = null;

  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");

  document.getElementById("results").innerHTML = "";
}


// NAVIGATION
function openSection(section) {
  if (!currentUser) return alert("Login first");

  if (section === "dashboard") showDashboard();
  if (section === "catalogue") showCatalogue();

  if (section === "borrow") showBorrow();
  if (section === "tracking") showTracking();
}


// SEARCH (Open Library API)

async function searchBook() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("Enter search term");

  setLoading("Searching...");

  let res = await fetch(`https://openlibrary.org/search.json?q=${query}`);
  let data = await res.json();

  let html = `<h2 class="font-bold mb-2">Search Results</h2>`;

  data.docs.slice(0, 10).forEach(book => {
    html += `
      <div class="border-b py-2">
        <strong>${book.title}</strong><br>
        <span class="text-gray-600">${book.author_name?.[0] || "Unknown"}</span><br>

        <button onclick="quickBorrow('${escapeQuotes(book.title)}')"
          class="mt-1 bg-green-500 text-white px-3 py-1 rounded text-sm">
          Borrow
        </button>
      </div>
    `;
  });

  document.getElementById("results").innerHTML = html;
}


// CATALOGUE

async function showCatalogue(category = "popular") {
  setLoading("Loading catalogue...");

  let res = await fetch(`https://openlibrary.org/search.json?q=${category}`);
  let data = await res.json();

  let html = `<h2 class="font-bold mb-3">📚 Catalogue</h2>`;

  data.docs.slice(0, 12).forEach(book => {
    let cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/100x150?text=No+Cover";

    html += `
      <div class="bg-white p-3 rounded shadow mb-2">
        <img src="${cover}" class="w-full h-40 object-cover rounded mb-2">
        <h3 class="font-semibold text-sm">${book.title}</h3>
        <p class="text-xs text-gray-600">${book.author_name?.[0] || "Unknown"}</p>

        <button onclick="quickBorrow('${escapeQuotes(book.title)}')"
          class="bg-green-500 text-white px-2 py-1 rounded text-xs w-full">
          Borrow
        </button>
      </div>
    `;
  });

  document.getElementById("results").innerHTML = html;
}


// BORROW FLOW

function showBorrow() {
  document.getElementById("results").innerHTML = `
    <h2 class="font-bold mb-2">Borrow Book</h2>

    <input id="title" placeholder="Book title"
      class="border p-2 mb-2 w-full rounded">

    <input id="date" type="date"
      class="border p-2 mb-2 w-full rounded">

    <button onclick="borrow()"
      class="bg-blue-600 text-white px-4 py-2 rounded">
      Borrow
    </button>
  `;
}

async function borrow(titleFromQuick) {
  let title = titleFromQuick || document.getElementById("title").value.trim();
  let date = document.getElementById("date").value;

  if (!title || !date) return alert("Fill all fields");

  let res = await fetch(`${API}/records`);
  let records = await res.json();

  let exists = records.find(
    r => r.email === currentUser.email && r.title === title && !r.returned
  );

  if (exists) return alert("Already borrowed");

  await fetch(`${API}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: currentUser.email,
      title,
      dueDate: date,
      returned: false
    })
  });

  alert("Book borrowed!");
}


// QUICK BORROW

function quickBorrow(title) {
  document.getElementById("results").innerHTML = `
    <h3 class="font-bold mb-2">${title}</h3>

    <input id="date" type="date"
      class="border p-2 mb-2 w-full rounded">

    <button onclick="borrow('${escapeQuotes(title)}')"
      class="bg-blue-600 text-white px-4 py-2 rounded">
      Confirm Borrow
    </button>
  `;
}

// TRACKING

async function showTracking() {
  let res = await fetch(`${API}/records`);
  let records = await res.json();

  let myBooks = records.filter(r => r.email === currentUser.email);

  if (!myBooks.length) {
    return showMessage("No borrowed books yet", "gray");
  }

  let html = `<h2 class="font-bold mb-2">My Books</h2>`;

  myBooks.forEach(r => {
    let due = new Date(r.dueDate);
    let today = new Date();

    let status = r.returned
      ? "Returned"
      : due < today
        ? "Overdue"
        : "Borrowed";

    html += `
      <div class="border-b py-2">
        <strong>${r.title}</strong><br>
        Due: ${r.dueDate}<br>
        Status: ${status}
      </div>
    `;
  });

  document.getElementById("results").innerHTML = html;
}


// DASHBOARD

async function showDashboard() {
  let res = await fetch(`${API}/records`);
  let records = await res.json();

  let my = records.filter(r => r.email === currentUser.email);

  document.getElementById("results").innerHTML = `
    <h2 class="font-bold mb-2">Dashboard</h2>
    <p>Email: ${currentUser.email}</p>
    <p>Role: ${currentUser.role}</p>
    <p>Books Borrowed: ${my.length}</p>
  `;
}