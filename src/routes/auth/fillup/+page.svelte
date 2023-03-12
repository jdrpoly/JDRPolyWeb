<script>
	import { error } from '$lib/stores';
	import { enhance } from "$app/forms";
	import { redirect } from "@sveltejs/kit";
	import Textfield from '@smui/textfield';
	import Fab from '@smui/fab';
	import { Icon } from '@smui/common';

	let name = ''
</script>
<svelte:head>
	<title>Finir l'inscription | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Vous avez presque terminé votre inscription</h2>
	<p>Remplissez ces dernières informations</p>
	
	<form method="POST" use:enhance={({ }) => {
		return async ({ result, update }) => {			
			if (result.type == 'success') {
				redirect(307, '/')
			} else if(result.type === 'error' && result.error.message) {
				$error = result.error.message
			}
		}
	}}>
		<Textfield type="text" input$name="name" bind:value={name} label="Nom Prénom" class="solo-input" variant="outlined"/>
		<Fab disabled={!name} color="primary" mini class="solo-fab">
			<Icon class="material-icons">done</Icon>
		</Fab>
	</form>
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			font-family: 'Ubuntu';
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin: 15px 0;
		}	
		p {
			margin-bottom: 1em;
			font-size: 22px;
		}
	}

	form :global(.mdc-text-field__input) {
		width: 50vw;
		max-width: 700px;
		min-width: 200px;
	}
</style>