import { useState, useEffect, useCallback } from 'react';
import { venueService } from '../services/api';

// Mock data for development (until backend APIs are ready)
const mockVenues = [
  {
    id: 1,
    name: 'Royal Banquet Hall',
    location: 'Gulberg, Lahore',
    capacity: 400,
    price_per_person: 1200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    amenities: ['AC', 'Generator', 'Parking', 'Stage'],
    has_3d_tour: true,
  },
  {
    id: 2,
    name: 'Pearl Continental Hall',
    location: 'Mall Road, Lahore',
    capacity: 500,
    price_per_person: 1500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    amenities: ['AC', 'Generator', 'Parking', 'Valet'],
    has_3d_tour: true,
  },
  {
    id: 3,
    name: 'Falettis Grand Ballroom',
    location: 'Egerton Road, Lahore',
    capacity: 350,
    price_per_person: 1100,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
    amenities: ['AC', 'Parking', 'Catering'],
    has_3d_tour: false,
  },
  {
    id: 4,
    name: 'Nishat Grand Marquee',
    location: 'DHA, Lahore',
    capacity: 600,
    price_per_person: 900,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
    amenities: ['AC', 'Generator', 'Parking'],
    has_3d_tour: true,
  },
  {
    id: 5,
    name: 'Serena Banquet',
    location: 'F-7, Islamabad',
    capacity: 450,
    price_per_person: 1800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    amenities: ['AC', 'Generator', 'Parking', 'Valet', 'Spa'],
    has_3d_tour: true,
  },
];

export const useVenues = (initialFilters = {}) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try real API first, fallback to mock data
      const response = await venueService.getAll(filters);
      setVenues(response.data);
    } catch (err) {
      console.log('Using mock venue data (API not available)');
      // Filter mock data based on filters
      let filtered = [...mockVenues];
      if (filters.city) {
        filtered = filtered.filter(v => 
          v.location.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      if (filters.minCapacity) {
        filtered = filtered.filter(v => v.capacity >= filters.minCapacity);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(v => v.price_per_person <= filters.maxPrice);
      }
      setVenues(filtered);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const getFeatured = () => {
    return mockVenues.slice(0, 5);
  };

  return {
    venues,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchVenues,
    getFeatured,
  };
};

export default useVenues;
