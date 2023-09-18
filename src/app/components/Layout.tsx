import { Link, NavLink } from '@remix-run/react';
import clsx from 'clsx';
import { Transition, Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  Cog8ToothIcon,
  EnvelopeIcon,
  RectangleStackIcon,
  UserGroupIcon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import React, { Fragment } from 'react';
import logo from '~/assets/logo.svg';

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const routes = [
    {
      name: 'Events',
      path: '/events',
      icon: EnvelopeIcon,
    },
    {
      name: 'Services',
      path: '/services',
      icon: Cog8ToothIcon,
    },
    {
      name: 'Domains',
      path: '/domains',
      icon: RectangleStackIcon,
    },
    {
      name: 'Owners',
      path: '/owners',
      icon: UserGroupIcon,
    },
    {
      name: 'Visualizer',
      path: '/visualizer',
      icon: EyeIcon,
    },
  ];

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                  <Link className="flex h-16 shrink-0 items-center" to="/">
                    <img className="h-8 w-auto" src={logo} alt="Your.Rentals" />
                  </Link>
                  <nav className="flex flex-1 flex-col">
                    <ul className="-mx-2 flex-1 space-y-1">
                      {routes.map((route) => (
                        <NavLink
                          to={route.path}
                          key={route.path}
                          className={({ isActive }) =>
                            clsx(
                              isActive
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium',
                            )
                          }
                        >
                          <route.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden
                          />
                          {route.name}
                        </NavLink>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
        <Link className="flex h-16 shrink-0 items-center justify-center" to="/">
          <img className="h-8 w-auto" src={logo} alt="Your.Rentals" />
        </Link>
        <nav className="mt-8">
          <ul className="flex flex-col items-center space-y-1">
            {routes.map((route) => (
              <NavLink
                to={route.path}
                key={route.path}
                className={({ isActive }) =>
                  clsx(
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'rounded-md px-3 py-2 text-sm font-medium',
                  )
                }
              >
                <route.icon className="h-6 w-6 shrink-0" aria-hidden />
                <span className="sr-only">{route.name}</span>
              </NavLink>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">
          Your.Rentals
        </div>
      </div>

      <main className="lg:pl-20">
        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
