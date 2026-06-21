import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './saida.css'
import { listarEmpregados, listarMercados, listarLojas } from './dados'

// ─── Componente Relógio com horas trabalhadas ──────────────────────

function RelogioSaida({ horaRegistro, horasTrabalhadas }) {
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
          Saída registrada às {formatar(horaRegistro)}
        </div>
      )}
      {horasTrabalhadas && (
        <div className="horas-trabalhadas">
          <span className="horas-label">Horas trabalhadas</span>
          <span className="horas-valor">{horasTrabalhadas}</span>
        </div>
      )}
    </div>
  )
}

// ─── Calcula diferença entre dois Date e retorna string "Xh Ym" ───

function calcularHorasTrabalhadas(entrada, saida) {
  const diffMs = saida - entrada
  if (diffMs <= 0) return null

  const totalMinutos = Math.floor(diffMs / 60000)
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60

  if (horas === 0) return `${minutos}min`
  if (minutos === 0) return `${horas}h`
  return `${horas}h ${minutos}min`
}

// ──────────────────────────────────────────────────────────────────

function RegistrarSaida() {
  const navigate = useNavigate()

  const [mercado, setMercado]             = useState('')
  const [loja, setLoja]                   = useState('')
  const [empregado, setEmpregado]         = useState('')
  const [imagem, setImagem]               = useState(null)
  const [preview, setPreview]             = useState(null)
  const [sucesso, setSucesso]             = useState(false)
  const [horaRegistro, setHoraRegistro]   = useState(null)
  const [horasTrabalhadas, setHorasTrabalhadas] = useState(null)

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

    // Busca a entrada correspondente no localStorage
    const registros = JSON.parse(localStorage.getItem('registros_ponto') || '[]')

    // Encontra a entrada mais recente do mesmo empregado + loja ainda sem saída
    const entradaIndex = [...registros].reverse().findIndex(
      (r) => r.empregadoId === empregado && r.lojaId === loja && !r.saida
    )
    const entradaReal = entradaIndex >= 0
      ? registros[registros.length - 1 - entradaIndex]
      : null

    let duracao = null
    if (entradaReal) {
      duracao = calcularHorasTrabalhadas(new Date(entradaReal.entrada), agora)
      // Atualiza o registro existente com a saída
      registros[registros.length - 1 - entradaIndex] = {
        ...entradaReal,
        saida: agora.toISOString(),
        duracao,
      }
    } else {
      // Não encontrou entrada correspondente — cria registro de saída avulso
      const empObj  = empregados.find((e) => e.id === empregado)
      const mercObj = mercados.find((m) => m.id === mercado)
      const lojaObj = lojas.find((l) => l.id === loja)

      registros.push({
        id: crypto.randomUUID(),
        empregadoId: empregado,
        empregado:   empObj?.nome  ?? empregado,
        mercadoId:   mercado,
        mercado:     mercObj?.nome ?? mercado,
        lojaId:      loja,
        loja:        lojaObj?.nome ?? loja,
        entrada:     null,
        saida:       agora.toISOString(),
        duracao:     null,
      })
    }

    localStorage.setItem('registros_ponto', JSON.stringify(registros))
    setHorasTrabalhadas(duracao)
    setSucesso(true)

    setTimeout(() => {
      setSucesso(false)
      setHoraRegistro(null)
      setHorasTrabalhadas(null)
      navigate('/entrada')
    }, 4000)
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
          <h1>Registrar Saída</h1>
          <p>Preencha os dados para encerrar o ponto</p>
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
            <label>Foto de Saída</label>
            <div className={`area-imagem${preview ? ' tem-imagem' : ''}`}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="input-arquivo"
                onChange={aoSelecionarImagem}
                aria-label="Selecionar foto de saída"
              />
              {preview ? (
                <>
                  <img src={preview} alt="Preview da saída" className="preview-imagem" />
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
            className="botao-registrar saida"
            onClick={aoRegistrar}
            disabled={!formularioValido}
          >
            Confirmar Saída
          </button>

        </div>
      </main>

      {sucesso && (
        <div className="overlay-sucesso" role="status" aria-live="polite">
          <div className="modal-sucesso">
            <div className="modal-icone saida">←</div>
            <p className="modal-titulo">Saída registrada!</p>
            <RelogioSaida horaRegistro={horaRegistro} horasTrabalhadas={horasTrabalhadas} />
          </div>
        </div>
      )}

    </div>
  )
}

export default RegistrarSaida