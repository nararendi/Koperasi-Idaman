'use client';

export default function AppLogo({ className = "w-9 h-9", size = "normal" }) {
  if (size === "large") {
    return (
      <div className="flex items-center justify-center relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1d4ed8] to-[#3b82f6] flex items-center justify-center shadow-lg border border-white/30 text-white relative overflow-hidden group">
          {/* Subtle geometric glass shine */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/25 rounded-full blur-sm pointer-events-none"></div>
          
          {/* Modern Cooperative Emblem (Interlocking Hands & Golden Seed / Growth) */}
          <svg className="w-8 h-8 text-white drop-shadow-sm" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 3L6 8.5V14.8C6 21.2 10.3 27.1 16 29C21.7 27.1 26 21.2 26 14.8V8.5L16 3Z"
              fill="url(#shield_grad)"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Center Growth Tree / People Node */}
            <circle cx="16" cy="11.5" r="2.2" fill="#ffd159" />
            <path
              d="M11.5 19.5C11.5 16.5 13.5 14.5 16 14.5C18.5 14.5 20.5 16.5 20.5 19.5"
              stroke="#ffd159"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M16 16.5V23"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12.5 23H19.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="shield_grad" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#1e40af" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#3b82f6] flex items-center justify-center border border-white/30 text-white shadow-inner relative overflow-hidden ${className}`}>
      <svg className="w-5 h-5 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 3L6 8.5V14.8C6 21.2 10.3 27.1 16 29C21.7 27.1 26 21.2 26 14.8V8.5L16 3Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="11.5" r="2" fill="#ffd159" />
        <path
          d="M12 19C12 16.5 13.8 15 16 15C18.2 15 20 16.5 20 19"
          stroke="#ffd159"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 17V23M13 23H19"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
