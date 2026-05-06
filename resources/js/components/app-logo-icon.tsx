import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/brand/logo.png"
            alt="Logo Sistem Prediksi Panen"
            className={cn('object-contain', props.className)}
        />
    );
}
