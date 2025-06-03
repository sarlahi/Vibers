const chatContainer = document.querySelector('.chat-container');
const chatBox = document.getElementById('chat');
const modeToggle = document.getElementById('modeToggle');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const senderSelect = document.getElementById('senderSelect');

const emojis = ['😀', '😂', '😍', '👍', '🙏', '😎', '🔥', '🥳', '🤔', '😢', '🎉', '💬'];

let chatData = []; // Will hold all messages as objects {id, sender, text, reactions}

// Generate unique ID for messages
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Save chatData to localStorage
function saveChat() {
  localStorage.setItem('chatData', JSON.stringify(chatData));
}

// Load chatData from localStorage
function loadChat() {
  const saved = localStorage.getItem('chatData');
  if (saved) {
    chatData = JSON.parse(saved);
    chatData.forEach(msg => {
      const msgEl = createMessageElement(msg);
      chatBox.appendChild(msgEl);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Create message DOM element from message object
function createMessageElement(msgObj) {
  const { id, sender, text, reactions = {} } = msgObj;
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.dataset.id = id;

  // Text container
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  msg.appendChild(textSpan);

  // Actions container (edit, delete)
  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('msg-actions');

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.title = 'Edit message';
  editBtn.addEventListener('click', () => startEditMessage(msg));
  actionsDiv.appendChild(editBtn);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑️';
  delBtn.title = 'Delete message';
  delBtn.addEventListener('click', () => deleteMessage(msg));
  actionsDiv.appendChild(delBtn);

  msg.appendChild(actionsDiv);

  // Reactions container
  const reactionsDiv = document.createElement('div');
  reactionsDiv.classList.add('reactions');

  emojis.forEach((emoji) => {
    const btn = document.createElement('span');
    btn.classList.add('reaction-btn');
    btn.textContent = emoji;
    btn.title = `React with ${emoji}`;
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', 0);

    btn.addEventListener('click', () => {
      addReaction(msg, emoji);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        addReaction(msg, emoji);
      }
    });

    reactionsDiv.appendChild(btn);
  });

  msg.appendChild(reactionsDiv);

  // Reaction summary container
  const reactionSummary = document.createElement('div');
  reactionSummary.classList.add('reaction-summary');
  reactionSummary.style.marginTop = '5px';
  reactionSummary.style.fontSize = '14px';
  reactionSummary.style.color = '#555';
  msg.appendChild(reactionSummary);

  // Show existing reactions if any
  msg.reactions = { ...reactions };
  updateReactionSummary(msg);

  return msg;
}

// Add reaction to message and save
function addReaction(msgEl, emoji) {
  if (!msgEl.reactions) {
    msgEl.reactions = {};
  }
  msgEl.reactions[emoji] = (msgEl.reactions[emoji] || 0) + 1;

  updateReactionSummary(msgEl);

  // Update in chatData and save
  const id = msgEl.dataset.id;
  const msgData = chatData.find(m => m.id === id);
  if (msgData) {
    msgData.reactions = { ...msgEl.reactions };
    saveChat();
  }
}

// Update reaction summary UI
function updateReactionSummary(msgEl) {
  const summary = [];
  for (const [emoji, count] of Object.entries(msgEl.reactions)) {
    summary.push(`${emoji} ${count}`);
  }
  const reactionSummaryDiv = msgEl.querySelector('.reaction-summary');
  reactionSummaryDiv.textContent = summary.join('  ');
}

// Send new message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const sender = senderSelect.value;
  const id = generateId();
  const msgObj = { id, sender, text, reactions: {} };
  chatData.push(msgObj);

  const msgEl = createMessageElement(msgObj);
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  messageInput.value = '';
  hideEmojiPicker();

  saveChat();
}

// Start editing a message
function startEditMessage(msgEl) {
  const id = msgEl.dataset.id;
  const msgData = chatData.find(m => m.id === id);
  if (!msgData) return;

  // Hide existing content and show input + save/cancel buttons
  msgEl.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = msgData.text;
  input.style.width = '80%';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => saveEditMessage(msgEl, input.value));

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => cancelEditMessage(msgEl, msgData));

  msgEl.appendChild(input);
  msgEl.appendChild(saveBtn);
  msgEl.appendChild(cancelBtn);

  input.focus();
  input.select();
}

// Save edited message
function saveEditMessage(msgEl, newText) {
  const id = msgEl.dataset.id;
  const msgData = chatData.find(m => m.id === id);
  if (!msgData) return;

  newText = newText.trim();
  if (newText === '') {
    alert('Message cannot be empty.');
    return;
  }

  msgData.text = newText;
  saveChat();

  // Re-render the message element to normal
  const newMsgEl = createMessageElement(msgData);
  chatBox.replaceChild(newMsgEl, msgEl);
}

// Cancel editing, revert message
function cancelEditMessage(msgEl, msgData) {
  const newMsgEl = createMessageElement(msgData);
  chatBox.replaceChild(newMsgEl, msgEl);
}

// Delete message
function deleteMessage(msgEl) {
  const id = msgEl.dataset.id;
  chatData = chatData.filter(m => m.id !== id);
  chatBox.removeChild(msgEl);
  saveChat();
}

// Dark mode toggle inside chat container
function toggleDarkMode() {
  chatContainer.classList.toggle('dark');
  modeToggle.textContent = chatContainer.classList.contains('dark') ? '☀️' : '🌙';
}

// Emoji picker show/hide and insert
function showEmojiPicker() {
  emojiPicker.innerHTML = '';
  emojis.forEach((emoji) => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', 0);
    span.title = `Insert emoji ${emoji}`;
    span.addEventListener('click', () => {
      messageInput.value += emoji;
      messageInput.focus();
      hideEmojiPicker();
    });
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        messageInput.value += emoji;
        messageInput.focus();
        hideEmojiPicker();
      }
    });
    emojiPicker.appendChild(span);
  });

  emojiPicker.style.display = 'block';
}

function hideEmojiPicker() {
  emojiPicker.style.display = 'none';
}

// Event listeners
modeToggle.addEventListener('click', toggleDarkMode);

emojiBtn.addEventListener('click', () => {
  if (emojiPicker.style.display === 'block') {
    hideEmojiPicker();
  } else {
    showEmojiPicker();
  }
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !emojiPicker.contains(document.activeElement)) {
    e.preventDefault();
    sendMessage();
  }
});

document.addEventListener('click', (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    hideEmojiPicker();
  }
});
sendBtn.addEventListener('click', () => {
  // your existing send logic...

  // After sending, shrink input box:
  messageInput.classList.add('shrink');
  messageInput.value = ''; // clear input
  messageInput.blur(); // optional, removes focus

  // Optionally, you can expand input again when user focuses:
  messageInput.addEventListener('focus', () => {
    messageInput.classList.remove('shrink');
  });
});
// After rendering messages or on page load, attach click handlers to messages
document.addEventListener('click', function (event) {
  const message = event.target.closest('.message');
  if (!message) return;

  // Find the actions container inside this message
  const actions = message.querySelector('.msg-actions');
  if (!actions) return;

  // Toggle display for this message's actions
  const isVisible = actions.style.display === 'block';

  // First, hide all other msg-actions on the page
  document.querySelectorAll('.msg-actions').forEach(el => {
    el.style.display = 'none';
  });

  // Toggle the clicked message's actions
  actions.style.display = isVisible ? 'none' : 'block';
});




// Load chat history on page load
loadChat();