import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/backend/memberPeriod";
import { db } from "$lib/backend/postgresClient";
import type { RequestEvent } from "@sveltejs/kit";

export async function post({ locals, request }: RequestEvent) {
	if(!locals.authenticated) return {status: 401}
	const body = await request.json()

	const result = (await db.any("SELECT validation_token, periods FROM $[table:name] WHERE validation_token=$[validation_token]", {
		table: "members_code",
		validation_token: body.validation_token
	})).pop()
	if (!result) return { status: 404 }

	const user = (await db.any("SELECT id, email, member_start, member_stop FROM $[table:name] WHERE email=$[email];", {
		table: "users",
		email: locals.user?.email
	})).pop()
	if (!user) return { status: 404 }

	db.none("DELETE FROM $[table:name] WHERE validation_token=$[validation_token]", {
		table: "members_code",
		validation_token: result.validation_token
	})

	let period: Period = { start: user.member_start, stop: user.member_stop }
		for (let i = 0; i < result.periods; i++) {
			period = getNextPeriod(period)
		}
		updateMemberPeriod(user, period)
	return { 
		status: 200,
		body: {
			periodsNumber: result.periods
		}
	}
}