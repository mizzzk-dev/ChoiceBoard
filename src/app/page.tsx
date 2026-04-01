import { UrlInputForm } from "@/components/url-input-form";

export default function HomePage() {
  return (
    <main>
      <h1>ChoiceBoard</h1>
      <p>AIチャットではなく、比較して選ぶための料金比較ツールです。</p>
      <UrlInputForm />
    </main>
  );
}
