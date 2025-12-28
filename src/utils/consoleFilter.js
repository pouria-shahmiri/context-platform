// Filter out annoying browser extension errors
export const initConsoleFilter = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    const originalWarn = console.warn;

    const IGNORED_ERRORS = [
      'TronLink',
      'ethereum',
      'solana',
      'tabReply',
      'Extension',
      'content.js',
      'injected.js',
      'Cross-Origin-Opener-Policy'
    ];

    console.error = (...args) => {
      const errorString = args.map(arg => String(arg)).join(' ');
      if (IGNORED_ERRORS.some(ignored => errorString.includes(ignored))) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const warnString = args.map(arg => String(arg)).join(' ');
      if (IGNORED_ERRORS.some(ignored => warnString.includes(ignored))) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
};
