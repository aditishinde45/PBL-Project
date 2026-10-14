async function testChat() {
  const loginRes = await fetch('http://localhost:5001/api/auth/demo/senior', { method: 'POST' });
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log("Asking general question...");
  const aiChatRes = await fetch('http://localhost:5001/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: 'What is the capital of India?' })
  });
  const data = await aiChatRes.json();
  console.log("Response:", data);

  console.log("\nAsking tutorial question...");
  const aiTutorialRes = await fetch('http://localhost:5001/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: 'How to block a contact on whatsapp?' })
  });
  const tutData = await aiTutorialRes.json();
  console.log("Response:", tutData);
}

testChat();
