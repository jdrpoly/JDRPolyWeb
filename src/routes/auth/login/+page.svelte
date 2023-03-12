<script lang="ts">
	import type { ActionData } from "./$types";
	import { page } from "$app/stores"
	import { signIn, signOut } from "@auth/sveltekit/client"

	let email = '';
	let password = '';

	export let form: ActionData;

</script>

{#if $page.data.user}
    <span class="signedInText">
      <small>Signed in as</small><br />
      <strong>{$page.data.user?.name ?? "User"}</strong>
    </span>
    <button on:click={() => signOut()} class="button">Sign out</button>
  {:else}
    <span class="notSignedInText">You are not signed in</span>
    <button >Sign In with GitHub</button>
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}
	input {
		height: 2rem;
		width: 30%;
		margin: 12px;
	}
</style>
