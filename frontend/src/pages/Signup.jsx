import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/signup", { name, email, password });
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      void err; 
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Redirect Signup/Login
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500/30 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-300/30 blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-cyan-300/30 to-blue-300/30 blur-[100px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-rose-200/30 to-orange-200/30 blur-[80px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md transform transition-all duration-500 hover:scale-[1.01] relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="flex justify-center items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl font-bold text-white tracking-widest">
                SC
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                Smart Campus
              </span>
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join the campus management platform
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>

          {/* GOOGLE SIGNUP BUTTON */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 transition-all duration-300 active:scale-95"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign up with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">
                Or register with email
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="university@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already a member?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
