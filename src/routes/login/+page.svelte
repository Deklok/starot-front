<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { isLoading } from "$lib/stores/loading";
	import { notification } from "$lib/stores/notification";
	import { Button, FloatingLabelInput } from "flowbite-svelte";
</script>

<svelte:head>
  <title> Iniciar sesion </title>
</svelte:head>
<div class="w-full md:w-[50%] justify-self-center">
	<!-- Login Form -->
	<form class="flex flex-col justify-center"
	use:enhance={() => {
		isLoading.set(true);
		return async({ result }) => {
			isLoading.set(false);
			if (result.type === 'success') {
				console.log('entered the redirect');
				goto('/', {
					invalidateAll: true
				});
			} else if (result.type === 'failure') {
				notification.open('Te mamaste, intenta de nuevo', true);
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