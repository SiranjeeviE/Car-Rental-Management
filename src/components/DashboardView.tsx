import React from 'react';
import { SystemBooking } from '../utils/excel';

interface DashboardViewProps {
  stats: {
    totalRevenue: number;
    activeRentals: number;
    totalCars: number;
    carsInMaintenance: number;
  };
  activeBookings: SystemBooking[];
  onReturnVehicle: (bookingId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  activeBookings,
  onReturnVehicle
}) => {
  return (
    <div className="view-section">
      {/* METRICS CARDS */}
      <div className="stats-row">
        <div className="stat-card revenue">
          <span className="lbl">Total Revenue</span>
          <span className="val">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card rentals">
          <span className="lbl">Active Rentals</span>
          <span className="val">{stats.activeRentals}</span>
        </div>
        <div className="stat-card total">
          <span className="lbl">Total Vehicles</span>
          <span className="val">{stats.totalCars}</span>
        </div>
        <div className="stat-card maintenance">
          <span className="lbl">In Maintenance</span>
          <span className="val">{stats.carsInMaintenance}</span>
        </div>
      </div>

      {/* ACTIVE BOOKING PIPELINE */}
      <div className="card">
        <h3>Active Booking Pipeline</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Car Rented</th>
                <th>Route Type</th>
                <th style={{ textAlign: 'center' }}>Passengers</th>
                <th style={{ textAlign: 'center' }}>Days</th>
                <th>Total Price</th>
                <th>Booking Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    No active rentals in progress. Rent a vehicle to start the pipeline!
                  </td>
                </tr>
              ) : (
                activeBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)' }}>
                      #B-{b.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{b.customerName}</td>
                    <td>{b.contact}</td>
                    <td style={{ fontWeight: 500 }}>{b.carName}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{b.route}</td>
                    <td style={{ textAlign: 'center' }}>👤 {b.membersCount}</td>
                    <td style={{ textAlign: 'center' }}>{b.rentDays}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                      ₹{b.totalPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>{b.bookingDate || 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-action-small"
                        onClick={() => onReturnVehicle(b.id)}
                      >
                        Return Vehicle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
