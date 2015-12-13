function AudioHandler() {

    this.init = function( ) {
        //Initialize whole handler, load requested resources
        this.audioData = new Array();
        this.initContext();
    };
    
    this.initContext = function() {
        
        try {
            // Create an audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audCtx = new AudioContext();
        }
        catch(e) {
            console.log('[!] Failed to initalize audio context!');
        }
    };
    
    this.playSound = function( audioData ) {
        var source = window.audCtx.createBufferSource();
        source.buffer = audioData;
        source.connect(window.audCtx.destination);
        source.start(0);
    };
}
    