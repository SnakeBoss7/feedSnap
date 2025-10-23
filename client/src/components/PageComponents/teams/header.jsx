import React from 'react';
import { PlusCircle } from 'lucide-react';

export const Header = ({ onCreateTeam }) => (
 <div className="relative header flex flex-col gap-5 sm:flex-row justify-between items-start">
              <div className="heading flex flex-col gap-1 group">
                <h1 className="text-4xl  font-extrabold bg-gradient-to-r tracking-tight from-backgr via-green-700  to-green-900 bg-clip-text text-transparent ">
                  Team Managment 
                </h1>
                <p className="text-md text-gray-700 tracking-tight">
                  Manage and collaborate with your teams
                </p>
              </div>
              <button
                 onClick={onCreateTeam}
                className="flex items-center   px-2 py-3 text-white text-lg tracking-tight gap-2 rounded-lg bg-gradient-to-r from-green-600 via-green-700 to-green-900"
              >
                {" "}
                <PlusCircle size={20}  className='group-hover:rotate-180'/> Create  Team
              </button>
            </div>
);