import { useNavigate } from "react-router-dom";
import "./createPage.scss";

const CreatePage = () => {
  const navigate = useNavigate();
  return (
    <div className="content">
      <div className="main-content">
        <button
          className="create-btn"
          onClick={() => navigate("/p/create/post")}
        >
          Create New Post
        </button>
        <button
          className="create-btn"
          onClick={() => navigate("/p/create/events")}
        >
          Create New Event
        </button>
      </div>
      <div className="side-content"></div>
    </div>
  );
};

export default CreatePage;
