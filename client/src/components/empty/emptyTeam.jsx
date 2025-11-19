
import { Button } from "../ui/button";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Building,
  Award,
} from "lucide-react";

export const EmptyTeam = ()=>
    {
        return(
            <div className="text-center py-16 px-6">
      <div className="mx-auto mt-10 rounded-2xl flex items-center justify-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Build Your Dream Team</h2>
      <p className="text-gray-600 md:text-lg text-sm mb-10 max-w-lg mx-auto text-lg">
        Create teams, invite collaborators, and manage permissions all in one place. Start building stronger connections today.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8">
          <Users className="w-5 h-5 mr-2" />
          Create Your First Team
        </Button>
        <Button variant="outline" size="lg" className="px-8">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Members
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:mx-36 mx-10 ">
        <div className="text-center bg-white rounded-lg px-12 w-fit py-5">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Organize by Department</h3>
          <p className="text-gray-600 text-sm">Group team members by department, project, or any custom structure that works for you.</p>
        </div>
        
        <div className="text-center bg-white rounded-lg px-12 w-fit py-5">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Control Permissions</h3>
          <p className="text-gray-600 text-sm">Set fine-grained permissions for each team member to control access to features and data.</p>
        </div>
        
        <div className="text-center bg-white rounded-lg px-12 w-fit py-5">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Track Performance</h3>
          <p className="text-gray-600 text-sm">Monitor team activity, engagement, and contribution to your feedback management goals.</p>
        </div>
      </div>
    </div>
  );
        
    }
