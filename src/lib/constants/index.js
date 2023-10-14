// @ts-nocheck

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