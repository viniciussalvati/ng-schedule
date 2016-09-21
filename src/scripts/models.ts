namespace ngSchedule.models {
	/**
	 * Days of the week.
	 * Goes from Sunday (0) to Saturday (6)
	 * This was based from .NET's DayOfWeek enum.
	 */
	export enum DayOfWeek {
		Sunday = 0,
		Monday = 1,
		Tuesday = 2,
		Wednesday = 3,
		Thursday = 4,
		Friday = 5,
		Saturday = 6
	}

	export interface AdScheduleViewModel {
		day: DayOfWeek;
		hours: number[];
	}
}