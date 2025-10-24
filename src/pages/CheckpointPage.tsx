import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import DataTable from '../components/DataTable';
import ConsoleLog from '../components/ConsoleLog';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { Save, RotateCcw, AlertTriangle, Plus } from 'lucide-react';

export default function CheckpointPage() {
  const [formData, setFormData] = useState({
    roll_no: '',
    name: '',
    subject: '',
    marks: '',
    grade: '',
  });
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResults(data);
    }
    setLoading(false);
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleInsertRecord = async () => {
    if (!formData.roll_no || !formData.name || !formData.subject || !formData.marks || !formData.grade) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('student_results').insert([{
      roll_no: formData.roll_no,
      name: formData.name,
      subject: formData.subject,
      marks: parseInt(formData.marks),
      grade: formData.grade,
    }]);

    if (error) {
      setToast({ message: 'Failed to insert record', type: 'error' });
    } else {
      setToast({ message: 'Record inserted successfully', type: 'success' });
      addLog(`Inserted record for ${formData.name} (${formData.roll_no})`);
      setFormData({ roll_no: '', name: '', subject: '', marks: '', grade: '' });
      await fetchResults();
    }
    setLoading(false);
  };

  const handleCreateCheckpoint = async () => {
    setLoading(true);
    const { data: currentData } = await supabase.from('student_results').select('*');

    if (currentData && currentData.length > 0) {
      await supabase.from('checkpoint_table').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const checkpointData = currentData.map(item => ({
        roll_no: item.roll_no,
        name: item.name,
        subject: item.subject,
        marks: item.marks,
        grade: item.grade,
      }));

      const { error } = await supabase.from('checkpoint_table').insert(checkpointData);

      if (!error) {
        setToast({ message: 'Checkpoint created successfully', type: 'success' });
        addLog(`Checkpoint created with ${currentData.length} records`);
      } else {
        setToast({ message: 'Failed to create checkpoint', type: 'error' });
      }
    } else {
      setToast({ message: 'No data to checkpoint', type: 'error' });
    }
    setLoading(false);
  };

  const handleSimulateCrash = async () => {
    setLoading(true);
    const { data: allRecords } = await supabase.from('student_results').select('*');

    if (allRecords && allRecords.length > 2) {
      const recordsToDelete = allRecords.slice(0, Math.floor(allRecords.length / 2));
      const idsToDelete = recordsToDelete.map(r => r.id);

      await supabase.from('student_results').delete().in('id', idsToDelete);

      setToast({ message: 'Crash simulated! Data lost.', type: 'error' });
      addLog(`CRASH! Deleted ${recordsToDelete.length} records`);
      await fetchResults();
    } else {
      setToast({ message: 'Need more records to simulate crash', type: 'error' });
    }
    setLoading(false);
  };

  const handleRecoverFromCheckpoint = async () => {
    setLoading(true);
    const { data: checkpointData } = await supabase.from('checkpoint_table').select('*');

    if (checkpointData && checkpointData.length > 0) {
      await supabase.from('student_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const recoveryData = checkpointData.map(item => ({
        roll_no: item.roll_no,
        name: item.name,
        subject: item.subject,
        marks: item.marks,
        grade: item.grade,
      }));

      const { error } = await supabase.from('student_results').insert(recoveryData);

      if (!error) {
        setToast({ message: 'Data recovered from checkpoint', type: 'success' });
        addLog(`Recovered ${recoveryData.length} records from checkpoint`);
        await fetchResults();
      } else {
        setToast({ message: 'Recovery failed', type: 'error' });
      }
    } else {
      setToast({ message: 'No checkpoint available', type: 'error' });
    }
    setLoading(false);
  };

  const columns = [
    { key: 'roll_no', label: 'Roll No' },
    { key: 'name', label: 'Name' },
    { key: 'subject', label: 'Subject' },
    { key: 'marks', label: 'Marks' },
    { key: 'grade', label: 'Grade' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Checkpoints</h1>
          <p className="text-xl text-slate-300">Saving Progress During Marks Upload</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Theory</h2>
            <div className="text-slate-300 space-y-3">
              <p>
                A <strong className="text-white">checkpoint</strong> is a point in time where all changes in memory (buffers) are written to disk.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Saves all modified data from memory to disk</li>
                <li>Marks a safe database state</li>
                <li>Helps in faster crash recovery</li>
                <li>Reduces recovery time by establishing known good state</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Insert New Record</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Roll No"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                placeholder="Marks"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleInsertRecord}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Insert Record
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleCreateCheckpoint}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Create Checkpoint
            </button>
            <button
              onClick={handleSimulateCrash}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              Simulate Crash
            </button>
            <button
              onClick={handleRecoverFromCheckpoint}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Recover From Checkpoint
            </button>
          </div>
          <ConsoleLog logs={logs} />
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Student Results</h2>
          {loading ? <Loader /> : <DataTable data={results} columns={columns} />}
        </div>
      </div>
    </div>
  );
}
