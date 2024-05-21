"use client";
import { useState, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  const MODEL_NAME = "gemini-1.0-pro-001";

  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI.getGenerativeModel({ model: MODEL_NAME }).startChat({
          generativeConfig: generationConfig,
          safetySettings,
          history: messages.map((msg) => ({ text: msg.text, role: msg.role })),
        });
        setChat(newChat);
        setError(null); // Clear any previous errors if initialization is successful
      } catch {
        setError(" ");
      }
    };
    initChat();
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      const userMessage = { text: userInput, role: "user", timestamp: new Date() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = { text: result.response.text(), role: "bot", timestamp: new Date() };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setError(null); // Clear any previous errors if message sending is successful
      }
    } catch {
      alert("cannot give personal opinions,hate speech,slangs and dangerous content.please refresh")
      setError("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const primary = "bg-dark-blue";
  const secondary = "bg-gray-800";
  const accent = "bg-green-500";
  const text = "text-gray-100";

  const botAvatar = "https://img.icons8.com/?size=64&id=b2rw9AoJdaQb&format=png"; // Replace with actual bot avatar URL
  const userAvatar = "https://img.icons8.com/?size=40&id=41799&format=png"; // Replace with actual user avatar URL

  return (
    <div className={`flex flex-col h-screen items-center justify-center ${primary}`}>
      <div className={`w-[600px] h-[600px] flex flex-col p-4 ${secondary} rounded-lg`}>
        <div className="flex justify-between items-center mb-4 sticky top-0 z-10">
          <h1 className={`text-3xl ${text}`}>AI ChatBot powered by Google Gemini</h1>
        </div>
        <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-2`}>
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <img
                src={msg.role === "user" ? userAvatar : botAvatar}
                alt={`${msg.role} avatar`}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <span
                  className={`p-2 rounded-lg ${
                    msg.role === "user" ? `${accent} text-white` : `bg-dark-green text-white`
                  }`}
                >
                  {msg.text}
                </span>
                <p className={`text-xs ${text} mt-4`}>
                  {msg.role === "bot" ? "Bot" : "You"} - {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="flex items-center mt-4">
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 p-2 rounded-md border-t border-b border-l focus:outline-none focus:border-${accent} text-black`}
          />
          <button
            onClick={handleSendMessage}
            className={`p-2 ${accent} text-white ml-2 rounded-md hover:bg-opacity-80 focus:outline-none`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
