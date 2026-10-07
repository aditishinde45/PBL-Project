import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Calendar, MapPin, Clock, Volume2, Plus, X } from 'lucide-react';

interface AppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshOverview?: () => void;
}

export const AppointmentsModal: React.FC<AppointmentsModalProps> = ({
  isOpen,
  onClose,
  onRefreshOverview,
}) => {
  const { t, language } = usePreferences();
  const { speak } = useSpeechSynthesis();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAppointments();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !dateTime) return;
    try {
      await api.createAppointment({
        doctorName,
        specialty,
        dateTime,
        location,
      });
      setDoctorName('');
      setSpecialty('');
      setDateTime('');
      setLocation('');
      setShowAddForm(false);
      await loadAppointments();
      if (onRefreshOverview) onRefreshOverview();
    } catch (e) {
      alert('Could not schedule appointment.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="My Appointments">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Calendar size={32} /> {t('myAppointments')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {appointments.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 'var(--font-md)' }}>
              सध्या कोणतीही नियोजित भेट नाही. (No appointments scheduled)
            </div>
          )}

          {appointments.map((apt) => {
            const dt = new Date(apt.dateTime);
            const dtFormatted = dt.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeFormatted = dt.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={apt.id}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  border: '3px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {apt.doctorName}
                    </h3>
                    {apt.specialty && (
                      <p style={{ fontSize: 'var(--font-md)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                        {apt.specialty}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      speak(
                        `${apt.doctorName}, ${dtFormatted} ला ${timeFormatted} वाजता, पत्ता: ${apt.location || 'दवाखाना'}`
                      )
                    }
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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: 'var(--font-md)', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <Clock size={20} color="var(--brand-primary)" />
                    <span>{dtFormatted} — {timeFormatted}</span>
                  </div>
                  {apt.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={20} color="var(--accent-amber)" />
                      <span>{apt.location}</span>
                    </div>
                  )}
                </div>

                {apt.notes && (
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    ℹ️ सूचना: {apt.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleCreate}
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
            <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>नवीन डॉक्टरांची भेट नोंदवा</h4>
            <input
              type="text"
              placeholder="डॉक्टरांचे नाव (उदा. Dr. Kulkarni)"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              required
              style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
            <input
              type="text"
              placeholder="तज्ज्ञ (उदा. Cardiologist)"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
            <input
              type="text"
              placeholder="दवाखान्याचा पत्ता (Clinic Location)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--brand-primary)', color: '#ffffff', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                जतन करा (Save)
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--bg-surface)', border: '2px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}
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
            <Plus size={24} /> नवीन भेट जोडा (Schedule Appointment)
          </button>
        )}
      </div>
    </div>
  );
};
