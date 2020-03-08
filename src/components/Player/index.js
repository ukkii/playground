import React from 'react';

import Controls from './Controls';
import Audio from './Audio';
import TrackProgressBar from './TrackProgressBar';

import style from './style.module.scss';

class Player extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentTrackIndex: 0,
      muted: true,
      currentTime: 0,
      duration: 0
    };

    this.audioElRef = React.createRef();

    [
      'togglePlay',
      'playNext',
      'playPrev',
      'onCurrentTrackUpdated',
      'onTimeUpdate',
      'onProgressChange'
    ].forEach(method => {
       this[method] = this[method].bind(this);
    });
  }

  getAudioEl() {
    return this.audioElRef.current;
  }

  togglePlay() {
    const {muted} = this.state;
    const audioEl = this.getAudioEl();

    muted ? audioEl.play() : audioEl.pause();

    this.setState({muted: !this.state.muted});
  }

  onCurrentTrackUpdated() {
    const audioEl = this.getAudioEl();

    audioEl.load();
    audioEl.play();
  }

  playNext() {
    const nextIndex = this.state.currentTrackIndex + 1;
    const currentTrackIndex = nextIndex >= this.props.playlist.length ? 0 : nextIndex;

    this.setState({ currentTrackIndex, muted: false }, this.onCurrentTrackUpdated);
  }

  playPrev() {
    const nextIndex = this.state.currentTrackIndex - 1;
    const currentTrackIndex = nextIndex < 0 ? this.props.playlist.length - 1 : nextIndex;

    this.setState({ currentTrackIndex, muted: false }, this.onCurrentTrackUpdated);
  }

  onTimeUpdate({ target: { currentTime, duration }}) {
    if (currentTime === duration) {
      this.setState({ currentTime: 0, duration: 0 });
      this.playNext();
    } else {
      this.setState({ currentTime, duration });
    }
  }

  onProgressChange(currentTime) {
    this.setState({ currentTime });
    this.getAudioEl().currentTime = currentTime;
  }

  componentDidMount() {
    this.getAudioEl().addEventListener('timeupdate', this.onTimeUpdate);
  }

  render() {
    return <div className={style.wrap}>
      <div className={style['track-info']}>
        <div className={style['track-name']}>
          {this.props.playlist[this.state.currentTrackIndex]}
        </div>
        <TrackProgressBar
          currentTime={this.state.currentTime}
          duration={this.state.duration}
          onProgressChange={this.onProgressChange}
        />
      </div>
      <Audio
        ref={this.audioElRef}
        src={`${this.props.tracksFolder}/${this.props.playlist[this.state.currentTrackIndex]}.mp3`} />
      <Controls
        onTogglePlay={this.togglePlay}
        onPlayNext={this.playNext}
        onPlayPrev={this.playPrev}
        muted={this.state.muted}
      />
    </div>;
  }

  componentWillUnmount() {
    this.getAudioEl().removeEventListener('timeupdate', this.onTimeUpdate);
  }
}

export default Player;