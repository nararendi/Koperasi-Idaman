'use client';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems <= itemsPerPage && totalPages <= 1) {
    if (totalItems === 0) return null;
    return (
      <div className="p-4 border-t border-slate-100 bg-[#f8fafc] flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Menampilkan {totalItems} data</span>
        <span className="text-[11px] text-slate-400">Halaman 1 dari 1</span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-4 border-t border-slate-100 bg-[#f8fafc] flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
      <div className="text-slate-500 font-medium">
        Menampilkan <strong className="font-bold text-slate-700">{startItem}</strong> - <strong className="font-bold text-slate-700">{endItem}</strong> dari <strong className="font-bold text-slate-700">{totalItems}</strong> data
      </div>

      <div className="flex items-center gap-1.5">
        {/* Prev Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-[#eff6ff] hover:text-[#2563eb] hover:border-[#2563eb]/40 cursor-pointer shadow-xs'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 font-bold">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-xs scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-[#f8fafc] hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-[#eff6ff] hover:text-[#2563eb] hover:border-[#2563eb]/40 cursor-pointer shadow-xs'
          }`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
