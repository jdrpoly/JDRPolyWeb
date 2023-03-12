import type { RequestEvent, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit"
import { db } from "$lib/server/postgresClient";
import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/server/memberPeriod";

/**
 * For a user, validate a code and add the correspoding member time.
 * @param {number} request.validation_token the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export const actions = {
	default: async ({ request, locals }: RequestEvent) => {
		if(!locals.authenticated) throw error(401)
		const form = await request.formData();
		
		return db.one("SELECT validation_token, periods FROM members_code WHERE validation_token=$1", [form.get("validation_token")]) //Get matching token
			.then((res) => {				
				return db.one("SELECT id, member_start, member_stop FROM users WHERE id=$1;", [locals.user?.id]) //get user data
					.then((user) => {
						db.none("DELETE FROM members_code WHERE validation_token=$1", [res.validation_token]) //Delete now invalid token
						
						//Calculate new member period
						let period: Period = { start: user.member_start, stop: user.member_stop }
						for (let i = 0; i < res.periods; i++) {
							period = getNextPeriod(period)
						}

						//Update member period
						updateMemberPeriod(user, period)
						return {
							periodNumber: res.periods,
							period: period
						}
					})
			})
			.catch((err) => {				
				return fail(500, {error_message: err.message, message: "Ce code n'est pas valide."})
			})
	}
} satisfies Actions;