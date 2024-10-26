import { useCheckDB } from "@/app/hooks/useCheckDB";
import { useState } from "react";

type Props = {
    updateGame: (updateData: any) => Promise<void>;
    playAs: "x" | "o";
    gameid: string;
}

const AcceptChallenge = ({ updateGame, playAs, gameid }: Props) => {
    const [name, setName] = useState("");
    const { setGame } = useCheckDB();

    const acceptChallenge = async () => {
        const updateData = { [playAs]: name };
        await updateGame(updateData).then(() => {
            setGame(playAs, gameid);
        });
    }
    
    return (
        <div>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button disabled={!name} onClick={acceptChallenge}>Accept Challenge</button>
        </div>
    )
}

export default AcceptChallenge;