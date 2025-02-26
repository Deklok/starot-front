<script lang="ts">
	import CustomSideBar from "$lib/components/CustomSideBar.svelte";
	import { Button } from "flowbite-svelte";
</script>

Pito
<div>
	<!-- Login Form -->
	<form method="POST" action="?/login">
		<label>
			Username
			<input name="username" type="text">
		</label>
		<label>
			Password
			<input name="password" type="password">
		</label>
		<Button type="submit">
			Login
		</Button>
		<Button type="submit" formaction="?/register">
			Register
		</Button>
	</form>
</div>