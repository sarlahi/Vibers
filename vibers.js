// Load existing data or initialize
let stories = JSON.parse(localStorage.getItem("stories") || "[]");
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let darkTheme = localStorage.getItem("darkTheme") === "true";
let reactedPostIds = JSON.parse(localStorage.getItem("reactedPostIds") || "[]");
let reactedStoryIds = JSON.parse(localStorage.getItem("reactedStoryIds") || "[]");

// Reaction options
const reactions = ["👍", "❤️", "😂", "😮"];

// Utility to initialize reaction counts
function initReactions() {
  const obj = {};
  for (const r of reactions) obj[r] = 0;
  return obj;
}

// Save to localStorage
function saveData() {
  localStorage.setItem("stories", JSON.stringify(stories));
  localStorage.setItem("posts", JSON.stringify(posts));
  localStorage.setItem("reactedPostIds", JSON.stringify(reactedPostIds));
  localStorage.setItem("reactedStoryIds", JSON.stringify(reactedStoryIds));
}

// Add Story
function addStory() {
  const user = document.getElementById("storyUser").value.trim();
  const text = document.getElementById("storyInput").value.trim();
  const imgInput = document.getElementById("storyImageInput");


  if (!user || (!text && imgInput.files.length === 0)) {
    alert("Please enter your name and some story text or image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    pushStory(user, text, reader.result);
  };

  if (imgInput.files.length) reader.readAsDataURL(imgInput.files[0]);
  else pushStory(user, text, "");
}

function pushStory(user, text, imgData) {
  stories.push({
    id: Date.now(),
    user,
    text,
    img: imgData,
    viewers: [],
    reactions: initReactions(),
    timestamp: Date.now(),
  });
  clearStoryInputs();
  saveData();
  renderStories();
}
function clearStoryInputs() {
  document.getElementById("storyUser").value = "";
  document.getElementById("storyInput").value = "";
  document.getElementById("storyImageInput").value = "";  // fix here!
}


// Add Post
function addPost() {
  const user = document.getElementById("postUser").value.trim();
  const text = document.getElementById("postInput").value.trim();
  const imgInput = document.getElementById("postImageInput");


  if (!user || (!text && imgInput.files.length === 0)) {
    alert("Please enter your name and some post text or image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    pushPost(user, text, reader.result);
  };

  if (imgInput.files.length) reader.readAsDataURL(imgInput.files[0]);
  else pushPost(user, text, "");
}

function pushPost(user, text, imgData) {
  posts.push({
    id: Date.now(),
    user,
    text,
    img: imgData,
    reactions: initReactions(),
    comments: [],
  });
  clearPostInputs();
  saveData();
  renderPosts();
}

function clearPostInputs() {
  document.getElementById("postUser").value = "";
  document.getElementById("postInput").value = "";
  document.getElementById("postImageInput").value = "";  // fix here!
}


// Render Stories
function renderStories() {
  const storyFeed = document.getElementById("storyFeed");
  storyFeed.innerHTML = "";

  const now = Date.now();
  stories = stories.filter((s) => now - s.timestamp < 24 * 3600 * 1000);

  for (const story of stories) {
    const storyEl = document.createElement("div");
    storyEl.className = "story";

    const imgHTML = story.img
      ? `<img src="${story.img}" alt="${story.user}">`
      : `<div class="image-container" style="font-weight:bold; font-size:28px; color:#cc0000;">${story.user[0].toUpperCase()}</div>`;

    storyEl.innerHTML = `
      <div class="image-container">${imgHTML}</div>
      <p>${escapeHtml(story.user)}</p>
      <div class="actions">
        ${reactions
        .map(
          (r) =>
            `<span data-id="${story.id}" data-reaction="${r}" style="cursor:pointer">${r} ${story.reactions[r] || 0}</span>`
        )
        .join("")}
      </div>
    `;

    // Viewer logic
    storyEl.querySelector(".image-container").addEventListener("click", () => {
      const viewer = prompt("Enter your name to view this story:");
      if (!viewer) return;
      if (!story.viewers.includes(viewer)) {
        story.viewers.push(viewer);
        alert(`Thanks ${viewer}, you viewed this story!`);
        saveData();
      } else {
        alert(`Welcome back, ${viewer}!`);
      }
    });

    // Reaction logic
    storyEl.querySelectorAll(".actions span").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (reactedStoryIds.includes(story.id)) {
          alert("You already reacted to this story.");
          return;
        }
        const reaction = btn.dataset.reaction;
        story.reactions[reaction] = (story.reactions[reaction] || 0) + 1;
        reactedStoryIds.push(story.id);
        saveData();
        renderStories();
      });
    });

    storyFeed.appendChild(storyEl);
  }
}

// Render Posts
function renderPosts() {
  const postFeed = document.getElementById("postFeed");
  postFeed.innerHTML = "";

  for (const post of posts) {
    const postEl = document.createElement("div");
    postEl.className = "post";

    const reactionButtons = reactions
      .map(
        (r) =>
          `<span data-id="${post.id}" data-reaction="${r}" style="cursor:pointer">${r} ${post.reactions[r] || 0}</span>`
      )
      .join("");

    const commentsHTML = post.comments
      .map(
        (c, i) =>
          `<div class="comment"><span>${escapeHtml(c)}</span> <button data-comment="${i}">Delete</button></div>`
      )
      .join("");

    postEl.innerHTML = `
      <strong>${escapeHtml(post.user)}</strong>
      <div class="post-text" style="white-space: pre-wrap;">${escapeHtml(post.text)}</div>
      ${post.img ? `<img src="${post.img}" alt="Post image" />` : ""}
      <div class="actions">${reactionButtons}</div>
      <div style="margin-top:10px;">
        <button class="edit-post">Edit</button>
        <button class="delete-post">Delete</button>
      </div>
      <div class="comment-section">
        <h4>Comments</h4>
        <div class="comments">${commentsHTML}</div>
        <input type="text" placeholder="Add comment" class="comment-input" />
        <button class="add-comment-btn">Add Comment</button>
      </div>
    `;

    // Reaction logic
    postEl.querySelectorAll(".actions span").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (reactedPostIds.includes(post.id)) {
          alert("You already reacted to this post.");
          return;
        }
        const reaction = btn.dataset.reaction;
        post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
        reactedPostIds.push(post.id);
        saveData();
        renderPosts();
      });
    });

    // Comment logic
    postEl.querySelector(".add-comment-btn").addEventListener("click", () => {
      const input = postEl.querySelector(".comment-input");
      const comment = input.value.trim();
      if (!comment) return alert("Comment cannot be empty.");
      post.comments.push(comment);
      saveData();
      renderPosts();
    });

    postEl.querySelectorAll(".comments button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.comment);
        post.comments.splice(index, 1);
        saveData();
        renderPosts();
      });
    });

    // Edit & Delete
    postEl.querySelector(".delete-post").addEventListener("click", () => {
      if (confirm("Delete this post?")) {
        posts = posts.filter((p) => p.id !== post.id);
        saveData();
        renderPosts();
      }
    });

    postEl.querySelector(".edit-post").addEventListener("click", () => {
      const textDiv = postEl.querySelector(".post-text");
      const imgEl = postEl.querySelector("img"); // optional, if image editing needed

      // Prevent multiple edit states
      if (postEl.querySelector("textarea")) return;

      // Create textarea for editing text
      const textarea = document.createElement("textarea");
      textarea.className = "post-editable";
      textarea.value = post.text;
      textarea.style.width = "100%";
      textarea.style.minHeight = "80px";

      // Replace text div with textarea
      textDiv.replaceWith(textarea);

      // Hide image if you want to allow editing image URL, or keep it as is
      // If you want image editing, you can create input element here.

      // Replace buttons with Save and Cancel
      const actionsDiv = postEl.querySelector("div:nth-child(4)"); // the div containing Edit/Delete buttons
      actionsDiv.innerHTML = "";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.marginLeft = "10px";

      actionsDiv.appendChild(saveBtn);
      actionsDiv.appendChild(cancelBtn);

      // Save handler
      saveBtn.addEventListener("click", () => {
        const newText = textarea.value.trim();
        if (!newText) {
          alert("Text cannot be empty.");
          return;
        }
        post.text = newText;
        saveData();
        renderPosts();
      });

      // Cancel handler
      cancelBtn.addEventListener("click", () => {
        renderPosts();
      });
    });

    postFeed.appendChild(postEl);
  }
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Dark Theme Toggle
const themeToggleBtn = document.getElementById("themeToggle");
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkTheme = document.body.classList.contains("dark");
  localStorage.setItem("darkTheme", darkTheme);
});
if (darkTheme) document.body.classList.add("dark");

// Friend Sidebar Toggle
const friendToggleBtn = document.getElementById("friendToggle");
const friendSidebar = document.getElementById("friendSidebar");
friendToggleBtn.addEventListener("click", () => {
  friendSidebar.classList.toggle("active");
});

// Initial render
renderStories();
renderPosts();

// Optional: Auto-refresh UI every 5 seconds
setInterval(() => {
  renderStories();
  renderPosts();
}, 5000);

