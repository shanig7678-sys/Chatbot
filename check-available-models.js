// Check which Gemini models are available with your API key
const GEMINI_API_KEY = 'AIzaSyA9Uy3SUZVJmN0-uXLz8dawMvF3kg9e0Lg';

async function checkAvailableModels() {
    console.log('🔍 Checking available Gemini models...\n');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            return;
        }

        const data = await response.json();
        
        console.log('✅ Available models:\n');
        data.models.forEach(model => {
            console.log(`📦 ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log('');
        });

        // Find models that support generateContent
        const contentModels = data.models.filter(m => 
            m.supportedGenerationMethods?.includes('generateContent')
        );

        console.log('✨ Models supporting generateContent:');
        contentModels.forEach(model => {
            console.log(`   ✓ ${model.name.split('/')[1]}`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

checkAvailableModels();
