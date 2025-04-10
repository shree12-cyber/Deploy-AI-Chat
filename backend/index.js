import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import mongoose from "mongoose";
import UserChats from "./models/userChat.js";
import Chats from "./models/chat.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const port = process.env.PORT || 3000;

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connect to mongo");
  } catch (error) {
    console.log(error);
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

// app.get("/api/test", ClerkExpressRequireAuth(), (req, res) => {

//   const userId= req.auth.userId;
//   console.log(userId);

//   res.send("success");
// });

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    // CREATE A NEW CHAT
    const newChat = new Chats({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    // CHECK IF USER CHAR EXIST
    const userChats = await UserChats.find({ userId: userId });

    //IF IT NOT EXIST CREATE A NEW ONE AND ADD CHATS IN THE CHATS ARRAY
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
    } else {
      //IF EXISST PUSH THE CHAT INTO EXISTING ARRAY
      await UserChats.updateOne(
        {
          userId: userId,
        },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
      res.status(201).send(newChat._id);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating chat!!");
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const userChats = await UserChats.find({ userId });
    res.status(200).send(userChats[0].chats);
  } catch (error) {
    console.log(error);
    res.send(500).send("Error Fetching userchat!");
  }
});

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const chat = await Chats.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.send(500).send("Error Fetching Chat!");
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  console.log("HEADERS", req.headers);

  const userId = req.auth.userId;
  const { question, answer, img } = req.body;
  const newItems = [];

  if (question) {
    newItems.push({
      role: "user",
      parts: [{ text: question }],
      ...(img && { img }), // Optional image field
    });
  }

  newItems.push({
    role: "model",
    parts: [{ text: answer }],
  });

  try {
    const updatedChat = await Chats.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );

    res.status(200).send(updatedChat);
  } catch (error) {
    console.log(error);
    res.send(500).send("Error adding Chat!");
  }
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(401).send("Unauthenticated!");
});

app.listen(port, () => {
  connect();
  console.log(`Server running on ${port}`);
});
