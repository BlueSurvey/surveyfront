import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import '../assets/styles/form.css'
import Button from "../components/Button";
import Wave from "../layout/Wave";
import { Toaster, toast } from 'react-hot-toast';


const SignUp = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const auth = useAuth();
    const goTo = useNavigate();


    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" />
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            if (response.ok) {
                goTo("/login")

            } else {
                const errorData = await response.json();
                const messageError = errorData.body.error;
                toast.error(messageError)
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleClick = () => {
        goTo('/login')
    }

    return (
        <>
            <Wave />
            <div className="form-container">
                <form className="container form" onSubmit={handleSubmit}>
                    <h2 className="title_signup">Registro</h2>
                    <label className="label">Nombre</label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label className="label">Correo</label>
                    <input
                        className="input"
                        type="email"
                        placeholder="correo@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className="label">Contraseña</label>
                    <input
                        className="input"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}

                    />
                    <Button
                        color="green"
                        text="Registrarse"
                        style="buttonForm"
                    />
                    <p className="text-center">¿Ya tienes cuenta? <span className="span" onClick={handleClick}>Inicia Sesión</span> </p>
                </form>
            </div>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        fontSize: "1.6rem",
                        backgroundColor: "#fff"
                    }
                }}
            />

        </>
    );
}

export default SignUp; 