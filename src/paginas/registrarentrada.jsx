import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './registrarentrada.css'
import { listarEmpregados, listarMercados, listarLojas } from './dados'

// ─── Componente Relógio ────────────────────────────────────────────

function Relogio({ horaRegistro }) {
  const [agora, setAgora] = useState(new Date())
  const intervalo = useRef(null)

  useEffect(() => {
    intervalo.current = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(intervalo.current)
  }, [])

  function formatar(data) {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="relogio-container">
      <div className="relogio-hora">{formatar(agora)}</div>
      <div className="relogio-data">{formatarData(agora)}</div>
      {horaRegistro && (
        <div className="relogio-registro">
          Registrado às {formatar(horaRegistro)}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────

function RegistrarEntrada() {
  const navigate = useNavigate()

  const [mercado, setMercado]           = useState('')
  const [loja, setLoja]                 = useState('')
  const [empregado, setEmpregado]       = useState('')
  const [imagem, setImagem]             = useState(null)
  const [preview, setPreview]           = useState(null)
  const [sucesso, setSucesso]           = useState(false)
  const [horaRegistro, setHoraRegistro] = useState(null)

  const [empregados, setEmpregados] = useState([])
  const [mercados, setMercados]     = useState([])
  const [todasLojas, setTodasLojas] = useState([])

  useEffect(() => {
    setEmpregados(listarEmpregados())
    setMercados(listarMercados())
    setTodasLojas(listarLojas())
  }, [])

  const lojas = mercado ? todasLojas.filter((l) => l.mercadoId === mercado) : []
  const formularioValido = mercado && loja && empregado

  function aoMudarMercado(e) {
    setMercado(e.target.value)
    setLoja('')
  }

  function aoSelecionarImagem(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setImagem(arquivo)
    const leitor = new FileReader()
    leitor.onload = (ev) => setPreview(ev.target.result)
    leitor.readAsDataURL(arquivo)
  }

  function aoRemoverImagem(e) {
    e.stopPropagation()
    setImagem(null)
    setPreview(null)
  }

  function aoRegistrar() {
    if (!formularioValido) return

    const agora = new Date()
    setHoraRegistro(agora)

    // Monta objetos legíveis para o relatório
    const empObj  = empregados.find((e) => e.id === empregado)
    const mercObj = mercados.find((m) => m.id === mercado)
    const lojaObj = lojas.find((l) => l.id === loja)

    // Salva o registro de entrada no localStorage
    const registros = JSON.parse(localStorage.getItem('registros_ponto') || '[]')
    registros.push({
      id:          crypto.randomUUID(),
      empregadoId: empregado,
      empregado:   empObj?.nome  ?? empregado,
      mercadoId:   mercado,
      mercado:     mercObj?.nome ?? mercado,
      lojaId:      loja,
      loja:        lojaObj?.nome ?? loja,
      entrada:     agora.toISOString(),
      saida:       null,
      duracao:     null,
    })
    localStorage.setItem('registros_ponto', JSON.stringify(registros))

    setSucesso(true)

    setTimeout(() => {
      setSucesso(false)
      setHoraRegistro(null)
      navigate('/entrada')
    }, 3500)
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

        <div className="cabecalho-secao">
          <h1>Registrar Entrada</h1>
          <p>Preencha os dados para registrar o ponto de entrada</p>
        </div>

        <div className="formulario">

          <div className="campo-grupo">
            <label htmlFor="mercado">Mercado</label>
            <select id="mercado" value={mercado} onChange={aoMudarMercado}>
              <option value="" disabled>Selecione o mercado</option>
              {mercados.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

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
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label htmlFor="empregado">Funcionário</label>
            <select
              id="empregado"
              value={empregado}
              onChange={(e) => setEmpregado(e.target.value)}
            >
              <option value="" disabled>Selecione o funcionário</option>
              {empregados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>

          <div className="divisor" />

          <div className="campo-grupo">
            <label>Foto de Entrada</label>
            <div className={`area-imagem${preview ? ' tem-imagem' : ''}`}>
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
                  <img src={preview} alt="Preview da entrada" className="preview-imagem" />
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
                  <span className="icone-upload">📷</span>
                  <p className="texto-upload">
                    Tirar foto ou escolher da galeria
                    <span>JPG, PNG, HEIC — opcional</span>
                  </p>
                </>
              )}
            </div>
          </div>

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

      {sucesso && (
        <div className="overlay-sucesso" role="status" aria-live="polite">
          <div className="modal-sucesso">
            <div className="modal-icone">✓</div>
            <p className="modal-titulo">Entrada registrada!</p>
            <Relogio horaRegistro={horaRegistro} />
          </div>
        </div>
      )}

    </div>
  )
}

export default RegistrarEntrada