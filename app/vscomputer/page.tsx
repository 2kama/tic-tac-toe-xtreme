"use client";

import { useEffect, useState } from "react";
import { DocumentData } from "../utils/firebase";
import { DEFAULT_FEN, TicTacToeXtreme } from "../utils/TicTacToeXtreme";
import PlayGround from "../components/PlayGround";
import Outcome from "../game/[gameid]/Outcome";
import { MovesType } from "../utils/TicTacToeXtreme";
import {
  cancelOpponentWinBoxScore,
  computerLevels,
  normalPlayScore,
  opponentCancelWinBoxScore,
  opponentNormalPlayScore,
  opponentWillDrawTheGameScore,
  opponentWinBoxScore,
  winBoxScore
} from "../utils/constants";
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

const VsComputer = () => {
  const [gameData, setGameData] = useState<DocumentData | null>(newGame);
  const { getLevel } = useCheckDB();
  const [level] = useState(getLevel());
  const [timeOut, addTimeOut] = useState<boolean>(false);
  const [thinking, setThinking] = useState<boolean>(false);

  useEffect(() => {
    const time = setTimeout(() => {
      addTimeOut(true);
    }, 4000);

    return () => clearTimeout(time);
  }, []);

  const game = new TicTacToeXtreme(gameData?.fen[gameData?.fen.length - 1]);

  const onPlay = (data: MovesType) => {
    if (data === undefined) {
      console.log("data", data);
    } else {
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

  const token = game.token;

  const isPlayable = (game: number, checkToken: string[]) => {
    return (
      (Number(checkToken[checkToken.length - 2]) === game || checkToken[checkToken.length - 2] === "-") &&
      checkToken[9].split("")[game] === "-"
    );
  };

  const getResultOfProposedMove = (data: MovesType, checkFen: string) => {
    const { game, row, col, play } = data;
    const currentGame = new TicTacToeXtreme(checkFen);
    const result = currentGame.play({ game, row, col, play });
    return result;
  };

  const checkIfComputerCancelsOpponentWin = (checkGame: string, wherePlayed: number) => {
    const gamePositions = checkGame.split("");

    // Define the almost winning combinations for each position
    const winConditions = {
      0: [
        [1, 2], // Row 0
        [3, 6], // Column 0
        [4, 8] // Diagonal top-left to bottom-right
      ],
      1: [
        [0, 2], // Row 0
        [4, 7] // Column 1
      ],
      2: [
        [0, 1], // Row 0
        [5, 8], // Column 2
        [4, 6] // Diagonal top-right to bottom-left
      ],
      3: [
        [0, 6], // Column 0
        [4, 5] // Row 1
      ],
      4: [
        [1, 7], // Column 1
        [3, 5], // Row 1
        [0, 8], // Diagonal top-left to bottom-right
        [2, 6] // Diagonal top-right to bottom-left
      ],
      5: [
        [2, 8], // Column 2
        [3, 4] // Row 1
      ],
      6: [
        [0, 3], // Column 0
        [7, 8], // Row 2
        [2, 4] // Diagonal top-right to bottom-left
      ],
      7: [
        [1, 4], // Column 1
        [6, 8] // Row 2
      ],
      8: [
        [2, 5], // Column 2
        [6, 7], // Row 2
        [0, 4] // Diagonal top-left to bottom-right
      ]
    };

    // Get the relevant play position
    const conditions = winConditions[wherePlayed as keyof typeof winConditions];

    // Check if any cancel condition is met
    return conditions.some((condition) => condition.every((index) => gamePositions[index] === randomPick));
  };

  const checkPossibleResultOfOpponentNextMove = (possibleFen: string) => {
    const proposedOpponentGame = new TicTacToeXtreme(possibleFen);
    let possibleMoves: MovesType[] = [];
    for (let i = 0; i < 9; i++) {
      if (isPlayable(i, proposedOpponentGame.token)) {
        const cellValue = proposedOpponentGame.token[i].split("");
        for (let j = 0; j < 9; j++) {
          if (cellValue[j] === "-") {
            possibleMoves.push({ game: i, row: Math.floor(j / 3), col: j % 3, play: randomPick });
          }
        }
      }
    }

    let worstMoveScore = 0;

    for (const possibleMove of possibleMoves) {
      const proposedImpartonOpponent = getResultOfProposedMove(possibleMove, possibleFen);

      const proposedImpartonOpponentGame = new TicTacToeXtreme(proposedImpartonOpponent.fen);

      if (proposedImpartonOpponent.end) {
        if (proposedImpartonOpponentGame.whoWon !== "d") {
          worstMoveScore = -10;
          break;
        } else {
          // A draw case
          worstMoveScore = opponentWillDrawTheGameScore;
        }
        continue;
      }

      const gameState = proposedImpartonOpponentGame.token[9].split("");
      const targetGame = possibleMove.game;
      const targetCell = possibleMove.row * 3 + possibleMove.col;
      const possibleToken = possibleFen.split("|");

      // check if opponent will win the box
      if (gameState[targetGame] === randomPick) {
        worstMoveScore = opponentWinBoxScore;
        break;
      }
      // check if opponent will have a chance to choose any box
      else if (possibleToken[possibleToken.length - 2] === "-") {
        worstMoveScore = -2;
        break;
      }
      // check if opponent will block computer win
      else if (checkIfComputerCancelsOpponentWin(proposedImpartonOpponent.fen.split("|")[targetGame], targetCell)) {
        worstMoveScore = opponentCancelWinBoxScore;
        break;
      }
      // just a normal move
      else {
        worstMoveScore = opponentNormalPlayScore;
      }
    }

    return worstMoveScore;
  };

  const computerMove = () => {
    let possibleMoves: MovesType[] = [];
    for (let i = 0; i < 9; i++) {
      if (isPlayable(i, token)) {
        const cellValue = token[i].split("");
        for (let j = 0; j < 9; j++) {
          if (cellValue[j] === "-") {
            possibleMoves.push({ game: i, row: Math.floor(j / 3), col: j % 3, play: computerPick });
          }
        }
      }
    }

    let bestMoveScore = 0;
    let bestPossibleMoves: MovesType[] = [];

    const updateBestMove = (move: MovesType, score: number, consequenceScore: number) => {
      const updatedScore = score + consequenceScore;
      if (bestMoveScore < updatedScore) {
        bestMoveScore = updatedScore;
        bestPossibleMoves = [move];
      } else if (bestMoveScore === updatedScore) {
        bestPossibleMoves.push(move);
      }
    };

    if (level === computerLevels.easy) {
      // easy level
      onPlay(possibleMoves[Math.floor(Math.random() * possibleMoves.length)]);
      setThinking(false);
    } else {
      // intermediate and hard levels
      for (const possibleMove of possibleMoves) {
        const proposedImpartonComputer = getResultOfProposedMove(possibleMove, game.fen);

        const proposedImpartonComputerGame = new TicTacToeXtreme(proposedImpartonComputer.fen);

        if (proposedImpartonComputer.end) {
          if (proposedImpartonComputerGame.whoWon !== "d") {
            onPlay(possibleMove); // Computer wins
            break;
          } else {
            // A draw case
            bestMoveScore = 5;
            bestPossibleMoves = [possibleMove];
          }
          continue;
        }

        const gameState = proposedImpartonComputerGame.token[9].split("");
        const targetGame = possibleMove.game;
        const targetCell = possibleMove.row * 3 + possibleMove.col;

        const consequenceScore =
          level === computerLevels.hard ? checkPossibleResultOfOpponentNextMove(proposedImpartonComputer.fen) : 0;

        // check if computer will win the box
        if (gameState[targetGame] === computerPick) {
          updateBestMove(possibleMove, winBoxScore, consequenceScore);
        }
        // check if computer will block opponent win
        else if (checkIfComputerCancelsOpponentWin(proposedImpartonComputer.fen.split("|")[targetGame], targetCell)) {
          updateBestMove(possibleMove, cancelOpponentWinBoxScore, consequenceScore);
        }
        // just a normal move
        else {
          updateBestMove(possibleMove, normalPlayScore, consequenceScore);
        }
      }

      onPlay(bestPossibleMoves[Math.floor(Math.random() * bestPossibleMoves.length)]);
      setThinking(false);
    }
  };

  useEffect(() => {
    if (game.turn !== randomPick && !gameData?.end && timeOut) {
      setThinking(true);
      setTimeout(
        () => {
          computerMove();
        },
        level === computerLevels.easy ? 2000 : level === computerLevels.intermediate ? 3000 : 4000
      );
    }
  }, [gameData, timeOut]);

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center">
      <title>Tic Tac Toe Xtreme | vs Computer</title>
      <a href="/" className="absolute top-0 left-0 p-4 bg-red-500 text-white">
        &lt; Home
      </a>
      <div className="absolute top-2 text-xl">X-tic-tac-toe</div>

      {thinking && (
        <div className="flex gap-3 items-center opacity-80 bg-white fixed p-16">
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
              allowPlay={!gameData.end && game.turn === randomPick}
              onPlay={onPlay}
              gameId={"vscomputer"}
              fen={gameData.fen[gameData.fen.length - 1]}
              highlightSquares={[gameData.moves[gameData.moves.length - 1]]}
            />
          </div>
          <Outcome computer={true} gameData={gameData} />
        </>
      )}
    </div>
  );
};

export default VsComputer;
