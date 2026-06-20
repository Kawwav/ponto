import { useNavigate } from 'react-router-dom'
import './entrada.css'

// Lista de opções do menu principal
const menus = [
  { id: 'registrar-entrada',  label: 'Registrar Entrada',  icon: '→', rota: '/registrar-entrada' },
  { id: 'registrar-trabalho', label: 'Registrar Trabalho', icon: '⚙', rota: null },
  { id: 'registrar-quebras',  label: 'Registrar Quebras',  icon: '⚠', rota: null },
  { id: 'registrar-saida',    label: 'Registrar Saída',    icon: '←', rota: null },
  { id: 'relatorio',          label: 'Relatório',           icon: '▤', rota: null },
  { id: 'cadastros',          label: 'Cadastros',           icon: '✦', rota: null },
]

function Entrada() {
  const navigate = useNavigate()

  // Navega para a rota do card clicado (se existir)
  function aoClicar(item) {
    if (item.rota) {
      navigate(item.rota)
    } else {
      console.log('Em breve:', item.id)
    }
  }

  return (
    <div className="pagina">

      {/* Cabeçalho com a logo centralizada */}
      <header className="topo">
        <img src="Logo.png" alt="Logo" className="logo" />
      </header>

      {/* Área principal centralizada verticalmente */}
      <main className="conteudo">

        {/* Título e subtítulo acima da grade */}
        {/* TODO: substituir "Leonardo" pelo usuário vindo do backend/auth */}
        <div className="titulo">
          <p className="boas-vindas">Seja bem-vindo, <span className="nome-usuario">Leonardo</span></p>
          <h1>O que deseja fazer?</h1>
        </div>

        {/* Grade de cards — 3 colunas no desktop, 2 no tablet, 1 no mobile */}
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