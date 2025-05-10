import React, { useState, useEffect } from "react";
import {
  updateLocationVisibility,
  getUserSettings,
} from "../../utils/settings";
import { useAuthContext } from "../../hooks/useAuthContext";

const UserLocationSettings = () => {
  const { user } = useAuthContext();
  const [isLocationVisible, setIsLocationVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getUserSettings(user.token);
      setIsLocationVisible(settings.isLocationVisible);
      setLoading(false);
    };
    fetchSettings();
  }, [user.token]);

  const handleToggle = async () => {
    const newValue = !isLocationVisible;
    setIsLocationVisible(newValue);
    await updateLocationVisibility(newValue, user.token);
  };

  if (loading) return <p className="loading-text">Loading settings...</p>;

  return (
    <>
      <p className="section">Privacy</p>
      <div className="settings-button" onClick={handleToggle}>
        <label style={{ cursor: "pointer", width: "100%" }}>
          <input
            type="checkbox"
            checked={isLocationVisible}
            onChange={handleToggle}
            style={{ marginRight: "10px" }}
          />
          Share my location with others
        </label>
      </div>
    </>
  );
};

export default UserLocationSettings;
