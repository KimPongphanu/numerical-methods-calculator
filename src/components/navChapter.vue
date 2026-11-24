<template>
    <div class="menuChapter" v-if="chaptersDB.length">
        <div v-for="(chapther, index) in chaptersDB" :key="index" class="menuChapter-child" @click="selection(index)">
            <h1>{{ chapther.chapter }}</h1>
        </div>
    </div>
</template>

<script>
import { chapters } from '../data/methods.js';
export default {
    data() {
        return {
            chaptersDB: [],
            select : null,
            solution : 0,
        }
    },
    created() {
        this.chaptersDB = chapters;
    },
    methods: {
        selection(index) {
            this.select = index;
            this.solution = null;
            this.$emit("chapter-selected", index);
            this.$emit("chapter-array",this.chaptersDB);
        },
    }
}
</script>