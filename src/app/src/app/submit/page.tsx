import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-32 px-6 md:px-24 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <SubmitForm />
      </div>
    </main>
  );
}
