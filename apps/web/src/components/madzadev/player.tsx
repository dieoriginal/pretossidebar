"use client";

import React, { useState, useEffect } from "react";
import "./index.css";

// Import your UI subcomponents.
import { PlayerTemplate } from "../componentsmusic/PlayerTemplate";
import { TitleAndTimeBox } from "../componentsmusic/TitleAndTimeBox";
import { Title } from "../componentsmusic/Title";
import { Time } from "../componentsmusic/Time";
import { Progress } from "../componentsmusic/Progress";
import { ButtonsAndVolumeBox } from "../componentsmusic/ButtonsAndVolumeBox";
import { ButtonsBox } from "../componentsmusic/ButtonsBox";
import { Loop } from "../componentsmusic/Loop";
import { Previous } from "../componentsmusic/Previous";
import { Play } from "../componentsmusic/Play";
import { Pause } from "../componentsmusic/Pause";
import { Next } from "../componentsmusic/Next";
import { Shuffle } from "../componentsmusic/Shuffle";
import { Volume } from "../componentsmusic/Volume";

import loopCurrentBtn from "./icons/loop_current.png";
import loopNoneBtn from "./icons/loop_none.png";
import previousBtn from "./icons/previous.png";
import playBtn from "./icons/play.png";
import pauseBtn from "./icons/pause.png";
import nextBtn from "./icons/next.png";
import shuffleAllBtn from "./icons/shuffle_all.png";
import shuffleNoneBtn from "./icons/shuffle_none.png";

export interface Track {
  url: string;
  title: string;
}

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const formattedHrs = hrs > 0 ? `${hrs}:` : "";
  const formattedMins = hrs > 0 && mins < 10 ? `0${mins}:` : `${mins}:`;
  const formattedSecs = secs < 10 ? `0${secs}` : secs;
  return formattedHrs + formattedMins + formattedSecs;
};

interface PlayerProps {
  trackList: Track[];
  autoPlayNextTrack?: boolean;
  customColorScheme?: Record<string, string>;
}

const Player: React.FC<PlayerProps> = ({
  trackList,
  autoPlayNextTrack = true,
  customColorScheme = {},
}) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [length, setLength] = useState(0);
  const [time, setTime] = useState(0);
  const [slider, setSlider] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [drag, setDrag] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffled, setShuffled] = useState(false);
  const [looped, setLooped] = useState(false);
  const [curTrack, setCurTrack] = useState(0);

  useEffect(() => {
    // Guard: if no tracks exist, don't do anything.
    if (!trackList || trackList.length === 0) return;

    // Guard: if curTrack is out-of-range, reset it.
    if (curTrack >= trackList.length) {
      setCurTrack(0);
      return;
    }

    const currentTrack = trackList[curTrack];
    const audioEl = new Audio(currentTrack.url);
    audioEl.load();

    const setAudioData = () => {
      setLength(audioEl.duration);
      setTime(audioEl.currentTime);
    };

    const setAudioTime = () => {
      setTime(audioEl.currentTime);
      setSlider(
        audioEl.currentTime
          ? ((audioEl.currentTime * 100) / audioEl.duration).toFixed(1)
          : 0
      );
    };

    const setAudioProgress = () => {
      if (audioEl.buffered.length > 0) {
        const bufferedPercentage =
          (audioEl.buffered.end(0) / audioEl.duration) * 100;
        setBuffer(bufferedPercentage.toFixed(2));
      }
    };

    audioEl.addEventListener("loadeddata", setAudioData);
    audioEl.addEventListener("timeupdate", setAudioTime);
    audioEl.addEventListener("progress", setAudioProgress);
    audioEl.addEventListener("ended", () => {
      if (autoPlayNextTrack) next();
      else setIsPlaying(false);
    });

    setAudio(audioEl);
    setTitle(currentTrack.title);

    for (const [variable, value] of Object.entries(customColorScheme)) {
      document.documentElement.style.setProperty(`--${variable}`, value);
    }

    return () => {
      audioEl.pause();
      audioEl.src = "";
    };
  }, [curTrack, trackList, autoPlayNextTrack, customColorScheme]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  useEffect(() => {
    if (audio && isFinite(audio.duration)) {
      audio.pause();
      const newTime = Math.round((drag * audio.duration) / 100);
      audio.currentTime = newTime;
    }
  }, [drag, audio]);

  const play = () => {
    if (audio) {
      setIsPlaying(true);
      audio.play();
    }
  };

  const pause = () => {
    if (audio) {
      setIsPlaying(false);
      audio.pause();
    }
  };

  const next = () => {
    setCurTrack((prev) =>
      prev < trackList.length - 1 ? prev + 1 : 0
    );
  };

  const previous = () => {
    setCurTrack((prev) =>
      prev > 0 ? prev - 1 : trackList.length - 1
    );
  };

  const shuffle = () => {
    setShuffled(!shuffled);
  };

  return (
    <PlayerTemplate className="h-[79px] w-[362px]">
      <TitleAndTimeBox>
        <Title title={title} />
        <Time
          time={`${!time ? "0:00" : formatTime(time)}/${
            !length ? "0:00" : formatTime(length)
          }`}
        />
      </TitleAndTimeBox>
      <Progress
        value={slider}
        progress={buffer}
        onChange={(e) => {
          setSlider(+e.target.value);
          setDrag(+e.target.value);
        }}
        onMouseUp={play}
        onTouchEnd={play}
      />
      <ButtonsAndVolumeBox>
        <ButtonsBox>
          <Loop
            src={looped ? loopCurrentBtn : loopNoneBtn}
            onClick={() => setLooped(!looped)}
          />
          <Previous src={previousBtn} onClick={previous} />
          {isPlaying ? (
            <Pause src={pauseBtn} onClick={pause} />
          ) : (
            <Play src={playBtn} onClick={play} />
          )}
          <Next src={nextBtn} onClick={next} />
          <Shuffle
            src={shuffled ? shuffleAllBtn : shuffleNoneBtn}
            onClick={shuffle}
          />
        </ButtonsBox>
        <Volume
          value={volume}
          onChange={(e) => setVolume(+e.target.value / 100)}
        />
      </ButtonsAndVolumeBox>
    </PlayerTemplate>
  );
};

export default Player;
