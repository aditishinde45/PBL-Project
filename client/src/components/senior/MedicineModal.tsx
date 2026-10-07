import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { X, Volume2, Plus, Clock, Pill } from 'lucide-react';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshOverview?: () => void;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onRefreshOverview,
}) => {
  const { t } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await api.getMedicines();
      setMedicines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedicines();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async (scheduleId: string, status: 'TAKEN' | 'DELAYED') => {
    try {
      await api.confirmMedicine(scheduleId, status);
      await fetchMedicines();
      if (onRefreshOverview) onRefreshOverview();
      speak(status === 'TAKEN' ? 'खूप छान! औषध घेतल्याची नोंद झाली आहे.' : 'ठीक आहे, थोड्या वेळाने पुन्हा आठवण करेन.');
    } catch (e) {
      alert('Could not update status. Please try again.');
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedDosage) return;
    try {
      await api.createMedicine({
        name: newMedName,
        dosage: newMedDosage,
        times: [newMedTime],
      });
      setNewMedName('');
      setNewMedDosage('');
      setShowAddForm(false);
      await fetchMedicines();
      if (onRefreshOverview) onRefreshOverview();
    } catch (e) {
      alert('Could not save medicine.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="My Medicines">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={32} /> {t('myMedicines')}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
            }}
          >
            <X size={24} /> {t('close')}
          </button>
        </div>

        {/* Medicines List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {medicines.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 'var(--font-md)' }}>
              कोणतेही औषध नोंदवलेले नाही. खालील बटणाने नवीन औषध जोडा.
            </div>
          )}

          {medicines.map((med) => (
            <div
              key={med.id}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                border: '3px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {med.name}
                  </h3>
                  <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {med.dosage}
                  </p>
                  {med.instructions && (
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      ℹ️ {med.instructions}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => speak(`${med.name}, ${med.dosage}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 'var(--font-sm)',
                  }}
                >
                  <Volume2 size={20} /> {t('listen')}
                </button>
              </div>

              {/* Schedules */}
              {med.schedules.map((sch: any) => {
                const conf = sch.confirmations?.[0];
                const isTaken = conf?.status === 'TAKEN';

                return (
                  <div
                    key={sch.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-md)', fontWeight: 700 }}>
                      <Clock size={22} color="var(--brand-primary)" />
                      <span>वेळ: {sch.time}</span>
                      {isTaken ? (
                        <span style={{ color: 'var(--status-green)', marginLeft: '0.5rem' }}>
                          ✅ औषध घेतले आहे
                        </span>
                      ) : (
                        <span style={{ color: 'var(--accent-amber)', marginLeft: '0.5rem' }}>
                          ⏳ बाकी आहे
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleConfirm(sch.id, 'TAKEN')}
                        disabled={isTaken}
                        style={{
                          padding: '0.8rem 1.4rem',
                          backgroundColor: isTaken ? 'var(--status-green-bg)' : 'var(--status-green)',
                          color: isTaken ? 'var(--status-green-text)' : '#ffffff',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 800,
                          fontSize: 'var(--font-md)',
                          border: '2px solid var(--status-green)',
                        }}
                      >
                        {isTaken ? 'पूर्ण ✅' : t('taken')}
                      </button>

                      {!isTaken && (
                        <button
                          onClick={() => handleConfirm(sch.id, 'DELAYED')}
                          style={{
                            padding: '0.8rem 1.2rem',
                            backgroundColor: 'var(--accent-amber-bg)',
                            color: 'var(--accent-amber)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            fontSize: 'var(--font-md)',
                            border: '2px solid var(--accent-amber)',
                          }}
                        >
                          {t('remindLater')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Add Medicine Section */}
        {showAddForm ? (
          <form
            onSubmit={handleAddMedicine}
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>नवीन औषध जोडा</h4>
            <input
              type="text"
              placeholder="औषधाचे नाव (उदा. BP Medicine)"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              required
              style={{
                padding: '0.8rem',
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--border-strong)',
              }}
            />
            <input
              type="text"
              placeholder="मात्रा (उदा. 1 गोळी जेवणानंतर)"
              value={newMedDosage}
              onChange={(e) => setNewMedDosage(e.target.value)}
              required
              style={{
                padding: '0.8rem',
                fontSize: 'var(--font-md)',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--border-strong)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>वेळ:</label>
              <input
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                style={{
                  padding: '0.6rem',
                  fontSize: 'var(--font-md)',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-strong)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                जतन करा (Save)
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '2px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                रद्द करा
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: '2px dashed var(--brand-primary)',
              color: 'var(--brand-primary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: 'var(--font-md)',
            }}
          >
            <Plus size={24} /> नवीन औषध जोडा (Add New Medicine)
          </button>
        )}
      </div>
    </div>
  );
};
