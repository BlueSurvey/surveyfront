import './assets/styles/home.css'
import Button from './components/Button'
import { useAuth } from './auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import Wave from './layout/Wave';

const Home = () => {

    const auth = useAuth();

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" />
    }

    return (
        <>
            <Wave />
            <div className='container_home'>
                <div className='content'>
                    <section className='container_title'>
                        <h1 className='title'>Bienvenido a <span className='title_name'>BlueSurvey</span></h1>
                    </section>

                    <section className='container_content'>
                        <p className='p_description'>"Conéctate con tu audiencia, pregunta y ellos responden"</p>
                        <Button text='Iniciar Sesión' color='green' to="/login" />
                        <Button text='Registrarse' color='blue' to="/signup" />
                    </section>
                    <div className='container_content_img'>
                    </div>
                </div>
            </div>
        </>

    );
}

export default Home;