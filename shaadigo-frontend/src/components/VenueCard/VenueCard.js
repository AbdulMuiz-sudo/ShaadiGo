import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStar } from 'react-icons/fa';
import './VenueCard.css';

const VenueCard = ({ venue }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/venues/${venue.id}`);
    };

    return (
        <div className="venue-card" onClick={handleClick}>
            <div className="venue-image-wrapper">
                <img 
                    src={venue.image} 
                    alt={venue.name} 
                    className="venue-image" 
                />
            </div>
            <div className="venue-info">
                <h3 className="venue-name">{venue.name}</h3>
                <p className="venue-location">{venue.location}</p>
                <div className="venue-details">
                    <span className="venue-capacity">
                        <FaUsers /> Capacity: {venue.capacity}
                    </span>
                    <span className="venue-price">
                        Price: PKR {venue.price_per_person?.toLocaleString()}/person
                    </span>
                </div>
                <div className="venue-rating">
                    <span className="rating-badge">
                        <FaStar /> {venue.rating}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VenueCard;
