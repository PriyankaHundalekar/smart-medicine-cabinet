import React from 'react';
import { HistoryItem } from '../types';
import { Pill, Trash2, Calendar, ChevronRight } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onScanNew: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ items, onSelect, onDelete, onScanNew }) => {
  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine Cabinet</h2>
          <p className="text-gray-500 text-sm">Your scanned medications</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Pill className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines yet</h3>
            <p className="text-gray-500 max-w-xs mb-8">Scan your first medicine to start building your digital cabinet.</p>
            <button 
                onClick={onScanNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
                Scan Now
            </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center active:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.medicineName} className="w-full h-full object-cover" />
                    ) : (
                        <Pill className="w-full h-full p-4 text-gray-300" />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.medicineName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                       {item.expiryDate ? (
                         <span className={`flex items-center gap-1 ${item.expiryDate.includes(new Date().getFullYear().toString()) ? 'text-yellow-600' : ''}`}>
                           <Calendar className="w-3 h-3" />
                           {item.expiryDate}
                         </span>
                       ) : (
                         <span>No date</span>
                       )}
                       {item.dosage && (
                         <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>{item.dosage}</span>
                         </>
                       )}
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};