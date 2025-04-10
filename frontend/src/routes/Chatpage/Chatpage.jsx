import "./chatpage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

const Chatpage = () => {
  const { getToken } = useAuth();

  const path = useLocation().pathname;
  const chatid = path.split("/").pop();
  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatid],
    queryFn: async () => {
      const token = await getToken(); // ✅ Await token here

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chats/${chatid}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Clerk token
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user chats");
      }

      return res.json();
    },
  });
  console.log(data);

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isPending
            ? "Loading...."
            : error
            ? "SOMETHING WENT WRONG IN CHATPAGE   "
            : data?.history?.map((message, index) => (
                <>
                  {message.img && (
                    <IKImage
                      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                      path={message.img}
                      height="300"
                      width="400"
                      transformation={[{ height: 300, width: 400 }]}
                      loading="lazy"
                      lqip={{ active: true, quality: 20 }}
                    />
                  )}
                  <div
                    key={index}
                    className={
                      message.role === "user" ? "message user" : "message"
                    }
                  >
                    <Markdown>{message.parts[0].text}</Markdown>
                  </div>
                </>
              ))}
          {data &&<NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
