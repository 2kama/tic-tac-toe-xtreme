"use client";

import { useEffect, useState } from "react";
import PlayGround from "../../components/PlayGround";
import { TicTacToeXtreme } from "../../utils/TicTacToeXtreme";
import { db, doc, DocumentData, onSnapshot, updateDoc } from "@/app/utils/firebase";
import { useCheckDB } from "@/app/hooks/useCheckDB";
import WaitingOnPlayer from "./WaitingOnPlayer";
import AcceptChallenge from "./AcceptChallenge";

type Props = {
  params: { gameid: string };
};

export default function GamePage({ params: { gameid } }: Props) {
  const [gameData, setGameData] = useState<DocumentData | null>();
  const { exist, XorO, player } = useCheckDB();
  const [isPlayer, setIsPlayer] = useState(false);
  const [acceptChallenge, showAcceptChallenge] = useState(false);
  const [history, setHistory] = useState(1);
  const [showEndGame, setShowEndGame] = useState(false);
  const [titleText, setTitleText] = useState("Tic Tac Toe Xtreme");

  //UPDATE GAME
  const updateGame = (updateData: any) => {
    return updateDoc(doc(db, "games", gameid), {
      ...updateData,
    });
  };

  //CHECK IF IS A PLAYER
  useEffect(() => {
    exist(gameid) && player(gameid) ? setIsPlayer(true) : setIsPlayer(false);
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

  let game = new TicTacToeXtreme(gameData?.fen[gameData?.fen.length - history]);

  const onPlay = (data: { game: number; row: number; col: number; play: "x" | "o" }) => {
    let result = game.play(data);
    updateGame({
      fen: [...gameData?.fen, result.fen],
      end: result.end,
      outCome: result.outCome,
      moves: [...gameData?.moves, data.game * 9 + data.row * 3 + data.col],
    })
  };

  return (
    <>
      {gameData && (
        <>
        <title>{titleText}</title>
        {isPlayer && (gameData.x === "" || gameData.o === "") && (
          <WaitingOnPlayer />
        )}
        {acceptChallenge && (
          <AcceptChallenge updateGame={updateGame} playAs={gameData.x === "" ? "x" : "o"} gameid={gameid} />
        )}
          <div className="w-[60%]">
            <PlayGround
              allowPlay={!gameData.end && game.turn === XorO(gameid) && gameData.x !== "" && gameData.o !== ""}
              onPlay={onPlay}
              gameId={gameid}
              fen={gameData.fen[gameData.fen.length - history]}
              highlightSquares={[gameData.moves[gameData.moves.length - history]]}
            />
          </div>
        </>
      )}
    </>
  );
}
