document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.createElement("button");

  chatButton.id = "chatbot-button";
  chatButton.innerHTML = `
  <i class="fa-regular fa-compass wanderlust-chat-logo"></i>
`;
  chatButton.title = "Wanderlust AI";

  document.body.appendChild(chatButton);

  const chatBox = document.createElement("div");

  chatBox.id = "chatbot-box";

  chatBox.innerHTML = `
  <div class="chatbot-header">
    <div>
      <strong>Wanderlust AI</strong>
      <small>Your travel assistant</small>
    </div>

    <div class="chatbot-header-actions">
      <button id="chatbot-chats" title="Previous chats">
        Chats
      </button>

      <button id="chatbot-new" title="Start a new chat">
        + New Chat
      </button>

      <button id="chatbot-close">&times;</button>
    </div>
  </div>

  <div id="chatbot-history-panel" class="chatbot-history-panel">
    <div class="chatbot-history-title">
      <strong>Recent Chats</strong>
      <button id="chatbot-history-close">&times;</button>
    </div>

    <div id="chatbot-saved-chats" class="chatbot-saved-chats">
      <div class="chatbot-history-empty">
        No previous chats yet.
      </div>
    </div>
  </div>

  <div id="chatbot-messages" class="chatbot-messages"></div>

  <div class="chatbot-input-area">
    <input
      type="text"
      id="chatbot-input"
      placeholder="Ask me anything..."
      autocomplete="off"
    />

    <button id="chatbot-send">
      <i class="fa-solid fa-paper-plane"></i>
    </button>
  </div>

  <div id="new-chat-modal" class="new-chat-modal">
  <div class="new-chat-modal-content">

    <button id="new-chat-modal-close" class="new-chat-modal-close">
      &times;
    </button>

    <div class="new-chat-modal-icon">
      <i class="fa-regular fa-compass"></i>
    </div>

    <h3>Start a new chat?</h3>

    <p>
      Your current conversation will be saved to your chat history.
    </p>

    <div class="new-chat-modal-actions">
      <button id="new-chat-cancel" type="button">
        Keep current chat
      </button>

      <button id="new-chat-confirm" type="button">
        Start new chat
      </button>
    </div>
  </div>
  </div>

  <div id="delete-chat-modal" class="new-chat-modal">
  <div class="new-chat-modal-content">

    <button id="delete-chat-modal-close" class="new-chat-modal-close">
      &times;
    </button>

    <div class="new-chat-modal-icon delete-modal-icon">
      <i class="fa-regular fa-trash-can"></i>
    </div>

    <h3>Delete conversation?</h3>

    <p>
      Are you sure you want to delete this conversation?
      This action cannot be undone.
    </p>

    <div class="new-chat-modal-actions">
      <button id="delete-chat-cancel" type="button">
        Keep conversation
      </button>

      <button id="delete-chat-confirm" type="button">
        Yes, delete
      </button>
    </div>

  </div>
</div>

`;

  document.body.appendChild(chatBox);

  const style = document.createElement("style");

  style.textContent = `
  /* ==========================================
   WANDERLUST CHATBOT BUTTON
========================================== */

#chatbot-button {
  position: fixed;
  right: 25px;
  bottom: 25px;

  width: 64px;
  height: 64px;

  border: 2px solid #000000;
  border-radius: 50%;

  background: #000000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  cursor: pointer;
  z-index: 9999;

  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);

  transition: transform 0.25s ease,
              box-shadow 0.25s ease;
}


/* WanderLust compass logo */

.wanderlust-chat-logo {
  font-size: 40px;

  color: #fe424d;

  line-height: 1;

  display: block;

  transition: transform 0.25s ease;
}


/* Hover */

#chatbot-button:hover {
  transform: translateY(-3px);

  box-shadow: 0 9px 24px rgba(0, 0, 0, 0.20);
}

#chatbot-button:hover .wanderlust-chat-logo {
  transform: rotate(-8deg);
}


/* Click */

#chatbot-button:active {
  transform: scale(0.95);
}

    #chatbot-box {
      display: none;
      position: fixed;
      right: 25px;
      bottom: 95px;
      width: 360px;
      height: 500px;
      background: white;
      border-radius: 18px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      overflow: hidden;
      z-index: 9999;
      flex-direction: column;
    }

    .chatbot-header {
      background: #fe424d;
      color: white;
      padding: 15px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

.chatbot-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

#chatbot-chats,
#chatbot-new {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  color: white;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 11px;
  cursor: pointer;
}

#chatbot-chats:hover,
#chatbot-new:hover {
  background: rgba(255, 255, 255, 0.15);
}

.chatbot-history-panel {
  display: none;
  background: white;
  border-bottom: 1px solid #ddd;
  max-height: 220px;
  overflow-y: auto;
}

.chatbot-history-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

#chatbot-history-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #555;
}

.chatbot-saved-chats {
  padding: 6px;
}

.chatbot-history-empty {
  padding: 15px;
  text-align: center;
  color: #777;
  font-size: 13px;
}

.saved-chat-item {
  width: 100%;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 3px;
  font-size: 13px;
  color: #333;
}

.saved-chat-item:hover {
  background: #f5f5f5;
}

.saved-chat-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.saved-chat-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-chat-date {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 3px;
}

.delete-chat-btn {
  border: none;
  background: transparent;
  color: #999;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 8px;
}

.delete-chat-btn:hover {
  background: #ffe5e7;
  color: #fe424d;
}

.saved-chat-date {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 3px;
}

#chatbot-new {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: white;
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 11px;
  cursor: pointer;
}

#chatbot-new:hover {
  background: rgba(255, 255, 255, 0.15);
}

    .chatbot-header strong {
      display: block;
      font-size: 17px;
    }

    .chatbot-header small {
      opacity: 0.9;
    }

    #chatbot-close {
      border: none;
      background: transparent;
      color: white;
      font-size: 28px;
      cursor: pointer;
    }

    .chatbot-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f8f8f8;
    }

    .chat-message {
      max-width: 88%;
      padding: 11px 14px;
      margin-bottom: 12px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
    }

    .bot-message {
  background: #ffffff;
  border: 1px solid #eeeeee;
  margin-right: auto;
  padding: 14px 16px;
  line-height: 1.6;
  color: #333;
}

    .user-message {
      background: #fe424d;
      color: white;
      margin-left: auto;
    }

    .typing-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 3px;
}

.typing-dots span {
  width: 5px;
  height: 5px;
  background: #777;
  border-radius: 50%;
  animation: chatbotTyping 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.ai-listing-link {
  display: inline-block;
  margin-top: 8px;
  padding: 7px 12px;
  border-radius: 8px;
  background: #fe424d;
  color: white !important;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.ai-listing-link:hover {
  background: #e63946;
  color: white !important;
  text-decoration: none;
}

@keyframes chatbotTyping {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

    .chatbot-input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ddd;
      background: white;
    }

    .bot-message p {
  margin: 0 0 12px;
}

.bot-message p:last-child {
  margin-bottom: 0;
}

.bot-message h1,
.bot-message h2,
.bot-message h3 {
  color: #222;
  line-height: 1.3;
  margin-top: 16px;
  margin-bottom: 10px;
}

.bot-message h1:first-child,
.bot-message h2:first-child,
.bot-message h3:first-child {
  margin-top: 0;
}

.bot-message h1 {
  font-size: 19px;
}

.bot-message h2 {
  font-size: 17px;
}

.bot-message h3 {
  font-size: 15px;
}

.bot-message ul,
.bot-message ol {
  margin: 8px 0 14px;
  padding-left: 22px;
}

.bot-message li {
  margin-bottom: 7px;
  padding-left: 2px;
}

.bot-message strong {
  font-weight: 700;
  color: #222;
}

.bot-message em {
  color: #555;
}

.bot-message code {
  background: #f1f1f1;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 13px;
}

    #chatbot-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 14px;
      outline: none;
    }

    #chatbot-input:focus {
      border-color: #fe424d;
    }

    #chatbot-send {
      width: 42px;
      height: 42px;
      margin-left: 8px;
      border: none;
      border-radius: 50%;
      background: #fe424d;
      color: white;
      cursor: pointer;
    }

    #chatbot-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ==========================================
   NEW CHAT CONFIRMATION MODAL
========================================== */

.new-chat-modal {
  display: none;

  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.55);

  align-items: center;
  justify-content: center;

  z-index: 10000;
}

.new-chat-modal-content {
  position: relative;

  width: 360px;
  max-width: calc(100% - 32px);

  background: #ffffff;

  border-radius: 20px;

  padding: 28px;

  text-align: center;

  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);

  animation: newChatModalIn 0.2s ease;
}

.new-chat-modal-icon {
  width: 58px;
  height: 58px;

  margin: 0 auto 18px;

  border-radius: 50%;

  background: #fff0f1;

  display: flex;
  align-items: center;
  justify-content: center;
}

.new-chat-modal-icon i {
  font-size: 28px;
  color: #fe424d;
}

.delete-modal-icon {
  background: #fff0f1;
}

.delete-modal-icon i {
  color: #fe424d;
}

#delete-chat-confirm {
  border: 1px solid #fe424d;
  background: #fe424d;
  color: #ffffff;
}

#delete-chat-confirm:hover {
  background: #e63946;
}

.new-chat-modal-content h3 {
  margin: 0 0 10px;

  font-size: 20px;
  color: #222;
}

.new-chat-modal-content p {
  margin: 0 auto 24px;

  max-width: 280px;

  font-size: 14px;
  line-height: 1.5;

  color: #666;
}

.new-chat-modal-close {
  position: absolute;

  top: 12px;
  right: 14px;

  width: 32px;
  height: 32px;

  border: none;
  background: transparent;

  font-size: 25px;
  color: #777;

  cursor: pointer;
}

.new-chat-modal-close:hover {
  color: #222;
}

.new-chat-modal-actions {
  display: flex;

  gap: 10px;
}

.new-chat-modal-actions button {
  flex: 1;

  min-height: 44px;

  border-radius: 10px;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;
}

#new-chat-cancel {
  border: 1px solid #ddd;

  background: #ffffff;

  color: #333;
}

#new-chat-cancel:hover {
  background: #f5f5f5;
}

#new-chat-confirm {
  border: 1px solid #fe424d;

  background: #fe424d;

  color: #ffffff;
}

#new-chat-confirm:hover {
  background: #e63946;
}

@keyframes newChatModalIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

    @media (max-width: 500px) {
  #chatbot-button {
    right: 15px;
    bottom: 15px;

    width: 58px;
    height: 58px;
  }

  .wanderlust-chat-logo {
    font-size: 37px;
  }
}
}
  `;

  document.head.appendChild(style);

  // ==============================
  // ELEMENTS
  // ==============================

  const button = document.getElementById("chatbot-button");
  const box = document.getElementById("chatbot-box");
  const close = document.getElementById("chatbot-close");
  const newChat = document.getElementById("chatbot-new");
  const newChatModal = document.getElementById("new-chat-modal");
  const newChatModalClose = document.getElementById("new-chat-modal-close");
  const newChatCancel = document.getElementById("new-chat-cancel");
  const newChatConfirm = document.getElementById("new-chat-confirm");
  const deleteChatModal = document.getElementById("delete-chat-modal");
  const deleteChatModalClose = document.getElementById(
    "delete-chat-modal-close",
  );
  const deleteChatCancel = document.getElementById("delete-chat-cancel");
  const deleteChatConfirm = document.getElementById("delete-chat-confirm");
  let chatToDeleteId = null;
  const chatsButton = document.getElementById("chatbot-chats");

  const historyPanel = document.getElementById("chatbot-history-panel");

  const historyClose = document.getElementById("chatbot-history-close");

  const savedChats = document.getElementById("chatbot-saved-chats");

  const input = document.getElementById("chatbot-input");
  const send = document.getElementById("chatbot-send");
  const messages = document.getElementById("chatbot-messages");

  // ==============================
  // LOAD PREVIOUS CHAT HISTORY
  // ==============================

  async function loadChatHistory() {
    try {
      const response = await fetch("/ai/history", {
        cache: "no-store",
      });

      // User is logged out.
      // Don't treat this as a chatbot error.
      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load chat history");
      }

      const data = await response.json();

      // Always clear first
      messages.innerHTML = "";

      if (data.history && data.history.length > 0) {
        data.history.forEach((item) => {
          addMessage(item.content, item.role === "user" ? "user" : "bot");
        });
      } else {
        addMessage(
          "👋 Hi! I'm Wanderlust AI.\n\nHow can I help you with your travel plans?",
          "bot",
        );
      }

      // Scroll to latest message after rendering
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          messages.scrollTop = messages.scrollHeight;
        });
      });
    } catch (error) {
      console.error("CHAT HISTORY ERROR:", error);

      messages.innerHTML = "";

      addMessage(
        "👋 Hi! I'm Wanderlust AI.\n\nHow can I help you with your travel plans?",
        "bot",
      );
    }
  }

  // ==============================
  // OPEN CHAT
  // ==============================

  button.addEventListener("click", () => {
    box.style.display = "flex";
    button.style.display = "none";

    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });

    input.focus();
  });

  // ==============================
  // CLOSE CHAT
  // ==============================

  close.addEventListener("click", () => {
    box.style.display = "none";
    button.style.display = "block";
  });

  // ==============================
  // ADD MESSAGE
  // ==============================

  function addMessage(text, sender) {
    const message = document.createElement("div");

    message.classList.add(
      "chat-message",
      sender === "user" ? "user-message" : "bot-message",
    );

    let html = marked.parse(text);

    // ==============================================
    // CONVERT AI LISTING IDs INTO CLICKABLE LINKS
    // ==============================================

    // Format 1:
    // 🔗 LISTING_ID: 68d59ea37f06bee837f6fb74
    html = html.replace(
      /🔗\s*LISTING[_\\]*ID\s*:\s*([a-f0-9]{24})/gi,
      `
    <a
      href="/listings/$1"
      class="ai-listing-link"
    >
      🔗 View listing →
    </a>
  `,
    );

    // Format 2:
    // 🔗 68d59ea37f06bee837f6fb74
    html = html.replace(
      /🔗\s*([a-f0-9]{24})/gi,
      `
    <a
      href="/listings/$1"
      class="ai-listing-link"
    >
      🔗 View listing →
    </a>
  `,
    );

    // Sanitize AI-generated HTML before inserting it into the page
    message.innerHTML = DOMPurify.sanitize(html);

    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
  }

  // ==============================
  // TYPING MESSAGE
  // ==============================

  function showTyping() {
    const typing = document.createElement("div");

    typing.id = "chatbot-typing";
    typing.classList.add("chat-message", "bot-message", "typing-message");

    typing.innerHTML = `
    <span>Wanderlust AI</span>
    <span class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;

    messages.appendChild(typing);

    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById("chatbot-typing");

    if (typing) {
      typing.remove();
    }
  }

  // ==============================
  // START NEW CHAT
  // ==============================

  async function startNewChat() {
    const hasMessages = messages.children.length > 0;

    if (hasMessages) {
      newChatModal.style.display = "flex";
      return;
    }

    await createNewChat();
  }

  async function createNewChat() {
    try {
      newChat.disabled = true;
      newChatConfirm.disabled = true;

      newChatModal.style.display = "none";

      const response = await fetch("/ai/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start new chat.");
      }

      // Clear current messages
      messages.innerHTML = "";

      // Start fresh conversation
      addMessage(
        "👋 Hi! I'm Wanderlust AI.\n\nHow can I help you with your travel plans?",
        "bot",
      );

      historyPanel.style.display = "none";

      await loadSavedChats();
    } catch (error) {
      console.error("NEW CHAT ERROR:", error);

      addMessage("Unable to start a new chat right now.", "bot");
    } finally {
      newChat.disabled = false;
      newChatConfirm.disabled = false;

      input.focus();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
  }

  // ==============================
  // LOAD SAVED CHATS
  // ==============================

  async function loadSavedChats() {
    try {
      const response = await fetch("/ai/saved");

      if (!response.ok) {
        throw new Error("Failed to load saved chats");
      }

      const data = await response.json();

      savedChats.innerHTML = "";

      if (!data.chats || data.chats.length === 0) {
        savedChats.innerHTML = `
        <div class="chatbot-history-empty">
          No previous chats yet.
        </div>
      `;

        return;
      }

      data.chats.forEach((chat) => {
        const chatItem = document.createElement("div");

        chatItem.classList.add("saved-chat-item");

        const date = new Date(chat.updatedAt);

        chatItem.innerHTML = `
        <div class="saved-chat-content">
          <div class="saved-chat-title">
            ${escapeHtml(chat.title)}
          </div>

          <span class="saved-chat-date">
            ${date.toLocaleDateString()}
          </span>
        </div>

        <button
          class="delete-chat-btn"
          title="Delete chat"
          type="button"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

        // Load chat when clicking the chat content
        const chatContent = chatItem.querySelector(".saved-chat-content");

        chatContent.addEventListener("click", () => {
          loadSavedChat(chat._id);
        });

        // Delete chat
        const deleteButton = chatItem.querySelector(".delete-chat-btn");

        deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();

          // Remember which chat we want to delete
          chatToDeleteId = chat._id;

          // Open custom delete confirmation modal
          deleteChatModal.style.display = "flex";
        });

        savedChats.appendChild(chatItem);
      });
    } catch (error) {
      console.error("LOAD SAVED CHATS ERROR:", error);

      savedChats.innerHTML = `
      <div class="chatbot-history-empty">
        Unable to load previous chats.
      </div>
    `;
    }
  }

  // ==============================
  // LOAD SAVED CHAT
  // ==============================

  async function loadSavedChat(chatId) {
    try {
      const response = await fetch(`/ai/saved/${chatId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load chat.");
      }

      // Close history panel
      historyPanel.style.display = "none";

      // Clear current conversation
      messages.innerHTML = "";

      // Render saved conversation
      if (data.history && data.history.length > 0) {
        data.history.forEach((item) => {
          addMessage(item.content, item.role === "user" ? "user" : "bot");
        });

        // Scroll to latest message
        requestAnimationFrame(() => {
          messages.scrollTop = messages.scrollHeight;
        });
      }

      input.focus();
    } catch (error) {
      console.error("LOAD SAVED CHAT ERROR:", error);

      addMessage("Unable to load this conversation right now.", "bot");
    }
  }

  // ==============================
  // DELETE CHAT
  // ==============================

  async function deleteCurrentChat() {
    if (!chatToDeleteId) {
      return;
    }

    try {
      deleteChatConfirm.disabled = true;

      const response = await fetch(`/ai/saved/${chatToDeleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete chat.");
      }

      // Close modal
      deleteChatModal.style.display = "none";

      // Clear selected chat ID
      chatToDeleteId = null;

      // Refresh chat history
      await loadSavedChats();
    } catch (error) {
      console.error("DELETE CHAT ERROR:", error);

      // Don't use browser alert
      addMessage("Unable to delete this conversation right now.", "bot");
    } finally {
      deleteChatConfirm.disabled = false;
    }
  }

  // ==============================
  // SEND MESSAGE
  // ==============================

  async function sendMessage() {
    const message = input.value.trim();

    console.log("SEND BUTTON / ENTER TRIGGERED");
    console.log("Message:", message);

    if (!message) {
      console.log("Message is empty");
      return;
    }

    // Show user message
    addMessage(message, "user");

    input.value = "";
    send.disabled = true;

    showTyping();

    try {
      console.log("Sending request to /ai/chat...");

      const response = await fetch("/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      console.log("Response status:", response.status);

      const text = await response.text();

      console.log("Raw response:", text);

      removeTyping();

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("Response was not JSON:", text);

        addMessage(
          "Server returned an unexpected response. Check the browser console.",
          "bot",
        );

        return;
      }

      if (!response.ok) {
        addMessage(data.message || "Something went wrong.", "bot");

        return;
      }

      addMessage(data.reply, "bot");
    } catch (error) {
      console.error("CHAT REQUEST ERROR:", error);

      removeTyping();

      addMessage("Sorry, I couldn't connect to Wanderlust AI.", "bot");
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  // ==============================
  // SEND BUTTON
  // ==============================

  send.addEventListener("click", sendMessage);

  newChat.addEventListener("click", startNewChat);

  chatsButton.addEventListener("click", async () => {
    if (historyPanel.style.display === "block") {
      historyPanel.style.display = "none";
      return;
    }

    historyPanel.style.display = "block";

    await loadSavedChats();
  });

  historyClose.addEventListener("click", () => {
    historyPanel.style.display = "none";
  });

  newChatConfirm.addEventListener("click", createNewChat);

  newChatCancel.addEventListener("click", () => {
    newChatModal.style.display = "none";
  });

  newChatModalClose.addEventListener("click", () => {
    newChatModal.style.display = "none";
  });

  newChatModal.addEventListener("click", (event) => {
    if (event.target === newChatModal) {
      newChatModal.style.display = "none";
    }
  });

  deleteChatConfirm.addEventListener("click", deleteCurrentChat);

  deleteChatCancel.addEventListener("click", () => {
    deleteChatModal.style.display = "none";
    chatToDeleteId = null;
  });

  deleteChatModalClose.addEventListener("click", () => {
    deleteChatModal.style.display = "none";
    chatToDeleteId = null;
  });

  deleteChatModal.addEventListener("click", (event) => {
    if (event.target === deleteChatModal) {
      deleteChatModal.style.display = "none";
      chatToDeleteId = null;
    }
  });

  // ==============================
  // ENTER KEY
  // ==============================

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // ==============================
  // INITIAL CHAT HISTORY
  // ==============================

  loadChatHistory();

  // ==============================
  // RESTORE CHAT AFTER BACK/FORWARD
  // ==============================

  window.addEventListener("pageshow", () => {
    console.log("🔄 Page restored - scrolling chat to latest message");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
      });
    });
  });
});
