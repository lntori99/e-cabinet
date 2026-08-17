"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";


export default function PasswordField({ className }: { className: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        type={visible ? "text" : "password"}
        name="password"
        id="password"
        required
        autoComplete="current-password"
        placeholder="Password (min. 8 characters)"
        className={`${className} pr-12`}
      />
      {/* Sits in the field's right corner; the input's pr-12 keeps text clear of it */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-gray-500 transition hover:text-gray-900 focus:outline-none focus-visible:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}
