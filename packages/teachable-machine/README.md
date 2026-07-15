# `@teachable/audio-trainer`

UI-independent TypeScript APIs for collecting audio features from an Arduino
Nano ESP32, augmenting log-mel spectrograms, training the 120→N classifier
head with TensorFlow.js, and exporting weights for the companion
**TeachableAudio** Arduino library.

## Collect samples over Web Serial

Flash the companion library's `TrainingRecorder` example, then run this from
a user-initiated browser event on HTTPS or localhost:

```ts
import { NanoTrainerClient } from '@teachable/audio-trainer/serial';

const nano = await NanoTrainerClient.requestPort();
await nano.connect();

const yes = await nano.record(8, {
  onCountdown: (seconds) => console.log(seconds),
  onRecordingStart: (seconds) => console.log(`recording ${seconds}s continuously`),
  onCaptured: () => console.log('processing spectrograms'),
});
```

Each item contains the Nano-computed 120-value `embedding` and its raw 49×40
`logMel` matrix. Store both as float32 data.

## Train with augmentation

```ts
import { trainAudioModel, generateModelHeader } from '@teachable/audio-trainer';

const samples = [
  ...yes.map((sample) => ({ ...sample, label: 0 })),
  ...no.map((sample) => ({ ...sample, label: 1 })),
  ...background.map((sample) => ({ ...sample, label: 2, isBackground: true })),
];

const model = await trainAudioModel(samples, 3, {
  epochs: 100,
  augmentation: { variationsPerSample: 3, noiseLayering: true },
  onEpoch: (epoch, total, loss, accuracy) =>
    console.log({ epoch, total, loss, accuracy }),
});

const header = generateModelHeader(model, {
  classNames: ['yes', 'no', 'Background noise'],
  backgroundIndex: 2,
  threshold: 0.8,
});
```

Noise layering converts log-mel bins back to energy, mixes recorded background
at randomized SNR, then re-applies log, normalization, masking, and the frozen
embedding. Original samples always use the embedding computed on the Nano.

## Render a spectrogram

```ts
import { renderSpectrogram } from '@teachable/audio-trainer/spectrogram';
renderSpectrogram(document.querySelector('canvas')!, sample.logMel);
```

## Live preview

```ts
import { headInfer } from '@teachable/dsp-ts';

const stop = await nano.startLive((embedding) => {
  const probabilities = headInfer(embedding, model.weights, model.bias, 3);
  console.log(probabilities);
});

await stop();
```

Web Serial is currently available in desktop Chromium browsers. Model
training itself works in browsers or Node environments supported by tf.js.
