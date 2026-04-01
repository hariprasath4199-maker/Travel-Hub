import { Search, Bell, HelpCircle } from 'lucide-react';

export function TopBar() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white flex justify-between items-center px-8 z-40 border-b border-surface-container">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
        <Search size={18} className="text-on-surface-variant" />
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-sans placeholder:text-on-surface-variant/50" 
          placeholder="Search travel records..." 
          type="text"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-outline-variant/20 pr-6">
          <button className="text-slate-500 hover:text-primary transition-all relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          <button className="text-slate-500 hover:text-primary transition-all">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-on-surface leading-none">Sarah Jenkins</p>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase mt-1">Administrator</p>
          </div>
          <img 
            alt="Administrator Profile" 
            className="w-10 h-10 rounded-full border-2 border-surface-container-high object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzAdo4EVIgf3yZV43EOhkaUHQE9pi8RyMOCB5CP3g8_wuO_8nuDf4DFTaqOHOaQPIeJKmLWUw-S_WT4zhExden9UA_ddngApyDAjQiMjVvXGBxoYcX47bHhltv2Yoiy179GHnIu4ISf_SJaxAwWgwgL7YYjAVww2lNhFQW8D2BKRcEz4xXALAKtbkQMTOcuQ2CGKhQ3mcDvIrMHsNYUxLoeYPiG1XkdW8F17sOUX8OFiDPqjHUKjNMA5p3aTTqBCyUt3mEPNTOCpRl"
          />
        </div>
      </div>
    </header>
  );
}
