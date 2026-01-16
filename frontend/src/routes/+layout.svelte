<script lang="ts">
	// CSS Styles
	import '../app.css';
	// Svelte Imports
	import { page } from '$app/state';
	
	// Icon Imports
	import favicon from '$lib/assets/favicon.svg';

	// Component Imports
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex">
	<Sidebar />
	
	{@render children()}
</div>
