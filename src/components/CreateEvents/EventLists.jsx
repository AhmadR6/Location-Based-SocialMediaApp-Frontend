import { useQuery } from "@tanstack/react-query";
import { useFetch } from "../../hooks/useFetch";
import { useState, useEffect } from "react";
import { format } from "date-fns";

import "./eventLists.scss";
import {
  IconCalendarEvent,
  IconMapPin,
  IconUsers,
  IconClock,
  IconLoader2,
} from "@tabler/icons-react";

const EventsList = ({ refresh, setRefresh }) => {
  const handleFetch = useFetch();

  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
      );
    }
  }, []);

  const {
    data: events,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["events", location, refresh],
    queryFn: async () => {
      const query =
        location.latitude && location.longitude
          ? `/events?latitude=${location.latitude}&longitude=${location.longitude}`
          : "/events";
      return await handleFetch(query);
    },
  });

  // Format distance helper
  const formatDistance = (distance) => {
    if (!distance) return null;
    return distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;
  };

  // Format time helper
  const formatEventTime = (eventDate) => {
    const date = new Date(eventDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() ===
      date.toDateString();

    if (isToday) {
      return `Today ${format(date, "HH:mm")}`;
    } else if (isTomorrow) {
      return `Tomorrow ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <IconLoader2 size={20} className="spinner" />
        <span>Loading events...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-state">
        <span>Failed to load events</span>
      </div>
    );
  }

  return (
    <div className="events-container">
      {!events || events.length === 0 ? (
        <div className="empty-state">
          <IconCalendarEvent size={24} className="empty-icon" />
          <span>No events found</span>
        </div>
      ) : (
        events.slice(0, 10).map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h4 className="event-title">{event.title}</h4>
              {event.status && (
                <span className={`status-badge ${event.status}`}>
                  {event.status === "upcoming" ? "Upcoming" : "Live"}
                </span>
              )}
            </div>

            <div className="event-details">
              <div className="event-detail">
                <IconClock size={14} />
                <span>{formatEventTime(event.eventDate)}</span>
              </div>

              {event.distance && (
                <div className="event-detail">
                  <IconMapPin size={14} />
                  <span>{formatDistance(event.distance)} away</span>
                </div>
              )}

              {event.attendeeCount > 0 && (
                <div className="event-detail">
                  <IconUsers size={14} />
                  <span>{event.attendeeCount} going</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="event-description">
                {event.description.length > 60
                  ? `${event.description.substring(0, 60)}...`
                  : event.description}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default EventsList;
