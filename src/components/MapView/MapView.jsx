// export default MapView;
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { sendUserLocation, fetchAllLocations } from "../../utils/location";
import { fetchEvents, joinEvent } from "../../utils/events.js";
import { useAuthContext } from "../../hooks/useAuthContext";
import createPopup from "../mapPopup/createPopup.jsx";
import EventsPopup from "../mapPopup/EventsPopup.jsx";
import { useNavigate } from "react-router-dom";

const MapView = ({ refresh, setRefresh }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuthContext();
  const markersRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.token || !mapContainerRef.current) {
      console.error("Missing token or map container");
      return;
    }

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [73.078909, 31.418854],
        zoom: 13,
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      return;
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
    };
  }, [user?.token]);

  useEffect(() => {
    requestLocation();
  }, [user?.id, user?.token, navigate]);

  function requestLocation() {
    if (!mapRef.current || !user?.token) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        try {
          await sendUserLocation(latitude, longitude, user.token);
          mapRef.current.setCenter([longitude, latitude]);
          const userMarker = new mapboxgl.Marker({ color: "green" })
            .setLngLat([longitude, latitude])
            .setPopup(createPopup(user, navigate))
            .addTo(mapRef.current);

          markersRef.current.push(userMarker);

          // Load markers only after we have the user's location
          loadMarkers(latitude, longitude);
        } catch (error) {
          console.error("Error sending location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  }

  // Move loadMarkers outside requestLocation
  const loadMarkers = async (latitude, longitude) => {
    try {
      const locations = await fetchAllLocations();
      locations.forEach((location) => {
        // console.log("Location:", location);
        if (location.user._id === user.id) return;
        const color = location.user.online ? "green" : "red";

        const marker = new mapboxgl.Marker({ color: color })
          .setLngLat([location.longitude, location.latitude])
          .setPopup(createPopup(location.user, navigate))
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });

      try {
        // Use the provided latitude and longitude instead of userLocation state
        const events = await fetchEvents(latitude, longitude, user.token);
        events.forEach((event) => {
          // console.log("Event:", event);

          const eventColor = "blue";
          const marker = new mapboxgl.Marker({ color: eventColor })
            .setLngLat([event.longitude, event.latitude])
            .setPopup(EventsPopup(event, user, refresh, setRefresh))
            .addTo(mapRef.current);

          markersRef.current.push(marker);
        });
      } catch (eventError) {
        console.error("Error loading event markers:", eventError);
      }
    } catch (error) {
      console.error("Error loading markers:", error);
    }
  };

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ height: "80vh", width: "100%" }}
        className="map-container"
      />
      <button onClick={requestLocation}>Get my Location</button>
    </div>
  );
};
export default MapView;
