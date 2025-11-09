"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "../firebase"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { Eye, EyeOff, Wallet, Check, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ApiService from "../services/api"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!")
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      })

      const idToken = await userCredential.user.getIdToken()

      try {
        const userData = await ApiService.login(idToken, formData.name)
        console.log("Usuário criado no backend:", userData)
      } catch (backendError) {
        console.error("Erro ao conectar com o backend:", backendError)
      }

      navigate("/dashboard")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.")
      } else if (error.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.")
      } else {
        setError("Erro ao criar conta. Tente novamente.")
      }
      console.error("Erro no cadastro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: "Pelo menos 8 caracteres", met: formData.password.length >= 8 },
    { text: "Pelo menos uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { text: "Pelo menos um número", met: /\d/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 via-purple-800 to-black flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>

        <div className="relative z-10 space-y-2">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold">Nanas</h1>
          <p className="text-purple-100 text-lg">Gestão financeira inteligente</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="text-purple-100 max-w-sm">
              Comece sua jornada de gestão financeira inteligente com segurança e facilidade.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <span className="text-purple-100 text-sm">Cadastro rápido e seguro</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <span className="text-purple-100 text-sm">Comece a controlar suas finanças agora</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center space-y-3 mb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-700 to-black rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Nanas</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-black">Criar Conta</h2>
            <p className="text-gray-600">Preencha os dados abaixo para se cadastrar</p>
          </div>

          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-50/50 border border-red-200 rounded-lg">{error}</div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-11 pr-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2 mt-3">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 flex-shrink-0 ${req.met ? "text-purple-600" : "text-gray-300"}`} />
                          <span className={req.met ? "text-purple-700 font-medium" : "text-gray-500"}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black font-medium">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="h-11 pr-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 font-medium">As senhas não coincidem</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-black text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={isLoading || formData.password !== formData.confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Criar conta
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-purple-700 hover:text-purple-900 font-semibold transition-colors hover:underline"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos{" "}
            <button className="hover:underline text-gray-600">termos de uso</button>
          </p>
        </div>
      </div>
    </div>
  )
}
