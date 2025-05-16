// Update the base URL to point to your backend server (assuming backend runs on port 5000)
const API_URL = `${import.meta.env.VITE_API_URL}/location`;

// You need to pass the user or token to this function
const sendUserLocation = async (latitude, longitude, token) => {
  try {
    const response = await fetch(`${API_URL}/updateLocation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ send JWT token here
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      throw new Error("Failed to send location");
    }

    console.log("✅ Location uploaded");
  } catch (error) {
    console.error("Location upload failed:", error);
  }
};

const fetchAllLocations = async () => {
  const res = await fetch(`${API_URL}/getAllLocations`);
  const data = await res.json();
  return data; // An array of location objects
};
const nearbyUserLocations = async (latitude, longitude, radius) => {
  const res = await fetch(
    `${API_URL}/nearbyusers?lat=${latitude}&lon=${longitude}&radius=${radius}`,
  );
  const data = await res.json();
  return data; // An array of location objects
};

export { sendUserLocation, fetchAllLocations, nearbyUserLocations };
