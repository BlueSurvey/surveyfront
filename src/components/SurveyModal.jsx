import { useState, useEffect } from 'react';
import '../assets/styles/survey.css'
import { useAuth } from '../auth/AuthProvider';
import Question from '../routes/Question';
import { Toaster, toast } from 'react-hot-toast';


const Survey = ({ state, changeState, enableEditMode, survey, id, loadDataSurvey, updateSurvey }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([])

    const auth = useAuth();

    useEffect(() => {
        if (enableEditMode) {
            setTitle(survey.title);
            setDescription(survey.description);
            setQuestions(survey.questions);
        } else {
            setTitle('');
            setDescription('');
            setQuestions([]);
        }
    }, [enableEditMode, survey]);

    const handleUpdateQuestions = (newQuestions) => {
        setQuestions(newQuestions);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.getAccessToken()}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    questions,

                })
            });

            if (response.ok) {
                const newSurvey = await response.json();
                updateSurvey((surveys) => [...surveys, newSurvey])
                console.log('Encuesta creada correctamente');
                toast.success('Encuesta creada')
                setTitle("")
                setDescription("")
                setQuestions([])
                changeState(false)
            } else {
                const errorData = await response.json()
                const messageError = errorData.body.error;
                toast.error(messageError)
            }

        } catch (error) {
            console.log(error)
        }
    }

    const toggleModal = () => {
        setTitle("");
        setDescription("")
        setQuestions([])
        changeState(false)
    }

    const sendUpdateSurvey = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.getAccessToken()}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    questions,
                })
            })
            if (response.ok) {
                toast.success('Encuesta actualizada')
                loadDataSurvey();
            }

        } catch (error) {
            console.log('Error al actualizar')
        }
        changeState(false)
    }


    return (
        <>
            {state &&
                <div className='overlay'>
                    <div className='container_modal container'>
                        <form className='form_modal' onSubmit={handleSubmit}>
                            <div className='header_modal'>
                                <h3>Nombre de la encuesta</h3>
                                <input
                                    className='input'
                                    placeholder='Nombre'
                                    type='text'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />

                                <h3>Descripcion</h3>
                                <input
                                    className='input'
                                    placeholder="Descripcion"
                                    type='text'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className='content_modal'>
                                <Question
                                    questions={questions}
                                    setQuestions={handleUpdateQuestions}

                                />

                            </div>
                            
                            <div className='footer_modal'>
                                <div className='buttons_modal'>

                                    {
                                        enableEditMode ? <button type='button' className='aceptar button_modal' onClick={sendUpdateSurvey}>Actualizar encuesta</button> :
                                            <button className='aceptar button_modal' type='submit'>Crear encuesta</button>
                                    }

                                    <button type='button' className='cancelar button_modal' onClick={toggleModal}>Cancelar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            }

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

export default Survey;