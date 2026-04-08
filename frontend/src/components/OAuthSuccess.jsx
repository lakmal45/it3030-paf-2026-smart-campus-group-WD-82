import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // If the user is already set in context, redirect them safely
    if (user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Process the URL parameters only once
    if (hasProcessed.current) return;

    const email = params.get("email");
    const name = params.get("name");
    const role = params.get("role");
    const profileImageUrl = params.get("profileImageUrl");

    if (email && name && role) {
      hasProcessed.current = true;
      login({ email, name, role, profileImageUrl });
      // We navigate immediately after updating the context
      navigate("/dashboard", { replace: true });
    } else {
      console.error("🔴 OAuthSuccess: Missing URL parameters from backend!", {
        email,
        name,
        role,
        profileImageUrl,
      });
      navigate("/login", { replace: true });
    }
  }, [params, login, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg font-semibold text-indigo-600">
          Logging you in with Google...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
