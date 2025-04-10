import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Chatpage from "./routes/Chatpage/Chatpage";
import Homepage from "./routes/Hompage/Homepage";
import Dashboard from "./routes/Dashboard/Dashboard";
import RootLayout from "./layouts/rootLayout/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import SignInPage from "./routes/signInPage/SignInPage";
import SignUpPage from './routes/signOutPage/SignUpPage'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/sign-up",
        element: <SignUpPage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <Chatpage />,
          },
        ],
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
