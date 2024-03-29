/** @format */

import type { User } from "$gtypes";
import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ params, fetch }) => {
	return {
		profileUser: await fetch("/api/users/" + params.id)
			.then((res) => res.json())
			.then((res) => {
				return res as User;
			})
			.catch((err) => {
				throw redirect(307, "/404");
			}),
	};
}) satisfies PageLoad;
