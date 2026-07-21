import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './relatorio.css'
import {
  calcularBancoDeHoras,
  formatarSaldo,
  criarSolicitacaoAjuste,
  listarSolicitacoes,
} from './dados'

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

function paraDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatarDataHoraCompleta(isoString) {
  if (!isoString) return '—'
  return `${formatarData(isoString)} às ${formatarHora(isoString)}`
}

function rotuloStatus(status) {
  if (status === 'aprovado') return 'Aprovado'
  if (status === 'rejeitado') return 'Rejeitado'
  return 'Pendente'
}

// ──────────────────────────────────────────────────────────────────

function Relatorio() {
  const navigate = useNavigate()

  // TODO: substituir pelo id real do usuário autenticado (ex: vindo do contexto de auth)
  const usuarioAtual = localStorage.getItem('usuario_id') || 'emp-1'

  const [registros, setRegistros] = useState([])
  const [filtroData, setFiltroData] = useState('')
  const [solicitacoes, setSolicitacoes] = useState([])
  const [historicoAberto, setHistoricoAberto] = useState(false)

  // Formulário de solicitação de ajuste
  const [ajusteAberto, setAjusteAberto] = useState(null) // id do registro em edição
  const [ajusteCampo, setAjusteCampo] = useState('entrada')
  const [ajusteValor, setAjusteValor] = useState('')
  const [ajusteMotivo, setAjusteMotivo] = useState('')

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem('registros_ponto') || '[]')

    // Filtra apenas os registros do próprio usuário, mais recente primeiro
    const meus = todos
      .filter((r) => r.empregadoId === usuarioAtual)
      .reverse()

    setRegistros(meus)
    setSolicitacoes(listarSolicitacoes({ empregadoId: usuarioAtual }))
  }, [])

  const banco = calcularBancoDeHoras(usuarioAtual, registros)

  function abrirAjuste(registro, campo) {
    setAjusteAberto(registro.id)
    setAjusteCampo(campo)
    setAjusteValor(paraDatetimeLocal(registro[campo]))
    setAjusteMotivo('')
  }

  function fecharAjuste() {
    setAjusteAberto(null)
    setAjusteValor('')
    setAjusteMotivo('')
  }

  function aoMudarCampoAjuste(registro, campo) {
    setAjusteCampo(campo)
    setAjusteValor(paraDatetimeLocal(registro[campo]))
  }

  function enviarAjuste(registro) {
    if (!ajusteValor) return
    criarSolicitacaoAjuste({
      registroId: registro.id,
      empregadoId: usuarioAtual,
      empregado: registro.empregado,
      campo: ajusteCampo,
      valorAtual: registro[ajusteCampo],
      valorSolicitado: new Date(ajusteValor).toISOString(),
      motivo: ajusteMotivo,
    })
    setSolicitacoes(listarSolicitacoes({ empregadoId: usuarioAtual }))
    fecharAjuste()
  }

  function solicitacaoPendente(registroId) {
    return solicitacoes.some((s) => s.registroId === registroId && s.status === 'pendente')
  }

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

  const solicitacoesOrdenadas = [...solicitacoes].sort(
    (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)
  )

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

        {/* Banco de horas */}
        <div className="banco-horas">
          <div className="banco-horas-info">
            <span className="banco-horas-label">Banco de horas</span>
            <span className="banco-horas-sub">
              {banco.diasComputados} dia{banco.diasComputados !== 1 ? 's' : ''} computado{banco.diasComputados !== 1 ? 's' : ''} · jornada de {Math.floor(banco.jornadaDiariaMinutos / 60)}h/dia
            </span>
          </div>
          <span
            className={`banco-horas-valor${
              banco.saldoMinutos < 0 ? ' negativo' : banco.saldoMinutos > 0 ? ' positivo' : ''
            }`}
          >
            {formatarSaldo(banco.saldoMinutos)}
          </span>
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

                {/* Solicitação de ajuste de ponto */}
                {solicitacaoPendente(r.id) ? (
                  <span className="badge-ajuste-pendente">Ajuste solicitado  aguardando aprovação</span>
                ) : ajusteAberto === r.id ? (
                  <div className="form-ajuste">
                    <div className="form-ajuste-linha">
                      <select
                        value={ajusteCampo}
                        onChange={(e) => aoMudarCampoAjuste(r, e.target.value)}
                      >
                        <option value="entrada">Corrigir entrada</option>
                        <option value="saida">Corrigir saída</option>
                      </select>
                      <input
                        type="datetime-local"
                        value={ajusteValor}
                        onChange={(e) => setAjusteValor(e.target.value)}
                      />
                    </div>
                    <textarea
                      className="form-ajuste-motivo"
                      placeholder="Motivo do ajuste (opcional)"
                      value={ajusteMotivo}
                      onChange={(e) => setAjusteMotivo(e.target.value)}
                    />
                    <div className="form-ajuste-acoes">
                      <button type="button" className="btn-cancelar-ajuste" onClick={fecharAjuste}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn-enviar-ajuste"
                        onClick={() => enviarAjuste(r)}
                        disabled={!ajusteValor}
                      >
                        Enviar solicitação
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-solicitar-ajuste"
                    onClick={() => abrirAjuste(r, r.saida ? 'saida' : 'entrada')}
                  >
                    Solicitar ajuste
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Histórico de solicitações de ajuste do próprio funcionário */}
        {solicitacoes.length > 0 && (
          <div className="historico-ajustes">
            <button
              type="button"
              className="historico-toggle"
              onClick={() => setHistoricoAberto(!historicoAberto)}
              aria-expanded={historicoAberto}
            >
              <span>Minhas solicitações de ajuste ({solicitacoes.length})</span>
              <span className="historico-seta">{historicoAberto ? '▲' : '▼'}</span>
            </button>

            {historicoAberto && (
              <div className="lista-historico">
                {solicitacoesOrdenadas.map((s) => (
                  <div key={s.id} className="card-hist-ajuste">
                    <div className="card-hist-topo">
                      <span className="card-hist-campo">
                        {s.campo === 'entrada' ? 'Correção de entrada' : 'Correção de saída'}
                      </span>
                      <span className={`badge-status-ajuste ${s.status}`}>
                        {rotuloStatus(s.status)}
                      </span>
                    </div>

                    <div className="card-hist-valores">
                      <div className="valor-hist">
                        <span className="valor-hist-label">De</span>
                        <span className="valor-hist-hora">{formatarHora(s.valorAtual)}</span>
                      </div>
                      <span className="card-hist-seta">→</span>
                      <div className="valor-hist">
                        <span className="valor-hist-label">Para</span>
                        <span className="valor-hist-hora destaque">{formatarHora(s.valorSolicitado)}</span>
                      </div>
                    </div>

                    {s.motivo && <p className="card-hist-motivo">{s.motivo}</p>}

                    <span className="card-hist-data">
                      Solicitado em {formatarDataHoraCompleta(s.criadoEm)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

export default Relatorio