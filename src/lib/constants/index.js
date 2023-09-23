export const moodColors = {
	Calm: '#6574cd',
	Excited: '#f6993f',
	Relaxed: '#f66d9b',
	Annoyed: '#e3342f',
	Neutral: '#6d757c',
	Bored: '#4dc0b5',
	Sad: '#3490dc',
	Happy: '#ffed4a',
	Nervous: '#15605e'
};

export const moodLabels = [
	'Sad',
	'Annoyed',
	'Nervous',
	'Bored',
	'Neutral',
	'Calm',
	'Relaxed',
	'Happy',
	'Excited'
];

export const moodScores = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

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

export const reasonLabels = [
	'Family',
	'School',
	'Social Life',
	'Financial Situation',
	'Health',
	'Unwilling to specify'
];

export const reasonScores = [1, 2, 3, 4, 5, 6];

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
