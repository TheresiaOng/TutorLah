import { StreamChat } from "npm:stream-chat";

const streamClient = StreamChat.getInstance(
  Deno.env.get("STREAM_API_KEY")!,
  Deno.env.get("STREAM_API_SECRET")!,
);

Deno.serve(async (req) => {
  const { id, name, role } = await req.json();

  if (!id || !name || !role) {
    return new Response("Missing fields", { status: 400 });
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
