import { Link } from '@inertiajs/react';
import { Laptop, LogOut, Moon, Settings, Sun } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { UserInfo } from '@/components/user-info';
import type { Appearance } from '@/hooks/use-appearance';
import type { User } from '@/types';

type Props = {
    user: User;
    onRequestLogout: () => void;
};

const themeOptions: Array<{
    value: Appearance;
    label: string;
    icon: typeof Sun;
}> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
];

export function UserMenuContent({ user, onRequestLogout }: Props) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const handleAppearanceChange = (value: string) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
            updateAppearance(value);
        }
    };

    const handleRequestLogout = () => {
        cleanup();
        onRequestLogout();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="mr-2" />
                        Tema
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                            value={appearance}
                            onValueChange={handleAppearanceChange}
                        >
                            {themeOptions.map((option) => (
                                <DropdownMenuRadioItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    <option.icon className="mr-2" />
                                    {option.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/settings"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Pengaturan
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    className="flex w-full cursor-pointer items-center"
                    onClick={handleRequestLogout}
                    data-test="logout-button"
                    type="button"
                >
                    <LogOut className="mr-2" />
                    Logout
                </button>
            </DropdownMenuItem>
        </>
    );
}
