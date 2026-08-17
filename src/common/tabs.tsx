"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useState } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

type ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: React.ReactNode;
};

interface TabsProps {
  tabs: TabItem[];
  defaultId?: string;
  buttons?: ButtonProps[];
  onTabChange?: (tabId: string) => void;
}

export function Tabs({
  tabs,
  defaultId,
  buttons = [],
  onTabChange,
}: TabsProps) {
  const defaultIndex = Math.max(
    tabs.findIndex((tab) => tab.id === defaultId),
    0,
  );
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  useEffect(() => {
    if (selectedIndex >= tabs.length) {
      setSelectedIndex(Math.max(tabs.length - 1, 0));
    }
  }, [tabs, selectedIndex]);

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    onTabChange?.(tabs[index]?.id);
  };

  return (
    <div className="w-full">
      <TabGroup selectedIndex={selectedIndex} onChange={handleTabChange}>
        {/* --- Tab List --- */}
        <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="w-full sm:w-fit bg-neutral-100 hover:bg-neutral-200 rounded-lg transition p-1 dark:bg-neutral-700 dark:hover:bg-neutral-600 overflow-x-auto scrollbar-hide">
            <TabList as="nav" className="flex gap-x-1 min-w-max sm:min-w-0">
              {tabs.map((tab) => (
                <Tab key={tab.id} as={Fragment}>
                  {({ selected }) => (
                    <button
                      type="button"
                      className={`py-2 px-3 inline-flex items-center gap-x-2 text-sm  font-medium rounded-lg transition-colors outline-none whitespace-nowrap
                        ${
                          selected
                            ? "bg-white text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                            : "bg-transparent text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:text-white"
                        }`}
                    >
                      {tab.label}
                    </button>
                  )}
                </Tab>
              ))}
            </TabList>
          </div>

          {/* --- Buttons --- */}
          {buttons.length > 0 && (
            <div className="hidden sm:inline-flex gap-x-2">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  type={button.type || "button"}
                  onClick={button.onClick}
                  className={`inline-flex items-center gap-x-2 cursor-pointer justify-center rounded-lg px-4 py-1.5 text-sm font-medium ${button.className}`}
                >
                  {button.label} {button.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Mobile Buttons --- */}
        {buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap sm:hidden gap-2 justify-start">
            {buttons.map((button, index) => (
              <button
                key={index}
                type={button.type || "button"}
                onClick={button.onClick}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium ${button.className}`}
              >
                {button.label} {button.icon}
              </button>
            ))}
          </div>
        )}

        {/* --- Tab Panels --- */}
        <TabPanels className="mt-6">
          {tabs.map((tab) => (
            <TabPanel key={tab.id}>
              <div className="text-neutral-500 dark:text-neutral-400">
                {tab.content}
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
