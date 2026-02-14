// Comprehensive API test script
// Run with: node test-api.js

const GEMINI_API_KEY = 'AIzaSyA9Uy3SUZVJmN0-uXLz8dawMvF3kg9e0Lg';

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini 2.5 Flash API\n');
    console.log('═'.repeat(60));

    try {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        
        console.log(`\n📡 Endpoint: ${url.split('?')[0]}`);
        console.log(`🤖 Model: ${model}`);
        console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 20)}...`);
        
        // Test 1: Simple message
        console.log('\n' + '─'.repeat(60));
        console.log('Test 1: Simple greeting');
        console.log('─'.repeat(60));
        
        const testMessage = 'Hello! Introduce yourself in one sentence.';
        console.log(`📤 Sending: "${testMessage}"`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: testMessage }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                    topK: 40,
                }
            })
        });

        console.log(`📊 Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const error = await response.json();
            console.error('\n❌ API Error:');
            console.error(JSON.stringify(error, null, 2));
            return false;
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            console.error('\n❌ No response text found');
            console.error('Response data:', JSON.stringify(data, null, 2));
            return false;
        }

        console.log(`\n✅ Success!`);
        console.log(`📝 Response (${aiResponse.length} chars):`);
        console.log('─'.repeat(60));
        console.log(aiResponse);
        console.log('─'.repeat(60));

        // Test 2: With system prompt
        console.log('\n' + '─'.repeat(60));
        console.log('Test 2: With system prompt and context');
        console.log('─'.repeat(60));

        const systemPrompt = 'You are a helpful AI assistant. Be concise.';
        const userQuestion = 'What is React?';
        const fullPrompt = `${systemPrompt}\n\nUser: ${userQuestion}\nAssistant:`;
        
        console.log(`📤 Sending with system prompt`);

        const response2 = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response2.ok) {
            const error = await response2.json();
            console.error('\n❌ Test 2 failed:', error);
            return false;
        }

        const data2 = await response2.json();
        const aiResponse2 = data2.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log(`\n✅ Success!`);
        console.log(`📝 Response (${aiResponse2.length} chars):`);
        console.log('─'.repeat(60));
        console.log(aiResponse2);
        console.log('─'.repeat(60));

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log('🎉 ALL TESTS PASSED!');
        console.log('═'.repeat(60));
        console.log('\n✨ Your Gemini API is fully functional!');
        console.log('\n📋 Configuration:');
        console.log(`   Model: ${model}`);
        console.log(`   API Version: v1beta`);
        console.log(`   Rate Limit: 60 requests/minute (free tier)`);
        console.log(`   Max Tokens: 2048`);
        console.log('\n🚀 Next Steps:');
        console.log('   1. Run: npm run dev');
        console.log('   2. Open: http://localhost:3000');
        console.log('   3. Start chatting with real AI!');
        console.log('\n');

        return true;

    } catch (error) {
        console.error('\n💥 Test Failed:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check internet connection');
        console.error('   2. Verify API key is correct');
        console.error('   3. Check rate limits (60/min)');
        console.error('   4. Ensure model name is correct');
        console.error('\n');
        return false;
    }
}

// Run the test
testGeminiAPI();
