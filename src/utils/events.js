const API_URL = `${import.meta.env.VITE_API_URL}/events`;

const fetchEvents = async (latitude, longitude, token) => {
  try {
    const response = await fetch(
      `${API_URL}?latitude=${latitude}&longitude=${longitude}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch events");
    }

    const data = await response.json();
    return data; // Array of events
  } catch (error) {
    console.error("Fetch events failed:", error);
    throw error;
  }
};

const createOrUpdateEvent = async (eventData, token) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create/update event");
    }

    const data = await response.json();
    return data; // Created/updated event
  } catch (error) {
    console.error("Create/update event failed:", error);
    throw error;
  }
};

const joinEvent = async (eventId, token) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to join event");
    }

    const data = await response.json();
    return data; // Success message or updated event
  } catch (error) {
    console.error("Join event failed:", error);
    throw error;
  }
};

export { fetchEvents, createOrUpdateEvent, joinEvent };
