export const moodColors = {
	Calm: '#4dc0a1',
	Excited: '#01d801',
	Relaxed: '#84d883',
	Annoyed: '#ff6100',
	Neutral: '#4eceff',
	Bored: '#fee101',
	Sad: '#fd0100',
	Happy: '#53db53',
	Nervous: '#ffa200'
};

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

export const reason = {
	Family: 1,
	School: 2,
	'Social Life': 3,
	'Financial Situation': 4,
	Health: 5,
	'Unwilling to specify': 6
};

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

export function getNearestMoodLabel(score, mood) {
	let nearestLabel = null;
	let nearestDifference = Infinity;

	for (const label in mood) {
		const moodScore = mood[label];
		const difference = Math.abs(moodScore - score);

		if (difference < nearestDifference) {
			nearestLabel = label;
			nearestDifference = difference;
		}
	}

	return nearestLabel;
}