import { Component, Prop, Vue, Ref } from 'vue-property-decorator';
import { Track } from '@/dto/Track';
import { Entry } from '@/dto/Entry';
import { Mutation, ReplaceCommand } from '@/store';
import { TextService } from '@/services/TextService';

import Spinner from '@/components/Spinner.vue';
import Dropdown from '@/components/Dropdown.vue';
import DropdownElement from '@/components/DropdownElement.vue';
import DropdownDivider from '@/components/DropdownDivider.vue';


@Component({
    components: {
        Spinner,
        Dropdown,
        DropdownElement,
        DropdownDivider,
    },
})
export default class Tracks extends Vue {

    @Prop()
    entries: Entry[];

    @Ref('dropdowns')
    dropdowns: Dropdown[];

    private textService = new TextService();

    isNowPlaying(track: Track): boolean {
        const nowPlaying: Entry = this.$store.getters.nowPlaying;
        if (nowPlaying) {
            return track.id === nowPlaying.track.id;
        }
        return false;
    }

    isBeingConverted(track: Track): boolean {
        return !track.duration;
    }

    playTrack(track: Track): void {
        // I am very tired but something tells me it may be a good idea to copy
        // this instead of using it directly
        const entries: Entry[] = this.entries
            .map(v => {
                return {
                    album: v.album,
                    track: v.track,
                };
            });
        const playingIndex = entries.findIndex(v => v.track === track);
        const command: ReplaceCommand = {
            entries: entries,
            playingIndex: playingIndex,
        };
        this.$store.commit(Mutation.Replace, command);
    }

    addToQueue(_: Track): void {
        this.closeDropdowns();
    }

    removeFromQueue(_: Track): void {
        this.closeDropdowns();
    }

    goToAlbum(_: Entry): void {
        this.closeDropdowns();
    }

    formatDuration(track: Track): string {
        return this.textService.formatTime(track.duration);
    }

    private closeDropdowns(): void {
        for (const dropdown of this.dropdowns) {
            dropdown.close();
        }
    }

}
