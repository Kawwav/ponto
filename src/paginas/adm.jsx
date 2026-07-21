import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './adm.css'
import {
  listarEmpregados,
  listarTodosEmpregados,
  salvarEmpregado,
  definirStatusEmpregado,
  listarMercados,
  salvarMercado,
  removerMercado,
  listarLojas,
  salvarLoja,
  removerLoja,
  listarSolicitacoes,
  responderSolicitacaoAjuste,
} from './dados'


function dataReferencia(r) {
  return r.entrada || r.saida || null
}

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

function diferencaMinutos(entrada, saida) {
  if (!entrada || !saida) return 0
  const diff = Math.floor((new Date(saida) - new Date(entrada)) / 60000)
  return diff > 0 ? diff : 0
}

function formatarDuracao(totalMinutos) {
  if (!totalMinutos) return '0min'
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  if (horas === 0) return `${minutos}min`
  if (minutos === 0) return `${horas}h`
  return `${horas}h ${minutos}min`
}

function formatarMoeda(valor) {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// pizza

const RAIO_GRAFICO           = 70
const CIRCUNFERENCIA_GRAFICO = 2 * Math.PI * RAIO_GRAFICO

const CORES_GRAFICO = ['#02FE02', '#FEA502', '#02D7FE', '#FE5C9E', '#B26EFF', '#FFD60A']



function Adm() {
  const navigate = useNavigate()

  const [abaAtiva, setAbaAtiva] = useState('relatorios')
  const [registros, setRegistros] = useState([])

  const [empregados, setEmpregados] = useState([])
  const [mercados, setMercados]     = useState([])
  const [lojas, setLojas]           = useState([])
  const [solicitacoes, setSolicitacoes] = useState([])

  const [filtroFuncionario, setFiltroFuncionario] = useState('')
  const [filtroMercado, setFiltroMercado]         = useState('')
  const [filtroLoja, setFiltroLoja]               = useState('')
  const [filtroDataInicio, setFiltroDataInicio]   = useState('')
  const [filtroDataFim, setFiltroDataFim]         = useState('')

  function recarregarDadosMestres() {
    setEmpregados(listarTodosEmpregados())
    setMercados(listarMercados())
    setLojas(listarLojas())
  }

  function recarregarRegistros() {
    const todos = JSON.parse(localStorage.getItem('registros_ponto') || '[]')
    setRegistros(todos)
  }

  function recarregarSolicitacoes() {
    setSolicitacoes(listarSolicitacoes())
  }

  useEffect(() => {
    recarregarRegistros()
    recarregarDadosMestres()
    recarregarSolicitacoes()
  }, [])

  function responder(id, aprovado) {
    responderSolicitacaoAjuste(id, aprovado)
    recarregarSolicitacoes()
    recarregarRegistros()
  }

  function aoMudarMercadoFiltro(e) {
    setFiltroMercado(e.target.value)
    setFiltroLoja('')
  }

  function aoMudarValorHora(empId, valorTexto) {
    const valor = parseFloat(valorTexto)
    salvarEmpregado({ id: empId, valorHora: isNaN(valor) ? 0 : valor })
    recarregarDadosMestres()
  }

  function limparFiltros() {
    setFiltroFuncionario('')
    setFiltroMercado('')
    setFiltroLoja('')
    setFiltroDataInicio('')
    setFiltroDataFim('')
  }

  const solicitacoesPendentes = solicitacoes.filter((s) => s.status === 'pendente')

  const empregadosAtivos = empregados.filter((e) => e.ativo !== false)
  const lojasDisponiveis = filtroMercado ? lojas.filter((l) => l.mercadoId === filtroMercado) : []
  const filtrosAtivos = filtroFuncionario || filtroMercado || filtroLoja || filtroDataInicio || filtroDataFim

  const registrosFiltrados = registros.filter((r) => {
    const dataRef = dataReferencia(r)
    if (filtroFuncionario && r.empregadoId !== filtroFuncionario) return false
    if (filtroMercado && r.mercadoId !== filtroMercado) return false
    if (filtroLoja && r.lojaId !== filtroLoja) return false
    if (filtroDataInicio && (!dataRef || dataRef.slice(0, 10) < filtroDataInicio)) return false
    if (filtroDataFim && (!dataRef || dataRef.slice(0, 10) > filtroDataFim)) return false
    return true
  })

  const registrosOrdenados = [...registrosFiltrados].sort((a, b) => {
    const da = dataReferencia(a) || ''
    const db = dataReferencia(b) || ''
    return db.localeCompare(da)
  })

  const funcionariosNoFiltro = filtroFuncionario
    ? empregadosAtivos.filter((e) => e.id === filtroFuncionario)
    : empregadosAtivos.filter((e) => registrosFiltrados.some((r) => r.empregadoId === e.id))

  const financeiro = funcionariosNoFiltro.map((emp) => {
    const registrosEmp = registrosFiltrados.filter((r) => r.empregadoId === emp.id)
    const minutos = registrosEmp.reduce((acc, r) => acc + diferencaMinutos(r.entrada, r.saida), 0)
    const registrosAbertos = registrosEmp.filter((r) => r.entrada && !r.saida).length
    const valorHora = emp.valorHora ?? 0
    const valorTotal = (minutos / 60) * valorHora
    return { id: emp.id, nome: emp.nome, minutos, registrosAbertos, valorHora, valorTotal }
  })

  const totalMinutosGeral = financeiro.reduce((acc, f) => acc + f.minutos, 0)
  const totalValorGeral   = financeiro.reduce((acc, f) => acc + f.valorTotal, 0)

  const segmentosGrafico = (() => {
    let acumulado = 0
    return financeiro.map((f, i) => {
      const fracao = totalValorGeral > 0 ? f.valorTotal / totalValorGeral : 0
      const comprimento = fracao * CIRCUNFERENCIA_GRAFICO
      const offset = acumulado
      acumulado += comprimento
      return {
        ...f,
        cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
        comprimento,
        offset,
        percentual: fracao * 100,
      }
    })
  })()

  // cadastro

  const [subAbaCadastro, setSubAbaCadastro] = useState('empregados') // 'empregados' | 'estrutura'

  // Formulário de novo/edição de empregado
  const [empEmEdicao, setEmpEmEdicao]   = useState(null) // null = nenhum form aberto; 'novo' = criando; id = editando
  const [empNomeForm, setEmpNomeForm]   = useState('')
  const [empValorForm, setEmpValorForm] = useState('')

  function abrirNovoEmpregado() {
    setEmpEmEdicao('novo')
    setEmpNomeForm('')
    setEmpValorForm('')
  }

  function abrirEdicaoEmpregado(emp) {
    setEmpEmEdicao(emp.id)
    setEmpNomeForm(emp.nome)
    setEmpValorForm(String(emp.valorHora ?? 0))
  }

  function fecharFormEmpregado() {
    setEmpEmEdicao(null)
    setEmpNomeForm('')
    setEmpValorForm('')
  }

  function confirmarSalvarEmpregado() {
    const nome = empNomeForm.trim()
    if (!nome) return
    const valor = parseFloat(empValorForm)
    salvarEmpregado({
      id: empEmEdicao === 'novo' ? undefined : empEmEdicao,
      nome,
      valorHora: isNaN(valor) ? 0 : valor,
    })
    recarregarDadosMestres()
    fecharFormEmpregado()
  }

  function alternarStatusEmpregado(emp) {
    const novoStatus = !(emp.ativo !== false)
    const mensagem = novoStatus
      ? `Reativar ${emp.nome}?`
      : `Arquivar ${emp.nome}? O histórico de pontos será preservado, mas ele deixará de aparecer nas seleções.`
    if (!window.confirm(mensagem)) return
    definirStatusEmpregado(emp.id, novoStatus)
    recarregarDadosMestres()
  }

  // Formulário de mercado
  const [mercadoEmEdicao, setMercadoEmEdicao] = useState(null) // null | 'novo' | id
  const [mercadoNomeForm, setMercadoNomeForm] = useState('')

  function abrirNovoMercado() {
    setMercadoEmEdicao('novo')
    setMercadoNomeForm('')
  }

  function abrirEdicaoMercado(m) {
    setMercadoEmEdicao(m.id)
    setMercadoNomeForm(m.nome)
  }

  function fecharFormMercado() {
    setMercadoEmEdicao(null)
    setMercadoNomeForm('')
  }

  function confirmarSalvarMercado() {
    const nome = mercadoNomeForm.trim()
    if (!nome) return
    salvarMercado({ id: mercadoEmEdicao === 'novo' ? undefined : mercadoEmEdicao, nome })
    recarregarDadosMestres()
    fecharFormMercado()
  }

  function confirmarRemoverMercado(m) {
    const qtdLojas = lojas.filter((l) => l.mercadoId === m.id).length
    const aviso = qtdLojas > 0
      ? `Remover "${m.nome}" também removerá ${qtdLojas} loja${qtdLojas !== 1 ? 's' : ''} vinculada${qtdLojas !== 1 ? 's' : ''} a ele. Continuar?`
      : `Remover "${m.nome}"?`
    if (!window.confirm(aviso)) return
    removerMercado(m.id)
    recarregarDadosMestres()
  }

  // Formulário de loja
  const [lojaEmEdicao, setLojaEmEdicao]         = useState(null) // null | 'novo' | id
  const [lojaNomeForm, setLojaNomeForm]         = useState('')
  const [lojaMercadoForm, setLojaMercadoForm]   = useState('')

  function abrirNovaLoja(mercadoId) {
    setLojaEmEdicao('novo')
    setLojaNomeForm('')
    setLojaMercadoForm(mercadoId)
  }

  function abrirEdicaoLoja(l) {
    setLojaEmEdicao(l.id)
    setLojaNomeForm(l.nome)
    setLojaMercadoForm(l.mercadoId)
  }

  function fecharFormLoja() {
    setLojaEmEdicao(null)
    setLojaNomeForm('')
    setLojaMercadoForm('')
  }

  function confirmarSalvarLoja() {
    const nome = lojaNomeForm.trim()
    if (!nome || !lojaMercadoForm) return
    salvarLoja({
      id: lojaEmEdicao === 'novo' ? undefined : lojaEmEdicao,
      nome,
      mercadoId: lojaMercadoForm,
    })
    recarregarDadosMestres()
    fecharFormLoja()
  }

  function confirmarRemoverLoja(l) {
    if (!window.confirm(`Remover "${l.nome}"?`)) return
    removerLoja(l.id)
    recarregarDadosMestres()
  }

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

        <div className="cabecalho">
          <h1>Painel Administrativo</h1>
          <p>
            {abaAtiva === 'relatorios'
              ? `${registrosOrdenados.length} registro${registrosOrdenados.length !== 1 ? 's' : ''} encontrado${registrosOrdenados.length !== 1 ? 's' : ''}`
              : abaAtiva === 'financeiro'
              ? 'Resumo de horas e valores a pagar por funcionário'
              : abaAtiva === 'ajustes'
              ? `${solicitacoesPendentes.length} solicitação${solicitacoesPendentes.length !== 1 ? 'ões' : ''} pendente${solicitacoesPendentes.length !== 1 ? 's' : ''}`
              : 'Gerencie funcionários, mercados e lojas'}
          </p>
        </div>

        {/* Abas */}
        <div className="abas">
          <button
            type="button"
            className={`aba${abaAtiva === 'relatorios' ? ' ativa' : ''}`}
            onClick={() => setAbaAtiva('relatorios')}
          >
            Relatórios
          </button>
          <button
            type="button"
            className={`aba${abaAtiva === 'financeiro' ? ' ativa' : ''}`}
            onClick={() => setAbaAtiva('financeiro')}
          >
            Financeiro
          </button>
          <button
            type="button"
            className={`aba${abaAtiva === 'ajustes' ? ' ativa' : ''}`}
            onClick={() => setAbaAtiva('ajustes')}
          >
            Ajustes
            {solicitacoesPendentes.length > 0 && (
              <span className="aba-badge">{solicitacoesPendentes.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`aba${abaAtiva === 'cadastros' ? ' ativa' : ''}`}
            onClick={() => setAbaAtiva('cadastros')}
          >
            Cadastros
          </button>
        </div>

        {abaAtiva !== 'cadastros' && abaAtiva !== 'ajustes' && (
        <div className="filtros">

          <div className="filtro">
            <label htmlFor="filtro-funcionario">Funcionário</label>
            <select
              id="filtro-funcionario"
              value={filtroFuncionario}
              onChange={(e) => setFiltroFuncionario(e.target.value)}
            >
              <option value="">Todos os funcionários</option>
              {empregadosAtivos.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro">
            <label htmlFor="filtro-mercado">Mercado</label>
            <select
              id="filtro-mercado"
              value={filtroMercado}
              onChange={aoMudarMercadoFiltro}
            >
              <option value="">Todos os mercados</option>
              {mercados.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro">
            <label htmlFor="filtro-loja">Loja</label>
            <select
              id="filtro-loja"
              value={filtroLoja}
              onChange={(e) => setFiltroLoja(e.target.value)}
              disabled={!filtroMercado}
              style={{ opacity: filtroMercado ? 1 : 0.45 }}
            >
              <option value="">
                {filtroMercado ? 'Todas as lojas' : 'Selecione um mercado primeiro'}
              </option>
              {lojasDisponiveis.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro">
            <label htmlFor="filtro-data-inicio">De</label>
            <input
              id="filtro-data-inicio"
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          <div className="filtro">
            <label htmlFor="filtro-data-fim">Até</label>
            <input
              id="filtro-data-fim"
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>

          {filtrosAtivos && (
            <button
              type="button"
              className="btn-limpar-filtro"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          )}
        </div>
        )}

        {/* ─── Aba Relatórios ─────────────────────────────────── */}
        {abaAtiva === 'relatorios' && (
          registrosOrdenados.length === 0 ? (
            <div className="vazio">
              <span className="vazio-icone">▤</span>
              <p className="vazio-titulo">Nenhum registro encontrado</p>
              <p className="vazio-sub">
                Ajuste os filtros acima ou aguarde novos registros de ponto.
              </p>
            </div>
          ) : (
            <div className="lista">
              {registrosOrdenados.map((r, i) => (
                <div key={r.id} className="card" style={{ '--i': i }}>

                  <div className="card-topo">
                    <div>
                      <p className="card-nome">{r.empregado}</p>
                      <p className="card-local">{r.loja} • {r.mercado}</p>
                    </div>
                    <div className="card-data">{formatarData(dataReferencia(r))}</div>
                  </div>

                  <div className="pontos">
                    <div className="ponto">
                      <span className="ponto-label">Entrada</span>
                      <span className={`hora entrada${!r.entrada ? ' ausente' : ''}`}>
                        {formatarHora(r.entrada)}
                      </span>
                    </div>

                    <div className="separador">→</div>

                    <div className="ponto">
                      <span className="ponto-label">Saída</span>
                      <span className={`hora saida${!r.saida ? ' ausente' : ''}`}>
                        {formatarHora(r.saida)}
                      </span>
                    </div>

                    {r.duracao && (
                      <>
                        <div className="separador">=</div>
                        <div className="ponto">
                          <span className="ponto-label">Total</span>
                          <span className="hora duracao">{r.duracao}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={`status ${r.saida ? 'completo' : 'aberto'}`}>
                    {r.saida ? 'Completo' : 'Em andamento'}
                  </div>

                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Aba Financeiro ─────────────────────────────────── */}
        {abaAtiva === 'financeiro' && (
          financeiro.length === 0 ? (
            <div className="vazio">
              <span className="vazio-icone">$</span>
              <p className="vazio-titulo">Nenhum dado financeiro</p>
              <p className="vazio-sub">
                Ajuste os filtros acima para ver horas e valores por funcionário.
              </p>
            </div>
          ) : (
            <>
              {/* Resumo geral */}
              <div className="resumo">
                <div className="resumo-item">
                  <span className="resumo-label">Total de horas</span>
                  <span className="resumo-valor">{formatarDuracao(totalMinutosGeral)}</span>
                </div>
                <div className="divisor" />
                <div className="resumo-item">
                  <span className="resumo-label">Total a pagar</span>
                  <span className="resumo-valor destaque">{formatarMoeda(totalValorGeral)}</span>
                </div>
              </div>

              {/* Gráfico de pizza */}
              <div className="grafico">
                <div className="grafico-titulo">
                  <h2>Distribuição do pagamento</h2>
                  <p>Participação de cada funcionário no valor total a pagar</p>
                </div>

                <div className="grafico-corpo">
                  <div className="grafico-svg-caixa">
                    <svg viewBox="0 0 180 180" className="grafico-svg">
                      <circle
                        cx="90" cy="90" r={RAIO_GRAFICO}
                        fill="none" stroke="#1a1819" strokeWidth="22"
                      />
                      {segmentosGrafico.filter((f) => f.comprimento > 0).map((f) => (
                        <circle
                          key={f.id}
                          cx="90" cy="90" r={RAIO_GRAFICO}
                          fill="none"
                          stroke={f.cor}
                          strokeWidth="22"
                          strokeDasharray={`${f.comprimento} ${CIRCUNFERENCIA_GRAFICO - f.comprimento}`}
                          strokeDashoffset={-f.offset}
                          transform="rotate(-90 90 90)"
                        />
                      ))}
                    </svg>
                    <div className="grafico-centro">
                      <span className="grafico-centro-label">Total</span>
                      <span className="grafico-centro-valor">{formatarMoeda(totalValorGeral)}</span>
                    </div>
                  </div>

                  <div className="legenda">
                    {segmentosGrafico.map((f) => (
                      <div key={f.id} className="legenda-item">
                        <span className="legenda-cor" style={{ backgroundColor: f.cor }} />
                        <div className="legenda-texto">
                          <span className="legenda-nome">{f.nome}</span>
                          <span className="legenda-detalhe">
                            {formatarMoeda(f.valorTotal)} · {f.percentual.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {totalValorGeral <= 0 && (
                  <p className="aviso">
                    Defina o valor/hora de cada funcionário abaixo para ver a distribuição.
                  </p>
                )}
              </div>

              {/* Cards por funcionário */}
              <div className="grade">
                {financeiro.map((f, i) => (
                  <div key={f.id} className="cartao" style={{ '--i': i }}>

                    <div className="cartao-topo">
                      <span className="cartao-nome">{f.nome}</span>
                      {f.registrosAbertos > 0 && (
                        <span className="cartao-aberto">{f.registrosAbertos} em aberto</span>
                      )}
                    </div>

                    <div className="cartao-horas">
                      <span className="cartao-label">Horas no período</span>
                      <span className="cartao-horas-valor">{formatarDuracao(f.minutos)}</span>
                    </div>

                    <div className="cartao-campo">
                      <label htmlFor={`valor-hora-${f.id}`}>Valor / hora</label>
                      <div className="entrada-moeda">
                        <span>R$</span>
                        <input
                          id={`valor-hora-${f.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={f.valorHora}
                          onChange={(e) => aoMudarValorHora(f.id, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="cartao-total">
                      <span className="cartao-label">A pagar</span>
                      <span className="cartao-total-valor">{formatarMoeda(f.valorTotal)}</span>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ─── Aba Ajustes ─────────────────────────────────────── */}
        {abaAtiva === 'ajustes' && (
          solicitacoes.length === 0 ? (
            <div className="vazio">
              <span className="vazio-icone">✎</span>
              <p className="vazio-titulo">Nenhuma solicitação de ajuste</p>
              <p className="vazio-sub">
                Pedidos de correção de ponto enviados pelos funcionários aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="lista-ajustes">
              {[...solicitacoes].reverse().map((s) => (
                <div key={s.id} className="card-ajuste">

                  <div className="card-ajuste-topo">
                    <div>
                      <p className="card-ajuste-nome">{s.empregado}</p>
                      <p className="card-ajuste-campo">
                        Ajuste de {s.campo === 'entrada' ? 'entrada' : 'saída'}
                      </p>
                    </div>
                    <span className={`badge-status-ajuste ${s.status}`}>
                      {s.status === 'pendente' ? 'Pendente' : s.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>

                  <div className="card-ajuste-valores">
                    <div className="valor-ajuste">
                      <span className="valor-ajuste-label">Atual</span>
                      <span className="valor-ajuste-hora">{formatarHora(s.valorAtual)}</span>
                    </div>
                    <div className="separador">→</div>
                    <div className="valor-ajuste">
                      <span className="valor-ajuste-label">Solicitado</span>
                      <span className="valor-ajuste-hora destaque">{formatarHora(s.valorSolicitado)}</span>
                    </div>
                  </div>

                  {s.motivo && <p className="card-ajuste-motivo">{s.motivo}</p>}

                  {s.status === 'pendente' && (
                    <div className="card-ajuste-acoes">
                      <button type="button" className="btn-rejeitar" onClick={() => responder(s.id, false)}>
                        Rejeitar
                      </button>
                      <button type="button" className="btn-aprovar" onClick={() => responder(s.id, true)}>
                        Aprovar
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Aba Cadastros ──────────────────────────────────── */}
        {abaAtiva === 'cadastros' && (
          <>
            {/* Sub-abas internas */}
            <div className="subabas">
              <button
                type="button"
                className={`subaba${subAbaCadastro === 'empregados' ? ' ativa' : ''}`}
                onClick={() => setSubAbaCadastro('empregados')}
              >
                Funcionários
              </button>
              <button
                type="button"
                className={`subaba${subAbaCadastro === 'estrutura' ? ' ativa' : ''}`}
                onClick={() => setSubAbaCadastro('estrutura')}
              >
                Mercados &amp; Lojas
              </button>
            </div>

            {/* ─── Gestão de Empregados ─────────────────────────── */}
            {subAbaCadastro === 'empregados' && (
              <div className="painel-cadastro">

                <div className="painel-cadastro-topo">
                  <div>
                    <h2>Funcionários</h2>
                    <p>Adicione, edite ou arquive perfis. Perfis arquivados preservam o histórico de pontos.</p>
                  </div>
                  {empEmEdicao === null && (
                    <button type="button" className="btn-novo" onClick={abrirNovoEmpregado}>
                      + Novo funcionário
                    </button>
                  )}
                </div>

                {empEmEdicao !== null && (
                  <div className="form-inline">
                    <div className="form-campo">
                      <label htmlFor="emp-nome-form">Nome</label>
                      <input
                        id="emp-nome-form"
                        type="text"
                        placeholder="Nome completo"
                        value={empNomeForm}
                        onChange={(e) => setEmpNomeForm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="form-campo form-campo-curto">
                      <label htmlFor="emp-valor-form">Valor / hora padrão</label>
                      <div className="entrada-moeda">
                        <span>R$</span>
                        <input
                          id="emp-valor-form"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          value={empValorForm}
                          onChange={(e) => setEmpValorForm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-acoes">
                      <button type="button" className="btn-cancelar" onClick={fecharFormEmpregado}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn-salvar"
                        onClick={confirmarSalvarEmpregado}
                        disabled={!empNomeForm.trim()}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}

                {empregados.length === 0 ? (
                  <div className="vazio">
                    <span className="vazio-icone">✦</span>
                    <p className="vazio-titulo">Nenhum funcionário cadastrado</p>
                  </div>
                ) : (
                  <div className="tabela-cadastro">
                    {empregados.map((emp) => (
                      <div key={emp.id} className={`linha-cadastro${emp.ativo === false ? ' inativo' : ''}`}>
                        <div className="linha-info">
                          <span className="linha-nome">{emp.nome}</span>
                          <span className="linha-detalhe">{formatarMoeda(emp.valorHora ?? 0)} / hora</span>
                        </div>
                        {emp.ativo === false && <span className="tag-arquivado">Arquivado</span>}
                        <div className="linha-acoes">
                          <button type="button" className="btn-icone" onClick={() => abrirEdicaoEmpregado(emp)} aria-label="Editar">
                            ✎
                          </button>
                          <button
                            type="button"
                            className={`btn-icone${emp.ativo === false ? ' reativar' : ' arquivar'}`}
                            onClick={() => alternarStatusEmpregado(emp)}
                            aria-label={emp.ativo === false ? 'Reativar' : 'Arquivar'}
                          >
                            {emp.ativo === false ? '↺' : '🗄'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {subAbaCadastro === 'estrutura' && (
              <div className="painel-cadastro">

                <div className="painel-cadastro-topo">
                  <div>
                    <h2>Mercados &amp; Lojas</h2>
                    <p>Cadastre redes de mercados e vincule lojas a cada uma delas.</p>
                  </div>
                  {mercadoEmEdicao === null && (
                    <button type="button" className="btn-novo" onClick={abrirNovoMercado}>
                      + Novo mercado
                    </button>
                  )}
                </div>

                {mercadoEmEdicao !== null && (
                  <div className="form-inline">
                    <div className="form-campo">
                      <label htmlFor="mercado-nome-form">Nome do mercado</label>
                      <input
                        id="mercado-nome-form"
                        type="text"
                        placeholder="Ex.: Mercado D"
                        value={mercadoNomeForm}
                        onChange={(e) => setMercadoNomeForm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="form-acoes">
                      <button type="button" className="btn-cancelar" onClick={fecharFormMercado}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn-salvar"
                        onClick={confirmarSalvarMercado}
                        disabled={!mercadoNomeForm.trim()}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}

                {mercados.length === 0 ? (
                  <div className="vazio">
                    <span className="vazio-icone">✦</span>
                    <p className="vazio-titulo">Nenhum mercado cadastrado</p>
                  </div>
                ) : (
                  <div className="lista-mercados">
                    {mercados.map((m) => {
                      const lojasDoMercado = lojas.filter((l) => l.mercadoId === m.id)
                      return (
                        <div key={m.id} className="bloco-mercado">
                          <div className="bloco-mercado-topo">
                            <span className="bloco-mercado-nome">{m.nome}</span>
                            <div className="linha-acoes">
                              <button type="button" className="btn-icone" onClick={() => abrirEdicaoMercado(m)} aria-label="Editar mercado">
                                ✎
                              </button>
                              <button type="button" className="btn-icone arquivar" onClick={() => confirmarRemoverMercado(m)} aria-label="Remover mercado">
                                🗑
                              </button>
                            </div>
                          </div>

                          {lojaEmEdicao !== null && lojaMercadoForm === m.id && (
                            <div className="form-inline form-inline-loja">
                              <div className="form-campo">
                                <label htmlFor={`loja-nome-form-${m.id}`}>Nome da loja</label>
                                <input
                                  id={`loja-nome-form-${m.id}`}
                                  type="text"
                                  placeholder="Ex.: Loja D1 — Centro"
                                  value={lojaNomeForm}
                                  onChange={(e) => setLojaNomeForm(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <div className="form-acoes">
                                <button type="button" className="btn-cancelar" onClick={fecharFormLoja}>
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  className="btn-salvar"
                                  onClick={confirmarSalvarLoja}
                                  disabled={!lojaNomeForm.trim()}
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          )}

                          {lojasDoMercado.length === 0 ? (
                            <p className="bloco-mercado-vazio">Nenhuma loja vinculada ainda.</p>
                          ) : (
                            <div className="tabela-cadastro tabela-lojas">
                              {lojasDoMercado.map((l) => (
                                <div key={l.id} className="linha-cadastro">
                                  <div className="linha-info">
                                    <span className="linha-nome">{l.nome}</span>
                                  </div>
                                  <div className="linha-acoes">
                                    <button type="button" className="btn-icone" onClick={() => abrirEdicaoLoja(l)} aria-label="Editar loja">
                                      ✎
                                    </button>
                                    <button type="button" className="btn-icone arquivar" onClick={() => confirmarRemoverLoja(l)} aria-label="Remover loja">
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {!(lojaEmEdicao !== null && lojaMercadoForm === m.id) && (
                            <button type="button" className="btn-add-loja" onClick={() => abrirNovaLoja(m.id)}>
                              + Adicionar loja
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}

export default Adm