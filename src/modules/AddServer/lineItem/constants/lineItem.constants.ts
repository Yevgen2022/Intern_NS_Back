export const SIZE_OPTIONS = [
    { id: "300x250", label: "300×250" },
    { id: "320x50",  label: "320×50"  },
    { id: "728x90",  label: "728×90"  },
    { id: "160x600", label: "160×600" },
] as const;

export const GEO_OPTIONS = [
    { code: "US", label: "United States" },
    { code: "UA", label: "Ukraine" },
    { code: "DE", label: "Germany" },
] as const;

export const AD_TYPES = [
    { id: "banner", label: "Banner" },
    { id: "video",  label: "Video"  },
] as const;

export const FREQ_INTERVALS = [
    { id: "hour", label: "per hour" },
    { id: "day",  label: "per day"  },
    { id: "week", label: "per week" },
] as const;

export const CREATIVE_ACCEPT = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
] as const;
