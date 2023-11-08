import { Link, json } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import '../assets/styles/header.css'


const Header = ({ children }) => {

    const auth = useAuth();

    const handleSignout = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signout`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${auth.getRefreshToken()}`
                }
            })

            if (response.ok) {
                auth.signOut();
            }

        } catch (error) {

        }
    }
    return (
        <>
            <header className="header">
                <nav className="nav container">
                    <ul className="ul">
                        <li className="li">
                            <Link className="link" to="/dashboard">Mis encuestas</Link>
                        </li>
                        {/* <li className="li">
                            <Link className="link" to="/me">Perfil</Link>
                        </li> */}
                        <li className="li">
                            <a className="link" href="#" onClick={handleSignout}>Salir</a>
                        </li>
                    </ul>

                </nav>
            </header>
        </>
    )
}

export default Header;