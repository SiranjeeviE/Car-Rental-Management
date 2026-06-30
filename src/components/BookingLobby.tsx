import React, { useState, useEffect } from 'react';
import { SystemCar, SystemBooking } from '../utils/excel';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '18080' 
  ? 'http://127.0.0.1:18080' 
  : '';

interface BookingLobbyProps {
  cars: SystemCar[];
  bookings: SystemBooking[];
  selectedCarId: string;
  setSelectedCarId: (id: string) => void;
  onRedirectToVerify: (name: string, contact: string) => void;
  onConfirmBooking: (bookingData: {
    customerName: string;
    contact: string;
    carId: number;
    rentDays: number;
    membersCount: number;
    route: string;
  }) => Promise<boolean>;
}

export const BookingLobby: React.FC<BookingLobbyProps> = ({
  cars,
  bookings,
  selectedCarId,
  setSelectedCarId,
  onRedirectToVerify,
  onConfirmBooking
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [route, setRoute] = useState('City/Highway');
  const [rentDays, setRentDays] = useState(1);
  const [estimatedBill, setEstimatedBill] = useState(0);

  // AI Suggestion State
  const [aiSuggestionText, setAiSuggestionText] = useState('');
  const [aiSuggestedCarId, setAiSuggestedCarId] = useState<number | null>(null);

  // Filter available cars
  const availableCars = cars.filter(c => c.status === 'Available');

  // Recalculate Estimated Bill
  useEffect(() => {
    const car = cars.find(c => String(c.id) === selectedCarId);
    if (car) {
      setEstimatedBill(car.dailyRate * rentDays);
    } else {
      setEstimatedBill(0);
    }
  }, [selectedCarId, rentDays, cars]);

  // Recalculate AI Recommendation
  useEffect(() => {
    let suggestedCategory = 'Sedan';
    let reason = '';

    if (passengers > 5) {
      suggestedCategory = 'SUV';
      reason = `comfortably accommodate a group of ${passengers} passengers.`;
    } else if (route === 'Mountain Roads') {
      suggestedCategory = 'SUV';
      reason = 'negotiate steep curves and mountain slopes safely.';
    } else if (route === 'Offroad/Rough') {
      suggestedCategory = 'SUV';
      reason = 'handle rough trails and mud with high ground clearance and stability.';
    } else if (passengers >= 4) {
      suggestedCategory = 'Sedan';
      reason = 'provide a balanced ride with spacious cabin comfort and luggage room.';
    } else {
      const hasLuxury = cars.some(c => c.category === 'Luxury' && c.status === 'Available');
      if (hasLuxury) {
        suggestedCategory = 'Luxury';
        reason = 'provide a highly premium, executive driving experience.';
      } else {
        suggestedCategory = 'Hatchback';
        reason = 'offer excellent fuel efficiency and easy urban maneuverability.';
      }
    }

    // Find available car matching recommended category
    const match = cars.find(c => c.category === suggestedCategory && c.status === 'Available');

    if (match) {
      setAiSuggestionText(
        `Based on 👤 ${passengers} travelers & ${route} route, we suggest renting the ${match.brand} ${match.model} (${match.category}) to ${reason}`
      );
      setAiSuggestedCarId(match.id);
    } else {
      const anyAvailable = cars.find(c => c.status === 'Available');
      if (anyAvailable) {
        setAiSuggestionText(
          `We recommend an ${suggestedCategory} for your trip parameters, but none are currently available. Consider booking the available ${anyAvailable.brand} ${anyAvailable.model} (${anyAvailable.category}) instead.`
        );
        setAiSuggestedCarId(anyAvailable.id);
      } else {
        setAiSuggestionText(
          `No vehicles are currently available in the fleet inventory. Please complete an active rental to release a vehicle.`
        );
        setAiSuggestedCarId(null);
      }
    }
  }, [passengers, route, cars]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !contact || !selectedCarId) {
      alert('Please choose a vehicle first!');
      return;
    }

    const carId = parseInt(selectedCarId, 10);
    const success = await onConfirmBooking({
      customerName: customerName.trim(),
      contact: contact.trim(),
      carId,
      rentDays,
      membersCount: passengers,
      route
    });

    if (success) {
      setCustomerName('');
      setContact('');
      setPassengers(1);
      setRoute('City/Highway');
      setRentDays(1);
      setSelectedCarId('');
    }
  };

  const handleApplySuggestion = () => {
    if (aiSuggestedCarId !== null) {
      setSelectedCarId(String(aiSuggestedCarId));
    }
  };

  return (
    <div className="view-section">
      <div className="grid-forms">
        {/* Booking Entry Form */}
        <div className="card">
          <h3>Book Vehicle Rental</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="book-customer">Customer Full Name</label>
              <input 
                type="text" 
                id="book-customer" 
                required 
                placeholder="e.g. Rohit Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="book-contact">Contact Phone Number</label>
              <input 
                type="text" 
                id="book-contact" 
                required 
                placeholder="e.g. 9876543210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="book-members">Traveling Members (Passengers)</label>
              <input 
                type="number" 
                id="book-members" 
                required 
                min="1" 
                max="8" 
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="book-route">Select Terrain / Route Type</label>
              <select 
                id="book-route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              >
                <option value="City/Highway">City Commute / Smooth Highway</option>
                <option value="Mountain Roads">Mountain Roads / Hilly Terrain</option>
                <option value="Offroad/Rough">Offroad Trails / Rough Muddy Terrain</option>
              </select>
            </div>

            {/* PREMIUM AI RECOMMENDATION CARD */}
            <div className="ai-suggestion-box">
              <div className="ai-title-row">
                <span className="ai-badge">AI</span>
                <span className="ai-label">Smart Suggestion</span>
              </div>
              <div className="ai-suggestion-text" dangerouslySetInnerHTML={{ __html: aiSuggestionText }} />
              {aiSuggestedCarId !== null && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-action-small"
                  onClick={handleApplySuggestion}
                  style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                >
                  Apply Suggested Car
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="book-car-select">Select Available Vehicle</label>
              <select 
                id="book-car-select" 
                required
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
              >
                <option value="">-- Choose Car --</option>
                {availableCars.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.category}] {c.brand} {c.model} - ₹{c.dailyRate}/day
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="book-days">Rental Period (Days)</label>
              <input 
                type="number" 
                id="book-days" 
                required 
                min="1" 
                max="60" 
                value={rentDays}
                onChange={(e) => setRentDays(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <label>Estimated Total Bill</label>
              <span className="cost-value">₹{estimatedBill.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Rental Booking</button>
          </form>
        </div>

        {/* History Ledger Card */}
        <div className="card">
          <h3>All Rental Records</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Car Rented</th>
                  <th style={{ textAlign: 'center' }}>Days</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                      No booking entries recorded.
                    </td>
                  </tr>
                ) : (
                  [...bookings].reverse().map((b) => {
                    const statusBadge = b.status === 'Active' 
                      ? <span className="badge badge-rented">Active</span> 
                      : <span className="badge badge-available">Returned</span>;

                    return (
                      <tr key={b.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12.5px', fontWeight: 600 }}>#{b.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{b.customerName}</td>
                        <td>{b.carName}</td>
                        <td style={{ textAlign: 'center' }}>{b.rentDays}</td>
                        <td style={{ fontWeight: 600 }}>₹{b.totalPrice.toLocaleString('en-IN')}</td>
                        <td>{statusBadge}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingLobby;
