import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./CreateEvents.scss";
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
import Loader from "../../components/Loaders/Loader";
import BackNav from "../../components/backNav/BackNav";
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
    eventDate: "",
    latitude: 31.42,
    longitude: 73.08,
  });
  const [error, setError] = useState("");
  const { user } = useAuthContext();
  const token = user.token;

  const createEventMutation = useMutation({
    mutationFn: () => createOrUpdateEvent(formData, token),
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries(["events"]);
      navigate("/p/home");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleMapClick = useCallback((e) => {
    e.preventDefault(); // Prevent default behavior
    const { lng, lat } = e.lngLat;
    markerRef.current.setLngLat([lng, lat]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  }, []);

  const handleMarkerDragEnd = useCallback(() => {
    const lngLat = markerRef.current.getLngLat();
    setFormData((prevFormData) => ({
      ...prevFormData,
      latitude: lngLat.lat.toFixed(6),
      longitude: lngLat.lng.toFixed(6),
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
    createEventMutation.mutate();
  };

  const handleDateChange = (date) => {
    // Format date to match datetime-local (YYYY-MM-DDTHH:mm)
    const formattedDate = date ? date.toISOString().slice(0, 16) : "";
    setFormData({ ...formData, eventDate: formattedDate });
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
              selected={
                formData.eventDate ? new Date(formData.eventDate) : null
              }
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="yyyy-MM-dd'T'HH:mm"
              placeholderText="Select date and time"
              required
              className="input"
              calendarClassName="custom-calendar"
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
        <p className="error-box">
          {error ? (
            <>
              <IconAlertOctagon size="18px" />
              {error}
            </>
          ) : (
            ""
          )}
        </p>
      </div>
      <div></div>
    </div>
  );
};

export default CreateEvent;
