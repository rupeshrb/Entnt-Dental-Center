import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  const testAccounts = [
    { 
      accountId: "1", 
      userType: "Admin", 
      emailAddress: "admin@entnt.in", 
      pwd: "admin123" 
    },
    { 
      accountId: "2", 
      userType: "Patient", 
      emailAddress: "john@entnt.in", 
      pwd: "patient123", 
      patientRef: "p1" 
    }
  ];

  const handleDemoLogin = (selectedAccount) => {
    setUserEmail(selectedAccount.emailAddress);
    setUserPassword(selectedAccount.pwd);
    setLoginError("");
    setDemoModalVisible(false);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setLoginError("");
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      const loginResult = login(userEmail, userPassword, storedUsers);
      
      if (loginResult.success) {
       
        setTimeout(() => {
          const redirectPath = loginResult.role === "Admin" ? "/admin" : "/patient";
          navigate(redirectPath);
        }, 800);
      } else {
        setLoginError("Invalid email or password. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const handleImageError = () => {
    console.log('Company logo failed to load');
    setImgError(true);
  };

  const handleImageLoad = () => {
    console.log('Logo loaded fine');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              {!imgError ? (
                <img 
                  src="/assets/logo.png" 
                  alt="Dental Logo" 
                  className="w-12 h-12 filter invert brightness-0"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center text-white text-xl font-bold">
                  🦷
                </div>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENTNT Dental Center</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 relative">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={submitLogin}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">👤</div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={processing}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔒</div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  disabled={processing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-lg"
                  disabled={processing}
                >
                  {passwordVisible ? "🙈" : "👁️"}
                </button>
              </div>

              <button
                type="submit"
                disabled={processing || !userEmail || !userPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setDemoModalVisible(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm underline hover:no-underline transition-all duration-200"
              disabled={processing}
            >
              🚀 Try Demo Accounts
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure Dental Practice Management System
          </p>
        </div>
      </div>

      {demoModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="text-blue-600 mr-2">✅</span>
                Demo Accounts
              </h3>
              <button
                onClick={() => setDemoModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Choose a demo account to quickly test the system:
            </p>
            
            <div className="space-y-3">
              {testAccounts.map((acc) => (
                <div
                  key={acc.accountId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  onClick={() => handleDemoLogin(acc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          acc.userType === 'Admin' ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                        <span className="font-medium text-gray-800">{acc.userType}</span>
                      </div>
                      <p className="text-sm text-gray-600">{acc.emailAddress}</p>
                      <p className="text-xs text-gray-500">Password: {acc.pwd}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin(acc);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-blue-100 transition-colors duration-200 ml-2"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Click on any account to auto-fill login credentials
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;