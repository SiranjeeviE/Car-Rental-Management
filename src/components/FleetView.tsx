import React, { useState } from 'react';
import { SystemCar, SystemFeedback } from '../utils/excel';

interface FleetViewProps {
  cars: SystemCar[];
  feedbacks: SystemFeedback[];
  onAddCar: (car: Omit<SystemCar, 'id'>) => Promise<boolean>;
  onRentNowClick: (carId: number) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  cars,
  feedbacks,
  onAddCar,
  onRentNowClick
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Add Car Form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('SUV');
  const [rate, setRate] = useState('');
  const [transmission, setTransmission] = useState('Manual');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !rate) return;

    const dailyRate = parseInt(rate, 10);
    if (isNaN(dailyRate) || dailyRate < 100) {
      alert('Please enter a valid daily rate (minimum ₹100)');
      return;
    }

    const success = await onAddCar({
      brand: brand.trim(),
      model: model.trim(),
      category,
      dailyRate,
      transmission,
      status: 'Available'
    });

    if (success) {
      setBrand('');
      setModel('');
      setRate('');
      setCategory('SUV');
      setTransmission('Manual');
    }
  };

  // Filter cars
  const filteredCars = cars.filter(c => {
    if (filterStatus === 'All') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="view-section">
      <div className="grid-forms">
        {/* Fleet Inventory list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="fleet-filters">
            <div className="form-group" style={{ marginBottom: 0, width: '100%' }}>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="fleet-grid">
            {filteredCars.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                No vehicles found matching details.
              </div>
            ) : (
              filteredCars.map((c) => {
                let statusClass = 'badge-available';
                if (c.status === 'Rented') statusClass = 'badge-rented';
                else if (c.status === 'Maintenance') statusClass = 'badge-maintenance';

                // Calculate average rating
                const carReviews = feedbacks.filter(
                  f => f.carName.toLowerCase() === `${c.brand} ${c.model}`.toLowerCase()
                );
                
                let ratingDisplay = null;
                if (carReviews.length > 0) {
                  const avgRating = (
                    carReviews.reduce((sum, val) => sum + val.carRating, 0) / carReviews.length
                  ).toFixed(1);
                  ratingDisplay = (
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--warning)', marginLeft: '6px' }}>
                      ★ {avgRating}
                    </span>
                  );
                }

                return (
                  <div className="car-card" key={c.id}>
                    <div className="car-header">
                      <div>
                        <div className="car-brand">
                          {c.brand}
                          {ratingDisplay}
                        </div>
                        <div className="car-model">{c.model}</div>
                      </div>
                      <span className={`badge ${statusClass}`}>{c.status}</span>
                    </div>

                    <div className="car-spec-row">
                      <span className="badge-category">{c.category}</span>
                      <span className="spec-item">
                        <svg className="spec-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.34-1.16-.76-1.52-1.28l.84-.71c.24.36.57.65.99.86.41.21.87.31 1.39.31.54 0 .97-.1 1.28-.31.3-.21.46-.48.46-.82 0-.25-.09-.45-.27-.61-.17-.16-.48-.31-.9-.45L11 12.3c-.64-.22-1.12-.52-1.44-.92-.32-.4-.48-.89-.48-1.49 0-.61.2-1.11.6-1.5.4-.4.96-.6 1.67-.6s1.25.13 1.64.4l-.76.77c-.28-.2-.61-.31-.98-.31-.44 0-.78.08-1.02.25-.23.17-.35.39-.35.65 0 .22.09.4.26.54.17.14.48.27.93.42l1.52.5c.67.22 1.17.53 1.5 1 .32.44.49.96.49 1.57 0 .66-.22 1.2-.67 1.62-.45.42-1.08.63-1.88.63-.64 0-1.21-.12-1.72-.38z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
                        </svg>
                        {c.transmission}
                      </span>
                    </div>

                    <div className="car-price">
                      <div><span>₹{c.dailyRate}</span> / day</div>
                      {c.status === 'Available' && (
                        <button 
                          className="btn btn-primary btn-action-small"
                          onClick={() => onRentNowClick(c.id)}
                        >
                          Rent Now →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add New Vehicle Card */}
        <div className="card">
          <h3>Add Vehicle to Fleet</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="car-brand">Car Brand</label>
              <input 
                type="text" 
                id="car-brand" 
                required 
                placeholder="e.g. Ford"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="car-model">Model Name</label>
              <input 
                type="text" 
                id="car-model" 
                required 
                placeholder="e.g. Mustang"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="car-category">Vehicle Category</label>
              <select 
                id="car-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="car-rate">Daily Rate (₹)</label>
              <input 
                type="number" 
                id="car-rate" 
                required 
                min="100" 
                placeholder="e.g. 2000"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="car-transmission">Transmission Type</label>
              <select 
                id="car-transmission"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to Fleet</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default FleetView;
