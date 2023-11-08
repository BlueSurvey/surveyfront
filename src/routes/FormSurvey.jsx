import { useState, useEffect } from "react"
import '../assets/styles/formSurvey.css'
import Wave from "../layout/Wave";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { toast, Toaster } from "react-hot-toast";


const FormSurvey = () => {

  const auth = useAuth();
  const { id } = useParams()

  useEffect(() => {
    getSurvey();
  }, [])
  

  const [showSurvey, setShowSurvey] = useState({})
  const [inputsValue, setInputsValue] = useState({})
  const [formSubmitted, setFormSubmitted] = useState(false);


  const getSurvey = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/public-survey/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })

    if (response.ok) {
      const json = await response.json();
      setShowSurvey(json)
    }
  }

  const handleInputChange = (event, questionIndex) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setInputsValue((prevInputsValue) => {
        const previousValues = prevInputsValue[questionIndex] || [];
        let updatedValues;

        if (checked) {
          updatedValues = [...previousValues, value];
        } else {
          updatedValues = previousValues.filter((v) => v !== value);
        }

        return {
          ...prevInputsValue,
          [questionIndex]: updatedValues,
        };
      });
    } else {
      setInputsValue((prevInputsValue) => ({
        ...prevInputsValue,
        [questionIndex]: value,
      }));
    }


  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formSubmitted) {
      return;
    }

    const formattedAnswers = Object.entries(inputsValue).reduce(
      (acc, [questionIndex, value]) => {
        const question = showSurvey.questions[questionIndex];
        const questionType = question.type;
        const questionLabel = question.question;

        if (!acc.answers[questionType]) {
          acc.answers[questionType] = {};
        }

        if (Array.isArray(value)) {
          acc.answers[questionType][questionLabel] = value;
        } else {
          acc.answers[questionType][questionLabel] = value;
        }

        return acc;
      },
      { answers: {} }
    );


    const response = await fetch(`${import.meta.env.VITE_API_URL}/public-survey`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${auth.getAccessToken()}`
      },
      body: JSON.stringify({
        answers: formattedAnswers.answers,
        surveyId: id
      })


    })
    if (response.ok) {
      toast.success('Encuesta enviada, ¡Gracias por responder!', {
        duration: 3000,
        icon: "👍"
      })
    }

    setTimeout(() => {
      window.location.reload();
    }, 3000);

    setFormSubmitted(true);
  };


  return (
    <>
      <Wave />
      <div className="container_form_public container">
        <form onSubmit={handleSubmit} className="container_form_public_content">
          <div className="header_form_public">
            <h1>{showSurvey.title} </h1>
            <p>{showSurvey.description}</p>
          </div>
          <div className="form_public_content">
            {showSurvey.questions && showSurvey.questions.map((question, index) => (
              <div key={index}>
                <div className='container_question_public'>
                  <label className="label_form_public">{question.question}</label>

                  {question.type === "abierta" && (
                    <div className="">
                      <input
                        className="input_public"
                        type="text"
                        placeholder="Escribe una o varias palabras..."
                        name={`question_${index}`}
                        value={inputsValue[index] || ''}
                        onChange={(event) => handleInputChange(event, index)}
                      />
                    </div>
                  )}

                  {question.type === "opción unica" && (
                    <div>
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="radio_container">
                          <input
                            type="radio"
                            id={`question_${index}_answer_${answerIndex}`}
                            name={`question_${index}`}
                            value={answer}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                          <label htmlFor={`question_${index}_answer_${answerIndex}`} className="label_radio">{answer}</label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "opción multiple" && (
                    <div>
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex}>
                          <input
                            type="checkbox"
                            id={`question_${index}_answer_${answerIndex}`}
                            name={`question_${index}`}
                            value={answer}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                          <label htmlFor={`question_${index}_answer_${answerIndex}`} className="label_checkbox">{answer}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}


            <button className="aceptar button_modal button_public" disabled={formSubmitted}>Enviar</button>
          </div>
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
  )
}

export default FormSurvey;
