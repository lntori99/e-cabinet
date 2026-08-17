"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder: string;
  className: string;
  autoFocus?: boolean;
}

/**
 * Showing the password needs client state, which a server component can't
 * hold. Styling stays in `page.tsx` and arrives as `className`. Each field
 * toggles on its own, so the new password can be revealed while the
 * confirmation stays masked.
 */
export default function PasswordField({
  name,
  label,
  placeholder,
  className,
  autoFocus,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <input
        type={visible ? "text" : "password"}
        name={name}
        id={name}
        required
        autoFocus={autoFocus}
        autoComplete="new-password"
        placeholder={placeholder}
        className={`${className} pr-12`}
      />
      {/* Sits in the field's right corner; the input's pr-12 keeps text clear of it */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-gray-500 transition hover:text-gray-900 focus:outline-none focus-visible:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}
