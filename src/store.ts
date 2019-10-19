import Vue from 'vue';
import Vuex from 'vuex';
import { Album } from '@/dto/Album';
import { Track } from '@/dto/Track';

Vue.use(Vuex);

export enum Mutation {
    Replace = 'replace',
    Play = 'play',
    Pause = 'pause',
    Previous = 'previous',
    Next = 'next',
    SetVolume = 'setVolume',
    Mute = 'mute',
    Unmute = 'unmute',
}

export class Entry {
    album: Album;
    track: Track;
}

export class State {
    entries: Entry[];
    playingIndex: number;
    paused: boolean;
    volume: number; // [0, 1]
    muted: boolean;
}

export class ReplaceCommand {
    entries: Entry[];
    playingIndex: number;
}

export class SetVolumeCommand {
    volume: number;
}

export default new Vuex.Store<State>({
    state: {
        entries: [],
        playingIndex: null,
        paused: true,
        volume: 0.5,
        muted: false,
    },
    mutations: {
        [Mutation.Replace](state: State, command: ReplaceCommand): void {
            state.entries = command.entries;
            state.playingIndex = command.playingIndex;
        },
        [Mutation.Play](state: State): void {
            if (!emptyArray(state.entries)) {
                state.paused = false;
            }
        },
        [Mutation.Pause](state: State): void {
            state.paused = true;
        },
        [Mutation.Previous](state: State): void {
            if (!emptyArray(state.entries)) {
                state.playingIndex -= 1;
                if (state.playingIndex < 0) {
                    state.playingIndex = state.entries.length - 1;
                }
            }
        },
        [Mutation.Next](state: State): void {
            if (!emptyArray(state.entries)) {
                state.playingIndex += 1;
                if (state.playingIndex > state.entries.length - 1) {
                    state.playingIndex = 0;
                }
            }
        },
        [Mutation.SetVolume](state: State, command: SetVolumeCommand): void {
            state.volume = command.volume;
            if (state.volume < 0) {
                state.volume = 0;
            }
            if (state.volume > 1) {
                state.volume = 1;
            }
            state.muted = state.volume === 0;
        },
        [Mutation.Mute](state: State): void {
            state.muted = true;
        },
        [Mutation.Unmute](state: State): void {
            state.muted = false;
        },
    },
    getters: {
        nowPlaying: (state: State): Entry => {
            if (emptyArray(state.entries)) {
                return null;
            }
            return state.entries[state.playingIndex];
        },
        volume: (state: State): number => {
            if (state.muted) {
                return 0;
            }
            return state.volume;
        },
    },
});

function emptyArray(arr: any[]): boolean {
    return !arr || arr.length === 0;
}
