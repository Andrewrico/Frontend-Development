document.getElementById('start').addEventListener('click', async () => {
    if (!navigator.mediaDevices || !window.AudioContext) {
        alert('Your browser does not support the Web Audio API.');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new AudioContext();
        await audioContext.audioWorklet.addModule('sound-processor.js'); // Load the audio worklet module

        const microphone = audioContext.createMediaStreamSource(stream);
        const soundProcessor = new AudioWorkletNode(audioContext, 'sound-processor');

        microphone.connect(soundProcessor);
        soundProcessor.connect(audioContext.destination); // This might be necessary to keep the node alive

        soundProcessor.port.onmessage = (event) => {
            if (event.data === 'Sound detected') {
                console.log('Sound detected');
            }
        };
    } catch (error) {
        console.error('Error accessing the microphone or loading audio worklet:', error);
    }
});
