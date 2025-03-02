<script lang="ts">
	import { tryCatch } from '$lib/utils/trycatch';
	import { onMount, tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	let id = uuidv4();
	let editorElement: HTMLElement;
	let { text = $bindable() } = $props();

	const loadQuill = async (element: HTMLElement) => {
		// @ts-ignore
		if (window.Quill) {
			if (!element) {
				throw new Error('editorElement is undefined');
			}
			// @ts-ignore
			const quill = new window.Quill(element, {
				theme: 'snow'
			});

			quill.on('text-change', () => {
                const newText = quill.root.innerHTML;
                if (newText !== text) {
                    text = newText;
                }
            });
		} else {
			throw new Error('Quill is not defined');
		}
	};

	onMount(async () => {
		await tick();
		if (editorElement) {
			const { error } = await tryCatch(loadQuill(editorElement));
			
			if (error) {
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
