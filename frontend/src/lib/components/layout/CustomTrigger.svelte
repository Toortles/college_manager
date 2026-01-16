<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js"
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { sidebarStore } from "$lib/stores/sidebar.js"
    import ChevronLeft from "@lucide/svelte/icons/chevron-left";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";

    const sidebar = useSidebar();
</script>

<Button onclick={() => sidebar.toggle()} variant="ghost">
    {#if sidebar.state == "expanded"}
        <ChevronLeft />
        <span>Collapse</span>
    {:else}
        <ChevronRight />
    {/if}
</Button>