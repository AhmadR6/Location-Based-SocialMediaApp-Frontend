import mapboxgl from "mapbox-gl";

export default function createPopup(user, navigate) {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="user-popup">
      <h3 class="user-popup-title">${user.username}</h3>
      <button class="user-popup-button profile-btn">
        View Profile
      </button>
    </div>
  `;

  // Add styles to document head if not already present
  addUserPopupStyles();

  const popup = new mapboxgl.Popup({
    offset: 25,
    closeButton: true,
    maxWidth: "300px",
  }).setDOMContent(container);

  container.querySelector(".profile-btn").addEventListener("click", () => {
    navigate(`/p/users/${user.id}`);
    popup.remove();
  });

  return popup;
}

// Add styles for the user popup
function addUserPopupStyles() {
  if (!document.getElementById("user-popup-styles")) {
    const style = document.createElement("style");
    style.id = "user-popup-styles";
    style.innerHTML = `
      .user-popup {
        padding: 12px;
        font-family: Inter, system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                     Roboto,
                     Oxygen,
                     Ubuntu,
                     Cantarell,
                     "Open Sans",
                     "Helvetica Neue",
                     sans-serif;
        background: #121212;
        text-align: center;
      }
      
      .user-popup-title {
        margin: 0 0 12px 0;
        color: #f7f4f8;
        font-size: 18px;
        font-weight: 600;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
      }
      
      .user-popup-button {
        display: block;
        margin-top: 12px;
        padding: 8px 16px;
        background-color: #252525;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
      }
      
      .user-popup-button:hover {
        background-color: #565565;
      }
      
      .user-popup-button:disabled {
        background-color: #3a3a3a;
        cursor: not-allowed;
        opacity: 0.6;
      }
      
      .mapboxgl-popup-content {
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }
}
