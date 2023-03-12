import type { RequestEvent } from "./$types";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }: RequestEvent) {
	const session = locals.getSession()
	if (!session) {
	  throw redirect(307, '/');
	} 
}