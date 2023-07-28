import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link, NavLink } from '@remix-run/react';

type BreadcrumbProps = {
  crumbs: { name: string; to: string }[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ crumbs }) => (
  <nav className="flex py-4" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-4">
      <li>
        <div className="flex items-center">
          <Link to="/" className="text-gray-400 hover:text-gray-500">
            <HomeIcon className=" h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </div>
      </li>
      {crumbs.map((crumb) => (
        <li key={crumb.name}>
          <div className="flex items-center">
            <ChevronRightIcon
              className="h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <NavLink
              to={crumb.to}
              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              {crumb.name}
            </NavLink>
          </div>
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
