"use client";

import { useEffect, useState } from "react";
import { DocumentData } from "../utils/firebase";
import { DEFAULT_FEN, MovesType, TicTacToeXtreme } from "../utils/TicTacToeXtreme";
import PlayGround from "../components/PlayGround";
import Outcome from "../game/[gameid]/Outcome";
import { selectComputerMove } from "../utils/computerAI";
import { useCheckDB } from "../hooks/useCheckDB";

const playAs: Array<"x" | "o"> = ["o", "x"];
const randomPick: "o" | "x" = playAs[Math.floor(Math.random() * playAs.length)];
const computerPick = randomPick === "x" ? "o" : "x";

const newGame = {
  end: false,
  fen: [DEFAULT_FEN],
  moves: [81],
  outCome: "X to play",
  timestamp: new Date().getTime(),
  x: randomPick === "x" ? "You" : "Computer",
  o: randomPick === "o" ? "You" : "Computer"
} as unknown as DocumentData;

const MIN_COMPUTER_THINKING_MS = 3000;

const VsComputer = () => {
  const [gameData, setGameData] = useState<DocumentData | null>(newGame);
  const { getLevel } = useCheckDB();
  const [level] = useState(getLevel());
  const [thinking, setThinking] = useState(false);
  const [whomToPlay, setWhomToPlay] = useState<"x" | "o">("x");

  const game = new TicTacToeXtreme(gameData?.fen[gameData?.fen.length - 1]);

  const onPlay = (data: MovesType) => {
    if (whomToPlay === data.play) {
      setWhomToPlay(() => (data.play === "x" ? "o" : "x"));

      const result = game.play(data);
      setGameData((prev) => ({
        ...prev,
        fen: [...gameData?.fen, result.fen],
        end: result.end,
        outCome: result.outCome,
        moves: [...gameData?.moves, data.game * 9 + data.row * 3 + data.col]
      }));
    }
  };

  useEffect(() => {
    if (game.turn !== computerPick || gameData?.end) return;

    setThinking(true);
    const thinkingStartedAt = Date.now();
    let cancelled = false;
    let finishTimeoutId: number | undefined;

    const startTimeoutId = window.setTimeout(() => {
      const move = selectComputerMove(game.fen, level, computerPick, randomPick);
      const remaining = Math.max(0, MIN_COMPUTER_THINKING_MS - (Date.now() - thinkingStartedAt));

      finishTimeoutId = window.setTimeout(() => {
        if (cancelled) return;

        if (move) {
          onPlay(move);
        }

        setThinking(false);
      }, remaining);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimeoutId);
      if (finishTimeoutId !== undefined) {
        window.clearTimeout(finishTimeoutId);
      }
    };
  }, [gameData, level]);

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center">
      <title>Tic Tac Toe Xtreme | vs Computer</title>

      <header className="theme-surface theme-piece fixed top-0 w-full p-4 text-center text-sm lg:text-lg">
        <a href="/" className="fixed top-0 left-0 p-4 bg-red-500 text-white">
          &lt; Home
        </a>
        Tic Tac Toe Xtreme
      </header>

      {thinking && (
        <div className="theme-surface theme-thinking-text fixed inset-0 z-[9999] flex items-center justify-center gap-3 opacity-80">
          <div className="spinner-container">
            <div
              className="spinner"
              style={{
                width: 20,
                height: 20,
                border: `2px solid green`,
                borderColor: "green transparent transparent transparent"
              }}
            ></div>
          </div>
          Computer is thinking...
        </div>
      )}

      {gameData && (
        <>
          <div className="w-full text-center mb-5 text-red-500">{level} Mode</div>
          <div className="w-[95%] sm:w-[70%] md:w-[560px] lg:w-[670px]">
            <PlayGround
              allowPlay={!game.isGameOver && game.turn === randomPick}
              onPlay={onPlay}
              gameId={"vscomputer"}
              fen={game.fen}
              highlightSquares={[gameData.moves[gameData.moves.length - 1]]}
            />
          </div>
          <Outcome computer={true} gameData={{ ...gameData, outCome: game.outCome }} />
        </>
      )}
    </div>
  );
};

export default VsComputer;
