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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="theme-surface box-border flex w-[90%] flex-col p-5 sm:w-[400px]">
        <h1 className="mb-10 text-center text-xl text-green-500">Waiting on player...</h1>
        <p className="theme-piece mb-4 text-center">Share link to invite an opponent</p>
        <button onClick={copyLink} className="w-full bg-green-500 p-3 text-white">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default WaitingOnPlayer;
