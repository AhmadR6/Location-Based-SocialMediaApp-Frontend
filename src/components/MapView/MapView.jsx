import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { sendUserLocation, fetchAllLocations } from "../../utils/location";
import { useAuthContext } from "../../hooks/useAuthContext";
import createPopup from "../mapPopup/createPopup.jsx";
import { useNavigate } from "react-router-dom";
const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuthContext();
  const markersRef = useRef([]); // To track all markers for cleanup
  const navigate = useNavigate();
  useEffect(() => {
    if (!user?.token) return; // Exit if no user token

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.078909, 31.418854],
      zoom: 13,
    });

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
    };
  }, [user?.token]);

  useEffect(() => {
    if (!mapRef.current || !user?.token) return;

    // Handle user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        try {
          await sendUserLocation(latitude, longitude, user.token);
          mapRef.current.setCenter([longitude, latitude]);

          // Add current user's marker (blue)
          const userMarker = new mapboxgl.Marker({ color: "blue" })
            .setLngLat([longitude, latitude])
            .setPopup(createPopup(user, navigate))
            .addTo(mapRef.current);

          markersRef.current.push(userMarker);
        } catch (error) {
          console.error("Error sending location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );

    // Load all other users' markers
    const loadMarkers = async () => {
      try {
        const locations = await fetchAllLocations();

        locations.forEach((location) => {
          // Skip current user's location (already added)
          if (location.user._id === user.id) return;

          const marker = new mapboxgl.Marker()
            .setLngLat([location.longitude, location.latitude])
            .setPopup(createPopup(location.user, navigate))
            .addTo(mapRef.current);

          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error("Error loading markers:", error);
      }
    };

    mapRef.current.on("load", loadMarkers);
  }, [user]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "80vh", width: "100%" }}
      className="map-container"
    />
  );
};

export default MapView;
