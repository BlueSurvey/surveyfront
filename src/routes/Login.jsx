import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import Button from '../components/Button'
import Wave from '../layout/Wave'
import { Toaster, toast } from 'react-hot-toast';


const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const auth = useAuth();
    const goTo = useNavigate();

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" />
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (response.ok) {
                console.log("Sesión iniciada")

                const json = await response.json();

                if (json.body.accessToken && json.body.refreshToken) {
                    console.log(json)
                    auth.saveUser(json)
                    goTo("/dashboard")
                }

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
        goTo('/signup')
    }

    return (
        <>
            <Wave />
            <div className="form-container">
                <form className="form container" onSubmit={handleSubmit}>
                    <h2 className="title_login">Bienvenido de nuevo</h2>
                    <label className="label">Correo</label>
                    <input
                        className="input"
                        type="email"
                        placeholder="correo@gmail.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="label">Contraseña</label>
                    <input
                        className="input"
                        type="password"
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        text="Iniciar Sesión"
                        color="green"
                        style="buttonForm"
                    />
                    <p className="text-center">¿Aún no tienes cuenta? <span className="span" onClick={handleClick}>Registrate</span> </p>
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

export default Login; 