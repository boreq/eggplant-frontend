<template>
    <div class="queue">
        <div class="message" v-if="empty">
            Your queue is empty.
        </div>

        <tracks :entries="entries"></tracks>
    </div>
</template>
<script lang="ts" src="./Queue.ts"></script>
<style scoped lang="scss" src="./Queue.scss"></style>
