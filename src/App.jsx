import { Routes, Route } from 'react-router-dom'
import Login from './paginas/login'
import Entrada from './paginas/entrada'
import RegistrarEntrada from './paginas/registrarentrada'
import RegistrarSaida from './paginas/saida'
import Relatorio from './paginas/relatorio'

//git add .

//git commit -m ".."

//git branch -M main

//git push -u origin main

//npm run deploy



function App() {
  return (
    <Routes>
      <Route path="/"                   element={<Login />} />
      <Route path="/entrada"            element={<Entrada />} />
      <Route path="/registrar-entrada"  element={<RegistrarEntrada />} />
      <Route path="/registrar-saida"    element={<RegistrarSaida />} />
      <Route path="/relatorio"          element={<Relatorio />} />
    </Routes>
  )
}

export default App