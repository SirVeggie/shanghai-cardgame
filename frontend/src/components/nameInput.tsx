import { useState } from "react"

type NameInputProps = {
    setName: (n: string | undefined) => void
}

export const NameInput = ({ setName }: NameInputProps) => {
    const [value, setValue] = useState("")

    const submit = (s: unknown) => {
        if (value.length) {
            setName(value)
        }
    }

    return <div>
        <form onSubmit={submit}>
            <label>
                Name:
                <input type="text" name="name" value={value} onChange={e => setValue(e.target.value)} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    </div>
}