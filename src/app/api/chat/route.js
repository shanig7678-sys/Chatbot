import { NextResponse } from 'next/server';

/**
 * AI Provider Configuration - Enterprise Grade
 * Optimized for reliability and performance
 */
const AI_PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        model: 'gemini-2.5-flash',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        temperature: 0.8,
        maxTokens: 2048,
        topP: 0.95,
        topK: 40,
    },
    openai: {
        name: 'OpenAI',
        model: 'gpt-4o-mini',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        temperature: 0.8,
        maxTokens: 2048,
    }
};

/**
 * Enhanced System Prompt - Professional AI Assistant
 * Optimized for natural, helpful, and engaging conversations
 */
const SYSTEM_PROMPT = `You are an intelligent, helpful, and friendly AI assistant. Your responses should be:

1. CLEAR & CONCISE: Get to the point quickly while being thorough
2. NATURAL: Write like a knowledgeable human, not a robot
3. HELPFUL: Anticipate follow-up questions and provide actionable information
4. ACCURATE: If you're unsure, say so rather than guessing
5. ENGAGING: Use examples and analogies when helpful

Adapt your tone to match the user's style - be professional for technical questions, casual for general chat, and empathetic when appropriate.`;

/**
 * Format conversation history for context
 */
function formatConversationHistory(history) {
    if (!Array.isArray(history) || history.length === 0) {
        return '';
    }

    return history
        .slice(-5) // Last 5 messages for better context
        .map(msg => {
            const role = msg.sender === 'user' ? 'User' : 'Assistant';
            return `${role}: ${msg.text}`;
        })
        .join('\n\n');
}

/**
 * Google Gemini API Integration
 * Uses Gemini 1.5 Flash with proper error handling
 */
async function callGeminiAPI(userMessage, conversationHistory = []) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    // Build conversation context
    const historyText = formatConversationHistory(conversationHistory);
    const fullPrompt = historyText 
        ? `${SYSTEM_PROMPT}\n\n${historyText}\n\nUser: ${userMessage}\n\nAssistant:`
        : `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Construct API URL - Fixed endpoint
    const url = `${AI_PROVIDERS.gemini.baseUrl}/${AI_PROVIDERS.gemini.model}:generateContent?key=${apiKey}`;

    console.log('🔵 Calling Gemini API:', AI_PROVIDERS.gemini.model);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: AI_PROVIDERS.gemini.temperature,
                maxOutputTokens: AI_PROVIDERS.gemini.maxTokens,
                topP: AI_PROVIDERS.gemini.topP,
                topK: AI_PROVIDERS.gemini.topK,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract AI response with validation
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
        console.error('❌ No response text in Gemini response');
        throw new Error('Gemini returned empty response');
    }

    console.log('✅ Gemini response received:', aiResponse.length, 'chars');
    return aiResponse.trim();
}

/**
 * OpenAI API Integration
 * Uses gpt-4o-mini for cost-effective high-quality responses
 */
async function callOpenAIAPI(userMessage, conversationHistory = []) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    // Build messages array with proper role structure
    const messages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT
        }
    ];

    // Add conversation history
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        conversationHistory.slice(-5).forEach(msg => {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });
    }

    // Add current user message
    messages.push({
        role: 'user',
        content: userMessage
    });

    console.log('🟢 Calling OpenAI API:', AI_PROVIDERS.openai.model);

    const response = await fetch(AI_PROVIDERS.openai.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: AI_PROVIDERS.openai.model,
            messages: messages,
            temperature: AI_PROVIDERS.openai.temperature,
            max_tokens: AI_PROVIDERS.openai.maxTokens,
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error:', response.status, errorText);
        throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
        console.error('❌ No response in OpenAI data');
        throw new Error('OpenAI returned empty response');
    }

    console.log('✅ OpenAI response received:', aiResponse.length, 'chars');
    return aiResponse.trim();
}

/**
 * Main POST Handler
 * Implements intelligent fallback: OpenAI → Gemini → Error
 */
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        // Parse and validate request
        const body = await request.json();
        const { message, conversationHistory } = body;

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📨 New Chat Request');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            console.error('❌ Invalid message received');
            return NextResponse.json(
                { 
                    response: 'Please provide a valid message.',
                    error: 'Invalid message',
                    provider: 'error'
                },
                { status: 400 }
            );
        }

        const userMessage = message.trim();
        console.log('📝 Message:', userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''));
        console.log('📚 History:', conversationHistory?.length || 0, 'messages');
        
        // Check available API keys
        const hasGemini = !!process.env.GOOGLE_AI_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;

        console.log('🔑 API Keys:', { Gemini: hasGemini, OpenAI: hasOpenAI });

        if (!hasGemini && !hasOpenAI) {
            console.error('❌ No API keys configured');
            return NextResponse.json({
                response: '⚠️ No AI provider configured. Please add GOOGLE_AI_API_KEY or OPENAI_API_KEY to your .env.local file.',
                provider: 'error',
                error: 'No API keys configured'
            }, { status: 503 });
        }

        let aiResponse = null;
        let provider = null;
        let errors = [];

        // Strategy 1: Try Gemini first (FREE and working!)
        if (hasGemini) {
            try {
                aiResponse = await callGeminiAPI(userMessage, conversationHistory);
                provider = 'gemini';
            } catch (geminiError) {
                console.error('❌ Gemini failed:', geminiError.message);
                errors.push({ provider: 'gemini', error: geminiError.message });
            }
        }

        // Strategy 2: Fallback to OpenAI if Gemini failed
        if (!aiResponse && hasOpenAI) {
            try {
                aiResponse = await callOpenAIAPI(userMessage, conversationHistory);
                provider = 'openai';
            } catch (openaiError) {
                console.error('❌ OpenAI failed:', openaiError.message);
                errors.push({ provider: 'openai', error: openaiError.message });
            }
        }

        // If both failed, return detailed error
        if (!aiResponse) {
            const errorDetails = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
            console.error('❌ All providers failed:', errorDetails);
            
            return NextResponse.json({
                response: '⚠️ AI service temporarily unavailable. Please try again in a moment.',
                provider: 'error',
                error: errorDetails
            }, { status: 503 });
        }

        // Success!
        const duration = Date.now() - startTime;
        console.log('✅ Success! Provider:', provider, '| Duration:', duration + 'ms');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return NextResponse.json({
            response: aiResponse,
            provider: provider,
            model: provider === 'gemini' ? AI_PROVIDERS.gemini.model : AI_PROVIDERS.openai.model,
            responseTime: duration
        });

    } catch (error) {
        console.error('💥 Unexpected error:', error);
        
        return NextResponse.json({
            response: '⚠️ An unexpected error occurred. Please try again.',
            provider: 'error',
            error: error.message
        }, { status: 500 });
    }
}
