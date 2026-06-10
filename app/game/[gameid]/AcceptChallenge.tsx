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
    }).then(() => {
        window.location.reload();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="theme-surface box-border flex w-[90%] flex-col p-5 sm:w-[400px]">
        <h1 className="mb-10 text-center text-xl text-green-500">Accept Challenge</h1>
        <input
          className="theme-input mb-5 w-full p-3"
          placeholder="Your Name..."
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className={`w-full p-3 ${!name ? "theme-disabled" : "bg-red-500 text-white"}`}
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
