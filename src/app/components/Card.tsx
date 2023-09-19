import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const Card: React.FC<
  React.PropsWithChildren<{ title?: React.ReactNode; defaultOpen?: boolean }>
> = ({ title, children, defaultOpen = true }) => {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      <div className="rounded-md bg-white shadow">
        {title && (
          <Disclosure.Button className="flex w-full items-center justify-between border-b border-gray-200 px-4 pb-4 pt-4 text-left">
            <div className="text-base font-semibold leading-6 text-gray-900">
              {title}
            </div>
            <ChevronRightIcon className="ui-open:rotate-90 h-4 w-4 transform duration-100 ease-in-out" />
          </Disclosure.Button>
        )}
        <Disclosure.Panel className="p-4">{children}</Disclosure.Panel>
      </div>
    </Disclosure>
  );
};

export default Card;
