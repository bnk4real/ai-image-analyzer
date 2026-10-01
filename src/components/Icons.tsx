import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (paths: ReactNode) =>
    function Icon(props: IconProps) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                width={20}
                height={20}
                {...props}
            >
                {paths}
            </svg>
        );
    };

export const DashboardIcon = icon(
    <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
);

export const RoofIcon = icon(
    <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-5h4v5" />
    </>
);

export const DocumentIcon = icon(
    <>
        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
    </>
);

export const UsersIcon = icon(
    <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0113 0" />
        <path d="M16 4.6a3.5 3.5 0 010 6.8" />
        <path d="M18 14.2a6.5 6.5 0 013.5 5.8" />
    </>
);

export const SettingsIcon = icon(
    <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </>
);

export const LogoutIcon = icon(
    <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </>
);

export const MenuIcon = icon(<path d="M4 6h16M4 12h16M4 18h16" />);

export const CloseIcon = icon(<path d="M6 6l12 12M18 6L6 18" />);

export const UploadIcon = icon(
    <>
        <path d="M12 16V4" />
        <path d="M7 9l5-5 5 5" />
        <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </>
);

export const PlusIcon = icon(<path d="M12 5v14M5 12h14" />);

export const MailIcon = icon(
    <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
    </>
);

export const LockIcon = icon(
    <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
    </>
);

export const AlertIcon = icon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16h.01" />
    </>
);

export const CheckIcon = icon(<path d="M5 12.5l4.5 4.5L19 7.5" />);

export const DownloadIcon = icon(
    <>
        <path d="M12 4v12" />
        <path d="M7 11l5 5 5-5" />
        <path d="M4 20h16" />
    </>
);

export const PrinterIcon = icon(
    <>
        <path d="M7 9V3h10v6" />
        <rect x="3" y="9" width="18" height="8" rx="2" />
        <path d="M7 14h10v7H7z" />
    </>
);

export function Spinner(props: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            width={16}
            height={16}
            {...props}
            className={`animate-spin ${props.className ?? ""}`}
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={3} className="opacity-25" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        </svg>
    );
}

export const SunIcon = icon(
    <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
);

export const MoonIcon = icon(<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />);

export const MonitorIcon = icon(
    <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
    </>
);

export const ChevronRightIcon = icon(<path d="M9 6l6 6-6 6" />);

export const SidebarIcon = icon(
    <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
    </>
);
