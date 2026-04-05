"use client"

import { ScrollArea, ScrollBar } from "../ui/scroll-area";


export default function classList() {
	return (
        <div>
            <div>
                <p className="text-xl text-center">My Classes</p>
                <p className="text-xs text-center text-gray-500">Showing: <span>Full 2026</span></p>
            </div>
            <ScrollArea className="h-64 w-full">
                <div >
                    <div className="mt-2 p-3 border-l-6 rounded-l-lg border-blue-500">
                        <p className="text-base">CIT344-21</p>
                        <p className="text-sm text-gray-600">Operating Systems Concepts 1</p>
                        <p className="text-xs text-gray-600">TR 2:00 PM - 3:15 PM</p>
                        <p className="text-xs text-gray-600">ATHS: E245</p> 
                    </div>
                    <div className="mt-2 p-3 border-l-6 rounded-l-lg border-blue-500">
                        <p className="text-base">CIT344-21</p>
                        <p className="text-sm text-gray-600">Operating Systems Concepts 1</p>
                        <p className="text-xs text-gray-600">TR 2:00 PM - 3:15 PM</p>
                        <p className="text-xs text-gray-600">ATHS: E245</p>
                    </div>
                    <div className="mt-2 p-3 border-l-6 rounded-l-lg border-blue-500">
                        <p className="text-base">CIT344-21</p>
                        <p className="text-sm text-gray-600">Operating Systems Concepts 1</p>
                        <p className="text-xs text-gray-600">TR 2:00 PM - 3:15 PM</p>
                        <p className="text-xs text-gray-600">ATHS: E245</p>
                    </div>
                    <div className="mt-2 p-3 border-l-6 rounded-l-lg border-blue-500">
                        <p className="text-base">CIT344-21</p>
                        <p className="text-sm text-gray-600">Operating Systems Concepts 1</p>
                        <p className="text-xs text-gray-600">TR 2:00 PM - 3:15 PM</p>
                        <p className="text-xs text-gray-600">ATHS: E245</p>
                    </div>
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </div>
    )
}