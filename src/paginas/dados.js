const CHAVE_EMPREGADOS = 'cad_empregados'
const CHAVE_MERCADOS   = 'cad_mercados'
const CHAVE_LOJAS      = 'cad_lojas'
const CHAVE_REGISTROS  = 'registros_ponto'
const CHAVE_AJUSTES    = 'solicitacoes_ajuste'
const CHAVE_CONFIG     = 'config_ponto'
const CHAVE_LEMBRETES  = 'config_lembretes'

const CONFIG_PADRAO = {
  jornadaDiariaMinutos: 480, // 8h por dia
}

const LEMBRETES_PADRAO = {
  entradaAtivo: false,
  entradaHorario: '08:00',
  saidaAtivo: false,
  saidaHorario: '17:00',
}


const SEED_MERCADOS = [
  { id: 'mercado-a', nome: 'Mercado A' },
  { id: 'mercado-b', nome: 'Mercado B' },
  { id: 'mercado-c', nome: 'Mercado C' },
]

const SEED_LOJAS = [
  { id: 'loja-a1', nome: 'Loja A1 — Centro', mercadoId: 'mercado-a' },
  { id: 'loja-a2', nome: 'Loja A2 — Norte',  mercadoId: 'mercado-a' },
  { id: 'loja-b1', nome: 'Loja B1 — Sul',    mercadoId: 'mercado-b' },
  { id: 'loja-b2', nome: 'Loja B2 — Leste',  mercadoId: 'mercado-b' },
  { id: 'loja-b3', nome: 'Loja B3 — Oeste',  mercadoId: 'mercado-b' },
  { id: 'loja-c1', nome: 'Loja C1 — Centro', mercadoId: 'mercado-c' },
]

const SEED_EMPREGADOS = [
  { id: 'emp-1', nome: 'Leonardo Silva',  valorHora: 0, ativo: true },
  { id: 'emp-2', nome: 'Maria Oliveira',  valorHora: 0, ativo: true },
  { id: 'emp-3', nome: 'Carlos Santos',   valorHora: 0, ativo: true },
  { id: 'emp-4', nome: 'Ana Costa',       valorHora: 0, ativo: true },
]



function lerLista(chave, seed) {
  const bruto = localStorage.getItem(chave)
  if (bruto === null) {
    localStorage.setItem(chave, JSON.stringify(seed))
    return seed
  }
  try {
    return JSON.parse(bruto)
  } catch {
    return seed
  }
}

function salvarLista(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista))
}

function gerarId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// funcionarios

export function listarEmpregados({ incluirInativos = false } = {}) {
  const lista = lerLista(CHAVE_EMPREGADOS, SEED_EMPREGADOS)
  return incluirInativos ? lista : lista.filter((e) => e.ativo !== false)
}

export function listarTodosEmpregados() {
  return lerLista(CHAVE_EMPREGADOS, SEED_EMPREGADOS)
}

export function salvarEmpregado(dados) {
  const lista = lerLista(CHAVE_EMPREGADOS, SEED_EMPREGADOS)
  if (dados.id) {
    const idx = lista.findIndex((e) => e.id === dados.id)
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...dados }
    }
  } else {
    lista.push({
      id: gerarId('emp'),
      nome: dados.nome,
      valorHora: dados.valorHora ?? 0,
      ativo: true,
    })
  }
  salvarLista(CHAVE_EMPREGADOS, lista)
  return lista
}

export function definirStatusEmpregado(id, ativo) {
  const lista = lerLista(CHAVE_EMPREGADOS, SEED_EMPREGADOS)
  const idx = lista.findIndex((e) => e.id === id)
  if (idx >= 0) {
    lista[idx] = { ...lista[idx], ativo }
    salvarLista(CHAVE_EMPREGADOS, lista)
  }
  return lista
}

//marcados

export function listarMercados() {
  return lerLista(CHAVE_MERCADOS, SEED_MERCADOS)
}

export function salvarMercado(dados) {
  const lista = lerLista(CHAVE_MERCADOS, SEED_MERCADOS)
  if (dados.id) {
    const idx = lista.findIndex((m) => m.id === dados.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...dados }
  } else {
    lista.push({ id: gerarId('mercado'), nome: dados.nome })
  }
  salvarLista(CHAVE_MERCADOS, lista)
  return lista
}

export function removerMercado(id) {
  const lista = lerLista(CHAVE_MERCADOS, SEED_MERCADOS).filter((m) => m.id !== id)
  salvarLista(CHAVE_MERCADOS, lista)
  // Remove em cascata as lojas vinculadas a esse mercado
  const lojas = lerLista(CHAVE_LOJAS, SEED_LOJAS).filter((l) => l.mercadoId !== id)
  salvarLista(CHAVE_LOJAS, lojas)
  return lista
}

//lojas

export function listarLojas(mercadoId = null) {
  const lista = lerLista(CHAVE_LOJAS, SEED_LOJAS)
  return mercadoId ? lista.filter((l) => l.mercadoId === mercadoId) : lista
}

export function salvarLoja(dados) {
  const lista = lerLista(CHAVE_LOJAS, SEED_LOJAS)
  if (dados.id) {
    const idx = lista.findIndex((l) => l.id === dados.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...dados }
  } else {
    lista.push({ id: gerarId('loja'), nome: dados.nome, mercadoId: dados.mercadoId })
  }
  salvarLista(CHAVE_LOJAS, lista)
  return lista
}

export function removerLoja(id) {
  const lista = lerLista(CHAVE_LOJAS, SEED_LOJAS).filter((l) => l.id !== id)
  salvarLista(CHAVE_LOJAS, lista)
  return lista
}

// ─── Registros de ponto ──────────────────────────────────────────

export function obterRegistros() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_REGISTROS) || '[]')
  } catch {
    return []
  }
}

export function salvarRegistros(lista) {
  localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(lista))
}

// Retorna o registro em aberto (com entrada e sem saída) mais recente de um empregado
export function obterRegistroAberto(empregadoId) {
  const registros = obterRegistros()
  for (let i = registros.length - 1; i >= 0; i--) {
    const r = registros[i]
    if (r.empregadoId === empregadoId && r.entrada && !r.saida) return r
  }
  return null
}

function formatarDuracaoSimples(totalMinutos) {
  if (!totalMinutos || totalMinutos <= 0) return '0min'
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  if (horas === 0) return `${minutos}min`
  if (minutos === 0) return `${horas}h`
  return `${horas}h ${minutos}min`
}

// ─── Intervalo / pausa ────────────────────────────────────────────

export function temPausaAberta(registro) {
  return (registro?.pausas || []).some((p) => !p.fim)
}

// Soma os minutos de pausa já encerrados. Se ateAgora=true, também conta a pausa em andamento.
export function minutosPausas(registro, ateAgora = false) {
  const pausas = registro?.pausas || []
  return pausas.reduce((acc, p) => {
    if (!p.inicio) return acc
    if (!p.fim && !ateAgora) return acc
    const fim = p.fim ? new Date(p.fim) : new Date()
    return acc + Math.max(0, Math.floor((fim - new Date(p.inicio)) / 60000))
  }, 0)
}

export function iniciarPausa(registroId) {
  const registros = obterRegistros()
  const idx = registros.findIndex((r) => r.id === registroId)
  if (idx < 0) return registros
  const pausas = registros[idx].pausas || []
  if (!pausas.some((p) => !p.fim)) {
    registros[idx] = {
      ...registros[idx],
      pausas: [...pausas, { inicio: new Date().toISOString(), fim: null }],
    }
    salvarRegistros(registros)
  }
  return registros
}

export function encerrarPausa(registroId) {
  const registros = obterRegistros()
  const idx = registros.findIndex((r) => r.id === registroId)
  if (idx < 0) return registros
  const pausas = registros[idx].pausas || []
  const pIdx = pausas.findIndex((p) => !p.fim)
  if (pIdx >= 0) {
    const novasPausas = [...pausas]
    novasPausas[pIdx] = { ...novasPausas[pIdx], fim: new Date().toISOString() }
    registros[idx] = { ...registros[idx], pausas: novasPausas }
    salvarRegistros(registros)
  }
  return registros
}

//  Aviso de esquecimento

// Verdadeiro quando há uma entrada em aberto há mais tempo que o limite (padrão 12h)
export function registroEsquecido(registro, limiteHoras = 12) {
  if (!registro || !registro.entrada || registro.saida) return false
  const minutosDesdeEntrada = (Date.now() - new Date(registro.entrada)) / 60000
  return minutosDesdeEntrada > limiteHoras * 60
}

//  Configuração de jornada / banco de horas 

export function obterConfig() {
  const bruto = localStorage.getItem(CHAVE_CONFIG)
  if (!bruto) {
    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(CONFIG_PADRAO))
    return { ...CONFIG_PADRAO }
  }
  try {
    return { ...CONFIG_PADRAO, ...JSON.parse(bruto) }
  } catch {
    return { ...CONFIG_PADRAO }
  }
}

export function salvarConfig(dados) {
  const novo = { ...obterConfig(), ...dados }
  localStorage.setItem(CHAVE_CONFIG, JSON.stringify(novo))
  return novo
}

function minutosTrabalhadosRegistro(registro) {
  if (!registro.entrada || !registro.saida) return 0
  const total = Math.floor((new Date(registro.saida) - new Date(registro.entrada)) / 60000)
  return Math.max(0, total - minutosPausas(registro))
}

// Calcula o saldo do banco de horas de um empregado com base nos registros completos
export function calcularBancoDeHoras(empregadoId, registros = null) {
  const config = obterConfig()
  const jornada = config.jornadaDiariaMinutos
  const lista = (registros ?? obterRegistros()).filter(
    (r) => r.empregadoId === empregadoId && r.entrada && r.saida
  )

  const minutosPorDia = {}
  lista.forEach((r) => {
    const dia = r.entrada.slice(0, 10)
    minutosPorDia[dia] = (minutosPorDia[dia] || 0) + minutosTrabalhadosRegistro(r)
  })

  const dias = Object.keys(minutosPorDia)
  const saldoMinutos = dias.reduce((acc, dia) => acc + (minutosPorDia[dia] - jornada), 0)

  return {
    saldoMinutos,
    diasComputados: dias.length,
    jornadaDiariaMinutos: jornada,
  }
}

// Formata minutos de saldo com sinal (+/-), ex: "+1h 20min" ou "-45min"
export function formatarSaldo(minutos) {
  const sinal = minutos < 0 ? '-' : '+'
  const abs = Math.abs(minutos)
  const horas = Math.floor(abs / 60)
  const min = abs % 60
  if (horas === 0 && min === 0) return '0min'
  if (horas === 0) return `${sinal}${min}min`
  if (min === 0) return `${sinal}${horas}h`
  return `${sinal}${horas}h ${min}min`
}

//Solicitações de ajuste de ponto 

export function listarSolicitacoes({ empregadoId = null, status = null } = {}) {
  let lista
  try {
    lista = JSON.parse(localStorage.getItem(CHAVE_AJUSTES) || '[]')
  } catch {
    lista = []
  }
  return lista.filter(
    (s) => (!empregadoId || s.empregadoId === empregadoId) && (!status || s.status === status)
  )
}

export function criarSolicitacaoAjuste(dados) {
  const lista = listarSolicitacoes()
  lista.push({
    id: gerarId('ajuste'),
    registroId: dados.registroId,
    empregadoId: dados.empregadoId,
    empregado: dados.empregado,
    campo: dados.campo, // 'entrada' | 'saida'
    valorAtual: dados.valorAtual,
    valorSolicitado: dados.valorSolicitado,
    motivo: dados.motivo || '',
    status: 'pendente', // 'pendente' | 'aprovado' | 'rejeitado'
    criadoEm: new Date().toISOString(),
  })
  localStorage.setItem(CHAVE_AJUSTES, JSON.stringify(lista))
  return lista
}

// Aprova ou rejeita uma solicitação. Se aprovada, aplica a mudança no registro real.
export function responderSolicitacaoAjuste(id, aprovado) {
  const lista = listarSolicitacoes()
  const idx = lista.findIndex((s) => s.id === id)
  if (idx < 0) return lista
  const solicitacao = lista[idx]
  lista[idx] = { ...solicitacao, status: aprovado ? 'aprovado' : 'rejeitado' }
  localStorage.setItem(CHAVE_AJUSTES, JSON.stringify(lista))

  if (aprovado) {
    const registros = obterRegistros()
    const rIdx = registros.findIndex((r) => r.id === solicitacao.registroId)
    if (rIdx >= 0) {
      const registroAtualizado = {
        ...registros[rIdx],
        [solicitacao.campo]: solicitacao.valorSolicitado,
      }
      if (registroAtualizado.entrada && registroAtualizado.saida) {
        registroAtualizado.duracao = formatarDuracaoSimples(
          minutosTrabalhadosRegistro(registroAtualizado)
        )
      }
      registros[rIdx] = registroAtualizado
      salvarRegistros(registros)
    }
  }

  return lista
}

//Lembretes de ponto 

export function obterLembretes() {
  const bruto = localStorage.getItem(CHAVE_LEMBRETES)
  if (!bruto) {
    localStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(LEMBRETES_PADRAO))
    return { ...LEMBRETES_PADRAO }
  }
  try {
    return { ...LEMBRETES_PADRAO, ...JSON.parse(bruto) }
  } catch {
    return { ...LEMBRETES_PADRAO }
  }
}

export function salvarLembretes(dados) {
  const novo = { ...obterLembretes(), ...dados }
  localStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(novo))
  return novo
}