/**
 * Clerk webhook handler — creates/updates user profiles in Supabase
 * when users sign up or update their accounts.
 * 
 * Configure in Clerk Dashboard → Webhooks:
 *   URL: https://your-domain.vercel.app/api/webhooks/clerk
 *   Events: user.created, user.updated
 */

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { upsertProfile } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Get the headers
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Get the body
  const body = await request.text();

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret);
  let event: any;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle the event
  const eventType = event.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const primaryEmail = email_addresses?.find(
      (e: any) => e.id === event.data.primary_email_address_id
    )?.email_address;

    const displayName = [first_name, last_name].filter(Boolean).join(" ") || undefined;

    try {
      await upsertProfile(id, primaryEmail, displayName, image_url);
      console.log(`Profile upserted for user ${id} (${eventType})`);
    } catch (err) {
      console.error("Failed to upsert profile:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
