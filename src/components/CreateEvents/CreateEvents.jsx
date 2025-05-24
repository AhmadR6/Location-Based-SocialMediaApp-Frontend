import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./createEvents.scss";
import { Form, useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  IconAlertOctagon,
  IconCalendarEvent,
  IconMapPin,
} from "@tabler/icons-react";
import { createOrUpdateEvent } from "../../utils/events";
import Loader from "../Loaders/Loader";
import BackNav from "../backNav/BackNav";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: null, // Changed to null initially
    latitude: 31.42,
    longitude: 73.08,
  });
  const [error, setError] = useState("");
  const { user } = useAuthContext();
  const token = user.token;

  const createEventMutation = useMutation({
    mutationFn: () => {
      // Format the date properly for backend
      const formattedData = {
        ...formData,
        eventDate: formData.eventDate ? formData.eventDate.toISOString() : null,
      };
      return createOrUpdateEvent(formattedData, token);
    },
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries(["events"]);
      navigate("/p/map");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleMapClick = useCallback((e) => {
    e.preventDefault();
    const { lng, lat } = e.lngLat;
    markerRef.current.setLngLat([lng, lat]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }));
  }, []);

  const handleMarkerDragEnd = useCallback(() => {
    const lngLat = markerRef.current.getLngLat();
    setFormData((prevFormData) => ({
      ...prevFormData,
      latitude: parseFloat(lngLat.lat.toFixed(6)),
      longitude: parseFloat(lngLat.lng.toFixed(6)),
    }));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [formData.longitude, formData.latitude],
        zoom: 13,
      });

      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([formData.longitude, formData.latitude])
        .addTo(mapRef.current);

      markerRef.current.on("dragend", handleMarkerDragEnd);
      mapRef.current.on("click", handleMapClick);

      return () => {
        mapRef.current?.remove();
      };
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }, [handleMapClick, handleMarkerDragEnd]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, eventDate, latitude, longitude } = formData;

    if (!title || !eventDate || !latitude || !longitude) {
      setError("Please fill all required fields");
      return;
    }

    // Check if event date is in the future
    const now = new Date();
    if (eventDate <= now) {
      setError("Event date must be in the future");
      return;
    }

    setError(""); // Clear any previous errors
    createEventMutation.mutate();
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, eventDate: date });
  };

  // Get minimum date (current time + 1 hour to prevent scheduling events too soon)
  const getMinDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now;
  };

  return (
    <div className="content new-event">
      <div>
        <BackNav label="Back" onClick={() => navigate("/p/create")} />
        <Form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Event Title"
            required
            className="title"
          />
          <TextareaAutosize
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event Description"
            maxLength="2000"
            className="textarea"
          />
          <div className="form-group">
            <IconCalendarEvent size="18px" />
            <DatePicker
              selected={formData.eventDate}
              onChange={handleDateChange}
              showTimeSelect
              timeIntervals={15}
              minDate={getMinDate()}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date and time"
              required
              className="input"
              calendarClassName="custom-calendar"
              timeCaption="Time"
            />
          </div>
          <div className="map-group">
            <div className="form-group">
              <IconMapPin size="18px" />
              <p>Click or drag the marker to select a location</p>
            </div>
            <div
              ref={mapContainerRef}
              className="map-container"
              style={{ height: "300px", width: "70%" }}
            />

            <div className="form-group">
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                step="any"
                readOnly
                className="input"
              />
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                step="any"
                readOnly
                className="input"
              />
            </div>
          </div>
          <div className="form-options">
            <p>{formData.description.length}/2000</p>
            <Loader loading={createEventMutation.isPending} />
            <button disabled={createEventMutation.isPending} type="submit">
              Create Event
            </button>
          </div>
        </Form>
        {error && (
          <p className="error-box">
            <IconAlertOctagon size="18px" />
            {error}
          </p>
        )}
      </div>
      <div></div>
    </div>
  );
};

export default CreateEvent;
