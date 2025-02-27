<script lang="ts">
	import { Badge, Button, FloatingLabelInput } from "flowbite-svelte";
	import { MinusOutline } from "flowbite-svelte-icons";

    let { tags = $bindable() } = $props();
    let tagBind: string = $state('');
    
	const enterTag = (e: any) => {
		if (e.key === 'Enter') {
			e.preventDefault();
        	e.stopPropagation();
			
			// Convert input to lowercase
			const lowercaseTag = tagBind.trim().toLowerCase();
			
			// Only add if it's not empty and not a duplicate
			if (lowercaseTag && !tags.some((tag: any) => tag.name === lowercaseTag)) {
				tags.push({
					name: lowercaseTag,
					url: ''
				});
			}
			
			// Clear input regardless
			tagBind = '';
		}
	};

	const closeBadge = (index: number) => {
		tags.splice(index, 1);
	};
	
	// Function to capitalize first letter for display
	const capitalizeFirstLetter = (string: string) => {
		if (!string) return '';
		return string.charAt(0).toUpperCase() + string.slice(1);
	};
	
	// Force lowercase in the input field
	const forceLowercase = (e: any) => {
		tagBind = tagBind.toLowerCase();
	};
</script>

<div class="w-fit place-self-center">
    <FloatingLabelInput 
        bind:value={tagBind} 
        on:keypress={enterTag}
        on:input={forceLowercase}
    >
        Tags
    </FloatingLabelInput>
</div>
<div class="mx-5 mt-3 flex flex-wrap justify-center">
    {#each tags as tag, i}
        <div class="flex h-fit">
            <Badge class="m-1" large color="dark" border>
                {capitalizeFirstLetter(tag.name)}
            </Badge>
            <Button
                on:click={() => closeBadge(i)}
                pill
                outline
                color="dark"
                style="padding: 5px"
            >
                <MinusOutline class="" size="xl"></MinusOutline>
            </Button>
        </div>
    {/each}
</div>