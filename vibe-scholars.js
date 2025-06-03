const LOCAL_KEY = 'vibehive_posts';
const CURRENT_USER = 'CurrentUser';

const emojiReactions = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'care', emoji: '🤗', label: 'Care' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
];

// Load posts from localStorage or empty
let posts = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];

const feedEl = document.getElementById('feed');
const postBtn = document.getElementById('postBtn');
const newPostContent = document.getElementById('newPostContent');
const newPostMedia = document.getElementById('newPostMedia');

function savePosts() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString();
}

function createReactionButton(postOrComment, reactionType, isComment = false, commentIndex = null) {
  const reactionData = emojiReactions.find((r) => r.type === reactionType);
  const btn = document.createElement('button');
  btn.classList.add('reaction-btn');
  if (isReactionActive(postOrComment, reactionType)) {
    btn.classList.add('active');
  }
  btn.title = reactionData.label;
  btn.textContent = reactionData.emoji;

  btn.onclick = () => {
    toggleReaction(postOrComment, reactionType, isComment, commentIndex);
  };

  return btn;
}

function isReactionActive(postOrComment, reactionType) {
  return postOrComment.reactions?.includes(reactionType);
}

function toggleReaction(postOrComment, reactionType, isComment = false, commentIndex = null) {
  let reactions = postOrComment.reactions || [];
  if (reactions.includes(reactionType)) {
    reactions = reactions.filter((r) => r !== reactionType);
  } else {
    reactions.push(reactionType);
  }
  postOrComment.reactions = reactions;

  if (isComment && commentIndex !== null) {
    posts[postOrComment.postIndex].comments[commentIndex].reactions = reactions;
  } else if (!isComment) {
    posts[postOrComment.postIndex].reactions = reactions;
  }

  savePosts();
  renderFeed();
}

function renderReactionsSummary(reactions) {
  if (!reactions || reactions.length === 0) return '';
  // Count reaction types
  const counts = {};
  reactions.forEach((r) => (counts[r] = (counts[r] || 0) + 1));

  return Object.entries(counts)
    .map(([type, count]) => {
      const emoji = emojiReactions.find((e) => e.type === type)?.emoji || '';
      return `${emoji} ${count}`;
    })
    .join(' ');
}

// Create post card element
function createPostElement(post, index) {
  post.postIndex = index; // assign index for reaction toggling

  const card = document.createElement('article');
  card.classList.add('card');
  card.dataset.index = index;

  // Header
  const header = document.createElement('div');
  header.classList.add('post-header');
  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = post.authorAvatar || 'https://via.placeholder.com/45';
  avatar.alt = `${post.author} avatar`;

  const author = document.createElement('div');
  author.classList.add('post-author');
  author.textContent = post.author;

  const timestamp = document.createElement('time');
  timestamp.classList.add('timestamp');
  timestamp.textContent = formatTimestamp(post.timestamp);

  header.appendChild(avatar);
  header.appendChild(author);
  header.appendChild(timestamp);

  card.appendChild(header);

  // Content or edit textarea if editing
  let contentArea;
  if (post.isEditing) {
    contentArea = document.createElement('textarea');
    contentArea.classList.add('edit-textarea');
    contentArea.value = post.content;
  } else {
    contentArea = document.createElement('div');
    contentArea.classList.add('post-content');
    contentArea.textContent = post.content;
  }
  card.appendChild(contentArea);

  // Media
  if (post.media) {
    if (post.media.type.startsWith('image')) {
      const img = document.createElement('img');
      img.classList.add('post-media');
      img.src = post.media.data;
      card.appendChild(img);
    } else if (post.media.type.startsWith('video')) {
      const video = document.createElement('video');
      video.classList.add('post-media');
      video.controls = true;
      video.src = post.media.data;
      card.appendChild(video);
    }
  }

  // Reaction bar
  const reactionBar = document.createElement('div');
  reactionBar.classList.add('reaction-bar');

  emojiReactions.forEach(({ type, emoji, label }) => {
    const btn = document.createElement('button');
    btn.title = label;
    btn.textContent = emoji;

    if (post.reactions?.includes(type)) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      toggleReaction(post, type);
    });

    reactionBar.appendChild(btn);
  });

  card.appendChild(reactionBar);

  // Show reaction summary
  const reactionSummary = document.createElement('div');
  reactionSummary.classList.add('reaction-count');
  reactionSummary.textContent = renderReactionsSummary(post.reactions);
  card.appendChild(reactionSummary);

  // Post actions (edit/delete if author is current user)
  if (post.author === CURRENT_USER) {
    const actions = document.createElement('div');
    actions.classList.add('post-actions');

    if (!post.isEditing) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => {
        posts[index].isEditing = true;
        renderFeed();
      };
      actions.appendChild(editBtn);
    }

    if (post.isEditing) {
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.onclick = () => {
        const updatedText = contentArea.value.trim();
        if (!updatedText) {
          alert('Post content cannot be empty.');
          return;
        }
        posts[index].content = updatedText;
        posts[index].isEditing = false;
        savePosts();
        renderFeed();
      };
      actions.appendChild(saveBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = () => {
        posts[index].isEditing = false;
        renderFeed();
      };
      actions.appendChild(cancelBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      if (confirm('Delete this post?')) {
        posts.splice(index, 1);
        savePosts();
        renderFeed();
      }
    };
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
  }

  // Comments section
  const commentsSection = document.createElement('section');
  commentsSection.classList.add('comments-section');

  // Existing comments
  post.comments?.forEach((comment, cIndex) => {
    comment.postIndex = index; // for reaction toggle

    const commentEl = document.createElement('div');
    commentEl.classList.add('comment');

    const commentHeader = document.createElement('div');
    commentHeader.classList.add('comment-header');
    commentHeader.textContent = comment.author;

    const commentTime = document.createElement('time');
    commentTime.classList.add('timestamp');
    commentTime.textContent = formatTimestamp(comment.timestamp);
    commentHeader.appendChild(commentTime);

    commentEl.appendChild(commentHeader);

    // Content or editing
    let commentContentEl;
    if (comment.isEditing) {
      commentContentEl = document.createElement('textarea');
      commentContentEl.classList.add('edit-textarea');
      commentContentEl.value = comment.content;
    } else {
      commentContentEl = document.createElement('div');
      commentContentEl.classList.add('comment-content');
      commentContentEl.textContent = comment.content;
    }
    commentEl.appendChild(commentContentEl);

    // Comment reaction buttons
    const commentReactionBar = document.createElement('div');
    commentReactionBar.classList.add('comment-reactions');
    emojiReactions.forEach(({ type, emoji, label }) => {
      const btn = document.createElement('button');
      btn.title = label;
      btn.textContent = emoji;
      if (comment.reactions?.includes(type)) {
        btn.classList.add('active');
      }
      btn.onclick = () => {
        toggleCommentReaction(index, cIndex, type);
      };
      commentReactionBar.appendChild(btn);
    });
    commentEl.appendChild(commentReactionBar);

    // Comment action buttons for current user's comments
    if (comment.author === CURRENT_USER) {
      const commentActions = document.createElement('div');
      commentActions.classList.add('comment-actions');

      if (!comment.isEditing) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
          posts[index].comments[cIndex].isEditing = true;
          renderFeed();
        };
        commentActions.appendChild(editBtn);
      }

      if (comment.isEditing) {
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => {
          const updatedText = commentContentEl.value.trim();
          if (!updatedText) {
            alert('Comment content cannot be empty.');
            return;
          }
          posts[index].comments[cIndex].content = updatedText;
          posts[index].comments[cIndex].isEditing = false;
          savePosts();
          renderFeed();
        };
        commentActions.appendChild(saveBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
          posts[index].comments[cIndex].isEditing = false;
          renderFeed();
        };
        commentActions.appendChild(cancelBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        if (confirm('Delete this comment?')) {
          posts[index].comments.splice(cIndex, 1);
          savePosts();
          renderFeed();
        }
      };
      commentActions.appendChild(deleteBtn);

      commentEl.appendChild(commentActions);
    }

    commentsSection.appendChild(commentEl);
  });

  // Add comment input
  const addCommentDiv = document.createElement('div');
  addCommentDiv.classList.add('add-comment');

  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.placeholder = 'Write a comment...';

  const commentBtn = document.createElement('button');
  commentBtn.textContent = 'Post';
  commentBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text) return alert('Comment cannot be empty.');
    if (!posts[index].comments) posts[index].comments = [];
    posts[index].comments.push({
      author: CURRENT_USER,
      content: text,
      timestamp: Date.now(),
      reactions: [],
    });
    savePosts();
    renderFeed();
  };

  addCommentDiv.appendChild(commentInput);
  addCommentDiv.appendChild(commentBtn);
  commentsSection.appendChild(addCommentDiv);

  card.appendChild(commentsSection);

  return card;
}

function toggleCommentReaction(postIndex, commentIndex, reactionType) {
  const comment = posts[postIndex].comments[commentIndex];
  const reactions = comment.reactions || [];
  if (reactions.includes(reactionType)) {
    comment.reactions = reactions.filter((r) => r !== reactionType);
  } else {
    reactions.push(reactionType);
    comment.reactions = reactions;
  }
  savePosts();
  renderFeed();
}

function renderFeed() {
  feedEl.innerHTML = '';
  posts.forEach((post, index) => {
    feedEl.appendChild(createPostElement(post, index));
  });
}

postBtn.addEventListener('click', () => {
  const content = newPostContent.value.trim();
  if (!content) return alert('Post content cannot be empty.');

  let media = null;
  const file = newPostMedia.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      media = {
        type: file.type,
        data: reader.result,
      };
      addPost(content, media);
    };
    reader.readAsDataURL(file);
  } else {
    addPost(content, null);
  }
});

function addPost(content, media) {
  posts.unshift({
    author: CURRENT_USER,
    authorAvatar: `https://i.pravatar.cc/45?u=${CURRENT_USER}`,
    content,
    media,
    timestamp: Date.now(),
    reactions: [],
    comments: [],
    isEditing: false,
  });
  savePosts();
  renderFeed();
  newPostContent.value = '';
  newPostMedia.value = '';
}

renderFeed();
