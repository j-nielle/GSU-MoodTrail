/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals: { getSession } }) {
	return {
		session: getSession() // this session will be available to all pages that use this layout
	};
}
