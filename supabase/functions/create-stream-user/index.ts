import { StreamChat } from "npm:stream-chat";

const apiKey = Deno.env.get("STREAM_API_KEY");
const apiSecret = Deno.env.get("STREAM_API_SECRET");

if (!apiKey || !apiSecret) {
  console.error("Missing Stream API key or secret");
  throw new Error("Missing Stream API credentials");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

Deno.serve(async (req) => {
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Invalid JSON body", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const { id, name, role } = payload;

  if (!id || !name || !role) {
    console.error("Missing required fields:", { id, name, role });
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await streamClient.upsertUser(
      {
        id,
        name,
        role,
      },
    );

    const token = streamClient.createToken(id);
    console.log("Generated token:", token);

    return new Response(JSON.stringify({ token }), {
      headers: { "Content-type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-type": "application/json" },
    });
  }
});
