import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './registrarentrada.css'

// ─── Dados de exemplo ──────────────────────────────────────────────
// TODO: substituir pelos dados reais vindos do backend/API

const mercados = [
  { id: 'mercado-a', label: 'Mercado A' },
  { id: 'mercado-b', label: 'Mercado B' },
  { id: 'mercado-c', label: 'Mercado C' },
]

const lojasPorMercado = {
  'mercado-a': [
    { id: 'loja-a1', label: 'Loja A1 — Centro' },
    { id: 'loja-a2', label: 'Loja A2 — Norte' },
  ],
  'mercado-b': [
    { id: 'loja-b1', label: 'Loja B1 — Sul' },
    { id: 'loja-b2', label: 'Loja B2 — Leste' },
    { id: 'loja-b3', label: 'Loja B3 — Oeste' },
  ],
  'mercado-c': [
    { id: 'loja-c1', label: 'Loja C1 — Centro' },
  ],
}

const empregados = [
  { id: 'emp-1', label: 'Leonardo Silva' },
  { id: 'emp-2', label: 'Maria Oliveira' },
  { id: 'emp-3', label: 'Carlos Santos' },
  { id: 'emp-4', label: 'Ana Costa' },
]

// ──────────────────────────────────────────────────────────────────

function RegistrarEntrada() {
  const navigate = useNavigate()

  // Estados do formulário
  const [mercado, setMercado]     = useState('')
  const [loja, setLoja]           = useState('')
  const [empregado, setEmpregado] = useState('')
  const [imagem, setImagem]       = useState(null)       // objeto File
  const [preview, setPreview]     = useState(null)       // data URL para exibir
  const [sucesso, setSucesso]     = useState(false)

  // Lojas disponíveis para o mercado selecionado
  const lojas = mercado ? (lojasPorMercado[mercado] ?? []) : []

  // Formulário válido quando todos os campos estão preenchidos
  const formularioValido = mercado && loja && empregado

  // Ao trocar o mercado, limpa a loja selecionada
  function aoMudarMercado(e) {
    setMercado(e.target.value)
    setLoja('')
  }

  // Ao selecionar uma imagem via input file
  function aoSelecionarImagem(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setImagem(arquivo)

    // Gera preview local
    const leitor = new FileReader()
    leitor.onload = (ev) => setPreview(ev.target.result)
    leitor.readAsDataURL(arquivo)
  }

  // Remove a imagem selecionada
  function aoRemoverImagem(e) {
    e.stopPropagation() // evita abrir o seletor de arquivo
    setImagem(null)
    setPreview(null)
  }

  // Submete o registro de entrada
  function aoRegistrar() {
    if (!formularioValido) return

    // TODO: enviar para o backend (mercado, loja, empregado, imagem)
    console.log('Registrando entrada:', { mercado, loja, empregado, imagem })

    // Feedback visual de sucesso
    setSucesso(true)
    setTimeout(() => {
      setSucesso(false)
      navigate('/entrada')
    }, 1800)
  }

  return (
    <div className="pagina">

      {/* Cabeçalho com botão voltar e logo */}
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

      {/* Conteúdo principal */}
      <main className="conteudo">

        {/* Título da seção */}
        <div className="cabecalho-secao">
          <h1>Registrar Entrada</h1>
          <p>Preencha os dados para registrar o ponto de entrada</p>
        </div>

        {/* Card do formulário */}
        <div className="formulario">

          {/* Seleção de Mercado */}
          <div className="campo-grupo">
            <label htmlFor="mercado">Mercado</label>
            <select
              id="mercado"
              value={mercado}
              onChange={aoMudarMercado}
            >
              <option value="" disabled>Selecione o mercado</option>
              {mercados.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Seleção de Loja — desabilitada até escolher mercado */}
          <div className="campo-grupo">
            <label htmlFor="loja">Loja</label>
            <select
              id="loja"
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              disabled={!mercado}
              style={{ opacity: mercado ? 1 : 0.45 }}
            >
              <option value="" disabled>
                {mercado ? 'Selecione a loja' : 'Selecione um mercado primeiro'}
              </option>
              {lojas.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Seleção de Empregado */}
          <div className="campo-grupo">
            <label htmlFor="empregado">Funcionário</label>
            <select
              id="empregado"
              value={empregado}
              onChange={(e) => setEmpregado(e.target.value)}
            >
              <option value="" disabled>Selecione o funcionário</option>
              {empregados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.label}</option>
              ))}
            </select>
          </div>

          <div className="divisor" />

          {/* Upload de imagem com câmera */}
          <div className="campo-grupo">
            <label>Foto de Entrada</label>

            <div className={`area-imagem${preview ? ' tem-imagem' : ''}`}>
              {/* Input file escondido — aceita câmera no mobile */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="input-arquivo"
                onChange={aoSelecionarImagem}
                aria-label="Selecionar foto de entrada"
              />

              {preview ? (
                <>
                  {/* Preview da imagem selecionada */}
                  <img
                    src={preview}
                    alt="Preview da entrada"
                    className="preview-imagem"
                  />

                  {/* Botão para remover a imagem */}
                  <button
                    type="button"
                    className="btn-remover-imagem"
                    onClick={aoRemoverImagem}
                    aria-label="Remover imagem"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  {/* Estado vazio — convite para tirar foto */}
                  <span className="icone-upload">📷</span>
                  <p className="texto-upload">
                    Tirar foto ou escolher da galeria
                    <span>JPG, PNG, HEIC — opcional</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Botão de confirmar */}
          <button
            type="button"
            className="botao-registrar"
            onClick={aoRegistrar}
            disabled={!formularioValido}
          >
            Confirmar Entrada
          </button>

        </div>
      </main>

      {/* Toast de sucesso */}
      {sucesso && (
        <div className="toast" role="status">
          ✓ Entrada registrada com sucesso!
        </div>
      )}

    </div>
  )
}

export default RegistrarEntrada