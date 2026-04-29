"use client";

type MiaAvatarProps = {
    size?: number;
    className?: string;
    imageClassName?: string;
    alt?: string;
};

export default function MiaAvatar({
    size = 40,
    className = "",
    imageClassName = "",
    alt = "MIA avatar",
}: MiaAvatarProps) {
    return (
        <div
            className={`overflow-hidden rounded-full border border-indigo-100 bg-white shadow-sm ${className}`.trim()}
            style={{ width: size, height: size }}
        >
            <img
                src="/mia-avatar.jpeg"
                alt={alt}
                className={`h-full w-full object-cover ${imageClassName}`.trim()}
            />
        </div>
    );
}
