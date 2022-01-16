import React from 'react'
import Game from './components/game'
import './App.css'

function App() {
  return (
    <div className="App" onMouseMove={event => mousePos(event.clientX, event.clientY)}>
      <Game />
    </div>
  )
}

function mousePos(x: number, y: number) {
  document.documentElement.style.setProperty('--mouse-x', `${x}`)
  document.documentElement.style.setProperty('--mouse-y', `${y}`)
}

export default App
