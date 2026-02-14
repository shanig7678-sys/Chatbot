'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import SettingsModal from './SettingsModal';

// Constants
const MOBILE_BREAKPOINT = 768;
const DEFAULT_SETTINGS = {
    userName: 'User',
    fontSize: 'medium',
    messageLimit: 50,
};

const ChatInterface = () => {
    // State management
    const [theme, setTheme] = useState('light');
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Memoized values
    const currentChat = useMemo(() => 
        chats.find(chat => chat.id === activeChat), 
        [chats, activeChat]
    );

    const hasMessages = useMemo(() => 
        currentChat?.messages?.length > 0, 
        [currentChat]
    );

    // Handle client-side mounting
    useEffect(() => {
        setIsMounted(true);
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('chatbot-settings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Failed to parse saved settings:', error);
            }
        }
    }, []);

    // Responsive sidebar handling
    useEffect(() => {
        if (!isMounted) return;
        
        const handleResize = () => {
            const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsSidebarOpen(!isMobile);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMounted]);

    // Optimized handlers
    const handleSaveSettings = useCallback((newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('chatbot-settings', JSON.stringify(newSettings));
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    const createNewChat = useCallback(() => {
        const newChat = {
            id: Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date()
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat.id);
    }, []);

    const deleteChat = useCallback((chatId) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) {
            setActiveChat(null);
        }
    }, [activeChat]);

    const handleSendMessage = useCallback(async (message) => {
        let chatId = activeChat;

        if (!chatId) {
            const newChat = {
                id: Date.now(),
                title: message.slice(0, 30),
                messages: [],
                createdAt: new Date()
            };
            setChats(prev => [newChat, ...prev]);
            chatId = newChat.id;
            setActiveChat(chatId);
        }

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: message,
            sender: 'user',
            timestamp: new Date(),
        };

        setChats(prev => 
            prev.map(chat => 
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, userMessage].slice(-settings.messageLimit),
                        title: chat.messages.length === 0 ? message.slice(0, 30) : chat.title
                    }
                    : chat
            )
        );

        setIsLoading(true);

        // Get AI response
        try {
            // Get conversation history for context
            const currentChatData = chats.find(c => c.id === chatId);
            const conversationHistory = currentChatData?.messages || [];

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversationHistory: conversationHistory.slice(-3) // Only last 3 messages for speed
                }),
            });

            const data = await response.json();

            // Always show the response, even if there was an error
            const botMessage = {
                id: Date.now() + 1,
                text: data.response || 'Sorry, I could not generate a response.',
                sender: 'bot',
                timestamp: new Date(),
                provider: data.provider || 'unknown'
            };

            setChats(prev => 
                prev.map(chat => 
                    chat.id === chatId
                        ? { ...chat, messages: [...chat.messages, botMessage].slice(-settings.messageLimit) }
                        : chat
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Add friendly error message
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };

            setChats(prev => 
                prev.map(chat => 
                    chat.id === chatId
                        ? { ...chat, messages: [...chat.messages, errorMessage].slice(-settings.messageLimit) }
                        : chat
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [activeChat, chats, settings.messageLimit]);

    // Don't render until mounted to prevent hydration issues
    if (!isMounted) {
        return null;
    }

    return (
        <div className={theme}>
            <div className="fixed inset-0 transition-colors duration-300 flex overflow-hidden" style={{ background: 'var(--background)' }}>
                <Sidebar 
                    chats={chats}
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                    createNewChat={createNewChat}
                    deleteChat={deleteChat}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center">
                            {!isSidebarOpen && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
                                    style={{ background: 'var(--icon-bg)' }}
                                    aria-label="Open menu"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="3" y1="12" x2="21" y2="12"/>
                                        <line x1="3" y1="6" x2="21" y2="6"/>
                                        <line x1="3" y1="18" x2="21" y2="18"/>
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-opacity-80 transition-all group" 
                                style={{ background: 'var(--icon-bg)' }}
                                aria-label="Open settings"
                            >
                                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>

                            <button 
                                onClick={toggleTheme}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-opacity-80 transition-colors" 
                                style={{ background: 'var(--icon-bg)' }}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"/>
                                        <line x1="12" y1="1" x2="12" y2="3"/>
                                        <line x1="12" y1="21" x2="12" y2="23"/>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                        <line x1="1" y1="12" x2="3" y2="12"/>
                                        <line x1="21" y1="12" x2="23" y2="12"/>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-6">
                        {!activeChat || !hasMessages ? (
                            <div className="h-full flex items-center justify-center py-8">
                                <WelcomeScreen userName={settings.userName} fontSize={settings.fontSize} />
                            </div>
                        ) : (
                            <div className="pb-4">
                                <ChatMessages 
                                    messages={currentChat.messages} 
                                    isLoading={isLoading}
                                    fontSize={settings.fontSize}
                                />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t" style={{ borderColor: 'var(--card-border)', background: 'var(--background)' }}>
                        <MessageInput 
                            onSendMessage={handleSendMessage} 
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <SettingsModal 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    settings={settings}
                    onSave={handleSaveSettings}
                />
            </div>
        </div>
    );
};

export default ChatInterface;
