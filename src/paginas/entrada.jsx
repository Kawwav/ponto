import { useNavigate } from 'react-router-dom'
import './entrada.css'

// Lista de opções do menu principal
const menus = [
  { id: 'registrar-entrada',  label: 'Registrar Entrada',  icon: '→', rota: '/registrar-entrada' },
  { id: 'registrar-trabalho', label: 'Registrar Trabalho', icon: '⚙', rota: null },
  { id: 'registrar-quebras',  label: 'Registrar Quebras',  icon: '⚠', rota: null },
  { id: 'registrar-saida',    label: 'Registrar Saída',    icon: '←', rota: '/registrar-saida' },
  { id: 'relatorio',          label: 'Relatório',           icon: '▤', rota: '/relatorio' },
  { id: 'cadastros',          label: 'Cadastros',           icon: '✦', rota: null },
  // TODO: exibir este card apenas para usuários com perfil de administrador
  { id: 'painel-adm',         label: 'Painel Admin',        icon: '🛡', rota: '/adm' },
]

function Entrada() {
  const navigate = useNavigate()

  function aoClicar(item) {
    if (item.rota) {
      navigate(item.rota)
    } else {
      console.log('Em breve:', item.id)
    }
  }

  return (
    <div className="pagina">

      <header className="topo">
        <img src="Logo.png" alt="Logo" className="logo" />
      </header>

      <main className="conteudo">

        <div className="titulo">
          <p className="boas-vindas">Seja bem-vindo, <span className="nome-usuario">Leonardo</span></p>
          <h1>O que deseja fazer?</h1>
        </div>

        <div className="grade">
          {menus.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="card"
              style={{ '--i': index }}
              onClick={() => aoClicar(item)}
            >
              <span className="icone">{item.icon}</span>
              <span className="nome">{item.label}</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Entrada