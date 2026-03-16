import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import mainImg from "../assets/main-img.jpg"

interface UserLoginProps {
  onLogin?: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      })

      const token = res?.data?.token || res?.data?.accessToken || res?.data?.data?.token

      if (!token) {
        setError("Login succeeded but no token received from server")
        setLoading(false)
        return
      }

  localStorage.setItem("token", token)
  onLogin && onLogin()
      const user = res.data?.user;
      if (user) localStorage.setItem("user", JSON.stringify(user))

      setLoading(false)
      
      if (user?.role === 'ADMIN') {
        navigate("/admin/dashboard")
      } else {
        navigate("/")
      }
    } catch (err: any) {
      setLoading(false)
      setError(err?.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-8 px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="w-full md:w-1/2 flex justify-center">
          <picture className="w-full max-w-lg">
            <source srcSet={mainImg} type="image/webp" />
            <img src={mainImg} alt="Illustration" loading="lazy" className="w-full h-auto rounded-lg" />
          </picture>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-6 border shadow-md shadow-blue-500 border-gray-300 rounded-xl">
          <h1 className="text-2xl mb-4 font-semibold">Login</h1>
          {error && <p className="text-red-600 mb-2">{error}</p>}

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md shadow-md shadow-blue-500 mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-4 text-sm">
            Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/userRegister")}>Register</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default UserLogin