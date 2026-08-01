import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { Fragment, PropsWithChildren } from 'react';

export default function Dropdown({ children }: PropsWithChildren) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            {children}
        </Menu>
    );
}

function DropdownTrigger({
    children,
    className = '',
}: PropsWithChildren<{ className?: string }>) {
    // Render the trigger as a real <button> so aria-expanded/aria-haspopup
    // live on the focusable element itself, not a wrapping div.
    return (
        <MenuButton as="button" type="button" className={`inline-flex w-full ${className}`}>
            {children}
        </MenuButton>
    );
}

function DropdownContent({ align = 'right', children }: PropsWithChildren<{ align?: 'left' | 'right' }>) {
    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <MenuItems
                className={`absolute z-50 mt-2 w-48 origin-top rounded-card p-1.5 shadow-2xl focus:outline-none ${
                    align === 'left' ? 'start-0' : 'end-0'
                } liquid-glass-strong`}
            >
                {children}
            </MenuItems>
        </Transition>
    );
}

function DropdownLink({
    href,
    method = 'get',
    as = 'a',
    children,
}: PropsWithChildren<{ href: string; method?: 'get' | 'post' | 'put' | 'patch' | 'delete'; as?: 'a' | 'button' }>) {
    return (
        <MenuItem>
            {({ active }) =>
                as === 'button' ? (
                    <Link
                        href={href}
                        method={method}
                        as="button"
                        className={`block w-full rounded-full px-4 py-2 text-start text-sm transition-colors ${
                            active ? 'bg-white/[0.07] text-white' : 'text-white/70'
                        }`}
                    >
                        {children}
                    </Link>
                ) : (
                    <Link
                        href={href}
                        method={method}
                        className={`block rounded-full px-4 py-2 text-start text-sm transition-colors ${
                            active ? 'bg-white/[0.07] text-white' : 'text-white/70'
                        }`}
                    >
                        {children}
                    </Link>
                )
            }
        </MenuItem>
    );
}

function DropdownButton({ children }: PropsWithChildren) {
    return (
        <MenuItem>
            {({ active }) => (
                <button
                    type="button"
                    className={`block w-full rounded-full px-4 py-2 text-start text-sm transition-colors ${
                        active ? 'bg-white/[0.07] text-white' : 'text-white/70'
                    }`}
                >
                    {children}
                </button>
            )}
        </MenuItem>
    );
}

Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Link = DropdownLink;
Dropdown.Button = DropdownButton;
