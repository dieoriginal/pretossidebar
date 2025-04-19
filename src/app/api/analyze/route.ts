export async function POST(request: Request) {
  const { lines } = await request.json();
  
  try {
    const flaskResponse = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lines }),
    });

    if (!flaskResponse.ok) {
      throw new Error(`Flask server error: ${flaskResponse.statusText}`);
    }

    const data = await flaskResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze meter" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
