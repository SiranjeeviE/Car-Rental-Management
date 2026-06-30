import React, { useState } from 'react';
import { User, Lock, Sparkles, UserPlus } from 'lucide-react';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '18080' 
  ? 'http://127.0.0.1:18080' 
  : '';

interface AuthPageProps {
  onAuthSuccess: (user: { username: string; role: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please fill out all fields.');
      return;
    }
    setErrorMessage('');

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin 
      ? { username: username.trim(), password }
      : { username: username.trim(), password, role };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        if (isLogin) {
          onAuthSuccess(data.user);
        } else {
          alert('Sign up successful! Please log in to continue.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setErrorMessage(data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Backend server connection failed. Please ensure it is running.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-page)',
      fontFamily: 'var(--font-main)',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px 30px',
        border: '1px solid var(--border-ai-box)',
        background: 'var(--bg-ai-box)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        {/* Glow effect background */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '60%',
          height: '40%',
          background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)'
          }}>
            {isLogin ? <Sparkles style={{ width: '28px', height: '28px' }} /> : <UserPlus style={{ width: '28px', height: '28px' }} />}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)', letterSpacing: '-0.5px' }}>
            {isLogin ? 'Welcome back to RentDrive' : 'Create RentDrive Account'}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {isLogin ? 'Log in to manage rentals and book vehicles' : 'Sign up to access our premium fleets'}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '14px', top: '14px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                required 
                placeholder="Enter username"
                style={{ paddingLeft: '44px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: isLogin ? '24px' : '20px' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '14px', top: '14px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required 
                placeholder="Enter password"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Select User Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">Standard Customer (User)</option>
                <option value="Admin">Fleet Administrator (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            {isLogin ? 'Log In to System' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13.5px',
          color: 'var(--text-muted)',
          position: 'relative',
          zIndex: 1
        }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <a 
                onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign Up
              </a>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <a 
                onClick={() => { setIsLogin(true); setErrorMessage(''); }}
                style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Log In
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
