import { format } from "date-fns";
import "./textBubble.scss";

const TextBubble = ({ message }) => {
  const formattedDate = format(message.createdAt, "h:mm aaa");
  const senderUsername = message.zoneId ? message.sender.username : null;

  return (
    <div className="bubble-wraper">
      {!message.fromUser && <p className="username">{senderUsername}</p>}
      <div className={message.fromUser ? "bubble right" : "bubble left"}>
        <p>{message.content}</p>
        <p className="time">{formattedDate}</p>
      </div>
    </div>
  );
};

export default TextBubble;

//format:   h:m aaaa
