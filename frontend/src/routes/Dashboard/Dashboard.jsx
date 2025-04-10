import React from "react";
import "./dashboard.css";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (text) => {
      const token = await getToken(); // 🔐 Clerk token

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Required for ClerkExpressRequireAuth
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Chat creation failed");
      }

      return res.json(); // Assuming it returns the chat ID
    },

    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] }); // 🧹 Invalidate cached chats
      navigate(`/dashboard/chats/${id}`); // 🚀 Navigate to new chat
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;

    if (!text) return;
    mutation.mutate(text);
  };

  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
          <h1>GPT-AI</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src="./chat.png" alt="" />
            <span>Create a New chat</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="" />
            <span>Analyse Images</span>
          </div>
          <div className="option">
            <img src="./code.png" alt="" />
            <span>Help me with my code</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input type="text" name="text" placeholder="Ask Me Anything" />
          <button>
            <img src="./arrow.png" alt="" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
