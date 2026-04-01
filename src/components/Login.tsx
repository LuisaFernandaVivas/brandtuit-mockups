import React, { useState } from 'react'
import { Hexagon, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface LoginProps {
  onLogin: () => void
}

import BrandtuitLogo from './BrandtuitLogo'

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('contact@ultima.com')
  const [password, setPassword] = useState('••••••••')

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="login-header">
          <div className="logo-group">
            <BrandtuitLogo size="md" />
          </div>
          <h2 className="login-title">Secure Strategy Access</h2>
        </div>

        <form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="input-group">
            <label>CONSULTANT EMAIL</label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>ACCESS KEY</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button btn-primary">
            Authenticate Access
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Brandtuit — Zena. Curated with authority.</p>
        </div>
      </motion.div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
        }
        
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: var(--spacing-10);
          background: var(--surface-container-lowest);
          border-radius: 8px;
          border: 1px solid var(--outline-variant);
          box-shadow: 0 4px 24px rgba(45, 52, 53, 0.06);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-6);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-3);
        }
        
        .logo-group {
          margin-bottom: var(--spacing-10); /* Safe Zone Rule */
        }
        
        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 24px;
          letter-spacing: -0.04em;
          color: var(--primary);
        }
        
        .login-subtitle {
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: var(--on-surface-variant);
          opacity: 0.5;
          margin-bottom: 8px;
        }
        
        .login-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-style: italic;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: 0;
          color: var(--on-surface);
        }
        
        .input-group {
          margin-bottom: 24px;
        }
        
        .input-group label {
          display: block;
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--on-surface-variant);
          margin-bottom: 12px;
          opacity: 0.6;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 4px;
          border: 1px solid var(--outline-variant);
          background: var(--surface-container-low);
          font-family: var(--font-label);
          font-size: 14px;
          color: var(--on-surface);
          transition: all 0.2s ease;
        }

        .input-group input:focus {
          background: var(--surface-container-lowest);
          border-color: rgba(89, 96, 97, 0.55);
          box-shadow: 0 0 0 3px rgba(95, 94, 94, 0.06);
        }
        
        .login-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          height: 56px;
          font-size: 16px;
        }
        
        .login-footer {
          margin-top: var(--spacing-3);
          text-align: center;
          font-family: var(--font-body);
          font-size: 14px;
          font-style: italic;
          color: var(--on-surface-variant);
          opacity: 0.4;
        }

        @media (max-width: 520px) {
          .login-page {
            align-items: flex-end;
          }
          .login-card {
            border-radius: 8px 8px 0 0;
            padding: 28px 20px 36px;
            max-width: 100%;
            border-bottom: none;
          }
          .login-title {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
