import React from 'react';
import { ArrowLeft, Download, CheckCircle, ShieldCheck, Chrome } from 'lucide-react';

interface ExtensionDownloadPageProps {
  onBack: () => void;
}

export const ExtensionDownloadPage: React.FC<ExtensionDownloadPageProps> = ({ onBack }) => {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '2px solid var(--border-strong)',
            fontWeight: 700,
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft size={20} />
          <span>Back to ElderEase</span>
        </button>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            border: '3px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Chrome size={36} />
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900 }}>
                ElderEase Browser Helper
              </h1>
              <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
                Get help while using other websites (Railway booking, electricity bills, government forms)
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--brand-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', color: 'var(--brand-text)', fontWeight: 700, fontSize: 'var(--font-md)' }}>
            💡 <strong>100% Optional:</strong> The main ElderEase web app works fully on its own without requiring this extension!
          </div>

          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '1rem' }}>
            What does the extension do?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={24} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>[Explain This Page] Button:</strong> Analyzes visible text and explains what the page is asking in Marathi, Hindi, or English.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={24} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Voice Assistance Anywhere:</strong> Speak in your native language directly in the popup for instant page clarification.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={24} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>One-Step-At-A-Time Form Guidance:</strong> Never feel overwhelmed by multi-column web forms.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={24} color="var(--status-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Strict Privacy & Safety Guard:</strong> Never auto-fills passwords, OTPs, or credit card numbers. Explicit user click only.
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              border: '2px solid var(--border-strong)',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '0.75rem' }}>
              How to Load into Chrome (Developer Mode)
            </h3>
            <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-md)' }}>
              <li>Open Google Chrome and go to: <code>chrome://extensions/</code></li>
              <li>Toggle <strong>"Developer mode"</strong> in the top right corner.</li>
              <li>Click <strong>"Load unpacked"</strong>.</li>
              <li>Select the <code>PBL-Project/extension</code> folder in your repository.</li>
              <li>Pin the ElderEase Helper icon to your browser toolbar!</li>
            </ol>
          </div>

          <a
            href="/extension-guide.html"
            onClick={(e) => {
              e.preventDefault();
              alert('Extension package is ready in the repository folder: PBL-Project/extension! Follow the steps above to load.');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Download size={24} />
            <span>DOWNLOAD EXTENSION PACKAGE</span>
          </a>
        </div>
      </div>
    </div>
  );
};
