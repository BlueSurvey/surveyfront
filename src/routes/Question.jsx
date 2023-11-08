import React, { useState, useRef } from "react";
import '../assets/styles/question.css'
import editIcon from '../assets/img/edit.svg'
import deleteIcon from '../assets/img/delete.svg'
import { toast } from 'react-hot-toast';


const Question = ({ questions, setQuestions }) => {
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentQuestionType, setCurrentQuestionType] = useState("");
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

    const isQuestionTypeSelected = currentQuestionType !== "";

    const handleAddQuestion = () => {
        if (currentQuestion === "") {
            toast.error('Escribe alguna pregunta', {
                duration: 3000,
            })

            return
        }
        if (!currentQuestionType) {
            toast.error('Selecciona el tipo de pregunta', {
                duration: 3000,
            })
            return;
        }

        if (currentQuestionType === 'opción unica' || currentQuestionType === "opción multiple") {

            if (currentAnswers.length === 0) {
                toast.error('Agrega al menos una respuesta', {
                    duration: 3000,
                });
                return;
            } else if (currentAnswers.some(answer => answer === "")) {
                toast.error('La respuesta no debe estar vacía', {
                    duration: 3000,
                });
                return;
            }
        }

        const newQuestion = {
            question: currentQuestion,
            type: currentQuestionType,
            answers: currentAnswers
        };

        if (editMode) {
            const updatedQuestions = [...questions];
            updatedQuestions[selectedQuestionIndex] = newQuestion;
            setQuestions(updatedQuestions);
            setSelectedQuestionIndex(null);
            setEditMode(false);
            toast.success('Cambios guardados')
        } else {
            setQuestions([...questions, newQuestion]);
            toast.success('Pregunta agregada')
        }

        setCurrentQuestion("");
        setCurrentQuestionType("");
        setCurrentAnswers([]);

    };

    const handleAnswerChange = (index, event) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index] = event.target.value;
        setCurrentAnswers(updatedAnswers);
    };

    const handleEditQuestion = (index) => {
        const selectedQuestion = questions[index];
        setCurrentQuestion(selectedQuestion.question);
        setCurrentQuestionType(selectedQuestion.type);
        setCurrentAnswers(selectedQuestion.answers);
        setSelectedQuestionIndex(index);
        setEditMode(true);
    };

    const handleDeleteQuestion = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);

        toast.success('Pregunta eliminada')
    }

    const handleDeleteAnswer = (index) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers.splice(index, 1);
        setCurrentAnswers(updatedAnswers);
    };




    const renderAnswerInputs = () => {
        if (currentQuestionType === "opción unica" || currentQuestionType === "opción multiple") {
            return (
                <>
                    <label className="label label_answers">Respuestas:</label>
                    {currentAnswers.map((answer, index) => (
                        <div key={index} className="answer_item">
                            <input
                                className="input"
                                type="text"
                                value={answer}
                                onChange={(e) => handleAnswerChange(index, e)}
                                placeholder={`Respuesta ${index + 1}`}
                            />

                            <img
                                src={deleteIcon}
                                type="button"
                                className="button_delete_answer"
                                onClick={() => handleDeleteAnswer(index)}
                            />
                        </div>
                    ))}
                    <button onClick={addAnswer} type="button" className="button add_question">
                        Añadir respuesta
                    </button>
                </>
            );
        }
        return null;
    };


    const addAnswer = () => {
        setCurrentAnswers([...currentAnswers, ""]);
    };

    const handleCancelEdit = () => {
        setCurrentQuestion("");
        setCurrentQuestionType("");
        setCurrentAnswers([]);
        setSelectedQuestionIndex(null);
        setEditMode(false);
    };


    return (
        <>

            <div className="container_add_question">
                <h3>Pregunta</h3>
                <input
                    className="input"
                    type="text"
                    placeholder="Escribe tu pregunta..."
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                />
                <div className="container_type_question">
                    <label className="label label-type">Tipo de respuesta: </label>
                    <select
                        className="select button"
                        value={currentQuestionType}
                        onChange={(e) => setCurrentQuestionType(e.target.value)}
                    >
                        <option value="">Tipo</option>
                        <option value="abierta">Texto de respuesta</option>
                        <option value="opción unica">Opción única</option>
                        <option value="opción multiple">Opción múltiple</option>
                    </select>
                    {currentQuestionType && <button
                        className="button_add_question aceptar button"
                        type="button"
                        onClick={handleAddQuestion}
                    >
                        {editMode ? "Guardar cambios" : "Agregar a la encuesta"}
                    </button>}
                    {editMode && (
                        <button type="button" className="button" onClick={handleCancelEdit}>
                            Cancelar
                        </button>
                    )}
                    <div className="container_add_answers">
                        {renderAnswerInputs()}
                    </div>
                </div>

            </div>

            <div className="content_questions">
                {questions.map((question, index) => (
                    <div key={index} className="container_question">
                        <p>Pregunta: {question.question}</p>
                        <p>Tipo de respuesta: {question.type}</p>
                        <p>Respuestas:</p>
                        <ul>
                            {question.answers.map((answer, answerIndex) => (
                                <li key={answerIndex}>{answer}</li>
                            ))}
                        </ul>
                        {!editMode && (
                            <div className="container_icons_question">
                                <button className="button_edit" type="button">
                                    <img src={editIcon} onClick={() => handleEditQuestion(index)} />
                                </button>
                                <button className="button_delete" type="button">
                                    <img src={deleteIcon} onClick={() => handleDeleteQuestion(index)} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Question;
