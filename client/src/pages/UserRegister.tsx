import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import axios from "../api/axios"
import mainImg from "../assets/main-img.jpg"

const UserRegister: React.FC = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            await axios.post("/auth/register", {
                username: form.username,
                email: form.email,
                password: form.password,
                firstname: "",
                lastname: ""
            })
            navigate("/userLogin")
        } catch (err: any) {
            setError(err?.response?.data?.message || "Registration failed")
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

            <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-6 border border-gray-300 rounded-xl shadow-md shadow-blue-500">
                <h1 className="text-2xl mb-4 font-semibold">Sign Up</h1>
                {error && (<p className="text-red-600 mb-2">{error}</p>)}
                <div className="mb-3">
                    <input type='text' name="username" placeholder='Username' className='w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1' required value={form.username} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <input type='email' name="email" placeholder='Email' className='w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1' required value={form.email} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <input type='password' name="password" placeholder='Password' className='w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1' required value={form.password} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <input type='password' name="confirmPassword" placeholder='Confirm Password' className='w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1' required value={form.confirmPassword} onChange={handleChange} />
                </div>
                <button type="submit" className='bg-blue-600 text-white px-4 py-2 rounded-md shadow-md shadow-blue-500 mt-2'> Register </button>
                <p className="mt-4 text-sm"> Already have an account?{" "}
                    <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/userLogin")}>Login</span>
                </p>
            </form>
            </div>
        </div>
    )
}

export default UserRegister
