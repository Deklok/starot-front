<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import { isLoading } from "$lib/stores/loading";
	import { Button, FloatingLabelInput } from "flowbite-svelte";
</script>

<div class="w-full md:w-[50%] justify-self-center">
	<!-- Login Form -->
	<form class="flex flex-col justify-center"
	use:enhance={() => {
		isLoading.set(true);
		return async({ result }) => {
			isLoading.set(false);
			if (result.type === 'redirect') {
				invalidateAll();
				goto(result.location);
			} else {
				await applyAction(result);
			}
		}
	}}
	method="POST" action="?/login">
		<div class="m-3">
			<FloatingLabelInput id="username" name="username"
			type="text" > Username </FloatingLabelInput>	
		</div>
		<div class="m-3">
			<FloatingLabelInput id="password" name="password"
			type="password"> Contraseña </FloatingLabelInput>	
		</div>
		<Button color="dark" type="submit">
			Entrale we
		</Button>
	</form>
</div>