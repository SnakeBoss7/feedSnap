import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {  Eye, EyeOff, LucideInfo } from "lucide-react";
import { Background } from "../../components/background/background";
import RoundLoader from "../../components/loader/roundLoader";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import googlesign from "../../img/google.png";
const apiUrl = process.env.REACT_APP_API_URL;

export const Login = () => {
  const [email, setEmail] = useState("");
  const [mess,setMess] = useState(null);
  const [isloading,setIsloading] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      setIsloading(2);
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      let res = await axios.post(
        `${apiUrl}/api/auth/firebase`,
        { idToken: token },
        {
          withCredentials: true,
        }
      );
      localStorage.clear();
      localStorage.setItem("UserData", JSON.stringify(res.data.userData));
      navigate("/dashboard");
    } catch (err) {
      console.log("login failed", err);
    }
    finally
    {
      setIsloading(false);
    }
  };
const handleLogIn = async (e) => {
            e.preventDefault();
            setIsloading(1);
            console.log('wake up')
            try {
              console.log('1st of the mont')
              let res = await axios.post(
        `${apiUrl}/api/auth/logIn`,
        {email,password},
        { withCredentials: true }
      );
      localStorage.clear();
      localStorage.setItem("UserData", JSON.stringify(res.data.userData));
      navigate("/dashboard");
    } catch (err) {
        console.log("login failed", err);
        setMess(err.response?.data?.mess);
    }finally
    {
      setIsloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      {/* BACKGROUND */}
      <Background color={"#c5b5ff"}/>
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
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e)=>handleLogIn(e)} className="space-y-4">
              <div className="space-y-2  flex flex-col ">
                <label className="text-sm" htmlFor="email">
                  Email
                </label>
                <input 

                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="p-2 rounded-lg focus:border-purple-500  focus:outline-none border border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm" htmlFor="password">
                  Password
                </label>
                <div className="relative flex flex-col">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-2 rounded-lg focus:border-purple-500  focus:outline-none border  border-blue-200"
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
                  {mess ?<div className="text-red-500 text-sm flex gap-1 items-center"><LucideInfo size={13}/>{mess}</div>:<div className="h-[20px] m-0"></div>}
              </div>
              <div className="flex items-center justify-between">
                <button
                  disabled={true}
                  className="text-sm text-purple-600 hover:text-purple-700 cursor-not-allowed  disabled:cursor-not-allowed"
                >
                  Forgot password?{" "}
                  <span className="text-[12px]">(Under construction)</span>
                </button>
              </div>
              <Button
              
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isloading === 1 ? <RoundLoader/> : 
                "Sign In"
              }
              </Button>
              </form>
              <Button
                className="bg-white mt-2 hover:bg-white w-full  border  border-gray-300 shadow-sm"
                onClick={handleGoogleLogin}
              >
                   {isloading === 2 ? <RoundLoader/> : 
                <img
                  src={googlesign}
                  className="h-[30px] w-[30px] bg-transparent"
                  alt=""
                />
              }
              </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signIn"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
