import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the JSON payload from the request
    const { long_url, alias } = await request.json();

    // Validate that long_url is provided
    if (!long_url) {
      return NextResponse.json(
        { error: "'long_url' field is required." },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API call
    const payload = alias
      ? JSON.stringify({ long_url, alias }) // Include alias if it's provided
      : JSON.stringify({ long_url }); // Omit alias if it's empty

    // Make the POST request to the external API
    const apiResponse = await fetch("https://shlink-neon.vercel.app/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "/",
      },
      body: payload,
    });

    // Parse the response from the external API
    const data = await apiResponse.json();

    // If the external API returns an error, propagate it
    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create short URL." },
        { status: apiResponse.status }
      );
    }

    // Return the short URL to the client
    return NextResponse.json(data);
  } catch (error) {
    // Handle unexpected errors gracefully
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

