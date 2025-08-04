"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Grid3X3,
  User,
  Image as ImageIcon,
  Video,
  Music,
  Layout,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  BadgePercent,
  Headphones,
  Mic2,
  PlaySquare,
  Layers,
  PictureInPicture2,
  Album,
  Podcast,
  UserCircle2,
  Camera,
} from "lucide-react";

const platforms = [
  {
    name: "Instagram",
    color: "#E1306C",
    items: [
      {
        type: "Profile",
        size: "320 × 320 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Feed (Square)",
        size: "1080 × 1080 px",
        ratio: "1:1",
        icon: <Square className="w-6 h-6" />,
      },
      {
        type: "Feed (Portrait)",
        size: "1080 × 1350 px",
        ratio: "4:5",
        icon: <RectangleVertical className="w-6 h-6" />,
      },
      {
        type: "Feed (Landscape)",
        size: "1080 × 566 px",
        ratio: "1.91:1",
        icon: <RectangleHorizontal className="w-6 h-6" />,
      },
      {
        type: "Stories / Reels",
        size: "1080 × 1920 px",
        ratio: "9:16",
        icon: <Video className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "TikTok",
    color: "#010101",
    items: [
      {
        type: "Profile",
        size: "200 × 200 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Stories / Story Cover",
        size: "1080 × 1920 px",
        ratio: "9:16",
        icon: <Video className="w-6 h-6" />,
      },
      {
        type: "In‑feed Ad Image",
        size: "1080 × 1080 px",
        ratio: "1:1",
        icon: <ImageIcon className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "YouTube",
    color: "#FF0000",
    items: [
      {
        type: "Channel Art (banner)",
        size: "2560 × 1440 px",
        ratio: "Safe: 1546 × 423 px",
        icon: <Layout className="w-6 h-6" />,
      },
      {
        type: "Profile Icon",
        size: "800 × 800 px",
        ratio: "1:1",
        icon: <UserCircle2 className="w-6 h-6" />,
      },
      {
        type: "Video Thumbnail",
        size: "1280 × 720 px",
        ratio: "16:9",
        icon: <PlaySquare className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "Twitch",
    color: "#9147FF",
    items: [
      {
        type: "Profile",
        size: "800 × 800 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Banner",
        size: "1200 × 480 px",
        ratio: "2.5:1",
        icon: <Layout className="w-6 h-6" />,
      },
      {
        type: "VOD Thumbnail",
        size: "1280 × 720 px",
        ratio: "16:9",
        icon: <PlaySquare className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "Twitter (X)",
    color: "#1DA1F2",
    items: [
      {
        type: "Profile Photo",
        size: "400 × 400 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Header Photo",
        size: "1500 × 500 px",
        ratio: "3:1",
        icon: <Layout className="w-6 h-6" />,
      },
      {
        type: "In‑stream Image",
        size: "1200 × 675 px / min 600 × 335 px",
        ratio: "16:9",
        icon: <ImageIcon className="w-6 h-6" />,
      },
      {
        type: "Card Image (Preview de link)",
        size: "800 × 418 px",
        ratio: "1.91:1",
        icon: <PictureInPicture2 className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "SoundCloud",
    color: "#FF5500",
    items: [
      {
        type: "Profile",
        size: "1000 × 1000 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Track / Album Art",
        size: "min 800 × 800 px",
        ratio: "1:1",
        icon: <Album className="w-6 h-6" />,
      },
      {
        type: "Cover (waveform bg)",
        size: "1240 × 400 px / 2480 × 800 px",
        ratio: "3.1:1",
        icon: <Layers className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "Spotify",
    color: "#1DB954",
    items: [
      {
        type: "Avatar (perfil)",
        size: "min 750 × 750 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
      {
        type: "Header (artist page)",
        size: "min 2660 × 1140 px",
        ratio: "-",
        icon: <Layout className="w-6 h-6" />,
      },
      {
        type: "Playlist Cover",
        size: "300 × 300 px",
        ratio: "1:1",
        icon: <Album className="w-6 h-6" />,
      },
      {
        type: "Album / Track Cover",
        size: "min 2400 × 2400 px",
        ratio: "1:1",
        icon: <Album className="w-6 h-6" />,
      },
      {
        type: "Podcast Cover",
        size: "3000 × 3000 px",
        ratio: "1:1",
        icon: <Podcast className="w-6 h-6" />,
      },
      {
        type: "Canvas",
        size: "1080 × 1920 px",
        ratio: "9:16",
        icon: <Video className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "Apple Music",
    color: "#FA57C1",
    items: [
      {
        type: "Artist Profile Pic",
        size: "2400 × 2400 px (preferido); min 800 × 800 px",
        ratio: "1:1",
        icon: <User className="w-6 h-6" />,
      },
    ],
  },
];

function getRatioBox(ratio: string) {
  // Returns a style object for a box with the given aspect ratio
  if (!ratio || ratio === "-") return { width: 56, height: 56 };
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h) return { width: 56, height: 56 };
  // Normalize to 56px width
  const width = 56;
  const height = Math.round((h / w) * width);
  return { width, height };
}

function getAllItemsWithPlatform() {
  // Flatten all items with platform name and index for unique keys
  let result: {
    platformIdx: number;
    itemIdx: number;
    platformName: string;
    itemType: string;
  }[] = [];
  platforms.forEach((platform, platformIdx) => {
    platform.items.forEach((item, itemIdx) => {
      result.push({
        platformIdx,
        itemIdx,
        platformName: platform.name,
        itemType: item.type,
      });
    });
  });
  return result;
}

export default function FotografiaDimensoes() {
  // State to track which checkboxes are checked
  const allItems = getAllItemsWithPlatform();
  const [checked, setChecked] = useState<{ [key: string]: boolean }>(() => {
    // Initialize all as false
    const obj: { [key: string]: boolean } = {};
    allItems.forEach((item) => {
      obj[`${item.platformIdx}-${item.itemIdx}`] = false;
    });
    return obj;
  });

  // Helper to check if all are checked
  const allChecked = allItems.every(
    (item) => checked[`${item.platformIdx}-${item.itemIdx}`]
  );

  function handleCheckboxChange(platformIdx: number, itemIdx: number) {
    setChecked((prev) => ({
      ...prev,
      [`${platformIdx}-${itemIdx}`]: !prev[`${platformIdx}-${itemIdx}`],
    }));
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        Templates de Dimensões para Photoshop
      </h1>
      <p className="mb-6 text-muted-foreground max-w-2xl">
        Consulta rápida dos principais tamanhos de imagem para redes sociais e plataformas de música. Use estes templates para criar artes no Photoshop com as dimensões corretas.
      </p>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={allChecked}
          readOnly
          className="accent-green-600 w-5 h-5"
          id="all-checked"
        />
        <label htmlFor="all-checked" className="text-sm font-medium">
          Todas as fotos marcadas como feitas
        </label>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform, platformIdx) => (
          <Card key={platform.name} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: platform.color }}
                />
                {platform.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {platform.items.map((item, itemIdx) => {
                  const checkboxId = `checkbox-${platformIdx}-${itemIdx}`;
                  const checkedKey = `${platformIdx}-${itemIdx}`;
                  return (
                    <div
                      key={item.type + itemIdx}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="flex items-center justify-center border rounded bg-muted"
                        style={{
                          ...getRatioBox(item.ratio),
                          minWidth: 32,
                          minHeight: 32,
                          maxWidth: 72,
                          maxHeight: 72,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.size}
                          {item.ratio && item.ratio !== "-" && (
                            <span className="ml-2 text-[10px] bg-muted px-1 py-0.5 rounded">
                              {item.ratio}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id={checkboxId}
                          checked={!!checked[checkedKey]}
                          onChange={() =>
                            handleCheckboxChange(platformIdx, itemIdx)
                          }
                          className="accent-green-600 w-5 h-5"
                          required
                        />
                        <label
                          htmlFor={checkboxId}
                          className="sr-only"
                        >
                          {`Foto feita para ${platform.name} - ${item.type}`}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-xs text-muted-foreground">
        Fontes:&nbsp;
        <a
          href="https://blog.hootsuite.com/social-media-image-sizes-guide/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Hootsuite
        </a>
        ,&nbsp;
        <a
          href="https://stockimg.ai/blog/social-media/tiktok-post-sizes-and-ratios?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Stockimg AI
        </a>
        ,&nbsp;
        <a
          href="https://www.brandwatch.com/blog/social-media-image-sizes-guide/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Brandwatch
        </a>
        ,&nbsp;
        <a
          href="https://www.adobe.com/express/discover/sizes/youtube?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Adobe
        </a>
        ,&nbsp;
        <a
          href="https://analyzify.com/hub/youtube-image-sizes?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Analyzify
        </a>
        ,&nbsp;
        <a
          href="https://snappa.com/blog/twitch-banner-size/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Snappa
        </a>
        ,&nbsp;
        <a
          href="https://www.linearity.io/blog/twitch-size-guide/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Linearity
        </a>
        ,&nbsp;
        <a
          href="https://streamlabs.com/content-hub/post/twitch-size-guide-panel-sizes-profile-picture-guide-and-more?srsltid=AfmBOopikerL05YeZRdXtLBeBB_CzILjj1k3o95AhVOGMclaYaOQfP2h&utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Streamlabs
        </a>
        ,&nbsp;
        <a
          href="https://www.socialpilot.co/blog/social-media-image-sizes?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          SocialPilot
        </a>
        ,&nbsp;
        <a
          href="https://recurpost.com/blog/twitter-post-dimensions/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Recurpost
        </a>
        ,&nbsp;
        <a
          href="https://www.canva.com/sizes/soundcloud/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Canva
        </a>
        ,&nbsp;
        <a
          href="https://www.linearity.io/blog/soundcloud-size-guide/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Linearity
        </a>
        ,&nbsp;
        <a
          href="https://help.soundcloud.com/hc/en-us/articles/10199928919963-Monetization-Features?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          SoundCloud Help Center
        </a>
        ,&nbsp;
        <a
          href="https://support.spotify.com/us/artists/article/artist-image-guidelines/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Spotify
        </a>
        ,&nbsp;
        <a
          href="https://www.linearity.io/blog/spotify-size-guide/?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Linearity
        </a>
        ,&nbsp;
        <a
          href="https://artists.apple.com/support/1104-artist-image-guidelines?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Apple Music for Artists
        </a>
      </div>
    </div>
  );
}
