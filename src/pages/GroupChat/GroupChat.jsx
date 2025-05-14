import { useEffect, useRef, useState } from "react";
import BackNav from "../../components/backNav/BackNav";
import "./chats.scss";
import { Form, useLocation } from "react-router-dom";
import { IconSend } from "@tabler/icons-react";
import { useFetch } from "../../hooks/useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import TextBubble from "../../components/DM/TextBubble";
import TextareaAutosize from "react-textarea-autosize";
import { useAuthContext } from "../../hooks/useAuthContext";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Loader from "../../components/Loaders/Loader";
import BadRequest from "../../pages/Error/BadRequest";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

const GroupChat = () => {
  const { user } = useAuthContext();
  const currUserId = Number(user.id);
  const myFetch = useFetch();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [currentZone, setCurrentZone] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const socketRef = useRef(null);
  const bottomChatRef = useRef(null);
  const inputRef = useRef(null);
  const pfp_url = useLocation().state?.url;
  const lastPositionRef = useRef(null);

  // Fetch messages for current zone
  const { data, isPending, isError } = useQuery({
    queryFn: () => myFetch(`/zone-messages?zoneId=${currentZone?.id}`),
    queryKey: ["zoneMessages", currentZone?.id],
    enabled: !!currentZone,
  });

  useEffect(() => {
    if (bottomChatRef.current) {
      bottomChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages]);

  // Distance calculation helper
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return Infinity;

    // Simple Euclidean distance - you may want a more accurate geo-distance formula
    const latDiff = pos1.latitude - pos2.latitude;
    const lngDiff = pos1.longitude - pos2.longitude;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io.connect(VITE_SERVER_URL);

    // Handle geolocation with throttling
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = { latitude, longitude };

        // Only emit if position changed meaningfully (> 0.001 degrees ~100m)
        // Or if it's the first position update
        if (
          !lastPositionRef.current ||
          calculateDistance(lastPositionRef.current, currentPosition) > 0.001
        ) {
          lastPositionRef.current = currentPosition;

          socketRef.current.emit("join-location-chat", {
            lat: latitude,
            lng: longitude,
            userId: currUserId,
          });
        }
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    // Listen for zone join confirmation
    socketRef.current.on("location-chat-joined", (zoneData) => {
      setCurrentZone({
        id: zoneData.id,
        location:
          zoneData.latitude && zoneData.longitude
            ? `${zoneData.latitude.toFixed(2)}, ${zoneData.longitude.toFixed(2)}`
            : `Zone ${zoneData.id}`,
      });

      setOnlineUsers(zoneData.onlineUsers || 0);

      // Update local messages cache if needed
      if (zoneData.messages?.length) {
        queryClient.setQueryData(["zoneMessages", zoneData.id], {
          messages: zoneData.messages,
        });
      }
    });

    // Listen for new messages
    socketRef.current.on("new-location-message", (msg) => {
      queryClient.setQueryData(["zoneMessages", currentZone?.id], (old) => ({
        ...old,
        messages: [
          ...(old?.messages || []),
          {
            ...msg,
            fromUser: msg.senderId === currUserId,
          },
        ],
      }));

      // Scroll to bottom on new message
      if (bottomChatRef.current) {
        bottomChatRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currUserId, queryClient]);

  // Message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!currentZone?.id) throw new Error("No active zone");
      socketRef.current.emit("send-location-message", {
        zoneId: currentZone.id,
        senderId: currUserId,
        content,
      });
    },
    onSuccess: () => {
      setInput("");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error("Message error:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessageMutation.mutate(input);
    }
  };

  return (
    <div className="content DM">
      <div>
        <BackNav
          label={`${currentZone?.location || "Nearby Chat"} (${onlineUsers} online)`}
          customNav="/p/map"
          image={pfp_url}
        />

        {isPending ? (
          <div className="chat-messages">
            <Loader loading={isPending} />
          </div>
        ) : isError ? (
          <BadRequest />
        ) : (
          <div className="chat-messages">
            {data?.messages?.map((msg, i) => (
              <div key={`${msg.id || i}-${msg.createdAt}`}>
                {i > 0 &&
                  data.messages[i].createdAt.substring(0, 10) !==
                    data.messages[i - 1].createdAt.substring(0, 10) && (
                    <p className="msg-date">
                      {format(
                        new Date(data.messages[i].createdAt),
                        "EEE, do MMM yyyy",
                      )}
                    </p>
                  )}
                <TextBubble message={msg} />
              </div>
            ))}
            <div ref={bottomChatRef} />
          </div>
        )}

        <div className="chat-input">
          <Form onSubmit={handleSubmit}>
            <TextareaAutosize
              ref={inputRef}
              maxRows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message nearby users..."
              disabled={!currentZone}
            />
            <button
              type="submit"
              disabled={
                !currentZone || !input.trim() || sendMessageMutation.isPending
              }
            >
              <IconSend size={16} />
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
