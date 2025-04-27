// Import Firebase SDK modules (with correct modular imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase configuration (replace with your own Firebase project config)
const firebaseConfig = {
  apiKey: "AIzaSyCXqN5XQsiAh3F0VIFHpVjEspF3qS6wIVY",
  authDomain: "eatitude-blog.firebaseapp.com",
  projectId: "eatitude-blog",
  storageBucket: "eatitude-blog.firebasestorage.app",
  messagingSenderId: "197542075676",
  appId: "1:197542075676:web:f19433b0178c7f7a6beed9",
  measurementId: "G-J1VH0TXD2V"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mobile Navigation 



// Select the blog container in the DOM
const blogContainer = document.querySelector(".blog-container");

// Function to load the latest blogs
async function loadLatestBlogs() {
  const blogQuery = query(
    collection(db, "blogs"),
    orderBy("date", "desc"),
    limit(3)
  );

  // Get documents from Firestore and map them to a blog array
  const snapshot = await getDocs(blogQuery);
  const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Clear the blog container before loading new posts
  blogContainer.innerHTML = "";

  // Iterate over each blog and render it to the page
  blogs.forEach(blog => {
    const firstCategory = blog.categories?.[0] || "General";  // Display the first category
    const formattedDate = new Date(blog.date.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });

    const blogCard = `
      <div class="blog-post">
        <span class="category">${firstCategory}</span>
        <div class="blog-img">
          <img src="${blog.image}" alt="${blog.title}" />
        </div>
        <div class="blog-content">
          <h1>${blog.title}</h1>
          <p>${stripHTML(blog.content).slice(0, 120)}...</p>
          <hr>
          <div class="blog-date">
            <span>${formattedDate}</span>
            <a href="blog-article.html?id=${blog.id}">Read More..</a>
          </div>
        </div>
      </div>
    `;

    // Add the blog card to the container
    blogContainer.insertAdjacentHTML("beforeend", blogCard);
  });
}

// Function to strip HTML tags from content
function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// Load the latest blogs when the page is ready
loadLatestBlogs();


// Function to load blog posts for each category on the home page
async function loadBlogPosts(category, containerId) {
  const blogContainer = document.getElementById(containerId);

  // Check if container exists
  if (!blogContainer) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  // Query Firestore for posts that match the category
  const querySnapshot = await getDocs(
    query(
      collection(db, 'blogs'),
      where('categories', 'array-contains', category),
      orderBy('date', 'desc'),
      limit(3)
    )
  );

  // Log for debugging


  // Iterate over the snapshot and render blog posts
  querySnapshot.forEach((doc) => {
    const blog = doc.data();
    const blogCard = `
      <div class="blog-post">
          <span class="category">${blog.categories.join(', ')}</span>  <!-- Display all categories -->
          <div class="blog-img">
              <img src="${blog.image}" alt="${blog.title}" />
          </div>
          <div class="blog-content">
              <h1>${blog.title}</h1>
              <p>${stripHTML(blog.content).slice(0, 120)}...</p>
              <hr />
              <div class="blog-date">
                  <span>${new Date(blog.date.seconds * 1000).toLocaleDateString()}</span>
                  <a href="blog-article.html?id=${doc.id}">Read More..</a>
              </div>
          </div>
      </div>
    `;
    blogContainer.innerHTML += blogCard;
  });
}
document.addEventListener('DOMContentLoaded', () => {
  // For the main index.html page
  const mainBlogContainer = document.querySelector(".blog-container");
  if (mainBlogContainer) {
    loadLatestBlogs();
  }
  
  // For the blogs.html page
  if (document.getElementById('latest-blogs-container')) {
    loadBlogPosts('Latest', 'latest-blogs-container');
    loadBlogPosts('Trending', 'trending-blogs-container');
    loadBlogPosts('How-to', 'how-to-blogs-container');
    loadBlogPosts('Marketing', 'marketing-blogs-container');
    loadBlogPosts('Success Stories', 'success-blogs-container');
  }
});

async function loadBlogArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId) {
    document.querySelector('.blog-article').innerHTML = '<p>Blog not found.</p>';
    return;
  }

  try {
    const blogRef = doc(db, "blogs", blogId);
    const blogSnapshot = await getDoc(blogRef);

    if (!blogSnapshot.exists()) {
      document.querySelector('.blog-article').innerHTML = '<p>Blog not found.</p>';
      return;
    }

    const blogData = blogSnapshot.data();
    const currentBlogDate = blogData.date;

    // --- Get previous blog (older date)
    const prevQuery = query(
      collection(db, "blogs"),
      where("date", "<", currentBlogDate),
      orderBy("date", "desc"),
      limit(1)
    );
    const prevSnapshot = await getDocs(prevQuery);
    const prevBlog = prevSnapshot.docs[0]?.id;

    // --- Get next blog (newer date)
    const nextQuery = query(
      collection(db, "blogs"),
      where("date", ">", currentBlogDate),
      orderBy("date", "asc"),
      limit(1)
    );
    const nextSnapshot = await getDocs(nextQuery);
    const nextBlog = nextSnapshot.docs[0]?.id;

    const formattedDate = new Date(blogData.date.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });

    const articleContainer = document.querySelector('.blog-article');
    articleContainer.innerHTML = `
      <h1>${blogData.title}</h1>
      <h6>${formattedDate}</h6>
      <div class="blog-image">
          <img src="${blogData.image}" alt="${blogData.title}">
      </div>
      <h2>${blogData.subtitle || ""}</h2>
      <div class="blog-content">${blogData.content}</div>

      <div class="blog-navigation">
          <a href="${prevBlog ? `blog-article.html?id=${prevBlog}` : '#'}">${prevBlog ? 'Previous Post' : 'No Previous Post'}</a>
          <a href="blogs.html">Home</a>
          <a href="${nextBlog ? `blog-article.html?id=${nextBlog}` : '#'}">${nextBlog ? 'Next Post' : 'No Next Post'}</a>
      </div>

      <div class="blog-cta">
          <h3>Want results like this? Whether you're just starting out or looking to scale, Eatitude helps F&B brands turn ideas into profitable, well-oiled businesses. Let's build your success story.</h3>
          <div class="blog-cta-btn">
              <button><a href="contact.html">Contact Us</a></button>
          </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading blog article: ", error);
    document.querySelector('.blog-article').innerHTML = '<p>Error loading the article.</p>';
  }
}


// Load the blog article when the page loads
if (window.location.pathname.includes("blog-article.html")) {
  document.addEventListener("DOMContentLoaded", loadBlogArticle);
}


// ------------------------------------------------------Testimonials--------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Swiper for testimonials
  const testimonialSwiper = new Swiper(".testimonialSwiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      grabCursor: true,
      pagination: {
          el: ".swiper-pagination",
          clickable: true,
      },
      touchRatio: 1,
      touchAngle: 45,
      resistance: true,
      resistanceRatio: 0.85,
      autoplay: { delay: 3000, disableOnInteraction: false },
  });
});

// Popup window + sending the data to google sheets.

//https://script.google.com/macros/s/AKfycbwC2RyHwfTVSjb_iPbIbZe7TFLLk-jYWio0u6QUkRSh7765ffsVt9PIZOtusCdg4YLr/exec
//https://script.google.com/macros/s/AKfycbwC2RyHwfTVSjb_iPbIbZe7TFLLk-jYWio0u6QUkRSh7765ffsVt9PIZOtusCdg4YLr/exec


// Wait for DOM to load before binding events
// Inside your DOMContentLoaded in app.js
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById("applicationPopup");
  const openPopupBtn = document.querySelectorAll(".open-popup");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const getStartedBtn = document.getElementById("getStartedBtn");

  function togglePopup(forceState) {
    popup.style.display = forceState || (popup.style.display === "flex" ? "none" : "flex");
  }

  openPopupBtn.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      togglePopup("flex");
    });
  });

  closePopupBtn.addEventListener("click", () => {
    togglePopup("none");
  });

  const webhookURL = "https://script.google.com/macros/s/AKfycbwC2RyHwfTVSjb_iPbIbZe7TFLLk-jYWio0u6QUkRSh7765ffsVt9PIZOtusCdg4YLr/exec"; 

  getStartedBtn.addEventListener("click", async () => {
    const name = document.getElementById("appName").value.trim();
    const email = document.getElementById("appEmail").value.trim();
    const phone = document.getElementById("appPhone").value.trim();
    const city = document.getElementById("appCity").value.trim();
    const source = document.getElementById("appSource").value.trim();
    const errorMsg = document.getElementById("popupError");
    const loadingMsg = document.getElementById("popupLoading");

    // Save to localStorage to use it in calendly to autofill details
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);


    if (!name || !email || !phone || !city || !source) {
      errorMsg.style.display = "block";
      return;
    }

    errorMsg.style.display = "none";
    loadingMsg.style.display = "block";

    const uniqueID = Date.now().toString() + Math.floor(Math.random() * 1000);

    const formData = {
      type: "popup",
      uniqueID,
      name,
      email,
      phone,
      city,
      source
    };

    try {
      const response = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        mode: "no-cors"
      });
    
      localStorage.setItem("applicationUniqueID", uniqueID);
      window.location.href = "funnel.html"; // ✅ redirect no matter what
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network error. Please try again later!");
    }
    
  });
});

  // When the website goes live, turn this on !

  // fetch(webhookURL, {
  //   method: "POST",
  //   body: JSON.stringify(formData),
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   mode: "no-cors"
  // })
  // .then(data => {
  //   if (data.status === "success") {
  //     console.log("Form submitted successfully!");
  //     localStorage.setItem("appData", JSON.stringify(formData));
  //     window.location.href = "funnel.html"; // Fast redirect
  //   } else {
  //     console.error("Submission failed:", data.message);
  //   }
  // })
  // .catch(error => {
  //   console.error("Error submitting form:", error);
  // });

// code for newsletter !
document.addEventListener('DOMContentLoaded', function() {
  const subscribeNewsletterButton = document.getElementById('subscribeNewsletter');

  if (subscribeNewsletterButton) {
    subscribeNewsletterButton.addEventListener('click', function() {
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput.value.trim();

      if (!email) {
        alert('Please enter a valid email address!');
        return;
      }

      const data = {
        type: "newsletter",
        email: email
      };

      const webhookURL = "https://script.google.com/macros/s/AKfycbz3m4meWjOfEjp_3DUCqFMCrFIENoyKtQcCLANYQDO5LqpZq1xUdhLSZcgEAJGW_lFOAA/exec";

      // ✅ 1. Instantly clear the input
      emailInput.value = '';

      // ✅ 2. Instantly replace input-wrapper content
      const inputWrapper = document.querySelector('.input-wrapper');
      inputWrapper.innerHTML = `
        <p style="font-size: 1rem; margin-top:14px; font-weight: 600;">Thank you! You are subscribed.</p>
      `;

      // ✅ 3. Now silently send data to Google Sheets
      fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        mode: "no-cors"
      })
      .catch(error => {
        console.error("Error subscribing to newsletter:", error);
        // Optional: Show error if needed, but usually not necessary because it's just background
      });
    });
  }
});

// footer newsletter signup

document.addEventListener('DOMContentLoaded', function() {
  const footerNewsletterButton = document.getElementById('footerNewsletterButton');

  if (footerNewsletterButton) {
    footerNewsletterButton.addEventListener('click', function() {
      const email = document.getElementById('footerNewsletterEmail').value.trim();

      if (!email) {
        alert('Please enter a valid email address!');
        return;
      }

      const data = {
        type: "newsletter",
        email: email
      };

      const webhookURL = "https://script.google.com/macros/s/AKfycbz3m4meWjOfEjp_3DUCqFMCrFIENoyKtQcCLANYQDO5LqpZq1xUdhLSZcgEAJGW_lFOAA/exec";

      fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        mode: "no-cors"
      });

      document.getElementById('footerNewsletterEmail').value = '';
      footerNewsletterButton.innerText = 'Subscribed ✅';
      setTimeout(() => {
        footerNewsletterButton.innerText = 'Subscribe';
      }, 4000);
    });
  }
});

