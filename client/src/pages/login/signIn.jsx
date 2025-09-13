import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {  Eye, EyeOff,  LucideInfo } from "lucide-react";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import googlesign from "../../img/google.png";
import RoundLoader from "../../components/loader/roundLoader";
const apiUrl = process.env.REACT_APP_API_URL;

export const SignIn = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(0);
  const [mess, setMess] = useState(null);
  const navigate = useNavigate();
  
  const handleInputChange = (field, value) => {
    setMess(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const handleGoogleLogin = async () => {
    try {
      setLoading(1); 
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log("Frontend API URL:", apiUrl);
      console.log(token);

      let res = await axios.post(
        `${apiUrl}/api/auth/firebase`,
        { idToken: token },
        {
          withCredentials: true,
        }
      );
      
      localStorage.setItem('UserData',JSON.stringify(res.data.userData));
      console.log("Login success", res);
      navigate("/dashboard");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("login failed", err);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(2);
    try {
      let res = await axios.post(`${apiUrl}/api/auth/signIn`, formData, {
        withCredentials: true,
      });
      console.log("Login success", res);
      setLoading(false);
      navigate("/dashboard");
      localStorage.setItem('UserData',JSON.stringify(res.data.userData));
    } catch (err) {
      console.log("login failed", err);
      setLoading(false);
      setMess(err.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_1050px_at_50%_200px,#c5b5ff,transparent)] pointer-events-none">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
          {/* <!-- Small screen gradient --> */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_0%_250px,#c5b5ff,transparent)] lg:bg-none"></div>
          {/* <!-- Large screen gradient --> */}
          <div className="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_3000px_at_0%_100px,#c5b5ff,transparent)]"></div>
        </div>
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className=" items-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <div className="justify-center text-4xl font-semibold tracking-tight flex  ">
                <div className="text-black text-4xl text-top">Feed</div>
                <div className="font-mono text-primary bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-5xl text-bottom">
                  SNAP
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Start collecting feedback in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSignIn(e)} className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="p-2 rounded-lg focus:border-purple-500  focus:outline-none border border-blue-200"
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label
                  className={`text-sm ${mess && "text-red-400"}`}
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={`p-2 rounded-lg focus:border-purple-500 focus:bg-white focus:outline-none border ${
                    mess ? "border-red-300" : "border-blue-200"
                  } `}
                />
                {mess ? (
                  <>
                    <span className="text-[11px] flex items-center gap-1 text-red-400">
                      <LucideInfo size={12} color="red" />
                      {mess}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-4"></span>
                  </>
                )}
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    className="p-2 rounded-lg focus:border-purple-500  focus:outline-none border border-blue-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  className="p-2 rounded-lg focus:border-purple-500  focus:outline-none border border-blue-200"
                />
              </div>

              <Button
                type="submit"
                disabled={loading === 2}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
               {loading === 2 ? <RoundLoader/> : 'Create Account'}
              </Button>
            </form>
            <Button
              className="bg-white mt-2 hover:bg-white w-full  border  border-gray-300 shadow-sm"
              disabled={loading === 1}
              onClick={handleGoogleLogin}
            >
              {loading === 1 ? <RoundLoader/> : 
                <img
                  src={googlesign}
                  className="h-[30px] w-[30px] bg-transparent"
                  alt=""
                />
              }
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};