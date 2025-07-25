const API = '/api';
let token = localStorage.getItem('token');

// ✅ Register with photo upload
document.getElementById('registerForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = document.getElementById('registerForm');
  const formData = new FormData(form); // includes file upload

  fetch(`${API}/register`, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Registered');
      window.location.href = 'login.html';
    });
});

// ✅ Login with JWT and redirect to homepage
document.getElementById('loginForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(res => res.json()).then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login successful');
      window.location.href = 'home.html';
    } else {
      alert(data.error || 'Login failed');
    }
  });
});

// ✅ Load Books on homepage
function fetchBooks() {
  fetch(`${API}/books`)
    .then(res => res.json())
    .then(books => {
      const container = document.getElementById('bookList');
      books.forEach(book => {
        const div = document.createElement('div');
        div.innerHTML = `
          <h3>${book.title}</h3>
          <p>${book.author} - ₹${book.price}</p>
          <a href="book.html?id=${book.id}">View Details</a><hr>`;
        container.appendChild(div);
      });
    });
}

// ✅ Load single book details
function fetchBooks() {
  fetch('/api/books')
    .then(res => res.json())
    .then(books => {
      const container = document.getElementById('bookList');
      container.innerHTML = ''; // clear previous content
      books.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card'; // ✅ very important
        div.innerHTML = `
          <h3>${book.title}</h3>
          <p>${book.author} - ₹${book.price}</p>
          <a href="book.html?id=${book.id}">View Details</a>`;
        container.appendChild(div);
      });
    });
}

// ✅ Load Profile into form on profile.html
function loadProfile() {
  fetch(`${API}/profile`, {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('name').value = data.name;
      document.getElementById('email').value = data.email;
    });

  document.getElementById('profileForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    fetch(`${API}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ name, email })
    }).then(res => res.json()).then(data => alert(data.message || 'Profile updated'));
  });
}

// ✅ Show user name + photo on index.html
function loadUserInfo() {
  fetch(`${API}/profile`, {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(user => {
      const container = document.getElementById('userInfo');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${user.photo}" width="60" height="60" style="border-radius:50%; box-shadow: 0 0 10px #0ff;">
            <h3 style="color:#0ff;">${user.name}</h3>
          </div>`;
      }
    });
}

// ✅ Auto-call appropriate features on relevant pages
if (window.location.pathname.includes('home.html')) {
  fetchBooks();
  loadUserInfo();
}
if (window.location.pathname.includes('profile.html')) {
  loadProfile();
}
if (window.location.pathname.includes('book.html')) {
  const id = new URLSearchParams(window.location.search).get('id');
  if (id) fetchBookDetails(id);
}
