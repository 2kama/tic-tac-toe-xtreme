"use client";

import { useState } from "react";
import PlayGround from "./components/PlayGround";
import { DEFAULT_FEN, TicTacToeXtreme } from "./utils/TicTacToeXtreme";

export default function Home() {
  const [currentFen, setCurrentFen] = useState(DEFAULT_FEN);

  let game = new TicTacToeXtreme(currentFen);

  const onPlay = (data: { game: number; row: number; col: number; play: "x" | "o" }) => {
    setCurrentFen(game.play(data));
  };

  return (
    <div className="w-[60%]">
      <PlayGround allowPlay={!game.isGameOver} onPlay={onPlay} gameId="123" fen={currentFen} />
    </div>
  );
}
