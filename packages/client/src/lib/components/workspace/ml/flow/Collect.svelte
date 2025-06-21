<script lang="ts">
	import MLState from "$state/ml.svelte"
	import Button from "$components/ui/Button.svelte";
	import AssignKey from "$components/workspace/ml/AssignKey.svelte";
</script>

<div class="content-area">
	<div class="header">
		<h1>Collect your data</h1>
		<span>Bind your classes to your keyboard and show the robot what it needs to do</span>
	</div>

	<div class="list">
		{#each MLState.classes as classData (classData.id)}
			<div class="class">
				<div class="name">{classData.name}</div>
				<AssignKey {classData} />
			</div>
		{/each}
	</div>

	<Button onclick={() => MLState.learn()} mode="primary" name="Toggle learn" />
	{#each MLState.datasets.toReversed() as dataset (dataset.id)}
		<div>Dataset {dataset.date.toLocaleString()}</div>
	{/each}

	<Button onclick={() => MLState.train()} mode="primary" name="Run!" />
</div>

<style>
	h1 {
		margin: 0;
	}

	.content-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30px;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--secondary);
		border-radius: 20px;
		overflow: hidden;
		width: 100%;
	}

	.class {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #00000025;
		padding: 10px 20px;
	}

	.class:first-child {
		padding-top: 15px;
	}
	.class:last-child {
		padding-bottom: 15px;
		border-bottom: none;
	}

	.name {
		font-weight: bold;
	}
</style>
