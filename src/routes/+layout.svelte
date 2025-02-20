<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand, NavLi, NavUl } from 'flowbite-svelte';
	import { PaperClipOutline } from 'flowbite-svelte-icons';
</script>

<Navbar>
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold text-white">Starot Wiki</span>
	</NavBrand>
	<NavUl hidden={false}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/users">Users</NavLi>
		<NavLi href="/search">Search</NavLi>
	</NavUl>
	<div class="flex md:order-2">
		<PaperClipOutline class="w-6 h-6 rotate-45" />
	</div>
</Navbar>

<slot />

<style>

</style>