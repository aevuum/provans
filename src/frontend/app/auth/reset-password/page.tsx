"use client";
import dynamic from 'next/dynamic';

const ResetPasswordForm = dynamic(() => import('./ResetPasswordForm.client'), { ssr: false });

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <ResetPasswordForm />
    </div>
  );
}
