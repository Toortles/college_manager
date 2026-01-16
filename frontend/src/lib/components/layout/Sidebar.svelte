<script lang="ts">
    import { page } from "$app/state";
    import { writable } from "svelte/store";
    
    // Icon Imports
    import House from "@lucide/svelte/icons/house";
    import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
    import Calendar from "@lucide/svelte/icons/calendar";
    import DollarSign from "@lucide/svelte/icons/dollar-sign";
    import Wrench from "@lucide/svelte/icons/wrench";
    import Settings from "@lucide/svelte/icons/settings";

    // Svelte Imports
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import CustomTrigger from "./CustomTrigger.svelte";

    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/calendar", label: "Guest Calendar", icon: Calendar },
        { href: "/expenses", label: "Expenses", icon: DollarSign },
        { href: "/appliances", label: "Appliances", icon: Wrench },
        { href: "/admin", label: "Admin Panel", icon: Settings },
    ];

    function setActive(item: string) {
        window.location.href = item;
    }

</script>

<!-- TODO: Make state persist with page reloads -->

<Sidebar.Provider class="max-w-64">
    <!--Configuration for PC Uncollapesed-->
    <Sidebar.Root collapsible="icon" >
        <Sidebar.Header class="h-16 px-4 flex items-start justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
            <a href="/" class="flex gap-2 items-center">
                <House />
                <span class="text-lg font-semibold group-data-[collapsible=icon]:hidden">HomeHub</span>
            </a>
        </Sidebar.Header>

        <Sidebar.Separator/>

        <Sidebar.Content>
            <nav class="h-full flex flex-col p-3 space-y-1 group-data-[collapsible=icon]:p-1">
                {#each navItems as item}
                    {@const Icon = item.icon}
                    <Button onclick={() => {setActive(item.href)}} class="justify-start gap-3 hover:text-sidebar-foreground/85 hover:bg-sidebar-foreground/60
                        {page.url.pathname === item.href 
                        ?  "bg-sidebar-accent text-sidebar-foreground"
                        :  "bg-sidebar text-sidebar-foreground/50"}">
                        <Icon />
                        <span class="font-medium text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Button>
                {/each}
            </nav>
        </Sidebar.Content>

        <Sidebar.Separator />

        <Sidebar.Footer>
            <CustomTrigger />
        </Sidebar.Footer>
    </Sidebar.Root>
</Sidebar.Provider>
