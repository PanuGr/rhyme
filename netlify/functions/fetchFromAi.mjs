export default async (request, context) => {
    // Βεβαιώσου ότι η μέθοδος είναι POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    // Ανάκτησε τις παραμέτρους από το σώμα του αιτήματος του client
    let params;
    try {
      params = await request.json(); // Χρησιμοποιούμε await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(JSON.stringify({ error: "Invalid request body. Expected JSON." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    const { prompt, tokens } = params;
  
    // Έλεγχος για απαραίτητες παραμέτρους
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing 'prompt' in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    // Ανάκτησε τις μεταβλητές περιβάλλοντος χρησιμοποιώντας Netlify.env
    const apiKey = Netlify.env.get("RhymeAI");
    const aiModel = "mistralai/mistral-7b-instruct:free";
    const aiContext = "You are a helpful poetry writing assistant. Your task is to help users write better poems by offering suggestions based on the words they've selected and the theme of their writing.";
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set in environment variables.");
      return new Response(JSON.stringify({ error: "Server configuration error: API key missing." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const siteURL = "https://rhymeai.netlify.app";
    const siteTitle = "RhymeAi";
  
    try {
      // Η global fetch είναι διαθέσιμη σε πρόσφατες εκδόσεις Node.js που υποστηρίζει η Netlify.
      const response = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": siteURL,
          "X-Title": siteTitle,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: "system", content: aiContext },
            { role: "user", content: prompt },
          ],
          max_tokens: tokens
        }),
      });
  
      const responseData = await response.json(); // Πρώτα πάρε το JSON
  
      if (!response.ok) {
        console.error("AI API Error Response:", responseData);
        // Χρησιμοποίησε το μήνυμα σφάλματος από το API αν υπάρχει, αλλιώς ένα γενικό μήνυμα.
        throw new Error(
          responseData.error?.message || `AI API request failed with status ${response.status}`
        );
      }
  
      const messageContent = responseData.choices?.[0]?.message?.content;
  
      if (messageContent === undefined) {
          console.error("Unexpected AI API response structure:", responseData);
          throw new Error("AI API response did not contain expected content.");
      }
  
      // Χρησιμοποιούμε new Response για την απάντηση
      return new Response(JSON.stringify({ message: messageContent }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Error in Netlify function fetchFromAI:", error);
      const status = error.message.includes("AI API request failed with status") && responseData
          ? response.status // Χρησιμοποίησε το status από την αποτυχημένη απάντηση του API
          : 500; // Γενικό σφάλμα server
      return new Response(JSON.stringify({ error: error.message }), {
        status: status,
        headers: { "Content-Type": "application/json" },
      });
    }
  };