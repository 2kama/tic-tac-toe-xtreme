import { DocumentData } from "@/app/utils/firebase";

type Props = {
  gameData: DocumentData;
  computer?: boolean;
};

const Outcome = ({ gameData, computer = false }: Props) => {
  const gameInPlay = gameData.outCome.toLowerCase().includes("to play");
  const XtoPlay = gameData.outCome.toLowerCase().includes("x to play");
  const OtoPlay = gameData.outCome.toLowerCase().includes("o to play");
  const gameDraw = gameData.outCome.toLowerCase().includes("draw");
  const X_Won = gameData.outCome.toLowerCase().includes("x won");
  const O_Won = gameData.outCome.toLowerCase().includes("o won");

  const outcomeWordings = (side: string, player: string) => {
    if (side === "x") {
      return player === "You" ? "Your(x) Turn" : `Computer(x)'s Turn`;
    } else {
      return player === "You" ? "Your(o) Turn" : `Computer(o)'s Turn`;
    }
  }

  return (
    <div className="flex w-[80%] md:w-[400px] mt-8 md:mt-12 items-center justify-between">
      <div className={`${gameInPlay && OtoPlay && "opacity-20"} flex items-center`}>
        <div className="text-lg md:text-2xl">{gameData.x ? gameData.x : "Waiting..."}</div>
        <div className="text-5xl md:text-7xl opacity-20 -ml-5 md:-ml-8">X</div>
      </div>
      <div className="text-red-600">
        {gameDraw && "Draw"}
        {X_Won && `${gameData.x}(x) Won`}
        {O_Won && `${gameData.o}(o) Won`}
        {!computer && gameInPlay && XtoPlay && `${gameData.x}(x)'s Turn`}
        {!computer && gameInPlay && OtoPlay && `${gameData.o}(o)'s Turn`}
        {computer && gameInPlay && XtoPlay && outcomeWordings("x", gameData.x)}
        {computer && gameInPlay && OtoPlay && outcomeWordings("o", gameData.o)}
      </div>
      <div className={`${gameInPlay && XtoPlay && "opacity-20"} flex items-center`}>
        <div className="text-5xl md:text-7xl opacity-20 -mr-5 md:-mr-8">O</div>
        <div className="text-lg md:text-2xl">{gameData.o ? gameData.o : "Waiting..."}</div>
      </div>
    </div>
  );
};

export default Outcome;
