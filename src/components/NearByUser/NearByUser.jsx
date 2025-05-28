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
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const getCurrentPosition = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
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

    if (currentUser?.latitude && currentUser?.longitude) {
      setUserLocation({
        latitude: currentUser.latitude,
        longitude: currentUser.longitude,
      });
    } else {
      getCurrentPosition();
    }
  }, [currentUser]);

  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const apiUrl = `/location/nearbyusers?lat=${latitude}&lon=${longitude}&radius=10`;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nearby-users", latitude, longitude],
    queryFn: async () => {
      const result = await myFetch(apiUrl);
      return result;
    },
    enabled: !!latitude && !!longitude,
  });

  const nearby = data?.nearby || [];
  const shownUsers = showAll ? nearby : nearby.slice(0, 5);

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
        <>
          {shownUsers.map((loc) => {
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
          })}

          {nearby.length > 5 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default NearbyUsers;
