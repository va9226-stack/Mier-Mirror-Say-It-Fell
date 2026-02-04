
import React from 'react';
import { Snapshot } from '../types';

interface SidebarProps {
  snapshots: Snapshot[];
  activeId?: string;
  onSelect: (s: Snapshot) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ snapshots, activeId, onSelect, onDelete, onNew }) => {
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <i className="fas fa-box-archive text-blue-500"></i>
          Snapshots
        </h2>
        <button 
          onClick={onNew}
          className="p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
          title="New Generation"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {snapshots.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
            <p className="text-sm">No snapshots stored yet.</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {snapshots.map((s) => (
              <div 
                key={s.id}
                onClick={() => onSelect(s)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  activeId === s.id 
                    ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                    : 'hover:bg-slate-800 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600">
                    <i className={`fas ${
                      s.type === 'image' ? 'fa-image' : s.type === 'code' ? 'fa-code' : 'fa-file-lines'
                    } text-xs`}></i>
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{s.prompt}</p>
                    <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest mt-0.5">
                      {new Date(s.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
        VRAWLESS v2.0 // MASTER BUILDER MODE
      </div>
    </aside>
  );
};

export default Sidebar;
