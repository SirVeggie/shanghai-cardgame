import React from 'react'
import Game from './components/game'
import './App.css'

function App() {
  return (
    <div className="App" onMouseMove={mousePos}>
      <Game />
    </div>
  )
}

// function mousePos(x: number, y: number) {
function mousePos(event: any) {
  return
  document.documentElement.style.setProperty('--mouse-x', `${event.clientX}`)
  document.documentElement.style.setProperty('--mouse-y', `${event.clientY}`)
}

export default App
