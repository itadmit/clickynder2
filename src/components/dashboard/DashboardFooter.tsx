'use client';

export function DashboardFooter() {
  const handleHelpClick = () => {
    window.dispatchEvent(new Event('openHelp'));
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          {/* Copyright */}
          <div className="text-center md:text-right">
            © {new Date().getFullYear()} Clickinder. כל הזכויות שמורות.
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://clickinder.co.il/accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              הצהרת נגישות
            </a>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleHelpClick}
              className="hover:text-primary-600 transition-colors font-medium"
            >
              עזרה
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


