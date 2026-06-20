import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'

function Login() {
  // Estado dos campos do formulário
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // Hook para navegar entre páginas
  const navigate = useNavigate()

  // Ao clicar em entrar, vai para a tela de entrada
  function aoEntrar() {
    navigate('/entrada')
  }

  return (
    // Página inteira com fundo escuro centralizado
    <div className="pagina">

      {/* Logo no topo centralizada */}
      <div className="logo">
        <img src="Logo.png" alt="Logo" />
      </div>

      {/* Card do formulário de login */}
      <div className="cartao">
        <h1>Bem-vindo de volta</h1>
        <p className="subtitulo">Acesse sua conta para continuar</p>

        {/* Campo de e-mail */}
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Campo de senha com link "esqueci senha" ao lado do label */}
        <div className="campo-senha">
          <div className="linha-label">
            <label htmlFor="senha">Senha</label>
            <a href="/esqueci-senha" className="link-esqueci">Esqueci minha senha</a>
          </div>
          <input
            id="senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {/* Botão principal de login */}
        <button type="button" className="botao" onClick={aoEntrar}>
          Entrar
        </button>

        {/* Linha divisória */}
        <div className="divisor" />

        {/* Link para cadastro */}
        <p className="rodape">
          Ainda não tem conta?
          <a href="/cadastro">Criar conta</a>
        </p>
      </div>
    </div>
  )
}

export default Login