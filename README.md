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

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and AI
