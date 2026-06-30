import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw 
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FleetView from './components/FleetView';
import BookingLobby from './components/BookingLobby';
import ReviewsView from './components/ReviewsView';
import DigiLockerVerify from './components/DigiLockerVerify';
import AuthPage from './components/AuthPage';

import { 
  SystemCar, 
  SystemBooking, 
  SystemFeedback,
  downloadExcelTemplate,
  exportToExcel,
  parseExcelImport
} from './utils/excel';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '18080' 
  ? 'http://127.0.0.1:18080' 
  : '';

export const App: React.FC = () => {
  const [currentView, setView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('rentdrive-theme') || 'black');
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('rentdrive-user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuthSuccess = (user: { username: string; role: string }) => {
    setCurrentUser(user);
    localStorage.setItem('rentdrive-user', JSON.stringify(user));
    setView('dashboard');
    refreshAllData();
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('rentdrive-user');
  };
  
  // Data States
  const [cars, setCars] = useState<SystemCar[]>([]);
  const [bookings, setBookings] = useState<SystemBooking[]>([]);
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeRentals: 0,
    totalCars: 0,
    carsInMaintenance: 0
  });

  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [digilockerName, setDigilockerName] = useState<string>('');
  const [digilockerContact, setDigilockerContact] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rentdrive-theme', theme);
  }, [theme]);

  // Load stats from backend
  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalRevenue: Number(data.totalRevenue) || 0,
          activeRentals: Number(data.activeRentals) || 0,
          totalCars: Number(data.totalCars) || 0,
          carsInMaintenance: Number(data.carsInMaintenance) || 0
        });
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  // Load cars list
  const loadCars = async () => {
    try {
      const res = await fetch(`${API_BASE}/cars`);
      if (res.ok) {
        const data = await res.json();
        setCars(data);
      }
    } catch (err) {
      console.error('Failed to load cars', err);
    }
  };

  // Load bookings list
  const loadBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to load bookings', err);
    }
  };

  // Load feedbacks list
  const loadFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Failed to load feedbacks', err);
    }
  };

  // Refresh all dashboard data
  const refreshAllData = async () => {
    await Promise.all([
      loadStats(),
      loadCars(),
      loadBookings(),
      loadFeedbacks()
    ]);
  };

  // Fetch initial data
  useEffect(() => {
    refreshAllData();
  }, []);

  // Action: Add Vehicle
  const handleAddCar = async (carData: Omit<SystemCar, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData)
      });
      if (res.ok) {
        alert(`Successfully added ${carData.brand} ${carData.model} to fleet!`);
        await refreshAllData();
        return true;
      } else {
        alert('Failed to add vehicle to fleet.');
        return false;
      }
    } catch (err) {
      console.error('Error adding vehicle', err);
      alert('Backend server offline.');
      return false;
    }
  };

  // Action: Confirm booking
  const handleConfirmBooking = async (bookingData: {
    customerName: string;
    contact: string;
    carId: number;
    rentDays: number;
    membersCount: number;
    route: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const result = await res.json();
        await refreshAllData();

        if (result.status === 'Pending Document Verification') {
          alert(`Booking B-${result.id} Registered!\n\nGovernment Verification Required:\nPlease verify your Driving Licence (DL), Aadhaar Card, and PAN Card via the DigiLocker portal to approve your booking.`);
          setDigilockerName(bookingData.customerName);
          setDigilockerContact(bookingData.contact);
          setView('digilocker');
        } else {
          alert(`Rental Booking Confirmed & Approved!\nBooking ID: B-${result.id}\nTotal Billing: ₹${result.totalPrice.toLocaleString('en-IN')}`);
        }
        return true;
      } else {
        alert('Booking failed. Vehicle might be rented or under maintenance.');
        return false;
      }
    } catch (err) {
      console.error('Error creating booking', err);
      alert('Backend server offline.');
      return false;
    }
  };

  // Action: Return Vehicle
  const handleReturnVehicle = async (bookingId: number) => {
    if (!confirm('Are you sure you want to process the return of this rental vehicle?')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (res.ok) {
        alert('Vehicle return completed successfully. Car is set back to Available.');
        await refreshAllData();
      } else {
        alert('Failed to process vehicle return.');
      }
    } catch (err) {
      console.error('Error returning vehicle', err);
      alert('Backend server offline.');
    }
  };

  // Action: Submit Feedback
  const handleSubmitFeedback = async (feedbackData: {
    customerName: string;
    carName: string;
    serviceRating: number;
    carRating: number;
    comments: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      if (res.ok) {
        alert('Thank you for your feedback experience review!');
        await refreshAllData();
        return true;
      } else {
        alert('Failed to submit feedback.');
        return false;
      }
    } catch (err) {
      console.error('Error submitting feedback', err);
      alert('Backend server offline.');
      return false;
    }
  };

  // Action: Reset Database
  const handleResetDatabase = async () => {
    if (!confirm('CRITICAL WARNING: This will delete all rental logs and reset the fleet fleet defaults. Proceed?')) return;
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (res.ok) {
        alert('System restored to factory default settings.');
        await refreshAllData();
        setView('dashboard');
      } else {
        alert('Reset request rejected by server.');
      }
    } catch (err) {
      console.error('Error resetting database', err);
      alert('Backend server offline.');
    }
  };

  // Action: Rent Now Navigation helper
  const handleRentNowClick = (carId: number) => {
    setSelectedCarId(String(carId));
    setView('booking');
  };

  // Excel Bulk Import trigger
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    parseExcelImport(
      file,
      async (bulkCars) => {
        try {
          const res = await fetch(`${API_BASE}/cars/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bulkCars)
          });
          if (res.ok) {
            const result = await res.json();
            alert(`Successfully imported ${result.count} cars from Excel!`);
            await refreshAllData();
          } else {
            alert('Server rejected the imported Excel fleet data.');
          }
        } catch (err) {
          console.error('Bulk upload request failed', err);
          alert('Failed to upload parsed Excel data.');
        }
      },
      (err) => {
        console.error('Parsing Excel upload failed', err);
        alert('Failed to parse Excel file. Make sure columns match template.');
      }
    );

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'fleet': return 'Vehicle Fleet Management';
      case 'booking': return 'Rental Booking Desk';
      case 'reviews': return 'Customer Reviews & Feedback';
      case 'digilocker': return 'DigiLocker Document Verification';
      default: return 'RentDrive Overview';
    }
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        onResetDatabase={handleResetDatabase} 
        currentUser={currentUser}
        onLogOut={handleLogOut}
      />

      {/* Main Panels */}
      <div className="main-content">
        <header>
          <h1>{getHeaderTitle()}</h1>
          
          <div className="action-buttons">
            {/* Theme dropdown */}
            <select 
              className="theme-selector-dropdown"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="black">🖤 Pure Black</option>
              <option value="white">🤍 Pure White</option>
            </select>

            {/* Sync Refresh button */}
            <button 
              className="btn btn-secondary" 
              onClick={refreshAllData}
              title="Sync with database"
            >
              <RefreshCw className="btn-icon" />
              <span>Sync</span>
            </button>

            {/* Import Fleet Excel */}
            <button 
              className="btn btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="btn-icon" />
              <span>Import Fleet</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleExcelImport} 
              accept=".xlsx,.xls,.csv" 
              style={{ display: 'none' }} 
            />

            {/* Export Ledger Excel */}
            <button 
              className="btn btn-secondary" 
              onClick={() => exportToExcel(cars, bookings, feedbacks)}
            >
              <Download className="btn-icon" />
              <span>Export Reports</span>
            </button>

            {/* Excel Template download */}
            <button 
              className="btn btn-secondary" 
              onClick={downloadExcelTemplate}
              title="Download Excel import template"
            >
              <FileSpreadsheet className="btn-icon" />
              <span>Template</span>
            </button>
          </div>
        </header>

        {/* View render section */}
        {currentView === 'dashboard' && (
          <DashboardView 
            stats={stats} 
            activeBookings={bookings.filter(b => b.status === 'Approved' || b.status === 'Active')}
            onReturnVehicle={handleReturnVehicle} 
          />
        )}

        {currentView === 'fleet' && (
          <FleetView 
            cars={cars} 
            feedbacks={feedbacks}
            onAddCar={handleAddCar} 
            onRentNowClick={handleRentNowClick} 
          />
        )}

        {currentView === 'booking' && (
          <BookingLobby 
            cars={cars} 
            bookings={bookings} 
            selectedCarId={selectedCarId}
            setSelectedCarId={setSelectedCarId}
            onRedirectToVerify={(name, contact) => {
              setDigilockerName(name);
              setDigilockerContact(contact);
              setView('digilocker');
            }}
            onConfirmBooking={handleConfirmBooking} 
          />
        )}

        {currentView === 'reviews' && (
          <ReviewsView 
            cars={cars} 
            feedbacks={feedbacks} 
            onSubmitFeedback={handleSubmitFeedback} 
          />
        )}

        {currentView === 'digilocker' && (
          <DigiLockerVerify 
            initialContact={digilockerContact}
            initialName={digilockerName}
            onVerificationSuccess={(dlInfo) => {
              setDigilockerName('');
              setDigilockerContact('');
              refreshAllData();
              setView('booking');
            }}
            onCancel={() => {
              setDigilockerName('');
              setDigilockerContact('');
              setView('booking');
            }}
          />
        )}
      </div>
    </div>
  );
};
export default App;
