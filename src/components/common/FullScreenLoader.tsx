/**
 * Full-screen loading component
 * Displays a centered spinner with app logo that covers the entire viewport
 */
export const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="loading-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loading-grid)" />
        </svg>
      </div>

      {/* Loading Content */}
      <div className="relative flex flex-col items-center justify-center gap-6">
        {/* Logo with Animation */}
        <div className="relative flex items-center justify-center">
          {/* Logo */}
          <div className="relative z-10 flex animate-pulse items-center justify-center">
            <img
              src="/images/metaaLearn-logo.png"
              alt="MetaaLearn"
              width={100}
              height={100}
              className="drop-shadow-lg"
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">
            در حال بررسی احراز هویت...
          </h2>
          <p className="text-gray-600">لطفا کمی صبر کنید</p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary-500"></div>
        </div>
      </div>
    </div>
  );
};
