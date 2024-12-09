import { useState } from "react";

const WaitingOnPlayer = () => {
  const [buttonText, setButtonText] = useState("Copy link");

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setButtonText("Copied");
    setTimeout(() => {
      setButtonText("Copy link");
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-screen absolute items-center justify-center">
      <div className="flex flex-col bg-white fixed w-[90%] sm:w-[400px] box-border p-5">
        <h1 className="text-center text-green-500 text-xl mb-10">Waiting on player...</h1>
        <p className="text-center mb-4">Share link to invite an opponent</p>
        <button onClick={copyLink} className="bg-green-500 text-white p-3 w-full">{buttonText}</button>
      </div>
    </div>
  );
};

export default WaitingOnPlayer;
