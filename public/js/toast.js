function showToast(type, title, message, duration = 4000) {
  let container = document.querySelector(".wl-toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "wl-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `wl-toast ${type}`;

  let icon = "fa-circle-info";

  if (type === "success") {
    icon = "fa-circle-check";
  } else if (type === "error") {
    icon = "fa-circle-xmark";
  } else if (type === "warning") {
    icon = "fa-triangle-exclamation";
  }

  toast.innerHTML = `
    <div class="wl-toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>

    <div class="wl-toast-content">
      <div class="wl-toast-title">
        ${title}
      </div>

      <div class="wl-toast-message">
        ${message}
      </div>
    </div>

    <button
      type="button"
      class="wl-toast-close"
      aria-label="Close"
    >
      &times;
    </button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const removeToast = () => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  toast.querySelector(".wl-toast-close").addEventListener("click", removeToast);

  setTimeout(removeToast, duration);
}

document.addEventListener("DOMContentLoaded", () => {
  const storedToast = sessionStorage.getItem("wlToast");

  if (!storedToast) {
    return;
  }

  sessionStorage.removeItem("wlToast");

  try {
    const toast = JSON.parse(storedToast);

    showToast(toast.type, toast.title, toast.message);
  } catch (error) {
    console.error("TOAST ERROR:", error);
  }
});
