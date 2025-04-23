import React, { Component } from "react";
import "@/app/metronome.css";

const click1 = "//daveceddia.com/freebies/react-metronome/click1.wav";
const click2 = "//daveceddia.com/freebies/react-metronome/click2.wav";

interface MetronomeState {
  isPlaying: boolean;
  count: number;
  bpm: number;
  beatsPerMeasure: number;
}

class Metronome extends Component<{}, MetronomeState> {
  private timer: NodeJS.Timeout | undefined;
  private click1: HTMLAudioElement;
  private click2: HTMLAudioElement;

  constructor(props: {}) {
    super(props);

    this.state = {
      isPlaying: false,
      count: 0,
      bpm: 100,
      beatsPerMeasure: 4
    };

    this.click1 = new Audio(click1);
    this.click2 = new Audio(click2);
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = Number(event.target.value);

    if (this.state.isPlaying) {
      // stop old timer and start a new one
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(this.playClick, (60 / bpm) * 1000);

      // set the new bpm and reset the beat counter
      this.setState({
        count: 0,
        bpm
      });
    } else {
      // otherwise, just update the bpm
      this.setState({ bpm });
    }
  };

  playClick = () => {
    const { count, beatsPerMeasure } = this.state;

    // alternate click sounds
    if (count % beatsPerMeasure === 0) {
      this.click2.play();
    } else {
      this.click1.play();
    }

    // keep track of which beat we're on
    this.setState(state => ({
      count: (state.count + 1) % state.beatsPerMeasure
    }));
  };

  startStop = () => {
    if (this.state.isPlaying) {
      // stop the timer
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.setState({
        isPlaying: false
      });
    } else {
      // start a timer with current bpm
      this.timer = setInterval(this.playClick, (60 / this.state.bpm) * 1000);
      this.setState(
        {
          count: 0,
          isPlaying: true
        },
        this.playClick
      );
    }
  };

  render() {
    const { isPlaying, bpm } = this.state;

    return (
      <div className="metronome">
        <div className="bpm-slider">
          <p>{bpm} BPM</p>
          <input
            type="range"
            min="60"
            max="240"
            value={bpm}
            onChange={this.handleInputChange}
          />
        </div>
        <button onClick={this.startStop}>{isPlaying ? "Stop" : "Start"}</button>
      </div>
    );
  }
}

export default Metronome;