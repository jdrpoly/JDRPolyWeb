<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Dropdown from './Dropdown.svelte';
	import { page } from '$app/stores';
	import type { User } from '$gtypes';
	import { invalidateAll } from '$app/navigation';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { signIn, signOut } from "@auth/sveltekit/client"

	let responsive = false;

	let user: User;
	let authenticated: Boolean;
	
	$: user = $page.data.user;
	$: authenticated = $page.data.authenticated;
	
	user = $page.data.user
	
	async function logout() {
		signOut()
	}
</script>

<div class="topnav" class:responsive>
	<a href="/">
		<img src="/images/logo-white.svg" alt="Logo jdrpoly" id="svg" />
	</a>

	<div id="close-icon" class="">
		<IconButton
			class="material-icons"
			on:click={() => {
				responsive = false;
			}}>close</IconButton
		>
	</div>

	<a href="/events" class="nav-link nav-button">
		<span class="material-symbols-outlined link-icon">event</span>
		<p>Évenements</p>
	</a>
	

	<Dropdown
		{responsive}
		data={{
			element: {
				prefix_icon: 'info',
				text: 'Informations'
			},
			links: [
				{
					element: {
						prefix_icon: 'location_on',
						text: 'Accès'
					},
					link: '/plan'
				},
				{
					element: {
						prefix_icon: 'groups',
						text: 'Commission'
					},
					link: '/committee'
				},
				{
					element: {
						prefix_icon: 'description',
						text: 'Documents'
					},
					link: '/docs'
				}
			]
		}}
	/>

	<Dropdown
		{responsive}
		data={{
			element: {
				prefix_icon: 'group',
				text: 'Communauté'
			},
			links: [
				{
					element: {
						prefix_icon: 'image',
						text: 'Photos'
					},
					link: '/photos'
				}
			]
		}}
	/>

	<a href="/books" class="nav-link nav-button">
		<span class="material-symbols-outlined link-icon">book</span>
		<p>Bibliothèque</p>
	</a>



	{#if authenticated}
		{#if hasRolePermission(UserPermission.ADMIN_PANEL, user.role)}
			<Dropdown
				{responsive}
				data={{
					element: {
						prefix_icon: 'admin_panel_settings',
						text: 'Admin'
					},
					links: [
						{
							element: {
								prefix_icon: 'outgoing_mail',
								text: 'Envoyer un code'
							},
							link: '/admin/membership'
						},
						{
							element: {
								text: "Événements",
								prefix_icon: "dataset"
							},
							link: "/admin/events"
						},
						{
							element: {
								prefix_icon: 'search',
								text: 'Utilisateurs'
							},
							link: '/admin/users'
						}
					]
				}}
			/>
		{/if}
		<div id="user-div">
			<Dropdown
				{responsive}
				data={{
					element: {
						prefix_icon: 'person',
						text: user.name ? user.name : "Utilisateur"
					},
					links: [
						{
							element: {
								prefix_icon: 'settings',
								text: 'Paramètres'
							},
							link: '/committee'
						},
						{
							element: {
								prefix_icon: 'keyboard_double_arrow_right',
								text: 'Entrer un code'
							},
							link: '/users/account/membership'
						}
					],
					actions: [
						{
							element: {
								prefix_icon: 'logout',
								text: 'Déconnection'
							},
							action: logout
						}
					]
				}}
			/>
		</div>
	{:else}
		<button class="log-button nav-button" on:click={() => signIn("")}>
			<span class="material-symbols-outlined link-icon">login</span>
			<p class="">Se connecter</p>
		</button>
	{/if}

	<div id="nav-icon" class="">
		<IconButton
			class="material-icons"
			on:click={() => {
				responsive = true;
			}}>list</IconButton
		>
	</div>
</div>

<style lang="scss">
	.nav-button {
		padding: 7px 16px;
		text-align: center;
		text-decoration: none;
		font-size: 17px;
		display: flex;
		align-content: center;
		align-items: center;
	}

	.topnav {
		background-color: #030528;
		overflow: hidden;
		padding: 0.9em 4em 0.9em 4em;
		font-family: Open Sans, sans-serif;
		display: flex;

		.log-button {
			background-color: #030528;
			margin-left: auto;
			border: solid 1px $secondary;
			* {
				display: inline;
				vertical-align: middle;
				color: $secondary;
			}

			&:hover {
				background-color: $secondary;
				color: black;

				* {
					color: black;
				}
			}
		}

		#nav-icon {
			display: none;
			color: $secondary;
			margin-left: auto;
			position: relative;
			margin-right: 50px;
			:global(button) {
				position: absolute;
				top: 50%;
				-ms-transform: translateY(-50%);
				transform: translateY(-50%);
				font-size: 40px;
			}
			:global(button .mdc-icon-button__ripple) {
				transform: translate(-14%, -14%); //tricky bad practice for good sized ripple effect

				&::after {
					background-color: $secondary;
					width: 40px;
					height: 40px;
				}
			}
		}

		#close-icon {
			display: none;
			color: $secondary;
			margin-left: auto;
			position: relative;
			margin-right: 84px;
			top: -80px;
			:global(button) {
				position: absolute;
				top: 50%;
				-ms-transform: translateY(-50%);
				transform: translateY(-50%);
				font-size: 40px;
			}
			:global(button .mdc-icon-button__ripple) {
				transform: translate(-3%, -5%); //tricky bad practice for good sized ripple effect

				&::after {
					background-color: $secondary;
					width: 30px;
					height: 30px;
				}
			}
		}

		.nav-link {
			color: $secondary;

			* {
				display: inline;
				vertical-align: middle;
			}

			p {
				letter-spacing: 0.05em;
			}

			&:hover {
				background-color: $primary-light;
				color: white;
			}
		}

		#user-div {
			margin-left: auto;
			margin-right: 25px;
		}

		:global(#user-div .dropdown) {
			height: 100%;
			background-color: red;
		}
	}

	#svg {
		width: 150px;
		margin-right: 2em;
	}

	.link-icon {
		margin-right: 4px;
	}

	@media screen and (max-width: 1300px) {
		.topnav:not(.responsive) :global(*:not(:first-child)) {
			display: none;
		}

		.topnav #nav-icon {
			display: block;
		}

		.topnav.responsive {
			flex-direction: column;
			position: relative;
			padding: 2em 2em 2rem 2em;

			#svg {
				margin-bottom: 2em;
			}

			#nav-icon {
				display: none;
			}

			.log-button {
				margin: 20px 0 20px 0;
				justify-content: center;
			}

			#user-div {
				margin-left: 0;
			}

			.nav-link {
				padding: 0.5em 16px;
			}

			#close-icon {
				display: block;
			}
		}
	}

	@media screen and (max-width: 330px) {
		#svg {
			display: none;
		}
		.topnav {
			padding: 40px;
		}
	}
</style>
