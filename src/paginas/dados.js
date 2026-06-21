const CHAVE_EMPREGADOS = 'cad_empregados'
const CHAVE_MERCADOS   = 'cad_mercados'
const CHAVE_LOJAS      = 'cad_lojas'


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

// ─── Helpers genéricos de leitura/escrita ─────────────────────────

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

// ─── Empregados ────────────────────────────────────────────────────

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

// ─── Mercados ──────────────────────────────────────────────────────

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

// ─── Lojas ─────────────────────────────────────────────────────────

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
