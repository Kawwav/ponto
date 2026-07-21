import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './lembretes.css'
import { obterLembretes, salvarLembretes } from './dados'

function Lembretes() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(obterLembretes())
  const [permissao, setPermissao] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  function atualizar(mudanca) {
    const novo = salvarLembretes(mudanca)
    setConfig(novo)
  }

  async function aoPedirPermissao() {
    if (typeof Notification === 'undefined') return
    const resultado = await Notification.requestPermission()
    setPermissao(resultado)
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
          <h1>Lembretes</h1>
          <p>Receba um aviso na hora de bater o ponto</p>
        </div>

        <div className="formulario">

          {permissao === 'default' && (
            <div className="aviso-permissao">
              <p>Ative as notificações do navegador para receber os lembretes, mesmo com o app fechado.</p>
              <button type="button" className="btn-permitir" onClick={aoPedirPermissao}>
                Permitir notificações
              </button>
            </div>
          )}

          {permissao === 'denied' && (
            <div className="aviso-permissao aviso-permissao-negada">
              <p>As notificações estão bloqueadas nas configurações do navegador. Os horários abaixo ficam salvos, mas o aviso não vai aparecer até você permitir.</p>
            </div>
          )}

          {permissao === 'unsupported' && (
            <div className="aviso-permissao">
              <p>Seu navegador não suporta notificações. Os horários ficam salvos mesmo assim.</p>
            </div>
          )}

          <div className="lembrete-grupo">
            <div className="lembrete-cabecalho">
              <label htmlFor="lembrete-entrada">Lembrar de registrar entrada</label>
              <button
                type="button"
                className={`interruptor${config.entradaAtivo ? ' ativo' : ''}`}
                onClick={() => atualizar({ entradaAtivo: !config.entradaAtivo })}
                role="switch"
                aria-checked={config.entradaAtivo}
              >
                <span className="interruptor-bolinha" />
              </button>
            </div>
            <input
              id="lembrete-entrada"
              type="time"
              value={config.entradaHorario}
              onChange={(e) => atualizar({ entradaHorario: e.target.value })}
              disabled={!config.entradaAtivo}
            />
          </div>

          <div className="divisor" />

          <div className="lembrete-grupo">
            <div className="lembrete-cabecalho">
              <label htmlFor="lembrete-saida">Lembrar de registrar saída</label>
              <button
                type="button"
                className={`interruptor${config.saidaAtivo ? ' ativo' : ''}`}
                onClick={() => atualizar({ saidaAtivo: !config.saidaAtivo })}
                role="switch"
                aria-checked={config.saidaAtivo}
              >
                <span className="interruptor-bolinha" />
              </button>
            </div>
            <input
              id="lembrete-saida"
              type="time"
              value={config.saidaHorario}
              onChange={(e) => atualizar({ saidaHorario: e.target.value })}
              disabled={!config.saidaAtivo}
            />
          </div>

          <p className="lembrete-nota">
            O lembrete verifica o horário enquanto o app estiver aberto em alguma aba do navegador.
          </p>

        </div>

      </main>
    </div>
  )
}

export default Lembretes
