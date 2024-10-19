"use client";

import Image from "next/image";
import X from "../images/x.png";
import O from "../images/o.png";
import X_Win from "../images/x-win.png";
import O_Win from "../images/o-win.png";
import Big_O_Win from "../images/big/o-win.png";
import Big_X_Win from "../images/big/x-win.png";
import Big_O from "../images/big/o.png";
import Big_X from "../images/big/x.png";
import empty from "../images/empty.png";
import draw from "../images/draw.png";

type PlayGroundProps = {
  gameId: string;
  fen: string;
  highlightSquares?: number[];
  allowPlay?: boolean;
  onPlay: (data: { game: number; row: number; col: number; play: "x" | "o" }) => void;
};

const PlayGround = ({ gameId, fen, highlightSquares = [], allowPlay = true, onPlay }: PlayGroundProps) => {
  const token = fen.split("|");

  const rowColumn = [0, 1, 2];

  const checkWinPattern = (player: "x" | "o", game: string[]): Number[] => {
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

    if (value === "x") {
      return (
        <Image
          src={gameDecision === "x" && winPatterns.includes(row * 3 + col) ? Big_X_Win : Big_X}
          alt="X"
          width={150}
          className="-mt-[100%] hover:opacity-25"
        />
      );
    } else if (value === "o") {
      return (
        <Image
          src={gameDecision === "o" && winPatterns.includes(row * 3 + col) ? Big_O_Win : Big_O}
          alt="O"
          width={150}
          className="-mt-[100%] hover:opacity-25"
        />
      );
    } else if (value === "d") {
      return <Image src={draw} alt="Draw" width={150} className="-mt-[100%] hover:opacity-25" />;
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

  const DisplayGameBox = ({ tokenSpread, game }: { tokenSpread: string; game: number }) => {
    const cellValue = tokenSpread.split("");
    const gameDecision = token[9].split("")[game];
    const winPatterns = gameDecision !== "-" ? checkWinPattern(gameDecision as "x" | "o", cellValue) : [];

    const ShowCellValue = ({
      cellValue,
      data
    }: {
      cellValue: string;
      data: { game: number; row: number; col: number; play: "x" | "o" };
    }) => {
      const cellClassName = `${
        highlightSquares?.includes(data.game * 9 + data.row * 3 + data.col) ? "bg-yellow-100 " : ""
      }p-[6%]`;

      if (cellValue === "x") {
        return (
          <td className={cellClassName}>
            <Image
              src={gameDecision === "x" && winPatterns.includes(data.row * 3 + data.col) ? X_Win : X}
              alt="X"
              width={50}
            />
          </td>
        );
      }

      if (cellValue === "o") {
        return (
          <td className={cellClassName}>
            <Image
              src={gameDecision === "o" && winPatterns.includes(data.row * 3 + data.col) ? O_Win : O}
              alt="O"
              width={50}
            />
          </td>
        );
      }

      return (
        <td
          className={`${cellClassName} ${isPlayable(game) ? "cursor-pointer hover:bg-yellow-100" : ""}`}
          onClick={isPlayable(game) ? () => onPlay(data) : () => null}
        >
          <Image src={empty} alt="Empty" width={50} />
        </td>
      );
    };

    return (
      <table className="w-full flex flex-col">
        <tbody className="w-full flex flex-col">
          {rowColumn.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="flex">
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
    <table className="w-full flex flex-col">
      <tbody className="w-full flex flex-col">
        {rowColumn.map((row: number, rowIndex: number) => (
          <tr key={`row-${rowIndex}`} className="flex">
            {rowColumn.map((column, colIndex) => (
              <td
                key={`row-${rowIndex}--col-${colIndex}`}
                className={`${isPlayable(rowIndex * 3 + colIndex) ? "bg-green-50 " : ""}p-[7%]`}
              >
                <DisplayGameBox tokenSpread={ThreeByThreeBox(token)[row][column]} game={rowIndex * 3 + colIndex} />
                <BoxWin value={ThreeByThreeBox(token[9].split(""))[row][column]} row={rowIndex} col={colIndex} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayGround;