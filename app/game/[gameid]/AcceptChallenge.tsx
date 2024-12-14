import { useCheckDB } from "@/app/hooks/useCheckDB";
import { useState } from "react";

type Props = {
  updateGame: (updateData: Record<string, boolean | string | string[] | number[]>) => Promise<void>;
  playAs: "x" | "o";
  gameid: string;
};

const AcceptChallenge = ({ updateGame, playAs, gameid }: Props) => {
  const [name, setName] = useState("");
  const { setGame } = useCheckDB();

  const acceptChallenge = async () => {
    const updateData = { [playAs]: name };
    await updateGame(updateData).then(() => {
      setGame(playAs, gameid);
    });
  };

  return (
    <div className="flex flex-col w-full h-screen absolute items-center justify-center">
      <div className="flex flex-col bg-white fixed w-[90%] sm:w-[400px] box-border p-5">
        <h1 className="text-center text-xl text-green-500 mb-10">Accept Challenge</h1>
        <input
          className="w-full bg-gray-200 p-3 text-gray-500 mb-5"
          placeholder="Your Name..."
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className={`${!name ? "bg-gray-300 text-gray-400" : "bg-red-500 text-white"} p-3 w-full`}
          disabled={!name}
          onClick={acceptChallenge}
        >
          Accept Challenge
        </button>
      </div>
    </div>
  );
};

export default AcceptChallenge;
