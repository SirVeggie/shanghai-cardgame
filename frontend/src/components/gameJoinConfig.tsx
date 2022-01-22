import { useState } from "react"
import { startNewGame } from "../services/gameApi"
import { GameJoinParams, ShanghaiGame } from "../shared"

export type JoinType = 'create' | 'join'
type NameInputProps = {
    onSubmit: (joinType: JoinType, p: GameJoinParams) => void
}


export const GameJoinConfig = ({ onSubmit }: NameInputProps) => {
    const [name, setName] = useState("")
    const [lobby, setLobby] = useState("")
    const [pass, setPass] = useState("")

    const submit = (j: JoinType) => {
        if (name.length) {
            onSubmit(j, {
                playerName: name,
                lobbyName: lobby,
                password: pass.length ? pass : undefined
            })
        }
    }

    return <div>
        <label>
            Your name:
            <input type="text" name="name" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
            Game:
            <input type="text" name="name" value={lobby} onChange={e => setLobby(e.target.value)} />
        </label>
        <label>
            Password:
            <input type="text" name="name" value={pass} onChange={e => setPass(e.target.value)} />
        </label>
        <button onClick={() => submit('join')}>Join game</button>
        <button onClick={() => submit('create')}>Create game</button>
    </div>
}