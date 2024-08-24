import React from "react"
import { nanoid } from "nanoid"
import parse from "html-react-parser"
import Confetti from "react-confetti";

export default function Quiz() {
    // State hook for a particular question
    const [questions, setQuestions] = React.useState([])

    // State hook for all questions
    const [allQuestions, setAllQuestions] = React.useState(0)

    // Result is hidden by default
    const [showResult, setShowResult] = React.useState(false)

    // Reset the game
    const [reset, setReset] = React.useState(0)

    /******************** Confetti ********************/
    const confetti = allQuestions === 5 && <Confetti />

    /******************** API Call ********************/
    React.useEffect(() => {
        fetch("https://opentdb.com/api.php?amount=5&category=22&difficulty=medium&type=multiple")
            .then(res => res.json())
            .then(data => {
                let resultArray = []
                data.results.map(result => {
                    return resultArray.push({
                        id: nanoid(),
                        question: result.question,
                        correct_answer: result.correct_answer,
                        answers: result.incorrect_answers
                            .concat(result.correct_answer)
                            .sort(() => Math.random() - 0.5),
                        selectedAnswer: "",
                    })
                })
                setQuestions(resultArray)
            })
    }, [reset])

    /******************** Render Q&A ********************/
    const renderElement = questions.map(question => {
        return (
            <div key={question.id}>
                <h2 className="questions">{parse(question.question)}</h2>
                <div className="options">
                    {question.answers.map(answer => {
                        return (
                            <div key={answer}>
                                <input
                                    type="radio"
                                    id={answer}
                                    name={question.id}
                                    value={answer}
                                    onChange={handleSubmit}
                                    disabled={showResult}
                                />
                                <label
                                    className={`label ${selectedAnswerClass(
                                        answer,
                                        question
                                    )}`}
                                    htmlFor={answer}
                                >
                                    {parse(answer)}
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    })

    /******************** Submit Answer ********************/
    function handleSubmit(event) {
        const { name, value } = event.target
        const updatedQuestions = questions.map(question => {
            if (question.id === name) {
                question.selectedAnswer = value
            }
            return question
        })
        setQuestions(updatedQuestions)
    }

    /******************** Check Answers ********************/
    function checkAnswer() {
        let correctAnswers = 0
        questions.map(question => {
            if (question.selectedAnswer === question.correct_answer) {
                correctAnswers++
            }
            return correctAnswers
        })
        setAllQuestions(correctAnswers)
        setShowResult(true)
    }

    /******************** Selected Answers ********************/
    function selectedAnswerClass(answer, question) {
        if (showResult) {
            if (answer === question.correct_answer) {
                return "correct"
            } else if (answer === question.selectedAnswer) {
                return "incorrect"
            }
        }
    }

    /******************** Reset Game ********************/
    function handleReset() {
        setShowResult(false)
        setAllQuestions(0)
        setQuestions([])
        setReset(prevState => prevState + 1)
    }

    /******************** Render Quizes ********************/
    return (
        <main>
            {confetti}
            <section className="quiz-main">
                <div className="quiz">
                    <h1 className="heading">GEO Quizzical</h1>
                    {renderElement}
                    <div className="result-section">
                        {showResult && (
                            <p
                                className={`
                                ${allQuestions !== 5 ? "result" : "result-winner"}
                                `}
                            >
                                {allQuestions !== 5
                                ? `You scored ${allQuestions} out of 5`
                                : "You are a GEOnius!"}
                            </p>
                        )}
                        {!showResult ? (
                            <button
                                className="check-answers"
                                onClick={checkAnswer}
                            >
                                Check Answers
                            </button>
                        ) : (
                            <button
                                className="check-answers"
                                onClick={handleReset}
                            >
                                Play Again
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}