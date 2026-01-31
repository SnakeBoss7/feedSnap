import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Eye, EyeOff, LucideInfo, } from "lucide-react";
import RoundLoader from "../../components/loader/roundLoader";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import googlesign from "../../img/google.png";
import { useUserContext } from "../../context/userDataContext";
import { motion } from "framer-motion";

const apiUrl = process.env.REACT_APP_API_URL;

export const Login = () => {
  const [email, setEmail] = useState("");
  const [mess, setMess] = useState(null);
  const [isloading, setIsloading] = useState(null);
  const { updateUserData } = useUserContext();
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
      updateUserData(res.data.userData);
      navigate("/dashboard");
    } catch (err) {
      console.log("login failed", err);
    } finally {
      setIsloading(false);
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    setIsloading(1);
    try {
      let res = await axios.post(
        `${apiUrl}/api/auth/logIn`,
        { email, password },
        { withCredentials: true }
      );
      localStorage.clear();
      updateUserData(res.data.userData);
      navigate("/dashboard");
    } catch (err) {
      console.log("login failed", err);
      setMess(err.response?.data?.mess);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  font-sans bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="text-3xl font-bold tracking-tighter">
              <span className="text-gray-900 dark:text-white">Feed</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">SNAP</span>
            </div>
          </Link>
        </div>

        <Card className="border-2 border-gray-300 dark:border-white/10 my-10 mx-4 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-6 space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleLogIn(e)} className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex flex-col">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mess ? (
                  <div className="text-red-500 text-sm flex gap-2 items-center bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-100 dark:border-red-500/20">
                    <LucideInfo size={14} />
                    {mess}
                  </div>
                ) : (
                  <div className="h-[38px]"></div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isloading === 1}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isloading === 1 ? <RoundLoader /> : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full py-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleGoogleLogin}
              disabled={isloading === 2}
            >
              {isloading === 2 ? (
                <RoundLoader />
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={googlesign}
                    className="w-5 h-5"
                    alt="Google"
                  />
                  <span>Sign in with Google</span>
                </div>
              )}
            </Button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
