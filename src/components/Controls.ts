import { Component, Prop, Vue } from 'vue-property-decorator';
import ProgressBar from '@/components/ProgressBar.vue';
import { Entry, Mutation, SetVolumeCommand } from '@/store';
import { PlaybackData } from '@/dto/PlaybackData';
import { TextService } from '@/services/TextService';


@Component({
    components: {
        ProgressBar,
    },
})
export default class Controls extends Vue {

    @Prop()
    playbackData: PlaybackData;

    private textService = new TextService();

    get nowPlaying(): Entry {
        return this.$store.getters.nowPlaying;
    }

    get trackTitle(): string {
        if (this.nowPlaying && this.nowPlaying.track) {
            return this.nowPlaying.track.title;
        }
        return null;
    }

    get albumTitle(): string {
        if (this.nowPlaying && this.nowPlaying.album) {
            return this.nowPlaying.album.title;
        }
        return null;
    }

    get currentTime(): string {
        if (this.playbackData && this.playbackData.currentTime) {
            return this.textService.formatTime(this.playbackData.currentTime);
        }
        return null;
    }

    get duration(): string {
        if (this.playbackData && this.playbackData.duration) {
            return this.textService.formatTime(this.playbackData.duration);
        }
        return null;
    }

    get currentTimePercentage(): number {
        if (this.playbackData && this.playbackData.currentTime && this.playbackData.duration) {
            return this.playbackData.currentTime / this.playbackData.duration;
        }
        return 0;
    }

    get paused(): boolean {
        return this.$store.state.paused;
    }

    get volume(): number {
        return this.$store.state.volume;
    }

    onPlayPause(): void {
        if (this.paused) {
            this.$store.commit(Mutation.Play);
        } else {
            this.$store.commit(Mutation.Pause);
        }
    }

    onPrevious(): void {
        this.$store.commit(Mutation.Previous);
    }

    onNext(): void {
        this.$store.commit(Mutation.Next);
    }

    changeVolume(volume: number): void {
        const command: SetVolumeCommand = {
            volume: volume,
        };
        this.$store.commit(Mutation.SetVolume, command);
    }

}
