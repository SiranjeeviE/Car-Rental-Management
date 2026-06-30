import React, { useState } from 'react';
import { ShieldCheck, Phone, Key, ShieldAlert } from 'lucide-react';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '18080' 
  ? 'http://127.0.0.1:18080' 
  : '';

interface DigiLockerVerifyProps {
  initialContact: string;
  initialName: string;
  onVerificationSuccess: (dlInfo: {
    dlNumber: string;
    verificationDate: string;
  }) => void;
  onCancel: () => void;
}

export const DigiLockerVerify: React.FC<DigiLockerVerifyProps> = ({
  initialContact,
  initialName,
  onVerificationSuccess,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [activeDocTab, setActiveDocTab] = useState<'dl' | 'aadhaar' | 'pan'>('dl');
  const [mobileNumber, setMobileNumber] = useState(initialContact || '');
  const [customerName, setCustomerName] = useState(initialName || '');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  // Generated licence details
  const [license, setLicense] = useState<{
    holderName: string;
    dlNumber: string;
    dob: string;
    vehicleClass: string;
    issueDate: string;
    validTill: string;
  } | null>(null);

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !customerName) {
      setErrorMessage('Please enter both name and mobile number.');
      return;
    }
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE}/digilocker/otp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: mobileNumber, customerName })
      });

      if (res.ok) {
        const data = await res.json();
        setDemoOtp(data.otp);
        setStep(2);
        setAttemptsRemaining(3);
      } else {
        setErrorMessage('Failed to initiate session.');
      }
    } catch (err) {
      setErrorMessage('Connection failed. Server offline.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE}/digilocker/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: mobileNumber, otp })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setStep(3);
      } else if (data.status === 'blocked') {
        alert('Too many incorrect attempts. Verification blocked.');
        setStep(1);
        setOtp('');
      } else {
        setAttemptsRemaining(data.attemptsRemaining);
        setErrorMessage(`Invalid OTP. Attempts remaining: ${data.attemptsRemaining}`);
      }
    } catch (err) {
      setErrorMessage('Connection failed.');
    }
  };

  const handleConsent = async (choice: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/digilocker/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: mobileNumber, consent: choice })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setLicense({
          holderName: data.holderName,
          dlNumber: data.dlNumber,
          dob: data.dob,
          vehicleClass: data.vehicleClass,
          issueDate: data.issueDate,
          validTill: data.validTill
        });
        setStep(4);
      } else {
        alert('Verification denied or session terminated.');
        setStep(1);
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const handleFinished = () => {
    if (license) {
      onVerificationSuccess({
        dlNumber: license.dlNumber,
        verificationDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="view-section" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div className="card" style={{ position: 'relative', border: '1px solid var(--border-ai-box)', background: 'var(--bg-ai-box)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <ShieldCheck style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-white)' }}>DigiLocker Document Verification</h2>
        </div>

        {errorMessage && (
          <div style={{ padding: '12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '16px', fontSize: '13px' }}>
            {errorMessage}
          </div>
        )}

        {/* STEP 1: MOBILE ENTRY */}
        {step === 1 && (
          <form onSubmit={handleGenerateOTP}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Verify your Driving Licence (DL), Aadhaar Card, and PAN Card securely via the Government of India's DigiLocker simulation portal.
            </p>
            <div className="form-group">
              <label>Customer Full Name (as per DL)</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Priyesh Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Registered Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '14px', top: '14px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 9876543210"
                  style={{ paddingLeft: '44px' }}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Generate DigiLocker OTP</button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ padding: '14px', background: 'rgba(59,130,246,0.06)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', marginBottom: '20px', textAlign: 'center' }}>
              <span className="badge badge-rented" style={{ marginBottom: '8px' }}>Demo System Simulation</span>
              <p style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                OTP sent to <strong>{mobileNumber}</strong>. Enter the OTP below:
              </p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', marginTop: '6px', letterSpacing: '1px' }}>
                OTP Code: {demoOtp}
              </p>
            </div>

            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '14px', top: '14px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  placeholder="------"
                  style={{ paddingLeft: '44px', textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: 700 }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Attempts remaining: <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{attemptsRemaining}</span>
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Verify OTP & Proceed</button>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Go Back</button>
            </div>
          </form>
        )}

        {/* STEP 3: CONSENT SCREEN */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '24px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-page)', marginBottom: '24px' }}>
              <ShieldAlert style={{ width: '48px', height: '48px', color: 'var(--warning)', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Consent Request</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Do you allow the <strong>RentDrive Car Rental Management System</strong> to fetch and verify your <strong>Driving Licence (DL)</strong>, <strong>Aadhaar Card</strong>, and <strong>PAN Card</strong> from your secure DigiLocker vault?
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleConsent(true)}>Yes, Grant Access</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleConsent(false)}>No, Decline</button>
            </div>
          </div>
        )}

        {/* STEP 4: GENERATED DOCUMENTS PREVIEW */}
        {step === 4 && license && (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
              ✓ All 3 documents successfully fetched and verified.
            </p>

            {/* Document Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                className={`btn ${activeDocTab === 'dl' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => setActiveDocTab('dl')}
              >
                Driving Licence
              </button>
              <button 
                className={`btn ${activeDocTab === 'aadhaar' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => setActiveDocTab('aadhaar')}
              >
                Aadhaar Card
              </button>
              <button 
                className={`btn ${activeDocTab === 'pan' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => setActiveDocTab('pan')}
              >
                PAN Card
              </button>
            </div>

            {/* DL VIEW */}
            {activeDocTab === 'dl' && (
              <div style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)', 
                padding: '24px', 
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '24px',
                fontFamily: 'var(--font-sans)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  right: '-30px', 
                  top: '-30px', 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Union of India</h4>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Driving Licence</h3>
                  </div>
                  <span className="badge badge-available" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981' }}>Verified</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Licence No:</span>
                    <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{license.dlNumber}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Holder Name:</span>
                    <strong style={{ color: '#ffffff' }}>{license.holderName}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Date of Birth:</span>
                    <strong>{license.dob}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Vehicle Class:</span>
                    <span className="badge-category" style={{ width: 'fit-content', background: 'rgba(255,255,255,0.06)' }}>{license.vehicleClass}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Issue Date:</span>
                    <span>{license.issueDate}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Valid Till:</span>
                    <span>{license.validTill}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Aadhaar VIEW */}
            {activeDocTab === 'aadhaar' && (
              <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', 
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)', 
                padding: '24px', 
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '24px',
                fontFamily: 'var(--font-sans)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#fb923c' }}>Government of India</h4>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique Identification Authority</h3>
                  </div>
                  <span className="badge badge-available" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981' }}>Verified</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Aadhaar No:</span>
                    <strong style={{ color: '#ffffff', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      XXXX XXXX {license.dlNumber.slice(-4)}
                    </strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Holder Name:</span>
                    <strong style={{ color: '#ffffff' }}>{license.holderName}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Date of Birth:</span>
                    <strong>{license.dob}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Gender:</span>
                    <strong>Male / Female</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Verification Status:</span>
                    <span style={{ color: '#4ade80' }}>E-KYC Complete</span>
                  </div>
                </div>
              </div>
            )}

            {/* PAN VIEW */}
            {activeDocTab === 'pan' && (
              <div style={{ 
                background: 'linear-gradient(135deg, #14532d 0%, #022c22 100%)', 
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)', 
                padding: '24px', 
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '24px',
                fontFamily: 'var(--font-sans)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#4ade80' }}>Income Tax Department</h4>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Government of India</h3>
                  </div>
                  <span className="badge badge-available" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid #10b981' }}>Verified</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>PAN Number:</span>
                    <strong style={{ color: '#ffffff', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      APZPD{license.dlNumber.slice(-4)}K
                    </strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Holder Name:</span>
                    <strong style={{ color: '#ffffff' }}>{license.holderName.toUpperCase()}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Father Name:</span>
                    <strong>R. K. {license.holderName.split(' ')[1]?.toUpperCase() || 'SHARMA'}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Date of Birth:</span>
                    <strong>{license.dob}</strong>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleFinished}>
              Complete Verification & Approve Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default DigiLockerVerify;
