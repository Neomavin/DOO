import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const slides = [
    {
        id: 1,
        title: '¡Bienvenido a Doo!',
        description: 'La forma más rápida y fácil de pedir tu comida favorita',
        emoji: '👋',
        color: '#14213d' // azul oscuro
    },
    {
        id: 2,
        title: 'Restaurantes Increíbles',
        description: 'Descubre los mejores restaurantes de tu ciudad en un solo lugar',
        emoji: '🍕',
        color: '#14213d' // azul oscuro
    },
    {
        id: 3,
        title: 'Entrega Rápida',
        description: 'Recibe tu pedido en minutos, directo a tu puerta',
        emoji: '🚀',
        color: '#14213d' // azul oscuro
    },
    {
        id: 4,
        title: 'Pagas Cuando Recibes',
        description: 'Paga en efectivo al momento de recibir tu pedido, fácil y seguro',
        emoji: '💵',
        color: '#14213d' // azul oscuro
    }
];

function Onboarding() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/login');
        }
    };

    const handleSkip = () => {
        navigate('/login');
    };

    const slide = slides[currentSlide];

    return (
        <div className="onboarding-page" style={{ backgroundColor: slide.color }}>
            <div className="onboarding-container">
                <button onClick={handleSkip} className="skip-button">
                    Saltar
                </button>

                <div className="onboarding-content">
                    <div className="slide-emoji">{slide.emoji}</div>
                    <h1 className="slide-title">{slide.title}</h1>
                    <p className="slide-description">{slide.description}</p>
                </div>

                <div className="onboarding-footer">
                    <div className="dots">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <button onClick={handleNext} className="next-button">
                        {currentSlide === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
