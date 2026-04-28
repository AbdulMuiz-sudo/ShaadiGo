import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiImage, FiCoffee, FiStar } from 'react-icons/fi';
import './style/Dashboard.css'; // Reusing dashboard styles for consistency

function AddVenue() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Main Form State
    const [venue, setVenue] = useState({
        venueName: '', city: 'Lahore', location: '',
        capacity: '', price: '', description: '', cancellationPolicy: ''
    });

    // Dynamic Arrays for nested data
    const [images, setImages] = useState(['']);
    const [food, setFood] = useState([{ name: '', desc: '', price: '' }]);
    const [decor, setDecor] = useState([{ name: '', desc: '', price: '' }]);

    useEffect(() => {
        if (!loggedInUser || loggedInUser.role !== 'owner') navigate('/login');
    }, []);

    const handleChange = (e) => setVenue({ ...venue, [e.target.name]: e.target.value });

    // Dynamic field handlers
    const handleImageChange = (index, value) => {
        const newImgs = [...images];
        newImgs[index] = value;
        setImages(newImgs);
    };

    const handleNestedChange = (setter, state, index, field, value) => {
        const newData = [...state];
        newData[index][field] = value;
        setter(newData);
    };

    const addField = (setter, state, emptyObj) => setter([...state, emptyObj]);
    const removeField = (setter, state, index) => setter(state.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ownerId: loggedInUser.user_id,
                ...venue,
                images: images.filter(i => i.trim() !== ''),
                foodPackages: food.filter(f => f.name.trim() !== ''),
                decorations: decor.filter(d => d.name.trim() !== '')
            };

            const res = await fetch('http://localhost:5001/api/owner/venues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert('Venue added successfully!');
                navigate('/owner-dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-page">
            <Header />
            <main className="db-main" style={{ maxWidth: '800px' }}>

                <button className="db-btn db-btn-ghost" onClick={() => navigate('/owner-dashboard')} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiArrowLeft /> Back to Portal
                </button>

                <div className="db-heading">
                    <div>
                        <h1>List Your Venue</h1>
                        <p>Add your venue details, images, and packages to start receiving bookings.</p>
                    </div>
                </div>
                <div className="db-gold-divider"></div>

                {error && <div className="db-status db-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid rgba(77,13,13,0.1)' }}>

                    {/* BASIC INFO */}
                    <h3 style={{ color: 'var(--maroon)', marginBottom: '15px' }}>Basic Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Venue Name</label>
                            <input required name="venueName" value={venue.venueName} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>City</label>
                            <select name="city" value={venue.city} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                <option>Lahore</option>
                                <option>Karachi</option>
                                <option>Islamabad</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Address / Location</label>
                            <input required name="location" value={venue.location} onChange={handleChange} placeholder="e.g. 123 Main Blvd, DHA Phase 6" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Max Capacity</label>
                            <input required type="number" name="capacity" value={venue.capacity} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Price Per Event (Hall Only)</label>
                            <input required type="number" name="price" value={venue.price} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Description</label>
                        <textarea required name="description" value={venue.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Cancellation Policy</label>
                        <input required name="cancellationPolicy" value={venue.cancellationPolicy} onChange={handleChange} placeholder="e.g. 50% refund if cancelled 7 days prior." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '30px 0' }} />

                    {/* IMAGES */}
                    <h3 style={{ color: 'var(--maroon)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiImage /> Image URLs</h3>
                    {images.map((img, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)" value={img} onChange={(e) => handleImageChange(i, e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                            {images.length > 1 && <button type="button" onClick={() => removeField(setImages, images, i)} style={{ background: '#fce8e8', color: '#c53030', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer' }}><FiTrash2 /></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => addField(setImages, images, '')} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+ Add Another Image</button>

                    <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '30px 0' }} />

                    {/* FOOD PACKAGES */}
                    <h3 style={{ color: 'var(--maroon)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiCoffee /> Food Packages</h3>
                    {food.map((item, i) => (
                        <div key={i} style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #eee' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <input placeholder="Package Name (e.g. Gold Menu)" value={item.name} onChange={(e) => handleNestedChange(setFood, food, i, 'name', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <input type="number" placeholder="Price / Person" value={item.price} onChange={(e) => handleNestedChange(setFood, food, i, 'price', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input placeholder="Menu details (e.g. Biryani, Qorma, Naan...)" value={item.desc} onChange={(e) => handleNestedChange(setFood, food, i, 'desc', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <button type="button" onClick={() => removeField(setFood, food, i)} style={{ background: 'transparent', color: '#c53030', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addField(setFood, food, { name: '', desc: '', price: '' })} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+ Add Food Package</button>

                    <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '30px 0' }} />

                    {/* DECORATIONS */}
                    <h3 style={{ color: 'var(--maroon)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiStar /> Decoration Themes</h3>
                    {decor.map((item, i) => (
                        <div key={i} style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #eee' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <input placeholder="Theme Name (e.g. Floral Archway)" value={item.name} onChange={(e) => handleNestedChange(setDecor, decor, i, 'name', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <input type="number" placeholder="Flat Price" value={item.price} onChange={(e) => handleNestedChange(setDecor, decor, i, 'price', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input placeholder="Theme description..." value={item.desc} onChange={(e) => handleNestedChange(setDecor, decor, i, 'desc', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <button type="button" onClick={() => removeField(setDecor, decor, i)} style={{ background: 'transparent', color: '#c53030', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addField(setDecor, decor, { name: '', desc: '', price: '' })} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+ Add Decoration</button>

                    <div style={{ marginTop: '40px' }}>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: 'var(--maroon)', color: 'white', fontSize: '1.1rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <FiSave /> {loading ? 'Saving Venue...' : 'Publish Venue to ShaadiGo'}
                        </button>
                    </div>
                </form>

            </main>
            <Footer />
        </div>
    );
}

export default AddVenue;