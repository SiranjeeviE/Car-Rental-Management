import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Key, 
  MessageSquare, 
  Trash2, 
  ShieldCheck,
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  onResetDatabase: () => void;
  currentUser: { username: string; role: string } | null;
  onLogOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  onResetDatabase,
  currentUser,
  onLogOut
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="sidebar">
      <div className="brand">
        <Car className="brand-logo" />
        <h2>RentDrive</h2>
      </div>

      <ul className="nav-list">
        <li>
          <a 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <LayoutDashboard className="nav-icon" />
            <span>Dashboard</span>
          </a>
        </li>
        
        {isAdmin && (
          <li>
            <a 
              className={`nav-item ${currentView === 'fleet' ? 'active' : ''}`}
              onClick={() => setView('fleet')}
            >
              <Car className="nav-icon" />
              <span>Manage Fleet</span>
            </a>
          </li>
        )}

        <li>
          <a 
            className={`nav-item ${currentView === 'booking' ? 'active' : ''}`}
            onClick={() => setView('booking')}
          >
            <Key className="nav-icon" />
            <span>Rent Vehicles</span>
          </a>
        </li>
        <li>
          <a 
            className={`nav-item ${currentView === 'reviews' ? 'active' : ''}`}
            onClick={() => setView('reviews')}
          >
            <MessageSquare className="nav-icon" />
            <span>Customer Reviews</span>
          </a>
        </li>
        <li>
          <a 
            className={`nav-item ${currentView === 'digilocker' ? 'active' : ''}`}
            onClick={() => setView('digilocker')}
          >
            <ShieldCheck className="nav-icon" style={{ color: 'var(--success)' }} />
            <span>DigiLocker Verification</span>
          </a>
        </li>
      </ul>

      {isAdmin && (
        <>
          <div className="section-title">System Tools</div>
          <div className="nav-list" style={{ marginTop: 0 }}>
            <a 
              className="nav-item btn-danger" 
              onClick={onResetDatabase}
              style={{ cursor: 'pointer' }}
            >
              <Trash2 className="nav-icon" />
              <span>Reset Database</span>
            </a>
          </div>
        </>
      )}

      <div className="user-profile" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">
            {currentUser ? currentUser.username[0].toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser ? currentUser.username : 'User'}</div>
            <div className="user-role">
              {isAdmin ? 'Administrator' : 'Standard Customer'}
            </div>
          </div>
        </div>
        <a 
          onClick={onLogOut} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} 
          title="Sign Out"
        >
          <LogOut className="nav-icon" style={{ width: '18px', height: '18px' }} />
        </a>
      </div>
    </div>
  );
};
export default Sidebar;
