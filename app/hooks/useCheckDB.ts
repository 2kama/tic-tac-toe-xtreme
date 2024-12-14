"use client";

export const useCheckDB = () => {
  const exist = () => {
    return (
      localStorage.TIC_TAC_TOE_X &&
      typeof JSON.parse(localStorage.TIC_TAC_TOE_X) === "object"
    );
  };

  const player = (gameid: string) => {
    return exist()
      ? JSON.parse(localStorage.TIC_TAC_TOE_X).hasOwnProperty(gameid)
      : false;
  };

  const XorO = (gameid: string) => {
    return exist()
      ? JSON.parse(localStorage.TIC_TAC_TOE_X)[gameid] || "x"
      : "o";
  };

  const setGame = (side: string, gameid: string) => {
    const currentPath = exist() ? JSON.parse(localStorage.TIC_TAC_TOE_X) : {};

    localStorage.TIC_TAC_TOE_X = JSON.stringify({
      ...currentPath,
      [gameid]: side,
    });
  };

  return { exist, player, XorO, setGame };
};
