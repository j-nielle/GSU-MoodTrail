/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals: { getSession } }) {
	return {
		session: getSession()
	};
}
