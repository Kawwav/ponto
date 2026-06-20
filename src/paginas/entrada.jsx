import './entrada.css'

// Lista de opções do menu principal
const menus = [
  { id: 'registrar-entrada', label: 'Registrar Entrada', icon: '→' },
  { id: 'registrar-trabalho', label: 'Registrar Trabalho', icon: '⚙' },
  { id: 'registrar-quebras', label: 'Registrar Quebras', icon: '⚠' },
  { id: 'registrar-saida', label: 'Registrar Saída', icon: '←' },
  { id: 'relatorio', label: 'Relatório', icon: '▤' },
  { id: 'cadastros', label: 'Cadastros', icon: '✦' },
]

function Entrada() {

  // Função chamada ao clicar em um card — recebe o id do item
  function aoClicar(id) {
    console.log('Acessando:', id)
  }

  return (
    // Página inteira com fundo escuro
    <div className="pagina">

      {/* Cabeçalho com a logo centralizada */}
      <header className="topo">
        <img src="/Logo.png" alt="Logo" className="logo" />
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
            // Card individual para cada opção do menu
            <button
              key={item.id}
              type="button"
              className="card"
              style={{ '--i': index }}
              onClick={() => aoClicar(item.id)}
            >
              {/* Ícone do card em verde */}
              <span className="icone">{item.icon}</span>

              {/* Nome da opção em branco */}
              <span className="nome">{item.label}</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Entrada