export default function ClassList() {
	const cols = 7;
	const rows = 85;

    const start = 6; // 6 AM
    const end = 22; // 10 PM

    const formatHour = (hour: number) => {
        const period = hour > 12? "PM" : "AM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:00 ${period}`; 
    }

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

	return (
		<div className="flex flex-row w-full overflow-hidden bg-accent">
			<div className="w-[80px]">
                <div className="h-[100px]">
                </div>
                {
                    Array.from({ length: end - start + 1}).map((_, i) => {
                        const hour = start + i;

                        return (
                            <div key={hour} className="h-25 flex justify-center text-sm">
                                {formatHour(hour)}
                            </div>
                        )

                    })
                }
            </div>
			<div className="flex flex-col flex-1">
				<div className="w-full h-[100px] grid grid-flow-col-7">
                    {days.map((day) => (
                            <div key={day}>
                                {day}
                            </div>
                    ))}
                </div>
                    <div className="grid grid-cols-7 w-full">
                        {Array.from({ length: rows * cols }).map((_, i) => {
                            const col = i % cols;
                            const row = Math.floor(i / cols);
                            
                            return (
                                <div
                                    key={`${col}-${row}`}
                                    className={`${row % 5 === 0? "border-t": ""} border-x h-5 text-xs flex items-center justify-center`}
                                    >
                                        {col},{row}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
	);
}
