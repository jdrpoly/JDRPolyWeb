import type { User } from "$gtypes";
import { db } from "$lib/server/postgresClient";
import { error, fail, redirect } from "@sveltejs/kit";
import { cp } from "fs";
import type { RequestEvent, Actions } from "./$types";



/** @type {import('./$types').PageLoad} */
export async function load({ locals }) {
	const session = await locals.getSession()
	if(!session || (session.user as User).name) throw redirect(307, "/")
}

/**
 * For a user, set a name
 * @param {number} request.name the new name
*/
export const actions = {
	default: async ({ request, locals }: RequestEvent) => {
		const session = await locals.getSession()		
		if(!session) throw error(401)
		const user: User = (session.user as any)
		const form = await request.formData();
		
		const name = form.get('name')		
		if(!name) return fail(400, {message: "Name is not set"})
		try {
			await db.none(`UPDATE users SET name = $[name] WHERE id = $[id]`, {id: user.id, name: name}) 
			return {}
		} catch(err: any) {
			return fail(500, {message: err.message})
		}
	}
} satisfies Actions;