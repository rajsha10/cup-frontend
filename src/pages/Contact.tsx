import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormState({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <Card title="Developer Feedback" subtitle="Connect with the AgenticCup Dev Team">
        {submitted ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--color-success)',
            borderRadius: '12px',
            color: 'var(--color-success)',
            fontWeight: 600
          }}>
            ✅ Message Sent Successfully! Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                className="glass-input"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                className="glass-input"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Message
              </label>
              <textarea
                required
                rows={4}
                className="glass-input"
                style={{ resize: 'vertical' }}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="Feedback, bug reports, integration queries..."
              />
            </div>

            <Button type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
              Send Message
            </Button>
          </form>
        )}

        {/* Social / Badge Grid */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem'
        }}>
          <a 
            href="https://github.com/injectivedev" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#0F0F11',
              color: '#FFFFFF'
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a 
            href="https://injective.com" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#1868FF',
              color: '#FFFFFF'
            }}
          >
            Injective Network
          </a>
        </div>
      </Card>
    </div>
  );
};
