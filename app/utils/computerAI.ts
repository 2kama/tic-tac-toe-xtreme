import { computerLevels, drawTheGameScore, winTheGameScore } from "./constants";
import { MovesType, TicTacToeXtreme } from "./TicTacToeXtreme";

const META_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const LOOKAHEAD_DEPTH: Record<string, number> = {
  [computerLevels.easy]: 2,
  [computerLevels.intermediate]: 4,
  [computerLevels.hard]: 6
};

const isPlayableBox = (box: number, checkToken: string[]) => {
  return (
    (Number(checkToken[checkToken.length - 2]) === box || checkToken[checkToken.length - 2] === "-") &&
    checkToken[9].split("")[box] === "-"
  );
};

const getLegalMoves = (fen: string, play: "x" | "o"): MovesType[] => {
  const token = new TicTacToeXtreme(fen).token;
  const moves: MovesType[] = [];

  for (let i = 0; i < 9; i++) {
    if (!isPlayableBox(i, token)) continue;
    const cellValue = token[i].split("");
    for (let j = 0; j < 9; j++) {
      if (cellValue[j] === "-") {
        moves.push({ game: i, row: Math.floor(j / 3), col: j % 3, play });
      }
    }
  }

  return moves;
};

const playMove = (fen: string, move: MovesType) => {
  const game = new TicTacToeXtreme(fen);
  return game.play(move);
};

const evaluateMetaBoard = (token: string[], computer: "x" | "o", human: "x" | "o") => {
  const meta = token[9].split("");
  let score = 0;

  for (const line of META_LINES) {
    const cells = line.map((i) => meta[i]);
    const computerCount = cells.filter((c) => c === computer).length;
    const humanCount = cells.filter((c) => c === human).length;
    const openCount = cells.filter((c) => c === "-").length;

    if (computerCount > 0 && humanCount > 0) continue;

    if (computerCount === 2 && openCount === 1) score += 3;
    if (humanCount === 2 && openCount === 1) score -= 4;
    if (computerCount === 1 && openCount === 2) score += 1;
    if (humanCount === 1 && openCount === 2) score -= 1;
  }

  if (meta[4] === computer) score += 1;
  if (meta[4] === human) score -= 1;

  return score;
};

const terminalScore = (fen: string, computer: "x" | "o", human: "x" | "o") => {
  const state = new TicTacToeXtreme(fen);

  if (!state.isGameOver) return null;
  if (state.whoWon === computer) return winTheGameScore * 100;
  if (state.whoWon === human) return -winTheGameScore * 100;
  return drawTheGameScore;
};

const evaluatePosition = (fen: string, computer: "x" | "o", human: "x" | "o") => {
  const terminal = terminalScore(fen, computer, human);
  if (terminal !== null) return terminal;

  return evaluateMetaBoard(new TicTacToeXtreme(fen).token, computer, human);
};

const minimax = (
  fen: string,
  depth: number,
  maximizing: boolean,
  computer: "x" | "o",
  human: "x" | "o",
  alpha: number,
  beta: number
): number => {
  const terminal = terminalScore(fen, computer, human);
  if (terminal !== null) return terminal;
  if (depth === 0) return evaluatePosition(fen, computer, human);

  const player = maximizing ? computer : human;
  const moves = getLegalMoves(fen, player);

  if (!moves.length) return evaluatePosition(fen, computer, human);

  if (maximizing) {
    let best = -Infinity;

    for (const move of moves) {
      const result = playMove(fen, move);
      const score = minimax(result.fen, depth - 1, false, computer, human, alpha, beta);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }

    return best;
  }

  let best = Infinity;

  for (const move of moves) {
    const result = playMove(fen, move);
    const score = minimax(result.fen, depth - 1, true, computer, human, alpha, beta);
    best = Math.min(best, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }

  return best;
};

export const selectComputerMove = (
  fen: string,
  level: string,
  computer: "x" | "o",
  human: "x" | "o"
): MovesType | null => {
  const moves = getLegalMoves(fen, computer);
  if (!moves.length) return null;

  const lookahead = LOOKAHEAD_DEPTH[level] ?? LOOKAHEAD_DEPTH[computerLevels.easy];
  let bestScore = -Infinity;
  let bestMoves: MovesType[] = [];

  for (const move of moves) {
    const result = playMove(fen, move);
    const score = minimax(result.fen, lookahead, false, computer, human, -Infinity, Infinity);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? moves[0];
};
