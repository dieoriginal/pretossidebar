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
      overlayInterval: 3,
      overlayCount: 0,
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
    this.setState({ beatsPerMeasure, count: 0 });
  };

  handleOverlayIntervalChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const overlayInterval = Number(event.target.value);
    this.setState({ overlayInterval, overlayCount: 0 });
  };

  playClick = (): void => {
    const { count, beatsPerMeasure, overlayCount, overlayInterval } = this.state;

    if (count % beatsPerMeasure === 0) {
      this.click2.play();
    } else {
      this.click1.play();
    }

    if (overlayCount % overlayInterval === 0) {
      this.overlayClick.play();
      this.overlayClick.currentTime = 0;
    }

    this.setState((prevState) => ({
      count: (prevState.count + 1) % prevState.beatsPerMeasure,
      overlayCount: (prevState.overlayCount + 1) % prevState.overlayInterval,
    }));
  };

  startStop = (): void => {
    if (this.state.isPlaying) {
      clearInterval(this.timer);
      this.setState({ isPlaying: false });
    } else {
      this.timer = setInterval(this.playClick, (60 / this.state.bpm) * 1000);
      this.setState({ count: 0, overlayCount: 0, isPlaying: true }, this.playClick);
    }
  };

  render() {
    const { isPlaying, bpm, beatsPerMeasure, overlayInterval, count } = this.state;

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
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
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

          <button 
            onClick={this.startStop}
            className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            {isPlaying ? "Parar" : "Tocar"}
          </button>
        </div>
        <div className="flex space-x-1 mt-2">
          {Array.from({ length: beatsPerMeasure }).map((_, index) => (
            <div
              key={index}
              className={`h-6 w-6 rounded-full ${
                index === 0
                  ? 'bg-red-500' // Primeiro batimento (forte)
                  : index % overlayInterval === 0
                  ? 'bg-yellow-500' // Acentos métricos
                  : 'bg-gray-400' // Batimentos normais
              } ${
                isPlaying && count === index
                  ? 'scale-125 transform transition-transform'
                  : ''
              }`}
            />
          ))}
        </div>
      </>
    );
  }
}

export default Metronome;
