import { useAuth } from '../auth/AuthProvider'
import { useEffect, useState, useRef } from 'react';
import xmark from '../assets/img/xmark.svg'
import deleteIcon from '../assets/img/delete.svg'
import editIcon from '../assets/img/edit.svg'
import SurveyModal from '../components/SurveyModal'
import shareIcon from '../assets/img/share.svg'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import resultsIcon from '../assets/img/results.svg'
import { Toaster, toast } from 'react-hot-toast';
import { Link, json } from "react-router-dom";

const Survey = ({ id, closeSurvey, updateSurveys }) => {

    const [showSurvey, setShowSurvey] = useState({});
    const [editMode, setEditMode] = useState(false)
    
    const auth = useAuth();

    useEffect(() => {
        loadDataSurvey();
    }, [])

    const loadDataSurvey = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.getAccessToken()}`
            }
        })

        if (response.ok) {
            const json = await response.json();
            setShowSurvey(json)
        }
    }

    const deleteSurvey = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.getAccessToken()}`
            }
        })

        if (response.ok) {
            console.log('Encuesta eliminada')
            toast.success('Encuesta eliminada')
            closeSurvey(null)
            updateSurveys();

        } else {
            console.log('Error al eliminar')
        }
    }

    const enableEditMode = () => {
        setEditMode(true);
    }

    const disableEditMode = () => {
        setEditMode(false);
    }

    if (editMode) {
        return (
            <SurveyModal
                state={true}
                changeState={disableEditMode}
                enableEditMode={enableEditMode}
                survey={showSurvey}
                id={id}
                loadDataSurvey={loadDataSurvey}

            />
        )
    }

    return (
        <>
            <div className='overlay'>
                <div className='container_survey_pre container'>
                    <img onClick={() => closeSurvey(null)} className='xmark' src={xmark} />
                    <div className='survey_pre_header'>
                        <h2 className='title_survey'>{showSurvey.title}</h2>
                        <p className='description_survey'>{showSurvey.description}</p>
                    </div>
                    <div className='survey_pre_content'>
                        {showSurvey.questions && showSurvey.questions.map((question, id) => (
                            <div key={id}>
                                <div className='container_question'>
                                    <p className='question'>{question.question}</p>

                                    {question.type == "abierta" ? <div className='container_answer_open'>
                                        <p className='info_text_question'>Escribe una o varias palabras...</p>
                                    </div> : null}
                                    <ul>
                                        {question.answers && question.answers.map((answer, index) => (
                                            <li key={index}>{answer}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='survery_pre_footer' >
                        <button className='button_delete' onClick={deleteSurvey}>
                            <img src={deleteIcon} />
                        </button>
                        <button className='button_edit' onClick={enableEditMode}>
                            <img src={editIcon} />
                        </button>

                         <CopyToClipboard text={`${import.meta.env.VITE_URL_SURVEY}/public-survey/${id}`}>
                            <button className='button_share' onClick={() => toast.success('Link copiado')}>
                                <img src={shareIcon} />
                            </button>
                        </CopyToClipboard>
                        <Link className='button_results' type='button' to={`/results/${id}`} >
                            <img src={resultsIcon} />
                        </Link>
                    </div>
                    
                </div>
            </div>
        </>
    );
}

export default Survey;