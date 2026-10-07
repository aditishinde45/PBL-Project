import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DevDemoPanel } from '../common/DevDemoPanel';
import { Settings, BarChart2, CheckCircle, Eye, EyeOff, Plus, LogOut } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // New task form
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Communication');
  const [newDesc, setNewDesc] = useState('');
  const [step1Title, setStep1Title] = useState('Open Application');
  const [step1InstEn, setStep1InstEn] = useState('Tap the icon on your screen.');
  const [step1InstMr, setStep1InstMr] = useState('स्क्रीनवरील चिन्हावर दाबा.');

  const loadData = async () => {
    setLoading(true);
    try {
      const taskList = await api.getAdminTasks();
      setTasks(taskList);
      const stats = await api.getAnalyticsSummary();
      setAnalytics(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      await api.togglePublishTask(id);
      await loadData();
    } catch (e) {
      alert('Could not toggle task.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    try {
      await api.createAdminTask({
        title: newTitle,
        category: newCategory,
        description: newDesc,
        steps: [
          {
            title: step1Title,
            instructionEn: step1InstEn,
            instructionMr: step1InstMr,
          },
        ],
      });
      setNewTitle('');
      setNewDesc('');
      setShowNewTaskForm(false);
      alert('Task created successfully and published!');
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 0',
          borderBottom: '2px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#374151',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
            }}
          >
            A
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              System Administrator & CMS
            </h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Manage guided tasks content and monitor aggregate metrics
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* Analytics Summary Banner */}
      {analytics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Total Task Sessions</span>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--brand-primary)' }}>
              {analytics.totalSessions}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Task Completion Rate</span>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-green)' }}>
              {analytics.completionRate}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Help / Family Requests</span>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--accent-amber)' }}>
              {analytics.totalHelpRequests}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Emergencies Handled</span>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-red)' }}>
              {analytics.totalEmergencies}
            </div>
          </div>
        </div>
      )}

      {/* Task Content Management (CMS) */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '3px solid var(--border-light)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>Guided Task Content CMS</h2>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Add, update, or publish tasks instantly without rebuilding the application
            </p>
          </div>

          <button
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 'var(--font-md)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Plus size={20} />
            <span>Add New Guided Task</span>
          </button>
        </div>

        {/* New Task Creator Form */}
        {showNewTaskForm && (
          <form
            onSubmit={handleCreateTask}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--brand-primary)',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800 }}>Create New Interactive Task</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Task Title (e.g. Booking an Auto via App)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ padding: '0.8rem', fontSize: 'var(--font-md)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
              >
                <option value="Communication">Communication</option>
                <option value="Payment">Payment</option>
                <option value="Health">Health</option>
                <option value="General">General</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Description for seniors..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              required
              style={{ padding: '0.8rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '0.5rem' }}>Step 1:</h4>
              <input
                type="text"
                placeholder="Step 1 Title"
                value={step1Title}
                onChange={(e) => setStep1Title(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-light)' }}
              />
              <input
                type="text"
                placeholder="English Instruction"
                value={step1InstEn}
                onChange={(e) => setStep1InstEn(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-light)' }}
              />
              <input
                type="text"
                placeholder="Marathi Instruction (मराठी)"
                value={step1InstMr}
                onChange={(e) => setStep1InstMr(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-light)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--brand-primary)', color: '#ffffff', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
              >
                Publish Task
              </button>
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                style={{ padding: '0.8rem 1.2rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Existing Tasks Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem' }}>Title</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Steps</th>
                <th style={{ padding: '0.75rem' }}>Sessions</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 700 }}>{t.title}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{t.category}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{t.steps?.length || 0}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{t._count?.sessions || 0}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 700,
                        backgroundColor: t.isPublished ? 'var(--status-green-bg)' : 'var(--bg-subtle)',
                        color: t.isPublished ? 'var(--status-green-text)' : 'var(--text-muted)',
                      }}
                    >
                      {t.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <button
                      onClick={() => handleTogglePublish(t.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 700,
                      }}
                    >
                      {t.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Development Demo Controls */}
      <DevDemoPanel onEventTriggered={loadData} />
    </div>
  );
};
