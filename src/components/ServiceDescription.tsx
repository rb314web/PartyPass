import React from 'react';
import '../assets//style/ServiceDescription.scss';

const ServiceDescription: React.FC = () => {
    return (
        <section id="service" className="service-description">
            <div className="service-description__container">
                <h2 className="service-description__heading">PartyPass – Twoja przepustka do niezapomnianych imprez!</h2>
                <p className="service-description__intro">
                    PartyPass to rewolucyjna aplikacja, która sprawia, że organizacja imprez staje się prosta i przyjemna. Od rezerwacji miejsc po wysyłanie zaproszeń – z nami każda impreza to sukces!
                </p>
                <div className="service-description__cards">
                    <div className="service-description__card">
                        <span className="service-description__card-icon">🎉</span>
                        <h3 className="service-description__card-title">Łatwa organizacja</h3>
                        <p className="service-description__card-text">
                            Planuj imprezy w kilka kliknięć – rezerwuj lokale, twórz listy gości i wysyłaj zaproszenia w mgnieniu oka.
                        </p>
                    </div>
                    <div className="service-description__card">
                        <span className="service-description__card-icon">🎟️</span>
                        <h3 className="service-description__card-title">Bilety i płatności</h3>
                        <p className="service-description__card-text">
                            Zarządzaj biletami i płatnościami online, aby każdy mógł łatwo dołączyć do Twojej imprezy.
                        </p>
                    </div>
                    <div className="service-description__card">
                        <span className="service-description__card-icon">🤝</span>
                        <h3 className="service-description__card-title">Wsparcie 24/7</h3>
                        <p className="service-description__card-text">
                            Nasz zespół jest gotowy pomóc o każdej porze, by Twoja impreza przebiegła bez zakłóceń.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ServiceDescription;