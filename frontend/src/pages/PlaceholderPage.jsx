// A holding page for screens we build in the next steps.
const PlaceholderPage = ({ title, description }) => (
  <div>
    <h1 className="text-2xl font-semibold text-dark mb-1">{title}</h1>
    <p className="text-muted mb-6">{description}</p>
    <div className="bg-surface border border-dashed border-line rounded-2xl p-10 text-center text-muted">
      This screen is built in the next step.
    </div>
  </div>
);

export default PlaceholderPage;