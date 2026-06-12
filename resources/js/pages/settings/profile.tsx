import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit, update } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { User } from '@/types';

type ProfileForm = {
    name: string;
    email: string;
    avatar: File | null;
    remove_avatar: boolean;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props as { auth: { user: User } };
    const getInitials = useInitials();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null,
        remove_avatar: false,
    });

    useEffect(() => {
        return () => {
            if (previewUrl !== null) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const currentAvatar = useMemo(() => {
        if (previewUrl !== null) {
            return previewUrl;
        }

        if (data.remove_avatar) {
            return undefined;
        }

        return auth.user.avatar ?? undefined;
    }, [auth.user.avatar, data.remove_avatar, previewUrl]);

    const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (previewUrl !== null) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        if (file === null) {
            setData('avatar', null);
            return;
        }

        setData('avatar', file);
        setData('remove_avatar', false);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeAvatar = () => {
        if (previewUrl !== null) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setData('avatar', null);
        setData('remove_avatar', true);
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        post(update.form().action, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your name, email, dan logo profil akun."
                />

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-medium text-foreground">Logo / Foto Profil</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Avatar className="h-20 w-20 rounded-2xl border border-border">
                                <AvatarImage src={currentAvatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-2xl bg-muted text-foreground">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-wrap gap-2">
                                <Label htmlFor="avatar-file" className="cursor-pointer">
                                    <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted/40">
                                        <Camera className="h-4 w-4" />
                                        Pilih Gambar
                                    </span>
                                </Label>
                                <Input
                                    id="avatar-file"
                                    type="file"
                                    name="avatar"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={onAvatarChange}
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={removeAvatar}
                                    disabled={processing || (!auth.user.avatar && data.avatar === null)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Logo
                                </Button>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Format: JPG, PNG, WEBP. Ukuran maksimal 2MB.
                        </p>
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            name="name"
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>

                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            name="email"
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div>
                            <p className="-mt-4 text-sm text-muted-foreground">
                                Your email address is unverified.{' '}
                                <Link
                                    href={send()}
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                >
                                    Click here to resend the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600 dark:text-zinc-300">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} data-test="update-profile-button">
                            Simpan Profil
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
