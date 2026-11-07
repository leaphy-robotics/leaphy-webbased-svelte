import * as tf from "@tensorflow/tfjs";

// Our models are tiny, for these the CPU backend trains much faster than WebGL, which spends most of its time on
// compiling shaders and syncing with the GPU, freezing the page while doing so
export async function useTrainingBackend() {
	if (tf.getBackend() !== "cpu") await tf.setBackend("cpu");
	await tf.ready();
}
