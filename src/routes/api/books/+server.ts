import type { RequestEvent } from "./$types";
import { error, json } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";

/**
 * Get all the books
 * @type {import('./$types').RequestHandler} 
 */
export function GET({ }: RequestEvent) {
	return db.any(
		` SELECT * FROM books`,
	)
		.then((res) => {
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}

/**
 * Add a new book
 * @type {import('./$types').RequestHandler}
 * @param {RequestEvent} request
 * @param {string} request.title the title of the book
 * @param {string} request.caution the caution for this book
 * @param {string} request.status the availablity of the book
*/
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const body = await request.json()
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")

	return db.any("SELECT item_order FROM books")
		.then((res) => {
			res.push({ item_order: -1 }) //If the array is empty, set the max to -1 so that the new order will be 0
			const maxOrder = Math.max(...res.map((v) => v.item_order))

			return db.none(
				`INSERT INTO books
				(title,item_order,caution,status)
				VALUES ($1,$2,$3,$4) RETURNING id`
				, [body.title, maxOrder + 1, body.caution, body.status]
			)
				.then(() => {
					return new Response()
				})
		})
		.catch((err) => { throw error(500, err.message) })

}