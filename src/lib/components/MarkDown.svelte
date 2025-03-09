<script lang="ts">
	import { marked } from 'marked';
	export let content: string = '';

	// Parse markdown when content changes
	$: parsedHtml = marked.parse(content);
</script>

<div class="markdown-content">
	{@html parsedHtml}
</div>

<style>
	/* Basic styling for markdown content */
	.markdown-content :global(p) {
		margin-bottom: 0em;
	}

	.markdown-content :global(ul) {
		margin-left: 0em;
		margin-bottom: 0em;
	}

    .markdown-content :global(ol) {
		margin-left: 0em;
		margin-bottom: 0em;
	}

	.markdown-content :global(a) {
		color: #3b82f6;
		text-decoration: underline;
	}

	.markdown-content :global(code) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: monospace;
	}
</style>
