'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// Constants
const MOBILE_BREAKPOINT = 768;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 256;
const MOBILE_SIDEBAR_WIDTH = '80%';

const Sidebar = ({ chats, activeChat, setActiveChat, createNewChat, deleteChat, isOpen, setIsOpen }) => {
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef(null);

    // Memoized mobile check function
    const checkMobile = useCallback(() => {
        const mobile = window.innerWidth < MOBILE_BREAKPOINT;
        setIsMobile(mobile);
        return mobile;
    }, []);

    // Detect mobile screen with debouncing
    useEffect(() => {
        let timeoutId;
        
        const debouncedCheckMobile = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkMobile, 100);
        };
        
        checkMobile();
        window.addEventListener('resize', debouncedCheckMobile);
        
        return () => {
            window.removeEventListener('resize', debouncedCheckMobile);
            clearTimeout(timeoutId);
        };
    }, [checkMobile]);

    // Optimized chat selection handler
    const handleChatSelect = useCallback((chatId) => {
        setActiveChat(chatId);
        if (isMobile) {
            setIsOpen(false);
        }
    }, [setActiveChat, isMobile, setIsOpen]);

    // Resize handlers with useCallback
    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing && !isMobile) {
            const newWidth = e.clientX;
            if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing, isMobile]);

    // Optimized resize effect with cleanup
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', resize, { passive: true });
            document.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, resize, stopResizing]);

    // Memoized sidebar width calculation
    const getSidebarWidth = useMemo(() => {
        if (!isOpen) return '0px';
        if (isMobile) return MOBILE_SIDEBAR_WIDTH;
        return `${sidebarWidth}px`;
    }, [isOpen, isMobile, sidebarWidth]);

    // Memoized delete handler
    const handleDeleteChat = useCallback((e, chatId) => {
        e.stopPropagation();
        deleteChat(chatId);
    }, [deleteChat]);

    // Memoized toggle handler
    const handleToggleSidebar = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    return (
        <>
            {isOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleToggleSidebar}
                />
            )}

            <div 
                ref={sidebarRef}
                className={`
                    ${isMobile ? 'fixed' : 'relative'}
                    inset-y-0 left-0 z-50
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${!isMobile && !isOpen ? 'w-0' : ''}
                    transition-all duration-300 
                    border-r flex flex-col overflow-hidden
                `}
                style={{ 
                    borderColor: 'var(--card-border)', 
                    background: 'var(--sidebar-bg)',
                    width: getSidebarWidth,
                    maxWidth: isMobile ? MOBILE_SIDEBAR_WIDTH : `${MAX_SIDEBAR_WIDTH}px`,
                    minWidth: !isMobile && isOpen ? `${MIN_SIDEBAR_WIDTH}px` : undefined,
                }}
            >
                <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'var(--icon-bg)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>ChatBot</span>
                    </div>
                    <button
                        onClick={handleToggleSidebar}
                        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
                        style={{ background: 'var(--icon-bg)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--icon-bg)'}
                        aria-label="Toggle sidebar"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                        style={{ background: 'var(--icon-bg)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--icon-bg)'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span className="font-medium text-sm">New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            className="group flex items-center justify-between px-3 py-2 mb-1 rounded-lg cursor-pointer transition-all"
                            style={{ 
                                background: activeChat === chat.id ? 'var(--active-chat-bg)' : 'transparent',
                                opacity: activeChat === chat.id ? 1 : 0.7
                            }}
                            onMouseEnter={(e) => {
                                if (activeChat !== chat.id) {
                                    e.currentTarget.style.background = 'var(--hover-bg)';
                                    e.currentTarget.style.opacity = 1;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeChat !== chat.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.opacity = 0.7;
                                }
                            }}
                            onClick={() => handleChatSelect(chat.id)}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <svg width="14" height="14" className="flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span className="text-sm truncate">{chat.title}</span>
                            </div>
                            <button
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-all flex-shrink-0 ml-2"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--delete-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                aria-label="Delete chat"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {isOpen && !isMobile && (
                    <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10 group"
                        onMouseDown={startResizing}
                        style={{ 
                            background: isResizing ? 'var(--user-message-bg)' : 'transparent'
                        }}
                    >
                        <div 
                            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-12 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'var(--user-message-bg)' }}
                        />
                    </div>
                )}
            </div>

            {!isOpen && !isMobile && (
                <button
                    onClick={handleToggleSidebar}
                    className="fixed top-4 left-4 w-10 h-10 flex items-center justify-center rounded-lg transition-colors z-30"
                    style={{ background: 'var(--icon-bg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--icon-bg)'}
                    aria-label="Open sidebar"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
            )}
        </>
    );
};

export default Sidebar;
