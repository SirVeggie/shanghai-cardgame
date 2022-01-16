import React, { CSSProperties, useState } from 'react'
import Game from './components/game'
import './App.css'

function App() {
  const [mouse, setMouse] = useState([0, 0])

  const style = {
    '--mouse-x': mouse[0],
    '--mouse-y': mouse[1]
  } as CSSProperties
  
  return (
    <div className="App" onMouseMove={event => setMouse([event.clientX, event.clientY])} style={style}>
      <Game />
    </div>
  )
}

export default App
