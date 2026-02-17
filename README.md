# AI Chatbot - Next.js

A modern, feature-rich AI chatbot built with Next.js 16 and React 19, featuring dual AI provider support with intelligent fallback, voice capabilities, and persistent chat history.

## Architecture Overview

This is a Next.js chatbot application using the App Router architecture, with AI-powered conversations through Google Gemini (primary) and OpenAI (fallback) APIs.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **AI Providers**: 
  - Google Gemini API (primary, free)
  - OpenAI API (fallback, paid)
- **Voice Features**: 
  - Web Speech API (speech-to-text)
  - Speech Synthesis API (text-to-speech)
- **Storage**: Browser localStorage

## Data Flow

### 1. User Input → MessageInput.js
- Accepts text input or voice recognition
- Supports file attachments (images, PDFs, documents)
- Validates input and sends to ChatInterface

### 2. State Management → ChatInterface.js (Main Orchestrator)
- Manages all chats, active chat, and settings
- Stores data in localStorage for persistence
- Creates new chat if none exists
- Adds user message to state immediately
- Triggers API call

### 3. API Request → /api/chat/route.js
- **Receives**: User message + last 3 messages (conversation history)
- **Strategy**: 
  1. Tries Gemini API first (free, fast)
  2. Falls back to OpenAI if Gemini fails
  3. Returns error if both fail
- **Returns**: AI response with provider info and response time

### 4. Response Handling → ChatInterface.js
- Receives AI response from API
- Adds bot message to chat state
- Updates localStorage automatically
- Triggers component re-render

### 5. Display → ChatMessages.js
- Renders message bubbles (user/bot)
- Text-to-speech for bot messages
- Provider badges (Gemini/OpenAI)
- Loading animation while waiting

## Component Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js          # AI API handler (Gemini + OpenAI)
│   ├── globals.css               # Global styles & CSS variables
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page
│
└── components/
    ├── ChatInterface.js          # Main orchestrator (state management)
    ├── ChatMessages.js           # Message display with TTS
    ├── MessageInput.js           # Input with voice recognition
    ├── Sidebar.js                # Chat history & navigation
    ├── SettingsModal.js          # User preferences
    ├── WelcomeScreen.js          # Initial greeting
    └── Header.js                 # App header
```

## Key Features

### Chat Management (Sidebar.js)
- Create new conversations
- View chat history
- Delete individual chats
- Clear all chats
- Resizable sidebar (desktop)
- Mobile-responsive overlay

### User Settings (SettingsModal.js)
- Customize user name
- Adjust font size (small/medium/large)
- Set message history limit (10-100 messages)
- All settings stored in localStorage

### Voice Capabilities
- **Speech-to-Text** (MessageInput.js)
  - Real-time voice input
  - Microphone permission handling
  - Live transcript display
  
- **Text-to-Speech** (ChatMessages.js)
  - Read bot messages aloud
  - Playback controls (play/pause)
  - Configurable voice settings

### File Attachments (MessageInput.js)
- Upload images (image/*)
- Upload PDFs (.pdf)
- Upload documents (.doc, .docx, .txt)
- 10MB file size limit
- Visual file preview

## Storage Strategy

All data persists in browser localStorage:

| Key | Content |
|-----|---------|
| `chatbot-chats` | All conversation history |
| `chatbot-active-chat` | Currently selected chat ID |
| `chatbot-settings` | User preferences (name, font, limits) |
| `chatbot-theme` | Theme preference (light/dark) |

## AI Provider Strategy

The chatbot uses an intelligent fallback system:

```
User Message
    ↓
Try Gemini API (Free, Fast)
    ↓
Success? → Return Response
    ↓ Fail
Try OpenAI API (Paid, Reliable)
    ↓
Success? → Return Response
    ↓ Fail
Return Error Message
```

### Provider Configuration

**Google Gemini** (Primary)
- Model: `gemini-2.5-flash`
- Temperature: 0.8
- Max Tokens: 2048
- Cost: FREE
- Speed: Fast

**OpenAI** (Fallback)
- Model: `gpt-4o-mini`
- Temperature: 0.8
- Max Tokens: 2048
- Cost: Paid (usage-based)
- Speed: Moderate

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd chatbot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:

```env
# Google Gemini API Key (FREE - Recommended)
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (Paid - Fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

**Get API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

## Usage

### Starting a Conversation
1. Type a message in the input field or click the microphone icon for voice input
2. Press Enter or click the send button
3. The AI will respond using Gemini (or OpenAI as fallback)

### Managing Chats
- Click "New Chat" to start a fresh conversation
- Select previous chats from the sidebar
- Delete individual chats with the trash icon
- Clear all chats with "Clear All Chats" button

### Voice Features
- **Voice Input**: Click microphone icon, speak your message
- **Voice Output**: Click speaker icon on bot messages to hear them read aloud

### Customization
1. Click the settings icon (gear) in the header
2. Adjust your preferences:
   - Change your display name
   - Select font size
   - Set message history limit
3. Click "Save Changes"

## API Endpoints

### POST /api/chat

Processes user messages and returns AI responses.

**Request Body:**
```json
{
  "message": "User's message text",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Previous message",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI generated response",
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "responseTime": 1234
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Safari**: Full support
- **Firefox**: Limited voice recognition support
- **Mobile**: Responsive design, touch-optimized

## Performance Optimizations

- React.memo for component memoization
- useCallback for stable function references
- useMemo for expensive computations
- Lazy loading for modals
- Debounced resize handlers
- Optimized re-renders with proper dependencies

## Security Features

- API keys stored in environment variables
- Input validation and sanitization
- File size limits (10MB)
- XSS protection through React
- CORS handling in API routes

## Troubleshooting

### Voice recognition not working
- Ensure you're using Chrome, Edge, or Safari
- Grant microphone permissions when prompted
- Check browser console for errors

### API errors
- Verify API keys in `.env.local`
- Check API key validity and quotas
- Review browser console and server logs

### Chat history not persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Ensure localStorage quota not exceeded

## Future Enhancements

- [ ] Multi-language support
- [ ] Export chat history
- [ ] Custom AI model selection
- [ ] Image generation capabilities
- [ ] Code syntax highlighting
- [ ] Markdown rendering
- [ ] User authentication
- [ ] Cloud storage sync

## License

This project is open source and available under the Muhammad Abdullah License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and AI

## Detailed Package & Module Explanation

### Core Dependencies

#### 1. Next.js (v16.1.6)
Next.js is the React framework that powers this application. It provides:
- **App Router**: Modern routing system using the `src/app` directory structure
- **Server Components**: Optimized rendering with React Server Components
- **API Routes**: Built-in API endpoints (`src/app/api/chat/route.js`)
- **File-based Routing**: Automatic routing based on file structure
- **Optimizations**: Automatic code splitting, image optimization, and font optimization

**How it works in this project:**
- `src/app/layout.js`: Root layout wrapping all pages, defines metadata and fonts
- `src/app/page.js`: Home page that renders the ChatInterface component
- `src/app/api/chat/route.js`: API endpoint handling AI requests
- `next.config.mjs`: Configuration file for Next.js settings

#### 2. React (v19.2.3) & React-DOM (v19.2.3)
React is the UI library for building component-based interfaces.

**Key React features used:**
- **Hooks**: useState, useEffect, useCallback, useMemo, useRef
- **Client Components**: All components use `'use client'` directive for interactivity
- **State Management**: Local state with useState, persistent state with localStorage
- **Performance Optimization**: 
  - `useCallback`: Memoizes functions to prevent unnecessary re-renders
  - `useMemo`: Memoizes computed values
  - `React.memo`: Prevents component re-renders when props haven't changed

**Component hierarchy:**
```
page.js
  └── ChatInterface.js (Main orchestrator)
      ├── Sidebar.js (Chat history)
      ├── WelcomeScreen.js (Initial view)
      ├── ChatMessages.js (Message display)
      ├── MessageInput.js (User input)
      └── SettingsModal.js (User preferences)
```

#### 3. Tailwind CSS (v4)
Utility-first CSS framework for styling.

**How it works:**
- `postcss.config.mjs`: PostCSS configuration for Tailwind
- `src/app/globals.css`: Global styles with CSS custom properties (variables)
- Utility classes: Applied directly in JSX (e.g., `className="flex items-center gap-2"`)
- Responsive design: Mobile-first with breakpoints (sm:, md:, lg:)
- Dark mode: CSS variables change based on theme state

**CSS Variables used:**
```css
--background: Main background color
--foreground: Primary text color
--card-bg: Card/modal background
--card-border: Border colors
--user-message-bg: User message bubble color
--bot-message-bg: Bot message bubble color
--icon-bg: Icon button backgrounds
--hover-bg: Hover state backgrounds
```

#### 4. react-speech-recognition (v4.0.1)
Provides Web Speech API integration for voice input.

**How it works in MessageInput.js:**
```javascript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Hook provides transcript and control functions
const { transcript, listening, resetTranscript } = useSpeechRecognition();

// Start listening
SpeechRecognition.startListening({ continuous: true });

// Stop listening
SpeechRecognition.stopListening();
```

**Features:**
- Real-time speech-to-text conversion
- Continuous listening mode
- Browser compatibility detection
- Microphone permission handling

#### 5. regenerator-runtime (v0.14.1)
Polyfill for async/await syntax in older browsers.

**Why it's needed:**
- Speech recognition uses async operations
- Ensures compatibility with browsers that don't support ES2017+ features
- Imported in `layout.js`: `import 'regenerator-runtime/runtime'`

### Development Dependencies

#### 1. ESLint (v9) & eslint-config-next (v16.1.6)
Code linting and quality enforcement.

**Configuration in `eslint.config.mjs`:**
- Uses Next.js recommended rules
- Ignores build directories (.next, out, build)
- Enforces code consistency and catches errors

**Run linting:**
```bash
npm run lint
```

#### 2. @tailwindcss/postcss (v4)
PostCSS plugin for Tailwind CSS v4.

**How it works:**
- Processes Tailwind directives in CSS files
- Generates utility classes at build time
- Configured in `postcss.config.mjs`

### Project Architecture Deep Dive

#### State Management Flow

**1. Initial Load (ChatInterface.js)**
```javascript
useEffect(() => {
  // Load from localStorage
  const savedChats = localStorage.getItem('chatbot-chats');
  const savedActiveChat = localStorage.getItem('chatbot-active-chat');
  const savedSettings = localStorage.getItem('chatbot-settings');
  const savedTheme = localStorage.getItem('chatbot-theme');
  
  // Parse and set state
  setChats(JSON.parse(savedChats));
  setActiveChat(Number(savedActiveChat));
  setSettings(JSON.parse(savedSettings));
  setTheme(savedTheme);
}, []);
```

**2. State Updates**
```javascript
// Automatic persistence
useEffect(() => {
  if (isMounted && chats.length > 0) {
    localStorage.setItem('chatbot-chats', JSON.stringify(chats));
  }
}, [chats, isMounted]);
```

**3. Message Flow**
```
User types message
  ↓
MessageInput.js captures input
  ↓
handleSendMessage() in ChatInterface.js
  ↓
Add user message to state immediately
  ↓
Send POST request to /api/chat
  ↓
API tries Gemini → fallback to OpenAI
  ↓
Receive AI response
  ↓
Add bot message to state
  ↓
Auto-save to localStorage
  ↓
ChatMessages.js re-renders with new message
```

#### API Route Architecture

**File: `src/app/api/chat/route.js`**

**1. Provider Configuration**
```javascript
const AI_PROVIDERS = {
  gemini: {
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    temperature: 0.8,
    maxTokens: 2048
  },
  openai: {
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    temperature: 0.8,
    maxTokens: 2048
  }
};
```

**2. Request Processing**
```javascript
export async function POST(request) {
  // Parse request body
  const { message, conversationHistory } = await request.json();
  
  // Try Gemini first (free)
  try {
    const response = await callGeminiAPI(message, conversationHistory);
    return NextResponse.json({ response, provider: 'gemini' });
  } catch (error) {
    // Fallback to OpenAI
    try {
      const response = await callOpenAIAPI(message, conversationHistory);
      return NextResponse.json({ response, provider: 'openai' });
    } catch (error) {
      // Return error
      return NextResponse.json({ error: 'All providers failed' }, { status: 503 });
    }
  }
}
```

**3. Conversation Context**
```javascript
function formatConversationHistory(history) {
  return history
    .slice(-5) // Last 5 messages for context
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n\n');
}
```

#### Component Communication

**Parent-Child Props Flow:**
```
ChatInterface (Parent)
  ├── Sidebar
  │   ├── chats (read)
  │   ├── activeChat (read)
  │   ├── setActiveChat (callback)
  │   ├── createNewChat (callback)
  │   ├── deleteChat (callback)
  │   └── clearAllChats (callback)
  │
  ├── ChatMessages
  │   ├── messages (read)
  │   ├── isLoading (read)
  │   └── fontSize (read)
  │
  ├── MessageInput
  │   ├── onSendMessage (callback)
  │   └── isLoading (read)
  │
  └── SettingsModal
      ├── isOpen (read)
      ├── onClose (callback)
      ├── settings (read)
      └── onSave (callback)
```

#### Performance Optimizations

**1. Memoization**
```javascript
// Memoize computed values
const currentChat = useMemo(() => 
  chats.find(chat => chat.id === activeChat), 
  [chats, activeChat]
);

// Memoize callbacks
const handleSendMessage = useCallback(async (message) => {
  // ... implementation
}, [activeChat, chats, settings.messageLimit]);
```

**2. Conditional Rendering**
```javascript
// Prevent hydration issues
if (!isMounted) return null;

// Lazy load modals
{isSettingsOpen && <SettingsModal />}
```

**3. Event Handler Optimization**
```javascript
// Debounced resize handler
useEffect(() => {
  let timeoutId;
  const debouncedCheckMobile = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(checkMobile, 100);
  };
  window.addEventListener('resize', debouncedCheckMobile);
  return () => {
    window.removeEventListener('resize', debouncedCheckMobile);
    clearTimeout(timeoutId);
  };
}, [checkMobile]);
```

#### Browser APIs Used

**1. Web Speech API (Speech-to-Text)**
- **Location**: MessageInput.js
- **Browser Support**: Chrome, Edge, Safari
- **Usage**: Real-time voice transcription

**2. Speech Synthesis API (Text-to-Speech)**
- **Location**: ChatMessages.js
- **Browser Support**: All modern browsers
- **Usage**: Read bot messages aloud

**3. localStorage API**
- **Location**: ChatInterface.js
- **Browser Support**: All modern browsers
- **Usage**: Persist chats, settings, theme

**4. File API**
- **Location**: MessageInput.js
- **Browser Support**: All modern browsers
- **Usage**: Handle file uploads (images, PDFs, documents)

### Environment Variables

**Required in `.env.local`:**

```env
# Primary AI Provider (FREE)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Fallback AI Provider (Paid)
OPENAI_API_KEY=your_openai_api_key
```

**How they're accessed:**
```javascript
// Server-side only (API routes)
const geminiKey = process.env.GOOGLE_AI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
```

**Security:**
- Environment variables are only accessible server-side
- Never exposed to client-side JavaScript
- API keys remain secure

### Build & Deployment

**Development:**
```bash
npm run dev  # Starts dev server on http://localhost:3000
```

**Production Build:**
```bash
npm run build  # Creates optimized production build
npm start      # Runs production server
```

**Build Output:**
- `.next/`: Compiled Next.js application
- Static assets optimized and minified
- Server-side rendering enabled
- Automatic code splitting per route

### File Structure Explained

```
chatbot/
├── .env.local              # Environment variables (API keys)
├── .env.example            # Template for environment variables
├── package.json            # Dependencies and scripts
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS/Tailwind configuration
├── eslint.config.mjs       # ESLint rules
├── jsconfig.json           # JavaScript compiler options
│
├── src/
│   ├── app/
│   │   ├── layout.js       # Root layout (fonts, metadata)
│   │   ├── page.js         # Home page
│   │   ├── globals.css     # Global styles & CSS variables
│   │   │
│   │   └── api/
│   │       └── chat/
│   │           └── route.js  # AI chat API endpoint
│   │
│   └── components/
│       ├── ChatInterface.js    # Main app logic & state
│       ├── Sidebar.js          # Chat history navigation
│       ├── ChatMessages.js     # Message display & TTS
│       ├── MessageInput.js     # Text/voice input & files
│       ├── SettingsModal.js    # User preferences
│       ├── WelcomeScreen.js    # Initial greeting
│       └── Header.js           # App header
│
├── .next/                  # Build output (auto-generated)
├── node_modules/           # Installed packages
└── public/                 # Static assets (if any)
```

### Key Concepts

**1. Server vs Client Components**
- **Server Components**: Default in Next.js 16, render on server
- **Client Components**: Use `'use client'` directive, run in browser
- This app uses client components for interactivity

**2. Hydration**
- Server renders initial HTML
- React "hydrates" it with interactivity on client
- `isMounted` state prevents hydration mismatches

**3. API Routes**
- Server-side endpoints in Next.js
- Located in `app/api/` directory
- Can access environment variables securely

**4. CSS Custom Properties**
- Dynamic theming with CSS variables
- Change values based on light/dark theme
- Smooth transitions between themes

**5. localStorage Persistence**
- Browser storage for client-side data
- Survives page refreshes
- Limited to ~5-10MB per domain

### Common Workflows

**Adding a New Feature:**
1. Create component in `src/components/`
2. Import and use in `ChatInterface.js`
3. Add state management if needed
4. Style with Tailwind classes
5. Test in browser

**Modifying AI Behavior:**
1. Edit `src/app/api/chat/route.js`
2. Update `SYSTEM_PROMPT` for personality changes
3. Adjust `temperature` for creativity (0.0-1.0)
4. Change `maxTokens` for response length

**Changing Styles:**
1. Edit CSS variables in `src/app/globals.css`
2. Modify Tailwind classes in components
3. Add custom CSS if needed

**Adding New AI Provider:**
1. Add provider config to `AI_PROVIDERS`
2. Create `callProviderAPI()` function
3. Add to fallback chain in `POST()` handler
4. Add API key to `.env.local`

This comprehensive documentation covers all packages, modules, architecture, and how everything works together in your AI chatbot project.
