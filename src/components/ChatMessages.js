'use client';

import { useMemo, memo, useState, useCallback, useEffect } from 'react';

// Constants
const LOADING_ANIMATION_DELAYS = ['0ms', '150ms', '300ms'];

const ChatMessages = ({ messages, isLoading, fontSize = 'medium' }) => {
    // Memoized messages to prevent unnecessary re-renders
    const memoizedMessages = useMemo(() => messages, [messages]);

    return (
        <div className={`max-w-3xl mx-auto py-8 space-y-6 font-size-${fontSize}`}>
            {memoizedMessages.map((message) => (
                <MessageBubble key={message.id} message={message} fontSize={fontSize} />
            ))}

            {isLoading && <LoadingIndicator />}
        </div>
    );
};

// Memoized message bubble component
const MessageBubble = memo(({ message, fontSize = 'medium' }) => {
    const isUser = message.sender === 'user';
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    
    // Check speech synthesis support
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSpeechSupported(true);
        }
    }, []);

    // Text-to-speech handler
    const handleSpeak = useCallback(() => {
        if (!speechSupported) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        // Stop any ongoing speech
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(message.text);
        
        // Configure voice settings
        utterance.rate = 1.0; // Speed (0.1 to 10)
        utterance.pitch = 1.0; // Pitch (0 to 2)
        utterance.volume = 1.0; // Volume (0 to 1)
        utterance.lang = 'en-US'; // Language

        // Event handlers
        utterance.onstart = () => {
            console.log('🔊 Started speaking');
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            console.log('🔇 Finished speaking');
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
            setIsSpeaking(false);
        };

        // Speak the text
        window.speechSynthesis.speak(utterance);
    }, [message.text, isSpeaking, speechSupported]);

    // Stop speech when component unmounts
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);
    
    // Memoized styles for better performance
    const bubbleStyles = useMemo(() => ({
        background: isUser ? 'var(--user-message-bg)' : 'var(--bot-message-bg)',
        color: isUser ? 'var(--user-message-text)' : 'var(--bot-message-text)',
        border: !isUser ? '1px solid var(--card-border)' : 'none',
        borderLeft: message.isError ? '3px solid #dc2626' : undefined
    }), [isUser, message.isError]);

    const timestampStyles = useMemo(() => ({
        opacity: 0.7,
        color: isUser ? 'var(--user-message-text)' : 'var(--text-secondary)'
    }), [isUser]);

    // Memoized timestamp formatting
    const formattedTime = useMemo(() => {
        return new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }, [message.timestamp]);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isUser ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
                style={bubbleStyles}
            >
                {message.file && (
                    <FileAttachment file={message.file} />
                )}
                <p className={`leading-relaxed whitespace-pre-wrap font-size-${fontSize}`}>
                    {message.text}
                </p>
                <div className="flex items-center justify-between gap-2 mt-1">
                    <span 
                        className="text-xs" 
                        style={timestampStyles}
                    >
                        {formattedTime}
                    </span>
                    <div className="flex items-center gap-2">
                        {/* Text-to-Speech Button (only for bot messages) */}
                        {!isUser && speechSupported && (
                            <button
                                onClick={handleSpeak}
                                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 focus-ring"
                                style={{ 
                                    background: isSpeaking ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: isSpeaking ? '#3b82f6' : 'var(--text-secondary)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSpeaking) {
                                        e.currentTarget.style.background = 'var(--hover-bg)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSpeaking) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                            >
                                {isSpeaking ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="6" y="4" width="4" height="16"/>
                                        <rect x="14" y="4" width="4" height="16"/>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                                    </svg>
                                )}
                            </button>
                        )}
                        
                        {/* Provider Badge */}
                        {!isUser && message.provider && message.provider !== 'unknown' && (
                            <span 
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ 
                                    background: message.provider === 'openai' ? 'rgba(16, 163, 127, 0.2)' : 
                                               message.provider === 'gemini' ? 'rgba(66, 133, 244, 0.2)' : 
                                               'rgba(156, 163, 175, 0.2)',
                                    color: message.provider === 'openai' ? '#10a37f' : 
                                           message.provider === 'gemini' ? '#4285f4' : 
                                           'var(--text-secondary)',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                }}
                            >
                                {message.provider === 'openai' ? '🤖 OpenAI' : 
                                 message.provider === 'gemini' ? '✨ Gemini' : 
                                 '💬 Demo'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

// Memoized file attachment component
const FileAttachment = memo(({ file }) => (
    <div 
        className="flex items-center gap-2 mb-2 pb-2 border-b" 
        style={{ borderColor: 'var(--card-border)' }}
    >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="text-xs font-medium">{file.name}</span>
    </div>
));

// Memoized loading indicator component
const LoadingIndicator = memo(() => (
    <div className="flex justify-start">
        <div
            className="px-4 py-3 rounded-2xl rounded-bl-sm"
            style={{
                background: 'var(--bot-message-bg)',
                border: '1px solid var(--card-border)'
            }}
        >
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {LOADING_ANIMATION_DELAYS.map((delay, index) => (
                        <span 
                            key={index}
                            className="w-2 h-2 rounded-full animate-bounce" 
                            style={{ 
                                background: 'var(--text-secondary)', 
                                animationDelay: delay 
                            }}
                        />
                    ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Thinking...
                </span>
            </div>
        </div>
    </div>
));

// Set display names for debugging
MessageBubble.displayName = 'MessageBubble';
FileAttachment.displayName = 'FileAttachment';
LoadingIndicator.displayName = 'LoadingIndicator';

export default ChatMessages;
