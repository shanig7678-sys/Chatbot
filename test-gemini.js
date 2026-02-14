// Quick test script to verify Gemini API is working
// Run with: node test-gemini.js

const GEMINI_API_KEY = 'AIzaSyA9Uy3SUZVJmN0-uXLz8dawMvF3kg9e0Lg';
const MODEL = 'gemini-pro';
const API_VERSION = 'v1beta';

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API Integration...\n');
    console.log(`Model: ${MODEL}`);
    console.log(`API Version: ${API_VERSION}\n`);

    try {
        // Test 1: Simple greeting
        console.log('Test 1: Simple greeting');
        const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response1 = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Hello! Please introduce yourself in one sentence.' }]
                }]
            })
        });

        if (!response1.ok) {
            const error = await response1.json();
            console.error('❌ Test 1 Failed:', JSON.stringify(error, null, 2));
            return;
        }

        const data1 = await response1.json();
        const aiResponse1 = data1.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ Test 1 Passed');
        console.log('📝 Response:', aiResponse1);
        console.log('');

        // Test 2: With system prompt
        console.log('Test 2: With system prompt and context');
        const systemPrompt = 'You are a helpful AI assistant. Be concise and friendly.';
        const userMessage = 'What is React in one sentence?';
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

        const response2 = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        if (!response2.ok) {
            const error = await response2.json();
            console.error('❌ Test 2 Failed:', JSON.stringify(error, null, 2));
            return;
        }

        const data2 = await response2.json();
        const aiResponse2 = data2.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ Test 2 Passed');
        console.log('📝 Response:', aiResponse2);
        console.log('');

        console.log('🎉 All tests passed! Your Gemini API is fully functional!');
        console.log('');
        console.log('✨ Next Steps:');
        console.log('1. Run: npm run dev');
        console.log('2. Open: http://localhost:3000');
        console.log('3. Start chatting with real AI responses!');
        console.log('');
        console.log('📊 API Details:');
        console.log(`   Model: ${MODEL}`);
        console.log(`   API Version: ${API_VERSION}`);
        console.log(`   Rate Limit: 60 requests/minute (free tier)`);
        console.log('');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify the API key is correct in .env.local');
        console.log('3. Make sure the API key has proper permissions');
        console.log('4. Check if you have reached rate limits (60/min)');
        console.log('5. Verify the model name is correct');
        console.log('');
    }
}

testGeminiAPI();
