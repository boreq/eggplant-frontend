import { Component, Vue, Watch } from 'vue-property-decorator';
import { Entry, Mutation } from '@/store';
import { ApiService } from '@/services/ApiService';
import { PlaybackData } from '@/dto/PlaybackData';
import Errors from '@/components/Errors';

export const seekEvent = 'seek';

@Component({
    components: {},
})
export default class Player extends Vue {

    private apiService = new ApiService();
    private intervalID: number;

    get nowPlaying(): Entry {
        return this.$store.getters.nowPlaying;
    }

    get paused(): boolean {
        return this.$store.state.paused;
    }

    get nowPlayingUrl(): string {
        const entry = this.nowPlaying;
        if (entry) {
            return this.apiService.trackUrl(entry.track);
        }
        return null;
    }

    get audio(): HTMLAudioElement {
        return this.$refs.audio as HTMLAudioElement;
    }

    get volume(): number {
        return this.$store.getters.volume;
    }

    @Watch('nowPlaying')
    onNowPlayingChanged(): void {
        this.audio.src = this.nowPlayingUrl;
        this.play();
    }

    @Watch('paused')
    onPausedChanged(val: boolean): void {
        if (val) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    @Watch('volume')
    onVolumeChanged(volume: number): void {
        this.audio.volume = volume;
    }

    created(): void {
        this.intervalID = window.setInterval(this.emitValues, 100);
    }

    mounted(): void {
        this.audio.volume = this.volume;
        this.$root.$on(seekEvent, (position: number) => {
            if (this.nowPlaying) {
                this.audio.currentTime = this.audio.duration * position;
            }
        });
    }

    destroyed(): void {
        window.clearInterval(this.intervalID);
    }

    onEnded(): void {
        this.$store.commit(Mutation.Next);
    }

    onError(): void {
        Errors.sendError(this, `Could not play "${this.nowPlaying.track.title}".`);
        this.$store.commit(Mutation.Next);
    }

    private emitValues(): void {
        if (this.audio) {
            const playbackData: PlaybackData = {
                currentTime: this.audio.currentTime,
                duration: this.audio.duration,
            };
            this.$emit('playback-data', playbackData);
        }
    }

    private play(): void {
        this.$store.commit(Mutation.Play);
        this.audio.play();
    }

}
