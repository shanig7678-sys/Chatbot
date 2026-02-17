'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Constants
const ACCEPTED_FILE_TYPES = {
    image: 'image/*',
    pdf: '.pdf',
    document: '.doc,.docx,.txt'
};

const FILE_ICONS = {
    image: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
    ),
    pdf: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
    ),
    document: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="12" y1="9" x2="8" y2="9"/>
        </svg>
    )
};

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    
    // Speech recognition hook from react-speech-recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    
    // Refs
    const fileInputRefs = {
        image: useRef(null),
        pdf: useRef(null),
        document: useRef(null)
    };
    const inputRef = useRef(null);

    // Debug: Log speech recognition status
    useEffect(() => {
        console.log('Speech Recognition Status:', {
            browserSupport: browserSupportsSpeechRecognition,
            listening,
            transcript: transcript || '(empty)'
        });
    }, [browserSupportsSpeechRecognition, listening, transcript]);

    // Sync transcript to input when listening
    useEffect(() => {
        if (transcript) {
            console.log('Setting input value from transcript:', transcript);
            setInputValue(transcript);
        }
    }, [transcript]);

    // Voice input handlers
    const startVoiceInput = useCallback(async () => {
        if (!browserSupportsSpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        try {
            // Request microphone permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately after permission is granted
            stream.getTracks().forEach(track => track.stop());
            
            // Reset transcript before starting
            resetTranscript();
            
            // Start listening with proper configuration
            SpeechRecognition.startListening({ 
                continuous: true,
                language: 'en-US',
                interimResults: true
            });
            
            console.log('Voice input started successfully');
        } catch (error) {
            console.error('Speech recognition error:', error);
            if (error.name === 'NotAllowedError') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            } else if (error.name === 'NotFoundError') {
                alert('No microphone found. Please connect a microphone and try again.');
            } else {
                alert('Failed to start voice input: ' + error.message);
            }
        }
    }, [browserSupportsSpeechRecognition, resetTranscript]);

    const stopVoiceInput = useCallback(() => {
        SpeechRecognition.stopListening();
    }, []);

    const toggleVoiceInput = useCallback(() => {
        if (listening) {
            stopVoiceInput();
        } else {
            startVoiceInput();
        }
    }, [listening, startVoiceInput, stopVoiceInput]);

    // Memoized validation
    const canSubmit = useMemo(() => {
        return (inputValue.trim() || selectedFile) && !isLoading;
    }, [inputValue, selectedFile, isLoading]);

    // Optimized submit handler
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        if (canSubmit) {
            const messageText = inputValue.trim() || `Uploaded: ${selectedFile.file.name}`;
            onSendMessage(messageText);
            setInputValue('');
            resetTranscript();
            setSelectedFile(null);
            setShowUploadOptions(false);
            
            // Stop listening after sending
            if (listening) {
                SpeechRecognition.stopListening();
            }
        }
    }, [canSubmit, inputValue, selectedFile, onSendMessage, resetTranscript, listening]);

    // Optimized file selection handler
    const handleFileSelect = useCallback((e, type) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }
            
            setSelectedFile({ file, type });
            setShowUploadOptions(false);
        }
    }, []);

    // Optimized file removal
    const removeFile = useCallback(() => {
        setSelectedFile(null);
        Object.values(fileInputRefs).forEach(ref => {
            if (ref.current) ref.current.value = '';
        });
    }, []);

    // Optimized upload options toggle
    const toggleUploadOptions = useCallback(() => {
        if (!isLoading) {
            setShowUploadOptions(prev => !prev);
        }
    }, [isLoading]);

    // Optimized backdrop click handler
    const handleBackdropClick = useCallback(() => {
        setShowUploadOptions(false);
    }, []);

    // Optimized file input click handlers
    const handleFileInputClick = useCallback((type) => {
        fileInputRefs[type].current?.click();
    }, []);

    // Memoized file display icon
    const selectedFileIcon = useMemo(() => {
        if (!selectedFile) return null;
        return FILE_ICONS[selectedFile.type] || FILE_ICONS.document;
    }, [selectedFile]);

    return (
        <div>
            {selectedFile && (
                <div 
                    className="mb-2 sm:mb-3 px-3 sm:px-4 py-2 rounded-xl flex items-center justify-between text-sm card transition-all duration-200 hover:scale-[1.01]"
                    style={{ 
                        background: 'var(--card-bg)', 
                        border: '1px solid var(--card-border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" 
                             style={{ background: 'var(--icon-bg)' }}>
                            {selectedFileIcon}
                        </div>
                        <span className="text-xs sm:text-sm truncate font-medium" style={{ color: 'var(--foreground)' }}>
                            {selectedFile.file.name}
                        </span>
                    </div>
                    <button
                        onClick={removeFile}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0 ml-2 focus-ring"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--delete-hover)';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--foreground)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        aria-label="Remove file"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* Voice Recording Indicator */}
            {listening && (
                <div 
                    className="mb-2 sm:mb-3 px-3 sm:px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse"
                    style={{ 
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-medium" style={{ color: '#ef4444' }}>
                            Listening...
                        </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Speak now
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                {/* Hidden file inputs */}
                {Object.entries(ACCEPTED_FILE_TYPES).map(([type, accept]) => (
                    <input
                        key={type}
                        type="file"
                        ref={fileInputRefs[type]}
                        onChange={(e) => handleFileSelect(e, type)}
                        accept={accept}
                        className="hidden"
                        aria-label={`Upload ${type}`}
                    />
                ))}

                {/* Upload Options Menu */}
                {showUploadOptions && (
                    <>
                        <div 
                            className="fixed inset-0 z-10"
                            onClick={handleBackdropClick}
                        />
                        <div 
                            className="absolute bottom-full left-0 mb-3 py-2 rounded-2xl shadow-2xl z-20 min-w-[200px] card glass-effect"
                            style={{ 
                                background: 'var(--card-bg)', 
                                border: '1px solid var(--card-border)',
                                animation: 'slideUp 0.2s ease-out',
                                boxShadow: 'var(--shadow-lg)'
                            }}
                        >
                            <div className="flex flex-col">
                                <UploadButton 
                                    type="document" 
                                    onClick={() => handleFileInputClick('document')}
                                    icon={FILE_ICONS.document}
                                    label="Document"
                                />
                                <UploadButton 
                                    type="image" 
                                    onClick={() => handleFileInputClick('image')}
                                    icon={FILE_ICONS.image}
                                    label="Image"
                                />
                                <UploadButton 
                                    type="pdf" 
                                    onClick={() => handleFileInputClick('pdf')}
                                    icon={FILE_ICONS.pdf}
                                    label="PDF"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div 
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full border card"
                    style={{ 
                        background: 'var(--input-bg)',
                        borderColor: 'var(--input-border)'
                    }}
                >
                    {/* Plus Icon */}
                    <button 
                        type="button"
                        onClick={toggleUploadOptions}
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 rounded-full flex-shrink-0 relative overflow-hidden group"
                        style={{ 
                            background: showUploadOptions 
                                ? 'linear-gradient(135deg, var(--user-message-bg) 0%, #6366f1 100%)' 
                                : 'var(--icon-bg)',
                            boxShadow: showUploadOptions ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                            transform: showUploadOptions ? 'scale(1.1)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!showUploadOptions) {
                                e.currentTarget.style.background = 'var(--hover-bg)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showUploadOptions) {
                                e.currentTarget.style.background = 'var(--icon-bg)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                        aria-label="Upload files"
                        title="Upload files"
                        disabled={isLoading}
                    >
                        <span 
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ 
                                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                            }}
                        />
                        <svg 
                            width="16" 
                            height="16" 
                            className="sm:w-4 sm:h-4 relative z-10 transition-all duration-300"
                            style={{
                                transform: showUploadOptions ? 'rotate(45deg)' : 'rotate(0deg)',
                            }}
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={showUploadOptions ? 'white' : 'currentColor'} 
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>

                    {/* Voice Input Button */}
                    {browserSupportsSpeechRecognition && (
                        <button 
                            type="button"
                            onClick={toggleVoiceInput}
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 rounded-full flex-shrink-0 relative overflow-hidden group"
                            style={{ 
                                background: listening 
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                    : 'var(--icon-bg)',
                                boxShadow: listening ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none',
                                transform: listening ? 'scale(1.1)' : 'scale(1)'
                            }}
                            onMouseEnter={(e) => {
                                if (!listening) {
                                    e.currentTarget.style.background = 'var(--hover-bg)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!listening) {
                                    e.currentTarget.style.background = 'var(--icon-bg)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                            aria-label={listening ? "Stop recording" : "Start voice input"}
                            title={listening ? "Stop recording" : "Voice input"}
                            disabled={isLoading}
                        >
                            <span 
                                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ 
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                }}
                            />
                            <svg 
                                width="16" 
                                height="16" 
                                className="sm:w-4 sm:h-4 relative z-10"
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke={listening ? 'white' : 'currentColor'} 
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {listening ? (
                                    <rect x="6" y="4" width="12" height="16" rx="2" />
                                ) : (
                                    <>
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                        <line x1="12" y1="19" x2="12" y2="23"/>
                                        <line x1="8" y1="23" x2="16" y2="23"/>
                                    </>
                                )}
                            </svg>
                        </button>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Write a message or use voice..."
                        className="flex-1 bg-transparent outline-none text-sm min-w-0 input-field"
                        style={{ 
                            color: 'var(--foreground)',
                            border: 'none',
                            padding: 0,
                            background: 'transparent'
                        }}
                        disabled={isLoading}
                    />

                    <button 
                        type="submit"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 rounded-full disabled:opacity-40 flex-shrink-0 hover:scale-105 focus-ring"
                        disabled={!canSubmit}
                        style={{ 
                            background: canSubmit 
                                ? 'linear-gradient(135deg, var(--user-message-bg) 0%, #6366f1 100%)' 
                                : 'var(--icon-bg)',
                            color: canSubmit ? 'white' : 'var(--foreground)',
                            boxShadow: canSubmit ? 'var(--shadow-sm)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (canSubmit) {
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (canSubmit) {
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }
                        }}
                        aria-label="Send message"
                    >
                        <svg width="16" height="16" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

// Memoized upload button component
const UploadButton = ({ type, onClick, icon, label }) => (
    <button 
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full hover:scale-[1.02] focus-ring"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--hover-bg)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
        }}
        title={`Upload ${label}`}
        aria-label={`Upload ${label}`}
    >
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded-lg transition-all duration-200" 
             style={{ background: 'var(--icon-bg)' }}>
            {icon}
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</span>
    </button>
);

export default MessageInput;
