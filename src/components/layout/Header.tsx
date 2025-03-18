'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import SearchBar from './SearchBar';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gray-900 border-b border-gray-900">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section with title and search */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold text-accent">NEXUS</div>
              <div className="text-xs text-red-500">Security Platform</div>
            </div>
          </div>
          <div className="w-96">
            <SearchBar />
          </div>
        </div>

        {/* Right section with notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
              <BellIcon className="h-6 w-6" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <div className="mt-4 space-y-4">
                    <div className="text-sm text-gray-500">No new notifications</div>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 text-gray-400 hover:text-gray-500 focus:outline-none">
              <UserCircleIcon className="h-6 w-6" />
              <span className="text-sm font-medium text-gray-700">{session?.user?.name}</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
} 