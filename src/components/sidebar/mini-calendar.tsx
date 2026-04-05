"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";


export default function MiniCalendar () {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
    
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    const today = new Date();

    function changeMonth(direction: number){
        setCurrentDate((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
        })
    }

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate(); // months start at 0
    }
    
      function getFirstDayOfMonth(year: number, month: number) {
        return new Date(year, month, 1).getDay();
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null); 
    }

    for(let i = 1; i <= daysInMonth; i++){
        calendarDays.push(i)    
    }

    return (
        <div className="w-full">
            <div className="flex justify-between pt-2 pb-2">
                <Button onClick={() => changeMonth(-1)} variant={"outline"} size={"icon-sm"}><ChevronLeft/></Button>
                <span>
                    {monthNames[month]} {year} 
                </span>
                <Button onClick={() => changeMonth(1)} variant={"outline"} size={"icon-sm"}><ChevronRight/></Button>
            </div>
            <div className="flex justify-around text-base text-gray-500">
                {weekDays.map((day, index) => (
                    <span key={`${index}_${day}`}>{day}</span>
                ))}
            </div>
            <div className="grid grid-cols-7  text-center">
                {
                    calendarDays.map((day, index) => {
                        const isSelected =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();

                        return (
                            <span key={`${index}_${day}`} className={`p-2 text-sm rounded-full ${isSelected ? "bg-blue-500 text-white" : ""}`}>{day}</span>
                        )
                    })
                }
            </div>
        </div>

    )
}