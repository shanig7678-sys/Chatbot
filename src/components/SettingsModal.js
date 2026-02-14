'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Constants
const DEFAULT_SETTINGS = {
    userName: 'User',
    fontSize: 'medium',
    messageLimit: 50,
};

const FONT_SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
];

const MESSAGE_LIMIT_CONSTRAINTS = {
    min: 10,
    max: 100
};

const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [hasChanges, setHasChanges] = useState(false);

    // Update local settings when props change
    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings]);

    // Check for changes
    useEffect(() => {
        const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
        setHasChanges(changed);
    }, [localSettings, settings]);

    // Optimized save handler
    const handleSave = useCallback(() => {
        if (hasChanges) {
            onSave(localSettings);
        }
        onClose();
    }, [localSettings, onSave, onClose, hasChanges]);

    // Optimized reset handler
    const handleReset = useCallback(() => {
        setLocalSettings(DEFAULT_SETTINGS);
    }, []);

    // Optimized close handler
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Optimized backdrop click handler
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // Optimized input change handlers
    const handleUserNameChange = useCallback((e) => {
        const value = e.target.value.trim();
        if (value.length <= 50) { // Validation
            setLocalSettings(prev => ({ ...prev, userName: value }));
        }
    }, []);

    const handleFontSizeChange = useCallback((e) => {
        setLocalSettings(prev => ({ ...prev, fontSize: e.target.value }));
    }, []);

    const handleMessageLimitChange = useCallback((e) => {
        const value = parseInt(e.target.value);
        if (value >= MESSAGE_LIMIT_CONSTRAINTS.min && value <= MESSAGE_LIMIT_CONSTRAINTS.max) {
            setLocalSettings(prev => ({ ...prev, messageLimit: value }));
        }
    }, []);

    // Memoized validation
    const isValid = useMemo(() => {
        return localSettings.userName.length > 0 && 
               localSettings.messageLimit >= MESSAGE_LIMIT_CONSTRAINTS.min && 
               localSettings.messageLimit <= MESSAGE_LIMIT_CONSTRAINTS.max;
    }, [localSettings]);

    // Early return if modal is not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
            {/* Backdrop with blur effect */}
            <div 
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            />

            {/* Modal */}
            <div 
                className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b flex items-center justify-between backdrop-blur-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--user-message-bg) 0%, #6366f1 100%)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold">Settings</h2>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customize your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-opacity-80 transition-all"
                        style={{ background: 'var(--icon-bg)' }}
                        aria-label="Close settings"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto p-4 sm:p-6 pb-6 space-y-6"
                    style={{
                        maxHeight: 'calc(90vh - 160px)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--icon-bg) transparent'
                    }}
                >
                    {/* Personal Settings */}
                    <SettingsSection 
                        title="Personal" 
                        icon={<PersonIcon />}
                        iconBg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name</label>
                            <input
                                type="text"
                                value={localSettings.userName}
                                onChange={handleUserNameChange}
                                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm focus:ring-2 transition-all"
                                style={{ 
                                    background: 'var(--input-bg)', 
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--user-message-bg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
                                placeholder="Enter your name"
                                maxLength={50}
                            />
                        </div>
                    </SettingsSection>

                    {/* Display Settings */}
                    <SettingsSection 
                        title="Display" 
                        icon={<DisplayIcon />}
                        iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Font Size</label>
                            <div className="relative">
                                <select
                                    value={localSettings.fontSize}
                                    onChange={handleFontSizeChange}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg border outline-none text-sm focus:ring-2 transition-all cursor-pointer appearance-none"
                                    style={{ 
                                        background: 'var(--input-bg)', 
                                        borderColor: 'var(--input-border)',
                                        color: 'var(--foreground)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--user-message-bg)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
                                >
                                    {FONT_SIZE_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Chat Settings */}
                    <SettingsSection 
                        title="Chat" 
                        icon={<ChatIcon />}
                        iconBg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Message History Limit</label>
                            <input
                                type="number"
                                min={MESSAGE_LIMIT_CONSTRAINTS.min}
                                max={MESSAGE_LIMIT_CONSTRAINTS.max}
                                value={localSettings.messageLimit}
                                onChange={handleMessageLimitChange}
                                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm focus:ring-2 transition-all"
                                style={{ 
                                    background: 'var(--input-bg)', 
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--user-message-bg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Number of messages to keep in history ({MESSAGE_LIMIT_CONSTRAINTS.min}-{MESSAGE_LIMIT_CONSTRAINTS.max})
                            </p>
                        </div>
                    </SettingsSection>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3 sm:justify-between" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors order-2 sm:order-1"
                        style={{ background: 'var(--icon-bg)', color: 'var(--foreground)' }}
                    >
                        Reset to Default
                    </button>
                    <div className="flex gap-3 order-1 sm:order-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ background: 'var(--icon-bg)', color: 'var(--foreground)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ 
                                background: isValid ? 'var(--user-message-bg)' : 'var(--icon-bg)', 
                                color: isValid ? 'var(--user-message-text)' : 'var(--foreground)'
                            }}
                        >
                            {hasChanges ? 'Save Changes' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Memoized settings section component
const SettingsSection = ({ title, icon, iconBg, children }) => (
    <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {children}
    </section>
);

// Icon components
const PersonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const DisplayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
);

const ChatIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);

export default SettingsModal;
