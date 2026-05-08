import { Link } from 'react-router-dom';

const ResetPassword = () => (
  <main className="min-h-screen w-full bg-white flex items-center justify-center p-8 font-sans">
    <section className="w-full max-w-[420px]">
      <div className="bg-white p-8 rounded-xl border border-surface-highest shadow-card">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl">lock_reset</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">Password Reset Unavailable</h1>
          <p className="text-sm text-gray-500">
            Firebase password reset will be enabled after the Firebase migration is configured.
          </p>
        </div>

        <Link
          to="/login"
          className="w-full py-3 bg-secondary text-white font-bold uppercase tracking-widest rounded hover:bg-primary transition-all duration-200 shadow-sm flex items-center justify-center"
        >
          Back to Login
        </Link>
      </div>
    </section>
  </main>
);

export default ResetPassword;
