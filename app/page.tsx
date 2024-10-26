"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckDB } from "./hooks/useCheckDB";
import { addDoc, and, collection, db, doc, getDocs, limit, or, query, serverTimestamp, updateDoc, where } from "@/app/utils/firebase";
import { DEFAULT_FEN } from "./utils/TicTacToeXtreme";


export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);

  const { setGame } = useCheckDB();

  const createGame = async (side: "x" | "o") => {
    setButtonDisable(true);
    await addDoc(collection(db, "games"), {
      fen: [DEFAULT_FEN],
      x: side === "x" ? name : "",
      o: side === "o" ? name : "",
      timestamp: serverTimestamp(),
      end: false,
      moves: [81],
      outCome: "X to play",
    }).then((docRef) => {
      setGame(side, docRef.id);
      router.push(`/game/${docRef.id}`);
    });
  }

  const findGame = async () => {
    setButtonDisable(true);
    const q = query(
      collection(db, "games"),
      and(
        or(where("x", "==", ""), where("o", "==", ""))
      ),
      limit(1)
    );
    const request = await getDocs(q);

    if (request.docs.length) {
      const gameData = request.docs[0];
      const pickSide = gameData.data().x === "" ? "x" : "o";

      updateDoc(doc(db, "games", gameData.id), {
        [pickSide]: name,
      }).then(() => {
        setGame(pickSide, gameData.id);
        router.push(`/game/${gameData.id}`);
      });
    } else {
      setButtonDisable(false);
      alert("No game found");
    }
  }

  useEffect(() => {
    if (name) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [name]);

  return (
    <>
      <button>
         Play A Game
      </button>

      <div>
        <input placeholder="Name" type="text" value={name} onChange={e => setName(e.target.value)} />
        <button disabled={buttonDisable} onClick={() => createGame("x")}>Play as X</button>
        <button disabled={buttonDisable} onClick={() => createGame("o")}>Play as O</button>
        <button disabled={buttonDisable} onClick={findGame}>Find a Game</button>
      </div>
    </>
  )
}