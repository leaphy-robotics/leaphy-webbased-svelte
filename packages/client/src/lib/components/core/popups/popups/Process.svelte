<script lang="ts">
import microPythonIcon from "$assets/robots/icons/l_micropython.svg";
import { _ } from "svelte-i18n";
</script>

<div class="content">
	<div class="spinner">
		<img src={microPythonIcon} alt="a rotating leaf"/>
	</div>
</div>

<style>
	@keyframes spinnerAnim {
		0% {transform:rotate(0turn)}
		25% {transform:rotate(0.25turn)}
		50% {transform:rotate(0.5turn)}
		75% {transform:rotate(0.75turn)}
		100% {transform:rotate(1turn)}
	}

	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.spinner {
		animation-name: spinnerAnim;
		animation-duration: 2s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		margin: auto;
	}

	img {
		width: 64px;
		height: 64px;
	}
</style>
