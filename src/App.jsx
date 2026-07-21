import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './paginas/login'
import Entrada from './paginas/entrada'
import RegistrarEntrada from './paginas/registrarentrada'
import RegistrarSaida from './paginas/saida'
import Relatorio from './paginas/relatorio'
import Adm from './paginas/adm'
import Lembretes from './paginas/lembretes'
import { obterLembretes } from './paginas/dados'

//git add .

//git commit -m ".."

//git branch -M main

//git push -u origin main

//npm run deploy


function usarLembretesDePonto() {
  useEffect(() => {
    function horarioAtual() {
      const agora = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(agora.getHours())}:${pad(agora.getMinutes())}`
    }

    function chaveDisparoHoje(tipo) {
      const hoje = new Date().toISOString().slice(0, 10)
      return `lembrete_disparado_${tipo}_${hoje}`
    }

    function dispararNotificacao(titulo, corpo) {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      new Notification(titulo, { body: corpo })
    }

    function verificar() {
      const config = obterLembretes()
      const agora = horarioAtual()

      if (config.entradaAtivo && config.entradaHorario === agora) {
        const chave = chaveDisparoHoje('entrada')
        if (!localStorage.getItem(chave)) {
          dispararNotificacao('Hora de bater o ponto', 'Não esqueça de registrar sua entrada.')
          localStorage.setItem(chave, '1')
        }
      }

      if (config.saidaAtivo && config.saidaHorario === agora) {
        const chave = chaveDisparoHoje('saida')
        if (!localStorage.getItem(chave)) {
          dispararNotificacao('Hora de bater o ponto', 'Não esqueça de registrar sua saída.')
          localStorage.setItem(chave, '1')
        }
      }
    }

    const intervalo = setInterval(verificar, 20000)
    return () => clearInterval(intervalo)
  }, [])
}

function App() {
  usarLembretesDePonto()

  return (
    <Routes>
      <Route path="/"                   element={<Login />} />
      <Route path="/entrada"            element={<Entrada />} />
      <Route path="/registrar-entrada"  element={<RegistrarEntrada />} />
      <Route path="/registrar-saida"    element={<RegistrarSaida />} />
      <Route path="/relatorio"          element={<Relatorio />} />
      <Route path="/adm"                element={<Adm />} />
      <Route path="/lembretes"          element={<Lembretes />} />
    </Routes>
  )
}

export default App