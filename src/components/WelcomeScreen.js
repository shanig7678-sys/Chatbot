'use client';

const WelcomeScreen = ({ userName = 'User', fontSize = 'medium' }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-6 sm:mb-8" style={{ background: 'var(--icon-bg)' }}>
                    <svg width="32" height="32" className="sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div>
                
                <h1 className="font-bold mb-3" style={{ fontSize: '32px', lineHeight: '1.2' }}>Hey, {userName}!</h1>
                <p className={`text-lg sm:text-xl font-size-${fontSize}`} style={{ color: 'var(--text-secondary)' }}>
                    What can I help you with today?
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
