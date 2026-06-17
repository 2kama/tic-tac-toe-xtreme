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
  const [gamesCount, setGamesCount] = useState(0);

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
        return (
          <span key={index} className="theme-piece">
            {char}
          </span>
        );
      }
    });

    return <div className="theme-piece mt-4 text-center">{colored}</div>;
  };

  const howToPlay: ReactNode[] = [
    <>
      <Image src={Play_01} alt="game box" width={150} />
      <ColorXO text="Each small box is a regular tic-tac-toe grid with nine squares." />
    </>,
    <>
      <Image src={Play_02} alt="larger tic-tac-toe" width={300} />
      <ColorXO text="Nine of these small boxes are arranged in a 3x3 grid to form one large board." />
    </>,
    <>
      <Image src={Play_03} alt="larger game win" width={300} />
      <ColorXO text="To win, get three in a row on the big board — the same way you would in normal tic-tac-toe." />
    </>,
    <>
      <Image src={Play_04} alt="win a spot" width={150} />
      <ColorXO text="Win a small game and you claim that spot on the big board with a large x or o." />
    </>,
    <>
      <Image src={Play_05} alt="larger game win" width={300} />
      <ColorXO text="Where you play inside a small box tells your opponent which small box they must play in next." />
      <ColorXO text="For example, if x plays in square 3 of any box, o must play somewhere inside box 3." />
    </>,
    <>
      <ColorXO text="So plan your moves carefully — each one decides where your opponent goes next." />
    </>,
    <>
      <div className="flex gap-6">
        <Image src={Play_04} alt="larger game win" width={150} />
        <Image src={Play_06} alt="larger game win" width={150} />
      </div>
      <ColorXO text="If you're sent to a box that's already finished, you can play in any box that's still open." />
      <ColorXO text="A box is finished once someone has won it, or all nine squares inside it are filled." />
    </>,
    <>
      <Image src={Play_07} alt="win a spot" width={150} />
      <ColorXO text="Boxes you're allowed to play in are highlighted with a light-green background." />
      <ColorXO text="You're ready — enjoy the game!" />
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

  const countGames = async () => {
    const q = query(collection(db, "games"), and(where("end", "==", true)));
    const request = await getDocs(q);
    return request.docs.length;
  };

  useEffect(() => {
    const fetchGamesCount = async () => {
      setGamesCount(await countGames());
    };
    fetchGamesCount();
  }, []);

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
      <header className="theme-surface theme-piece mb-12 p-4 text-center text-[2rem] lg:text-[5rem]">
        Tic Tac Toe Xtreme
      </header>
      <div className="flex text-xl mb-6 text-red-500">{gamesCount} games played...</div>
      <div className="flex gap-6 flex-col">
        <button className="theme-piece text-2xl hover:text-3xl" onClick={() => openModal(modals.playGame)}>
          {" "}
          [ vs Player ]{" "}
        </button>
        <button className="theme-piece text-2xl hover:text-3xl" onClick={() => openModal(modals.vsComputer)}>
          {" "}
          [ vs Computer ]{" "}
        </button>
        <button className="theme-piece text-2xl hover:text-3xl" onClick={() => openModal(modals.howToPlay)}>
          {" "}
          [ How To Play ]{" "}
        </button>
      </div>

      {showModal && (
        <div
          onClick={() => openModal("")}
          className="fixed z-40 flex h-full w-full cursor-pointer bg-black opacity-50"
        ></div>
      )}

      {showModal === modals.howToPlay && (
        <div className="theme-surface fixed left-1/2 top-1/2 z-50 box-border flex w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col p-5 sm:w-[400px]">
          <h1 className="text-center text-xl mb-10 text-green-500">How To Play</h1>
          <div className="flex flex-col items-center">{howToPlay[page]}</div>
          <div className="flex flex-row">
            <button
              className={`theme-piece w-full p-3 ${page === 0 ? "theme-nav-disabled" : ""}`}
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 0}
            >
              {"<< Prev"}
            </button>
            <button
              className={`theme-piece w-full p-3 ${page === howToPlay.length - 1 ? "theme-nav-disabled" : ""}`}
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === howToPlay.length - 1}
            >
              {"Next >>"}
            </button>
          </div>
        </div>
      )}

      {showModal === modals.vsComputer && (
        <div className="theme-surface fixed left-1/2 top-1/2 z-50 box-border flex w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col p-5 sm:w-[400px]">
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
        <div className="theme-surface fixed left-1/2 top-1/2 z-50 box-border flex w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col p-5 sm:w-[400px]">
          <h1 className="mb-10 text-center text-xl text-green-500">Play A Game</h1>
          <input
            className="theme-input mb-5 w-full p-3"
            placeholder="Player Name..."
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-row mb-14">
            <button
              className={`${buttonDisable ? "theme-disabled" : "bg-green-500 text-white"} w-full p-3`}
              disabled={buttonDisable}
              onClick={() => createGame("x")}
            >
              Play as X
            </button>
            <button
              className={`${buttonDisable ? "theme-disabled" : "bg-blue-500 text-white"} w-full p-3`}
              disabled={buttonDisable}
              onClick={() => createGame("o")}
            >
              Play as O
            </button>
          </div>

          <div className="text-red-600 text-sm w-full text-center">{errorMsg}</div>
          <button
            className={`${buttonDisable ? "theme-disabled" : "bg-red-500 text-white"} w-full p-3`}
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
