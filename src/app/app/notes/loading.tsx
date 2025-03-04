import React from 'react';

export default function NotesLoading() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            </div>
            
            {/* Loading notes placeholders */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
                    <div className="flex gap-2 mt-3">
                        <div className="h-5 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}