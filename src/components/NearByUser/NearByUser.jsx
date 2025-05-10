import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ProfilePreview from "../profilePreview/ProfilePreview";
import MultipleProfilePreviewSkeleton from "../skeleton/ProfilePreview/MultipleProfilePreivewSkeleton";
import { useFetch } from "../../hooks/useFetch";
import { useAuthContext } from "../../hooks/useAuthContext";

const NearbyUsers = () => {
  const myFetch = useFetch();
  const { user: currentUser } = useAuthContext();
  const [userLocation, setUserLocation] = useState(null);

  // Get user's location when component mounts
  useEffect(() => {
    const getCurrentPosition = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 Browser geolocation:", { latitude, longitude });
            setUserLocation({ latitude, longitude });
          },
          (error) => {
            console.error("❌ Geolocation error:", error.message);
          },
        );
      } else {
        console.error("❌ Geolocation not supported by this browser");
      }
    };

    // First try to use user location from context if available
    if (currentUser?.latitude && currentUser?.longitude) {
      console.log("📍 Using user location from context:", {
        latitude: currentUser.latitude,
        longitude: currentUser.longitude,
      });
      setUserLocation({
        latitude: currentUser.latitude,
        longitude: currentUser.longitude,
      });
    } else {
      // Otherwise try to get current location from browser
      getCurrentPosition();
    }
  }, [currentUser]);

  // Use derived location for API call
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  console.log("📍 Final location for API call:", { latitude, longitude });

  // Construct the API URL
  const apiUrl = `/location/nearbyusers?lat=${latitude}&lon=${longitude}&radius=10`;

  // Fetch nearby users with user's location data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nearby-users", latitude, longitude],
    queryFn: async () => {
      console.log("🔗 Calling API:", apiUrl);
      try {
        const result = await myFetch(apiUrl);
        console.log("✅ API response:", result);
        return result;
      } catch (err) {
        console.error("❌ API error:", err);
        throw err;
      }
    },
    enabled: !!latitude && !!longitude, // Only run query when location is available
  });

  // Fallback if the response is malformed or empty
  const nearby = data?.nearby || [];

  return (
    <section className="side-content-box">
      <p>Nearby Users</p>

      {!userLocation ? (
        <p>Getting your location...</p>
      ) : isLoading ? (
        <MultipleProfilePreviewSkeleton />
      ) : isError ? (
        <p>Error loading nearby users: {error?.message || "Unknown error"}</p>
      ) : nearby.length === 0 ? (
        <p>No users nearby.</p>
      ) : (
        nearby.map((loc) => {
          const user = {
            id: loc.user.id,
            username: loc.user.username,
            displayName: loc.user.displayName || loc.user.username,
            profile: {
              profilePicture: loc.user.profile?.profilePicture || null,
            },
            followers: loc.user.followers || [],
          };
          return <ProfilePreview key={user.id} user={user} />;
        })
      )}
    </section>
  );
};

export default NearbyUsers;
