// Update this to your actual backend API base
const SETTINGS_API_URL = `${import.meta.env.VITE_API_URL}/settings`;

// Get user settings
const getUserSettings = async (token) => {
  try {
    const response = await fetch(SETTINGS_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Send JWT token
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    const data = await response.json();
    return data; // Should return user settings (e.g., isLocationVisible)
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// Update location visibility
const updateLocationVisibility = async (isLocationVisible, token) => {
  try {
    const response = await fetch(`${SETTINGS_API_URL}/location-visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Send JWT token
      },
      body: JSON.stringify({ isLocationVisible }),
    });

    if (!response.ok) {
      throw new Error("Failed to update location visibility");
    }

    console.log("✅ Location visibility updated");
  } catch (error) {
    console.error("Failed to update visibility:", error);
    throw error;
  }
};

export { getUserSettings, updateLocationVisibility };
