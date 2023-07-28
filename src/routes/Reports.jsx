import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useParams } from "react-router-dom";
import Header from "../layout/Header";
import '../assets/styles/reports.css'
import { BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Toaster, toast } from 'react-hot-toast'



const Reports = () => {

    const { id } = useParams();
    const auth = useAuth();

    const [answers, setAnswers] = useState({})
    const [survey, setSurvey] = useState({})

    useEffect(() => {
        getAnswers(),
            getSurvey()
    }, [])

    const getAnswers = async () => {
        const toastID = toast.loading('Cargando reportes...')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/results/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.getAccessToken()}`
            }
        })

        if (response.ok) {
            toast.remove(toastID)
            const json = await response.json();
            setAnswers(json)
        } else {
            const errorData = await response.json()
            const messageError = errorData.body.error;
            toast.remove(toastID)        
            toast.success(messageError)
        }
    }

    const getSurvey = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.getAccessToken()}`
            }
        })

        if (response.ok) {
            const json = await response.json();
            setSurvey(json)
        }
    }

    const renderQuestionDivs = () => {
        const { uniqueAnswersOptionOpen, uniqueAnswersOptionUnica, uniqueAnswersOptionMultiple } = answers;
        const questionDivs = [];

        if (uniqueAnswersOptionOpen) {
            const uniqueQuestions = new Set();
            Object.keys(uniqueAnswersOptionOpen).forEach((question) => {
                const uniqueQuestion = question.split(":")[0].trim();
                uniqueQuestions.add(uniqueQuestion);
            });

            const uniqueDiv = Array.from(uniqueQuestions).map((question) => (
                <div key={question} className="container_report">
                    <div className="title_report">
                        <h3>{question}</h3>
                    </div>
                    <div key={`content_name_${question}`} className="content_report content_report_open">
                        <p className="respuesta">Respuestas</p>
                        {renderAnswers(question)}
                    </div>

                </div>
            ));

            questionDivs.push(...uniqueDiv);
        }

        if (uniqueAnswersOptionUnica) {
            const uniqueQuestions = new Set();
            Object.keys(uniqueAnswersOptionUnica).forEach((question) => {
                const uniqueQuestion = question.split(":")[0].trim();
                uniqueQuestions.add(uniqueQuestion)
            })

            const uniqueDiv = Array.from(uniqueQuestions).map((question) => (
                <div key={question} className="container_report">
                    <div className="title_report">
                        <h3>{question}</h3>
                    </div>
                    <div className="content_report">
                        {renderGraphic(question)}
                    </div>
                </div>
            ))

            questionDivs.push(...uniqueDiv);
        }

        if (uniqueAnswersOptionMultiple) {
            const uniqueQuestions = new Set();
            Object.keys(uniqueAnswersOptionMultiple).forEach((question) => {
                const uniqueQuestion = question.split(":")[0].trim();
                uniqueQuestions.add(uniqueQuestion)
            })

            const uniqueDiv = Array.from(uniqueQuestions).map((question) => (
                <div key={question} className="container_report">
                    <div className="title_report">
                        <h3>{question}</h3>
                    </div>

                    <div className="content_report">
                        {renderGraphic(question)}
                    </div>
                </div>
            ))

            questionDivs.push(...uniqueDiv);
        }

        return questionDivs;
    };

    const renderGraphic = (question) => {
        const { uniqueAnswersOptionUnica, uniqueAnswersOptionMultiple } = answers;

        if (uniqueAnswersOptionUnica) {
            const data = Object.entries(uniqueAnswersOptionUnica)
                .filter(([key]) => key.split(":")[0].trim() === question)
                .map(([key, count]) => ({
                    respuesta: key.split(":")[1].trim(),
                    repeticiones: count
                }));

            if (data.length > 0) {
                return (
                    <ResponsiveContainer width="100%" aspect={2}>
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="4 1 2" />
                            <XAxis dataKey="respuesta" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="repeticiones" fill="#655DBB" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }
        }

        if (uniqueAnswersOptionMultiple) {
            const data = Object.entries(uniqueAnswersOptionMultiple)
                .filter(([key]) => key.split(":")[0].trim() === question)
                .map(([key, count]) => ({
                    respuesta: key.split(":")[1].trim(),
                    repeticiones: count
                }));

            if (data.length > 0) {
                return (
                    <ResponsiveContainer width="100%" aspect={2}>
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="4 1 2" />
                            <XAxis dataKey="respuesta" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="repeticiones" fill="#BFACE2" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }
        }

        return null;
    }

    const renderAnswers = (question) => {
        const { uniqueAnswersOptionOpen } = answers;
        return Object.entries(uniqueAnswersOptionOpen).map(([key, count]) => {
            const [q, answer] = key.split(":").map((item) => item.trim());
            if (q === question) {
                return (
                    <>
                        <p className="p_answer" key={key}>{answer}: {count}</p>
                    </>

                );
            }
            return null;
        });
    };

    const downloadPdf = () => {
        const capture = document.querySelector('.container_reports');
        html2canvas(capture).then((canvas) => {
            const imgData = canvas.toDataURL('img/png');
            const doc = new jsPDF('p', 'mm', 'a4');

            const imgWidth = doc.internal.pageSize.getWidth() - 25; // Ancho de imagen considerando márgenes
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const marginTop = 10;

            const marginLeft = (doc.internal.pageSize.getWidth() - imgWidth) / 2;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            const title = `Reporte de encuesta: ${survey.title}`;
            const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const titleMarginLeft = (doc.internal.pageSize.getWidth() - titleWidth) / 2;

            let remainingHeight = doc.internal.pageSize.getHeight() - (marginTop + imgHeight + 20);
            let yOffset = marginTop + 20;
            let currentPage = 1;

            while (remainingHeight < 0) {
                doc.addPage();
                currentPage++;
                remainingHeight = doc.internal.pageSize.getHeight();
            }

            doc.setPage(currentPage);
            doc.text(title, titleMarginLeft, marginTop + 10);
            doc.addImage(imgData, 'PNG', marginLeft, yOffset, imgWidth, imgHeight);

            doc.save('reporte.pdf');
        });
    };


    return (
        <>
            <Header />

            <div className=" container">
                <h2 className="title_survey_report">{survey.title}</h2>
                <button type="button" className="crear_encuesta" onClick={downloadPdf}>Descargar PDF</button>
                <div className="container_reports">

                    {renderQuestionDivs()}
                </div>
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

export default Reports;
