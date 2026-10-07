import React, { useState } from 'react';
import { api } from '../../services/api';
import { FileText, CheckCircle, AlertTriangle, X, Upload } from 'lucide-react';

interface PrescriptionScannerModalProps {
  isOpen: boolean;
  seniorId: string;
  onClose: () => void;
  onMedicinesAdded: () => void;
}

export const PrescriptionScannerModal: React.FC<PrescriptionScannerModalProps> = ({
  isOpen,
  seniorId,
  onClose,
  onMedicinesAdded,
}) => {
  const [inputText, setInputText] = useState(
    'Rx: Tab Amlodipine 5mg once daily post breakfast. Tab Metformin 500mg post lunch. Tab Multivitamin with Calcium at bedtime.'
  );
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedMedicines, setConfirmedMedicines] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await api.extractPrescription(inputText);
      setExtractedData(res);
      setConfirmedMedicines(res.extractedMedicines || []);
    } catch (e) {
      alert('Could not scan prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfirmedToDatabase = async () => {
    if (!seniorId || confirmedMedicines.length === 0) return;

    try {
      for (const med of confirmedMedicines) {
        await api.createMedicine({
          targetSeniorId: seniorId,
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          times: [med.timing || '08:00'],
        });
      }
      alert('Confirmed medicines added to schedule!');
      onMedicinesAdded();
      onClose();
    } catch (e) {
      alert('Could not save to database.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Prescription Assistant">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <FileText size={32} /> AI Prescription Assistant
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--accent-amber-bg)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '2px solid var(--accent-amber)', fontSize: 'var(--font-sm)', color: 'var(--accent-amber)' }}>
          <AlertTriangle size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
          <strong>Important Safety Notice:</strong> This is an AI assistive parser, not medical advice. A human caregiver MUST verify each dosage and timing before saving reminders.
        </div>

        {!extractedData ? (
          <div>
            <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Paste doctor’s prescription text or medication summary below for AI structuring:
            </p>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                marginBottom: '1.5rem',
              }}
            />

            <button
              onClick={handleScan}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Upload size={24} />
              <span>{loading ? 'Analyzing Prescription...' : 'Extract Medicines for Human Review'}</span>
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: '1rem' }}>
              Extracted Medicines (Please Review & Edit):
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {confirmedMedicines.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    border: '2px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...confirmedMedicines];
                        updated[idx].name = e.target.value;
                        setConfirmedMedicines(updated);
                      }}
                      placeholder="Medicine Name"
                      style={{ flex: 2, padding: '0.6rem', fontWeight: 700, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                    />
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => {
                        const updated = [...confirmedMedicines];
                        updated[idx].dosage = e.target.value;
                        setConfirmedMedicines(updated);
                      }}
                      placeholder="Dosage"
                      style={{ flex: 2, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                    />
                    <input
                      type="time"
                      value={item.timing}
                      onChange={(e) => {
                        const updated = [...confirmedMedicines];
                        updated[idx].timing = e.target.value;
                        setConfirmedMedicines(updated);
                      }}
                      style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveConfirmedToDatabase}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  backgroundColor: 'var(--status-green)',
                  color: '#ffffff',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={24} />
                <span>Confirm & Create Schedules</span>
              </button>

              <button
                onClick={() => setExtractedData(null)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  border: '2px solid var(--border-strong)',
                }}
              >
                Re-scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
