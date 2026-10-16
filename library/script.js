// The same idea as your Python Library class,
// written in JavaScript so the page can use it.

let books = [
  { title: "Wings of Fire", author: "Kalam", copies: 2 },
  { title: "The Alchemist", author: "Coelho", copies: 1 },
  { title: "Ikigai", author: "Garcia", copies: 4 }
];

// ---- show a short message under the form ----
function showMessage(text) {
  document.getElementById("status").textContent = text;
}

// ---- find a book, ignoring capital letters ----
function findBook(title) {
  for (let b of books) {
    if (b.title.toLowerCase() === title.toLowerCase()) {
      return b;
    }
  }
  return null;
}

// ---- add a book (same merge rule as your Python add_book) ----
function addBook(event) {
  event.preventDefault();   // stop the form from reloading the page

  const title = document.getElementById("t").value.trim();
  const author = document.getElementById("a").value.trim();
  const copies = Number(document.getElementById("c").value);

  if (title === "" || author === "") {
    showMessage("Please fill in the title and the author.");
    return;
  }
  if (!Number.isInteger(copies) || copies < 1) {
    showMessage("Copies must be a whole number, 1 or more.");
    return;
  }

  const existing = findBook(title);
  if (existing) {
    existing.copies = existing.copies + copies;
    showMessage("Added " + copies + " more of " + existing.title + ".");
  } else {
    books.push({ title: title, author: author, copies: copies });
    showMessage("Added " + title + " to the shelf.");
  }

  document.getElementById("t").value = "";
  document.getElementById("a").value = "";
  document.getElementById("c").value = 1;
  draw();
  document.getElementById("t").focus();   // ready for the next book
}

// ---- borrow and return ----
function borrow(title) {
  const b = findBook(title);
  if (b.copies > 0) {
    b.copies = b.copies - 1;
    showMessage("You borrowed " + b.title + ". " + b.copies + " left.");
  } else {
    showMessage("Sorry, no copies of " + b.title + " are on the shelf.");
  }
  draw();
  refocus(title, "Borrow");
}

function returnBook(title) {
  const b = findBook(title);
  b.copies = b.copies + 1;
  showMessage("You returned " + b.title + ". " + b.copies + " on the shelf.");
  draw();
  refocus(title, "Return");
}

// ---- make one button for a book card ----
function makeButton(label, title, whatToDo) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.dataset.title = title;
  btn.dataset.label = label;
  btn.setAttribute("aria-label", label + " " + title);
  btn.onclick = function () { whatToDo(title); };
  if (label === "Return") { btn.className = "plain"; }
  return btn;
}

// ---- draw() rebuilds the shelf, so put the keyboard focus back ----
function refocus(title, label) {
  for (let btn of document.querySelectorAll("#shelf button")) {
    if (btn.dataset.title === title && btn.dataset.label === label) {
      btn.focus();
    }
  }
}

// ---- put everything on the screen ----
function draw() {
  const shelf = document.getElementById("shelf");
  shelf.innerHTML = "";
  let totalCopies = 0;

  for (let b of books) {
    totalCopies = totalCopies + b.copies;

    const card = document.createElement("div");
    card.className = "book";

    // textContent (not innerHTML) so titles like "Harry's Book" cannot break the page
    const heading = document.createElement("h3");
    heading.textContent = b.title;

    const author = document.createElement("p");
    author.className = "author";
    author.textContent = "by " + b.author;

    const count = document.createElement("p");
    count.className = b.copies === 0 ? "count out" : "count";
    count.textContent = b.copies === 0 ? "None available" : b.copies + " available";

    card.appendChild(heading);
    card.appendChild(author);
    card.appendChild(count);
    card.appendChild(makeButton("Borrow", b.title, borrow));
    card.appendChild(makeButton("Return", b.title, returnBook));
    shelf.appendChild(card);
  }

  document.getElementById("titleCount").textContent = books.length;
  document.getElementById("copyCount").textContent = totalCopies;
}

// draw once when the page opens
draw();
