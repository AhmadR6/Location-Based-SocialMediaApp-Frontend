import mapboxgl from "mapbox-gl";

export default function createPopup(user, navigate) {
  const container = document.createElement("div");

  container.innerHTML = `
    <div 
    style="padding:5px 10px;
    background:white;
    text-align:center;
    color: black;
    border:none;
    borderRadius: 4px;
    cursor:pointer;">
      <h3 style="margin: 0 0 10px 0">${user.username}</h3>
      <button class="profile-btn" 
              style="padding: 5px 10px; background: #4285f4; color: white; border: none; border-radius: 4px">
        View Profile
      </button>
    </div>
  `;

  const popup = new mapboxgl.Popup().setDOMContent(container);

  container.querySelector(".profile-btn").addEventListener("click", () => {
    navigate(`/p/users/${user.id}`);
    popup.remove();
  });

  return popup;
}
