import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

    const openLogout = () => {
        cleanup();
        setOpenLogoutDialog(true);
    };

    const handleLogout = () => {
        setOpenLogoutDialog(false);
        router.flushAll();
        router.post('/logout');
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
                    onClick={openLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Logout
                </button>
            </DropdownMenuItem>

            <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Logout</DialogTitle>
                        <DialogDescription>
                            Anda yakin ingin keluar dari sesi saat ini?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenLogoutDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Ya, Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
