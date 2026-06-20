import { Routes, Route } from 'react-router-dom'
import Login from './paginas/login'
import Entrada from './paginas/entrada'


//git add .

//git commit -m ".."

//git branch -M main

//git push -u origin main

//npm run deploy

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/entrada" element={<Entrada />} />
    </Routes>
  )
}

export default App