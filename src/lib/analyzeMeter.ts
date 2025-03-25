// src/lib/analyzeMeter.ts
export async function analyzeMeter(lines: string[]): Promise<any> {
  const response = await fetch("http://127.0.0.1:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ lines })
  });
  return response.json();
}
