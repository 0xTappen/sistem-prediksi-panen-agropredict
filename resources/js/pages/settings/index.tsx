import { Head, useForm } from '@inertiajs/react';
import FormSection from '@/components/form-section';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UserSetting } from '@/types';

export default function AppSettings({ setting }: { setting: UserSetting }) {
    const { data, setData, put, processing, errors } = useForm({
        theme: setting.theme,
        notification_enabled: setting.notification_enabled,
        temperature_unit: setting.temperature_unit,
        rainfall_unit: setting.rainfall_unit,
        yield_unit: setting.yield_unit,
        backup_enabled: setting.backup_enabled,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings');
    };

    return (
        <>
            <Head title="Pengaturan Aplikasi" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan Aplikasi"
                    description="Kelola tema, notifikasi, satuan, dan preferensi backup data."
                />

                <form className="space-y-4" onSubmit={submit}>
                    <FormSection
                        title="Preferensi Tampilan"
                        description="Pilih mode tampilan aplikasi sesuai preferensi Anda."
                    >
                        <div className="grid gap-2">
                            <Label>Tema</Label>
                            <Select
                                value={data.theme}
                                onValueChange={(value) =>
                                    setData('theme', value as 'light' | 'dark' | 'system')
                                }
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Pilih tema" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.theme} />
                        </div>
                    </FormSection>

                    <FormSection title="Satuan Data" description="Standar satuan yang digunakan dalam aplikasi.">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label>Satuan Suhu</Label>
                                <Select
                                    value={data.temperature_unit}
                                    onValueChange={(value) =>
                                        setData('temperature_unit', value as 'celsius')
                                    }
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="celsius">Celsius</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.temperature_unit} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Satuan Curah Hujan</Label>
                                <Select
                                    value={data.rainfall_unit}
                                    onValueChange={(value) =>
                                        setData('rainfall_unit', value as 'mm')
                                    }
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mm">mm</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.rainfall_unit} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Satuan Hasil</Label>
                                <Select
                                    value={data.yield_unit}
                                    onValueChange={(value) => setData('yield_unit', value as 'ton')}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ton">ton</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.yield_unit} />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Notifikasi & Backup" description="Pengaturan operasional akun pengguna.">
                        <div className="space-y-3">
                            <SwitchRow
                                id="notification_enabled"
                                label="Notifikasi aktif"
                                description="Tampilkan pemberitahuan proses dan hasil prediksi."
                                checked={data.notification_enabled}
                                onCheckedChange={(checked) =>
                                    setData('notification_enabled', checked)
                                }
                            />

                            <SwitchRow
                                id="backup_enabled"
                                label="Backup data"
                                description="Aktifkan pencadangan data berkala."
                                checked={data.backup_enabled}
                                onCheckedChange={(checked) =>
                                    setData('backup_enabled', checked)
                                }
                            />
                        </div>
                    </FormSection>

                    <Button disabled={processing} type="submit">
                        Simpan Pengaturan
                    </Button>
                </form>
            </div>
        </>
    );
}

function SwitchRow({
    id,
    label,
    description,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3">
            <div>
                <Label htmlFor={id}>{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={(value) => onCheckedChange(value === true)}
            />
        </div>
    );
}

AppSettings.layout = {
    breadcrumbs: [{ title: 'Pengaturan Aplikasi', href: '/settings' }],
};
