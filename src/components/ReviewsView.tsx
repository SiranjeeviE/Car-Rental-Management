import React, { useState } from 'react';
import { SystemCar, SystemFeedback } from '../utils/excel';

interface ReviewsViewProps {
  cars: SystemCar[];
  feedbacks: SystemFeedback[];
  onSubmitFeedback: (feedback: {
    customerName: string;
    carName: string;
    serviceRating: number;
    carRating: number;
    comments: string;
  }) => Promise<boolean>;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  cars,
  feedbacks,
  onSubmitFeedback
}) => {
  const [customerName, setCustomerName] = useState('');
  const [carName, setCarName] = useState('');
  const [serviceRating, setServiceRating] = useState(5);
  const [carRating, setCarRating] = useState(5);
  const [comments, setComments] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !carName || !comments) {
      alert('Please fill out all fields!');
      return;
    }

    const success = await onSubmitFeedback({
      customerName: customerName.trim(),
      carName,
      serviceRating,
      carRating,
      comments: comments.trim()
    });

    if (success) {
      setCustomerName('');
      setCarName('');
      setServiceRating(5);
      setCarRating(5);
      setComments('');
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="view-section">
      <div className="grid-forms">
        {/* Submit Feedback Form */}
        <div className="card">
          <h3>Submit Customer Feedback</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="review-customer">Customer Name</label>
              <input 
                type="text" 
                id="review-customer" 
                required 
                placeholder="e.g. Priyesh Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="review-car-select">Select Vehicle Experience</label>
              <select 
                id="review-car-select" 
                required
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
              >
                <option value="">-- Choose Car --</option>
                {cars.map(c => (
                  <option key={c.id} value={`${c.brand} ${c.model}`}>
                    {c.brand} {c.model} ({c.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="review-service-rating">Service Rating (1-5 Stars)</label>
              <select 
                id="review-service-rating"
                value={serviceRating}
                onChange={(e) => setServiceRating(parseInt(e.target.value, 10))}
              >
                <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (Good)</option>
                <option value="3">⭐⭐⭐ (Average)</option>
                <option value="2">⭐⭐ (Poor)</option>
                <option value="1">⭐ (Terrible)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="review-car-rating">Car Condition & Comfort (1-5 Stars)</label>
              <select 
                id="review-car-rating"
                value={carRating}
                onChange={(e) => setCarRating(parseInt(e.target.value, 10))}
              >
                <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (Good)</option>
                <option value="3">⭐⭐⭐ (Average)</option>
                <option value="2">⭐⭐ (Poor)</option>
                <option value="1">⭐ (Terrible)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="review-comments">Written Review & Feedback</label>
              <textarea 
                id="review-comments" 
                required 
                rows={4} 
                placeholder="How was your driving experience, customer support, and vehicle comfort?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Feedback Review</button>
          </form>
        </div>

        {/* Review Feed / Timeline */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>What Our Customers Say</h3>
          <div className="reviews-container">
            {feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                No customer reviews recorded yet.
              </div>
            ) : (
              [...feedbacks].reverse().map((f) => (
                <div className="review-card" key={f.id}>
                  <div className="review-header">
                    <span className="review-author">{f.customerName}</span>
                    <span className="review-date">{f.date}</span>
                  </div>
                  <div className="review-meta">🚗 Experience with <strong>{f.carName}</strong></div>
                  <div className="review-stars">
                    <div>Service: <span style={{ color: 'var(--warning)' }}>{renderStars(f.serviceRating)}</span></div>
                    <div>Vehicle: <span style={{ color: 'var(--warning)' }}>{renderStars(f.carRating)}</span></div>
                  </div>
                  <div className="review-text">"{f.comments}"</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReviewsView;
