// export default MapView;
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
        } catch (error) {
          console.error("Error sending location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );

    const loadMarkers = async () => {
      try {
        const locations = await fetchAllLocations();
        locations.forEach((location) => {
          console.log("Location:", location);
          if (location.user._id === user.id) return;
          const color = location.user.online ? "green" : "red";

          const marker = new mapboxgl.Marker({ color: color })
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

    return () => {
      mapRef.current.off("load", loadMarkers);
    };
  }, [user?.id, user?.token, navigate]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "80vh", width: "100%" }}
      className="map-container"
    />
  );
};
export default MapView;
