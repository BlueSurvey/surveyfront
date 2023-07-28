import { useAuth } from '../auth/AuthProvider'
import { useEffect, useState } from 'react'
import '../assets/styles/dashboard.css'
import Header from '../layout/Header'
import SurveyModal from '../components/SurveyModal'
import Survey from '../components/Survey'
import createIcon from '../assets/img/createW.svg'
import { toast } from 'react-hot-toast'


const Dashboard = () => {

    const [stateModal, setStateModal] = useState(false)
    const [surveys, setSurveys] = useState([])
    const [selectedSurvey, setSelectedSurvey] = useState(null);


    const auth = useAuth();

    useEffect(() => {
        toast.loading('Cargando encuestas...')
        loadSurveys();
    }, [])

    const loadSurveys = async () => {
        try {
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.getAccessToken()}`
                }
            })
           
            if (response.ok) {
                toast.remove()
                const json = await response.json();
                setSurveys(json)
            } else {
                toast.error('Error en la conexion')
                console.log('Error en la conexion')
            }

        } catch (error) {
            console.log(error)
        }
        
    }

    return (
        <>
            <Header />
            <div className='container'>
                <button className='crear_encuesta' onClick={() => setStateModal(!stateModal)}>
                    Crear encuesta
                    <img src={createIcon} className='icon_create' />
                </button>
                <div className="container_surveys">

                    {surveys.map((survey) => (<div onClick={() => setSelectedSurvey(survey._id)} className="container_survey" key={survey._id}>
                        <div className='container_survey_header'>
                            <div className='icons'>

                            </div>
                            <p className='title_survey_dashboard'>{survey.title}</p>
                        </div>
                        <div className='container_survey_footer'>
                            Preguntas: {survey.questions.length}
                        </div>

                    </div>))}

                    {selectedSurvey && <Survey
                        id={selectedSurvey}
                        closeSurvey={setSelectedSurvey}
                        updateSurveys={loadSurveys}
                    />}

                </div>
                <SurveyModal
                    state={stateModal}
                    changeState={setStateModal}
                    updateSurvey={setSurveys}
                />
            </div>
        </>
    );
}

export default Dashboard; 