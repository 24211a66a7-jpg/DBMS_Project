import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import DataTable from '../components/DataTable';
import ConsoleLog from '../components/ConsoleLog';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { Cloud, AlertTriangle, RotateCcw, Clock } from 'lucide-react';

export default function BackupPage() {
  const [results, setResults] = useState<any[]>([]);
  const [backupData, setBackupData] = useState<any[]>([]);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
    checkLastBackup();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resultsResponse, backupResponse] = await Promise.all([
      supabase.from('student_results').select('*').order('created_at', { ascending: false }),
      supabase.from('remote_backup').select('*').order('backup_time', { ascending: false }),
    ]);

    if (resultsResponse.data) setResults(resultsResponse.data);
    if (backupResponse.data) setBackupData(backupResponse.data);
    setLoading(false);
  };

  const checkLastBackup = async () => {
    const { data } = await supabase
      .from('remote_backup')
      .select('backup_time')
      .order('backup_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLastBackupTime(new Date(data.backup_time).toLocaleString());
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    addLog('Initiating remote backup process...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: currentData } = await supabase.from('student_results').select('*');

    if (currentData && currentData.length > 0) {
      await supabase.from('remote_backup').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const backupRecords = currentData.map(item => ({
        roll_no: item.roll_no,
        name: item.name,
        subject: item.subject,
        marks: item.marks,
        grade: item.grade,
      }));

      const { error } = await supabase.from('remote_backup').insert(backupRecords);

      if (!error) {
        const now = new Date().toLocaleString();
        setLastBackupTime(now);
        setToast({ message: 'Remote backup created successfully', type: 'success' });
        addLog(`Backup completed: ${currentData.length} records copied to remote storage`);
        addLog(`Backup timestamp: ${now}`);
        await fetchData();
      } else {
        setToast({ message: 'Backup failed', type: 'error' });
        addLog('ERROR: Backup process failed');
      }
    } else {
      setToast({ message: 'No data to backup', type: 'error' });
      addLog('WARNING: No data available for backup');
    }

    setLoading(false);
  };

  const handleSimulateFullCrash = async () => {
    setLoading(true);
    addLog('CRITICAL: Simulating catastrophic system failure...');

    await new Promise(resolve => setTimeout(resolve, 800));

    const { data: allRecords } = await supabase.from('student_results').select('*');

    if (allRecords && allRecords.length > 0) {
      await supabase.from('student_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setToast({ message: 'Full system crash! All data lost.', type: 'error' });
      addLog(`CATASTROPHIC FAILURE: All ${allRecords.length} records destroyed`);
      addLog('Main database is now empty');
      await fetchData();
    } else {
      setToast({ message: 'Database already empty', type: 'error' });
    }

    setLoading(false);
  };

  const handleRestoreFromBackup = async () => {
    setLoading(true);
    addLog('Initiating recovery from remote backup...');

    await new Promise(resolve => setTimeout(resolve, 1200));

    const { data: backupRecords } = await supabase.from('remote_backup').select('*');

    if (backupRecords && backupRecords.length > 0) {
      await supabase.from('student_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const restoreData = backupRecords.map(item => ({
        roll_no: item.roll_no,
        name: item.name,
        subject: item.subject,
        marks: item.marks,
        grade: item.grade,
      }));

      const { error } = await supabase.from('student_results').insert(restoreData);

      if (!error) {
        setToast({ message: 'Data restored from remote backup', type: 'success' });
        addLog(`Recovery successful: ${restoreData.length} records restored`);
        addLog('Database integrity verified');
        await fetchData();
      } else {
        setToast({ message: 'Restore failed', type: 'error' });
        addLog('ERROR: Recovery process failed');
      }
    } else {
      setToast({ message: 'No backup available', type: 'error' });
      addLog('ERROR: No remote backup found');
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
          <h1 className="text-4xl font-bold text-white mb-3">Remote Backup Systems</h1>
          <p className="text-xl text-slate-300">Recovering After Full Server Failure</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Theory</h2>
            <div className="text-slate-300 space-y-3">
              <p>
                A <strong className="text-white">remote backup system</strong> keeps copies of the database at a separate location to safeguard against site-wide failures.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Protection against complete system failures</li>
                <li>Geographic separation from primary site</li>
                <li>Enables disaster recovery</li>
                <li>Last line of defense for data protection</li>
              </ul>
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Real-World Example:</h3>
                <p className="text-slate-300">Think of Google Photos backing up your phone's pictures. Your photos exist both on your
                  phone (primary site) and in Google's cloud storage (remote backup). If your phone is lost or damaged, you can still
                  recover all your photos from the cloud backup. Similarly, we keep a complete copy of all student records at a different
                  location, so if the main server room has a disaster (fire, flood, etc.), no data is permanently lost.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Backup Status</h2>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300 font-semibold">Last Backup</span>
                </div>
                <div className="text-white text-lg">
                  {lastBackupTime || 'No backup created yet'}
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300 font-semibold">Backup Records</span>
                </div>
                <div className="text-white text-lg">
                  {backupData.length} records stored remotely
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300 font-semibold">Main Database</span>
                </div>
                <div className="text-white text-lg">
                  {results.length} active records
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operations</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div>
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <Cloud className="h-5 w-5" />
                Create Remote Backup
              </button>
              <p className="text-sm text-slate-400">Creates a complete backup of database to a remote storage location</p>
            </div>
            <div>
              <button
                onClick={handleSimulateFullCrash}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Simulate Full Crash
              </button>
              <p className="text-sm text-slate-400">Simulates complete system failure by wiping all database records</p>
            </div>
            <div>
              <button
                onClick={handleRestoreFromBackup}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <RotateCcw className="h-5 w-5" />
                Restore From Backup
              </button>
              <p className="text-sm text-slate-400">Recovers all data from the most recent remote backup</p>
            </div>
          </div>
          <ConsoleLog logs={logs} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">Main Database</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${results.length > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                {results.length > 0 ? 'ONLINE' : 'EMPTY'}
              </div>
            </div>
            {loading ? <Loader /> : <DataTable data={results.slice(0, 10)} columns={columns} />}
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-400">Remote Backup</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${backupData.length > 0 ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-400'
                }`}>
                {backupData.length > 0 ? 'AVAILABLE' : 'NO BACKUP'}
              </div>
            </div>
            {loading ? <Loader /> : <DataTable data={backupData.slice(0, 10)} columns={columns} />}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Disaster Recovery Architecture</h2>
          <div className="grid md:grid-cols-3 gap-6 py-6">
            <div className="text-center">
              <div className={`rounded-lg p-6 mb-3 border-2 ${results.length > 0
                ? 'bg-green-900 border-green-600'
                : 'bg-red-900 border-red-600'
                }`}>
                <Cloud className={`h-16 w-16 mx-auto mb-2 ${results.length > 0 ? 'text-green-400' : 'text-red-400'
                  }`} />
                <div className="text-white font-bold text-lg">Primary Site</div>
                <div className="text-xs text-slate-300 mt-1">{results.length} records</div>
              </div>
              <div className="text-slate-400 text-sm">Main Database Server</div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-cyan-400 text-4xl mb-2">⇄</div>
                <div className="text-slate-400 text-sm">Replication</div>
              </div>
            </div>

            <div className="text-center">
              <div className={`rounded-lg p-6 mb-3 border-2 ${backupData.length > 0
                ? 'bg-blue-900 border-blue-600'
                : 'bg-slate-700 border-slate-600'
                }`}>
                <Cloud className={`h-16 w-16 mx-auto mb-2 ${backupData.length > 0 ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                <div className="text-white font-bold text-lg">Remote Site</div>
                <div className="text-xs text-slate-300 mt-1">{backupData.length} records</div>
              </div>
              <div className="text-slate-400 text-sm">Backup Server</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <img
            src="/remote-backup-system.jpg"
            alt="Remote Backup System Diagram"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}


