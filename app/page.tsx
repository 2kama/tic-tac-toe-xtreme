"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckDB } from "./hooks/useCheckDB";
import {
  addDoc,
  and,
  collection,
  db,
  doc,
  getDocs,
  limit,
  or,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "@/app/utils/firebase";
import { DEFAULT_FEN } from "./utils/TicTacToeXtreme";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [showPlayGameModal, setShowPlayGameModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { setGame } = useCheckDB();

  const createGame = async (side: "x" | "o") => {
    setButtonDisable(true);
    setErrorMsg("");
    await addDoc(collection(db, "games"), {
      fen: [DEFAULT_FEN],
      x: side === "x" ? name : "",
      o: side === "o" ? name : "",
      timestamp: serverTimestamp(),
      end: false,
      moves: [81],
      outCome: "X to play"
    }).then((docRef) => {
      setGame(side, docRef.id);
      router.push(`/game/${docRef.id}`);
    });
  };

  const findGame = async () => {
    setButtonDisable(true);
    setErrorMsg("");
    const q = query(collection(db, "games"), and(or(where("x", "==", ""), where("o", "==", ""))), limit(1));
    const request = await getDocs(q);

    if (request.docs.length) {
      const gameData = request.docs[0];
      const pickSide = gameData.data().x === "" ? "x" : "o";

      updateDoc(doc(db, "games", gameData.id), {
        [pickSide]: name
      }).then(() => {
        setGame(pickSide, gameData.id);
        router.push(`/game/${gameData.id}`);
      });
    } else {
      setButtonDisable(false);
      setErrorMsg("No game found");
    }
  };

  useEffect(() => {
    if (name) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [name]);

  const playAgameModal = () => {
    setShowPlayGameModal(true);
    setShowBg(true);
  }

  const closeModal = () => {
    setShowPlayGameModal(false);
    setShowBg(false);
  }

  return (
    <div className="flex flex-col w-full h-screen items-center justify-center">
      <header className="bg-white text-gray-500 text-center text-[5rem] p-4">Tic Tac Toe Xtreme</header>

      <div className="flex flex-col">
        <button onClick={playAgameModal}> Play A Game </button>
        <button> How To Play </button>
      </div>

      {showBg && <div onClick={closeModal} className="cursor-pointer flex bg-black w-full h-full fixed opacity-50"></div>}

      {showPlayGameModal && (
        
          <div className="flex flex-col bg-white fixed w-[400px] box-border p-5">
            <h1 className="text-center text-xl mb-10">Play A Game</h1>
            <input
              className="w-full bg-gray-200 p-3 text-gray-500 mb-5"
              placeholder="Player Name..."
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex flex-row mb-14">
              <button
                className={`${buttonDisable ? "bg-gray-300 text-gray-400" : "bg-green-500 text-white"} p-3 w-full`}
                disabled={buttonDisable}
                onClick={() => createGame("x")}
              >
                Play as X
              </button>
              <button
                className={`${buttonDisable ? "bg-gray-300 text-gray-400" : "bg-blue-500 text-white"} p-3 w-full`}
                disabled={buttonDisable}
                onClick={() => createGame("o")}
              >
                Play as O
              </button>
            </div>

            <div className="text-red-600 text-sm w-full text-center">{errorMsg}</div>
            <button
              className={`${buttonDisable ? "bg-gray-300 text-gray-400" : "bg-red-500 text-white"} p-3 w-full`}
              disabled={buttonDisable}
              onClick={findGame}
            >
              Find a Game
            </button>
          </div>
        
      )}
    </div>
  );
}
