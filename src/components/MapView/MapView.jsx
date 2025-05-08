import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { sendUserLocation } from "../../utils/location"; // Import sendUserLocation function

const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.078909, 31.418854], // default center
      zoom: 13,
    });

    // Get and set user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        // Send location to backend
        await sendUserLocation(latitude, longitude); // <- Call sendUserLocation here

        // Set map center to user location
        mapRef.current.setCenter([longitude, latitude]);

        // Add marker for user
        new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText("📍 You"))
          .addTo(mapRef.current);
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
    );

    // Add another marker (hardcoded)
    new mapboxgl.Marker()
      .setLngLat([73.120791, 31.40276])
      .setPopup(new mapboxgl.Popup().setText("📍 Hardcoded User"))
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "80vh", width: "100%" }}
      className="map-container"
    />
  );
};

export default MapView;
