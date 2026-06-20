import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './relatorio.css'

// ─── Helpers ───────────────────────────────────────────────────────

function formatarHora(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatarData(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ──────────────────────────────────────────────────────────────────

function Relatorio() {
  const navigate = useNavigate()
  const [registros, setRegistros] = useState([])
  const [filtroData, setFiltroData] = useState('')

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem('registros_ponto') || '[]')

    // TODO: substituir pelo id real do usuário autenticado (ex: vindo do contexto de auth)
    const usuarioAtual = localStorage.getItem('usuario_id') || 'emp-1'

    // Filtra apenas os registros do próprio usuário, mais recente primeiro
    const meus = todos
      .filter((r) => r.empregadoId === usuarioAtual)
      .reverse()

    setRegistros(meus)
  }, [])

  // Filtragem por data
  const registrosFiltrados = registros.filter((r) => {
    return !filtroData || (r.entrada && r.entrada.startsWith(filtroData))
  })

  // Soma total de horas trabalhadas dos registros filtrados completos
  function somarMinutos(lista) {
    return lista.reduce((acc, r) => {
      if (!r.entrada || !r.saida) return acc
      const diff = Math.floor((new Date(r.saida) - new Date(r.entrada)) / 60000)
      return acc + diff
    }, 0)
  }

  const totalMinutos = somarMinutos(registrosFiltrados)
  const totalHoras   = Math.floor(totalMinutos / 60)
  const totalMin     = totalMinutos % 60
  const totalFormatado = totalMinutos > 0
    ? (totalMin === 0 ? `${totalHoras}h` : `${totalHoras}h ${totalMin}min`)
    : null

  return (
    <div className="pagina">

      <header className="topo">
        <button
          type="button"
          className="btn-voltar"
          onClick={() => navigate('/entrada')}
          aria-label="Voltar"
        >
          ←
        </button>
        <img src="Logo.png" alt="Logo" className="logo" />
      </header>

      <main className="conteudo">

        <div className="cabecalho-secao">
          <h1>Meu Relatório</h1>
          <p>{registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filtro de data */}
        <div className="filtros">
          <div className="filtro-grupo">
            <label htmlFor="filtro-data">Filtrar por data</label>
            <input
              id="filtro-data"
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>

          {filtroData && (
            <button
              type="button"
              className="btn-limpar-filtro"
              onClick={() => setFiltroData('')}
            >
              Limpar filtro
            </button>
          )}
        </div>

        {/* Resumo total — só aparece quando há registros completos */}
        {totalFormatado && (
          <div className="resumo-total">
            <span className="resumo-label">
              {filtroData ? 'Total no dia' : 'Total geral'}
            </span>
            <span className="resumo-valor">{totalFormatado}</span>
          </div>
        )}

        {/* Lista de registros */}
        {registrosFiltrados.length === 0 ? (
          <div className="vazio">
            <span className="vazio-icone">▤</span>
            <p className="vazio-titulo">Nenhum registro ainda</p>
            <p className="vazio-sub">
              Seus pontos de entrada e saída aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="lista">
            {registrosFiltrados.map((r, i) => (
              <div key={r.id} className="card-registro" style={{ '--i': i }}>

                {/* Cabeçalho do card */}
                <div className="card-topo">
                  <div>
                    <p className="card-nome">{r.loja}</p>
                    <p className="card-local">{r.mercado}</p>
                  </div>
                  <div className="card-data">{formatarData(r.entrada || r.saida)}</div>
                </div>

                {/* Linha de entrada / saída / duração */}
                <div className="card-pontos">
                  <div className="ponto">
                    <span className="ponto-label">Entrada</span>
                    <span className={`ponto-hora entrada${!r.entrada ? ' ausente' : ''}`}>
                      {formatarHora(r.entrada)}
                    </span>
                  </div>

                  <div className="ponto-separador">→</div>

                  <div className="ponto">
                    <span className="ponto-label">Saída</span>
                    <span className={`ponto-hora saida${!r.saida ? ' ausente' : ''}`}>
                      {formatarHora(r.saida)}
                    </span>
                  </div>

                  {r.duracao && (
                    <>
                      <div className="ponto-separador">=</div>
                      <div className="ponto">
                        <span className="ponto-label">Total</span>
                        <span className="ponto-hora duracao">{r.duracao}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Badge de status */}
                <div className={`badge-status ${r.saida ? 'completo' : 'aberto'}`}>
                  {r.saida ? 'Completo' : 'Em andamento'}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default Relatorio