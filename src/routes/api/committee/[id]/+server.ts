/** @format */

import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";

/**
 * Delete a committee from the committee page
 */
export const DELETE = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role))
		throw error(403, "User doesn't have the permission to do that");

	const committee_id = params.id;

	return db
		.one(
			`DELETE FROM committee_info WHERE id = $1 RETURNING category;`,
			[committee_id],
			(a) => a.category,
		)
		.then(async (category) => {
			await resortItemOrder(category);
			return new Response();
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Change the database so that all the books are in the correct item_order
 */
async function resortItemOrder(category: string) {
	await db
		.any("SELECT id, item_order FROM committee_info WHERE category = $1", [category])
		.then(async (res) => {
			res = res.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
			let i = 0;
			let newOrder: [number, number][] = [];
			for (let value of res) {
				newOrder.push([value.id, i]);
				i++;
			}
			await db.tx((t) => {
				//Perform a list of SQL request
				let queries: Promise<null>[] = [];
				for (let value of newOrder) {
					queries.push(
						t.none(
							`UPDATE committee_info SET
						item_order = $2
						WHERE id = $1`,
							value,
						),
					);
				}
				return t.batch(queries); //Execute all the queries
			});
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}
