import superjson from 'superjson';

// Function to make a RedPill API call
async function getRedPillResponse(model: string, chatQuery: string, apiKey: string) {
  // Construct the request payload
  const payload = {
    model: model,
    messages: [
      {
        role: 'user',
        content: chatQuery
      }
    ],
    temperature: 1
  };

  // Make the fetch request
  try {
    const response = await fetch('https://api.red-pill.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('RedPill API Response:', superjson.serialize(data).json);
    return new Response(JSON.stringify(superjson.serialize(data).json), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Example usage of the function
export async function POST(request: Request) {
    const res = await request.json()
    const model = res.model || 'gpt-4o'; // Example model
    const chatQuery = res.chatQuery || 'Hello world!'; // Example chat query
    const apiKey = res.apiKey || 'sk-PrvLgZ0dPj4cJRwZOvfW3pHVOvTvWwC7EKp88YnJayW2E9oR'; // Replace with your actual API key

    return await getRedPillResponse(model, chatQuery, apiKey);
}