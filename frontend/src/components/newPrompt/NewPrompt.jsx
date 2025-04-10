import React, { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "hello,i have 2 dogs " }],
      },
      {
        role: "model",
        parts: [{ text: "Nice to meet you" }],
      },
    ],
    generationConfig: {
      // maxOutputTokens:100,
    },
  });

  const endRef = useRef(null);
  const fromRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data,question, answer, img.dbData]);

  const { getToken } = useAuth();
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken(); // 🔐 Clerk token

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${data._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Required for ClerkExpressRequireAuth
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.length ? question : undefined,
            answer,
            img: img.dbData?.filePath || undefined,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Chat creation failed");
      }

      return res.json(); // Assuming it returns the chat ID
    },

    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          fromRef.current.reset();
          setQuestion("");
          setAnswer("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        }); // 🧹 Invalidate cached chats
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const add = async (text,isInitial) => {
    if(!isInitial) setQuestion(text);
    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;

        setAnswer(accumulatedText);
      }

      mutation.mutate();
    } catch (error) {
      console.log(error);
    }

    // console.log(text);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;

    add(text,false);
  };
  
  //IN PRODUCTION WE DIDNT NEED IT  
  const hasRun=useRef(false);
  useEffect(() => {
    if(!hasRun.current){

      if(data?.history.length===1){
        add(data.history[0].parts[0].text,true); 
      }
    }
    hasRun.current=true;
  }, [])
  

  return (
    <>
      {img.isLoading && <div className="">...loading</div>}
      {img?.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img?.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
          onLoad={() => {
            // Scroll only after image is loaded
            endRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>

      <form className="newForm" onSubmit={handleSubmit} ref={fromRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
