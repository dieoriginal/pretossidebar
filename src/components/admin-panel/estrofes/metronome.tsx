"use client";

import React, { Component, ChangeEvent } from "react";
import "@/app/metronome.css";

const click1: string = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2: string = "//daveceddia.com/freebies/react-metronome/click2.wav";
const overlayClick: string = "/SizzKick3.wav";

interface MetronomeState {
  isPlaying: boolean;
  count: number;
  bpm: number;
  beatsPerMeasure: number;
  overlayInterval: number;
  overlayCount: number;
  barCount: number;
  stressedBeat: number;
}

class Metronome extends Component<{}, MetronomeState> {
  private timer?: NodeJS.Timeout;
  private click1: HTMLAudioElement;
  private click2: HTMLAudioElement;
  private overlayClick: HTMLAudioElement;

  constructor(props: {}) {
    super(props);

    this.state = {
      isPlaying: false,
      count: 0,
      bpm: 100,
      beatsPerMeasure: 4,
      overlayInterval: 4,
      overlayCount: 0,
      barCount: 0,
      stressedBeat: 0,
    };

    this.click1 = new Audio(click1);
    this.click2 = new Audio(click2);
    this.overlayClick = new Audio(overlayClick);
  }

  handleBpmChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const bpm = Number(event.target.value);
    if (this.state.isPlaying) {
      clearInterval(this.timer);
      this.timer = setInterval(this.playClick, (60 / bpm) * 1000);
      this.setState({ count: 0, bpm });
    } else {
      this.setState({ bpm });
    }
  };

  handleBeatsPerMeasureChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const beatsPerMeasure = Number(event.target.value);
    this.setState({ beatsPerMeasure, count: 0, stressedBeat: 0 });
  };

  handleOverlayIntervalChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const overlayInterval = Number(event.target.value);
    this.setState({ overlayInterval, overlayCount: 0 });
  };

  handlePrevAccent = (): void => {
    this.setState(prev => ({
      stressedBeat: (prev.stressedBeat - 1 + prev.beatsPerMeasure) % prev.beatsPerMeasure,
    }));
  };

  handleNextAccent = (): void => {
    this.setState(prev => ({
      stressedBeat: (prev.stressedBeat + 1) % prev.beatsPerMeasure,
    }));
  };

  playClick = (): void => {
    this.setState(prev => {
      const { count, beatsPerMeasure, overlayCount, overlayInterval, stressedBeat, barCount } = prev;
      // play click based on stressedBeat
      if (count === stressedBeat) {
        this.click2.play();
      } else {
        this.click1.play();
      }
      // overlay accent (unchanged)
      if (overlayCount % overlayInterval === 0) {
        this.overlayClick.currentTime = 0;
        this.overlayClick.play();
      }
      const newCount = (count + 1) % beatsPerMeasure;
      const newBar = newCount === 0 ? barCount + 1 : barCount;
      // reset after 2 bars
      if (newBar >= 2) {
        return { count: 0, overlayCount: 1, barCount: 0 };
      }
      return {
        count: newCount,
        overlayCount: overlayCount + 1,
        barCount: newBar,
      };
    });
  };

  startStop = (): void => {
    const interval = (60 / this.state.bpm) * 1000;
    if (this.state.isPlaying) {
      clearInterval(this.timer);
      this.setState({ isPlaying: false, count: 0, overlayCount: 1, barCount: 0 });
    } else {
      // reset state and play first click immediately
      this.setState(
        { isPlaying: true, count: 0, overlayCount: 1, barCount: 0 },
        () => {
          // immediate first click
          this.playClick();
          // schedule subsequent clicks
          this.timer = setInterval(this.playClick, interval);
        }
      );
    }
  };

  render() {
    const { isPlaying, bpm, beatsPerMeasure, overlayInterval, count, barCount, stressedBeat } = this.state;
    return (
      <>
        <div className="metronome flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="w-16">{bpm} BPM</p>
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={this.handleBpmChange}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="beatsPerMeasure">Beats:</label>
            <select
              id="beatsPerMeasure"
              value={beatsPerMeasure}
              onChange={this.handleBeatsPerMeasureChange}
              className="w-16"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="overlayInterval">Overlay:</label>
            <input
              type="number"
              id="overlayInterval"
              min="1"
              max="16"
              value={overlayInterval}
              onChange={this.handleOverlayIntervalChange}
              className="w-12"
            />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={this.handlePrevAccent} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">&lt;</button>
            <span className="text-sm">Accent: {stressedBeat + 1}</span>
            <button onClick={this.handleNextAccent} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">&gt;</button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Bar: {barCount + 1}/2</span>
          </div>
          <button onClick={this.startStop} className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {isPlaying ? "Parar" : "Tocar"}
          </button>
        </div>
        <div className="beat-indicator flex space-x-1 mt-2">
          {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
            const isActive = isPlaying && count === idx;
            const classes = ["beat-circle"];
            if (idx === stressedBeat) classes.push("stressed");
            if (idx % overlayInterval === 0) classes.push("overlay-accent");
            if (isActive) classes.push("active");
            return <div key={idx} className={classes.join(" ")} />;
          })}
        </div>
      </>
    );
  }
}

export default Metronome;
