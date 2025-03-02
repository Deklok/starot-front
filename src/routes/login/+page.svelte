<script lang="ts">
	import { Button, FloatingLabelInput } from "flowbite-svelte";
</script>

<div class="w-full md:w-[50%] justify-self-center">
	<!-- Login Form -->
	<form class="flex flex-col justify-center"
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