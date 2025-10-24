import { Terminal } from 'lucide-react';

interface ConsoleLogProps {
  logs: string[];
}

export default function ConsoleLog({ logs }: ConsoleLogProps) {
  return (
    <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-3 text-cyan-400">
        <Terminal className="h-4 w-4" />
        <span className="font-semibold">Operation Log</span>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
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
  );
}
