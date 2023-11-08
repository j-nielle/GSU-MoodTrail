// @ts-nocheck
import dayjs from 'dayjs';

export const moodColors = {
	Sad: "#115f9a",
	Annoyed: "#1984c5",
	Nervous: "#22a7f0",
	Bored: "#48b5c4",
	Neutral: "#76c68f",
	Calm: "#a6d75b",
	Relaxed: "#c9e52f",
	Happy: "#d0ee11",
	Excited: "#d0f400"
};
// blues
// ["#0000b3", "#0010d9", "#0020ff", "#0040ff", "#0060ff", "#0080ff", "#009fff", "#00bfff", "#00ffff"]
// blue to red
// ["#1984c5", "#22a7f0", "#63bff0", "#a7d5ed", "#e2e2e2", "#e1a692", "#de6e56", "#e14b31", "#c23728"]
// pink foam
// ["#54bebe", "#76c8c8", "#98d1d1", "#badbdb", "#dedad2", "#e4bcad", "#df979e", "#d7658b", "#c80064"]
export const mood = {
	Sad: -4,
	Annoyed: -3,
	Nervous: -2,
	Bored: -1,
	Neutral: 0,
	Calm: 1,
	Relaxed: 2,
	Happy: 3,
	Excited: 4
};

export const moodChoices = Object.keys(mood).map(key => ({ value: mood[key], name: key }));

export const reason = {
	Family: 1,
	School: 2,
	'Social Life': 3,
	'Financial Situation': 4,
	Health: 5,
	'Unwilling to specify': 6
};

export const reasonChoices = Object.keys(reason).map(key => ({ value: reason[key], name: key }));

export const roleColor = {
	admin: 'purple',
	counselor: 'pink',
	staff: 'dark'
};

export const roles = [
	{ label: 'admin', color: roleColor.admin },
	{ label: 'counselor', color: roleColor.counselor },
	{ label: 'staff', color: roleColor.staff }
];

export const roleChoices = Object.keys(roleColor).map(key => ({ value: key, name: key.toUpperCase() }));

export const buttonState = {
	active: 'opacity-100 cursor-pointer drop-shadow-md',
	inactive: 'opacity-50 cursor-pointer'
};

export const yearLvl = {
	1: '1st Year',
	2: '2nd Year',
	3: '3rd Year',
	4: '4th Year'
};

/**
 * This function returns the nearest mood label to the given score.
 * @param {number} score - The score to find the nearest mood label of.
 * @param {object} mood - The mood object to compare the score with.
 * @returns {string} The nearest mood label to the given score.
 */
export function getNearestMoodLabel(score, mood) {
	let nearestLabel = null; // set to null so that we can check if it was set later on

	// set to infinity so that the first difference will always be less than this
	// in simpler terms, this is what we will compare the differences to
	// e.g. 1 - 2 = 1, 1 < Infinity, so 1 is the nearest difference
	let nearestDifference = Infinity; 

	// iterate through the mood object
	for (const label in mood) {
		// get the mood score of the current label
		const moodScore = mood[label];
		// get the absolute difference between the mood score and the given score
		const difference = Math.abs(moodScore - score);

		// if the difference is less than the nearest difference, set the nearest label
		if (difference < nearestDifference) {
			nearestLabel = label; // set the nearest label
			nearestDifference = difference; // set the nearest difference e.g. 1 - 2 = 1
		}
	}

	return nearestLabel;
}

export const daysShort = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

/**
	* This function returns the week number of the given date.
	* @param {Date} date - The date to get the week number of.
	* @returns {string} The week number of the given date (e.g. 'Week 1', 'Week 2', etc.)
*/
export const getWeekNumberString = (date) => {
	const firstDayOfYear = dayjs(date).startOf('year').day(0); // get the first day of the year

	// get the number of weeks between the first day of the year and the given date and add 1
	// to get the week number
	const weekDiff = date.diff(firstDayOfYear, 'week') + 1; 
	return `Week ${weekDiff}`;
};