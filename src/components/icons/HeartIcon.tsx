import clsx from "clsx";

export type HeartIconProps = {
  filled?: boolean;
  className?: string;
};

export const HeartIcon = ({ filled = false, className }: HeartIconProps) => (
  <svg
    aria-hidden="true"
    className={clsx("h-5 w-5", className)}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.6}
    viewBox="0 0 24 24"
  >
    <path
      d="M12 21s-6.6-4.35-9-8.23C1 9.67 2.12 5 6.3 5c2.44 0 3.7 1.73 3.7 1.73S11.26 5 13.7 5C17.88 5 19 9.67 21 12.77 18.6 16.65 12 21 12 21Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
