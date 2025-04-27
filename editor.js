import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXqN5XQsiAh3F0VIFHpVjEspF3qS6wIVY",
  authDomain: "eatitude-blog.firebaseapp.com",
  projectId: "eatitude-blog",
  storageBucket: "eatitude-blog.firebasestorage.app",
  messagingSenderId: "197542075676",
  appId: "1:197542075676:web:f19433b0178c7f7a6beed9",
  measurementId: "G-J1VH0TXD2V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const quill = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write your blog here...',
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }
});

const imageInput = document.getElementById("imageUpload");
const previewImage = document.getElementById("imagePreview");
const uploadLabel = document.querySelector(".upload-label");

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      previewImage.src = reader.result;
      previewImage.style.display = "block";
      uploadLabel.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection();
      quill.insertEmbed(range.index, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };
}

document.getElementById("postBtn").addEventListener("click", async () => {
  const title = document.getElementById("titleInput").value.trim();
  const image = document.getElementById("imagePreview").src;
  const date = new Date(document.getElementById("dateInput").value);
  const categories = document.getElementById("categoriesInput").value.split(',').map(cat => cat.trim());
  const content = quill.root.innerHTML;

  if (!title || !image || !content || !categories.length || isNaN(date.getTime())) {
    alert("Please fill all fields properly.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "blogs"), {
      title,
      image,
      content,
      date: Timestamp.fromDate(date),
      categories
    });

    alert("Blog posted successfully!");
    document.getElementById("titleInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("categoriesInput").value = "";
    quill.setContents([]);
    previewImage.src = "";
    previewImage.style.display = "none";
    uploadLabel.style.display = "block";
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to post blog.");
  }
});
