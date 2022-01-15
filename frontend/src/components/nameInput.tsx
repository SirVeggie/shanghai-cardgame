import { useState } from "react"
import { startGame } from "../services/gameApi"
import { ShanghaiGame } from "../shared"

type NameInputProps = {
    setName: (n: string | undefined) => void
}

const key = "game"

export const NameInput = ({ setName }: NameInputProps) => {
    const [value, setValue] = useState("")

    const submit = (s: unknown) => {
        if (value.length) {
            setName(value)
        }
    }

    const setPreviousGame = () => {
        const prev = localStorage.getItem(key)
        if (!prev) {
            return
        }

        const game = JSON.parse(prev) as ShanghaiGame

        startGame(game)
    }

    return <div>
        <form onSubmit={submit}>
            <label>
                Name:
                <input type="text" name="name" value={value} onChange={e => setValue(e.target.value)} />
            </label>
            <input type="submit" value="Submit" />
        </form>
        <button onClick={setPreviousGame}>Set previous game</button>
    </div>
}