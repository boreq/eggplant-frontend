import { Component, Vue, Ref, Watch } from 'vue-property-decorator';
import { ApiService } from '@/services/ApiService';
import { Album } from '@/dto/Album';
import { Entry } from '@/dto/Entry';
import { Track } from '@/dto/Track';
import { Mutation, ReplaceCommand, AppendCommand } from '@/store';
import Notifications from '@/components/Notifications';

import SubHeader from '@/components/SubHeader.vue';
import MainHeader from '@/components/MainHeader.vue';
import Albums from '@/components/Albums.vue';
import Tracks from '@/components/Tracks.vue';
import Thumbnail from '@/components/Thumbnail.vue';
import NowPlaying from '@/components/NowPlaying.vue';
import LoginButton from '@/components/LoginButton.vue';
import SearchInput from '@/components/forms/SearchInput.vue';
import Spinner from '@/components/Spinner.vue';
import Queue from '@/components/Queue.vue';
import Dropdown from '@/components/Dropdown.vue';
import DropdownElement from '@/components/DropdownElement.vue';
import DropdownDivider from '@/components/DropdownDivider.vue';


@Component({
    components: {
        Albums,
        SubHeader,
        MainHeader,
        Tracks,
        Thumbnail,
        NowPlaying,
        SearchInput,
        LoginButton,
        Spinner,
        Queue,
        Dropdown,
        DropdownElement,
        DropdownDivider,
    },
})
export default class Browse extends Vue {

    album: Album = null;

    forbidden = false;

    showQueue = false;

    @Ref('dropdown')
    readonly dropdown: Dropdown;

    @Ref('content')
    readonly contentDiv: HTMLDivElement;

    private timeoutId: number;

    private readonly apiService = new ApiService(this);

    @Watch('$route')
    onRouteChanged(): void {
        this.load();
        this.scrollContentToTop();
        this.showQueue = false;
    }

    created(): void {
        this.load();
    }

    destroyed(): void {
        this.clearTimeout();
    }

    parentUrl(album: Album): string {
        const currentIndex = this.album.parents.indexOf(album);
        const ids = this.album.parents
            .filter((_, index) => index <= currentIndex)
            .map(v => v.id);
        const path = ids.join('/');
        return `/browse/${path}`;
    }

    selectAlbum(album: Album): void {
        const ids = this.album.parents ? this.album.parents.map(v => v.id) : [];
        ids.push(album.id);
        const path = ids.join('/');
        this.$router.push({path: `/browse/${path}`});
    }

    toggleQueue(): void {
        this.showQueue = !this.showQueue;
    }

    onPlayAlbumButtonClicked(): void {
        if (this.anyAlbumSongIsCurrentlyNowPlaying()) {
            if (this.paused()) {
                this.$store.commit(Mutation.Play);
            } else {
                this.$store.commit(Mutation.Pause);
            }
        } else {
            const entries: Entry[] = this.entries
                .map(v => {
                    return {
                        album: v.album,
                        track: v.track,
                    };
                });
            const command: ReplaceCommand = {
                entries: entries,
                playingIndex: 0,
            };
            this.$store.commit(Mutation.Replace, command);
        }
    }

    addAlbumToQueue(): void {
        const entries: Entry[] = this.entries
            .map(v => {
                return {
                    album: v.album,
                    track: v.track,
                };
            });
        const command: AppendCommand = {
            entries: entries,
        };
        this.$store.commit(Mutation.Append, command);
        this.dropdown.close();
        Notifications.pushSuccess(this, 'Album added to queue.');
    }

    onQueueNavigation(): void {
        this.scrollContentToTop();
        this.showQueue = false;
    }

    get noContent(): boolean {
        if (!this.album) {
            return false;
        }

        if (this.album.tracks && this.album.tracks.length > 0) {
            return false;
        }

        if (this.album.albums && this.album.albums.length > 0) {
            return false;
        }

        return true;
    }

    get numberOfTracks(): number {
        if (this.album && this.album.tracks) {
            return this.album.tracks.length;
        }
        return 0;
    }

    get entries(): Entry[] {
        if (this.album && this.album.tracks) {
            return this.album.tracks
                .map((v: Track): Entry => {
                    return {
                        track: v,
                        album: this.album,
                    };
                });
        }
        return [];
    }

    get totalDurationMinutes(): number {
        if (this.album && this.album.tracks) {
            return Math.ceil(
                this.album.tracks.reduce(
                    (acc, track) => track.duration ? acc + track.duration : acc,
                    0,
                ) / 60,
            );
        }
        return 0;
    }

    get showPlayAlbumButtonAsPause(): boolean {
        if (!this.anyAlbumSongIsCurrentlyNowPlaying()) {
            return false;
        }

        return !this.paused();
    }

    get nowPlaying(): Entry {
        return this.$store.getters.nowPlaying;
    }

    private paused(): boolean {
        return this.$store.getters.nowPlayingPaused;
    }

    private anyAlbumSongIsCurrentlyNowPlaying(): boolean {
        if (!this.nowPlaying) {
            return false;
        }

        for (const track of this.album.tracks) {
            if (track.id === this.nowPlaying.track.id) {
                return true;
            }
        }

        return false;
    }

    private load(): void {
        this.album = null;

        this.clearTimeout();
        const ids = this.getIdsFromRoute();
        this.apiService.browse(ids)
            .then(
                response => {
                    this.album = response.data;

                    if (this.album.tracks) {
                        const trackAwaitingConversion = this.album.tracks.find(track => !track.duration);
                        if (trackAwaitingConversion) {
                            this.scheduleTimeout();
                        }
                    }
                },
                error => {
                    if (error.response.status === 403) {
                        this.forbidden = true;
                    }
                    Notifications.pushError(this, 'Could not list the tracks and albums.', error);
                    this.scheduleTimeout();
                });
    }

    private scheduleTimeout(): void {
        this.clearTimeout();
        this.timeoutId = window.setTimeout(this.load, 5000);
    }

    private clearTimeout(): void {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private getIdsFromRoute(): string[] {
        const params = this.$route.params;
        if (params.pathMatch) {
            return params.pathMatch.split('/');
        }
        return [];
    }

    private scrollContentToTop(): void {
        this.contentDiv.scrollTop = 0;
    }

}
