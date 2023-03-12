import type { User } from "$gtypes";
import { redirect, type RequestEvent } from "@sveltejs/kit";

export async function load({ locals, url }: RequestEvent) {;
	const defaultSession = await locals.getSession()
	if(!defaultSession) return { authenticated: false }
	
	const user: User = (defaultSession as any).user
	
	if(!user.name && url.pathname != '/auth/fillup') {
		throw redirect(307, '/auth/fillup');
	}
	return {
	  user: user,
	  authenticated: true
	}
}