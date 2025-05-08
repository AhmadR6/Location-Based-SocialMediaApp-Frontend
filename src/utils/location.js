// Update the base URL to point to your backend server (assuming backend runs on port 5000)
const API_URL = "http://localhost:5000/api/location";

export const sendUserLocation = async (latitude, longitude) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      throw new Error("Failed to send location");
    }
  } catch (error) {
    console.error("Location upload failed:", error);
  }
};
