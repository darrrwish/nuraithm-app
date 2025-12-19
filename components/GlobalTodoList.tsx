
import React from 'react';
import { Patient, Language } from '../src/types';

interface GlobalTodoListProps {
  patients: Patient[];
  lang: Language;
  onToggle: (pid: number, tid: string) => void;
}

const GlobalTodoList: React.FC<GlobalTodoListProps> = ({ patients, lang, onToggle }) => {
  const activeTodos = patients.flatMap(p => 
    p.todos.map(t => ({ ...t, patientName: p.name, patientId: p.id }))
  ).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="glass-card p-6 rounded-3xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">task_alt</span>
          {lang === 'ar' ? 'قائمة المهام' : 'Care Tasks'}
        </h3>
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold">
          {activeTodos.filter(t => !t.completed).length} {lang === 'ar' ? 'مهام باقية' : 'Pending'}
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {activeTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2">hotel_class</span>
            <p className="text-sm">{lang === 'ar' ? 'لا توجد مهام حالياً' : 'No pending tasks'}</p>
          </div>
        ) : (
          activeTodos.map(todo => (
            <div 
              key={todo.id} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${todo.completed ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-orange-200'}`}
              onClick={() => onToggle(todo.patientId, todo.id)}
            >
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-xl mt-0.5 ${todo.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-orange-400'}`}>
                  {todo.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium dark:text-white truncate ${todo.completed ? 'line-through' : ''}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">FOR</span>
                    <span className="text-[10px] font-bold text-blue-500 truncate">{todo.patientName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GlobalTodoList;
