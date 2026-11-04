import { ChevronLeft, ChevronRight } from 'lucide-react';

const button =
  'flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed';

const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-line text-sm text-muted">
      <span>
        Showing {from}-{to} of {total}
      </span>
      <div className="flex items-center gap-3">
        <button className={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} />
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button className={button} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;