import React from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import { BrowserRouter } from "react-router-dom";
import "./mapPopup.scss";

// PopupContent component
const PopupContent = ({ user }) => {
  return (
    <div style={{ padding: "10px", textAlign: "center" }}>
      <h3>{user.username}</h3>
      <button
        onClick={() => {
          navigate(`/p/users/${user.id}`);
        }}
      >
        View Profile
      </button>
    </div>
  );
};

// Utility function to create a Mapbox popup
export default function createPopup(user) {
  const popupContent = document.createElement("div");
  const root = createRoot(popupContent);
  // Wrap PopupContent in BrowserRouter to provide Router context
  root.render(
    <BrowserRouter>
      <PopupContent user={user} />
    </BrowserRouter>,
  );
  return new mapboxgl.Popup().setDOMContent(popupContent);
}
