<script lang="ts">
	import { Dropzone } from 'flowbite-svelte';

	let value: File | null = $state(null);
	let imgUrl: string | null = $state(null);
	const dropHandle = (event: any) => {
		console.log('changes made');
		value = null;
		event.preventDefault();
		if (event.dataTransfer.items[0]) {
			let item = event.dataTransfer.items[0];
			if (item.kind === 'file') {
				const file = item.getAsFile();
				value = file;
				readFile(value);
			}
		}
	};

	const handleChange = (event: any) => {
		console.log('changes made');
		value = null;
		const files = event.target.files;
		if (files.length > 0) {
			value = files[0];
			readFile(value);
		}
	};

	const readFile = (file: File | null) => {
		if (file !== null) {
			var reader = new FileReader();
			reader.onload = function(event: any) {
				let finalURl = event.target.result;
				imgUrl = finalURl;
			}

			reader.readAsDataURL(file);
		}
	};
</script>

<Dropzone
	id="dropzone"
	on:drop={dropHandle}
	on:dragover={(event) => {
		event.preventDefault();
	}}
	on:change={handleChange}
>
	{#if value === null}
		<svg
		aria-hidden="true"
		class="mb-3 h-10 w-10 text-gray-400"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
		/></svg>
		<p class="flex-wrap mb-2 text-sm text-gray-500 dark:text-gray-400">
			<span class="font-semibold">Click pa elegir</span> or suelta tu chingadera, lo que quieras we
		</p>
	{/if}
	{#if imgUrl !== null}
		<img class="h-full" src={imgUrl} alt="profile-pic" />
	{/if}
</Dropzone>
