// connecting bot to gemini
export default {
  async fetch(request, env, ctx) {
    const botToken = '7944473847:AAFbwin6819rzr_EP4umtqSndcAIGa1ZQLY';
    const geminiApiKey = 'AIzaSyCWBCF2DqMZ2x6aHdsICxdO1rLu-OQqANk';
    const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const responses = {
      '/start': "سلامت کو ؟\n\nمن با Gemini 1.5 Flash ادغام شدم. هر پیامی بفرستی بهش میدم جواب بده!",
      'سلام': "علیک سلام",
      'خدافظ': "به سلامت",
      'چطوری': "من یک ربات هستم، اما ممنون که پرسیدی! تو چطوری؟",
      'خوبم': "خوشحالم که حالت خوبه 😊",
      'اسمت چیه': "من یه ربات تلگرامم که با Gemini 1.5 Flash قدرت گرفته!",
    };

    const url = new URL(request.url);
    const domain = url.hostname;

    async function postReq(endpoint, fields) {
      const formData = new FormData();
      fields.forEach(obj => {
        for (const key in obj) formData.append(key, obj[key]);
      });
      
      return fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
    }

    // Handle GET request for webhook setup
    if (request.method === 'GET' && url.pathname === '/') {
      let warnings = [];
      if (!botToken) warnings.push('TELEGRAM_BOT_TOKEN is missing');
      if (!geminiApiKey) warnings.push('GEMINI_API_KEY is missing');

      let webhookResult = '';
      if (botToken) {
        const webhookResponse = await postReq("setWebhook", [
          { "url": `https://${domain}/hook` }
        ]);
        webhookResult = await webhookResponse.text();
      }

      const html = `<!DOCTYPE html>
        <html>
          <body>
            <h1>Telegram + Gemini 1.5 Flash Bot</h1>
            ${warnings.map(w => `<p style="color:red;">⚠️ ${w}</p>`).join('')}
            <pre>${webhookResult}</pre>
          </body>
        </html>`;
      
      return new Response(html, { headers: {'Content-Type': 'text/html'} });
    }

    // Handle Telegram webhook POST requests
    if (request.method === 'POST' && url.pathname === '/hook') {
      try {
        const update = await request.json();
        const message = update.message;
        
        if (message && message.text) {
          const chatId = message.chat.id;
          const rawText = message.text.trim();
          
          // Check for predefined responses
          let responseText = responses[rawText.toLowerCase()];

          // Process unknown messages with Gemini
          if (!responseText) {
            try {
              const geminiResponse = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `به زبان کاربر پاسخ بده. پیام کاربر: ${rawText}`
                    }]
                  }]
                })
              });

              const geminiData = await geminiResponse.json();
              responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
                            "متاسفانه پاسخی دریافت نشد. لطفا دوباره امتحان کنید.";
              
              // Truncate long responses for Telegram
              if (responseText.length > 4000) {
                responseText = responseText.substring(0, 4000) + "...\n\n(پیام کوتاه شد)";
              }
            } catch (error) {
              console.error('Gemini API Error:', error);
              responseText = "مشکلی در پردازش پیام پیش آمد. لطفا بعدا تلاش کنید.";
            }
          }

          // Send response to Telegram
          await postReq("sendMessage", [
            { "chat_id": chatId },
            { "text": responseText },
            { "parse_mode": "HTML" }
          ]);
        }
      } catch (error) {
        console.error('Error processing request:', error);
        return new Response("Internal Server Error", { status: 500 });
      }
      return new Response("OK");
    }

    return new Response("Not Found", { status: 404 });
  }
}
