import "modern-normalize/modern-normalize.css";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCVZZ-ouV2hdiE9vqhsBml1UIMEkmhjvkk",
  authDomain: "fir-practice-87e21.firebaseapp.com",
  databaseURL: "https://fir-practice-87e21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-practice-87e21",
  storageBucket: "fir-practice-87e21.appspot.com",
  messagingSenderId: "675483683705",
  appId: "1:675483683705:web:4e4022bdf348b5e1297da8",
  measurementId: "G-M6KW0W97E2",
};

initializeApp(firebaseConfig);

const db = getFirestore();
const auth = getAuth();

const colRef = collection(db, "users");

getDocs(colRef)
  .then((snapshot) => {
    const users = [];

    snapshot.docs.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id });
    });

    // console.log(users);
  })
  .catch((err) => {
    console.log(err);
  });

//
//
//
//
//
// Fetch
const categoriesDisplay = document.querySelector("#categories");
const booksDisplay = document.querySelector("#books-display");
const modal = document.querySelector("#modal");

const loader = document.getElementById("loaderContainer");

const showLoader = () => {
  loader.classList.remove("fade-out");
  loader.classList.add("fade-in");
};

const disableLoader = () => {
  loader.classList.remove("fade-in");
  loader.classList.add("fade-out");
};

disableLoader();

const fetchAllCategories = () => {
  const url = "https://books-backend.p.goit.global/books/category-list";

  axios.get(url).then((res) => {
    const categories = res.data;
    const categoriesToRender = [];

    categories.forEach((category) => {
      const li = document.createElement("li");

      const id = category.list_name.toLowerCase().replace(/\s+/g, "-");
      li.setAttribute("id", id);

      const link = document.createElement("a");
      link.textContent = category.list_name;

      li.append(link);

      categoriesToRender.push(li);
    });

    categoriesDisplay.append(...categoriesToRender);
  });
};

const fetchCategory = (categoryName) => {
  showLoader();

  const url = `https://books-backend.p.goit.global/books/category?category=${categoryName}`;

  axios
    .get(url)
    .then((res) => {
      booksDisplay.innerHTML = "";
      const data = res.data;
      const cardsToRender = [];
      data.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("book-card");
        card.setAttribute("id", item._id);

        const title = document.createElement("h2");
        title.textContent = item.title;

        const img = document.createElement("img");
        img.setAttribute("src", item.book_image);

        card.append(img, title);
        cardsToRender.push(card);
      });

      booksDisplay.append(...cardsToRender);
    })
    .finally(() => {
      disableLoader();
    });
};

const fetchBookByID = (id) => {
  showLoader();

  const url = `https://books-backend.p.goit.global/books/${id}`;

  return axios
    .get(url)
    .then((res) => {
      return res.data;
    })
    .finally(() => {
      disableLoader();
    });
};

fetchAllCategories();

categoriesDisplay.addEventListener("click", (e) => {
  const linkElement = e.target.closest("li");

  if (linkElement) {
    const categoryName = linkElement.textContent;

    fetchCategory(categoryName);
  }
});

booksDisplay.addEventListener("click", async (e) => {
  document.body.style.overflow = "hidden";
  const modalDisplay = modal.firstElementChild;
  const id = e.target.closest(".book-card").id;
  const data = await fetchBookByID(id);
  const { author, title, description, book_image, amazon_product_url } = data;

  modal.classList.add("book-modal");
  const img = document.createElement("img");
  img.setAttribute("src", book_image);

  const bookTitle = document.createElement("h2");
  bookTitle.textContent = title;

  const bookAuthor = document.createElement("h3");
  bookAuthor.textContent = author;

  const bookDesc = document.createElement("p");
  bookDesc.textContent = description;

  const amazonURL = document.createElement("a");
  amazonURL.textContent = "Amazon";
  amazonURL.setAttribute("href", amazon_product_url);

  const addToShoppingListButton = document.createElement("button");

  const addToShoppingList = () => {
    console.log(author, title, description, book_image, amazon_product_url);
  };
  addToShoppingListButton.textContent = "Add to Shopping List";

  addToShoppingListButton.addEventListener("click", addToShoppingList);

  const closeButtton = document.createElement("button");
  const closeModal = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
    modalDisplay.innerHTML = "";

    closeButtton.removeEventListener("click", closeModal);
    addToShoppingListButton.removeEventListener("click", addToShoppingList);
  };

  closeButtton.textContent = "X";
  closeButtton.classList.add("modal-close-btn");
  closeButtton.addEventListener("click", closeModal);

  modal.classList.toggle("hidden");
  modalDisplay.append(img, bookTitle, bookAuthor, bookDesc, amazonURL, addToShoppingListButton, closeButtton);
});

//Login

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const usernameDisplay = document.querySelector("#username-display");

const loginBtn = document.querySelector("#login");
const logoutBtn = document.querySelector("#logout");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log(e.target.name.value);
  console.log(e.target.email.value);
  console.log(e.target.password.value);

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      cred.user.displayName = name;

      console.log("user created", cred.user);

      registerForm.reset();
    })
    .catch((err) => alert(err));
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log(cred.user, "Logged in");
    })
    .catch((err) => {
      alert(err);
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
      usernameDisplay.textContent = "";
    })
    .catch((err) => {
      alert(err);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user);
    usernameDisplay.textContent = `Welcome ${user.email}`;
  }
});
