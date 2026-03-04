"use client";

/**
 * Decorative dots grid used on auth pages (signin, signup, forgot-password).
 * Renders dots in top-right, top-left, and bottom-left corners of the parent container.
 */
export default function AuthDotsGrid() {
  const dotFill = "currentColor";
  const dotClassName = "text-primary/30 dark:text-primary/40";

  const topDotsSvg = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1.39737" cy="38.6026" r="1.39737" transform="rotate(-90 1.39737 38.6026)" fill={dotFill} />
      <circle cx="1.39737" cy="1.99122" r="1.39737" transform="rotate(-90 1.39737 1.99122)" fill={dotFill} />
      <circle cx="13.6943" cy="38.6026" r="1.39737" transform="rotate(-90 13.6943 38.6026)" fill={dotFill} />
      <circle cx="13.6943" cy="1.99122" r="1.39737" transform="rotate(-90 13.6943 1.99122)" fill={dotFill} />
      <circle cx="25.9911" cy="38.6026" r="1.39737" transform="rotate(-90 25.9911 38.6026)" fill={dotFill} />
      <circle cx="25.9911" cy="1.99122" r="1.39737" transform="rotate(-90 25.9911 1.99122)" fill={dotFill} />
      <circle cx="38.288" cy="38.6026" r="1.39737" transform="rotate(-90 38.288 38.6026)" fill={dotFill} />
      <circle cx="38.288" cy="1.99122" r="1.39737" transform="rotate(-90 38.288 1.99122)" fill={dotFill} />
      <circle cx="1.39737" cy="26.3057" r="1.39737" transform="rotate(-90 1.39737 26.3057)" fill={dotFill} />
      <circle cx="13.6943" cy="26.3057" r="1.39737" transform="rotate(-90 13.6943 26.3057)" fill={dotFill} />
      <circle cx="25.9911" cy="26.3057" r="1.39737" transform="rotate(-90 25.9911 26.3057)" fill={dotFill} />
      <circle cx="38.288" cy="26.3057" r="1.39737" transform="rotate(-90 38.288 26.3057)" fill={dotFill} />
      <circle cx="1.39737" cy="14.0086" r="1.39737" transform="rotate(-90 1.39737 14.0086)" fill={dotFill} />
      <circle cx="13.6943" cy="14.0086" r="1.39737" transform="rotate(-90 13.6943 14.0086)" fill={dotFill} />
      <circle cx="25.9911" cy="14.0086" r="1.39737" transform="rotate(-90 25.9911 14.0086)" fill={dotFill} />
      <circle cx="38.288" cy="14.0086" r="1.39737" transform="rotate(-90 38.288 14.0086)" fill={dotFill} />
    </svg>
  );

  return (
    <>
      <span className={`absolute left-1 top-1 ${dotClassName}`} aria-hidden>{topDotsSvg}</span>
      <span className={`absolute right-1 top-1 ${dotClassName}`} aria-hidden>{topDotsSvg}</span>
      <span className={`absolute bottom-1 left-1 ${dotClassName}`} aria-hidden>
        <svg
          width="29"
          height="40"
          viewBox="0 0 29 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="2.288" cy="25.9912" r="1.39737" transform="rotate(-90 2.288 25.9912)" fill={dotFill} />
          <circle cx="14.5849" cy="25.9911" r="1.39737" transform="rotate(-90 14.5849 25.9911)" fill={dotFill} />
          <circle cx="26.7216" cy="25.9911" r="1.39737" transform="rotate(-90 26.7216 25.9911)" fill={dotFill} />
          <circle cx="2.288" cy="13.7944" r="1.39737" transform="rotate(-90 2.288 13.7944)" fill={dotFill} />
          <circle cx="14.5849" cy="13.7943" r="1.39737" transform="rotate(-90 14.5849 13.7943)" fill={dotFill} />
          <circle cx="26.7216" cy="13.7943" r="1.39737" transform="rotate(-90 26.7216 13.7943)" fill={dotFill} />
          <circle cx="2.288" cy="38.0087" r="1.39737" transform="rotate(-90 2.288 38.0087)" fill={dotFill} />
          <circle cx="2.288" cy="1.89139" r="1.39737" transform="rotate(-90 2.288 1.89139)" fill={dotFill} />
          <circle cx="14.5849" cy="38.0089" r="1.39737" transform="rotate(-90 14.5849 38.0089)" fill={dotFill} />
          <circle cx="26.7216" cy="38.0089" r="1.39737" transform="rotate(-90 26.7216 38.0089)" fill={dotFill} />
          <circle cx="14.5849" cy="1.89139" r="1.39737" transform="rotate(-90 14.5849 1.89139)" fill={dotFill} />
          <circle cx="26.7216" cy="1.89139" r="1.39737" transform="rotate(-90 26.7216 1.89139)" fill={dotFill} />
        </svg>
      </span>
    </>
  );
}
