"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IoEllipsisHorizontal } from "react-icons/io5";

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

interface ActionsDropdownProps {
  actions: ActionItem[];
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 208; // w-52 = 208px
        const viewportWidth = window.innerWidth;

        // Calculate left position, ensuring it doesn't go off-screen
        let left = rect.right - dropdownWidth;
        if (left < 8) {
          left = rect.left; // Align to left edge of button if too close to viewport edge
        }
        if (left + dropdownWidth > viewportWidth - 8) {
          left = viewportWidth - dropdownWidth - 8; // Keep some margin from right edge
        }

        setPosition({
          top: rect.bottom + 8,
          left: left,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // For 1-2 actions, render inline buttons
  if (actions.length <= 1) {
    return (
      <div className="flex space-x-2">
        {actions.map((action, index) =>
          action.href ? (
            <Link
              key={index}
              href={action.href}
              className={`py-2 px-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-xl border border-neutral-200 bg-white text-neutral-700  hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-900 ${
                action.className || ""
              }`}
            >
              {action.icon}
              {action.label}
            </Link>
          ) : (
            <button
              key={index}
              onClick={() => action.onClick?.()}
              className={`py-2 px-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-xl border border-neutral-200 bg-white text-neutral-700  hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-900 ${
                action.className || ""
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ),
        )}
      </div>
    );
  }

  // For 3+ actions, render dropdown
  const dropdownMenu =
    isOpen && typeof window !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-52 rounded-md bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-lg focus:outline-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {actions.map((action, index) =>
                action.href ? (
                  <Link
                    key={index}
                    href={action.href}
                    className={`px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 w-full text-left flex items-center ${
                      action.className || ""
                    }`}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 w-full text-left flex items-center ${
                      action.className || ""
                    }`}
                    role="menuitem"
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </button>
                ),
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative inline-block text-left" data-actions-menu>
      <div>
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <IoEllipsisHorizontal className="h-4 w-4" />
        </button>
      </div>
      {dropdownMenu}
    </div>
  );
};

export default ActionsDropdown;
