/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/server/logger";

//This file handle admin force put/delete of users from event

/**
 * Force remove a user from the list of subscribed
 * @param {number} url.userId the id of the user to remove
 */
export const DELETE = (async ({ params, url, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, locals.user?.role)) throw error(403);

	const event_id = params.event_id;
	const userId = parseInt(url.searchParams.get("userId") || "null") || null;
	if (!userId) throw error(400, `Incorrect userId: ${userId}`);

	return db
		.none(
			` DELETE FROM event_inscription
            WHERE user_id = $1 AND event_id = $2
        `,
			[userId, event_id],
		)
		.then(() => {
			logger.info(
				`{id:${locals.user!.id},name:${
					locals.user!.name
				}} force removed user {id:${userId}} from event {id:${event_id}}`,
			);
			return new Response();
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Force the add of an user to the list of subscribed users of the event
 * @param {number} url.userId the id of the user to add
 */
export const POST = (async ({ params, url, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.SUBSCRIBE_USER_TO_EVENT, locals.user?.role)) throw error(403);

	const event_id = params.event_id;
	const userId = parseInt(url.searchParams.get("userId") || "null") || null;
	if (!userId) throw error(400, `Incorrect userId: ${userId}`);

	return db
		.none(
			`INSERT into event_inscription(user_id, event_id)
		VALUES ($1,$2)
		`,
			[userId, event_id],
		)
		.then(() => {
			logger.info(
				`{id:${locals.user!.id},name:${
					locals.user!.name
				}} force subscribed user {id:${userId}} into event {id:${event_id}}`,
			);
			return new Response();
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
