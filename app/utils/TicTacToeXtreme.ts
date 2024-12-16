export const DEFAULT_FEN =
  "---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-|0|-|x";

export const X = "x";
export const O = "o";

export type MovesType = {
  game: number;
  row: number;
  col: number;
  play: "x" | "o";
};

export class TicTacToeXtreme {
  private _fen: string;
  private _token: string[];
  private _turn: "x" | "o";
  private _turns: number;
  private _gameOver: boolean;
  private _draw: boolean;
  private _whoWon: string;

  constructor(fen: string = DEFAULT_FEN) {
    this._fen = fen;
    this._token = this._fen.split("|");
    this._turn = this._token[this._token.length - 1] as "x" | "o";
    this._turns = Number(this._token[this._token.length - 3]);
    this._gameOver = this._token[this._token.length - 4] !== "-";
    this._draw = this._token[this._token.length - 4] === "d";
    this._whoWon = this._token[this._token.length - 4];
  }

  get fen(): string {
    return this._fen;
  }

  get turn(): "x" | "o" {
    return this._turn;
  }

  get turns(): number {
    return this._turns;
  }

  get isGameOver(): boolean {
    return this._gameOver;
  }

  get isDraw(): boolean {
    return this._draw;
  }

  get whoWon(): string {
    return this._whoWon;
  }

  get token(): string[] {
    return this._token;
  }

  private _checkIfWon(player: "x" | "o", game: string[]): boolean {
    // check rows
    for (let row = 0; row < 3; row++) {
      if (game[row * 3] === player && game[row * 3 + 1] === player && game[row * 3 + 2] === player) {
        return true;
      }
    }
    // check columns
    for (let col = 0; col < 3; col++) {
      if (game[col] === player && game[col + 3] === player && game[col + 6] === player) {
        return true;
      }
    }
    // check diagonals
    if (game[0] === player && game[4] === player && game[8] === player) {
      return true;
    }
    if (game[2] === player && game[4] === player && game[6] === player) {
      return true;
    }
    return false;
  }

  private _checkIfDraw(game: string[]): boolean {
    return game.every((cell) => cell !== "-");
  }

  private _possibilityOfWin(game: string, play: "x" | "o"): boolean {
    const gameString = game.split("");
    for (let i = 0; i < 9; i++) {
      if (gameString[i] === "-") {
        gameString[i] = play;
      }
    }
    return this._checkIfWon(play, gameString);
  }

  play(data: MovesType): { fen: string; outCome: string; end: boolean } {
    const { game, row, col, play } = data;
    let result = play === "x" ? "O to play" : "X to play";
    let end = false;
    const currentToken = this._token;
    const cellValue = currentToken[game].split("")[row * 3 + col];
    if (cellValue === "-") {
      const gameString = currentToken[game].split("");
      const wonGame = currentToken[9].split("");
      gameString[row * 3 + col] = play;
      currentToken[game] = gameString.join("");
      currentToken[currentToken.length - 1] = play === "x" ? "o" : "x";
      currentToken[currentToken.length - 3] =
        play === "x"
          ? currentToken[currentToken.length - 3]
          : (Number(currentToken[currentToken.length - 3]) + 1).toString();
      if (this._checkIfWon(play, currentToken[game].split(""))) {
        wonGame[game] = play;
        currentToken[9] = wonGame.join("");
        if (this._checkIfWon(play, currentToken[9].split(""))) {
          currentToken[currentToken.length - 4] = play;
          result = `Game Over: ${play === "x" ? "X" : "O"} Won!`;
          end = true;
        } else if (
          this._checkIfDraw(currentToken[9].split("")) ||
          !this._possibilityOfWin(currentToken[9], "x") ||
          !this._possibilityOfWin(currentToken[9], "o")
        ) {
          currentToken[currentToken.length - 4] = "d";
          result = `Game Over: Draw!`;
          end = true;
        }
      } else if (this._checkIfDraw(currentToken[game].split(""))) {
        wonGame[game] = "d";
        currentToken[9] = wonGame.join("");
        if (
          this._checkIfDraw(currentToken[9].split("")) ||
          !this._possibilityOfWin(currentToken[9], "x") ||
          !this._possibilityOfWin(currentToken[9], "o")
        ) {
          currentToken[currentToken.length - 4] = "d";
          result = `Game Over: Draw!`;
          end = true;
        }
      }
      currentToken[currentToken.length - 2] = wonGame[row * 3 + col] === "-" ? (row * 3 + col).toString() : "-";
      this._fen = currentToken.join("|");
    }
    return { fen: this._fen, outCome: result, end };
  }
}
