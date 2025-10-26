import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import DataTable from '../components/DataTable';
import ConsoleLog from '../components/ConsoleLog';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { Edit, FileText, AlertTriangle, RotateCcw } from 'lucide-react';

export default function LogsPage() {
  const [formData, setFormData] = useState({
    roll_no: '',
    old_marks: '',
    new_marks: '',
  });
  const [results, setResults] = useState<any[]>([]);
  const [logData, setLogData] = useState<any[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resultsResponse, logsResponse] = await Promise.all([
      supabase.from('student_results').select('*').order('created_at', { ascending: false }),
      supabase.from('logs').select('*').order('created_at', { ascending: false }),
    ]);

    if (resultsResponse.data) setResults(resultsResponse.data);
    if (logsResponse.data) setLogData(logsResponse.data);
    setLoading(false);
  };

  const addLog = (message: string) => {
    setConsoleLogs(prev => [...prev, message]);
  };

  const handleUpdateMarks = async () => {
    if (!formData.roll_no || !formData.old_marks || !formData.new_marks) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    setLoading(true);

    const { data: existingRecord } = await supabase
      .from('student_results')
      .select('*')
      .eq('roll_no', formData.roll_no)
      .maybeSingle();

    if (!existingRecord) {
      setToast({ message: 'Roll number not found', type: 'error' });
      setLoading(false);
      return;
    }

    const logEntry = {
      roll_no: formData.roll_no,
      old_marks: parseInt(formData.old_marks),
      new_marks: parseInt(formData.new_marks),
      operation: 'UPDATE',
      status: 'Committed',
    };

    const [logResult, updateResult] = await Promise.all([
      supabase.from('logs').insert([logEntry]),
      supabase
        .from('student_results')
        .update({ marks: parseInt(formData.new_marks) })
        .eq('roll_no', formData.roll_no),
    ]);

    if (!logResult.error && !updateResult.error) {
      setToast({ message: 'Marks updated and logged', type: 'success' });
      addLog(`Updated marks for ${formData.roll_no}: ${formData.old_marks} → ${formData.new_marks}`);
      setFormData({ roll_no: '', old_marks: '', new_marks: '' });
      await fetchData();
    } else {
      setToast({ message: 'Update failed', type: 'error' });
    }

    setLoading(false);
  };

  const handleViewLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogData(data);
      addLog(`Fetched ${data.length} log entries`);
      setToast({ message: 'Logs refreshed', type: 'success' });
    }
    setLoading(false);
  };

  const handleSimulateCrash = async () => {
    setLoading(true);
    const { data: allRecords } = await supabase.from('student_results').select('*');

    if (allRecords && allRecords.length > 0) {
      const recordsToDelete = allRecords.slice(0, Math.ceil(allRecords.length / 2));
      const idsToDelete = recordsToDelete.map((r: { id: number }) => r.id);

      await supabase.from('student_results').delete().in('id', idsToDelete);

      setToast({ message: 'System crash simulated!', type: 'error' });
      addLog(`CRASH! Lost ${recordsToDelete.length} records from database`);
      await fetchData();
    }
    setLoading(false);
  };

  const handleRecoverFromLogs = async () => {
    setLoading(true);

    const { data: committedLogs } = await supabase
      .from('logs')
      .select('*')
      .eq('status', 'Committed')
      .eq('operation', 'UPDATE');

    if (!committedLogs || committedLogs.length === 0) {
      setToast({ message: 'No committed logs available', type: 'error' });
      setLoading(false);
      return;
    }

    let recoveredCount = 0;

    for (const log of committedLogs) {
      const { data: record } = await supabase
        .from('student_results')
        .select('*')
        .eq('roll_no', log.roll_no)
        .maybeSingle();

      if (record) {
        await supabase
          .from('student_results')
          .update({ marks: log.new_marks })
          .eq('roll_no', log.roll_no);
        recoveredCount++;
      }
    }

    setToast({ message: `Recovered ${recoveredCount} records from logs`, type: 'success' });
    addLog(`Recovery complete: Applied ${recoveredCount} updates from transaction logs`);
    await fetchData();
    setLoading(false);
  };

  const resultsColumns = [
    { key: 'roll_no', label: 'Roll No' },
    { key: 'name', label: 'Name' },
    { key: 'subject', label: 'Subject' },
    { key: 'marks', label: 'Marks' },
    { key: 'grade', label: 'Grade' },
  ];

  const logsColumns = [
    { key: 'roll_no', label: 'Roll No' },
    { key: 'old_marks', label: 'Old Marks' },
    { key: 'new_marks', label: 'New Marks' },
    { key: 'operation', label: 'Operation' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Log-Based Recovery</h1>
          <p className="text-xl text-slate-300">Replaying Lost Grade Updates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Theory</h2>
            <div className="text-slate-300 space-y-3">
              <p>
                A <strong className="text-white">transaction log</strong> records every update (old → new) plus start/commit/abort events, enabling UNDO and REDO after crashes.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Records all database modifications</li>
                <li>Enables REDO of committed transactions</li>
                <li>Enables UNDO of uncommitted transactions</li>
                <li>Essential for crash recovery and data consistency</li>
              </ul>
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Real-World Example:</h3>
                <p className="text-slate-300">Similar to a bank's transaction record. When you make multiple ATM transactions,
                  the bank keeps a log of each action (withdraw $100, deposit $50, etc.). If the ATM crashes mid-transaction,
                  the bank can look at these logs to figure out exactly what happened and fix any incomplete transactions.
                  Here, we log every grade change to ensure no student's updated marks are lost during a system crash.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Update Marks</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Roll No"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                placeholder="Old Marks"
                value={formData.old_marks}
                onChange={(e) => setFormData({ ...formData, old_marks: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                placeholder="New Marks"
                value={formData.new_marks}
                onChange={(e) => setFormData({ ...formData, new_marks: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleUpdateMarks}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-5 w-5" />
                Update Marks
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <button
                onClick={handleViewLogs}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <FileText className="h-5 w-5" />
                View Logs
              </button>
              <p className="text-sm text-slate-400">Displays all transaction logs showing changes to student marks</p>
            </div>
            <div>
              <button
                onClick={handleSimulateCrash}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Simulate Crash
              </button>
              <p className="text-sm text-slate-400">Simulates system failure by deleting half of the database records</p>
            </div>
            <div>
              <button
                onClick={handleRecoverFromLogs}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <RotateCcw className="h-5 w-5" />
                Recover From Logs
              </button>
              <p className="text-sm text-slate-400">Restores database by replaying committed transactions from logs</p>
            </div>
          </div>
          <ConsoleLog logs={consoleLogs} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Student Results</h2>
            {loading ? <Loader /> : <DataTable data={results.slice(0, 10)} columns={resultsColumns} />}
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Transaction Logs</h2>
            {loading ? <Loader /> : <DataTable data={logData.slice(0, 10)} columns={logsColumns} />}
          </div>
        </div>

        <div className="mt-8">
          <img
            src="/log-based-recovery.jpg"
            alt="Log-Based Recovery Diagram"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

