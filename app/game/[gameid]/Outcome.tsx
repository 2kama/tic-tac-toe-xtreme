"use client";

import { DocumentData } from "@/app/utils/firebase";

type Props = {
  gameData: DocumentData;
  computer?: boolean;
  computerThinking?: boolean;
  onReplay?: () => void;
};

type PlayerSlotProps = {
  side: "x" | "o";
  name: string;
  isActive: boolean;
  isThinking: boolean;
};

const PlayerSlot = ({ side, name, isActive, isThinking }: PlayerSlotProps) => {
  const displayName = name || "Waiting...";

  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 transition-opacity ${
        isActive ? "player-slot-active" : "opacity-40"
      }`}
    >
      <span className="theme-piece shrink-0 text-lg font-normal opacity-50 md:text-2xl">
        {side === "x" ? "X" : "O"}
      </span>
      <div className="theme-piece flex min-w-0 items-center gap-1 text-sm md:text-xl">
        <span className="truncate">{displayName}</span>
        {isThinking && name === "Computer" && (
          <span className="hourglass-spin shrink-0 text-base md:text-lg" aria-label="Computer is thinking">
            ⏳
          </span>
        )}
      </div>
    </div>
  );
};

const Outcome = ({ gameData, computer = false, computerThinking = false, onReplay }: Props) => {
  const gameInPlay = gameData.outCome.toLowerCase().includes("to play");
  const gameOver = !gameInPlay;
  const XtoPlay = gameData.outCome.toLowerCase().includes("x to play");
  const OtoPlay = gameData.outCome.toLowerCase().includes("o to play");
  const gameDraw = gameData.outCome.toLowerCase().includes("draw");
  const X_Won = gameData.outCome.toLowerCase().includes("x won");
  const O_Won = gameData.outCome.toLowerCase().includes("o won");

  const outcomeWordings = (side: "x" | "o", player: string) => {
    if (side === "x") {
      return player === "You" ? "Your(x) Turn" : "Computer(x)'s Turn";
    }
    return player === "You" ? "Your(o) Turn" : "Computer(o)'s Turn";
  };

  const statusText = (() => {
    if (gameDraw) return "Draw";
    if (X_Won) return `${gameData.x}(x) Won`;
    if (O_Won) return `${gameData.o}(o) Won`;
    if (gameInPlay && XtoPlay) {
      return computer ? outcomeWordings("x", gameData.x) : `${gameData.x}(x)'s Turn`;
    }
    if (gameInPlay && OtoPlay) {
      return computer ? outcomeWordings("o", gameData.o) : `${gameData.o}(o)'s Turn`;
    }
    return "";
  })();

  return (
    <div className="mt-8 flex w-full max-w-md flex-col gap-3 px-4 md:mt-12">
      <p className="min-h-[1.5rem] text-center text-sm text-red-600 md:text-lg" aria-live="polite">
        {statusText}
      </p>
      {computer && gameOver && onReplay ? (
        <button
          type="button"
          onClick={onReplay}
          className="w-full rounded-lg bg-green-500 p-3 text-white hover:bg-green-600"
        >
          Replay
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <PlayerSlot
            side="x"
            name={gameData.x}
            isActive={gameInPlay && XtoPlay}
            isThinking={computerThinking && gameData.x === "Computer"}
          />
          <PlayerSlot
            side="o"
            name={gameData.o}
            isActive={gameInPlay && OtoPlay}
            isThinking={computerThinking && gameData.o === "Computer"}
          />
        </div>
      )}
    </div>
  );
};

export default Outcome;
