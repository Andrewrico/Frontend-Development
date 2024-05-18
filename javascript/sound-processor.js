// This is sound-processor.js
class SoundProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        const threshold = 0.01; // Example threshold, adjust as needed

        for (let channel = 0; channel < input.length; channel++) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; i++) {
                outputChannel[i] = inputChannel[i]; // Copy input to output (might not be necessary for your use case)

                if (Math.abs(inputChannel[i]) > threshold) {
                    this.port.postMessage('Sound detected');
                    break; // Exit early if sound is detected
                }
            }
        }

        return true;
    }
}

registerProcessor('sound-processor', SoundProcessor);
