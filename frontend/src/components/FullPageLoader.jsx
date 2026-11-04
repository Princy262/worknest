const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div
      className="h-10 w-10 rounded-full border-4 border-line border-t-primary animate-spin"
      role="status"
      aria-label="Loading"
    />
  </div>
);

export default FullPageLoader;