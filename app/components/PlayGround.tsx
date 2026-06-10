"use client";

import Image from "next/image";
import empty from "../images/empty.png";
import draw from "../images/draw.png";
import drawDark from "../images/draw-dark.png";
import { useDarkMode } from "../hooks/useDarkMode";
import { MovesType, TicTacToeXtreme } from "../utils/TicTacToeXtreme";
import useSound from "use-sound";
import { useEffect } from "react";

type PlayGroundProps = {
  gameId: string;
  fen: string;
  highlightSquares?: number[];
  allowPlay?: boolean;
  onPlay: (data: MovesType) => void;
};

const PlayGround = ({ gameId, fen, highlightSquares = [], allowPlay = true, onPlay }: PlayGroundProps) => {
  const { isDark } = useDarkMode();
  const token = fen.split("|");

  const rowColumn = [0, 1, 2];

  const soundGame = new TicTacToeXtreme(fen);

  //PlayGround sounds
  const [playXMove] = useSound("/sounds/x-sound.mp3");
  const [playOMove] = useSound("/sounds/o-sound.mp3");
  const [playOverSound] = useSound("/sounds/over-sound.wav", { volume: 0.05 });

  useEffect(() => {
    if (soundGame.isGameOver) {
      playOverSound();
    } else {
      if (soundGame.turn === "x" && soundGame.turns > 0) {
        playOMove();
      } else if (soundGame.turn === "o") {
        playXMove();
      }
    }
  }, [fen]);

  const checkWinPattern = (player: "x" | "o", game: string[]): number[] => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6] // diagonals
    ];

    return (
      winPatterns
        .map((pattern) => {
          if (pattern.every((cell) => game[cell] === player)) {
            return pattern;
          }
          return [];
        })
        .filter((pattern) => pattern.length > 0)[0] || []
    );
  };

  const ThreeByThreeBox = (arr: string[]) => {
    return [
      [arr[0], arr[1], arr[2]],
      [arr[3], arr[4], arr[5]],
      [arr[6], arr[7], arr[8]]
    ];
  };

  const BoxWin = ({ value, row, col }: { value: string; row: number; col: number }) => {
    const gameDecision = token[token.length - 4];
    const winPatterns = gameDecision !== "-" ? checkWinPattern(gameDecision as "x" | "o", token[9].split("")) : [];
    const bigWinClassName =
      "theme-surface absolute inset-0 z-10 flex items-center justify-center text-[min(18vw,9rem)] leading-none hover:opacity-25";

    const isRedX = gameDecision === "x" && winPatterns.includes(row * 3 + col);
    const isRedO = gameDecision === "o" && winPatterns.includes(row * 3 + col);

    if (value === "x") {
      return (
        <div className={`${bigWinClassName} ${isRedX ? "text-red-500" : "theme-piece"}`}>x</div>
      );
    } else if (value === "o") {
      return (
        <div className={`${bigWinClassName} ${isRedO ? "text-red-500" : "theme-piece"}`}>o</div>
      );
    } else if (value === "d") {
      return (
        <div className={`${bigWinClassName}`}>
          <Image
            src={isDark ? drawDark : draw}
            alt="Draw"
            width={150}
            height={150}
            className="h-[70%] w-[70%] object-contain"
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const isPlayable = (game: number) => {
    return (
      allowPlay &&
      (Number(token[token.length - 2]) === game || token[token.length - 2] === "-") &&
      token[9].split("")[game] === "-"
    );
  };

  const DisplayGameBox = ({
    tokenSpread,
    game,
    isPlayableBox
  }: {
    tokenSpread: string;
    game: number;
    isPlayableBox: boolean;
  }) => {
    const cellValue = tokenSpread.split("");
    const gameDecision = token[9].split("")[game];
    const winPatterns = gameDecision !== "-" ? checkWinPattern(gameDecision as "x" | "o", cellValue) : [];

    const ShowCellValue = ({
      cellValue,
      data
    }: {
      cellValue: string;
      data: MovesType;
    }) => {
      const isHighlighted = highlightSquares?.includes(data.game * 9 + data.row * 3 + data.col);
      const cellClassName = `${isHighlighted ? "bg-yellow-100 " : ""}relative h-full w-1/3`;

      const cellValueClassName =
        "flex h-full w-full items-center justify-center text-[min(4vw,1.75rem)] leading-none sm:text-2xl lg:text-3xl";

      const isRedX = gameDecision === "x" && winPatterns.includes(data.row * 3 + data.col);
      const isRedO = gameDecision === "o" && winPatterns.includes(data.row * 3 + data.col);

      const pieceColorClass = (isRed: boolean) => {
        if (isRed) return "text-red-500";
        if (isHighlighted || isPlayableBox) return "text-[#000000]";
        return "theme-piece";
      };

      if (cellValue === "x") {
        return (
          <td className={cellClassName}>
            <div className={`${cellValueClassName} ${pieceColorClass(isRedX)}`}>x</div>
          </td>
        );
      }

      if (cellValue === "o") {
        return (
          <td className={cellClassName}>
            <div className={`${cellValueClassName} ${pieceColorClass(isRedO)}`}>o</div>
          </td>
        );
      }

      return (
        <td
          className={`${cellClassName} ${isPlayable(game) ? "cursor-pointer hover:bg-yellow-100" : ""}`}
          onClick={isPlayable(game) ? () => onPlay(data) : () => null}
        >
          <div className="flex h-full w-full items-center justify-center">
            <Image src={empty} alt="Empty" width={50} height={50} className="h-[65%] w-[65%] object-contain" />
          </div>
        </td>
      );
    };

    return (
      <table className="flex h-full w-full flex-col">
        <tbody className="flex h-full w-full flex-col">
          {rowColumn.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="flex min-h-0 flex-1">
              {rowColumn.map((column, colIndex) => (
                <ShowCellValue
                  key={`row${rowIndex}-col${colIndex}`}
                  data={{
                    game,
                    row: rowIndex,
                    col: colIndex,
                    play: token[token.length - 1] as "x" | "o"
                  }}
                  cellValue={ThreeByThreeBox(cellValue)[row][column]}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div key={gameId} className="aspect-square w-full">
      <table className="flex h-full w-full flex-col">
        <tbody className="flex h-full w-full flex-col">
          {rowColumn.map((row: number, rowIndex: number) => (
            <tr key={`row-${rowIndex}`} className="large flex min-h-0 flex-1">
              {rowColumn.map((column, colIndex) => {
                const playable = isPlayable(rowIndex * 3 + colIndex);

                return (
                <td
                  key={`row-${rowIndex}--col-${colIndex}`}
                  className={`large relative h-full w-1/3 p-[4%] md:p-[7%] ${playable ? "playable-box bg-green-50 " : ""}`}
                >
                  <div className="relative h-full w-full">
                    <DisplayGameBox
                      tokenSpread={ThreeByThreeBox(token)[row][column]}
                      game={rowIndex * 3 + colIndex}
                      isPlayableBox={playable}
                    />
                    <BoxWin value={ThreeByThreeBox(token[9].split(""))[row][column]} row={rowIndex} col={colIndex} />
                  </div>
                </td>
              );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayGround;
