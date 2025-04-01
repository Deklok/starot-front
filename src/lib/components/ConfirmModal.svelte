<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    
    export let open = false;
    export let title = "Confirmation";
    export let confirmText = "Si, de una";
    export let cancelText = "No, me mame";
    export let onConfirm = () => {};
    export let onCancel = () => {};
    export let autoclose = true;
    export let customClass = "";
</script>

<Modal {title} bind:open={open} {autoclose} class={customClass}>
    <slot>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            ¿Estás seguro?
        </p>
    </slot>
    
    <svelte:fragment slot="footer">
        <Button color="dark" onclick={onConfirm}>{confirmText}</Button>
        <Button color="red" onclick={onCancel}>{cancelText}</Button>
    </svelte:fragment>
</Modal>