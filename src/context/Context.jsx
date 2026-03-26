import React, { createContext, useState } from "react";
import runChat from "../config/gemini";


export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  // Animate the response one word at a time
  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 30 * index); // faster animation
  };

  const newChat = () => {
    setInput("");
    setShowResult(false);
    setLoading(false);
    setResultData("");
    setRecentPrompt("");
  };

  const onSent = async (prompt) => {
    const finalPrompt = prompt || input;

    if (!finalPrompt.trim()) {
      console.warn("Prompt is empty.");
      return;
    }

    setResultData("");
    setShowResult(true);
    setLoading(true);
    setRecentPrompt(finalPrompt);
    setPrevPrompts((prev) => [...prev, finalPrompt]);

    let response;

    try {
      response = await runChat(finalPrompt);

      // If response is not a string, convert or handle
      if (typeof response !== "string") {
        console.error("Response is not a string:", response);
        setResultData("⚠️ Unexpected response format.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error from runChat:", err);
      setResultData("❌ Response Limit Exceeded.");
      setLoading(false);
      return;
    }

    // Format markdown-style **bold** and *newlines*
    let responseArray = response.split("**");
    let formatted = "";

    for (let i = 0; i < responseArray.length; i++) {
      formatted += i % 2 === 1
        ? `<b>${responseArray[i]}</b>`
        : responseArray[i];
    }

    let htmlReady = formatted.split("*").join("<br/>");
    let words = htmlReady.split(" ");

    // Animate word-by-word
    words.forEach((word, i) => delayPara(i, word + " "));

    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setShowResult,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
