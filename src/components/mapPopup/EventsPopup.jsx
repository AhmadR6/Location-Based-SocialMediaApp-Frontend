import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import mapboxgl from "mapbox-gl";
import { format } from "date-fns";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { joinEvent, unjoinEvent } from "../../utils/events";
/**
 * EventPopup component for displaying event information in a map popup
 * @param {Object} event - Event object containing details to display
 * @param {Object} user - User object containing user details including token
 */
export default function createEventPopup(event, user, refresh, setRefresh) {
  // Create container div for the popup
  const container = document.createElement("div");

  // Create a root for React to render into
  const root = ReactDOM.createRoot(container);

  // Define the EventPopup React component
  const EventPopupContent = () => {
    // State to track if the user has joined the event
    const [hasJoined, setHasJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch attendance status when component mounts
    useEffect(() => {
      const checkAttendance = async () => {
        try {
          // Assuming the API supports a GET request to check if the user has joined
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/events/${event.id}/attendance`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to check attendance");
          }

          const data = await response.json();
          setHasJoined(data.hasJoined); // Assuming API returns { hasJoined: boolean }
        } catch (error) {
          console.error("Error checking attendance:", error);
        } finally {
          setIsLoading(false);
        }
      };

      checkAttendance();
    }, [event.id, user.token]);

    // Format the date and time
    const eventDate = new Date(event.eventDate);
    const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
    const formattedTime = format(eventDate, "h:mm a");

    // Format distance to be more readable
    const formattedDistance =
      event.distance < 1000
        ? `${Math.round(event.distance)} m`
        : `${(event.distance / 1000).toFixed(1)} km`;

    // Handle join/unjoin toggle
    const handleToggleJoin = async () => {
      try {
        if (hasJoined) {
          await unjoinEvent(event.id, user.token);
          setHasJoined(false);
          setRefresh((prev) => !prev); // Trigger refresh in parent component
          console.log("Unjoined event");
        } else {
          await joinEvent(event.id, user.token);
          setHasJoined(true);
          setRefresh((prev) => !prev); // Trigger refresh in parent component
          console.log("Joined event");
        }
      } catch (error) {
        console.error(
          `Error ${hasJoined ? "unjoining" : "joining"} event:`,
          error,
        );
      }
    };

    return (
      <div className="event-popup">
        <h3 className="event-popup-title">{event.title}</h3>

        <div className="event-popup-detail">
          <IconCalendarEvent size={16} className="event-popup-icon" />
          <span>{formattedDate}</span>
        </div>

        <div className="event-popup-detail">
          <IconClock size={16} className="event-popup-icon" />
          <span>{formattedTime}</span>
        </div>

        <div className="event-popup-detail">
          <IconMapPin size={16} className="event-popup-icon" />
          <span>{formattedDistance} away</span>
        </div>

        {event.description && (
          <div className="event-popup-description">
            <IconInfoCircle size={16} className="event-popup-icon" />
            <p>{event.description}</p>
          </div>
        )}

        <button
          className="event-popup-button"
          onClick={handleToggleJoin}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : hasJoined ? "Unjoin event" : "Join event"}
        </button>
      </div>
    );
  };

  // Render React component into the container
  root.render(<EventPopupContent />);

  // Add styles to document head if not already present
  addPopupStyles();

  // Create and return the popup
  return new mapboxgl.Popup({
    offset: 25,
    closeButton: true,
    maxWidth: "300px",
  }).setDOMContent(container);
}

// Add styles for the popup
function addPopupStyles() {
  if (!document.getElementById("event-popup-styles")) {
    const style = document.createElement("style");
    style.id = "event-popup-styles";
    style.innerHTML = `
      .event-popup {
        padding: 12px;
        font-family:Inter,system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                     Roboto,
                     Oxygen,
                     Ubuntu,
                     Cantarell,
                     "Open Sans",
                     "Helvetica Neue",
                     sans-serif;
        background:#121212;
      }
      
      .event-popup-title {
        margin: 0 0 12px 0;
        color:#f7f4f8
        font-size: 18px;
        font-weight: 600;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
      }
      
      .event-popup-detail {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
        color: #f7f4f8;
      }
      
      .event-popup-icon {
        margin-right: 8px;
        color:#f7f4f8 ;
      }
      
      .event-popup-description {
        display: flex;
        margin-top: 8px;
        padding-top: 8px;color: #5f6368;
        border-top: 1px solid #e0e0e0;
      }
      
      .event-popup-description p {
        margin: 0;
        font-size: 14px;
        color: #f7f4f8;
        line-height: 1.4;
      }
      
      .event-popup-button {
        display: block;
        margin-top: 12px;
        padding: 8px 16px;
        background-color:#252525;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
      }
      
      .event-popup-button:hover {
        background-color: #565565;
      }
      
      .event-popup-button:disabled {
        background-color: #3a3a3a;
        cursor: not-allowed;
        opacity: 0.6;
      }
      
      .mapboxgl-popup-content {
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }
}
