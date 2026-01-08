import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { Eye, EyeOff, Wallet, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import apiService from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const idToken = await user.getIdToken()

      // Usar o serviço de API configurado com variáveis de ambiente
      apiService.setIdToken(idToken)
      const userData = await apiService.login(idToken, user.displayName || user.email)

      if (userData) {
        navigate("/dashboard")
      } else {
        setError("Erro ao sincronizar dados do usuário.")
      }
    } catch (error) {
      // Melhor tratamento de erro - não navegar quando há erro!
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setError("Email ou senha incorretos. Tente novamente.")
      } else if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado. Verifique o email.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde alguns minutos.")
      } else {
        setError("Erro ao fazer login. Tente novamente.")
      }
      console.error("Erro no login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 via-purple-900 to-black flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>

        <div className="relative z-10 space-y-2">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold">Nanas</h1>
          <p className="text-purple-200 text-lg">Gestão financeira inteligente</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="text-purple-200 max-w-sm">
              Acesse sua conta para gerenciar suas finanças com segurança e facilidade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-purple-200 text-sm">Proteção de dados com criptografia</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-purple-200 text-sm">Acesso rápido e seguro 24/7</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center space-y-3 mb-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Nanas</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Entrar</h2>
            <p className="text-slate-600">Digite suas credenciais para acessar sua conta</p>
          </div>

          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-50/50 border border-red-200 rounded-lg">{error}</div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Entrar
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 text-center">
                  Não tem uma conta?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline"
                  >
                    Cadastre-se aqui
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-500">
            Ao entrar, você concorda com nossos{" "}
            <button className="hover:underline text-slate-600">termos de uso</button>
          </p>
        </div>
      </div>
    </div>
  )
}
