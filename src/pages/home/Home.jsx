// //Home page . ie Feed
// import { useState } from "react";
// import "./home.scss";
// import PostCard from "../../components/postCard/PostCard";
// import ProfilePreview from "../../components/profilePreview/ProfilePreview";
// import { useQuery } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import Loader from "../../components/Loaders/Loader";
// import BadRequest from "../Error/BadRequest";
// import { useFetch } from "../../hooks/useFetch";
// import MultiplePostCardSkeleton from "../../components/skeleton/PostCardSkeleton/MultiplePostCardSkeleton";
// import MultipleProfilePreviewSkeleton from "../../components/skeleton/ProfilePreview/MultipleProfilePreivewSkeleton";
// import AnnouncementSkeleton from "../../components/skeleton/Announcement/AnnouncementSkeleton";

// const Home = () => {
//   const myFetch = useFetch();
//   const navigate = useNavigate();
//   const [feedSort, setFeedSort] = useState("recent"); //or following

//   function handleClick(postId) {
//     navigate(`/p/posts/${postId}`);
//   }

//   const feedQuery = useQuery({
//     queryKey: ["feed", "post"],
//     queryFn: () => myFetch("/init"),
//   });

//   const {
//     new_post = [],
//     new_follower_posts = [],
//     new_users = [],
//     top_users = [],
//   } = feedQuery.data || {};

//   return (
//     <div className="content" id="home-page">
//       <div className="content-main">
//         <div className="feed-options">
//           <span
//             onClick={() => setFeedSort("recent")}
//             className={feedSort == "recent" ? "selected" : ""}
//           >
//             Recent
//           </span>
//           <span
//             onClick={() => setFeedSort("following")}
//             className={feedSort == "following" ? "selected" : ""}
//           >
//             Following
//           </span>
//         </div>
//         {feedQuery.isLoading ? (
//           <MultiplePostCardSkeleton />
//         ) : // <Loader loading={feedQuery.isLoading} />
//         feedQuery.isError ? (
//           <BadRequest />
//         ) : feedSort == "recent" ? (
//           new_post.map((post) => (
//             <PostCard
//               key={post.id}
//               post={post}
//               handleClick={() => handleClick(post.id)}
//               pageQueryKey={["feed", "post"]}
//             />
//           ))
//         ) : new_follower_posts.length === 0 ? (
//           <p className="no-results">No following posts</p>
//         ) : (
//           new_follower_posts.map((post) => (
//             <PostCard
//               key={post.id}
//               post={post}
//               handleClick={() => handleClick(post.id)}
//               pageQueryKey={["feed", "post"]}
//             />
//           ))
//         )}
//       </div>
//       <div className="content-side">
//         {feedQuery.isLoading ? (
//           <>
//             <section className="side-content-box">
//               <p>Latest users</p>
//               <MultipleProfilePreviewSkeleton />
//             </section>
//             <section className="side-content-box">
//               <p>Most followed</p>
//               <MultipleProfilePreviewSkeleton />
//             </section>
//             <AnnouncementSkeleton />
//           </>
//         ) : (
//           <>
//             <section className="side-content-box">
//               <p>Latest users</p>
//               {new_users.map((user) => (
//                 <ProfilePreview key={user.id} user={user} />
//               ))}
//             </section>
//             <section className="side-content-box">
//               <p>Most followed</p>
//               {top_users.map((user) => (
//                 <ProfilePreview key={user.id} user={user} />
//               ))}
//             </section>
//             <div className="announcement">
//               <p>Announcements</p>
//               <ul>
//                 <li>Added animations to loading pages</li>
//                 <li>Added Skeleton Loading to home page</li>
//               </ul>

//               <p>Last updated: 5 May 2025</p>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

import { useState } from "react";
import "./home.scss";
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

const Home = () => {
  const myFetch = useFetch();
  const navigate = useNavigate();
  const [feedSort, setFeedSort] = useState("recommended"); // Default to recommended

  function handleClick(postId) {
    navigate(`/p/posts/${postId}`);
  }

  // Query for initial data (recent, following, users)
  const feedQuery = useQuery({
    queryKey: ["feed", "post"],
    queryFn: () => myFetch("/init"),
  });

  // Query for recommended posts
  const recommendedQuery = useQuery({
    queryKey: ["feed", "recommended"],
    queryFn: () => myFetch("/posts/recommended"),
    enabled: feedSort === "recommended", // Only fetch when recommended is selected
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
        <div className="feed-options">
          <span
            onClick={() => setFeedSort("recommended")}
            className={feedSort === "recommended" ? "selected" : ""}
          >
            Recommended
          </span>
          <span
            onClick={() => setFeedSort("recent")}
            className={feedSort === "recent" ? "selected" : ""}
          >
            Recent
          </span>
          <span
            onClick={() => setFeedSort("following")}
            className={feedSort === "following" ? "selected" : ""}
          >
            Following
          </span>
        </div>
        {feedSort === "recommended" ? (
          recommendedQuery.isLoading ? (
            <MultiplePostCardSkeleton />
          ) : recommendedQuery.isError ? (
            <BadRequest />
          ) : !recommendedQuery.data?.posts ||
            recommendedQuery.data.posts.length === 0 ? (
            <p className="no-results">No recommended posts available</p>
          ) : (
            recommendedQuery.data.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                handleClick={() => handleClick(post.id)}
                pageQueryKey={["feed", "recommended"]}
              />
            ))
          )
        ) : feedSort === "recent" ? (
          feedQuery.isLoading ? (
            <MultiplePostCardSkeleton />
          ) : feedQuery.isError ? (
            <BadRequest />
          ) : new_post.length === 0 ? (
            <p className="no-results">No recent posts</p>
          ) : (
            new_post.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                handleClick={() => handleClick(post.id)}
                pageQueryKey={["feed", "post"]}
              />
            ))
          )
        ) : feedQuery.isLoading ? (
          <MultiplePostCardSkeleton />
        ) : feedQuery.isError ? (
          <BadRequest />
        ) : new_follower_posts.length === 0 ? (
          <p className="no-results">No following posts</p>
        ) : (
          new_follower_posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              handleClick={() => handleClick(post.id)}
              pageQueryKey={["feed", "post"]}
            />
          ))
        )}
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
              <p>Last updated: 5 May 2025</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
