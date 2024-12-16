"use client";

import { useEffect, useState } from "react";
import PlayGround from "../../components/PlayGround";
import { TicTacToeXtreme } from "../../utils/TicTacToeXtreme";
import { db, doc, DocumentData, onSnapshot, updateDoc } from "@/app/utils/firebase";
import { useCheckDB } from "@/app/hooks/useCheckDB";
import WaitingOnPlayer from "./WaitingOnPlayer";
import AcceptChallenge from "./AcceptChallenge";
import Outcome from "./Outcome";

type Props = {
  params: { gameid: string };
};

export default function GamePage({ params: { gameid } }: Props) {
  const [gameData, setGameData] = useState<DocumentData | null>();
  const { exist, XorO, player } = useCheckDB();
  const [isPlayer, setIsPlayer] = useState(false);
  const [acceptChallenge, showAcceptChallenge] = useState(false);
  //const [history, setHistory] = useState(1);
  const [titleText, setTitleText] = useState("Tic Tac Toe Xtreme");

  //UPDATE GAME
  const updateGame = (updateData: Record<string, boolean | string | string[] | number[]>) => {
    return updateDoc(doc(db, "games", gameid), {
      ...updateData
    });
  };

  //CHECK IF IS A PLAYER
  useEffect(() => {
    if (exist() && player(gameid)) {
      setIsPlayer(true);
    } else {
      setIsPlayer(false);
    }
  }, []);

  //CHECK IF GAME DOESN'T HAVE COMPLETE OPPONENTS
  useEffect(() => {
    if (gameData && (gameData.x === "" || gameData.o === "") && !isPlayer) {
      showAcceptChallenge(true);
      setTitleText(`Tic-Tac-Toe Extreme | Accept Challenge from ${gameData.x === "" ? gameData.o : gameData.x}`);
    } else {
      showAcceptChallenge(false);
      setTitleText(`Tic-Tac-Toe Extreme | Watch ${gameData?.x} vs ${gameData?.o} game.`);
    }
  }, [gameData]);

  //GET GAME DATA
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "games", gameid), (doc) => {
      if (doc.exists()) {
        setGameData(() => doc.data());
      } else {
        alert("not found");
      }
    });

    return unsub;
  }, []);

  const game = new TicTacToeXtreme(gameData?.fen[gameData?.fen.length - 1]);

  const onPlay = (data: { game: number; row: number; col: number; play: "x" | "o" }) => {
    const result = game.play(data);
    updateGame({
      fen: [...gameData?.fen, result.fen],
      end: result.end,
      outCome: result.outCome,
      moves: [...gameData?.moves, data.game * 9 + data.row * 3 + data.col]
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center">
      {gameData && (
        <>
          <title>{titleText}</title>
          <header className="bg-white w-full fixed top-0 text-gray-500 text-center text-sm lg:text-lg p-4">
            <a href="/" className="fixed top-0 left-0 p-4 bg-red-500 text-white">
              &lt; Home
            </a>
            Tic Tac Toe Xtreme
          </header>
          {(gameData.x === "" || gameData.o === "" || acceptChallenge) && (
            <div className="cursor-pointer flex bg-black w-full h-full fixed opacity-50"></div>
          )}
          {isPlayer && (gameData.x === "" || gameData.o === "") && <WaitingOnPlayer />}
          {acceptChallenge && (
            <AcceptChallenge updateGame={updateGame} playAs={gameData.x === "" ? "x" : "o"} gameid={gameid} />
          )}
          <div className="w-[95%] sm:w-[70%] md:w-[560px] lg:w-[670px]">
            <PlayGround
              allowPlay={!gameData.end && game.turn === XorO(gameid) && gameData.x !== "" && gameData.o !== ""}
              onPlay={onPlay}
              gameId={gameid}
              fen={gameData.fen[gameData.fen.length - 1]}
              highlightSquares={[gameData.moves[gameData.moves.length - 1]]}
            />
          </div>
          <Outcome gameData={gameData} />
        </>
      )}
    </div>
  );
}
