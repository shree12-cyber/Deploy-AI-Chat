import React from "react";
import "./chatList.css";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@clerk/clerk-react";

const ChatList = () => {
  const { getToken } = useAuth();

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      const token = await getToken(); // ✅ Await token here

      const res = await fetch(`${import.meta.env.VITE_API_URL}/userchats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Clerk token
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user chats");
      }

      return res.json();
    },
  });
  return (
    <div className="chatList">
      <span className="title">DAHBOARD</span>
      <Link to="/dashboard">Create a new chat </Link>
      <Link to="/dashboard ">Contact </Link>
      <hr />
      <div className="list">
        {isPending
          ? "...LOADING"
          : error
          ? "SOMETHING WENT WRONG "
          : data?.map((chat) => (
              <Link to={`dashboard/chats/${chat._id}`} key={chat._id}>
                {chat.title}
              </Link>
            ))}
      </div>
      <hr />
      <div className="upgrade">
        <div className="texts">
          <div className="texts">
            <span>Upgrade to PRO</span>
            <span>GET UNLIMITED ACCESS TO ALL FEATURES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
