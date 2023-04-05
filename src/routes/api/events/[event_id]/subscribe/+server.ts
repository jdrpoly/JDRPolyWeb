import { db } from "$lib/server/postgresClient";
import { hasRolePermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/** 
 * Get the list of all users subscribed to an event
 * @type {import('./$types').RequestHandler} 
 */
 export function GET({ params }: RequestEvent) {
	const event_id = params.event_id
	return db.any(
		`SELECT
			users.id as id,
			users.name as name
		FROM
			users
			INNER JOIN event_inscription ON users.id = event_inscription.user_id
			AND event_inscription.event_id = $1;`
	,[event_id]
	).then((res) => {	
		return json(res)		
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/** 
 * Allows the user to subscribe itself to an event
 * @type {import('./$types').RequestHandler} 
 */
 export function POST({ params, locals }: RequestEvent) {
	if(!locals.authenticated) throw error(401)
	
	const event_id = params.event_id

	return db.one(
		` 
		SELECT events.*, subscribed_size FROM events
		LEFT JOIN (
			SELECT event_id, COUNT(*) as subscribed_size
			FROM event_inscription
			GROUP BY (event_id)
		) AS s ON s.event_id = id
		WHERE id = $1
        `,
		[event_id]
	).then((event: any) => {
		if(!event.inscription) throw error(400, "Can't subscribe to an event where there is no inscription")
		if (!hasRolePermission('JOIN_EVENT_' + event.inscription_group.toUpperCase(), locals.user?.role)) 
			throw error(403)
		if(event.inscription_limit && event.subscribed_size >= event.inscription_limit) 
			throw error(403, "Can not subscribe when event is full")
		let now = Date.now()
		if(event.inscription_start && now < Date.parse(event.inscription_start) )
			throw error(403, "Inscription are not yet open")
		if(event.inscription_stop && now >= Date.parse(event.inscription_stop) )
			throw error(403, "Inscription are now closed")

		return db.none(
			`INSERT into event_inscription(user_id, event_id)
			VALUES ($1,$2)`
			,[locals.user?.id, event_id])
			.then(() => {
				return new Response()
			})
	}).catch((err) => {		
		throw error(500, err.message)
	})
}

/** 
 * Allows the user to remove itself from an event
 * @type {import('./$types').RequestHandler} 
 */
 export async function DELETE({ params, request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const event_id = params.event_id

	return db.none(
		` DELETE FROM event_inscription
            WHERE user_id = $1 AND event_id = $2
        `,
		[locals.user?.id, event_id]
	)
	.then(() => {
		return new Response()
	})
	.catch((err) => {				
		throw error(500, err.message)
	})
}