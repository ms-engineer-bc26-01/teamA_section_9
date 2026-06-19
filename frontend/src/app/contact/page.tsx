"use client";

import { AppShell } from "@/components/layout/AppShell";

const CONTACT_EMAIL = "support@example.com";

export default function ContactPage() {
  const mailSubject = encodeURIComponent("SkinMateへのお問い合わせ");
  const mailBody = encodeURIComponent(
    [
      "お問い合わせ内容をご記入ください。",
      "",
      "【お問い合わせ種別】",
      "例：不具合報告 / ご意見・ご要望 / 退会希望 / その他",
      "",
      "【内容】",
      "",
    ].join("\n"),
  );

  return (
    <AppShell title="お問い合わせ">
      <section className="space-y-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl">
            ✉️
          </div>

          <h2 className="mt-4 text-center text-base font-bold text-gray-800">
            お問い合わせ
          </h2>

          <p className="mt-3 text-xs leading-6 text-gray-500">
            ご意見・不具合報告・退会に関するご相談は、以下のメールアドレスまでご連絡ください。
          </p>

          <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400">
              お問い合わせ先
            </p>

            <p className="mt-1 break-all text-xs font-bold text-gray-700">
              {CONTACT_EMAIL}
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-rose-500 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600"
          >
            メールを送る
          </a>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
          <p className="text-xs font-bold text-rose-500">退会をご希望の場合</p>

          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            現時点ではアプリ内の退会機能は未実装です。退会をご希望の場合も、お問い合わせ先までご連絡ください。
          </p>
        </div>
      </section>
    </AppShell>
  );
}
