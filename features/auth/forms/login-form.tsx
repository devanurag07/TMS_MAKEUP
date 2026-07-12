import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LOGIN_URL } from "@/core/constants/url-constants";
import { TOKEN_KEY } from "@/core/constants/common-constants";
import axiosClient from "@/core/network/axios-client";
import { Toast } from "@/design-system/components/toast/toast";
import { toast } from "react-toastify";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newAccessCode = [...accessCode];
      newAccessCode[index] = value;
      setAccessCode(newAccessCode);

      if (value && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !accessCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const code = accessCode.join("");
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const response = await axiosClient.post(LOGIN_URL, {
        code: code,
        password: password,
      });
      const data = response.data;
      console.log(data.data.access_token);
      console.log("data ", data);
      if (response.status) {
        localStorage.setItem(TOKEN_KEY, data.data.access_token);
        onLogin();
      } else {
        Toast.error("Invalid access code");
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" text-white  flex items-center justify-center h-full w-full">
      <Card className="bg-black border-gray-700 p-8 w-full max-w-[800px]">
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-2xl md:text-5xl font-bold text-center mb-6 text-white">
              Access Code
            </h2>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {accessCode.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={inputRefs[index]}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-2xl sm:text-3xl md:text-4xl text-center bg-black border-white text-white"
                />
              ))}
            </div>
            <div className="password">
              <Input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="text-white text-6xl p-[40px]"
                type="password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 px-6 text-4xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || accessCode.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <svg
                    className="inline-block mr-2 h-6 w-6 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
