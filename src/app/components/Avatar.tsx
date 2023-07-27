import React from 'react';

const Avatar: React.FC<{
  src?: string;
  alt?: string;
}> = ({ src, alt }) => {
  const getBase64FromInitials = (initials: string) => {
    // Create SVG from initials
    const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#aaa"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40" fill="white">${initials}</text>
  </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return (
    <img
      className="inline-block h-6 w-6 rounded-full text-blue-100"
      src={src ?? getBase64FromInitials(alt?.slice(0, 2) ?? '??')}
      alt={alt}
      onError={({ currentTarget }) => {
        // eslint-disable-next-line no-param-reassign
        currentTarget.src = getBase64FromInitials(alt?.slice(0, 2) ?? '??');
        // eslint-disable-next-line no-param-reassign
        currentTarget.onerror = null;
      }}
    />
  );
};

export default Avatar;
