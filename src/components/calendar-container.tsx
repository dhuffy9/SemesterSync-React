export default function ClassList() {
	const cols = 7;
	const rows = 85;

	return (
		<div className="flex flex-row w-full overflow-hidden">
			<div className="w-[80px]"></div>
			<div className="flex flex-col flex-1 min-w-0">
				<div className="w-full h-[100px]"></div>
				<div className="grid grid-cols-7 w-full  min-w-0">
					{Array.from({ length: rows * cols }).map((_, i) => {
						const col = i % cols;
						const row = Math.floor(i / cols);

						return (
							<div
								key={`${col}-${row}`}
								className="border h-5 text-xs flex items-center justify-center"
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
