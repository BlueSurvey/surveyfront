import '../assets/styles/button.css'
import { useNavigate } from 'react-router-dom'

const Button = ( { text, color, to, style } ) => {

    const goTo = useNavigate();

    const handleClick = () => {
        goTo(to)
    }

    return (
        <button className={`button_component ${color} ${style}`} onClick={handleClick}>
            {text}
        </button>
    )
}

export default Button;