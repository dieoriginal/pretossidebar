import { NextRequest, NextResponse } from "next/server";

interface DiscordAttachment {
    id: string;
    filename: string;
    url: string;
    size: number;
    content_type?: string;
}

interface DiscordAuthor {
    id: string;
    username: string;
    avatar: string | null;
    global_name?: string;
}

interface DiscordMessage {
    id: string;
    content: string;
    timestamp: string;
    author: DiscordAuthor;
    attachments: DiscordAttachment[];
}

const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|aiff|wma)$/i;

function getAvatarUrl(author: DiscordAuthor): string | null {
    if (!author.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=64`;
}

export async function GET(req: NextRequest) {
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
        return NextResponse.json(
            {
                error: "DISCORD_BOT_TOKEN not configured",
                help: "Add DISCORD_BOT_TOKEN to your .env.local file. Create a bot at https://discord.com/developers/applications",
            },
            { status: 503 }
        );
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const before = searchParams.get("before"); // pagination cursor

    if (!channelId) {
        return NextResponse.json(
            { error: "channelId query parameter is required" },
            { status: 400 }
        );
    }

    try {
        let apiUrl = `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`;
        if (before) {
            apiUrl += `&before=${before}`;
        }

        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
            // Revalidate every 30 seconds — keeps links fresh (Discord CDN uses signed URLs)
            next: { revalidate: 30 },
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`Discord API error: ${res.status}`, errorBody);

            if (res.status === 401) {
                return NextResponse.json(
                    { error: "Invalid bot token. Check DISCORD_BOT_TOKEN in .env.local" },
                    { status: 401 }
                );
            }
            if (res.status === 403) {
                return NextResponse.json(
                    { error: "Bot lacks permission to read this channel. Invite it with 'Read Messages' + 'Read Message History' permissions." },
                    { status: 403 }
                );
            }
            if (res.status === 404) {
                return NextResponse.json(
                    { error: "Channel not found. Check the channel ID." },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `Discord API returned ${res.status}` },
                { status: res.status }
            );
        }

        const messages: DiscordMessage[] = await res.json();

        // Extract only audio attachments
        const beats = messages
            .filter((m) => m.attachments?.length > 0)
            .flatMap((m) =>
                m.attachments
                    .filter((a) => AUDIO_EXTENSIONS.test(a.filename))
                    .map((a) => ({
                        id: a.id,
                        messageId: m.id,
                        filename: a.filename,
                        url: a.url,
                        size: a.size,
                        contentType: a.content_type || null,
                        author: m.author.global_name || m.author.username,
                        authorAvatar: getAvatarUrl(m.author),
                        message: m.content || null,
                        timestamp: m.timestamp,
                    }))
            );

        // Cursor for pagination: last message ID
        const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

        return NextResponse.json({
            beats,
            total: beats.length,
            cursor: lastMessageId,
            hasMore: messages.length === limit,
        });
    } catch (err) {
        console.error("Discord fetch error:", err);
        return NextResponse.json(
            { error: "Failed to fetch from Discord API" },
            { status: 500 }
        );
    }
}
