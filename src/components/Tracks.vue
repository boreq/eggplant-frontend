<template>
    <ul class="tracks">
        <li v-for="entry in entries" class="track">
            <div class="play" :class="{ playing: isNowPlaying(entry.track) }">
                <a @click="playTrack(entry.track)">
                    <i class="fas fa-play"></i>
                </a>
            </div>

            <div class="title" :title="entry.track.title">
                {{ entry.track.title }}
            </div>

            <dropdown class="actions" ref="dropdowns">
                <template v-slot:trigger>
                    <div class="target">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </template>
                <template v-slot:content>
                    <dropdown-element>
                        <a @click="addToQueue(entry.track)">
                            Add to queue
                        </a>
                    </dropdown-element>
                    <dropdown-element>
                        <a @click="removeFromQueue(entry.track)">
                            Remove from queue
                        </a>
                    </dropdown-element>
                    <dropdown-divider></dropdown-divider>
                    <dropdown-element>
                        <a @click="goToAlbum(entry)">
                            Go to album
                        </a>
                    </dropdown-element>
                </template>
            </dropdown>

            <div class="duration">
                <div v-if="!isBeingConverted(entry.track)">
                    {{ formatDuration(entry.track) }}
                </div>
                <div v-if="isBeingConverted(entry.track)">
                    <spinner v-tooltip="'This track has not been converted yet.'"></spinner>
                </div>
            </div>
        </li>
    </ul>
</template>
<script lang="ts" src="./Tracks.ts"></script>
<style scoped lang="scss" src="./Tracks.scss"></style>
