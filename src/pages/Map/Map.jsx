//Home page . ie Feed
import { useState } from "react";
import "./map.scss";
import PostCard from "../../components/postCard/PostCard";
import ProfilePreview from "../../components/profilePreview/ProfilePreview";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loaders/Loader";
import BadRequest from "../Error/BadRequest";
import { useFetch } from "../../hooks/useFetch";
import MultiplePostCardSkeleton from "../../components/skeleton/PostCardSkeleton/MultiplePostCardSkeleton";
import MultipleProfilePreviewSkeleton from "../../components/skeleton/ProfilePreview/MultipleProfilePreivewSkeleton";
import AnnouncementSkeleton from "../../components/skeleton/Announcement/AnnouncementSkeleton";
import NearbyUsers from "../../components/NearByUser/NearByUser";
import MapView from "../../components/MapView/MapView";

const Home = () => {
  const myFetch = useFetch();
  const navigate = useNavigate();
  const [feedSort, setFeedSort] = useState("recent"); //or following

  function handleClick(postId) {
    navigate(`/p/posts/${postId}`);
  }

  const feedQuery = useQuery({
    queryKey: ["feed", "post"],
    queryFn: () => myFetch("/init"),
  });

  const {
    new_post = [],
    new_follower_posts = [],
    new_users = [],
    top_users = [],
  } = feedQuery.data || {};

  return (
    <div className="content" id="home-page">
      <div className="content-main">
        <MapView />
      </div>
      <div className="content-side">
        {feedQuery.isLoading ? (
          <>
            <section className="side-content-box">
              <p>Latest users</p>
              <MultipleProfilePreviewSkeleton />
            </section>
            <section className="side-content-box">
              <p>Most followed</p>
              <MultipleProfilePreviewSkeleton />
            </section>
            <AnnouncementSkeleton />
          </>
        ) : (
          <>
            <section className="side-content-box">
              <NearbyUsers />
            </section>
            <section className="side-content-box">
              <p>Latest users</p>
              {new_users.map((user) => (
                <ProfilePreview key={user.id} user={user} />
              ))}
            </section>
            <section className="side-content-box">
              <p>Most followed</p>
              {top_users.map((user) => (
                <ProfilePreview key={user.id} user={user} />
              ))}
            </section>
            <div className="announcement">
              <p>Announcements</p>
              <ul>
                <li>Added animations to loading pages</li>
                <li>Added Skeleton Loading to home page</li>
              </ul>

              <p>Last updated: 5 june 2025</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
