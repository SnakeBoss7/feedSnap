import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Eye, EyeOff, LucideInfo } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import googlesign from "../../img/google.png";
import RoundLoader from "../../components/loader/roundLoader";
import { motion } from "framer-motion";

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
      setMess(err.response?.data?.mess);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(2);
    try {
      let res = await axios.post(`${apiUrl}/api/auth/signIn`, formData, {
        withCredentials: true,
      });
      localStorage.clear();
      localStorage.setItem("UserData", JSON.stringify(res.data.userData));
      navigate("/dashboard");
    } catch (err) {
      setMess(err.response?.data?.mess);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md  relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="text-2xl font-bold tracking-tighter">
              <span className="text-gray-900 dark:text-white">Feed</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">SNAP</span>
            </div>
          </Link>
        </div>

        <Card className="border-2  border-gray-300 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-2 space-y-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Start collecting feedback in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSignIn(e)} className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label
                  className={`text-xs font-medium ${mess ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}
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
                  className={`p-2 rounded-xl bg-gray-50 dark:bg-white/5 border focus:ring-2 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 ${mess
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                />
                {mess && (
                  <span className="text-xs flex items-center gap-1 text-red-500 mt-1">
                    <LucideInfo size={12} />
                    {mess}
                  </span>
                )}
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="w-full p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 pr-10"
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
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading === 2}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                {loading === 2 ? <RoundLoader /> : "Create Account"}
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
              disabled={loading === 1}
              onClick={handleGoogleLogin}
            >
              {loading === 1 ? (
                <RoundLoader />
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={googlesign}
                    className="w-5 h-5"
                    alt="Google"
                  />
                  <span>Sign up with Google</span>
                </div>
              )}
            </Button>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
