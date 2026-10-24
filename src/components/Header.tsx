import React from 'react';
import { Calculator, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'solver' | 'benchmarks' | 'tests' | 'guide';
  setActiveTab: (tab: 'solver' | 'benchmarks' | 'tests' | 'guide') => void;
  onQuickSolve: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onQuickSolve }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                محاسبات عددی | حل معادلات غیرخطی
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                تنصیف · نیوتون–رافسون · وتری · نابجایی
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('solver')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'solver'
                  ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              حل‌کننده تعاملی
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('benchmarks')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'benchmarks'
                  ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              مسائل مرجع کتب درسی
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              آزمون‌های اعتبارسنجی
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              راهنمای علمی و تئوری
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onQuickSolve}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
            >
              محاسبه و اجرای الگوریتم
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-slate-100 bg-slate-50 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActiveTab('solver')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'solver' ? 'text-sky-600 bg-sky-50' : 'text-slate-600'}`}
        >
          حل‌کننده
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'benchmarks' ? 'text-sky-600 bg-sky-50' : 'text-slate-600'}`}
        >
          مسائل مرجع
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'tests' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'}`}
        >
          آزمون‌ها
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'guide' ? 'text-sky-600 bg-sky-50' : 'text-slate-600'}`}
        >
          تئوری
        </button>
      </div>
    </header>
  );
};
