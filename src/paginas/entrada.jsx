import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './entrada.css'
import { obterRegistroAberto, temPausaAberta, iniciarPausa, encerrarPausa, registroEsquecido } from './dados'

const menus = [
  { id: 'registrar-entrada',  label: 'Registrar Entrada',  icon: '→', rota: '/registrar-entrada' },
  { id: 'registrar-saida',    label: 'Registrar Saída',    icon: '←', rota: '/registrar-saida' },
  { id: 'relatorio',          label: 'Relatório',           icon: '▤', rota: '/relatorio' },
  {
    id: 'lembretes',
    label: 'Lembretes',
    icon: (
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3C9.79 3 8 4.79 8 7v3.09c0 .59-.23 1.16-.65 1.58L5.7 13.32c-.9.9-.26 2.43 1 2.43h10.6c1.26 0 1.9-1.53 1-2.43l-1.65-1.65A2.25 2.25 0 0 1 16 10.09V7c0-2.21-1.79-4-4-4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    rota: '/lembretes',
  },
  { id: 'painel-adm',         label: 'Painel Admin',        icon: '🛡', rota: '/adm' },
]

function formatarHora(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatarDataHora(isoString) {
  if (!isoString) return '—'
  const data = new Date(isoString)
  const ehHoje = new Date().toDateString() === data.toDateString()
  const diaFormatado = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${ehHoje ? 'hoje' : diaFormatado} às ${formatarHora(isoString)}`
}

function Entrada() {
  const navigate = useNavigate()

  // TODO: substituir pelo id real do usuário autenticado (ex: vindo do contexto de auth)
  const usuarioAtual = localStorage.getItem('usuario_id') || 'emp-1'

  const [registroAberto, setRegistroAberto] = useState(null)

  function recarregarStatus() {
    setRegistroAberto(obterRegistroAberto(usuarioAtual))
  }

  useEffect(() => {
    recarregarStatus()
  }, [])

  function aoClicar(item) {
    if (item.rota) {
      navigate(item.rota)
    } else {
      console.log('Em breve:', item.id)
    }
  }

  function aoIniciarPausa() {
    if (!registroAberto) return
    iniciarPausa(registroAberto.id)
    recarregarStatus()
  }

  function aoEncerrarPausa() {
    if (!registroAberto) return
    encerrarPausa(registroAberto.id)
    recarregarStatus()
  }

  const emPausa = temPausaAberta(registroAberto)
  const esquecido = registroEsquecido(registroAberto)
  const inicioPausa = emPausa ? registroAberto.pausas.find((p) => !p.fim)?.inicio : null

  return (
    <div className="pagina">

      <header className="topo">
        <img src="Logo.png" alt="Logo" className="logo" />
      </header>

      <main className="conteudo">

        <div className="titulo">
          <p className="boas-vindas">Seja bem-vindo, <span className="nome-usuario">Leonardo</span></p>
          <h1>O que deseja fazer?</h1>
        </div>

        {/* Aviso de esquecimento: entrada aberta há muito tempo sem saída */}
        {esquecido && (
          <div className="aviso-esquecimento" role="alert">
            <span className="aviso-icone">⚠</span>
            <div className="aviso-texto">
              <p className="aviso-titulo">Você ainda não registrou a saída</p>
              <p className="aviso-sub">Entrada em {registroAberto.loja} {formatarDataHora(registroAberto.entrada)}</p>
            </div>
            <button type="button" className="aviso-botao" onClick={() => navigate('/registrar-saida')}>
              Registrar saída
            </button>
          </div>
        )}

        {/* Status do dia: trabalhando ou em intervalo, com controle de pausa */}
        {registroAberto && !esquecido && (
          <div className={`status-dia${emPausa ? ' pausa' : ''}`}>
            <div className="status-dia-texto">
              <span className="status-dia-label">{emPausa ? 'Em intervalo desde' : 'Trabalhando desde'}</span>
              <span className="status-dia-hora">
                {formatarHora(emPausa ? inicioPausa : registroAberto.entrada)}
              </span>
            </div>
            <button
              type="button"
              className="status-dia-botao"
              onClick={emPausa ? aoEncerrarPausa : aoIniciarPausa}
            >
              {emPausa ? 'Voltar do intervalo' : 'Iniciar intervalo'}
            </button>
          </div>
        )}

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