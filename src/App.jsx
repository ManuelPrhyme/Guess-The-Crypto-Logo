import { useState } from 'react'
import Herodash from './Dash/Dash'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Herodash />
    </>
  )
}

export default App
