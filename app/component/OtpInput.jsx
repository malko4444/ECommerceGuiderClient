import React, { useRef } from "react";

function OtpInput({ otp, setOtp }) {
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (/^[0-9]$/.test(value)) {
      const newOtp = otp.split("");
      newOtp[index] = value;
      setOtp(newOtp.join(""));

      // Move to next input if available
      if (index < 5) {
        inputs.current[index + 1].focus();
      }
    } else if (value === "") {
      // clear digit
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center gap-3 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength="1"
          value={otp[i] || ""}
          ref={(el) => (inputs.current[i] = el)}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-400 outline-none transition"
        />
      ))}
    </div>
  );
}

export default OtpInput;
