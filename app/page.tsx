"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
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
import Image from "next/image";

import Play_01 from "./images/howToPlay/play_01.png";
import Play_02 from "./images/howToPlay/play_02.png";
import Play_03 from "./images/howToPlay/play_03.png";
import Play_04 from "./images/howToPlay/play_04.png";
import Play_05 from "./images/howToPlay/play_05.png";
import Play_06 from "./images/howToPlay/play_06.png";
import Play_07 from "./images/howToPlay/play_07.png";
import { computerLevels, modals } from "./utils/constants";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(0);

  const { setGame, setLevel } = useCheckDB();

  const ColorXO = ({ text }: { text: string }) => {
    const check = ["x", "o"];
    const colored = text.split("").map((char, index) => {
      if (check.includes(char.toLowerCase())) {
        return (
          <span key={index} className="text-red-400">
            {char}
          </span>
        );
      } else {
        return <span key={index}>{char}</span>;
      }
    });

    return <div className="mt-4 text-center">{colored}</div>;
  };

  const howToPlay: ReactNode[] = [
    <>
      <Image src={Play_01} alt="game box" width={150} />
      <ColorXO text="This is a game box with nine(9) squares... typical tic-tac-toe" />
    </>,
    <>
      <Image src={Play_02} alt="larger tic-tac-toe" width={300} />
      <ColorXO text="There are nine(9) game boxes in a game forming a larger tic-tac-toe board" />
    </>,
    <>
      <Image src={Play_03} alt="larger game win" width={300} />
      <ColorXO text="The goal of the game is to win the larger tic-tac-toe board just as you would any tic-tac-toe game" />
    </>,
    <>
      <Image src={Play_04} alt="win a spot" width={150} />
      <ColorXO text="You win a box when you win the game in that box." />
    </>,
    <>
      <Image src={Play_05} alt="larger game win" width={300} />
      <ColorXO text="Each player plays their turn in the game box that matches the position of the square where the opponent just played." />
      <ColorXO text="i.e if player-X plays in square-2 of any game box, player-O's next play would be in game-box-2 ...and so on..." />
    </>,
    <>
      <ColorXO text="So try to think through your next play, because it determines where next your opponent would play." />
    </>,
    <>
      <div className="flex gap-6">
        <Image src={Play_04} alt="larger game win" width={150} />
        <Image src={Play_06} alt="larger game win" width={150} />
      </div>
      <ColorXO text="If a player is sent to a game-box that is unplayable, then they can choose from any available playable game boxes" />
      <ColorXO text="Unplayable game-boxes are boxes that have either been won or have all squares filled." />
    </>,
    <>
      <Image src={Play_07} alt="win a spot" width={150} />
      <ColorXO text="Playable/valid-play game boxes would have a light-green background. This should help you get the hang of the game." />
      <ColorXO text="Enjoy!" />
    </>
  ];

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

  const vsComputer = (level: string) => {
    setLevel(level);
    router.push("/vscomputer");
  };

  useEffect(() => {
    if (name) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [name]);

  const openModal = (_modal: string) => {
    setShowModal(_modal);
  };

  useEffect(() => {
    setPage(0);
  }, [showModal]);

  return (
    <div className="flex flex-col w-full h-screen items-center justify-center">
      <header className="bg-white text-gray-500 text-center text-[2rem] lg:text-[5rem] p-4 mb-12">
        Tic Tac Toe Xtreme
      </header>

      <div className="flex gap-6 flex-col">
        <button className="text-2xl hover:text-3xl" onClick={() => openModal(modals.playGame)}>
          {" "}
          [ vs Player ]{" "}
        </button>
        <button className="text-2xl hover:text-3xl" onClick={() => openModal(modals.vsComputer)}>
          {" "}
          [ vs Computer ]{" "}
        </button>
        <button className="text-2xl hover:text-3xl" onClick={() => openModal(modals.howToPlay)}>
          {" "}
          [ How To Play ]{" "}
        </button>
      </div>

      {showModal && (
        <div
          onClick={() => openModal("")}
          className="cursor-pointer flex bg-black w-full h-full fixed opacity-50"
        ></div>
      )}

      {showModal === modals.howToPlay && (
        <div className="flex flex-col bg-white fixed w-[90%] sm:w-[400px] box-border p-5">
          <h1 className="text-center text-xl mb-10 text-green-500">How To Play</h1>
          <div className="flex flex-col items-center">{howToPlay[page]}</div>
          <div className="flex flex-row">
            <button
              className={`${page === 0 ? "text-gray-300" : ""} p-3 w-full`}
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 0}
            >
              {"<< Prev"}
            </button>
            <button
              className={`${page === howToPlay.length - 1 ? "text-gray-300" : ""} p-3 w-full`}
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === howToPlay.length - 1}
            >
              {"Next >>"}
            </button>
          </div>
        </div>
      )}

      {showModal === modals.vsComputer && (
        <div className="flex flex-col bg-white fixed w-[90%] sm:w-[400px] box-border p-5">
          <h1 className="text-center text-xl mb-10 text-green-500">Play vs Computer</h1>
          <div className="flex flex-col gap-6">
            <button className={`p-3 w-full bg-green-500 text-white`} onClick={() => vsComputer(computerLevels.easy)}>
              {computerLevels.easy}
            </button>
            <button
              className={`p-3 w-full bg-blue-500 text-white`}
              onClick={() => vsComputer(computerLevels.intermediate)}
            >
              {computerLevels.intermediate}
            </button>
            <button className={`p-3 w-full bg-red-500 text-white`} onClick={() => vsComputer(computerLevels.hard)}>
              {computerLevels.hard}
            </button>
          </div>
        </div>
      )}

      {showModal === modals.playGame && (
        <div className="flex flex-col bg-white fixed w-[90%] sm:w-[400px] box-border p-5">
          <h1 className="text-center text-xl mb-10 text-green-500">Play A Game</h1>
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
