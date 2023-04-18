
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions"
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { __envDir } from "$lib/utils";


/**  ---Event POST---  */

/**
 * Create an event
 * 
 * @param {FormData} request.body the request must be a form data
 * @param {string} title the title of the event
 * @param {string} category the category of the event
 * @param {string} description the description of the event
 * @param {string} date the UTCdate of the event
 * @param {Blob} image the image of the event
 * @param {string} inscription the string of a boolean, indicating if people can join the event
 * @param {string} inscription_group name of the group that are allowed to join
 * @param {number?} inscription_limit limit of people that can subscribe to this event
 * @param {string} inscription_start the UTCdate of when people can join an event
 * @param {string} inscription_stop the UTCdate of when people can no longer join an event
 * @type {import('./$types').RequestHandler} 
 */
export async function POST({ request, locals }: RequestEvent) {			
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.CREATE_EVENT, locals.user?.role)) throw error(403)
	
	const data = await request.formData()

	const parsedData = {
		title: data.get("title")?.toString(),
		category: data.get("category")?.toString(),
		description: data.get("description")?.toString(),
		date: (() => {
			const date = data.get("date")
			if(date == null) return null
			else return new Date(date.toString())
		})(),
		image: data.get("image")?.valueOf() as Blob | undefined,
		inscription: data.get("inscription")?.toString(),
		inscription_group: data.get("inscription_group")?.toString().toUpperCase(),
		inscription_limit: data.get("inscription_limit") ? parseInt(data.get("inscription_limit")!.toString()) : null,
		inscription_start: (() => {
			const date = data.get("inscription_start")
			if(date == null) return null
			else return new Date(date.toString())
		})(),
		inscription_stop: (() => {
			const date = data.get("inscription_stop")
			if(date == null) return null
			else return new Date(date.toString())
		})(),
	}	
	const barray = parsedData.image ? await parsedData.image.arrayBuffer() : undefined
	if (parsedData.inscription_group !== "USER" && parsedData.inscription_group !== "MEMBER" && parsedData.inscription_group !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`INSERT INTO events
			(title,author,category,date,inscription,inscription_group, inscription_limit, inscription_start,inscription_stop,description, image)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id;`,
		[parsedData.title, locals.user?.id, parsedData.category, parsedData.date, parsedData.inscription, parsedData.inscription_group, parsedData.inscription_limit, parsedData.inscription_start, parsedData.inscription_stop, parsedData.description, barray ? Buffer.from(barray) : null],
		a => a.id)
		.then((id) => {									
			return json({id})
		})
		.catch((err) => {			
			throw error(500, err.message)
		})
}

/**  ---Events GET---  */

/**
 * Get all events sorted by their date
 * @type {import('./$types').RequestHandler} 
 * @param {boolean?} url.searchParams.excludeExpiredEvents exclude event in the past (default true)
 * @param {number} url.searchParams.limit how much events to search for
 * @return {Event[]} list of events
 * */
export async function GET({ url }: RequestEvent) {	
	const excludeExpiredEvents = !(url.searchParams.get("excludeExpiredEvents") === "false")
		
	const db_req = excludeExpiredEvents ?
		`SELECT * FROM events
		WHERE date >= $1
		ORDER BY date;
		`
		: 
		`SELECT * FROM events
		ORDER BY date;
		`
	return db.any(db_req, [new Date(Date.now())])
		.then((res) => {
			res.forEach((v) => {
				if(v.image) v.imageb64 = Buffer.from(v.image).toString("base64") //Convert to base64
				v.image = undefined
			})
			return res
		})
		.then((result) => {
			return json(result)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}