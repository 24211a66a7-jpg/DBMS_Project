import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import DataTable from '../components/DataTable';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { Database, Cpu, Trash2, ArrowRight } from 'lucide-react';

export default function BufferPage() {
  const [diskData, setDiskData] = useState<any[]>([]);
  const [bufferData, setBufferData] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [fetchCount, setFetchCount] = useState({ disk: 0, buffer: 0 });

  useEffect(() => {
    fetchDiskData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const fetchDiskData = async () => {
    const { data } = await supabase
      .from('student_results')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false });

    if (data) {
      setDiskData(data);
    }
  };

  const handleFetchFromDatabase = async () => {
    setLoading(true);
    addLog('Fetching data from DISK (Database)...');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const { data, error } = await supabase
      .from('student_results')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDiskData(data);
      setBufferData(data);
      setFetchCount(prev => ({ ...prev, disk: prev.disk + 1 }));
      addLog(`Fetched ${data.length} records from DISK (Slow I/O operation)`);
      setToast({ message: 'Data fetched from database', type: 'success' });
    } else {
      setToast({ message: 'Failed to fetch from database', type: 'error' });
    }

    setLoading(false);
  };

  const handleFetchFromBuffer = () => {
    if (bufferData.length === 0) {
      setToast({ message: 'Buffer is empty. Fetch from database first.', type: 'error' });
      return;
    }

    addLog('Serving data from BUFFER (Memory) - Instant!');
    setFetchCount(prev => ({ ...prev, buffer: prev.buffer + 1 }));
    setToast({ message: 'Data served from buffer (fast)', type: 'success' });
  };

  const handleClearBuffer = () => {
    setBufferData([]);
    addLog('Buffer cleared');
    setToast({ message: 'Buffer cleared', type: 'success' });
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
          <h1 className="text-4xl font-bold text-white mb-3">Buffer Management</h1>
          <p className="text-xl text-slate-300">Handling Student Load Efficiently</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Theory</h2>
            <div className="text-slate-300 space-y-3">
              <p>
                <strong className="text-white">Buffer Management</strong> manages data transfer between disk and main memory using a buffer pool.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Reduces expensive disk I/O operations</li>
                <li>Keeps frequently accessed data in memory</li>
                <li>Improves query performance dramatically</li>
                <li>Acts as a cache layer between application and storage</li>
              </ul>
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Real-World Example:</h3>
                <p className="text-slate-300">Think of a shopping mall's directory kiosk. Instead of asking the main office (disk) for store locations every time,
                  the kiosk keeps frequently requested store locations in its memory (buffer). When someone asks for "Starbucks", it shows the location instantly from memory
                  instead of calling the main office. Only new or rarely requested stores require checking with the main office.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Performance Stats</h2>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Disk Fetches</span>
                  <span className="text-red-400 text-2xl font-bold">{fetchCount.disk}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Slow operations (1.5s each)</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Buffer Fetches</span>
                  <span className="text-green-400 text-2xl font-bold">{fetchCount.buffer}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Fast operations (instant)</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Buffer Status</span>
                  <span className={`text-xl font-bold ${bufferData.length > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {bufferData.length > 0 ? 'Active' : 'Empty'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{bufferData.length} records in memory</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operations</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <button
                onClick={handleFetchFromDatabase}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
              >
                <Database className="h-5 w-5" />
                Fetch From Database
              </button>
              <p className="text-sm text-slate-400">Loads data from disk storage (slow operation, ~1.5s)</p>
            </div>
            <div>
              <button
                onClick={handleFetchFromBuffer}
                disabled={bufferData.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <Cpu className="h-5 w-5" />
                Fetch From Buffer
              </button>
              <p className="text-sm text-slate-400">Retrieves data from memory buffer (instant access)</p>
            </div>
            <div>
              <button
                onClick={handleClearBuffer}
                disabled={bufferData.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <Trash2 className="h-5 w-5" />
                Clear Buffer
              </button>
              <p className="text-sm text-slate-400">Empties the memory buffer, forcing next fetch from disk</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Database className="h-6 w-6" />
                Disk Storage
              </h2>
              <span className="text-red-400 text-sm font-semibold">SLOW</span>
            </div>
            {loading && diskData.length === 0 ? (
              <Loader />
            ) : (
              <DataTable data={diskData.slice(0, 5)} columns={columns} />
            )}
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Cpu className="h-6 w-6" />
                Memory Buffer
              </h2>
              <span className="text-green-400 text-sm font-semibold">FAST</span>
            </div>
            <DataTable data={bufferData.slice(0, 5)} columns={columns} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Data Flow Visualization</h2>
          <div className="flex items-center justify-center gap-4 py-8">
            <div className="text-center">
              <div className="bg-red-900 border-2 border-red-600 rounded-lg p-6 mb-2">
                <Database className="h-12 w-12 text-red-400 mx-auto" />
              </div>
              <span className="text-white font-semibold">Disk Storage</span>
              <div className="text-xs text-slate-400">Persistent, Slow</div>
            </div>

            <ArrowRight className={`h-8 w-8 ${loading ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />

            <div className="text-center">
              <div className={`border-2 rounded-lg p-6 mb-2 ${bufferData.length > 0 ? 'bg-green-900 border-green-600' : 'bg-slate-700 border-slate-600'
                }`}>
                <Cpu className={`h-12 w-12 mx-auto ${bufferData.length > 0 ? 'text-green-400' : 'text-slate-500'}`} />
              </div>
              <span className="text-white font-semibold">Memory Buffer</span>
              <div className="text-xs text-slate-400">Temporary, Fast</div>
            </div>

            <ArrowRight className={`h-8 w-8 ${bufferData.length > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />

            <div className="text-center">
              <div className="bg-blue-900 border-2 border-blue-600 rounded-lg p-6 mb-2">
                <Cpu className="h-12 w-12 text-blue-400 mx-auto" />
              </div>
              <span className="text-white font-semibold">Application</span>
              <div className="text-xs text-slate-400">User Interface</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg shadow-xl p-6 border border-slate-700 mt-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operation Log</h2>
          <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500">Waiting for operations...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-green-400">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <img
            src="/buffermanagement.jpg"
            alt="Buffer Management Diagram"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
