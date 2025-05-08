import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { sendUserLocation, fetchAllLocations } from "../../utils/location"; // Import sendUserLocation function
import { useAuthContext } from "../../hooks/useAuthContext";

const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.078909, 31.418854], // Default center
      zoom: 12,
    });

    // Get and set user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        // Send location to backend
        await sendUserLocation(latitude, longitude, user.token); // Send user's location to backend

        // Set map center to user's location
        mapRef.current.setCenter([longitude, latitude]);

        // Add marker for the user
        new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText("📍 You"))
          .addTo(mapRef.current);
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
    );

    // Function to load all markers (locations) from backend
    const loadMarkers = async () => {
      try {
        const locations = await fetchAllLocations();
        console.log(`locations are ${locations}`);
        locations.forEach(({ latitude, longitude, user }) => {
          new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setText(user.username)) // Optional: Show username in popup
            .addTo(mapRef.current); // Add marker to map
        });
      } catch (error) {
        console.error("Error loading markers:", error);
      }
    };

    // Load all markers when the component mounts
    mapRef.current.on("load", () => {
      loadMarkers(); // Load markers only after the map has fully loaded
    });
    // Cleanup on unmount
    return () => {
      mapRef.current?.remove(); // Remove the map instance
    };
  }, [user.token]); // Depend on user.token to rerun when the user token changes

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "80vh", width: "100%" }}
      className="map-container"
    />
  );
};

export default MapView;
