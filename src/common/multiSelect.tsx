"use client";

import React, { useEffect, useState } from "react";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value?: MultiValue<Option> | SingleValue<Option>;
  onChange: (selected: MultiValue<Option> | SingleValue<Option>) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  isMulti?: boolean;
  onMenuScrollToBottom?: () => void;
}

const SELECT_ALL_VALUE = "__select_all__";

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  isLoading = false,
  className = "",
  isMulti = true,
  onMenuScrollToBottom,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });

    setIsDark(root.classList.contains("dark"));

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ✅ Custom styles
  const selectStyles: StylesConfig<Option, boolean> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#262626" : "#fff",
      color: isDark ? "#ffffff" : "#000000",
      fontSize: "14px",
      borderColor: state.isFocused ? "#22c55e" : isDark ? "#4b5563" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #22c55e" : "none",
      "&:hover": { borderColor: "#22c55e" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#404040" : "#f5f5f5",
      fontSize: "14px",
      color: isDark ? "#e5e7eb" : "#111827",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#22c55e"
        : isFocused
        ? isDark
          ? "#374151"
          : "#f3f4f6"
        : "transparent",
      color: isSelected ? "#fff" : isDark ? "#e5e7eb" : "#111827",
      "&:hover": {
        backgroundColor: isDark ? "#374151" : "#f3f4f6",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#e5e7eb",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#f9fafb" : "#111827",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
      ":hover": {
        backgroundColor: "#ef4444",
        color: "#fff",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f9fafb" : "#111827",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
      "& input": {
        color: isDark ? "#ffffff" : "#000000",
      },
    }),
  };

  const normalizedValue: Option[] = Array.isArray(value)
    ? (value as Option[])
    : value
      ? [value as Option]
      : [];
  const allSelected =
    isMulti &&
    options.length > 0 &&
    normalizedValue.length === options.length &&
    options.every((o) =>
      normalizedValue.some((v) => v.value === o.value),
    );

  const augmentedOptions: Option[] =
    isMulti && options.length > 0
      ? [
          {
            value: SELECT_ALL_VALUE,
            label: allSelected ? "Clear All" : "Select All",
          },
          ...options,
        ]
      : options;

  const handleChange = (
    selected: MultiValue<Option> | SingleValue<Option>,
  ) => {
    if (isMulti && Array.isArray(selected)) {
      const hitSelectAll = selected.some(
        (opt) => opt.value === SELECT_ALL_VALUE,
      );
      if (hitSelectAll) {
        onChange(
          (allSelected ? [] : options) as MultiValue<Option>,
        );
        return;
      }
    }
    onChange(selected);
  };

  return (
    <div className={className}>
      <Select
        isMulti={isMulti}
        options={augmentedOptions}
        value={value}
        onChange={handleChange}
        isLoading={isLoading}
        placeholder={placeholder}
        styles={selectStyles}
        classNamePrefix="select"
        onMenuScrollToBottom={onMenuScrollToBottom}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        hideSelectedOptions={false}
      />
    </div>
  );
};

export default MultiSelect;
