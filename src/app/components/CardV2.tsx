import React from 'react';
import clsx from 'clsx';

type CardV2Props = {
  title: string;
  description?: string;
  accentColor?: string;
  badges?: { text: string; color?: string; className?: string }[];
  additionalDetails?: ({
    icon: React.ForwardRefExoticComponent<any>;
    iconClassName: string;
    text: string;
  } | null)[];
};

const CardV2: React.FC<CardV2Props> = ({
  accentColor,
  badges,
  title,
  description,
  additionalDetails,
}) => {
  return (
    <div
      className={clsx(
        'flex h-full overflow-hidden rounded-lg bg-white shadow hover:bg-gray-50 hover:shadow-md',
      )}
    >
      {accentColor && (
        <div style={{ backgroundColor: accentColor }} className="w-4"></div>
      )}
      <div className={'flex flex-col justify-around p-4'}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className={'break-all text-lg font-bold'}>{title}</span>
          {badges &&
            badges.map((badge) => (
              <span
                key={badge.text}
                className={clsx(
                  'rounded-full px-2 py-1 text-sm font-light',
                  badge.className,
                )}
                style={{ backgroundColor: badge.color }}
              >
                {badge.text}
              </span>
            ))}
        </div>
        <div className={'py-2 font-light'}>{description}</div>
        <div className={'flex flex-wrap gap-2 pt-2 md:gap-x-4'}>
          {additionalDetails &&
            additionalDetails.map(
              (item) =>
                item && (
                  <span
                    className="inline-flex items-center gap-x-1"
                    key={item.text}
                  >
                    <item.icon
                      className={clsx(
                        'h-4 w-4 text-blue-500',
                        item.iconClassName,
                      )}
                    />
                    <span className={'text-xs font-light'}>{item.text}</span>
                  </span>
                ),
            )}
        </div>
      </div>
    </div>
  );
};

export default CardV2;
