document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.createElement("button");

  chatButton.id = "chatbot-button";
  chatButton.innerHTML = "🤖";
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

      <button id="chatbot-close">&times;</button>
    </div>

    <div id="chatbot-messages" class="chatbot-messages">
      <div class="chat-message bot-message">
        👋 Hi! I'm Wanderlust AI.<br>
        How can I help you with your travel plans?
      </div>
    </div>

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
  `;

  document.body.appendChild(chatBox);

  const style = document.createElement("style");

  style.textContent = `
    #chatbot-button {
      position: fixed;
      right: 25px;
      bottom: 25px;
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      background: #fe424d;
      color: white;
      font-size: 28px;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    #chatbot-button:hover {
      transform: scale(1.05);
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

    @media (max-width: 500px) {
      #chatbot-box {
        right: 10px;
        bottom: 85px;
        width: calc(100% - 20px);
        height: 70vh;
      }

      #chatbot-button {
        right: 15px;
        bottom: 15px;
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

  const input = document.getElementById("chatbot-input");
  const send = document.getElementById("chatbot-send");
  const messages = document.getElementById("chatbot-messages");

  // ==============================
  // OPEN CHAT
  // ==============================

  button.addEventListener("click", () => {
    box.style.display = "flex";
    button.style.display = "none";
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

    // Convert AI listing IDs into clickable listing links
    html = html.replace(
      /🔗\s*LISTING[_\\]*ID:\s*([a-f0-9]{24})/gi,
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

  // ==============================
  // ENTER KEY
  // ==============================

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
