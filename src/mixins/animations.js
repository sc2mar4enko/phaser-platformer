export default {
    isPlayingAnimations(animsKey) {
        return this.anims.isPlaying && this.anims.getCurrentKey() === 'throw';
    }
}