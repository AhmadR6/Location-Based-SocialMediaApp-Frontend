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
  const [messages, setMessages] = useState([]);
  const [currentZone, setCurrentZone] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const currentZoneRef = useRef(null);
  const bottomChatRef = useRef(null);
  const inputRef = useRef(null);
  const lastPositionRef = useRef(null);
  const pfp_url = useLocation().state?.url;

  useEffect(() => {
    currentZoneRef.current = currentZone;
  }, [currentZone]);

  useEffect(() => {
    socketRef.current = io(VITE_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
      withCredentials: true,
      secure: process.env.NODE_ENV === "production",
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
      toast.error("Failed to connect to chat service. Retrying...");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const { isPending, isError } = useQuery({
    queryFn: () => myFetch(`/zone-messages?zoneId=${currentZone?.id}`),
    queryKey: ["zoneMessages", currentZone?.id],
    enabled: !!currentZone?.id && isConnected,
    onSuccess: (data) => {
      setMessages(
        data?.messages?.map((msg) => ({
          ...msg,
          fromUser: msg.senderId === currUserId,
        })) || [],
      );
    },
    onError: (err) => {
      console.error("Fetch messages error:", err);
      toast.error("Failed to load messages");
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = { latitude, longitude };

        if (
          !lastPositionRef.current ||
          calculateDistance(lastPositionRef.current, currentPosition) > 0.1
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
        console.error("Geolocation error:", error);
        toast.error(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      },
    );

    socketRef.current.on("location-chat-joined", (zoneData) => {
      setCurrentZone({
        id: zoneData.id,
        location: zoneData.name || `Zone ${zoneData.id}`,
        coords: { lat: zoneData.latitude, lng: zoneData.longitude },
      });
      setOnlineUsers(zoneData.onlineUsers || 0);
      if (zoneData.messages) {
        setMessages(
          zoneData.messages.map((msg) => ({
            ...msg,
            fromUser: msg.senderId === currUserId,
          })),
        );
      }
    });

    socketRef.current.on("users-update", ({ zoneId, onlineUsers }) => {
      if (currentZoneRef.current?.id === zoneId) {
        setOnlineUsers(onlineUsers);
      }
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socketRef.current.off("location-chat-joined");
      socketRef.current.off("users-update");
    };
  }, [currUserId]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const tempIndex = prev.findIndex(
          (m) =>
            m.id?.startsWith("temp-") &&
            m.senderId === msg.senderId &&
            m.content === msg.content &&
            Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000,
        );
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = {
            ...msg,
            fromUser: msg.senderId === currUserId,
          };
          return newMessages;
        }
        return [...prev, { ...msg, fromUser: msg.senderId === currUserId }];
      });
    };

    socketRef.current.on("new-location-message", handleNewMessage);

    return () => {
      socketRef.current.off("new-location-message", handleNewMessage);
    };
  }, [currUserId]);

  useEffect(() => {
    if (bottomChatRef.current && messages.length > 0) {
      bottomChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!currentZone?.id) throw new Error("No active zone");
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: currUserId,
        createdAt: new Date().toISOString(),
        fromUser: true,
        sender: {
          id: currUserId,
          displayName: user.displayName,
          username: user.username,
        },
      };
      setMessages((prev) => [...prev, tempMessage]);
      return { content, zoneId: currentZone.id, tempMessage };
    },
    onSuccess: ({ content, zoneId, tempMessage }) => {
      socketRef.current.emit("send-location-message", {
        zoneId,
        senderId: currUserId,
        content,
      });
      setInput("");
      inputRef.current?.focus();
    },
    onError: (error, _, { tempMessage }) => {
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      toast.error("Failed to send message");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessageMutation.mutate(input);
    }
  };

  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return Infinity;
    const R = 6371;
    const dLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.latitude * Math.PI) / 180) *
        Math.cos((pos2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  if (!isConnected) {
    return (
      <div className="content DM">
        <BackNav label="Connecting..." customNav="/p/map" />
        <div className="chat-messages">
          <Loader loading={true} message="Connecting to chat service..." />
        </div>
      </div>
    );
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        sendMessageMutation.mutate(input);
      }
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
        {!currentZone ? (
          <div className="chat-messages">
            <Loader loading={true} message="Finding your location..." />
          </div>
        ) : isPending ? (
          <div className="chat-messages">
            <Loader loading={true} message="Loading messages..." />
          </div>
        ) : isError ? (
          <BadRequest />
        ) : (
          <div className="chat-messages">
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <div key={`${msg.id}-${i}`}>
                  {i > 0 &&
                    new Date(msg.createdAt).toDateString() !==
                      new Date(messages[i - 1].createdAt).toDateString() && (
                      <p className="msg-date">
                        {format(new Date(msg.createdAt), "EEE, do MMM yyyy")}
                      </p>
                    )}
                  <TextBubble message={msg} />
                </div>
              ))
            ) : (
              <div className="no-messages">
                <p>No messages in this zone yet</p>
                <p>Be the first to say hello!</p>
              </div>
            )}
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
              onKeyDown={handleKeyDown}
              placeholder={
                currentZone
                  ? "Message nearby users..."
                  : "Waiting for location..."
              }
              disabled={!currentZone || sendMessageMutation.isPending}
            />
            <button
              type="submit"
              disabled={
                !currentZone || !input.trim() || sendMessageMutation.isPending
              }
            >
              {sendMessageMutation.isPending ? (
                <Loader loading={true} size={16} />
              ) : (
                <IconSend size={16} />
              )}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
