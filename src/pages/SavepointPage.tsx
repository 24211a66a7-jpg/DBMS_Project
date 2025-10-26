import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import Toast from '../components/Toast';
import { Play, Bookmark, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react';

interface Transaction {
  id: number;
  roll_no: string;
  subject: string;
  marks: number;
  status: 'pending' | 'committed' | 'rolled-back';
}

export default function SavepointPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savepoint, setSavepoint] = useState<Transaction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleBeginTransaction = () => {
    setTransactions([]);
    setSavepoint([]);
    setCurrentStep(1);
    addLog('Transaction started');
    setToast({ message: 'Transaction started', type: 'success' });
  };

  const handleAddSubjectMarks = () => {
    if (currentStep < 1) {
      setToast({ message: 'Please begin transaction first', type: 'error' });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      roll_no: `CS${100 + transactions.length}`,
      subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology'][transactions.length % 4],
      marks: Math.floor(Math.random() * 40) + 60,
      status: 'pending',
    };

    setTransactions(prev => [...prev, newTransaction]);
    addLog(`Added marks for ${newTransaction.subject}: ${newTransaction.marks}`);
    setToast({ message: 'Subject marks added', type: 'success' });
    setCurrentStep(2);
  };

  const handleSetSavepoint = () => {
    if (transactions.length === 0) {
      setToast({ message: 'No transactions to save', type: 'error' });
      return;
    }

    setSavepoint([...transactions]);
    addLog(`Savepoint created with ${transactions.length} entries`);
    setToast({ message: 'Savepoint created', type: 'success' });
    setCurrentStep(3);
  };

  const handleSimulateError = () => {
    if (currentStep < 3) {
      setToast({ message: 'Create savepoint first', type: 'error' });
      return;
    }

    const errorTransaction: Transaction = {
      id: Date.now(),
      roll_no: 'ERROR',
      subject: 'Invalid Entry',
      marks: -1,
      status: 'rolled-back',
    };

    setTransactions(prev => [...prev, errorTransaction]);
    addLog('ERROR: Invalid data detected!');
    setToast({ message: 'Error occurred in transaction', type: 'error' });
    setCurrentStep(4);
  };

  const handleRollbackToSavepoint = () => {
    if (savepoint.length === 0) {
      setToast({ message: 'No savepoint available', type: 'error' });
      return;
    }

    setTransactions(savepoint.map(t => ({ ...t, status: 'pending' })));
    addLog(`Rolled back to savepoint (${savepoint.length} entries restored)`);
    setToast({ message: 'Rolled back to savepoint', type: 'success' });
    setCurrentStep(5);
  };

  const handleCommit = async () => {
    if (transactions.length === 0) {
      setToast({ message: 'No transactions to commit', type: 'error' });
      return;
    }

    const validTransactions = transactions.filter(t => t.status !== 'rolled-back');

    const dataToInsert = validTransactions.map(t => ({
      roll_no: t.roll_no,
      name: `Student ${t.roll_no}`,
      subject: t.subject,
      marks: t.marks,
      grade: t.marks >= 90 ? 'A' : t.marks >= 75 ? 'B' : t.marks >= 60 ? 'C' : 'D',
    }));

    const { error } = await supabase.from('student_results').insert(dataToInsert);

    if (!error) {
      setTransactions(prev => prev.map(t => ({ ...t, status: 'committed' })));
      addLog(`Transaction committed: ${validTransactions.length} records saved to database`);
      setToast({ message: 'Transaction committed successfully', type: 'success' });
      setCurrentStep(6);
    } else {
      setToast({ message: 'Commit failed', type: 'error' });
    }
  };

  const steps = [
    { label: 'Begin Transaction', active: currentStep >= 1 },
    { label: 'Add Marks', active: currentStep >= 2 },
    { label: 'Set Savepoint', active: currentStep >= 3 },
    { label: 'Error Detected', active: currentStep >= 4 },
    { label: 'Rollback', active: currentStep >= 5 },
    { label: 'Commit', active: currentStep >= 6 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Savepoints</h1>
          <p className="text-xl text-slate-300">Undoing Partial Errors During Marks Entry</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Theory</h2>
            <div className="text-slate-300 space-y-3">
              <p>
                A <strong className="text-white">savepoint</strong> is a marker set within a transaction that allows rolling back part of it without undoing the entire transaction.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Create markers within active transactions</li>
                <li>Rollback to specific points without losing all work</li>
                <li>Handle partial errors gracefully</li>
                <li>Maintain data consistency during complex operations</li>
              </ul>
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Real-World Example:</h3>
                <p className="text-slate-300">Think of filling out a long online form, like a college application. As you complete
                  each section (personal info, academic history, etc.), you click "Save Progress" - that's like creating a savepoint.
                  If you make a mistake in the "extracurricular activities" section, you can go back to your last saved point without
                  losing all the correct information in previous sections. Here, while entering marks for multiple subjects, savepoints
                  let you rollback to a known good state if you make a mistake, without starting over from the beginning.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Transaction Flow</h2>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${step.active
                    ? 'bg-cyan-600 text-white'
                    : currentStep === idx
                      ? 'bg-slate-700 text-slate-300 border-2 border-cyan-500'
                      : 'bg-slate-700 text-slate-500'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step.active ? 'bg-white text-cyan-600' : 'bg-slate-600 text-slate-400'
                    }`}>
                    {idx + 1}
                  </div>
                  <span className="font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Transaction Operations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <button
                onClick={handleBeginTransaction}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <Play className="h-5 w-5" />
                Begin Transaction
              </button>
              <p className="text-sm text-slate-400">Start a new marks entry session with empty transaction list</p>
            </div>
            <div>
              <button
                onClick={handleAddSubjectMarks}
                disabled={currentStep < 1}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <CheckCircle className="h-5 w-5" />
                Add Subject Marks
              </button>
              <p className="text-sm text-slate-400">Add a new subject's marks to the current transaction</p>
            </div>
            <div>
              <button
                onClick={handleSetSavepoint}
                disabled={currentStep < 2}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <Bookmark className="h-5 w-5" />
                Set Savepoint
              </button>
              <p className="text-sm text-slate-400">Create a recovery point to return to if errors occur</p>
            </div>
            <div>
              <button
                onClick={handleSimulateError}
                disabled={currentStep < 3}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Simulate Error
              </button>
              <p className="text-sm text-slate-400">Add an invalid record to demonstrate error handling</p>
            </div>
            <div>
              <button
                onClick={handleRollbackToSavepoint}
                disabled={currentStep < 4}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <RotateCcw className="h-5 w-5" />
                Rollback to Savepoint
              </button>
              <p className="text-sm text-slate-400">Revert to last savepoint, removing invalid records</p>
            </div>
            <div>
              <button
                onClick={handleCommit}
                disabled={currentStep < 5}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                <CheckCircle className="h-5 w-5" />
                Commit
              </button>
              <p className="text-sm text-slate-400">Save all valid transactions to the database permanently</p>
            </div>
          </div>
        </div>        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Current Transaction</h2>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-slate-500 text-center py-8">No active transactions</div>
              ) : (
                transactions.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg ${t.status === 'committed'
                      ? 'bg-green-900 border border-green-700'
                      : t.status === 'rolled-back'
                        ? 'bg-red-900 border border-red-700'
                        : 'bg-slate-700 border border-slate-600'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-white">
                        <span className="font-semibold">{t.roll_no}</span> - {t.subject}
                      </div>
                      <div className="text-cyan-400 font-bold">{t.marks}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 uppercase">{t.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Operation Log</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-slate-500">Waiting for operations...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-green-400">
                    <span className="text-slate-500">[{idx + 1}]</span> {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <img
            src="/savepoints.jpg"
            alt="Savepoints Process Diagram"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
