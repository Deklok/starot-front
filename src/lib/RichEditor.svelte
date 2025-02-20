<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	let id = uuidv4();
	let editorElement: HTMLElement;
	let { text } = $props();

	const loadQuill = async (element: HTMLElement) => {
		// @ts-ignore
		if (window.Quill) {
			if (!element) {
				throw new Error('editorElement is undefined');
			}
			// @ts-ignore
			new window.Quill(element, {
				theme: 'snow'
			});
		} else {
			throw new Error('Quill is not defined');
		}
	};

	onMount(async () => {
		await tick();
		if (editorElement) {
			try {
				await loadQuill(editorElement);
			} catch (error) {
				console.error('Failed to load Quill:', error);
			}
		}
	});
</script>

<div class="bg-slate-50">
	<div {id} bind:this={editorElement}>
		{@html text}
	</div>
</div>
