document.addEventListener("DOMContentLoaded", function () {
  const demoBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 299,
      description: "A timeless classic of American literature set in the Roaring Twenties.",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
    },
    {
      id: 2,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      price: 259,
      description: "A witty and romantic tale of manners and misunderstanding.",
      image: "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      price: 319,
      description: "A dystopian novel exploring totalitarianism and surveillance.",
      image: "https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
    },
    {
  id: 4,
  title: "Harry Potter and the Philosopher's Stone",
  author: "J.K. Rowling",
  price: 349,
  description: "The magical journey of a young wizard as he enrolls at Hogwarts.",
  image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
}
,
  {
    id: 5,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 289,
    description: "A profound exploration of racial inequality in the American South.",
    image: "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
  }
  ];

  let currentSlide = 0;
  const heroTrack = document.getElementById("heroTrack");

  // Create slides
  demoBooks.forEach(book => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.style.backgroundImage = `url('${book.image}')`;
    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2>${book.title}</h2>
        <p>${book.author}</p>
        <button class="view-detail" data-id="${book.id}">View Detail</button>
      </div>
    `;
    heroTrack.appendChild(slide);
  });

  // Slide navigation
  document.getElementById("slideLeft").addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + demoBooks.length) % demoBooks.length;
    heroTrack.style.transform = `translateX(-${currentSlide * 100}vw)`;
  });

  document.getElementById("slideRight").addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % demoBooks.length;
    heroTrack.style.transform = `translateX(-${currentSlide * 100}vw)`;
  });

  // Book modal
  let selectedBook = null;

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("view-detail")) {
      const bookId = parseInt(e.target.getAttribute("data-id"));
      const book = demoBooks.find(b => b.id === bookId);
      if (book) {
        selectedBook = book;
        document.getElementById("bookDetailImage").src = book.image;
        document.getElementById("bookDetailTitle").textContent = book.title;
        document.getElementById("bookDetailAuthor").textContent = "By " + book.author;
        document.getElementById("bookDetailPrice").textContent = "₹" + book.price;
        document.getElementById("bookDetailDesc").textContent = book.description;
        document.getElementById("bookDetailModal").classList.remove("hidden");
      }
    }
  });

  // Close modal
  document.getElementById("bookDetailClose").addEventListener("click", () => {
    document.getElementById("bookDetailModal").classList.add("hidden");
    selectedBook = null;
  });

  // Add to cart
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (!selectedBook) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(selectedBook);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${selectedBook.title} added to cart!`);
    document.getElementById("bookDetailModal").classList.add("hidden");
  });
});
