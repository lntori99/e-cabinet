"use client";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: React.ReactNode;
};
type HeaderProps = {
  title: string;
  buttons?: ButtonProps[];
};

const DataTableHeader = ({ title, buttons = [] }: HeaderProps) => {
  return (
    <div className="w-full  mx-auto">
      <div className="px-6 py-3  rounded-t-2xl flex flex-wrap justify-between items-center border border-neutral-200 dark:border-neutral-700">
        <div>
          <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100 ">
            {title}
          </h2>
        </div>

        <div>
          <div className="inline-flex gap-x-2">
            {buttons.length > 0 && (
              <div className="flex space-x-3">
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
        </div>
      </div>{" "}
    </div>
  );
};

export default DataTableHeader;
