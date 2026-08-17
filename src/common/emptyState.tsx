"use client";

import React from "react";
import { IconType } from "react-icons";

interface EmptyAction {
  label: string;
  onClick: () => void;
  className: string;
}

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actions?: EmptyAction[];
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actions = [],
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-6">
      <div className="mb-4">
        <Icon size={70} className="text-neutral-500" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center max-w-xl mb-6 leading-relaxed">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-4 py-2 text-sm font-medium transition-colors ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
