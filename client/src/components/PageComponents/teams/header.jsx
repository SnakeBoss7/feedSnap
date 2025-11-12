import React from 'react';
import AddButton from '../../button/addTeam';

export const Header = ({ onCreateTeam }) => (
 <div className="relative header flex flex-col gap-5 sm:flex-row justify-between items-start">
              <div className="heading flex flex-col gap-1 group">
                <h1 className="text-5xl pb-2 font-extrabold bg-gradient-to-r tracking-tight from-green-400 via-green-500  to-green-600 bg-clip-text text-transparent ">
                  Team Managment 
                </h1>
                <p className="text-md text-gray-700 text-white tracking-tight">
                  Manage and collaborate with your teams
                </p>
              </div>
              <AddButton
                 onCreateTeam={onCreateTeam}
                
              />
             
              
            </div>
);