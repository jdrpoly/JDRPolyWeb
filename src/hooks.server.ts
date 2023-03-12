import { SvelteKitAuth } from "@auth/sveltekit"
import Auth0 from "@auth/core/providers/auth0"
import type {Provider} from '@auth/core/providers'
import type {Handle, HandleServerError} from "@sveltejs/kit"
import { AUTH0_ID, AUTH_SECRET } from "$env/static/private"
import { db } from "$lib/server/postgresClient"

export const handle = SvelteKitAuth({
	providers: [Auth0({ clientId: AUTH0_ID, clientSecret: AUTH_SECRET, issuer: "https://dev-lsqz4-q7.eu.auth0.com"  })] as Provider[],
	callbacks: {
		async signIn({ user }) {			
			const dbUser = await db.any("SELECT id, name FROM users WHERE email=$1", [user.email])	
			
			if(!dbUser || dbUser.length == 0) {
				try {
					await db.none(`INSERT INTO users(email, role) 
						VALUES($1, $2)`,
						[user.email, "USER"])
				} catch(err) {
					console.error("signIn Error - hooks.server.ts")
					console.error(err)
					return false
				}
			}
			return true
		},
		async session({session}) {
			let res = await db.one("SELECT * FROM users WHERE email=$1", [session.user?.email])	
			res.role = {
				name: res.role
			}
			session.user = {
				...session.user,
				...res
			}
			return session
		},
	  }
  })


/** 
 * 
export const handle: Handle = async function ({ event, resolve }) {
	const session = event.cookies.get('session');

	event.locals.authenticated = false
	event.locals.user = undefined

	if (!session) {
		return resolve(event);
	}

	const id = await db.one(
			"SELECT user_id FROM sessions WHERE cookieId=$1",
			[session],
			a => a.user_id
	)
		.catch(() => {})
	if(!id) return resolve(event);
	
	const user = await db.one(
		`SELECT id, email, name, role, account_creation, is_email_validated 
		FROM users WHERE id=$1`
		,[id]
	)
		.catch((err) => {
			throw throwError(500, err.message)
		})
		
	const role = Roles[user.role]
	if (role) {
		event.locals = {
			authenticated: true,
			user: {
				id: user.id,
				email: user.email,
				role: role.toJSON(),
				name: user.name,
				account_creation: user.account_creation,
				is_email_validated: user.is_email_validated
			}
		}
	} else {
		throw throwError(500, `User with email,id ${user.email},${user.id} has an invalid role ${user.role}`)
	}
	return resolve(event);

}*/

export const handleError: HandleServerError =  ({ error, event }) => {
	console.log("test");
	
	const newError = (error as App.Error)
	if(event.route.id === null) {
		return {
			status: 404,
			message: event.url.href		
		}
	} else {
		console.error(newError);
		return {
			status: 500,
			message: "Internal error"
		}
	}

 }
 