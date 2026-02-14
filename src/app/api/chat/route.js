import { NextResponse } from 'next/server';

/**
 * AI Provider Configuration
 * Optimized for rapid responses
 */
const AI_PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        model: 'gemini-2.5-flash', // Fastest model
        apiVersion: 'v1beta',
        baseUrl: 'https://generativelanguage.googleapis.com',
        temperature: 0.7,
        maxTokens: 1024, // Reduced for faster responses
        topP: 0.95,
        topK: 40,
    },
    openai: {
        name: 'OpenAI',
        model: 'gpt-4o-mini', // Fast and efficient
        endpoint: 'https://api.openai.com/v1/chat/completions',
        temperature: 0.7,
        maxTokens: 1024, // Reduced for faster responses
    }
};

/**
 * System Prompt - Optimized for concise responses
 */
const SYSTEM_PROMPT = `You are a helpful AI assistant. Provide clear, concise, and direct answers. Be brief but informative.`;

/**
 * Google Gemini API Integration
 * Uses latest Gemini 2.5 Flash model with proper error handling
 */
async function callGeminiAPI(userMessage, conversationHistory = []) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    // Build conversation context with system prompt
    let conversationText = `${SYSTEM_PROMPT}\n\n`;

    // Add only last 3 messages for faster processing
    if (conversationHistory?.length > 0) {
        const recentHistory = conversationHistory.slice(-3);
        recentHistory.forEach(msg => {
            const role = msg.sender === 'user' ? 'User' : 'Assistant';
            conversationText += `${role}: ${msg.text}\n\n`;
        });
    }

    // Add current user message
    conversationText += `User: ${userMessage}\n\nAssistant:`;

    // Construct API URL
    const url = `${AI_PROVIDERS.gemini.baseUrl}/${AI_PROVIDERS.gemini.apiVersion}/models/${AI_PROVIDERS.gemini.model}:generateContent?key=${apiKey}`;

    console.log(`🔵 Calling ${AI_PROVIDERS.gemini.name} (${AI_PROVIDERS.gemini.model})`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: conversationText }]
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
        const errorData = await response.json();
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        console.error(`❌ Gemini API Error:`, errorMsg);
        throw new Error(`Gemini API failed: ${errorMsg}`);
    }

    const data = await response.json();
    
    // Extract AI response with validation
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
        console.error('❌ No response text in Gemini response:', JSON.stringify(data, null, 2));
        throw new Error('Gemini returned empty response');
    }

    console.log(`✅ Gemini response received (${aiResponse.length} chars)`);
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

    // Add only last 3 messages for faster processing
    if (conversationHistory?.length > 0) {
        const recentHistory = conversationHistory.slice(-3);
        recentHistory.forEach(msg => {
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

    console.log(`🟢 Calling ${AI_PROVIDERS.openai.name} (${AI_PROVIDERS.openai.model})`);

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
        const errorData = await response.json();
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        console.error(`❌ OpenAI API Error:`, errorMsg);
        throw new Error(`OpenAI API failed: ${errorMsg}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
        console.error('❌ No response in OpenAI data:', JSON.stringify(data, null, 2));
        throw new Error('OpenAI returned empty response');
    }

    console.log(`✅ OpenAI response received (${aiResponse.length} chars)`);
    return aiResponse.trim();
}

/**
 * Main POST Handler
 * Implements intelligent fallback strategy: Gemini → OpenAI → Error
 */
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        // Parse and validate request
        const { message, conversationHistory } = await request.json();

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Valid message is required' },
                { status: 400 }
            );
        }

        const userMessage = message.trim();
        
        // Check available API keys
        const hasGemini = !!process.env.GOOGLE_AI_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;

        console.log('\n📨 New chat request');
        console.log(`   Message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
        console.log(`   History: ${conversationHistory?.length || 0} messages`);
        console.log(`   Available: Gemini=${hasGemini}, OpenAI=${hasOpenAI}`);

        if (!hasGemini && !hasOpenAI) {
            return NextResponse.json({
                response: 'No AI provider configured. Please add GOOGLE_AI_API_KEY or OPENAI_API_KEY to your .env.local file.',
                provider: 'error',
                error: 'No API keys configured',
                timestamp: new Date().toISOString()
            }, { status: 503 });
        }

        let aiResponse = null;
        let provider = null;
        let errors = [];

        // Strategy 1: Try Gemini first (FREE, fast, high quality)
        if (hasGemini) {
            try {
                aiResponse = await callGeminiAPI(userMessage, conversationHistory);
                provider = 'gemini';
            } catch (geminiError) {
                console.error(`❌ Gemini failed: ${geminiError.message}`);
                errors.push({ provider: 'gemini', error: geminiError.message });
            }
        }

        // Strategy 2: Fallback to OpenAI if Gemini failed
        if (!aiResponse && hasOpenAI) {
            try {
                aiResponse = await callOpenAIAPI(userMessage, conversationHistory);
                provider = 'openai';
            } catch (openaiError) {
                console.error(`❌ OpenAI failed: ${openaiError.message}`);
                errors.push({ provider: 'openai', error: openaiError.message });
            }
        }

        // If both failed, return detailed error
        if (!aiResponse) {
            const errorDetails = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
            console.error('❌ All providers failed');
            
            return NextResponse.json({
                response: 'AI service temporarily unavailable. Please try again in a moment.',
                provider: 'error',
                error: errorDetails,
                timestamp: new Date().toISOString()
            }, { status: 503 });
        }

        // Success! Return AI response
        const duration = Date.now() - startTime;
        console.log(`✅ Response generated in ${duration}ms via ${provider}`);

        return NextResponse.json({
            response: aiResponse,
            provider: provider,
            model: provider === 'gemini' ? AI_PROVIDERS.gemini.model : AI_PROVIDERS.openai.model,
            timestamp: new Date().toISOString(),
            responseTime: duration,
            messageLength: aiResponse.length
        });

    } catch (error) {
        console.error('💥 Unexpected error:', error);
        
        return NextResponse.json({
            response: 'An unexpected error occurred. Please try again.',
            provider: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
