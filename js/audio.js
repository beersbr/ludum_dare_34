function AudioHandler() {

    this.init = function( resourceList ) {
        //Initialize whole handler, load requested resources
        this.audioData = new Array()
        this.initContext()
        this.loadAudio( resourceList )
    }
    
    this.initContext = function() {
        
        try {
            // Create an audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        }
        catch(e) {
            console.log('[!] Failed to initalize audio context!'
        }
    }
    
    this.loadAudio( resources ) {
        for(  target in resources ) {
            console.log("[=] Audio init: Loading " + target)
            var req = XMLHttpRequest();
            req.open('GET' , target, true)
            req.responseType = 'arrayBuffer';
            
            req.onload = function() {
                console.log("[=] Audio init: Got Response from " + target}
                try {
                    this.context.decodeAudioData(req.response, function(buf) {
                            this.audioData.push(buf)
                    }
                except (ex) {
                    console.log('[!] Caught Exception processing audio')
                }
            }
            req.send();
        }
    }
    
    this.playSound( index ) {
        var source = this.context.createBufferSource();
        source.buffer = this.audioData(index);
        source.connect(this.context.destination);
        source.start(0);
    }
}
    