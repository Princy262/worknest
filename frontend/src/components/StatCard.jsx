// Colors follow the WorkNest hierarchy rule:
//   primary   = Company      accent  = Departments
//   secondary = Teams        neutral = People
const tones = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-dark',
  secondary: 'bg-secondary text-dark',
  neutral: 'bg-background text-primary',
};

const StatCard = ({ icon: Icon, label, value, hint, tone = 'neutral', loading }) => (
  <div className="bg-surface border border-line rounded-2xl p-5 flex items-center gap-4">
    <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${tones[tone]}`}>
      <Icon size={22} />
    </div>

    <div className="min-w-0">
      <p className="text-sm text-muted">{label}</p>
      {loading ? (
        <div className="h-7 w-16 mt-1 rounded bg-line animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-dark truncate">{value}</p>
      )}
      {hint && !loading && <p className="text-xs text-muted truncate">{hint}</p>}
    </div>
  </div>
);

export default StatCard;