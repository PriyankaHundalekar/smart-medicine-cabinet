import React from 'react';
import { HistoryItem } from '../types';
import { Pill, Trash2, Calendar, ChevronRight, Search } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onScanNew: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ items, onSelect, onDelete, onScanNew }) => {
  return (
    <div className="p-6 pb-24 h-full flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Medicine Cabinet</h2>
          <p className="text-gray-500 font-medium mt-1">Manage your digital inventory</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 text-gray-400">
            <Search className="w-5 h-5" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Pill className="w-12 h-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Your cabinet is empty</h3>
            <p className="text-gray-500 max-w-xs mb-8 leading-relaxed">Scan your first medicine to keep track of dosages and expiration dates.</p>
            <button 
                onClick={onScanNew}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
            >
                Scan First Medicine
            </button>
        </div>
      ) : (
        <div className="grid gap-4 overflow-y-auto pb-4">
          {items.map((item) => {
            // Determine status color strip
            let statusColor = 'bg-emerald-500'; // Good
            if (item.expiryDate && item.expiryDate.includes(new Date().getFullYear().toString())) statusColor = 'bg-amber-500'; // Check
            
            return (
              <div 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-md hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
              >
                  {/* Status Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor}`}></div>

                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                      {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.medicineName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                             <Pill className="w-8 h-8 text-gray-300" />
                          </div>
                      )}
                  </div>
                  <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors">{item.medicineName}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                         {item.expiryDate ? (
                           <span className={`flex items-center gap-1 font-medium ${item.expiryDate.includes(new Date().getFullYear().toString()) ? 'text-amber-600' : 'text-emerald-600'}`}>
                             <Calendar className="w-3.5 h-3.5" />
                             {item.expiryDate}
                           </span>
                         ) : (
                           <span className="text-gray-400 text-xs">No date</span>
                         )}
                         {item.dosage && (
                           <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="text-gray-600">{item.dosage}</span>
                           </>
                         )}
                      </div>
                  </div>
                  <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                      <Trash2 className="w-5 h-5" />
                  </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};